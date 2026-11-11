import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { hasReviewableApi } from "./complete-review-demos.mjs";
import { allowsNativeDemoControl } from "./demo-native-control-policy.mjs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../../", import.meta.url));
const require = createRequire(
  path.join(root, "cedar-design-web/packages/ui/package.json"),
);
const { parse, compileScript, compileTemplate } = require("@vue/compiler-sfc");
let count = 0;
for (const platform of [
  "cedar-design-web/packages/ui",
  "maple-design-mobile/packages/ui",
]) {
  for (const filename of fs
    .readdirSync(path.join(root, platform, "src"), { recursive: true })
    .filter((file) => /\/api-review(?:-[\w-]+)?\.vue$/.test(file))) {
    const full = path.join(root, platform, "src", filename);
    const source = fs.readFileSync(full, "utf8");
    if (source.includes("ReviewSuite")) continue;
    const config = JSON.parse(
      fs.readFileSync(
        full.replace(/\.vue$/, ".config.json").replace(/api-review-main\.config/, "api-review.config"),
        "utf8",
      ),
    );
    assert(Array.isArray(config.fields), `${full}: missing public API config`);
    assert.equal(
      new Set(config.fields.map((field) => field.name)).size,
      config.fields.length,
      `${full}: duplicate fields`,
    );
    const { descriptor, errors } = parse(fs.readFileSync(full, "utf8"), {
      filename: full,
    });
    assert.deepEqual(errors, []);
    const script = compileScript(descriptor, { id: full });
    const template = compileTemplate({
      source: descriptor.template.content,
      filename: full,
      id: full,
      compilerOptions: { bindingMetadata: script.bindings },
    });
    assert.deepEqual(template.errors, [], full);
    assert(
      script.bindings.DemoApiReviewPanel,
      `${full}: missing review panel import`,
    );
    count++;
  }
}
console.log(`Validated ${count} review SFCs and API configs`);

// Demo controllers and showcase actions must use the owning component library.
// FieldDecorator's editing host is the subject of that component's contract.
const { parse: parseDom } = require("@vue/compiler-dom");
let scanned = 0;
let documentationSnippets = 0;
for (const library of [
  "cedar-design-web/packages/ui",
  "maple-design-mobile/packages/ui",
]) {
  const directory = path.join(root, library, "src");
  for (const file of fs.readdirSync(directory, { recursive: true })) {
    if (
      /\.(vue|tsx?|jsx?)$/.test(file) &&
      /\/(?:__demos__|example)\//.test("/" + file)
    ) {
      const content = fs.readFileSync(path.join(directory, file), "utf8");
      assert(
        !/\b(?:h|createVNode|createElementVNode|createElement)\s*\(\s*['"](?:button|input|select|textarea|option|datalist|progress|meter|form|details|summary)['"]/.test(
          content,
        ),
        `${path.join(directory, file)}: native control created by a render function`,
      );
    }
    if (file.endsWith(".md")) {
      const markdown = fs.readFileSync(path.join(directory, file), "utf8");
      for (const block of markdown.matchAll(
        /```(?:vue|html|demo)[^\n]*\n([\s\S]*?)```/g,
      )) {
        assert(
          !/<(?:button|input|select|textarea|option|datalist|progress|meter|form|details|summary)(?=[\s/>])/.test(
            block[1],
          ),
          `${path.join(directory, file)}: use library controls in documentation examples`,
        );
        documentationSnippets++;
      }
    }
    if (
      !file.endsWith(".vue") ||
      (!file.includes("/__demos__/") && !file.includes("/example/"))
    )
      continue;
    const filename = path.join(directory, file);
    const template = parse(fs.readFileSync(filename, "utf8"), { filename })
      .descriptor.template;
    if (!template) continue;
    function visit(node) {
      if (node.type === 1) {
        assert(
          !/^(a|el|van|n)-(button|checkbox|select|input|switch|radio|divider)$/.test(
            node.tag,
          ),
          `${filename}: use the owning library for <${node.tag}>`,
        );
        // Capture-phase delegation around a component is an event observer,
        // rather than a replacement for a button (Scheduler cell inspection).
        assert(
          !(
            node.tag === "a" ||
            (["div", "span"].includes(node.tag) &&
              node.props.some(
                (prop) =>
                  prop.type === 7 &&
                  prop.name === "on" &&
                  prop.arg?.content === "click" &&
                  !prop.modifiers.some(
                    (modifier) => (modifier.content ?? modifier) === "capture",
                  ),
              ))
          ),
          `${filename}: use Link or Button for interactive <${node.tag}>`,
        );
      }
      if (node.type === 1 && node.tag === "component") {
        const tag =
          node.props.find((prop) => prop.type === 6 && prop.name === "is")
            ?.value?.content ??
          node.props
            .find(
              (prop) =>
                prop.type === 7 &&
                prop.name === "bind" &&
                prop.arg?.content === "is",
            )
            ?.exp?.content?.replace(/^['"]|['"]$/g, "");
        assert(
          ![
            "button",
            "input",
            "select",
            "textarea",
            "details",
            "summary",
          "option",
          "datalist",
          "progress",
          "meter",
          "form",
          ].includes(tag),
          `${filename}: native component is=${tag}`,
        );
      }
      if (
        node.type === 1 &&
        [
          "button",
          "input",
          "select",
          "textarea",
          "details",
          "summary",
          "option",
          "datalist",
          "progress",
          "meter",
          "form",
        ].includes(node.tag)
      ) {
        assert(
          allowsNativeDemoControl(path.relative(root, filename).split(path.sep).join("/"), node.tag) ||
          node.tag === "input" &&
            file.startsWith("field-decorator/") &&
            ["review-fixture.vue", "api-review.vue"].includes(
              path.basename(file),
            ),
          `${filename}: use a library component for <${node.tag}>`,
        );
      }
      for (const child of node.children ?? []) visit(child);
    }
    visit(parseDom(template.content));
    scanned++;
  }
}
const panelTemplate = parse(
  fs.readFileSync(
    path.join(root, "design-ui/packages/ui-doc-preview/src/ReviewPanel.vue"),
    "utf8",
  ),
).descriptor.template.content;
assert(
  !/<(?:button|input|select|textarea|option|datalist|progress|meter|form|details|summary)\b/.test(panelTemplate),
  "ReviewPanel must use injected library controls",
);
console.log(
  `Validated component controls in ${scanned} demo SFCs, ${documentationSnippets} documentation snippets and the shared panel`,
);
