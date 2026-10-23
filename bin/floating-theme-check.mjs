// Compiled steady-state CSS audit, not a browser layout/animation test.
import assert from "node:assert/strict";
import { auditThemes, rgba, over, luminance } from "./theme-audit-utils.mjs";

let combinations = 0,
  pairs = 0,
  minimum = Infinity;
for (const component of ["tooltip", "popover", "overlay", "trigger"]) {
  await auditThemes(
    component,
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
      const label = `${repo}/${brand}/${mode}/${component}`;
      const read = (name) => expand(variables[`--${p}-${name}`]);
      const element = (classes) => {
        const node = document.createElement("div");
        node.className = classes;
        tag.append(node);
        return node;
      };
      const contrast = (foreground, background, opacity = 1) => {
        for (const surface of [
          "page",
          "default",
          "raised",
          "overlay",
          "muted",
        ]) {
          const backdrop = over(
            rgba(read(`sys-color-surface-${surface}`)),
            rgba(read("sys-color-surface-page")),
          );
          const rawBg = rgba(background),
            rawFg = rgba(foreground);
          // Element opacity composites the entire group, not text independently over the final background.
          const bg = over([...rawBg.slice(0, 3), rawBg[3] * opacity], backdrop);
          const text = over(rawFg, over(rawBg, backdrop));
          const fg = over([...text.slice(0, 3), opacity], backdrop);
          const a = luminance(fg),
            b = luminance(bg);
          const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
          assert.ok(ratio >= 4.5, `${label}/${surface}: ${ratio} < 4.5`);
          minimum = Math.min(minimum, ratio);
          pairs++;
        }
      };
      const override = (suffix, nodes, property) => {
        const key = `--${p}-${component}-${suffix}`,
          original = variables[key];
        variables[key] = "#123456";
        for (const node of nodes)
          assert.equal(
            expand(cascade(node)[property]),
            "#123456",
            `${label}/${suffix}: override consumer`,
          );
        variables[key] = original;
      };
      if (component === "tooltip") {
        for (const status of [
          "default",
          "primary",
          "info",
          "success",
          "warning",
          "danger",
        ]) {
          const modifier =
            status === "default" ? "" : `${p}-tooltip--status-${status}`;
          const content = element(`${p}-tooltip__content ${modifier}`);
          const arrow = element(
            `${p}-trigger__arrow ${p}-tooltip__arrow ${modifier}`,
          );
          const css = cascade(content),
            arrowCss = cascade(arrow);
          const suffix = status === "default" ? "" : `status-${status}-`;
          assert.equal(
            css["background-color"],
            `var(--${p}-tooltip-${suffix}background)`,
          );
          assert.equal(css.color, `var(--${p}-tooltip-${suffix}text-color)`);
          assert.equal(
            expand(arrowCss["background-color"]),
            expand(css["background-color"]),
            `${label}/${status}: arrow`,
          );
          assert.equal(
            expand(css.opacity),
            "1",
            `${label}: no stale dark opacity override`,
          );
          assert.equal(expand(arrowCss.opacity), expand(css.opacity));
          contrast(
            expand(css.color),
            expand(css["background-color"]),
            Number(expand(css.opacity)),
          );
          override(`${suffix}background`, [content, arrow], "background-color");
          override(`${suffix}text-color`, [content], "color");
          combinations++;
        }
      } else if (component === "popover") {
        const content = element(`${p}-popover__content`),
          title = element(`${p}-popover__title`);
        const arrow = element(`${p}-trigger__arrow ${p}-popover__arrow`);
        const css = cascade(content),
          arrowCss = cascade(arrow);
        assert.equal(css["background-color"], `var(--${p}-popover-background)`);
        assert.equal(arrowCss["background-color"], css["background-color"]);
        assert.equal(arrowCss.border, css.border);
        assert.equal(arrowCss["z-index"], `var(--${p}-popover-arrow-z-index)`);
        contrast(expand(css.color), expand(css["background-color"]));
        contrast(expand(cascade(title).color), expand(css["background-color"]));
        override("background", [content, arrow], "background-color");
        override("text-color", [content], "color");
        override("title-text-color", [title], "color");
        combinations++;
      } else if (component === "overlay") {
        const backdrop = element(`${p}-overlay__backdrop`),
          content = element(`${p}-overlay__content`);
        assert.equal(
          expand(cascade(backdrop)["background-color"]),
          read("sys-color-scrim"),
        );
        assert.equal(rgba(read("sys-color-scrim"))[3], 0.6);
        assert.equal(
          cascade(content).opacity,
          undefined,
          `${label}: content must not inherit scrim opacity`,
        );
        override("background-color", [backdrop], "background-color");
        combinations++;
      } else {
        const arrow = element(`${p}-trigger__arrow`);
        assert.equal(
          expand(cascade(arrow)["background-color"]),
          read("sys-color-surface-overlay"),
        );
        override("arrow-background", [arrow], "background-color");
        combinations++;
      }
    },
    {
      importsAfter: ["tooltip", "popover"].includes(component)
        ? ["trigger"]
        : [],
    },
  );
}
console.log(
  `Floating theme audit passed: ${combinations} combinations, ${pairs} contrast pairs, minimum ${minimum.toFixed(3)}:1; arrow overrides survive Trigger-last CSS.`,
);
