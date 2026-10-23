import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export function validateRippleMotion(record) {
  assert.equal(record.browser, 'native IAB Chromium');
  assert.equal(record.passed, 6);
  assert.equal(record.total, 6);
  assert.equal(record.observationToleranceMs, 2);
  assert.equal(record.remainingNodes, 0);
  assert.deepEqual(record.groups.map(group => group.platform + '/' + group.timing),
    ['cedar/default', 'maple/default', 'cedar/long', 'maple/long', 'cedar/zero', 'maple/zero']);
  for (const scope of ['OS reduced-motion', 'real touch device', 'native 200%', 'Safari', 'Firefox', 'mid-flight arbitrary CSS changes', 'cross-document adoption rebinding']) {
    assert.ok(record.excluded.includes(scope));
  }
  for (const group of record.groups) {
    assert.equal(group.properties, 'transform, opacity');
    assert.equal(group.duration, group.timing === 'long' ? '0.6s, 0.8s' : group.timing === 'zero' ? '0s, 0s' : '0.2s, 0.14s');
    const times = ['created', 'expanded', 'faded', 'removed'].map(key => group[key]);
    assert.ok(times.every(time => typeof time === 'number' && Number.isFinite(time)));
    assert.ok(times.every((time, index) => index === 0 || time >= times[index - 1]));
    assert.ok(group.faded - group.created >= 248, 'minimum display observation');
    assert.ok(group.removed - group.faded >= (group.timing === 'long' ? 798 : 248), 'fade/removal observation');
    if (group.timing === 'long') assert.ok(group.faded - group.expanded >= 598, 'long expansion was truncated');
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const directory = new URL('../audits/evidence/ripple-motion-2026-10-13/', import.meta.url);
  const record = JSON.parse(readFileSync(new URL('results.json', directory), 'utf8'));
  validateRippleMotion(record);
  assert.equal(record.screenshot.file, 'native.jpg');
  const bytes = readFileSync(new URL(record.screenshot.file, directory));
  assert.equal(bytes.readUInt16BE(0), 0xffd8);
  assert.equal(bytes.length, record.screenshot.bytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), record.screenshot.sha256);
  console.log('Ripple native evidence passed: 6 timing cases and original JPEG hash; not touch-device or OS preference proof.');
}
