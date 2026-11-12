import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { checkBusinessCases, checkBusinessEvidence, readEvidence } from './business-lifecycle-evidence-check.mjs';
const positive = () => structuredClone(readEvidence());
const currentFixtureHash = () => createHash('sha256').update(readFileSync(fileURLToPath(new URL('../refactors/token-validation/browser/business-lifecycle-main.js', import.meta.url)))).digest('hex');
const sample = (r, i, phase) => r.cases[i].samples.find(s => s.phase === phase);
test('historical behavioral data satisfies behavior assertions independently', () => assert.deepEqual(checkBusinessCases(positive().cases), { accepted: 4, os: 0, blocked: 144 }));
test('nondefault diagnostic durations are explicit and do not alter the historical contract', () => {
  const cases = positive().cases;
  for (const row of cases.filter(row => row.kind === 'countdown')) {
    row.samples.find(s => s.phase === 'inactive-reset').remaining = 5000;
    row.samples.find(s => s.phase === 'reactivated').remaining = 4500;
  }
  assert.throws(() => checkBusinessCases(cases));
  assert.deepEqual(checkBusinessCases(cases, { initialDuration: 10000, resetDuration: 5000 }), { accepted: 4, os: 0, blocked: 144 });
  assert.throws(() => checkBusinessCases(cases, { initialDuration: 0, resetDuration: 5000 }), /invalid countdown duration/);
});
for (const [name, mutate] of [
  ['missing case', r => r.cases.pop()],
  ['duplicate case', r => r.cases[1] = structuredClone(r.cases[0])],
  ['residual nodes', r => r.cases[0].finalNodes = 1],
  ['early first repeat', r => r.cases[0].events[1].time = 700],
  ['early repeat cadence', r => r.cases[0].events[2].time = r.cases[0].events[1].time + 100],
  ['post-cancel update', r => sample(r, 0, 'after-cancel').updates++],
  ['unmount after pending deadline', r => sample(r, 0, 'unmounted-pending').time = sample(r, 0, 'replacement-hold').time + 800],
  ['short deadline observation', r => sample(r, 0, 'after-unmounted-deadline').time = sample(r, 0, 'unmounted-pending').time + 10],
  ['no post-mount countdown change despite initial value below duration', r => { sample(r, 2, 'mounted').remaining = 1599; sample(r, 2, 'running').remaining = 1599; sample(r, 2, 'running').changes = sample(r, 2, 'mounted').changes; }],
  ['short initial countdown observation', r => { sample(r, 2, 'running').time = sample(r, 2, 'mounted').time + 177; }],
  ['paused ticking', r => sample(r, 2, 'paused-stable').changes++],
  ['inactive ticking', r => sample(r, 2, 'inactive-stable').changes++],
  ['inactive reset not delivered', r => sample(r, 2, 'inactive-reset').remaining = 1600],
  ['inactive reset ticking', r => sample(r, 2, 'inactive-reset-stable').changes++],
  ['no positive reactivation', r => sample(r, 2, 'reactivated').remaining = 900],
  ['post-unmount changes', r => sample(r, 2, 'after-unmount').changes++],
]) test(`rejects behavioral regression: ${name}`, () => { const r = positive(); mutate(r); assert.throws(() => checkBusinessCases(r.cases)); });
for (const [name, mutate] of [
  ['OS claim', r => r.newOsCases = 1],
  ['trusted native gesture claim', r => r.input = 'native long press'],
  ['image hash drift', r => r.screenshot.sha256 = 'changed'],
  ['fixture drift', r => r.fixture.sha256 = 'changed'],
]) test(`rejects ${name}`, () => { const r = positive(); r.fixture.sha256 = currentFixtureHash(); assert.deepEqual(checkBusinessEvidence(r), { accepted: 4, os: 0, blocked: 144 }, 'control must reach and pass all checks'); mutate(r); assert.throws(() => checkBusinessEvidence(r)); });

// Supplemental frame-aware Ego evidence preserves the 900ms clock but uses a
// different observation boundary. It does not replace the historical fixture.
import { checkFirstFrameEvidence, readFirstFrameEvidence } from './business-lifecycle-first-frame-evidence-check.mjs';
const supplemental = () => structuredClone(readFirstFrameEvidence());
test('Ego first-frame diagnostic satisfies the same behavior assertions', () => assert.deepEqual(checkFirstFrameEvidence(supplemental()), { accepted: 4, os: 0, blocked: 144 }));
// Rebase only the test copy so each mutation reaches its intended assertion
// even when the real capture no longer matches the current source tree.
const supplementalMutationControl = () => {
  const report = supplemental();
  const workspace = fileURLToPath(new URL('../../', import.meta.url));
  for (const file of Object.keys(report.hashesBefore)) {
    const current = createHash('sha256').update(readFileSync(`${workspace}/${file}`)).digest('hex');
    report.hashesBefore[file] = current;
    report.hashesAfter[file] = current;
  }
  return report;
};
for (const [name, mutate] of [
  ['missing source', r => delete r.hashesBefore[Object.keys(r.hashesBefore)[0]]],
  ['source changed during capture', r => r.hashesAfter[Object.keys(r.hashesAfter)[0]] = 'changed'],
  ['source changed after capture', r => { const k = Object.keys(r.hashesBefore)[0]; r.hashesBefore[k] = r.hashesAfter[k] = 'changed'; }],
  ['screenshot drift', r => r.screenshotSha256 = 'changed'],
  ['missing diagnostic source', r => r.diagnosticSources.pop()],
  ['diagnostic warning', r => r.diagnostics.push('warning')],
  ['unfinished run', r => r.run.busy = true],
  ['missing case', r => r.run.results.pop()],
  ['unmounted notification', r => r.run.results[2].samples.find(s => s.phase === 'after-unmount').changes++],
]) test(`Ego first-frame rejects ${name}`, () => { const r = supplementalMutationControl(); checkFirstFrameEvidence(r); mutate(r); assert.throws(() => checkFirstFrameEvidence(r)); });
