import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const workspace = fileURLToPath(new URL("../../", import.meta.url));
for (const repo of [
  "cedar-design-web/packages/ui",
  "maple-design-mobile/packages/ui",
]) {
  const root = resolve(workspace, repo);
  const require = createRequire(resolve(root, "package.json"));
  const { createSSRApp, h } = require("vue");
  const { renderToString } = require("@vue/server-renderer");
  for (const name of ["carousel", "upload"]) {
    // Deliberately run in Node without DOM globals or a CSS loader.
    const entries = [
      await import(pathToFileURL(resolve(root, "es", name, "index.mjs")).href),
      require(resolve(root, "lib", name, "index.js")),
    ];
    for (const entry of entries) {
      assert.ok(entry.default, name + " default export");
      if (name === "carousel")
        assert.ok(entry.CarouselItem, "CarouselItem export");
      if (name === "upload")
        assert.equal(
          typeof entry.useUploader,
          "function",
          "public upload composable",
        );
      const renderInstance = () =>
        name === "carousel"
          ? h(
              entry.default,
              { defaultValue: 0, autoPlay: false, slidesPerView: 2 },
              {
                default: () => [
                  h(
                    entry.CarouselItem,
                    { key: "first" },
                    { default: () => "First slide" },
                  ),
                  h(
                    entry.CarouselItem,
                    { key: "second" },
                    { default: () => "Second slide" },
                  ),
                ],
              },
            )
          : h(entry.default, {
              modelValue: [
                {
                  uid: "server-file",
                  name: "accepted-file.txt",
                  status: "success",
                  percent: 100,
                },
              ],
              readonly: true,
              listType: "text",
            });
      const html = await renderToString(
        createSSRApp({
          render: () => h("section", [renderInstance(), renderInstance()]),
        }),
      );
      assert.ok(
        !html.includes("NaN") && !html.includes("[object Object]"),
        name + " serialized values",
      );
      const text = name === "carousel" ? "First slide" : "accepted-file.txt";
      assert.ok(html.includes(text), name + " server-rendered content");
      const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(
        (match) => match[1],
      );
      assert.equal(
        new Set(ids).size,
        ids.length,
        name + " independent instance IDs",
      );
    }
    console.log(
      `${repo}/${name}: bare ESM/CJS imports and two-instance SSR passed`,
    );
  }
}
