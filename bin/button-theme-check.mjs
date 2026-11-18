import { reportContrast } from './contrast-report.mjs';
import assert from "node:assert/strict";
import { auditThemes, rgba, over, luminance } from "./theme-audit-utils.mjs";

let states = 0,
  pairs = 0,
  minimum = Infinity;
await auditThemes(
  "button",
  ({
    repo,
    prefix: p,
    brand,
    mode,
    document,
    tag,
    variables,
    expand,
    cascade,
  }) => {
    const layer = document.createElement("div");
    layer.className = `${p}-hover-overlay ${p}-hover-overlay--hovering`;
    tag.append(layer);
    const contrast = (fg, bg, label) => {
      const a = luminance(fg),
        b = luminance(bg);
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      reportContrast(ratio, 4.5, `${label}: ${ratio.toFixed(3)} < 4.5`);
      minimum = Math.min(minimum, ratio);
      pairs++;
    };
    for (const status of (process.argv.includes("--primary-solid") ? ["primary"] : [
      "default",
      "primary",
      "info",
      "success",
      "warning",
      "danger",
      "secondary",
      "tertiary",
    ]))
      for (const variant of (process.argv.includes("--primary-solid") ? ["default"] : ["default", "text", "outline", "tonal"]))
          for (const blocked of (process.argv.includes("--disabled-only") ? ["disabled"] : ["", "disabled", "loading"]))
            for (const hover of [false, true])
              for (const active of [false, true])
                for (const focus of [false, true]) {
                  tag.className = [
                    `${p}-button`,
                    `${p}-button--status-${status}`,
                    `${p}-button--variant-${variant}`,
                    blocked && `${p}-button--${blocked}`,
                    hover && `${p}-button--hovering`,
                    active && "audit-active",
                    focus && `${p}-button--focus audit-focus-visible`,
                  ]
                    .filter(Boolean)
                    .join(" ");
                  const root = cascade(tag),
                    overlay = cascade(layer);
                  const label = `${repo}/${brand}/${mode}/${status}/${variant}/${blocked}/h=${hover}/a=${active}/f=${focus}`;
                  const solid = variant === "default";
                  const semantic = ['primary', 'info', 'success', 'warning', 'danger'].includes(status);
                  const plainVariant = variant === 'text' || variant === 'outline';
                  const expectedColor =
                    blocked === "disabled"
                      ? semantic
                        ? solid ? "disabled-solid-text-color" : `${status}-disabled-color`
                        : "disabled-text-color"
                      : (solid ? status === "default" ? "default-foreground-color" : status === "tertiary" ? "tertiary-text-color" : "solid-text-color" : `${status}-foreground-color`);
                  assert.equal(
                    root.color,
                    `var(--${p}-button-${expectedColor})`,
                    `${label}: public foreground consumer`,
                  );
                  assert.equal(
                    expand(root.color),
                    expand(variables[`--${p}-button-${expectedColor}`]),
                    label,
                  );
                  const expectedBg =
                    blocked === "disabled"
                      ? plainVariant ? null : solid
                        ? semantic ? `${status}-disabled-color` : "disabled-color"
                        : `${status}-tonal-color`
                      : solid
                        ? `${status}-color`
                        : variant === "text" || variant === "outline"
                          ? null
                          : `${status}-tonal-color`;
                  assert.equal(
                    expand(root["background-color"]),
                    expectedBg
                      ? expand(variables[`--${p}-button-${expectedBg}`])
                      : "transparent",
                    label,
                  );
                  if (blocked === 'disabled') {
                    assert.equal(root.cursor, 'not-allowed', `${label}: disabled cursor`);
                    assert.equal(root['box-shadow'], 'none', `${label}: disabled shadow`);
                    if (variant === 'outline') assert.ok(root.border.includes('currentColor'), `${label}: border follows disabled foreground`);
                  }
                  for (const [key, value] of Object.entries(root))
                    if (key.startsWith(`--${p}-internal-button-`))
                      variables[key] = value;
                  const plain = variant === "text" || variant === "outline";
                  const opacity = Number(expand(overlay.opacity));
                  assert.equal(
                    opacity,
                    blocked
                      ? 0
                      : active
                        ? plain
                          ? 1
                          : 0.12
                        : hover
                          ? plain
                            ? 0.5
                            : 0.08
                          : 0,
                    `${label}: active > hover; blocked suppresses both`,
                  );
                  assert.equal(root.isolation, "isolate");
                  assert.equal(
                    overlay["z-index"],
                    "-1",
                    "State layer must paint behind content in the isolated stacking context",
                  );
                  if (focus && !blocked)
                    assert.equal(
                      expand(root.outline),
                      `2px solid ${expand(variables[`--${p}-button-focus-color`])}`,
                    );
                  else
                    assert.equal(
                      root.outline,
                      "none",
                      `${label}: blocked focus`,
                    );
                  variables[`--${p}-internal-button-state-layer-color`] =
                    root[`--${p}-internal-button-state-layer-color`];
                  states++;
                  if (blocked === "disabled") continue;
                  for (const surface of [
                    "page",
                    "default",
                    "raised",
                    "overlay",
                    "muted",
                  ]) {
                    const page = rgba(
                      expand(variables[`--${p}-sys-color-surface-page`]),
                    );
                    const backdrop = over(
                      rgba(
                        expand(
                          variables[`--${p}-sys-color-surface-${surface}`],
                        ),
                      ),
                      page,
                    );
                    const base = over(
                      rgba(expand(root["background-color"])),
                      backdrop,
                    );
                    const paint = rgba(expand(overlay["background-color"]));
                    paint[3] *= opacity;
                    const bg = over(paint, base);
                    contrast(
                      over(rgba(expand(root.color)), bg),
                      bg,
                      `${label}/${surface}`,
                    );
                  }
                }
  },
);
console.log(
  `Button themes passed (${process.argv.includes("--primary-solid") ? "primary solid only" : "all variants"}): ${states} cascade combinations, ${pairs} foreground pairs; ${pairs ? `minimum ${minimum.toFixed(3)}:1.` : "Disabled palette and interaction checks only."} Disabled contrast, custom colors and transient ripple animation excluded.`,
);
