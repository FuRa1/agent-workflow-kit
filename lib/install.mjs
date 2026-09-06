import fs from 'node:fs';
import path from 'node:path';
import { bundle, load, json, hash, skillFiles, readOptional, safePath, filePlan, applyPlan } from './files.mjs';
import { preset, configFor, validateConfig } from './project.mjs';

function existingLock(root) {
  const lock = readOptional(root, '.workflow-kit/lock.json');
  if (lock && (lock.schemaVersion !== 1 || typeof lock.files !== 'object' || !lock.files)) {
    throw new Error('Invalid managed lock');
  }
  for (const key of Object.keys(lock?.files ?? {})) safePath(root, key);
  return lock;
}

function desiredFiles(root, config) {
  const desired = {};
  const hosts = config.host === 'both' ? ['codex', 'claude'] : [config.host];
  for (const id of config.skills) {
    for (const [relative, content] of Object.entries(skillFiles(id))) {
      for (const host of hosts) {
        const base = host === 'codex' ? '.agents' : '.claude';
        desired[`${base}/skills/${id}/${relative}`] = content;
      }
    }
  }
  desired['.workflow-kit/POLICY.md'] = '# Project workflow policy\n\n' +
    preset(config.preset).policy.map(line => '- ' + line).join('\n') + '\n';
  desired['.workflow-kit/.gitignore'] = 'install.guard\n';
  desired['.workflow-kit/project.json'] = json(config);
  if (config.skills.includes('design-polish') && !readOptional(root, 'design-polish.project.json')) {
    const adapter = load(path.join(bundle, 'skills/design-polish/assets/project.example.json'));
    adapter.projectId = path.basename(root);
    adapter.commands.verify = config.packageManager ?
      config.verifyScripts.map(s => `${config.packageManager} run ${s}`) : [];
    desired['design-polish.project.json'] = json(adapter);
  }
  return desired;
}

function writeInstallation(root, desired, entries, lock) {
  const guard = safePath(root, '.workflow-kit/install.guard');
  fs.mkdirSync(path.dirname(guard), { recursive: true });
  const handle = fs.openSync(guard, 'wx');
  try {
    fs.writeFileSync(handle, json({ pid: process.pid, startedAt: new Date().toISOString() }));
    const files = { ...(lock?.files ?? {}) };
    for (const item of entries) {
      if (!['.workflow-kit/project.json', 'design-polish.project.json'].includes(item.path)) {
        files[item.path] = item.after;
      }
    }
    const version = load(path.join(bundle, 'package.json')).version;
    const next = json({ schemaVersion: 1, packageVersion: version, files });
    applyPlan(root, desired, entries);
    const lockPath = safePath(root, '.workflow-kit/lock.json');
    if (!fs.existsSync(lockPath) || hash(fs.readFileSync(lockPath)) !== hash(next)) {
      fs.writeFileSync(lockPath, next);
    }
  } finally {
    fs.closeSync(handle);
    fs.unlinkSync(guard);
  }
}

export function install(root, command, value, options) {
  const stored = readOptional(root, '.workflow-kit/project.json');
  if (command !== 'init' && !stored) throw new Error('Run init before add/update');
  if (stored && command === 'init' && stored.preset !== value) {
    throw new Error('Preset migration is not supported; review project.json manually');
  }
  if (stored && options.host && options.host !== stored.host) throw new Error('Host migration is not supported');
  let config = validateConfig(stored ?? configFor(root, value, options.host ?? 'codex'));
  if (command === 'add') {
    skillFiles(value);
    config = { ...config, skills: [...new Set([...config.skills, value])] };
  }
  const lock = existingLock(root);
  const desired = desiredFiles(root, config);
  const configPath = '.workflow-kit/project.json';
  const baseLock = { files: { ...(lock?.files ?? {}) } };
  if (stored) {
    const current = fs.readFileSync(safePath(root, configPath));
    baseLock.files[configPath] = hash(current);
    if (command !== 'add') desired[configPath] = current;
  }
  const entries = filePlan(root, desired, baseLock);
  const conflicts = entries.filter(e => e.status === 'conflict');
  if (conflicts.length) return { ok: false, mode: 'conflict', entries };
  if (options.apply) writeInstallation(root, desired, entries, lock);
  return { ok: true, mode: options.apply ? 'applied' : 'preview', entries };
}
