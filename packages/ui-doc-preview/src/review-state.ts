export interface ReviewField {
  name: string;
  description: string;
  type: string;
  defaultValue: string;
  kind:
    | "boolean"
    | "number"
    | "string"
    | "enum"
    | "json"
    | "scenario"
    | "scalar"
    | "callback"
    | "regexp"
    | "date"
    | "node"
    | "component"
    | "operations"
    | "locale";
  path?: (string | number)[];
  options?: string[];
  initial?: unknown;
}

export function parseReviewValue(field: ReviewField, value: unknown): unknown {
  if (field.kind === "regexp") {
    const source = String(value);
    const literal = /^\/(.*)\/([gimsuy]*)$/.exec(source);
    return new RegExp(literal ? literal[1] : source, literal?.[2]);
  }
  if (field.kind === "date") {
    const result = new Date(String(value));
    if (Number.isNaN(result.getTime()))
      throw new Error("请输入有效日期 / Enter a valid date");
    return result;
  }
  if (field.kind === "boolean") return Boolean(value);
  if (field.kind === "enum" && /^\d+(?:\s*[|/]\s*\d+)+$/.test(field.type))
    return Number(value);
  if (field.kind === "number") {
    if (String(value).trim() === "" || !Number.isFinite(Number(value)))
      throw new Error("请输入有限数字 / Enter a finite number");
    return Number(value);
  }
  if (field.kind === "json") return JSON.parse(String(value));
  if (field.kind === "scalar" && /^-?\d+(?:\.\d+)?$/.test(String(value).trim()))
    return Number(value);
  return String(value);
}

export function initialReviewValue(field: ReviewField): unknown {
  if (field.initial !== undefined) return field.initial;
  if (field.kind === "boolean") return field.defaultValue === "true";
  if (field.kind === "number")
    return Number.isFinite(Number(field.defaultValue))
      ? Number(field.defaultValue)
      : 0;
  if (field.kind === "enum") return field.options?.[0] ?? "";
  if (field.kind === "json")
    return field.type.includes("[]") || /array/i.test(field.type) ? "[]" : "{}";
  return field.defaultValue
    .replace(/^["']|["']$/g, "")
    .replace(/^(undefined|null|—|-)$/, "");
}

// Events can contain circular DOM/component objects. Keep the log bounded and readable.
export function summarizeReviewEvent(args: unknown[]): string {
  const seen = new WeakSet<object>();
  let nodes = 0;
  try {
    return (
      JSON.stringify(args, (_key, value) => {
        if (++nodes > 300) return "[Truncated]";
        if (typeof Node !== "undefined" && value instanceof Node)
          return { node: value.nodeName };
        if (value?.$?.exposed)
          return {
            component: value.$.type?.name,
            methods: Object.keys(value.$.exposed).filter(
              (key) => typeof value.$.exposed[key] === "function",
            ),
          };
        if (value?.__v_isVNode)
          return {
            type: "VNode",
            component:
              typeof value.type === "string"
                ? value.type
                : (value.type?.name ?? "component"),
          };
        if (typeof value === "function") return "[Function]";
        if (typeof value === "bigint") return String(value);
        if (value && typeof value === "object") {
          if (seen.has(value)) return "[Circular]";
          seen.add(value);
          if (typeof Event !== "undefined" && value instanceof Event)
            return { type: value.type };
        }
        return value;
      })?.slice(0, 1200) ?? ""
    );
  } catch {
    return "[无法序列化 / Unserializable]";
  }
}

export interface ReviewConfig {
  fields: ReviewField[];
  methodNames?: string[];
  events?: string[];
  slotNames?: string[];
  slotDefaults?: Record<string, boolean>;
  scenarios?: { name: string; kind: string; demos: string[] }[];
}

/** Validate generated JSON and retain discriminated field types for Vue templates. */
export function defineReviewConfig(
  config: Omit<ReviewConfig, "fields"> & {
    fields: (Omit<ReviewField, "kind"> & { kind: string })[];
  },
): ReviewConfig {
  const kinds = new Set([
    "boolean",
    "number",
    "string",
    "enum",
    "json",
    "scenario",
    "scalar",
    "callback",
    "regexp",
    "date",
    "node",
    "component",
    "operations",
    "locale",
  ]);
  for (const field of config.fields) {
    if (!kinds.has(field.kind))
      throw new Error(`Unknown review control: ${field.kind}`);
  }
  return config as ReviewConfig;
}
