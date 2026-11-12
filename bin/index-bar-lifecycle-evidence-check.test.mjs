import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkIndexBarEvidence, readEvidence, readEgoEvidence } from './index-bar-lifecycle-evidence-check.mjs';
const positive = () => structuredClone(readEgoEvidence());
test('original 600ms IndexBar evidence remains valid for current sources', () => assert.deepEqual(checkIndexBarEvidence(readEvidence()), { accepted: 4, os: 0, blocked: 144 }));
test('four Ego Lite frame-aware IndexBar lifecycle cases and evidence pass', () => assert.deepEqual(checkIndexBarEvidence(positive()), { accepted: 4, os: 0, blocked: 144 }));
for (const [name, mutate] of [
  ['missing case', r => r.cases.pop()],
  ['duplicate case', r => r.cases[1] = structuredClone(r.cases[0])],
  ['short observation', r => r.cases[2].samples[3].time = 300],
  ['post-cancel write', r => r.cases[2].samples[3].writes++],
  ['retained notification', r => r.cases[2].samples[3].changes.push('B')],
  ['early unlock', r => r.cases[1].samples[1].changes.push('C')],
  ['never unlocked', r => r.cases[1].samples[2].changes.pop()],
  ['missing active restore', r => r.cases[3].samples[4].top = 0],
  ['restore notification', r => r.cases[3].samples[4].changes.push('C')],
  ['missing restored listener', r => r.cases[3].samples[5].active = 'C'],
  ['no interpolation', r => r.cases[2].samples[1].top = 0],
  ['residual nodes', r => r.cases[0].finalNodes = 1],
  ['OS claim', r => r.newOsCases = 1],
  ['source drift', r => r.sources[0].sha256 = 'changed'],
  ['fixture drift', r => r.fixture.sha256 = 'changed'],
  ['image drift', r => r.screenshot.sha256 = 'changed'],
  ['host fixture drift', r => r.fixture.hostSha256 = 'changed'],
  ['incorrect duration claim', r => r.fixture.interpolationDurationMs = 600],
  ['console warning', r => r.consoleWarningsErrors.push({ kind: 'warn', text: 'warning' })],
  ['bad browser', r => r.browserUserAgent = 'unknown'],
  ['raw capture drift', r => r.raw.sha256 = 'changed'],
]) test(`rejects ${name}`, () => { const r = positive(); mutate(r); assert.throws(() => checkIndexBarEvidence(r)); });
