// Source candidates only: a nearby media query does not prove selector coverage.
import { readdirSync, readFileSync } from "node:fs";
import { resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
const workspace = fileURLToPath(new URL("../../", import.meta.url));
const excluded =
  /(?:^|\/)(?:__tests__|__demos__|example|examples|docs|node_modules|__snapshots__)(?:\/|$)/;
const files = (root) =>
  readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const file = resolve(root, entry.name);
    if (excluded.test(file)) return [];
    return entry.isDirectory() ? files(file) : [file];
  });
export function scanMotionSource(file, source) {
  const lines = source.split("\n"),
    css = [],
    runtime = [];
  lines.forEach((line, index) => {
    if (
      file.endsWith(".less") &&
      /^\s*(?:animation|transition)(?:-[\w-]+)?\s*:/.test(line)
    )
      css.push(index + 1);
    if (
      !file.endsWith(".less") &&
      /(?:requestAnimationFrame|setTimeout|setInterval|scrollIntoView|scrollTo)(?:\?\.)?\(|matchMedia(?:\?\.)?\([^\n]*prefers-reduced-motion/.test(
        line,
      )
    )
      runtime.push(index + 1);
  });
  return {
    css,
    runtime,
    hasLocalReducedQuery: lines.some((line) =>
      line.includes("prefers-reduced-motion"),
    ),
  };
}
export function collectMotionInventory() {
  const platforms = [];
  for (const [repo, pkg] of [
    ["cedar-design-web", "ui"],
    ["maple-design-mobile", "ui"],
  ]) {
    const root = resolve(workspace, repo, "packages", pkg, "src");
    const candidates = [];
    for (const file of files(root).sort()) {
      if (!/\.(less|ts|tsx|vue)$/.test(file)) continue;
      const scanned = scanMotionSource(file, readFileSync(file, "utf8"));
      if (scanned.css.length || scanned.runtime.length)
        candidates.push({ file: relative(root, file), ...scanned });
    }
    platforms.push({
      repo,
      files: candidates.length,
      cssDeclarationCandidates: candidates.reduce(
        (n, row) => n + row.css.length,
        0,
      ),
      runtimeCallCandidates: candidates.reduce(
        (n, row) => n + row.runtime.length,
        0,
      ),
      candidates,
    });
  }
  return {
    scope:
      "source candidates including timeout scheduling; line-based hints, not defects or proof of selector reachability, OS, browser or whole-library motion acceptance",
    platforms,
  };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const report = collectMotionInventory();
  if (process.argv.includes("--check")) {
    const saved = JSON.parse(
      readFileSync(
        new URL("../audits/motion-source-inventory.json", import.meta.url),
      ),
    );
    assert.deepEqual(
      report,
      saved,
      "motion source inventory drift: inspect changes and refresh evidence",
    );
    console.log(
      `Motion source inventory matches: ${report.platforms.reduce((n, p) => n + p.files, 0)} files. Candidate inventory, not reduced-motion acceptance.`,
    );
  } else console.log(JSON.stringify(report, null, 2));
}
