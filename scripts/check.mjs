import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
let files = 0;
function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', '.runtime'].includes(item.name)) continue;
    const file = path.join(dir, item.name);
    if (item.isSymbolicLink()) throw new Error(`Unexpected symlink: ${file}`);
    if (item.isDirectory()) { walk(file); continue; }
    if (!/\.(md|json|mjs)$/.test(file)) continue;
    files++;
    const text = fs.readFileSync(file, 'utf8');
    if (file.endsWith('.json')) JSON.parse(text);
    if (file.endsWith('.mjs')) {
      const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
    }
    if (item.name === 'SKILL.md') {
      assert.ok(text.startsWith('---\n'), `Missing frontmatter: ${file}`);
      const front = text.split('---')[1];
      assert.equal(front.match(/^name: (.+)$/m)?.[1], path.basename(dir));
      assert.ok(front.match(/^description: .+$/m));
    }
    if (file.endsWith('.md')) {
      for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
        if (/^https?:/.test(match[1])) continue;
        assert.ok(fs.existsSync(path.resolve(dir, match[1])), `Broken link ${file}: ${match[1]}`);
      }
    }
  }
}
walk(root);
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'catalog.json'), 'utf8'));
const ids = catalog.skills.map(s => s.id);
assert.equal(new Set(ids).size, ids.length, 'Duplicate skill IDs');
for (const skill of catalog.skills) {
  assert.ok(fs.existsSync(path.join(root, skill.path, 'SKILL.md')));
}
for (const name of fs.readdirSync(path.join(root, 'presets'))) {
  const preset = JSON.parse(fs.readFileSync(path.join(root, 'presets', name), 'utf8'));
  for (const id of preset.skills) assert.ok(ids.includes(id), `Unknown preset skill ${id}`);
}
console.log(`Checked ${files} source/doc files; ${ids.length} catalog skills; links and syntax valid.`);
