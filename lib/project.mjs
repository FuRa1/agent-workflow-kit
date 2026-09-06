import fs from 'node:fs';
import path from 'node:path';
import { bundle, load, readOptional } from './files.mjs';

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
  if (config?.schemaVersion !== 1) throw new Error('Unsupported project config version');
  preset(config.preset);
  if (!['codex', 'claude', 'both'].includes(config.host)) throw new Error('Invalid host');
  if (!Array.isArray(config.skills) || !config.skills.every(s => /^[a-z][a-z0-9-]*$/.test(s))) {
    throw new Error('Invalid skills in project config');
  }
  if (!Array.isArray(config.verifyScripts) || !config.verifyScripts.every(s => typeof s === 'string')) {
    throw new Error('Invalid verifyScripts in project config');
  }
  if (config.packageManager !== null && !['npm', 'pnpm', 'yarn', 'bun'].includes(config.packageManager)) {
    throw new Error('Invalid packageManager');
  }
  return config;
}
