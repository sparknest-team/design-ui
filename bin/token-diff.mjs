#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const sides = [
  {
    name: "cedar",
    root: join(root, "cedar-design-web/packages/cedar-ui/src"),
    prefix: "--c-",
  },
  {
    name: "maple",
    root: join(root, "maple-design-mobile/packages/maple-ui/src"),
    prefix: "--mp-",
  },
];

function walk(path) {
  return readdirSync(path).flatMap((name) => {
    const child = join(path, name);
    if (name === "node_modules" || name === "site" || name === "dist")
      return [];
    return statSync(child).isDirectory()
      ? walk(child)
      : child.endsWith(".less")
        ? [child]
        : [];
  });
}

function collect(side, component) {
  const tokens = new Map();
  const scanRoot = component ? join(side.root, component) : side.root;
  const namespace = component === "field-decorator" ? "field" : component;
  for (const path of walk(scanRoot)) {
    const source = readFileSync(path, "utf8");
    for (const match of source.matchAll(
      /^\s*(--[a-z][a-z0-9-]*)\s*:\s*([^;]+);/gm,
    )) {
      if (!match[1].startsWith(side.prefix)) continue;
      const logicalName = match[1].slice(side.prefix.length);
      if (component && !logicalName.startsWith(`${namespace}-`)) continue;
      tokens.set(logicalName, {
        value: match[2].trim(),
        path: relative(side.root, path),
      });
    }
  }
  return tokens;
}

const componentIndex = process.argv.indexOf("--component");
const component = componentIndex >= 0 ? process.argv[componentIndex + 1] : undefined;
const [cedar, maple] = sides.map((side) => collect(side, component));
const namespace = component === "field-decorator" ? "field" : component;
const inScope = (token) => !component || token.startsWith(`${namespace}-`);
const cedarOnly = [...cedar.keys()]
  .filter((token) => inScope(token) && !maple.has(token))
  .sort();
const mapleOnly = [...maple.keys()]
  .filter((token) => inScope(token) && !cedar.has(token))
  .sort();
const shared = [...cedar.keys()]
  .filter((token) => inScope(token) && maple.has(token))
  .sort();

console.log(`shared logical tokens: ${shared.length}`);
console.log(`cedar-only logical tokens: ${cedarOnly.length}`);
console.log(`maple-only logical tokens: ${mapleOnly.length}`);
console.log("\nCedar-only tokens:");
console.log(cedarOnly.slice(0, component ? undefined : 40).join("\n"));
console.log("\nMaple-only tokens:");
console.log(mapleOnly.slice(0, component ? undefined : 40).join("\n"));

// Existing differences are migration debt. Strict mode is enabled after a
// checked-in allowlist is created; prefix and naming errors are already gated
// by spec-check in each source repository.
if (process.argv.includes("--strict") && (cedarOnly.length || mapleOnly.length))
  process.exit(1);
