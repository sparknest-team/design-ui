import { reportContrast } from './contrast-report.mjs';
// Compiled steady-state colors and real token consumers, not browser layout tests.
import assert from "node:assert/strict";
import { auditThemes, rgba, over, luminance } from "./theme-audit-utils.mjs";

let combinations = 0,
  pairs = 0,
  minimum = Infinity;
for (const component of ["message", "notification", "loading-bar"]) {
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
      const node = (classes, parent = tag) => {
        const el = document.createElement("span");
        el.className = classes;
        parent.append(el);
        return el;
      };
      const read = (suffix) => expand(variables[`--${p}-${suffix}`]);
      const role = (suffix, value) =>
        assert.equal(
          variables[`--${p}-${suffix}`],
          value,
          `${label}/${suffix}: default mapping`,
        );
      const consume = (el, prop, suffix) => {
        assert.equal(
          cascade(el)[prop],
          `var(--${p}-${suffix})`,
          `${label}/${suffix}: consumer`,
        );
        const key = `--${p}-${suffix}`,
          old = variables[key];
        variables[key] = "#123456";
        assert.equal(expand(cascade(el)[prop]), "#123456");
        variables[key] = old;
      };
      const contrast = (foreground, background) => {
        const fg = over(rgba(foreground), background),
          a = luminance(fg),
          b = luminance(background);
        const value = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        reportContrast(value, 4.5, `${label}: ${value} < 4.5`);
        pairs++;
        minimum = Math.min(minimum, value);
      };
      if (component === "loading-bar") {
        for (const error of [false, true]) {
          const el = node(
            `mp-loading-bar${error ? " mp-loading-bar--error" : ""}`,
          );
          const suffix = `loading-bar-${error ? "error-" : ""}color`;
          role(
            suffix,
            `var(--mp-sys-color-content-${error ? "danger" : "brand"})`,
          );
          consume(el, "background-color", suffix);
          for (const surface of [
            "page",
            "default",
            "raised",
            "overlay",
            "muted",
          ])
            contrast(
              read(suffix),
              over(
                rgba(read(`sys-color-surface-${surface}`)),
                rgba(read("sys-color-surface-page")),
              ),
            );
          combinations++;
        }
        return;
      }
      if (component === "message") {
        for (const [key, value] of Object.entries(variables)) {
          if (key.startsWith(`--${p}-message-`)) expand(value);
        }
        for (const variant of ["neutral", "tonal", "solid"]) {
          for (const status of ["default", "info", "success", "warning", "danger", "loading"]) {
            const root = node(p === "c"
              ? `c-message c-message-${status} c-message--variant-${variant}`
              : `mp-message__wrapper mp-message__wrapper-${status} mp-message--variant-${variant}`);
            const base = `message-${variant}-${status}`;
            consume(root, "background-color", `${base}-bg`);
            consume(root, "color", `${base}-content-color`);
            consume(root, "border-color", `${base}-border-color`);
            const colors = [read(`${base}-content-color`)];
            for (const part of ["icon", "content", "close"]) {
              const suffix = `${base}-${part === "close" ? "close-color" : `${part}-color`}`;
              consume(node(`${p}-message${p === "c" ? "-" : "__"}${part === "close" && p === "c" ? "close-btn" : part}`, root), "color", suffix);
              colors.push(read(suffix));
            }
            for (const surface of ["page", "default", "raised", "overlay", "muted"]) {
              const backdrop = over(rgba(read(`sys-color-surface-${surface}`)), rgba(read("sys-color-surface-page")));
              const bg = over(rgba(read(`${base}-bg`)), backdrop);
              for (const fg of colors) contrast(fg, bg);
              if (p === "c") {
                const close = rgba(read(`${base}-close-color`));
                const hover = over([...close.slice(0, 3), Number(read("message-close-icon-hover-opacity"))], bg);
                contrast(read(`${base}-close-color`), hover);
              }
            }
            combinations++;
          }
        }
        return;
      }
      const statuses =
        component === "message"
          ? ["default", "info", "success", "warning", "danger", "loading"]
          : ["normal", "info", "success", "warning", "error"];
      for (const status of statuses) {
        const mobile = p === "mp",
          neutral = ["default", "normal", "loading"].includes(status);
        const root = node(
          mobile
            ? `mp-message__wrapper mp-message__wrapper-${status}`
            : `c-${component} c-${component}-${status}`,
        );
        const colors = [];
        let background;
        if (mobile) {
          const bg = `message-${neutral ? "" : status + "-"}background`,
            fg = `message-${neutral ? "" : status + "-"}color`;
          role(bg, neutral ? "#333" : `var(--mp-sys-color-status-${status})`);
          role(
            fg,
            `var(--mp-sys-color-content-on-${neutral ? "dark" : "bright"})`,
          );
          consume(root, "background", bg);
          consume(root, "color", fg);
          background = read(bg);
          const close = node("mp-message__close", root);
          assert.equal(cascade(close).color, "inherit");
          for (const part of ["icon", "content", "action"])
            assert.equal(
              cascade(node(`mp-message__${part}`, root)).color,
              undefined,
              `${label}: ${part} inherits wrapper foreground`,
            );
          colors.push(read(fg), read(fg), read(fg), read(fg));
        } else {
          const base = `${component}-${status}`,
            bg = `${base}-bg`,
            content = `${base}-content-color`;
          role(bg, "var(--c-sys-color-surface-overlay)");
          consume(root, "background-color", bg);
          role(content, "var(--c-sys-color-content-primary)");
          consume(root, "color", content);
          role(`${base}-border-color`, "var(--c-sys-color-border-default)");
          if (neutral && status !== "loading")
            assert.ok(
              cascade(root).border.includes(`var(--c-${base}-border-color)`),
            );
          else consume(root, "border-color", `${base}-border-color`);
          background = read(bg);
          for (const part of [
            "content",
            "icon",
            ...(component === "notification" ? ["title"] : []),
          ]) {
            const suffix = `${base}-${part}-color`;
            const contentRole =
              part === "icon"
                ? ({
                    normal: "primary",
                    default: "primary",
                    loading: "brand",
                    error: "danger",
                  }[status] ?? status)
                : "primary";
            role(suffix, `var(--c-sys-color-content-${contentRole})`);
            const el = node(`c-${component}-${part}`, root);
            consume(el, "color", suffix);
            colors.push(read(suffix));
          }
          const closeSuffix = `${component}-close-icon-color`,
            close = node(`c-${component}-close-btn`, root);
          role(closeSuffix, "var(--c-sys-color-content-secondary)");
          consume(close, "color", closeSuffix);
          colors.push(read(closeSuffix));
          // Unstyled action/footer content inherits a readable foreground from the panel.
          assert.equal(
            cascade(
              node(
                `c-${component}-${component === "message" ? "action" : "footer"}`,
                root,
              ),
            ).color,
            undefined,
          );
          colors.push(read(content));
        }
        for (const surface of [
          "page",
          "default",
          "raised",
          "overlay",
          "muted",
        ]) {
          const backdrop = rgba(read(`sys-color-surface-${surface}`)),
            bg = over(rgba(background), backdrop);
          for (const fg of colors) contrast(fg, bg);
        }
        combinations++;
      }
    },
    {
      platforms:
        component === "notification"
          ? ["c"]
          : component === "loading-bar"
            ? ["mp"]
            : ["c", "mp"],
      themeFileName: component === "loading-bar" ? "loadingBar" : component,
    },
  );
}
console.log(
  `Feedback themes passed: ${combinations} combinations, ${pairs} foreground/surface pairs, minimum ${minimum.toFixed(3)}:1; mappings and public consumers checked.`,
);
