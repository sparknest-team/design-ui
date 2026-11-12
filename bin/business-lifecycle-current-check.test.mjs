import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkCurrentBusinessEvidence } from './business-lifecycle-current-check.mjs';

test('verifies historical and current first-frame evidence together', () => {
  const result = checkCurrentBusinessEvidence();
  assert.deepEqual(result.historical, { accepted: 4, os: 0, blocked: 144 });
  assert.deepEqual(result.currentEvidence, { accepted: 4, os: 0, blocked: 144 });
});
for (const [name, suffix] of [
  ['archived fixture', '/frozen-fixture.js'],
  ['current original fixture', '/business-lifecycle-main.js'],
  ['first-frame fixture', '/business-lifecycle-first-frame-diagnostic.js'],
  ['current countdown source', '/countdown/use-countdown.ts'],
  ['first-frame screenshot', '/business-lifecycle-first-frame-2026-11-12-ego/screenshot.png'],
]) test(`rejects changed ${name}`, () => {
  assert.throws(() => checkCurrentBusinessEvidence((path, ...options) => {
    if (path.endsWith(suffix)) return options[0] === 'utf8' ? 'changed' : Buffer.from('changed');
    return readFileSync(path, ...options);
  }));
});
