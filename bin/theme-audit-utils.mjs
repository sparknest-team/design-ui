import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const workspace = fileURLToPath(new URL("../../", import.meta.url));
// This cross-repository audit uses the installed workspace tooling, not bundled dependencies.
const cedarTools = createRequire(
  resolve(workspace, "cedar-design-web/packages/cedar-ui/package.json"),
);
const postcss = cedarTools("postcss");
const specificity = (selector) => {
  const flat = selector.replace(/:where\([^()]*\)/g, "").replace(/:not\(([^()]*)\)/g, "$1");
  return (
    (flat.match(/#[\w-]+/g)?.length ?? 0) * 10000 +
    (flat.match(/\.[\w-]+|\[[^\]]+\]|:[\w-]+/g)?.length ?? 0) * 100 +
    (flat.match(/(?:^|\s|>)\s*[a-z][\w-]*/g)?.length ?? 0)
  );
};
export const rgba = (value) => {
  if (value === "transparent") return [0, 0, 0, 0];
  if (value.startsWith("#")) {
    let hex = value.slice(1);
    if (hex.length === 3) hex = [...hex].map((c) => c + c).join("");
    assert.equal(hex.length, 6, value);
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)).concat(1);
  }
  assert.match(value, /^rgba?\(/);
  const parts = value.match(/[\d.]+/g).map(Number);
  return parts.length === 3 ? [...parts, 1] : parts;
};
export const over = (fg, bg) =>
  fg
    .slice(0, 3)
    .map((v, i) => v * fg[3] + bg[i] * (1 - fg[3]))
    .concat(1);
export const luminance = (rgb) =>
  rgb.slice(0, 3).reduce((sum, value, i) => {
    const v = value / 255;
    return (
      sum +
      (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4) *
        [0.2126, 0.7152, 0.0722][i]
    );
  }, 0);

export async function auditThemes(
  component,
  inspect,
  {
    importsAfter = [],
    platforms = ["c", "mp"],
    themeFileName = component,
    tokenImports = [],
    darkThemeFiles = [],
    pointerMode = null,
    reducedMotion = false,
  } = {},
) {
  for (const [repo, pkg, prefix, themeAttr] of [
    ["cedar-design-web", "cedar-ui", "c", "cedar-theme"],
    ["maple-design-mobile", "maple-ui", "mp", "maple-theme"],
  ]) {
    if (!platforms.includes(prefix)) continue;
    const root = resolve(workspace, repo, "packages", pkg);
    const require = createRequire(resolve(root, "package.json"));
    const less =
      prefix === "c"
        ? require("less")
        : createRequire(
            resolve(workspace, repo, "packages/maple-cli/package.json"),
          )("less");
    const { JSDOM } = require("jsdom");
    const source = resolve(root, "src");
    const { css } = await less.render(
      [
        '@import "style/theme/css-variables.less";',
        '@import "style/theme/system.less";',
        ...tokenImports.map(name => `@import "${name}";`),
        ...(component === "button"
          ? ['@import "hover/style/index.less";']
          : []),
        `@import "${component}/style/index.less";`,
        ...(typeof importsAfter === "function"
          ? importsAfter(prefix)
          : importsAfter
        ).map((name) => `@import "${name}/style/index.less";`),
      ].join("\n"),
      { paths: [source], javascriptEnabled: true },
    );
    const rules = [];
    postcss.parse(css).walkRules((rule) => {
      // Only motion and geometry rules are excluded from steady-state color checks.
      const reducedMedia = rule.parent.type === 'atrule' && rule.parent.name === 'media' && rule.parent.params === '(prefers-reduced-motion: reduce)';
      if (
        rule.parent.type === "atrule" &&
        (rule.parent.name === "keyframes" ||
          (reducedMedia && !reducedMotion))
      ) {
        rule.walkDecls((decl) =>
          assert.ok(
            /^(animation(?:-.+)?|transition(?:-.+)?|transform|opacity|width|height|--(?:c|mp)-field-hint-duration)$/.test(
              decl.prop,
            ),
            `Unaudited conditional property: ${decl.prop}`,
          ),
        );
        return;
      }
      const pointerMedia = rule.parent.type === 'atrule' && rule.parent.name === 'media' && ['(hover: hover) and (pointer: fine)', '(hover: hover)', '(pointer: coarse)', '(hover: none)'].includes(rule.parent.params);
      if (pointerMedia && pointerMode) {
        const matches = pointerMode === 'fine' ? ['(hover: hover) and (pointer: fine)', '(hover: hover)'].includes(rule.parent.params) : ['(pointer: coarse)', '(hover: none)'].includes(rule.parent.params);
        if (!matches) return;
      }
      assert.equal(
        reducedMedia || pointerMedia && pointerMode ? 'root' : rule.parent.type,
        "root",
        "Extend the audit before adding conditional component rules",
      );
      for (const selector of rule.selectors)
        rules.push({
          selector: selector
            // Equivalent form avoids nwsapi's nested :not(:nth-child()) parser bug.
            .replaceAll(":not(:nth-child(1))", ":nth-child(n+2)")
            .replaceAll(":hover", ".audit-hover")
            .replaceAll(":active", ".audit-active")
            .replaceAll(":focus-visible", ".audit-focus-visible"),
          weight: specificity(selector),
          declarations: rule.nodes.filter((node) => node.type === "decl"),
        });
    });
    for (const brand of ["default", "maple"])
      for (const mode of ["light", "dark"]) {
        const dom = new JSDOM("<html><body><span></span></body></html>");
        const document = dom.window.document;
        document.documentElement.setAttribute(themeAttr, mode);
        const tag = document.querySelector("span");
        const cascade = (element, pseudo = '') => {
          const result = new Map();
          for (const rule of rules)
            if ((pseudo ? rule.selector.endsWith(pseudo) : !rule.selector.includes('::')) && element.matches(pseudo ? rule.selector.slice(0, -pseudo.length) : rule.selector)) {
              for (const decl of rule.declarations) {
                const weight = rule.weight + (decl.important ? 1000000 : 0);
                if (
                  !result.has(decl.prop) ||
                  weight >= result.get(decl.prop).weight
                )
                  result.set(decl.prop, { value: decl.value, weight });
              }
            }
          return Object.fromEntries(
            [...result].map(([key, entry]) => [key, entry.value]),
          );
        };
        const variables = cascade(document.documentElement);
        const themeFiles =
          mode === "dark" ? ["themes/dark/index.ts"] : ["themes/index.ts"];
        if (mode === "dark" && prefix === "mp" && component !== "trigger" && themeFileName !== null)
          themeFiles.push(`themes/dark/${themeFileName}.ts`);
        if (mode === "dark" && prefix === "mp") themeFiles.push(...darkThemeFiles);
        if (brand === "maple") themeFiles.push(`themes/maple-${mode}/index.ts`);
        for (const file of themeFiles) {
          const theme = readFileSync(resolve(source, file), "utf8");
          for (const match of theme.matchAll(
            /['"](--[^'"]+)['"]:\s*['"]([^'"]+)['"]/g,
          ))
            variables[match[1]] = match[2];
        }
        const expand = (value, depth = 0) => {
          assert.ok(
            value !== undefined && depth < 30,
            `Unresolved variable: ${value}`,
          );
          return value.replace(/var\((--[\w-]+)\)/g, (_, key) =>
            expand(variables[key], depth + 1),
          );
        };
        try {
          await inspect({
            repo,
            prefix,
            brand,
            mode,
            document,
            tag,
            variables,
            expand,
            cascade,
          });
        } finally {
          dom.window.close();
        }
      }
  }
}
