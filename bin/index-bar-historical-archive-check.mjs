import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { checkIndexBarEvidence, readEvidence } from './index-bar-lifecycle-evidence-check.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const archive = resolve(root, 'audits/evidence/index-bar-lifecycle-2026-10-14');
const remap = new Map([
  [resolve(root, 'refactors/token-validation/browser/index-bar-lifecycle-main.js'), resolve(archive, 'frozen-fixture.js')],
  [resolve(root, '../maple-design-mobile/packages/ui/src/index-bar/IndexBar.vue'), resolve(archive, 'frozen-IndexBar.vue')],
  [resolve(root, '../maple-design-mobile/packages/ui/src/index-bar/scroll-task.ts'), resolve(archive, 'frozen-scroll-task.ts')],
]);

export function checkArchivedIndexBarEvidence(report, read = readFileSync) {
  return checkIndexBarEvidence(report, path => read(remap.get(path) ?? path));
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(checkArchivedIndexBarEvidence(readEvidence()));
  console.log('Historical 600ms evidence verified against archived fixture and sources; this does not validate current source.');
}
