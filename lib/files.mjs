import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const bundle = fileURLToPath(new URL('../', import.meta.url));
export const json = value => JSON.stringify(value, null, 2) + '\n';
export const hash = content => createHash('sha256').update(content).digest('hex');
export const load = file => JSON.parse(fs.readFileSync(file, 'utf8'));

export function safePath(root, relative) {
  if (!relative || relative.includes('\\') || path.isAbsolute(relative) ||
      relative.split('/').some(p => p === '..' || p === '.' || p === '')) {
    throw new Error(`Unsafe relative path: ${relative}`);
  }
  const target = path.resolve(root, relative);
  if (!target.startsWith(root + path.sep)) throw new Error('Path escapes project');
  let current = root;
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    try {
      if (fs.lstatSync(current).isSymbolicLink()) throw new Error(`Symlink refused: ${current}`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return target;
}

export function readOptional(root, relative) {
  const file = safePath(root, relative);
  return fs.existsSync(file) ? load(file) : null;
}

export function skillFiles(id) {
  if (!/^[a-z][a-z0-9-]*$/.test(id)) throw new Error(`Invalid skill: ${id}`);
  const dir = path.join(bundle, 'skills', id);
  if (!fs.existsSync(path.join(dir, 'SKILL.md'))) throw new Error(`Unknown skill: ${id}`);
  const files = {};
  function walk(base, prefix) {
    for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) throw new Error('Bundled symlinks are not supported');
      const key = prefix + entry.name;
      if (entry.isDirectory()) walk(path.join(base, entry.name), key + '/');
      else files[key] = fs.readFileSync(path.join(base, entry.name));
    }
  }
  walk(dir, '');
  return files;
}

export function filePlan(root, desired, lock) {
  const entries = [];
  for (const [relative, content] of Object.entries(desired)) {
    const file = safePath(root, relative);
    const before = fs.existsSync(file) ? hash(fs.readFileSync(file)) : null;
    const after = hash(content);
    const owned = lock?.files?.[relative];
    const status = before === after ? 'unchanged' : before === null ? 'create' :
      owned === before ? 'update' : 'conflict';
    entries.push({ path: relative, status, before, after });
  }
  return entries;
}

export function applyPlan(root, desired, entries) {
  // Recheck all preconditions before the first write. No forced overwrite option.
  for (const item of entries) {
    const file = safePath(root, item.path);
    const current = fs.existsSync(file) ? hash(fs.readFileSync(file)) : null;
    if (current !== item.before || item.status === 'conflict') {
      throw new Error(`File changed or conflicts: ${item.path}`);
    }
  }
  for (const item of entries.filter(e => e.status !== 'unchanged')) {
    const file = safePath(root, item.path);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, desired[item.path], { flag: item.before === null ? 'wx' : 'w' });
  }
}
