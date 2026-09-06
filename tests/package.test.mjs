import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('local npm archive supports installation and complete standalone skills', t => {
  const npm = process.env.npm_execpath;
  assert.ok(npm, 'Run this packaging test through npm test');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-kit-package-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const source = fileURLToPath(new URL('../', import.meta.url));
  function invoke(script, args, cwd) {
    const result = spawnSync(process.execPath, [script, ...args], {
      cwd, encoding: 'utf8', timeout: 30000,
    });
    assert.equal(result.status, 0, result.error?.message ?? result.stderr);
    return result.stdout;
  }
  const packed = JSON.parse(invoke(npm, ['pack', '--json', '--pack-destination', root], source))[0];
  assert.ok(packed.files.some(f => f.path === 'schemas/project.v1.schema.json'));
  const consumer = path.join(root, 'consumer');
  fs.mkdirSync(consumer);
  invoke(npm, ['install', '--ignore-scripts', '--no-audit', '--no-fund',
    path.join(root, packed.filename)], consumer);
  const installed = path.join(consumer, 'node_modules/agent-workflow-kit');
  const cli = path.join(installed, 'bin/workflow-kit.mjs');
  assert.ok(fs.existsSync(path.join(consumer, 'node_modules/.bin',
    process.platform === 'win32' ? 'workflow-kit.cmd' : 'workflow-kit')));
  const preview = JSON.parse(invoke(cli, ['init', 'quick-mvp', '--host', 'both'], consumer));
  assert.equal(preview.mode, 'preview');
  assert.equal(fs.existsSync(path.join(consumer, '.workflow-kit')), false);
  invoke(cli, ['init', 'quick-mvp', '--host', 'both', '--apply'], consumer);
  assert.equal(JSON.parse(invoke(cli, ['doctor'], consumer)).ok, true);
  const standalone = path.join(root, 'standalone-skill');
  fs.cpSync(path.join(installed, 'skills/design-polish'), standalone, { recursive: true });
  for (const file of ['SKILL.md', 'references/records.md', 'references/workflow.md',
    'assets/project.example.json', 'assets/run.example.json', 'assets/review-entry.md']) {
    assert.deepEqual(fs.readFileSync(path.join(standalone, file)),
      fs.readFileSync(path.join(source, 'skills/design-polish', file)));
  }
});
