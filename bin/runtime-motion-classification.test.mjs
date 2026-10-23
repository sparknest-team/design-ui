import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
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
test('current reviewed sources and candidate identities match', () => { const result = checkSavedClassification(); assert.equal(result.classifiedHints, 184); assert.equal(result.unclassifiedHints, 0); assert.equal(result.categories['interaction-repeat'], 8); assert.equal(result.categories['task-dispatch'], 4); assert.equal(result.categories['measurement-scheduling'], 14); assert.equal(result.categories['visual-scroll'], 35); assert.equal(result.categories['interaction-dispatch'], 4); assert.equal(result.categories['native-scroll'], 27); assert.equal(result.categories['interaction-delay'], 20); assert.equal(result.categories['declaration-only'], 18); assert.equal(result.categories['state-settlement'], 20); assert.equal(result.categories['visual-completion'], 11); assert.equal(result.categories['delegated-scroll'], 5); assert.equal(result.categories['business-clock'], 8); });
