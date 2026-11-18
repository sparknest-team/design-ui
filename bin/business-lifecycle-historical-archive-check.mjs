import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { checkBusinessEvidence, readEvidence } from './business-lifecycle-evidence-check.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const liveFixture = resolve(root, 'refactors/token-validation/browser/business-lifecycle-main.js');
const archivedFixture = resolve(root, 'audits/evidence/business-native-lifecycle-2026-10-13/frozen-fixture.js');

/** Verify the historical record against its original fixture, without treating it as current-source evidence. */
export function checkArchivedBusinessEvidence(report, read = readFileSync) {
  return checkBusinessEvidence(report, path => read(path === liveFixture ? archivedFixture : path));
}

/** Compare fixture text only; equality does not certify behavior on current sources. */
export function compareCurrentFixtureWithArchive(archived, current) {
  const oldMount = "]) }).mount('#app')";
  if (archived.split(oldMount).length !== 2) return false;
  const migrated = archived
    .replaceAll('/cedar-design-web/packages/cedar-ui/', '/cedar-design-web/packages/ui/')
    .replaceAll('/maple-design-mobile/packages/maple-ui/', '/maple-design-mobile/packages/ui/')
    .replace(oldMount, "]) })\napp.mount('#app')");
  return migrated === current;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(checkArchivedBusinessEvidence(readEvidence()));
  console.log('Only package-path migration and teardown fix in fixture:', compareCurrentFixtureWithArchive(readFileSync(archivedFixture, 'utf8'), readFileSync(liveFixture, 'utf8')));
  console.log('Historical fixture and screenshot verified; current source and current timing remain separate checks.');
}
