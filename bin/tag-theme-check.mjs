import { reportContrast } from './contrast-report.mjs';
// Compiled Tag cascade and contrast regression.
import assert from "node:assert/strict";
import { auditThemes, rgba, over, luminance } from "./theme-audit-utils.mjs";

let pairs = 0;
let states = 0;
let minimum = Infinity;
let presetStates = 0;
let presetOverrides = 0;
let presetPairs = 0;
let presetMinimum = Infinity;
const statuses = [
  "default",
  "primary",
  "secondary",
  "tertiary",
  "info",
  "success",
  "warning",
  "danger",
];
await auditThemes(
  "tag",
  ({ repo, prefix, brand, mode, tag, variables, expand, cascade }) => {
    for (const color of ['red', 'orangered', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'brand', 'purple', 'pinkpurple', 'magenta', 'gray'])
      for (const variant of ['default', 'outline'])
        for (const checked of [false, true])
          for (const hover of [false, true])
            for (const loading of [false, true]) {
              tag.className = [`${prefix}-tag`, `${prefix}-tag--${color}`, `${prefix}-tag--variant-${variant}`, `${prefix}-tag--checkable`, checked && `${prefix}-tag--checked`, loading && `${prefix}-tag--loading`, hover && 'audit-hover'].filter(Boolean).join(' ');
              const style = cascade(tag);
              const key = `--${prefix}-tag-${color}-bg${hover && !loading ? '-hover' : ''}`;
              const expected = checked && variant === 'default' ? `var(${key})` : !checked && hover && !loading ? `var(--${prefix}-tag-bg-not-checked-hover)` : 'transparent';
              const label = `${repo}/${brand}/${mode}/${color}/${variant}/${checked}/${hover}/${loading}`;
              assert.equal(expand(style['background-color'] ?? 'transparent'), expand(expected), label);
              if (checked) assert.equal(expand(style.color), expand(`var(--${prefix}-tag-${color}-text-color)`), label);
              if (checked && variant === 'outline') assert.equal(style['border-color'], `var(--${prefix}-tag-${color}-text-color)`, label);
              if (checked && !loading) {
                for (const surface of ['page', 'default', 'raised', 'overlay', 'muted']) {
                  const backdrop = over(rgba(expand(`var(--${prefix}-sys-color-surface-${surface})`)), rgba(expand(`var(--${prefix}-sys-color-surface-page)`)));
                  const bg = over(rgba(expand(style['background-color'] ?? 'transparent')), backdrop);
                  const fg = over(rgba(expand(style.color)), bg);
                  const a = luminance(fg), b = luminance(bg);
                  const ratio = (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
                  reportContrast(ratio, 4.5, `${label}/${surface}: ${ratio} < 4.5`);
                  presetMinimum = Math.min(presetMinimum, ratio); presetPairs++;
                }
              }
              if (checked && variant === 'default') {
                const old = variables[key]; variables[key] = '#123456';
                assert.equal(expand(style['background-color']), '#123456', label);
                variables[key] = old; presetOverrides++;
              }
              presetStates++;
            }
    for (const status of statuses)
      for (const variant of ["default", "outline"]) {
        for (const checked of [false, true])
          for (const hover of [false, true])
            for (const loading of [false, true]) {
              tag.className = [
                `${prefix}-tag`,
                `${prefix}-tag--checkable`,
                `${prefix}-tag--status-${status}`,
                `${prefix}-tag--variant-${variant}`,
                checked && `${prefix}-tag--checked`,
                hover && "audit-hover",
                loading && `${prefix}-tag--loading`,
              ]
                .filter(Boolean)
                .join(" ");
              const style = cascade(tag);
              const label = `${repo}/${brand}/${mode}/${status}/${variant}/checked=${checked}/hover=${hover}/loading=${loading}`;
              const expectedColor = !checked
                ? `--${prefix}-tag-${variant === "outline" ? "variant-outline-default-color" : "default-text-color"}`
                : status === "default"
                  ? `--${prefix}-tag-${variant === "outline" ? "variant-outline-default-color" : "default-text-color"}`
                  : `--${prefix}-tag-${variant === "outline" ? `variant-outline-status-${status}-color` : `status-${status}-text-color`}`;
              assert.equal(
                expand(style.color),
                expand(variables[expectedColor]),
                label,
              );
              const expectedBackground =
                checked && variant === "default"
                  ? `var(--${prefix}-tag-${status === "default" ? (hover && !loading ? "default-bg-hover" : "default-bg") : `status-${status}-bg-color`})`
                  : hover && !loading && !checked
                    ? `var(--${prefix}-tag-bg-not-checked-hover)`
                    : "transparent";
              assert.equal(
                expand(style["background-color"] ?? "transparent"),
                expand(expectedBackground),
                label,
              );
              states++;
              if (!checked || hover || loading) continue;
              for (const surface of [
                "page",
                "default",
                "raised",
                "overlay",
                "muted",
              ]) {
                const page = rgba(
                  expand(variables[`--${prefix}-sys-color-surface-page`]),
                );
                const backdrop = over(
                  rgba(
                    expand(
                      variables[`--${prefix}-sys-color-surface-${surface}`],
                    ),
                  ),
                  page,
                );
                const bg = over(
                  rgba(expand(style["background-color"] ?? "transparent")),
                  backdrop,
                );
                const fg = over(rgba(expand(style.color)), bg);
                const a = luminance(fg),
                  b = luminance(bg);
                const contrast =
                  (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
                reportContrast(contrast, 4.5, `${label}/${surface}: ${contrast.toFixed(3)} < 4.5`);
                minimum = Math.min(minimum, contrast);
                pairs++;
              }
            }
      }
  },
);
console.log(
  `Tag themes passed: ${states} cascade states, ${pairs} contrast pairs; minimum ${minimum.toFixed(3)}:1. Preset/custom colors and loading opacity are excluded.`,
);
console.log(`Tag presets passed: ${presetStates} states, ${presetOverrides} background overrides, ${presetPairs} contrast pairs; minimum ${presetMinimum.toFixed(3)}:1. Custom colors and loading opacity excluded.`);
