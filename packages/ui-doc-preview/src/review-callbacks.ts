import { h, type Component } from "vue";
import type { ReviewField } from "./review-state";

export type ReviewRecorder = (name: string, args: unknown[]) => void;
export function callbackModes(field: ReviewField) {
  if (
    /^before-|validator|request|load-more/.test(
      field.name.split(".").at(-1) ?? field.name,
    )
  )
    return ["observe", "allow", "reject", "async-allow", "async-reject"];
  return ["observe", "custom"];
}
/** Concrete examples follow the callback's contract; no source evaluation is used. */
export function createReviewCallback(
  field: ReviewField,
  mode: string,
  original: unknown,
  record: ReviewRecorder,
  controls: Record<string, Component>,
  readProps: () => Record<string, unknown> = () => ({}),
) {
  return (...args: any[]) => {
    record(`callback:${field.name}`, args);
    const reject = mode.includes("reject");
    const run = () => {
      if (mode === "observe" && typeof original === "function")
        return original(...args);
      const name = field.name.split(".").at(-1) ?? field.name;
      if (/^before-/.test(name)) {
        // beforeClose(action, done), beforeChange(value, done), and return-value
        // interceptors have distinct completion protocols.
        const done = args.find((arg) => typeof arg === "function");
        if (done) {
          if (!reject) done();
          return reject ? false : undefined;
        }
        return reject
          ? false
          : /^(before-read|before-upload|before-remove|before-change)$/.test(
                name,
              )
            ? true
            : undefined;
      }
      if (name === "validator") {
        const done = args.find((arg) => typeof arg === "function");
        if (done) {
          done(reject ? "审查校验失败 / Review rejected" : undefined);
          return;
        }
        return reject
          ? Promise.reject(new Error("Review rejected"))
          : undefined;
      }
      if (name === "request-choose") {
        if (!reject) args[0]?.();
        return;
      }
      if (/^disabled-(hours|minutes|seconds)$/.test(name))
        return name === "disabled-hours" ? [0, 1, 2] : [0, 15, 30, 45];
      if (name === "selectable")
        return Boolean(args[0]?.isLeaf ?? !args[0]?.children?.length);
      if (name === "allow-drop") return !reject && args[0]?.dropPosition !== 0;
      if (name === "headers") return { "X-Review": "enabled" };
      if (name === "name") return `review-${args[0]?.name ?? "file"}`;
      if (name === "load-options")
        return Promise.resolve([
          { dataIndex: "name", title: "Name" },
          { dataIndex: "score", title: "Score" },
        ]);
      if (name === "remote-search") return Promise.resolve();
      if (/cell-class$/.test(name)) return "review-cell";
      if (/cell-style$/.test(name)) return { color: "#5268cc" };
      if (name === "is-success-response")
        return (
          !reject &&
          Number(args[0]?.status ?? 200) >= 200 &&
          Number(args[0]?.status ?? 200) < 300
        );
      if (name === "create-thumbnail-url")
        return (
          "data:image/svg+xml," +
          encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#5268cc"/><text x="10" y="45" fill="white">Review</text></svg>',
          )
        );
      if (name === "separator")
        return h(controls.Tag ?? controls.Button, { size: "xs" }, () =>
          String(args[0] ?? "·"),
        );
      if (name === "custom-request") {
        let cancelled = false;
        const options = args[0];
        queueMicrotask(() => {
          if (cancelled) return;
          if (reject) options.onError?.(new Error("Review request rejected"));
          else {
            options.onProgress?.({
              percent: 100,
              loaded: 1,
              total: 1,
              lengthComputable: true,
            });
            options.onSuccess?.({ review: true });
          }
        });
        return {
          abort: () => {
            cancelled = true;
            record("request:abort", []);
          },
        };
      }
      if (/word-length/.test(name))
        return Array.from(String(args[0] ?? "")).length;
      if (/word-slice/.test(name))
        return Array.from(String(args[0] ?? ""))
          .slice(0, Number(args[1] ?? 10))
          .join("");
      if (/parser/.test(name))
        return Number(String(args[0] ?? "").replace(/[^\d.-]/g, "")) || 0;
      if (/formatter|format-tag|format-label/.test(name)) {
        const value = args[0];
        return `审查 / Review ${typeof value === "object" ? (value?.label ?? value?.value ?? value?.name ?? "") : (value ?? "")}`;
      }
      if (name === "fallback-option")
        return {
          value: args[0],
          label:
            typeof args[0] === "object"
              ? "Review option"
              : String(args[0] ?? "Review option"),
        };
      if (name === "fallback") return `Review ${String(args[0] ?? "")}`;
      if (/filter/.test(name)) {
        const text = String(
          args[1]?.label ?? args[1]?.title ?? args[1]?.name ?? args[1] ?? "",
        ).toLowerCase();
        const queries = Array.isArray(args[0]) ? args[0] : [args[0]];
        return (
          queries.length === 0 ||
          queries.some((query) =>
            text.includes(String(query ?? "").toLowerCase()),
          )
        );
      }
      if (/disabled-date/.test(name)) return new Date(args[0]).getDay() === 0;
      if (/disabled-time/.test(name))
        return {
          disabledHours: () => [0, 1, 2],
          disabledMinutes: () => [0, 30],
        };
      if (/geocoder/.test(name))
        return Promise.resolve({
          longitude: args[0],
          latitude: args[1],
          address: "审查地址 / Review address",
          name: "Review",
        });
      if (/sort/.test(name))
        return String(args[0]?.name ?? args[0]).localeCompare(
          String(args[1]?.name ?? args[1]),
        );
      if (/node-props|reference-attrs/.test(name))
        return {
          title: "审查属性 / Review attributes",
          "data-review-callback": name,
        };
      if (
        /render|icon|footer|content/.test(name) ||
        /VNode|Render/.test(field.type)
      )
        return h(
          controls.Tag ?? controls.Button,
          { size: "sm" },
          () => "自定义渲染 / Custom render",
        );
      if (/load-more/.test(name)) {
        const done = args.find((arg) => typeof arg === "function");
        const properties = readProps();
        const fields = (properties.fieldNames ?? {}) as Record<string, string>;
        const valueField = Array.isArray(properties.columns)
          ? String(properties.rowKey ?? "key")
          : (fields.value ?? fields.key ?? "value");
        const parent = args[0];
        const parentValue = parent?.[valueField] ?? parent?.key ?? parent?.id;
        const childValue =
          parentValue == null ? "review-child" : `${parentValue}-review-child`;
        const children = [
          {
            value: childValue,
            key: childValue,
            label: "Review child",
            title: "Review child",
            name: "Review child",
            isLeaf: true,
            [valueField]: childValue,
            [fields.label ?? "label"]: "Review child",
            [fields.title ?? "title"]: "Review child",
            [fields.isLeaf ?? "isLeaf"]: true,
          },
        ];
        if (done) {
          done(reject ? undefined : children);
          return;
        }
        if (reject) return Promise.reject(new Error("Review loading rejected"));
        // Tree loadMore mutates the source node and resolves without a done callback.
        if (parent && typeof parent === "object")
          parent[fields.children ?? "children"] = children;
        return Promise.resolve();
      }
      if (typeof original === "function") return original(...args);
      // Notification callbacks intentionally have no return value.
      if (
        /^on-/.test(name) ||
        /=>\s*void\b|^\(\)\s*=>\s*void$/.test(field.type)
      )
        return;
      throw new Error(
        `该回调需要专用案例参数 / Missing callback recipe: ${name}`,
      );
    };
    const finish = (result: unknown) => {
      record(`return:${field.name}`, [result]);
      return result;
    };
    const fail = (error: unknown) => {
      record(`error:${field.name}`, [String(error)]);
      throw error;
    };
    if (mode.startsWith("async-"))
      return Promise.resolve().then(run).then(finish, fail);
    const result = run();
    return result && typeof result.then === "function"
      ? result.then(finish, fail)
      : finish(result);
  };
}

export function hasCallbackRecipe(field: ReviewField) {
  return (
    /=>|Function|Predicate|Interceptor|BeforeFieldCommit/.test(field.type) &&
    (/^before-|^on-|validator|word-length|word-slice|parser|formatter|format-tag|format-label|filter|disabled-date|disabled-time|geocoder|sort|node-props|reference-attrs|render|icon|footer|content|load-more|fallback/.test(
      field.name,
    ) ||
      /RenderFunction|=>\s*void\b/.test(field.type))
  );
}
