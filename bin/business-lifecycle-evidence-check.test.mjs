import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkBusinessEvidence, readEvidence } from './business-lifecycle-evidence-check.mjs';
const positive = () => structuredClone(readEvidence());
const sample = (r, i, phase) => r.cases[i].samples.find(s => s.phase === phase);
test('real four-case evidence with original image and fixture passes', () => assert.deepEqual(checkBusinessEvidence(positive()), { accepted: 4, os: 0, blocked: 144 }));
for (const [name, mutate] of [
  ['missing case', r => r.cases.pop()],
  ['duplicate case', r => r.cases[1] = structuredClone(r.cases[0])],
  ['residual nodes', r => r.cases[0].finalNodes = 1],
  ['early first repeat', r => r.cases[0].events[1].time = 700],
  ['early repeat cadence', r => r.cases[0].events[2].time = r.cases[0].events[1].time + 100],
  ['post-cancel update', r => sample(r, 0, 'after-cancel').updates++],
  ['unmount after pending deadline', r => sample(r, 0, 'unmounted-pending').time = sample(r, 0, 'replacement-hold').time + 800],
  ['short deadline observation', r => sample(r, 0, 'after-unmounted-deadline').time = sample(r, 0, 'unmounted-pending').time + 10],
  ['paused ticking', r => sample(r, 2, 'paused-stable').changes++],
  ['inactive ticking', r => sample(r, 2, 'inactive-stable').changes++],
  ['inactive reset not delivered', r => sample(r, 2, 'inactive-reset').remaining = 1600],
  ['inactive reset ticking', r => sample(r, 2, 'inactive-reset-stable').changes++],
  ['no positive reactivation', r => sample(r, 2, 'reactivated').remaining = 900],
  ['post-unmount changes', r => sample(r, 2, 'after-unmount').changes++],
  ['OS claim', r => r.newOsCases = 1],
  ['trusted native gesture claim', r => r.input = 'native long press'],
  ['image hash drift', r => r.screenshot.sha256 = 'changed'],
  ['fixture drift', r => r.fixture.sha256 = 'changed'],
]) test(`rejects ${name}`, () => { const r = positive(); mutate(r); assert.throws(() => checkBusinessEvidence(r)); });
