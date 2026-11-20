import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const legacyDirectory = resolve(root, 'audits/evidence/index-bar-lifecycle-2026-10-14');
const egoDirectory = resolve(root, 'audits/evidence/index-bar-lifecycle-2026-11-12-ego');
const hash = data => createHash('sha256').update(data).digest('hex');
export const readEvidence = () => JSON.parse(readFileSync(resolve(legacyDirectory, 'results.json'), 'utf8'));
export const readEgoEvidence = () => JSON.parse(readFileSync(resolve(egoDirectory, 'results.json'), 'utf8'));

function checkSampleBoundary(entries, count, time) {
  assert.ok(count <= entries.length, 'sample exceeds recorded entries');
  if (count > 0) assert.ok(entries[count - 1].time <= time, 'sample includes a later entry');
  if (count < entries.length) assert.ok(entries[count].time >= time, 'sample omits an earlier entry');
}

function checkIndexBarTimeline(c, requireWrites) {
  const final = c.samples.at(-1);
  assert.ok(final, 'missing final sample');
  const start = c.samples[0].time;
  const streams = [c.events];
  if (requireWrites) {
    assert.ok(Array.isArray(c.writes), 'missing scroll writes');
    assert.equal(c.writes.length, final.writes, 'final write count differs from trace');
    for (const write of c.writes) {
      assert.ok(Number.isFinite(write.left) && Number.isFinite(write.top), 'invalid scroll coordinates');
    }
    streams.push(c.writes);
  }
  for (const stream of streams) {
    let previous = start;
    for (const entry of stream) {
      assert.ok(Number.isFinite(entry.time) && entry.time >= previous && entry.time <= final.time, 'entry outside ordered timeline');
      previous = entry.time;
    }
  }
  for (const sample of c.samples) {
    checkSampleBoundary(c.events, sample.changes.length, sample.time);
    assert.deepEqual(sample.changes, c.events.slice(0, sample.changes.length).map(e => e.value), 'sampled changes differ from trace');
    if (requireWrites) checkSampleBoundary(c.writes, sample.writes, sample.time);
  }
}

