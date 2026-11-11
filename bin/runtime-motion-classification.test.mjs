import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { scanMotionSource } from './motion-source-inventory.mjs';
import { checkClassification, checkSavedClassification } from './runtime-motion-classification.mjs';

const source = 'setTimeout(callback, delay)';
const inventory = { platforms: [{ repo: 'cedar-design-web', runtimeCallCandidates: 2, candidates: [{ file: 'fixture.ts', runtime: [1] }] }] };
const fixture = () => ({ version: 1, scope: 'classification-only', rows: [{ repo: 'cedar-design-web', file: 'fixture.ts', rationale: 'Interaction policy, no CSS duration.', sha256: createHash('sha256').update(source).digest('hex'), hints: [{ line: 1, category: 'interaction-delay', snippet: source }] }] });
const check = report => checkClassification(report, inventory, () => source);
test('classification keeps remaining hints separate from acceptance', () => {
  assert.deepEqual(check(fixture()), { classifiedHints: 1, unclassifiedHints: 1, categories: { 'interaction-delay': 1 } });
});
test('rejects acceptance scope', () => { const report = fixture(); report.scope = 'passed'; assert.throws(() => check(report), /acceptance/); });
test('rejects unknown candidate', () => { const report = fixture(); report.rows[0].file = '../wrong.ts'; assert.throws(() => check(report), /unknown runtime/); });
test('rejects duplicate ownership', () => { const report = fixture(); report.rows.push(structuredClone(report.rows[0])); assert.throws(() => check(report), /duplicate/); });
test('rejects stale source even with unchanged candidate line', () => { const report = fixture(); report.rows[0].sha256 = 'old'; assert.throws(() => check(report), /source changed/); });
test('rejects missing candidate line', () => { const report = fixture(); report.rows[0].hints = []; assert.throws(() => check(report), /all current/); });
test('rejects unknown category', () => { const report = fixture(); report.rows[0].hints[0].category = 'passed'; assert.throws(() => check(report), /unknown responsibility/); });
test('rejects stale quoted source', () => { const report = fixture(); report.rows[0].hints[0].snippet = 'changed'; assert.throws(() => check(report), /source line/); });
for (const category of ['interaction-dispatch', 'test-support', 'business-clock', 'interaction-repeat', 'visual-scroll', 'state-settlement', 'visual-completion', 'delegated-scroll', 'task-dispatch']) {
  test(`accepts reviewed ${category} responsibility without granting acceptance`, () => {
    const report = fixture(); report.rows[0].hints[0].category = category;
    assert.deepEqual(check(report), { classifiedHints: 1, unclassifiedHints: 1, categories: { [category]: 1 } });
  });
}
test('Maple Picker geometry and column reconciliation scrolls are classified with lifecycle ownership', () => {
  const repo = 'maple-design-mobile', file = 'picker/Picker.vue';
  const source = readFileSync(new URL('../../maple-design-mobile/packages/ui/src/' + file, import.meta.url), 'utf8');
  const report = JSON.parse(readFileSync(new URL('../audits/runtime-motion-classification.json', import.meta.url), 'utf8'));
  const row = report.rows.find(item => item.repo === repo && item.file === file);
  const current = { file, ...scanMotionSource(file, source) };
  const result = checkClassification({ ...report, rows: [row] }, { platforms: [{ repo, candidates: [current], runtimeCallCandidates: current.runtime.length }] }, () => source);
  assert.equal(result.classifiedHints, 11);
  assert.equal(result.unclassifiedHints, 0);
  assert.deepEqual(result.categories, { 'visual-scroll': 10, 'declaration-only': 1 });
});

test('Cedar TimeColumn scroll retains its reviewed ownership classification', () => {
  const repo = 'cedar-design-web', file = 'time/picker/TimeColumn.vue';
  const source = readFileSync(new URL('../../cedar-design-web/packages/ui/src/' + file, import.meta.url), 'utf8');
  const report = JSON.parse(readFileSync(new URL('../audits/runtime-motion-classification.json', import.meta.url), 'utf8'));
  const row = report.rows.find(item => item.repo === repo && item.file === file);
  const current = { file, ...scanMotionSource(file, source) };
  const result = checkClassification({ ...report, rows: [row] }, { platforms: [{ repo, candidates: [current], runtimeCallCandidates: current.runtime.length }] }, () => source);
  assert.deepEqual(result, { classifiedHints: 1, unclassifiedHints: 0, categories: { 'visual-scroll': 1 } });
});

