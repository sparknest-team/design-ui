import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const directory = resolve(root, 'audits/evidence/business-native-lifecycle-2026-10-13');
export const readEvidence = () => JSON.parse(readFileSync(resolve(directory, 'results.json'), 'utf8'));
const numberPhases = ['mounted', 'immediate-step', 'before-first-repeat', 'first-repeat', 'second-repeat', 'cancelled', 'after-cancel', 'replacement-hold', 'unmounted-pending', 'after-unmounted-deadline'];
const clockPhases = ['mounted', 'running', 'paused', 'paused-stable', 'resumed', 'deactivated', 'inactive-stable', 'inactive-reset', 'inactive-reset-stable', 'reactivated', 'unmounted', 'after-unmount'];
const hash = data => createHash('sha256').update(data).digest('hex');
export function checkBusinessEvidence(report, read = readFileSync) {
  assert.equal(report.newAcceptedCases, 4);
  assert.equal(report.newOsCases, 0, 'OS not certified');
  assert.equal(report.blockedNativeCases, 144);
  assert.equal(report.input, 'native fixture-entry clicks; scripted pointerdown/pointercancel; public Countdown methods', 'trusted native gestures not certified');
  assert.deepEqual(report.consoleWarningsErrors, []);
  assert.equal(report.fixture.file, 'refactors/token-validation/browser/business-lifecycle-main.js');
  assert.equal(report.fixture.frozen, true);
  assert.equal(hash(read(resolve(root, report.fixture.file))), report.fixture.sha256, 'fixture changed; rerun');
  assert.equal(report.screenshot.file, 'native.jpg');
  assert.equal(report.screenshot.viewed, true);
  const jpeg = read(resolve(directory, 'native.jpg'));
  assert.equal(jpeg.length, report.screenshot.bytes);
  assert.equal(hash(jpeg), report.screenshot.sha256, 'image changed');
  return checkBusinessCases(report.cases);
}
export function checkBusinessCases(cases) {
  assert.deepEqual(cases.map(r => [r.name, r.kind]), [['Cedar', 'number'], ['Maple', 'number'], ['Cedar', 'countdown'], ['Maple', 'countdown']], 'four unique cases required');
  for (const row of cases) {
    assert.equal(row.passed, true); assert.equal(row.finalNodes, 0, 'residual nodes');
    assert.deepEqual(row.samples.map(s => s.phase), row.kind === 'number' ? numberPhases : clockPhases);
    row.samples.forEach((s, i) => { assert.ok(Number.isFinite(s.time) && s.time >= 0); if (i) assert.ok(s.time >= row.samples[i - 1].time); assert.equal(s.ends, 0); });
    const p = Object.fromEntries(row.samples.map(s => [s.phase, s]));
    assert.equal(p.mounted.nodes, 1, 'actual component must be mounted');
    if (row.kind === 'number') {
      assert.deepEqual(row.events.map(e => [e.event, e.value]), [1, 2, 3, 4].map(v => ['update:modelValue', v]));
      assert.ok(row.events[1].time - row.events[0].time >= 798, 'early first repeat');
      assert.ok(row.events[2].time - row.events[1].time >= 148, 'early repeat cadence');
      assert.equal(p['immediate-step'].value, 1);
      assert.equal(p['before-first-repeat'].value, 1);
      assert.ok(p['before-first-repeat'].time - p['immediate-step'].time >= 698);
      assert.equal(p['first-repeat'].value, 2); assert.equal(p['second-repeat'].value, 3);
      assert.equal(p.cancelled.value, p['after-cancel'].value);
      assert.equal(p.cancelled.updates, p['after-cancel'].updates, 'post-cancel update');
      assert.ok(p['after-cancel'].time - p.cancelled.time >= 218);
      assert.equal(p['replacement-hold'].value, p.cancelled.value + 1);
      const unmountDelay = p['unmounted-pending'].time - p['replacement-hold'].time;
      assert.ok(unmountDelay >= 98 && unmountDelay < 800, 'unmount must cancel pending hold');
      assert.ok(p['after-unmounted-deadline'].time - p['replacement-hold'].time >= 948, 'short deadline observation');
      assert.equal(p['after-unmounted-deadline'].updates, p['unmounted-pending'].updates);
      assert.equal(p['after-unmounted-deadline'].nodes, 0);
    } else {
      for (const phase of ['deactivated', 'inactive-stable', 'inactive-reset', 'inactive-reset-stable']) assert.equal(p[phase].nodes, 0, 'inactive component must leave the document');
      assert.ok(p.running.remaining > 0 && p.running.remaining < 1600);
      assert.equal(p['paused-stable'].changes, p.paused.changes, 'paused ticking');
      assert.ok(p['paused-stable'].time - p.paused.time >= 218);
      assert.ok(p.resumed.remaining < p.paused.remaining);
      assert.equal(p['inactive-stable'].changes, p.deactivated.changes, 'inactive ticking');
      assert.ok(p['inactive-stable'].time - p.deactivated.time >= 198);
      assert.equal(p['inactive-reset'].remaining, 900, 'inactive reset not delivered');
      assert.equal(p['inactive-reset'].changes, p['inactive-stable'].changes + 1);
      assert.equal(p['inactive-reset-stable'].changes, p['inactive-reset'].changes, 'inactive reset ticking');
      assert.ok(p['inactive-reset-stable'].time - p['inactive-reset'].time >= 178);
      assert.ok(p.reactivated.changes > p['inactive-reset'].changes && p.reactivated.remaining > 0 && p.reactivated.remaining < 900, 'no resumed business clock');
      assert.equal(p.reactivated.nodes, 1);
      assert.equal(p['after-unmount'].changes, p.unmounted.changes, 'unmounted ticking');
      assert.ok(p['after-unmount'].time - p.unmounted.time >= 218);
      assert.equal(p['after-unmount'].nodes, 0);
      assert.equal(row.eventSummary.count, p['after-unmount'].changes);
      assert.equal(row.eventSummary.last.value, p['after-unmount'].remaining);
    }
  }
  return { accepted: 4, os: 0, blocked: 144 };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(checkBusinessEvidence(readEvidence()));
  console.log('Real IAB timers/RAF/public callbacks only; scripted internal gestures, no dequeued-race/cross-window/OS certification.');
}
