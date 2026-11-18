import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkArchivedBusinessEvidence, compareCurrentFixtureWithArchive } from './business-lifecycle-historical-archive-check.mjs';
import { readEvidence } from './business-lifecycle-evidence-check.mjs';

test('historical snapshot and image match the historical evidence', () => {
  assert.deepEqual(checkArchivedBusinessEvidence(readEvidence()), { accepted: 4, os: 0, blocked: 144 });
});

test('rejects a changed archived fixture', () => {
  assert.throws(() => checkArchivedBusinessEvidence(readEvidence(), path =>
    path.endsWith('frozen-fixture.js') ? Buffer.from('changed') : readFileSync(path)));
});

test('current fixture differs from archived fixture only by package paths and teardown fix', () => {
  const archived = readFileSync(new URL('../audits/evidence/business-native-lifecycle-2026-10-13/frozen-fixture.js', import.meta.url), 'utf8');
  const current = readFileSync(new URL('../refactors/token-validation/browser/business-lifecycle-main.js', import.meta.url), 'utf8');
  assert.equal(compareCurrentFixtureWithArchive(archived, current), true);
  assert.equal(compareCurrentFixtureWithArchive(archived, current.replace('await wait(200)', 'await wait(201)')), false);
  assert.equal(compareCurrentFixtureWithArchive(archived, current.replace("]) })\napp.mount('#app')", "]) }).mount('#app')")), false);
});