export function checkIndexBarEvidence(r, read = readFileSync) {
  const ego = r.mode === 'ego-lite-frame-aware';
  const directory = ego ? egoDirectory : legacyDirectory;
  let rawCases;
  if (ego) {
    assert.match(r.browserUserAgent, /Chrome\//);
    assert.equal(r.fixture.hostFile, 'refactors/token-validation/browser/index-bar-lifecycle-ego.html');
    assert.equal(hash(read(resolve(root, r.fixture.hostFile))), r.fixture.hostSha256, 'host fixture drift');
    assert.equal(r.fixture.interpolationDurationMs, 3000);
    assert.equal(r.raw.file, 'raw.json');
    const rawBytes = read(resolve(directory, r.raw.file));
    assert.equal(hash(rawBytes), r.raw.sha256, 'raw evidence drift');
    const raw = JSON.parse(rawBytes);
    assert.deepEqual(raw.hashesBefore, raw.hashesAfter, 'sources changed during capture');
    assert.equal(raw.userAgent, r.browserUserAgent);
    assert.deepEqual(raw.diagnostics, r.consoleWarningsErrors);
    assert.equal(raw.screenshotSha256, r.screenshot.sha256);
    rawCases = raw.cases;
    assert.equal(raw.hashesBefore['design-ui/' + r.fixture.file], r.fixture.sha256);
    assert.equal(raw.hashesBefore['design-ui/' + r.fixture.hostFile], r.fixture.hostSha256);
    for (const s of r.sources) assert.equal(raw.hashesBefore[`maple-design-mobile/packages/ui/src/${s.file}`], s.sha256);
  } else {
    assert.equal(r.mode, undefined);
  }
  assert.equal(r.newAcceptedCases, 4); assert.equal(r.newOsCases, 0); assert.equal(r.blockedNativeCases, 144);
  assert.equal(r.input, 'native fixture-entry clicks; public commands and scroll events are fixture-scripted; native RAF and clock unchanged');
  assert.equal(r.fixture.file, ego ? 'refactors/token-validation/browser/index-bar-lifecycle-ego.js' : 'refactors/token-validation/browser/index-bar-lifecycle-main.js'); assert.equal(r.fixture.frozen, true);
  assert.equal(hash(read(resolve(root, r.fixture.file))), r.fixture.sha256, 'fixture drift');
  assert.deepEqual(r.sources.map(s => s.file), ['index-bar/IndexBar.vue', 'index-bar/scroll-task.ts']);
  for (const s of r.sources) assert.equal(hash(read(resolve(root, '../maple-design-mobile/packages/ui/src', s.file))), s.sha256, 'source drift');
  assert.deepEqual(r.consoleWarningsErrors, []);
  assert.equal(r.screenshot.file, ego ? 'native.png' : 'native.jpg'); assert.equal(r.screenshot.viewed, true);
  const screenshot = read(resolve(directory, r.screenshot.file));
  assert.equal(screenshot.length, r.screenshot.bytes); assert.equal(hash(screenshot), r.screenshot.sha256, 'image drift');
  assert.deepEqual(r.cases.map(c => c.kind), ['replacement', 'settlement', 'unmount', 'keepalive'], 'four unique cases');
  for (const c of r.cases) {
    assert.equal(c.passed, true); assert.equal(c.finalNodes, 0);
    c.samples.forEach((s, i) => {
      assert.ok(Number.isFinite(s.time) && s.time >= 0); assert.ok(Number.isInteger(s.writes) && s.writes >= 0);
      assert.ok(Number.isFinite(s.top) && s.top >= 0);
      if (i) { assert.ok(s.time >= c.samples[i-1].time); assert.ok(s.writes >= c.samples[i-1].writes); }
    });
    const p = Object.fromEntries(c.samples.map(s => [s.phase, s]));
    const phases = c.kind === 'replacement' ? ['ready', 'latest-settled', 'final-unmounted']
      : c.kind === 'settlement' ? ['ready', 'first-settlement-frame', 'settlement-complete', 'final-unmounted']
        : ['ready', 'interpolating', 'cancelled', 'retained-inert', ...(c.kind === 'keepalive' ? ['reactivated-settled', 'listener-restored'] : []), 'final-unmounted'];
    assert.deepEqual(c.samples.map(s => s.phase), phases);
    checkIndexBarTimeline(c, ego);
    assert.equal(p.ready.nodes, 1); assert.equal(p.ready.writes, 0); assert.deepEqual(p.ready.changes, []);
    assert.equal(p['final-unmounted'].nodes, 0);
    assert.deepEqual(c.events.map(e => e.value), p['final-unmounted'].changes);
    c.events.forEach(e => { assert.equal(e.event, 'change'); assert.ok(e.time >= p.ready.time && e.time <= p['final-unmounted'].time); });
    if (c.kind === 'replacement') {
      assert.deepEqual(p['latest-settled'].changes, ['C']); assert.equal(p['latest-settled'].writes, 1);
      assert.equal(p['latest-settled'].active, 'C'); assert.ok(p['latest-settled'].top > 400);
    } else if (c.kind === 'settlement') {
      assert.deepEqual(p['first-settlement-frame'].changes, ['A', 'B']); assert.equal(p['first-settlement-frame'].active, 'B');
      assert.deepEqual(p['settlement-complete'].changes, ['A', 'B', 'C']); assert.equal(p['settlement-complete'].active, 'C');
      assert.equal(p['settlement-complete'].writes, 2); assert.ok(p['settlement-complete'].time > p['first-settlement-frame'].time);
    } else {
      assert.ok(p.interpolating.writes > 0); assert.ok(p.interpolating.top > 0 && p.interpolating.top < 400, 'real interpolation required');
      assert.ok(p.interpolating.time - p.ready.time >= 100);
      assert.deepEqual(p.cancelled.changes, ['C']); assert.equal(p.cancelled.nodes, 0);
      assert.equal(p['retained-inert'].writes, p.cancelled.writes, 'writes after cancellation');
      assert.equal(p['retained-inert'].top, p.cancelled.top); assert.equal(p['retained-inert'].nodes, 0);
      assert.deepEqual(p['retained-inert'].changes, p.cancelled.changes, 'retained command notified');
      assert.ok(p['retained-inert'].time - p.cancelled.time >= (c.kind === 'unmount' ? 650 : 200), 'observation too short');
      if (c.kind === 'keepalive') {
        assert.equal(p['reactivated-settled'].nodes, 1); assert.equal(p['reactivated-settled'].active, 'C');
        assert.ok(p['reactivated-settled'].top > 400, 'active restoration missing');
        assert.ok(p['reactivated-settled'].writes > p.cancelled.writes);
        assert.deepEqual(p['reactivated-settled'].changes, ['C'], 'restore must keep event:false');
        assert.deepEqual(p['listener-restored'].changes, ['C', 'A']); assert.equal(p['listener-restored'].active, 'A');
        assert.equal(p['listener-restored'].nodes, 1); assert.ok(p['listener-restored'].top < 10);
      }
    }
  }
  if (ego) assert.deepEqual(rawCases, r.cases, 'case data differs from raw capture');
  return { accepted: 4, os: 0, blocked: 144 };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) console.log(checkIndexBarEvidence(readEvidence()));
