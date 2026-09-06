import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../bin/workflow-kit.mjs', import.meta.url));
function project(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-kit-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({
    name: 'fixture', scripts: { test: 'node --test', build: 'node build.mjs' },
  }));
  return root;
}
function run(root, ...args) {
  const result = spawnSync(process.execPath, [cli, ...args, '--project', root], {
    encoding: 'utf8', timeout: 15000,
  });
  return { code: result.status, out: result.stdout, err: result.stderr };
}
function read(root, file) { return fs.readFileSync(path.join(root, file), 'utf8'); }

test('init defaults to read-only preview', t => {
  const root = project(t);
  const result = run(root, 'init', 'quick-mvp');
  assert.equal(result.code, 0, result.err);
  assert.deepEqual(fs.readdirSync(root), ['package.json']);
  assert.match(result.out, /preview/i);
});

test('init installs complete skills and adapter, then is idempotent', t => {
  const root = project(t);
  assert.equal(run(root, 'init', 'quick-mvp', '--host', 'both', '--apply').code, 0);
  assert.ok(read(root, '.agents/skills/design-polish/references/records.md'));
  assert.ok(read(root, '.claude/skills/design-polish/assets/run.example.json'));
  const config = JSON.parse(read(root, '.workflow-kit/project.json'));
  assert.equal(config.preset, 'quick-mvp');
  assert.deepEqual(config.verifyScripts, ['test', 'build']);
  const lock = read(root, '.workflow-kit/lock.json');
  assert.equal(run(root, 'init', 'quick-mvp', '--host', 'both', '--apply').code, 0);
  assert.equal(read(root, '.workflow-kit/lock.json'), lock);
});

test('conflicts abort the entire plan without overwriting user data', t => {
  const root = project(t);
  fs.mkdirSync(path.join(root, '.agents/skills/design-polish'), { recursive: true });
  fs.writeFileSync(path.join(root, '.agents/skills/design-polish/SKILL.md'), 'my work');
  const result = run(root, 'init', 'quick-mvp', '--apply');
  assert.equal(result.code, 1);
  assert.equal(read(root, '.agents/skills/design-polish/SKILL.md'), 'my work');
  assert.equal(fs.existsSync(path.join(root, '.workflow-kit/project.json')), false);
});

test('update reports and preserves locally modified managed files', t => {
  const root = project(t);
  assert.equal(run(root, 'init', 'quick-mvp', '--apply').code, 0);
  const file = '.agents/skills/design-polish/SKILL.md';
  fs.appendFileSync(path.join(root, file), '\nmy local guidance\n');
  const before = read(root, file);
  assert.equal(run(root, 'update', '--apply').code, 1);
  assert.equal(read(root, file), before);
  assert.equal(run(root, 'doctor').code, 1);
});

test('add requires init, validates identifiers, and can add commit-hook', t => {
  const root = project(t);
  assert.equal(run(root, 'add', 'commit-hook', '--apply').code, 1);
  assert.equal(run(root, 'init', 'quick-mvp', '--apply').code, 0);
  assert.equal(run(root, 'add', '../escape', '--apply').code, 1);
  assert.equal(run(root, 'add', 'commit-hook', '--apply').code, 0);
  assert.ok(read(root, '.agents/skills/commit-hook/SKILL.md'));
  assert.equal(fs.existsSync(path.join(root, '.git/hooks')), false);
});

test('doctor detects missing npm scripts but never runs them', t => {
  const root = project(t);
  assert.equal(run(root, 'init', 'enterprise', '--apply').code, 0);
  const healthy = run(root, 'doctor', '--json');
  assert.equal(healthy.code, 0, healthy.err);
  assert.equal(JSON.parse(healthy.out).ok, true);
  fs.writeFileSync(path.join(root, 'package.json'), '{"scripts":{}}');
  const broken = run(root, 'doctor', '--json');
  assert.equal(broken.code, 1);
  assert.ok(JSON.parse(broken.out).errors.some(x => x.includes('script')));
});

test('unknown arguments fail before changing project', t => {
  const root = project(t);
  for (const args of [['init', 'mystery'], ['init', 'quick-mvp', '--host', 'bad'],
    ['init', 'quick-mvp', '--force'], ['update', '--apply', '--dry-run']]) {
    assert.equal(run(root, ...args).code, 1);
  }
  assert.deepEqual(fs.readdirSync(root), ['package.json']);
});

