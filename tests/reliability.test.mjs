import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { install } from '../lib/install.mjs';
import { filePlan, applyPlan, hash } from '../lib/files.mjs';

function snapshot(root) {
  const result = {};
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else result[path.relative(root, file)] = fs.readFileSync(file).toString('base64');
    }
  }
  walk(root);
  return result;
}

test('lock changes after planning prevent every planned write', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-kit-race-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, '.workflow-kit'));
  const lock = '.workflow-kit/lock.json';
  fs.writeFileSync(path.join(root, lock), 'old');
  const desired = { 'new.txt': 'new', [lock]: 'next' };
  const entries = filePlan(root, desired, { files: { [lock]: hash('old') } });
  fs.writeFileSync(path.join(root, lock), 'concurrent change');
  assert.throws(() => applyPlan(root, desired, entries), /changed or conflicts/);
  assert.equal(fs.existsSync(path.join(root, 'new.txt')), false);
  assert.equal(fs.readFileSync(path.join(root, lock), 'utf8'), 'concurrent change');
});

test('partial staged writes do not truncate an existing file', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-kit-partial-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, 'existing.txt'), 'original');
  const desired = { 'existing.txt': 'replacement' };
  const entries = filePlan(root, desired, { files: { 'existing.txt': hash('original') } });
  const write = fs.writeFileSync;
  t.mock.method(fs, 'writeFileSync', (file, content, options) => {
    write(file, String(content).slice(0, 2), options);
    throw new Error('partial write');
  });
  assert.throws(() => applyPlan(root, desired, entries), /partial write/);
  assert.equal(fs.readFileSync(path.join(root, 'existing.txt'), 'utf8'), 'original');
  assert.deepEqual(fs.readdirSync(root), ['existing.txt']);
});

test('rollback failure retains the guard and blocks further applies', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-kit-rollback-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const write = fs.writeFileSync;
  const unlink = fs.unlinkSync;
  t.mock.method(fs, 'writeFileSync', (file, ...args) => {
    if (typeof file === 'string' && file.includes('lock.json')) throw new Error('disk full');
    return write(file, ...args);
  });
  t.mock.method(fs, 'unlinkSync', file => {
    if (file.endsWith('SKILL.md')) throw new Error('access denied');
    return unlink(file);
  });
  assert.throws(() => install(root, 'init', 'quick-mvp', { apply: true }), /rollback incomplete/);
  t.mock.restoreAll();
  assert.ok(fs.existsSync(path.join(root, '.workflow-kit/install.guard')));
  assert.throws(() => install(root, 'init', 'quick-mvp', { apply: true }), /EEXIST/);
});

for (const initialized of [false, true]) {
  test(`disk-full failure restores files (${initialized ? 'add' : 'init'})`, t => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'workflow-kit-fault-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    if (initialized) install(root, 'init', 'quick-mvp', { apply: true });
    const before = snapshot(root);
    const write = fs.writeFileSync;
    let failed = false;
    t.mock.method(fs, 'writeFileSync', function(file, ...args) {
      // Fail after config/skills have been written, while staging the new lock.
      if (!failed && typeof file === 'string' && file.includes('lock.json')) {
        failed = true;
        throw Object.assign(new Error('simulated disk full'), { code: 'ENOSPC' });
      }
      return write.call(this, file, ...args);
    });
    assert.throws(() => install(root, initialized ? 'add' : 'init',
      initialized ? 'commit-hook' : 'quick-mvp', { apply: true }), /disk full/);
    assert.equal(failed, true);
    assert.deepEqual(snapshot(root), before);
    t.mock.restoreAll();
    assert.equal(install(root, initialized ? 'add' : 'init',
      initialized ? 'commit-hook' : 'quick-mvp', { apply: true }).ok, true);
  });
}
