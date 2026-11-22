#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";

const args = process.argv.slice(2);
const packageArg = args[args.indexOf("--package") + 1];
const maxKbArg = args[args.indexOf("--max-kb") + 1];
const maxKb = Number(maxKbArg ?? 5000);

if (!packageArg || packageArg.startsWith("--")) {
  console.error("Usage: package-check --package <package-dir> [--max-kb 5000]");
  process.exit(2);
}

const packageRoot = resolve(process.cwd(), packageArg);
const manifestPath = join(packageRoot, "package.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
let errors = 0;
let warnings = 0;

function report(severity, message) {
  severity === "ERROR" ? errors++ : warnings++;
  console.log(`${severity} ${message}`);
}

for (const field of ["name", "version", "files", "sideEffects"]) {
  if (manifest[field] == null)
    report("ERROR", `package.json is missing ${field}`);
}
if (!manifest.types && !manifest.typings)
  report("ERROR", "package.json is missing types/typings");
if (!manifest.module) report("ERROR", "package.json is missing module entry");
if (!manifest.exports)
  report(
    "WARN ",
    "package.json has no exports map; add it before the next major release",
  );

for (const field of ["main", "module", "types", "typings", "style"]) {
  const target = manifest[field];
  if (target && !existsSync(resolve(packageRoot, target)))
    report("ERROR", `${field} target does not exist: ${target}`);
}

function walk(path) {
  if (!existsSync(path)) return [];
  if (!statSync(path).isDirectory()) return [path];
  return readdirSync(path).flatMap((name) => {
    const child = join(path, name);
    return statSync(child).isDirectory() ? walk(child) : [child];
  });
}

const includedRoots = (manifest.files ?? [])
  .map((path) => resolve(packageRoot, path))
  .filter(existsSync);
const files = includedRoots.flatMap(walk);
const packageBytes = files.reduce((sum, path) => sum + statSync(path).size, 0);
if (packageBytes > maxKb * 1024)
  report(
    "ERROR",
    `package contents are ${(packageBytes / 1024).toFixed(1)} KiB, limit is ${maxKb} KiB`,
  );

const sourceMaps = files.filter((path) => extname(path) === ".map");
const duplicateNames = new Map();
for (const path of files) {
  const key = relative(packageRoot, path).replace(/^(?:es|lib)\//, "");
  duplicateNames.set(key, (duplicateNames.get(key) ?? 0) + 1);
}

console.log(
  `Package ${manifest.name}: ${files.length} files, ${(packageBytes / 1024).toFixed(1)} KiB, ${sourceMaps.length} source maps`,
);
console.log(`${errors} errors, ${warnings} warnings`);
process.exit(errors ? 1 : 0);
