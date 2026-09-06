import fs from 'node:fs';
import path from 'node:path';
import { bundle, load, readOptional, skillFiles } from './files.mjs';
import { validateDocument } from './validation.mjs';

export function preset(id) {
  if (!['quick-mvp', 'enterprise'].includes(id)) throw new Error(`Unknown preset: ${id}`);
  return load(path.join(bundle, 'presets', id + '.json'));
}

export function analyse(root) {
  const pkg = readOptional(root, 'package.json') ?? {};
  const locks = ['pnpm-lock.yaml', 'yarn.lock', 'bun.lock', 'bun.lockb', 'package-lock.json'];
  const managers = { 'pnpm-lock.yaml': 'pnpm', 'yarn.lock': 'yarn', 'bun.lock': 'bun',
    'bun.lockb': 'bun', 'package-lock.json': 'npm' };
  const found = [...new Set(locks.filter(f => fs.existsSync(path.join(root, f))).map(f => managers[f]))];
  const declared = typeof pkg.packageManager === 'string' ? pkg.packageManager.split('@')[0] : null;
  const manager = declared ?? (found.length === 1 ? found[0] : found.length === 0 ? 'npm' : null);
  return {
    packageManager: ['npm', 'pnpm', 'yarn', 'bun'].includes(manager) ? manager : null,
    verifyScripts: ['lint', 'typecheck', 'test', 'build'].filter(k => typeof pkg.scripts?.[k] === 'string'),
    detectedScripts: Object.keys(pkg.scripts ?? {}),
    warnings: found.length > 1 ? ['Multiple package manager lockfiles: review packageManager'] : [],
  };
}

export function configFor(root, id, host) {
  const data = analyse(root);
  return { schemaVersion: 1, preset: id, host, skills: preset(id).skills,
    packageManager: data.packageManager, verifyScripts: data.verifyScripts };
}

export function validateConfig(config) {
  validateDocument(config, 'project');
  for (const id of config.skills) skillFiles(id);
  return config;
}
