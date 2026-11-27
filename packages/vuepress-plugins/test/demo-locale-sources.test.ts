import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { readSource } from "../src/node/parse/readSource";

describe("shared demo source dependencies", () => {
  it("includes locale dictionaries through an English wrapper, deduplicates cycles and stops at library code", () => {
    const root = mkdtempSync(join(tmpdir(), "demo-locale-sources-"));
    const files = {
      "__demos__/en-US/example.vue":
        '<script setup>\nimport Demo from "../example.vue"\n</script>',
      "__demos__/example.vue":
        '<script setup>\nimport { copy } from "./locale"\nimport Library from "../library"\n</script>',
      "__demos__/locale/index.ts":
        'import zh from "./zh-cn"\nimport en from "./en-us"\nexport const copy = { zh, en }',
      "__demos__/locale/zh-cn.ts": 'export default { title: "中文" }',
      "__demos__/locale/en-us.ts":
        'import zh from "./zh-cn"\nimport { copy } from "./index"\nexport default { title: "English" }',
      "library.ts":
        'import internal from "./internal"\nexport default internal',
      "internal.ts": "export default {}",
    };
    try {
      for (const [name, source] of Object.entries(files)) {
        const file = join(root, name);
        mkdirSync(join(file, ".."), { recursive: true });
        writeFileSync(file, source);
      }
      const sources = readSource(
        join(root, "__demos__/en-US/example.vue"),
        true,
        true,
        true,
      );
      expect(sources.map((source) => relative(root, source.filePath))).toEqual([
        "__demos__/en-US/example.vue",
        "__demos__/example.vue",
        "__demos__/locale/index.ts",
        "__demos__/locale/zh-cn.ts",
        "__demos__/locale/en-us.ts",
        "library.ts",
      ]);
      expect(
        sources.find((source) => source.name === "en-us.ts")?.rawCode,
      ).toContain("English");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
