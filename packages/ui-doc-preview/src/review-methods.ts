export interface ReviewMethodExample {
  label: string;
  args: unknown[];
  schemas?: string[];
}
export function reviewMethodExamples(
  name: string,
  original: Record<string, any>,
): ReviewMethodExample[] {
  const field = Object.keys(original.model ?? {})[0] ?? "name";
  const value = original.model?.[field];
  const row =
    original.data?.[0]?.[
      typeof original["row-key"] === "string" ? original["row-key"] : "key"
    ] ??
    original.options?.[0]?.value ??
    "1";
  if (name === "codeToHtml")
    return [
      {
        label: "生成 JavaScript 高亮 / Highlight JavaScript",
        args: [
          "console.log('Review')",
          { lang: "javascript", theme: "github-light" },
        ],
        schemas: ["Highlighter"],
      },
    ];
  if (name === "setFields")
    return [
      {
        label: "设置字段值和错误状态 / Set value and error",
        args: [
          {
            [field]: {
              value: typeof value === "number" ? value + 1 : "Review",
              status: "error",
              message: "审查错误 / Review error",
            },
          },
        ],
        schemas: ["FieldData"],
      },
      {
        label: "清除字段展示状态 / Clear state",
        args: [{ [field]: { status: "", message: "" } }],
        schemas: ["FieldData"],
      },
    ];
  if (name === "validateField" || name === "scrollToField")
    return [
      {
        label: "当前案例的首个字段 / First field",
        args: [field],
        schemas: name === "validateField" ? ["ValidatedError"] : [],
      },
    ];
  if (name === "toggleAll")
    return [
      {
        label: "反向切换，跳过禁用项 / Invert enabled items",
        args: [{ expand: "inverse", skipDisabled: true }],
        schemas: ["CollapseToggleAllOptions"],
      },
      {
        label: "全部展开，包括禁用项 / Expand all",
        args: [{ expand: true, skipDisabled: false }],
        schemas: ["CollapseToggleAllOptions"],
      },
    ];
  if (/^(selectAll|expandAll|checkAll)$/.test(name))
    return [
      { label: "启用全部 / Enable all", args: [true] },
      { label: "取消全部 / Disable all", args: [false] },
    ];
  if (/^(selectNode|checkNode|expandNode)$/.test(name))
    return [
      {
        label: "切换首个节点 / Toggle first node",
        args: [original.data?.[0]?.key ?? "0-0", true],
      },
    ];
  if (name === "expand")
    return [{ label: "展开首行 / Expand first row", args: [[row], true] }];
  if (name === "scrollTo" && "sticky-offset-top" in original)
    return [
      {
        label: "定位 B 并通知 / Scroll to B and notify",
        args: ["B", { event: true }],
        schemas: ["IndexBarScrollToOptions"],
      },
      {
        label: "定位 A 并静默 / Scroll to A silently",
        args: ["A", { event: false }],
        schemas: ["IndexBarScrollToOptions"],
      },
    ];
  if (name === "scrollTo")
    return [
      {
        label: "滚动到 100px / Scroll to 100px",
        args: [{ top: 100, left: 0, behavior: "auto" }],
      },
    ];
  if (name === "scrollIntoView")
    return [
      {
        label: "定位首个节点 / Reveal first node",
        args: [{ key: original.data?.[0]?.key ?? "0-0" }],
      },
    ];
  if (/^(resetFilters|clearFilters)$/.test(name))
    return [
      {
        label: "首个数据列 / First column",
        args: [
          original.columns?.find((item: any) => item.dataIndex)?.dataIndex ??
            "name",
        ],
      },
    ];
  if (/^(scrollTop|scrollLeft)$/.test(name))
    return [{ label: "滚动至 100 / Scroll to 100", args: [100] }];
  if (name === "select" && original.data)
    return [
      { label: "选择当前案例首行 / Select first row", args: [[row], true] },
      { label: "取消当前案例首行 / Unselect first row", args: [[row], false] },
    ];
  if (name === "to" || name === "goTo")
    return [
      { label: "定位第 2 项 / Go to second item", args: [1] },
      { label: "定位第 1 项 / Go to first item", args: [0] },
    ];
  if (name === "zoomTo")
    return [{ label: "放大至 150% / Zoom 150%", args: [1.5] }];
  if (name === "validate")
    return [
      {
        label: "校验并查看返回值 / Validate and inspect result",
        args: [],
        schemas: ["ValidatedError"],
      },
    ];
  return [{ label: "无参数 / No arguments", args: [] }];
}
