import type { ReviewField } from "./review-state";

// Keep the same functional boundaries in both documentation sites.
const topics: [string, string, RegExp][] = [
  [
    "value",
    "值与数据 / Value and data",
    /^(?:model-value|default-value|value|options|data|items|columns|field-names|label-key|value-key|children-key|checked|default-checked|active|default-active|current|default-current|total|page-size|default-page-size)(?:$|\.)/,
  ],
  [
    "state",
    "交互状态 / Interaction state",
    /^(?:disabled|readonly|read-pretty|error|loading|indeterminate|required|checkable|selectable|multiple|clearable|closable|show|default-show)$/,
  ],
  [
    "loading",
    "加载反馈 / Loading",
    /^(?:loading-|auto-loading|spinning|delay)/,
  ],
  [
    "validation",
    "输入与校验 / Input and validation",
    /^(?:rules|validate|before-|after-|on-|request|parser|formatter|filter|search|word-|max-length|min-length|precision|step|strict|allow-|input-|type$|model-modifiers)/,
  ],
  [
    "popup",
    "弹层行为 / Popup behavior",
    /^(?:open|default-open|popup|overlay|trigger|placement|offset|teleport|esc-|close-|unmount|destroy|lock-|trap-|focus-|return-focus|append-|attach|auto-fit|boundary)/,
  ],
  [
    "layout",
    "布局与尺寸 / Layout and size",
    /^(?:size|width|height|min-width|max-width|min-height|max-height|direction|orientation|align|justify|wrap|block|vertical|horizontal|gap|gutter|span|flex|order|position|fixed|sticky|scroll|overflow|fit|rows|autosize|resize|padding|margin|label-width|label-align|layout)/,
  ],
  [
    "appearance",
    "视觉样式 / Appearance",
    /^(?:status|variant|color|text-color|background|border|round|radius|elevation|ripple|icon|line|hint|tonal|shape|theme|class|style|animation|transition|duration|stroke|track|thumb)/,
  ],
  [
    "content",
    "文案与内容 / Content",
    /^(?:title|subtitle|description|content|message|label|placeholder|prefix|suffix|text|separator|locale|format|empty|help|extra|image|src|alt|avatar|name)/,
  ],
  [
    "native",
    "原生与无障碍 / Native and accessibility",
    /^(?:aria-|tabindex|focusable|autofocus|autocomplete|enterkeyhint|html-type|component|native|id$)/,
  ],
];

export function reviewTopics(fields: ReviewField[], limit = 3) {
  if (fields.length <= limit)
    return fields.length
      ? [{ name: "basic-0", label: "属性 / Props", fields }]
      : [];
  const buckets = new Map<string, { label: string; fields: ReviewField[] }>();
  for (const field of fields) {
    const name = String(field.path?.[0] ?? field.name).replace(
      /[A-Z]/g,
      (c) => `-${c.toLowerCase()}`,
    );
    const [key, label] = topics.find(([, , pattern]) => pattern.test(name)) ?? [
      "behavior",
      "专项行为 / Component behavior",
    ];
    if (!buckets.has(key)) buckets.set(key, { label, fields: [] });
    buckets.get(key)!.fields.push(field);
  }
  return [...buckets].flatMap(([key, bucket]) => {
    const count = Math.ceil(bucket.fields.length / limit);
    return Array.from({ length: count }, (_, index) => ({
      name: `${key}-${index}`,
      label: bucket.label + (count > 1 ? ` (${index + 1}/${count})` : ""),
      fields: bucket.fields.slice(index * limit, (index + 1) * limit),
    }));
  });
}
