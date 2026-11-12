import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkBusinessCases } from './business-lifecycle-evidence-check.mjs';

const workspace = fileURLToPath(new URL('../../', import.meta.url));
const directory = resolve(workspace, 'design-ui/audits/evidence/business-lifecycle-first-frame-2026-11-12-ego');
const files = [
  'design-ui/refactors/token-validation/browser/business-lifecycle-first-frame-diagnostic.html',
  'design-ui/refactors/token-validation/browser/business-lifecycle-first-frame-diagnostic.js',
  'cedar-design-web/packages/ui/src/input-number/InputNumber.vue',
  'maple-design-mobile/packages/ui/src/input-number/InputNumber.vue',
  'cedar-design-web/packages/ui/src/countdown/Countdown.vue',
  'maple-design-mobile/packages/ui/src/countdown/Countdown.vue',
  'cedar-design-web/packages/ui/src/countdown/use-countdown.ts',
  'maple-design-mobile/packages/ui/src/countdown/use-countdown.ts',
];
const hash = data => createHash('sha256').update(data).digest('hex');
export const readFirstFrameEvidence = () => JSON.parse(readFileSync(resolve(directory, 'results.json'), 'utf8'));
export function checkFirstFrameEvidence(report, read = readFileSync) {
  assert.deepEqual(report.diagnosticSources, ['page-console-and-errors', 'cdp-exceptions'], 'page and CDP diagnostics must be captured');
  assert.deepEqual(report.diagnostics, []);
  assert.match(report.userAgent, /Chrome\//);
  assert.deepEqual(Object.keys(report.hashesBefore).sort(), [...files].sort(), 'selected sources required');
  assert.deepEqual(report.hashesBefore, report.hashesAfter, 'source changed during capture');
  for (const file of files) assert.equal(hash(read(resolve(workspace, file))), report.hashesBefore[file], `source changed: ${file}`);
  assert.equal(hash(read(resolve(directory, 'screenshot.png'))), report.screenshotSha256, 'screenshot changed');
  assert.equal(report.run.busy, false);
  const cases = report.run.results.map(row => {
    if (row.kind !== 'countdown') return row;
    const changes = row.events.filter(event => event.event === 'change');
    return { ...row, eventSummary: { count: changes.length, last: changes.at(-1) } };
  });
  return checkBusinessCases(cases);
}
