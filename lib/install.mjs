import fs from 'node:fs';
import path from 'node:path';
import { bundle, load, json, hash, skillFiles, readOptional, safePath, filePlan, applyPlan } from './files.mjs';
import { preset, configFor, validateConfig } from './project.mjs';
import { validateLock } from './validation.mjs';

function existingLock(root) {
  const lock = readOptional(root, '.workflow-kit/lock.json');
  if (lock !== null) validateLock(root, lock);
  return lock;
}

export function desiredFiles(root, config) {
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

function writeInstallation(root, desired, entries) {
  const guard = safePath(root, '.workflow-kit/install.guard');
  fs.mkdirSync(path.dirname(guard), { recursive: true });
  const handle = fs.openSync(guard, 'wx');
  let retainGuard = false;
  try {
    fs.writeFileSync(handle, json({ pid: process.pid, startedAt: new Date().toISOString() }));
    applyPlan(root, desired, entries);
  } catch (error) {
    retainGuard = error.rollbackIncomplete === true;
    throw error;
  } finally {
    fs.closeSync(handle);
    if (!retainGuard) fs.unlinkSync(guard);
  }
}

export function install(root, command, value, options) {
  const stored = readOptional(root, '.workflow-kit/project.json');
  if (command !== 'init' && !stored && command !== 'add') throw new Error('Run init before add/update');
  if (stored && command === 'init' && stored.preset !== value) {
    throw new Error('Preset migration is not supported; review project.json manually');
  }
  if (stored && options.host && options.host !== stored.host) throw new Error('Host migration is not supported');
  let config = validateConfig(stored ?? (command === 'add' ? configFor(root, 'quick-mvp', 'codex') : configFor(root, value, options.host ?? 'codex')));
  if (command === 'add') {
    skillFiles(value);
    config = { ...config, skills: [...new Set([...config.skills, value])] };
  }
  const lock = existingLock(root);
  const lockRelative = '.workflow-kit/lock.json';
  const lockBefore = lock === null ? null : fs.readFileSync(safePath(root, lockRelative));
  const desired = desiredFiles(root, config);
  const configPath = '.workflow-kit/project.json';
  const baseLock = { files: { ...(lock?.files ?? {}) } };
  if (stored) {
    const current = fs.readFileSync(safePath(root, configPath));
    baseLock.files[configPath] = hash(current);
    if (command !== 'add') desired[configPath] = current;
  }
  const entries = filePlan(root, desired, baseLock);
  const files = { ...(lock?.files ?? {}) };
  for (const item of entries) {
    if (!['.workflow-kit/project.json', 'design-polish.project.json'].includes(item.path)) files[item.path] = item.after;
  }
  desired[lockRelative] = json({ schemaVersion: 1,
    packageVersion: load(path.join(bundle, 'package.json')).version, files });
  const lockEntry = filePlan(root, { [lockRelative]: desired[lockRelative] },
    { files: { [lockRelative]: lockBefore === null ? null : hash(lockBefore) } })[0];
  if (lockEntry.before !== (lockBefore === null ? null : hash(lockBefore))) throw new Error('Managed lock changed during planning');
  entries.push(lockEntry);
  const conflicts = entries.filter(e => e.status === 'conflict');
  if (conflicts.length) return { ok: false, mode: 'conflict', entries };
  if (options.apply) writeInstallation(root, desired, entries);
  return { ok: true, mode: options.apply ? 'applied' : 'preview', entries };
}
