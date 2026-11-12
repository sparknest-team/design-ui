import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const workspace = resolve(root, '..');
const legacyDirectory = resolve(root, 'audits/evidence/shared-scroll-native-2026-10-13');
const egoDirectory = resolve(root, 'audits/evidence/shared-scroll-2026-11-12-ego');
const hash = data => createHash('sha256').update(data).digest('hex');
export const readEvidence = () => JSON.parse(readFileSync(resolve(egoDirectory, 'results.json'), 'utf8'));
export function checkScrollEvidence(r, read = readFileSync) {
  const ego = r.mode === 'ego-lite';
  const directory = ego ? egoDirectory : legacyDirectory;
  let rawCases;
  if (ego) {
    assert.match(r.browserUserAgent, /Chrome\//);
    assert.equal(r.fixture.hostFile, 'refactors/token-validation/browser/scroll-execution-ego.html');
    assert.equal(hash(read(resolve(root, r.fixture.hostFile))), r.fixture.hostSha256, 'host fixture drift');
    assert.equal(r.raw.file, 'raw.json');
    const rawBytes = read(resolve(directory, r.raw.file));
    assert.equal(hash(rawBytes), r.raw.sha256, 'raw evidence drift');
    const raw = JSON.parse(rawBytes);
    assert.deepEqual(raw.hashesBefore, raw.hashesAfter, 'sources changed during capture');
    assert.equal(raw.userAgent, r.browserUserAgent);
    assert.deepEqual(raw.diagnostics, r.consoleWarningsErrors);
    assert.equal(raw.screenshotSha256, r.screenshot.sha256);
    assert.equal(raw.run.busy, false);
    rawCases = raw.run.results.map(({ frames, ...c }) => ({
      ...c, frames, frameCount: frames.length,
      frameExcerpts: frames.length ? [frames[0], frames[Math.floor(frames.length / 2)], frames.at(-1)] : [],
    }));
    assert.equal(raw.hashesBefore['design-ui/' + r.fixture.file], r.fixture.sha256);
    assert.equal(raw.hashesBefore['design-ui/' + r.fixture.hostFile], r.fixture.hostSha256);
    for (const s of r.helperSources) assert.equal(raw.hashesBefore[`${s.repo}/packages/ui/src/${s.file}`], s.sha256);
  } else {
    assert.equal(r.mode, undefined);
  }
  assert.equal(r.newAcceptedCases, 8); assert.equal(r.newOsCases, 0, 'OS not certified'); assert.equal(r.blockedNativeCases, 144);
  assert.equal(r.input, 'native fixture-entry clicks; fixture-owned forwarding wrappers delegate unchanged to native RAF', 'native RAF must not be simulated');
  assert.equal(r.fixture.file, 'refactors/token-validation/browser/scroll-execution-main.js'); assert.equal(r.fixture.frozen, true);
  assert.equal(hash(read(resolve(root, r.fixture.file))), r.fixture.sha256, 'fixture drift');
  assert.deepEqual(r.helperSources.map(s => [s.repo, s.file]), [['cedar-design-web', '_utils/maple/elements.ts'], ['maple-design-mobile', 'utils/elements.ts']]);
  for (const source of r.helperSources) {
    const pkg = 'ui';
    assert.equal(hash(read(resolve(workspace, source.repo, 'packages', pkg, 'src', source.file))), source.sha256, 'helper source drift');
  }
  assert.deepEqual(r.consoleWarningsErrors, []);
  assert.equal(r.screenshot.file, ego ? 'native.png' : 'native.jpg'); assert.equal(r.screenshot.viewed, true);
  const screenshot = read(resolve(directory, r.screenshot.file));
  assert.equal(screenshot.length, r.screenshot.bytes); assert.equal(hash(screenshot), r.screenshot.sha256, 'image drift');
  if (ego) {
    for (const c of r.cases) {
      assert.equal(c.frames.length, c.frameCount, 'full frame count drift');
      for (const frame of c.frames) {
        assert.ok(Math.abs(frame.top - Math.min(frame.time / c.duration, 1) * 220) <= 1.5, 'full-frame vertical interpolation');
        assert.ok(Math.abs(frame.left - Math.min(frame.time / c.duration, 1) * 80) <= 1.5, 'full-frame horizontal interpolation');
      }
    }
  }
  const result = checkScrollCases(r.cases);
  if (ego) assert.deepEqual(rawCases, r.cases, 'case data differs from raw capture');
  return result;
}
export function checkScrollCases(cases) {
  const kinds = ['main-default', 'main-zero', 'iframe-element', 'iframe-window'];
  assert.deepEqual(cases.map(c => [c.name, c.kind]), ['Cedar', 'Maple'].flatMap(name => kinds.map(kind => [name, kind])), 'eight unique cases required');
  for (const c of cases) {
    assert.equal(c.passed, true); assert.equal(c.finalTargets, 0, 'residual targets');
    assert.equal(c.reducedQueryObserved, false, 'this suite observed no reduce, not OS switching');
    assert.equal(c.sameOriginIframe, c.kind.startsWith('iframe'));
    assert.equal(c.targetWindow, c.kind === 'iframe-window');
    assert.equal(c.hostRequests, 0, 'host RAF borrowed');
    assert.deepEqual(c.final, { left: 80, top: 220 }); assert.deepEqual(c.stable, c.final, 'unstable final position');
    assert.ok(Number.isFinite(c.elapsed) && c.elapsed >= 0);
    if (c.kind === 'main-zero') {
      assert.equal(c.duration, 0); assert.equal(c.ownerRequests, 0); assert.equal(c.immediateOwnerRequests, 0); assert.equal(c.frameCount, 0);
      assert.deepEqual(c.frameExcerpts, []); assert.deepEqual(c.immediate, c.final, 'zero must target immediately');
    } else {
      assert.equal(c.duration, 300); assert.ok(c.elapsed >= 298, 'premature completion');
      assert.equal(c.immediateOwnerRequests, 1); assert.deepEqual(c.immediate, { left: 0, top: 0 });
      assert.ok(Number.isInteger(c.ownerRequests) && c.ownerRequests >= 2); assert.equal(c.frameCount, c.ownerRequests);
      assert.equal(c.frameExcerpts.length, 3);
      c.frameExcerpts.forEach((f, i) => {
        assert.ok(Number.isFinite(f.time) && f.time >= 0 && f.time <= c.elapsed + 0.2);
        if (i) assert.ok(f.time > c.frameExcerpts[i - 1].time);
        assert.ok(Math.abs(f.top - Math.min(f.time / 300, 1) * 220) <= 1.5, 'not native linear interpolation');
        assert.ok(Math.abs(f.left - Math.min(f.time / 300, 1) * 80) <= 1.5);
      });
      const middle = c.frameExcerpts[1];
      assert.ok(middle.top > 0 && middle.top < 220 && middle.left > 0 && middle.left < 80, 'missing intermediate coordinates');
      assert.equal(c.frameExcerpts[2].top, 220); assert.equal(c.frameExcerpts[2].left, 80);
    }
  }
  return { accepted: 8, os: 0, blocked: 144 };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(checkScrollEvidence(readEvidence()));
  console.log('Ego Lite scroll/iframe/forwarded native RAF only; no consumer cancellation, OS or full-frame pixel certification.');
}
