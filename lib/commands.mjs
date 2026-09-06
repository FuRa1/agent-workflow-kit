import fs from 'node:fs';
import path from 'node:path';
import { bundle, load, readOptional, safePath, hash } from './files.mjs';
import { install } from './install.mjs';
import { analyse, validateConfig } from './project.mjs';

const help = `workflow-kit (experimental, Node 22+)\n
  init quick-mvp|enterprise [--host codex|claude|both] [--apply]
  add <skill> [--apply]
  update [--dry-run|--apply]
  doctor [--json]
  list [--json]
  workflow <name> [--json]

All commands accept --project <existing-directory>.
Writes require --apply. No shell commands, hooks or agent jobs are executed.`;

function parse(argv) {
  const options = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (['--project', '--host'].includes(arg)) {
      if (!argv[i + 1] || argv[i + 1].startsWith('--')) throw new Error(`Missing value: ${arg}`);
      options[arg.slice(2)] = argv[++i];
    } else if (['--apply', '--dry-run', '--json'].includes(arg)) {
      options[arg.slice(2)] = true;
    } else if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`);
    else positional.push(arg);
  }
  if (options.apply && options['dry-run']) throw new Error('--apply conflicts with --dry-run');
  if (options.host && !['codex', 'claude', 'both'].includes(options.host)) throw new Error('Unknown host');
  const root = fs.realpathSync(options.project ?? process.cwd());
  if (!fs.statSync(root).isDirectory()) throw new Error('Project must be a directory');
  return { options, positional, root };
}

function doctor(root) {
  const errors = [];
  const warnings = analyse(root).warnings;
  const config = readOptional(root, '.workflow-kit/project.json');
  if (!config) return { ok: false, errors: ['Project is not initialized'], warnings };
  validateConfig(config);
  const available = analyse(root).detectedScripts;
  for (const name of config.verifyScripts) {
    if (!available.includes(name)) errors.push(`Missing package script: ${name}`);
  }
  if (!config.verifyScripts.length) warnings.push('No quality scripts configured');
  if (!config.packageManager) warnings.push('Package manager needs configuration');
  const lock = readOptional(root, '.workflow-kit/lock.json');
  if (!lock || lock.schemaVersion !== 1 || !lock.files) errors.push('Missing or invalid managed lock');
  for (const [relative, expected] of Object.entries(lock?.files ?? {})) {
    const file = safePath(root, relative);
    if (!fs.existsSync(file)) errors.push(`Missing managed file: ${relative}`);
    else if (hash(fs.readFileSync(file)) !== expected) errors.push(`Modified managed file: ${relative}`);
  }
  const adapter = readOptional(root, 'design-polish.project.json');
  if (config.skills.includes('design-polish') && !adapter?.defaultReference) {
    warnings.push('Design reference/capture adapter needs project-specific configuration');
  }
  return { ok: errors.length === 0, errors, warnings };
}

export function execute(argv) {
  if (!argv.length || argv[0] === '--help') return { code: 0, output: help };
  if (argv[0] === '--version') return { code: 0, output: load(path.join(bundle, 'package.json')).version };
  const { options, positional, root } = parse(argv);
  const [command, value] = positional;
  const withValue = ['init', 'add', 'workflow'];
  if (!['init', 'add', 'update', 'doctor', 'list', 'workflow'].includes(command)) throw new Error('Unknown command');
  if (positional.length !== (withValue.includes(command) ? 2 : 1)) throw new Error('Invalid command arguments');
  if (!['init', 'add', 'update'].includes(command) && (options.apply || options['dry-run'] || options.host)) {
    throw new Error('Mutation options are not accepted by read-only commands');
  }
  let result;
  if (['init', 'add', 'update'].includes(command)) result = install(root, command, value, options);
  if (command === 'doctor') result = doctor(root);
  if (command === 'list') result = load(path.join(bundle, 'catalog.json'));
  if (command === 'workflow') {
    if (!/^[a-z][a-z0-9-]*$/.test(value)) throw new Error('Invalid workflow');
    result = load(path.join(bundle, 'workflows', value + '.json'));
  }
  return { code: result.ok === false ? 1 : 0, output: JSON.stringify(result, null, 2) };
}
