import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { checkArchivedBusinessEvidence, compareFixtureAfterPackageMove } from './business-lifecycle-historical-archive-check.mjs';
import { readEvidence } from './business-lifecycle-evidence-check.mjs';
import { checkFirstFrameEvidence, readFirstFrameEvidence } from './business-lifecycle-first-frame-evidence-check.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const originalLine = "s.active.value = true; await nextTick(); await wait(200); snapshot('reactivated')";
const frameLine = "s.active.value = true; await nextTick(); await wait(200); await new Promise(resolve => requestAnimationFrame(resolve)); await nextTick(); snapshot('reactivated')";
const originalTitle = "InputNumber / Countdown 真实 IAB 生命周期";
const frameTitle = "InputNumber / Countdown Ego Lite 首帧诊断";

export function checkCurrentBusinessEvidence(read = readFileSync) {
  const historical = checkArchivedBusinessEvidence(readEvidence(), read);
  const original = read(resolve(root, 'audits/evidence/business-native-lifecycle-2026-10-13/frozen-fixture.js'), 'utf8');
  const current = read(resolve(root, 'refactors/token-validation/browser/business-lifecycle-main.js'), 'utf8');
  const frame = read(resolve(root, 'refactors/token-validation/browser/business-lifecycle-first-frame-diagnostic.js'), 'utf8');
  assert.ok(compareFixtureAfterPackageMove(original, current), 'current fixture differs from archived fixture beyond package paths');
  assert.equal(current.split(originalLine).length, 2, 'expected a single original reactivation boundary');
  assert.equal(current.split(originalTitle).length, 2, 'expected a single original title');
  assert.equal(frame, current.replace(originalLine, frameLine).replace(originalTitle, frameTitle), 'first-frame fixture differs beyond the documented observation boundary and title');
  const currentEvidence = checkFirstFrameEvidence(readFirstFrameEvidence(), read);
  return { historical, currentEvidence };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(checkCurrentBusinessEvidence());
  console.log('Historical 200ms fixture verified separately; current-source Ego evidence observes the first animation frame, not a 200ms guarantee. No OS or native long-press certification.');
}
