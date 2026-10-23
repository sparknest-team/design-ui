import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { collectMotionInventory } from './motion-source-inventory.mjs';

const workspace = fileURLToPath(new URL('../../', import.meta.url));
const categories = new Set(['declaration-only', 'measurement-scheduling', 'interaction-delay', 'interaction-dispatch', 'native-scroll', 'test-support', 'business-clock', 'interaction-repeat', 'visual-scroll', 'state-settlement', 'visual-completion', 'delegated-scroll', 'task-dispatch']);
export function checkClassification(report, inventory, readSource) {
  assert.equal(report.version, 1);
  assert.equal(report.scope, 'classification-only', 'classification must not claim acceptance');
  const seen = new Set();
  const counts = {};
  for (const row of report.rows) {
    const platform = inventory.platforms.find(p => p.repo === row.repo);
    const candidate = platform?.candidates.find(c => c.file === row.file);
    assert.ok(candidate?.runtime.length, `unknown runtime candidate: ${row.repo}/${row.file}`);
    assert.ok(row.rationale?.trim(), 'missing source rationale');
    const source = readSource(row.repo, row.file);
    assert.equal(createHash('sha256').update(source).digest('hex'), row.sha256, `source changed: ${row.repo}/${row.file}; re-review, do not auto-refresh classification`);
    assert.deepEqual(row.hints.map(h => h.line), candidate.runtime, 'classified file must account for all current runtime hints');
    for (const hint of row.hints) {
      const key = `${row.repo}/${row.file}:${hint.line}`;
      assert.ok(!seen.has(key), `duplicate classification: ${key}`);
      seen.add(key);
      assert.ok(categories.has(hint.category), `unknown responsibility: ${hint.category}`);
      assert.equal(source.split('\n')[hint.line - 1], hint.snippet, `source line changed: ${key}`);
      counts[hint.category] = (counts[hint.category] ?? 0) + 1;
    }
  }
  const total = inventory.platforms.reduce((n, p) => n + p.runtimeCallCandidates, 0);
  return { classifiedHints: seen.size, unclassifiedHints: total - seen.size, categories: counts };
}
export function checkSavedClassification() {
  const report = JSON.parse(readFileSync(new URL('../audits/runtime-motion-classification.json', import.meta.url), 'utf8'));
  return checkClassification(report, collectMotionInventory(), (repo, file) => {
    const pkg = repo === 'cedar-design-web' ? 'cedar-ui' : 'maple-ui';
    return readFileSync(resolve(workspace, repo, 'packages', pkg, 'src', file), 'utf8');
  });
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(JSON.stringify(checkSavedClassification(), null, 2));
  console.log('Source responsibility classification only; no lifecycle, browser, OS or CSS acceptance added. Unclassified includes previously audited components.');
}
