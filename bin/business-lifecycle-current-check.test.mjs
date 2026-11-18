import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { checkCurrentBusinessEvidence, checkFrameFixture } from './business-lifecycle-current-check.mjs';

test('current first-frame fixture differs only in the documented observation, running and teardown changes', () => {
  const directory = fileURLToPath(new URL('../refactors/token-validation/browser/', import.meta.url));
  const original = readFileSync(`${directory}business-lifecycle-main.js`, 'utf8');
  const frame = readFileSync(`${directory}business-lifecycle-first-frame-diagnostic.js`, 'utf8');
  checkFrameFixture(original, frame);
  assert.throws(() => checkFrameFixture(original, frame.replace("]) })\napp.mount('#app')", "]) }).mount('#app')")));
  assert.throws(() => checkFrameFixture(original, frame.replace('p.running.changes > p.mounted.changes && ', '')));
  assert.throws(() => checkFrameFixture(original, frame.replace("await wait(180); await new Promise(resolve => requestAnimationFrame(resolve)); await nextTick(); snapshot('running')", "await wait(180); snapshot('running')")));
  assert.throws(() => checkFrameFixture(original, frame.replace("s.instance.value.start(); await wait(180); await new Promise(resolve => requestAnimationFrame(resolve)); await nextTick(); snapshot('resumed')", "s.instance.value.start(); await wait(180); snapshot('resumed')")));
  assert.throws(() => checkFrameFixture(original, frame.replace('await wait(180)', 'await wait(181)')));
});

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