test('symlinked installation directories cannot escape the project', t => {
  const root = project(t);
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-kit-outside-'));
  t.after(() => fs.rmSync(outside, { recursive: true, force: true }));
  fs.symlinkSync(outside, path.join(root, '.agents'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.equal(run(root, 'init', 'quick-mvp', '--apply').code, 1);
  assert.deepEqual(fs.readdirSync(outside), []);
});

test('catalogue and workflow discovery are read-only', t => {
  const root = project(t);
  const listed = run(root, 'list', '--json');
  assert.equal(listed.code, 0, listed.err);
  assert.ok(JSON.parse(listed.out).skills.some(s => s.id === 'project-bootstrap'));
  assert.equal(run(root, 'workflow', 'design-implementation', '--json').code, 0);
  assert.deepEqual(fs.readdirSync(root), ['package.json']);
});

test('update installs a new bundled revision only for unchanged managed files', t => {
  const root = project(t);
  assert.equal(run(root, 'init', 'quick-mvp', '--apply').code, 0);
  const copy = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-kit-bundle-'));
  t.after(() => fs.rmSync(copy, { recursive: true, force: true }));
  const source = path.resolve(path.dirname(cli), '..');
  for (const entry of ['bin', 'lib', 'schemas', 'skills', 'presets', 'workflows', 'catalog.json', 'package.json']) {
    fs.cpSync(path.join(source, entry), path.join(copy, entry), { recursive: true });
  }
  const changed = 'skills/design-polish/SKILL.md';
  fs.appendFileSync(path.join(copy, changed), '\nNew bundled guidance.\n');
  const installed = '.agents/' + changed;
  const before = read(root, installed);
  const invoke = (...args) => spawnSync(process.execPath,
    [path.join(copy, 'bin/workflow-kit.mjs'), 'update', '--project', root, ...args],
    { encoding: 'utf8', timeout: 15000 });
  assert.equal(invoke('--dry-run').status, 0);
  assert.equal(read(root, installed), before);
  assert.equal(invoke('--apply').status, 0);
  assert.match(read(root, installed), /New bundled guidance/);
  assert.equal(run(root, 'doctor').code, 0);
});

test('user configuration and existing project instructions survive update', t => {
  const root = project(t);
  fs.writeFileSync(path.join(root, 'AGENTS.md'), 'User instructions');
  assert.equal(run(root, 'init', 'quick-mvp', '--apply').code, 0);
  const configPath = '.workflow-kit/project.json';
  const config = JSON.parse(read(root, configPath));
  config.customNote = 'keep this';
  fs.writeFileSync(path.join(root, configPath), JSON.stringify(config));
  const adapter = 'design-polish.project.json';
  const custom = JSON.parse(read(root, adapter));
  custom.defaultReference = 'my-design.html';
  fs.writeFileSync(path.join(root, adapter), JSON.stringify(custom));
  assert.equal(run(root, 'update', '--apply').code, 0);
  assert.equal(read(root, configPath), JSON.stringify(config));
  assert.equal(read(root, adapter), JSON.stringify(custom));
  assert.equal(read(root, 'AGENTS.md'), 'User instructions');
});

test('active installer guard prevents a competing apply', t => {
  const root = project(t);
  fs.mkdirSync(path.join(root, '.workflow-kit'));
  fs.writeFileSync(path.join(root, '.workflow-kit/install.guard'), 'another installer');
  assert.equal(run(root, 'init', 'quick-mvp', '--apply').code, 1);
  assert.equal(fs.existsSync(path.join(root, '.agents')), false);
  assert.equal(read(root, '.workflow-kit/install.guard'), 'another installer');
});

test('invalid lock data is rejected before installation writes', t => {
  const root = project(t);
  fs.mkdirSync(path.join(root, '.workflow-kit'));
  for (const files of [[], { '.agents/skills/design-polish/SKILL.md': 'bad-hash' },
    { 'package.json': 'a'.repeat(64) }]) {
    const lock = JSON.stringify({ schemaVersion: 1, packageVersion: '0.1.0', files });
    fs.writeFileSync(path.join(root, '.workflow-kit/lock.json'), lock);
    assert.equal(run(root, 'init', 'quick-mvp', '--apply').code, 1);
    assert.equal(fs.existsSync(path.join(root, '.agents')), false);
    assert.equal(read(root, '.workflow-kit/lock.json'), lock);
  }
});

test('doctor checks inventory even when lock entries are omitted', t => {
  const root = project(t);
  assert.equal(run(root, 'init', 'quick-mvp', '--apply').code, 0);
  const file = '.agents/skills/design-polish/SKILL.md';
  const lock = JSON.parse(read(root, '.workflow-kit/lock.json'));
  delete lock.files[file];
  fs.writeFileSync(path.join(root, '.workflow-kit/lock.json'), JSON.stringify(lock));
  fs.unlinkSync(path.join(root, file));
  const result = run(root, 'doctor');
  assert.equal(result.code, 1);
  assert.match(result.out, /Untracked required file/);
});

test('project config rejects duplicate skills and blank verification names', t => {
  const root = project(t);
  assert.equal(run(root, 'init', 'quick-mvp', '--apply').code, 0);
  const original = JSON.parse(read(root, '.workflow-kit/project.json'));
  for (const change of [{ skills: ['design-polish', 'design-polish'] },
    { verifyScripts: [''] }, { skills: ['not-a-bundled-skill'] }]) {
    const config = JSON.stringify({ ...original, ...change });
    fs.writeFileSync(path.join(root, '.workflow-kit/project.json'), config);
    assert.equal(run(root, 'update', '--apply').code, 1);
    assert.equal(run(root, 'doctor').code, 1);
    assert.equal(read(root, '.workflow-kit/project.json'), config);
  }
});

test('a directory at lock.json fails before any skill writes', t => {
  const root = project(t);
  fs.mkdirSync(path.join(root, '.workflow-kit/lock.json'), { recursive: true });
  assert.equal(run(root, 'init', 'quick-mvp', '--apply').code, 1);
  assert.equal(fs.existsSync(path.join(root, '.agents')), false);
});

test('JSON null state files are invalid, not missing', t => {
  for (const file of ['.workflow-kit/project.json', '.workflow-kit/lock.json', 'design-polish.project.json']) {
    const root = project(t);
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), 'null');
    assert.equal(run(root, 'init', 'quick-mvp', '--apply').code, 1);
    assert.equal(read(root, file), 'null');
    assert.equal(fs.existsSync(path.join(root, '.agents')), false);
  }
});