for (const [file, count] of [
  ['scheduler/components/SchedulerTimeGrid.vue', 2],
  ['scheduler/components/SchedulerEvent.vue', 4],
  ['scheduler/components/SchedulerTimelineRows.vue', 1],
  ['scheduler/components/SchedulerDependencies.vue', 1],
]) {
  test('Cedar ' + file + ' retains its reviewed runtime classification', () => {
    const repo = 'cedar-design-web';
    const source = readFileSync(new URL('../../cedar-design-web/packages/ui/src/' + file, import.meta.url), 'utf8');
    const report = JSON.parse(readFileSync(new URL('../audits/runtime-motion-classification.json', import.meta.url), 'utf8'));
    const row = report.rows.find(item => item.repo === repo && item.file === file);
    const current = { file, ...scanMotionSource(file, source) };
    const result = checkClassification({ ...report, rows: [row] }, { platforms: [{ repo, candidates: [current], runtimeCallCandidates: current.runtime.length }] }, () => source);
    assert.equal(result.classifiedHints, count);
    assert.equal(result.unclassifiedHints, 0);
  });
}

test('Cedar Map update guard owns its single interaction-delay timer', () => {
  const repo = 'cedar-design-web', file = 'map/update-guard.ts';
  const source = readFileSync(new URL('../../cedar-design-web/packages/ui/src/' + file, import.meta.url), 'utf8');
  const report = JSON.parse(readFileSync(new URL('../audits/runtime-motion-classification.json', import.meta.url), 'utf8'));
  const row = report.rows.find(item => item.repo === repo && item.file === file);
  const current = { file, ...scanMotionSource(file, source) };
  const result = checkClassification({ ...report, rows: [row] }, { platforms: [{ repo, candidates: [current], runtimeCallCandidates: current.runtime.length }] }, () => source);
  assert.deepEqual(result, { classifiedHints: 1, unclassifiedHints: 0, categories: { 'interaction-delay': 1 } });
});

test('Cedar Tree distinguishes keyboard native scroll and VirtualList delegation', () => {
  const repo = 'cedar-design-web', file = 'tree/Tree.vue';
  const source = readFileSync(new URL('../../cedar-design-web/packages/ui/src/' + file, import.meta.url), 'utf8');
  const report = JSON.parse(readFileSync(new URL('../audits/runtime-motion-classification.json', import.meta.url), 'utf8'));
  const row = report.rows.find(item => item.repo === repo && item.file === file);
  const current = { file, ...scanMotionSource(file, source) };
  const result = checkClassification({ ...report, rows: [row] }, { platforms: [{ repo, candidates: [current], runtimeCallCandidates: current.runtime.length }] }, () => source);
  assert.deepEqual(result, { classifiedHints: 4, unclassifiedHints: 0, categories: { 'delegated-scroll': 2, 'native-scroll': 1, 'declaration-only': 1 } });
});

test('current reviewed sources and candidate identities match', () => { const result = checkSavedClassification(); assert.equal(result.classifiedHints, 209); assert.equal(result.unclassifiedHints, 0); assert.equal(result.categories['interaction-repeat'], 4); assert.equal(result.categories['task-dispatch'], 7); assert.equal(result.categories['measurement-scheduling'], 17); assert.equal(result.categories['visual-scroll'], 40); assert.equal(result.categories['interaction-dispatch'], 4); assert.equal(result.categories['native-scroll'], 28); assert.equal(result.categories['interaction-delay'], 28); assert.equal(result.categories['declaration-only'], 18); assert.equal(result.categories['state-settlement'], 22); assert.equal(result.categories['visual-completion'], 11); assert.equal(result.categories['delegated-scroll'], 12); assert.equal(result.categories['business-clock'], 8); });
