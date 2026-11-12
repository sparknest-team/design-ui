import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkScrollEvidence, readEvidence } from './shared-scroll-native-evidence-check.mjs';
const positive = () => structuredClone(readEvidence());
test('eight Ego Lite scroll records, sources, fixtures and screenshot pass', () => assert.deepEqual(checkScrollEvidence(positive()), { accepted: 8, os: 0, blocked: 144 }));
for (const [name, mutate] of [
  ['missing case', r => r.cases.pop()],
  ['duplicate case', r => r.cases[1] = structuredClone(r.cases[0])],
  ['host iframe RAF', r => r.cases[2].hostRequests = 1],
  ['false iframe identity', r => r.cases[2].sameOriginIframe = false],
  ['wrong Window identity', r => r.cases[3].targetWindow = false],
  ['zero queued RAF', r => r.cases[1].ownerRequests = 1],
  ['zero not immediate', r => r.cases[1].immediate.top = 0],
  ['premature completion', r => r.cases[0].elapsed = 290],
  ['missing interpolation', r => r.cases[0].frameExcerpts[1].top = 220],
  ['frame count drift', r => r.cases[0].frameCount = 1],
  ['unstable position', r => r.cases[0].stable.top = 200],
  ['residual targets', r => r.cases[0].finalTargets = 1],
  ['OS claim', r => r.newOsCases = 1],
  ['simulated RAF claim', r => r.input = 'fake clock'],
  ['changed source', r => r.helperSources[0].sha256 = 'changed'],
  ['changed fixture', r => r.fixture.sha256 = 'changed'],
  ['changed image', r => r.screenshot.sha256 = 'changed'],
  ['changed host fixture', r => r.fixture.hostSha256 = 'changed'],
  ['console warning', r => r.consoleWarningsErrors.push({ kind: 'warn', text: 'warning' })],
  ['bad browser', r => r.browserUserAgent = 'unknown'],
  ['invalid unsampled frame', r => r.cases[0].frames[1].top = 999],
  ['raw capture drift', r => r.raw.sha256 = 'changed'],
]) test(`rejects ${name}`, () => { const r = positive(); mutate(r); assert.throws(() => checkScrollEvidence(r)); });
