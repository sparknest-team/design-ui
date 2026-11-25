import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspace = fileURLToPath(new URL('../../', import.meta.url));
const hash = data => createHash('sha256').update(data).digest('hex');

export function readFixedCapture(kind, sources, read = readFileSync) {
  const directory = resolve(workspace, 'design-ui/audits/evidence', kind + '-fixed-2026-11-24-ego');
  const report = JSON.parse(read(resolve(directory, 'results.json'), 'utf8'));
  assert.match(report.userAgent, /Chrome\//);
  assert.deepEqual(report.diagnostics, []);
  assert.deepEqual(Object.keys(report.hashesBefore).sort(), [...sources].sort());
  assert.deepEqual(report.hashesBefore, report.hashesAfter);
  for (const file of sources) assert.equal(hash(read(resolve(workspace, file))), report.hashesBefore[file], file);
  assert.equal(hash(read(resolve(directory, 'screenshot.png'))), report.screenshotSha256);
  return report;
}
