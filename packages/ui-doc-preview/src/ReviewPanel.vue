<script setup lang="ts">
import {
  computed,
  h,
  reactive,
  ref,
  shallowRef,
  shallowReactive,
  watch,
  unref,
  getCurrentInstance,
  isVNode,
  isRef,
  type VNode,
  type Component,
} from "vue";
import {
  initialReviewValue,
  parseReviewValue,
  summarizeReviewEvent,
  type ReviewField,
} from "./review-state";

import { reviewMethodExamples } from "./review-methods";
import { reviewTopics } from "./review-topics";
import {
  callbackModes,
  createReviewCallback,
  hasCallbackRecipe,
} from "./review-callbacks";
const originals = shallowRef<Record<string, unknown>>({});
const props = defineProps<{
  controls: Record<
    | "Button"
    | "Checkbox"
    | "Select"
    | "Input"
    | "InputNumber"
    | "Textarea"
    | "Collapse"
    | "CollapseItem"
    | "Space"
    | "Tag",
    Component
  >;
  localeValues?: Record<string, unknown>;
  handle?: Record<string, unknown>;
  service?: Record<string, unknown>;
  methodDefaults?: Record<string, unknown[]>;
  methodNames?: string[];
  fields: ReviewField[];
  events?: string[];
  slotNames?: string[];
  slotDefaults?: Record<string, boolean>;
  scenarios?: { name: string; kind: string; demos: string[] }[];
}>();
const emit = defineEmits<{ (event: "review-reset"): void }>();
const slotEnabled = reactive<Record<string, boolean>>({
  ...props.slotDefaults,
});
const targets = shallowRef<Record<string, unknown>[]>(
  props.service ? [props.service] : [],
);
const instanceTargets = new Map<number, Record<string, unknown>>();
const boundInstances = shallowRef<
  { uid: number; props: Record<string, unknown> }[]
>([]);
const targetIndex = ref(0);
const method = ref("");
const methodArgs = ref("[]");
const methodResult = ref("");
const methodExample = ref(0);
const methodCallback = ref(false);
const methodExamples = computed(() =>
  props.methodDefaults?.[method.value]
    ? [
        {
          label: "案例默认参数 / Fixture defaults",
          args: props.methodDefaults[method.value],
        },
      ]
    : reviewMethodExamples(method.value, originals.value),
);
watch(method, () => {
  methodExample.value = 0;
  methodCallback.value = false;
  methodArgs.value = JSON.stringify(methodExamples.value[0]?.args ?? []);
});
function chooseMethodExample(index: number) {
  methodExample.value = index;
  methodArgs.value = JSON.stringify(methodExamples.value[index]?.args ?? []);
}
const targetCandidates = computed(() => [
  ...targets.value.flatMap((value, index) => [
    { label: String(index + 1), value },
    ...Object.entries(value).flatMap(([key, item]) => {
      const exposed = (unref(item) as any)?.$?.exposed;
      return exposed
        ? [{ label: `${index + 1} → ${key}`, value: exposed }]
        : [];
    }),
  ]),
  ...(originals.value.highlighter &&
  typeof originals.value.highlighter === "object" &&
  Object.values(originals.value.highlighter).some(
    (value) => typeof value === "function",
  )
    ? [
        {
          label: "属性配置 → highlighter",
          value: originals.value.highlighter as Record<string, unknown>,
        },
      ]
    : []),
  ...(props.handle &&
  Object.values(props.handle).some((value) => typeof value === "function")
    ? [{ label: "返回句柄 / Returned handle", value: props.handle }]
    : []),
]);
watch(
  () => props.handle,
  () => {
    if (
      props.handle &&
      Object.values(props.handle).some((value) => typeof value === "function")
    ) {
      targetIndex.value = targetCandidates.value.length - 1;
      method.value = "";
    }
  },
);
const target = computed(() => targetCandidates.value[targetIndex.value]?.value);
const documentedNames = computed(() =>
  (props.methodNames ?? []).map((name) =>
    name
      .split(".")
      .at(-1)!
      .replace(/-([a-z])/g, (_, c) => c.toUpperCase()),
  ),
);
const exposedProperties = computed(() =>
  Object.fromEntries(
    [
      ...new Set([
        ...Object.keys(target.value ?? {}),
        ...documentedNames.value.filter((name) => /Ref$/.test(name)),
      ]),
    ]
      .filter((key) => typeof target.value?.[key] !== "function")
      .map((key) => [key, unref(target.value?.[key])]),
  ),
);
const methods = computed(() =>
  [
    ...new Set([...Object.keys(target.value ?? {}), ...documentedNames.value]),
  ].filter((key) => typeof target.value?.[key] === "function"),
);
function capture(vnode: VNode) {
  if (
    vnode.component &&
    !boundInstances.value.some((item) => item.uid === vnode.component?.uid)
  )
    boundInstances.value = [
      ...boundInstances.value,
      { uid: vnode.component.uid, props: vnode.component.props },
    ];
  if (!Object.keys(originals.value).length && vnode.component) {
    originals.value = Object.fromEntries(
      Object.entries(vnode.component.props).map(([key, value]) => [
        key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`),
        value,
      ]),
    );
  }
  const instance = vnode.component;
  // Options API components publish methods on their public instance, whereas
  // setup components use expose(). Keep the inspector limited to documented APIs.
  const exposed =
    instance?.exposed ??
    (instance?.proxy
      ? Object.fromEntries(
          documentedNames.value
            .filter(
              (name) => typeof (instance.proxy as any)[name] === "function",
            )
            .map((name) => [
              name,
              (...args: unknown[]) => (instance.proxy as any)[name](...args),
            ]),
        )
      : undefined);
  if (exposed && !targets.value.includes(exposed))
    targets.value = [...targets.value, exposed];
  if (exposed && instance) instanceTargets.set(instance.uid, exposed);
}
function release(vnode: VNode) {
  boundInstances.value = boundInstances.value.filter(
    (item) => item.uid !== vnode.component?.uid,
  );
  const uid = vnode.component?.uid;
  targets.value = targets.value.filter(
    (item) =>
      item !== (uid === undefined ? undefined : instanceTargets.get(uid)),
  );
  if (uid !== undefined) instanceTargets.delete(uid);
}
async function invoke() {
  try {
    const args = JSON.parse(methodArgs.value);
    if (!Array.isArray(args))
      throw new Error("参数必须为 JSON 数组 / Arguments must be a JSON array");
    const invokedMethod = method.value;
    const fn = target.value?.[invokedMethod];
    if (typeof fn !== "function")
      throw new Error("请选择方法 / Choose a method");
    if (methodCallback.value)
      args.push((...values: unknown[]) =>
        record(`method:${invokedMethod}:callback`, values),
      );
    record(`method:${invokedMethod}`, args);
    methodResult.value = summarizeReviewEvent([
      { method: invokedMethod, result: await fn.apply(target.value, args) },
    ]);
  } catch (error) {
    methodResult.value = String(error);
  }
}
const enabled = reactive<Record<string, boolean>>({});
const values = reactive<Record<string, unknown>>({});
const errors = reactive<Record<string, string>>({});
const entries = ref<{ id: number; name: string; value: string }[]>([]);
const revision = ref(0);
const search = ref("");
const logging = ref(true);
let sequence = 0;
const callbackRecords = new Set<string>();
let pendingEntries: { id: number; name: string; value: string }[] = [];
let pendingLog = false;
function fieldPath(
  field: ReviewField,
  source: Record<string, unknown> = originals.value,
): (string | number)[] {
  let value: any = source;
  const result: (string | number)[] = [];
  for (const key of field.path ?? [field.name]) {
    if (
      key === 0 &&
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    )
      continue;
    const resolved =
      key === "$first" ? (Object.keys(value ?? {})[0] ?? "review") : key;
    result.push(resolved);
    value = value?.[resolved];
  }
  return result;
}
function canEdit(field: ReviewField): boolean {
  if (!field.path) return true;
  const path = fieldPath(field);
  const root = path[0];
  const value = originals.value[root];
  if (value === null || typeof value !== "object") return false;
  let parent: any = value;
  for (const key of path.slice(1, -1)) {
    parent = parent?.[key];
    if (typeof parent === "function") return false;
  }
  return true;
}
function originalValue(field: ReviewField): unknown {
  return fieldPath(field).reduce<unknown>(
    (value, key) =>
      value && typeof value === "object"
        ? (value as Record<string, unknown>)[key]
        : undefined,
    originals.value,
  );
}
function cloneConfig(value: unknown, seen = new WeakMap<object, any>()): any {
  if (!value || typeof value !== "object" || isVNode(value) || isRef(value))
    return value;
  const item = value as Record<string, unknown>;
  if (item.__file || item.__hmrId || typeof item.install === "function")
    return value;
  if (
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) !== Object.prototype
  )
    return value;
  if (seen.has(value)) return seen.get(value);
  const copy: any = Array.isArray(value) ? [] : {};
  seen.set(value, copy);
  for (const [key, child] of Object.entries(value))
    copy[key] = cloneConfig(child, seen);
  return copy;
}
const resolvedFields = computed(() =>
  props.fields.map((field) => {
    const scalar = originalValue(field);
    if (
      (field.kind === "number" || field.kind === "scalar") &&
      typeof scalar === "number" &&
      !Number.isFinite(scalar)
    )
      return {
        ...field,
        initial: scalar === Infinity ? 100 : scalar === -Infinity ? -100 : 0,
      };
    if (
      field.initial === undefined &&
      ["boolean", "number", "string", "scalar"].includes(field.kind) &&
      ["boolean", "number", "string"].includes(typeof scalar)
    )
      return { ...field, initial: scalar };
    if (field.kind === "json") {
      const original = originalValue(field);
      if (original !== undefined && typeof original !== "function") {
        try {
          let functional = false;
          const json = JSON.stringify(original, (_key, item) => {
            if (typeof item === "function") functional = true;
            return item;
          });
          if (functional) return { ...field, kind: "scenario" as const };
          if (json)
            return { ...field, initial: JSON.stringify(original, null, 2) };
        } catch {
          /* Preserve authored non-JSON values. */
        }
      }
      return field;
    }
    if (field.kind !== "scenario") return field;
    if (hasCallbackRecipe(field))
      return { ...field, kind: "callback" as const };
    const value = originalValue(field);
    if (value !== null && typeof value === "object") {
      let functional = false;
      try {
        const json = JSON.stringify(value, (_key, item) => {
          if (typeof item === "function") functional = true;
          return item;
        });
        if (!functional && json)
          return {
            ...field,
            kind: "json" as const,
            initial: JSON.stringify(value, null, 2),
          };
      } catch {
        /* Keep instances and circular objects in their authored scenario. */
      }
    }
    return field;
  }),
);
function valueFor(field: ReviewField) {
  if (values[field.name] !== undefined) return values[field.name];
  if (field.kind === "callback") return "observe";
  return initialReviewValue(field);
}
const topics = computed(() => reviewTopics(resolvedFields.value));
const selectedTopic = ref("");
const activeTopic = computed(
  () =>
    topics.value.find((topic) => topic.name === selectedTopic.value) ??
    topics.value[0],
);
const fields = computed(() =>
  (activeTopic.value?.fields ?? []).filter((field) =>
    `${field.name} ${field.description}`
      .toLowerCase()
      .includes(search.value.toLowerCase()),
  ),
);
function changeTopic(value: string) {
  reset(false);
  selectedTopic.value = value;
}
const callbackCache = new Map<
  string,
  {
    mode: string;
    original: unknown;
    owner: unknown;
    callback: ReturnType<typeof createReviewCallback>;
  }
>();
function callbackFor(field: ReviewField) {
  const mode = String(valueFor(field));
  const original = originalValue(field);
  const owner = target.value;
  const cached = callbackCache.get(field.name);
  if (
    cached?.mode === mode &&
    cached.original === original &&
    cached.owner === owner
  )
    return cached.callback;
  const callback = createReviewCallback(
    field,
    mode,
    original,
    record,
    props.controls,
    () =>
      boundInstances.value.find(
        (item) => instanceTargets.get(item.uid) === target.value,
      )?.props ??
      boundInstances.value[0]?.props ??
      {},
  );
  callbackCache.set(field.name, { mode, original, owner, callback });
  return callback;
}
const bindings = computed(() => {
  const result: Record<string, unknown> = {};
  for (const field of resolvedFields.value) {
    if (
      !enabled[field.name] ||
      errors[field.name] ||
      field.kind === "scenario" ||
      !canEdit(field)
    )
      continue;
    let value =
      field.kind === "callback"
        ? callbackFor(field)
        : field.kind === "locale"
          ? props.localeValues?.[String(valueFor(field))]
          : field.kind === "operations"
            ? {
                operations: (options: Record<string, unknown>) => {
                  record("callback:components.operations", [options]);
                  const items = Object.entries(options).filter(
                    ([, item]) => item !== undefined,
                  );
                  if (valueFor(field) === "reverse") items.reverse();
                  if (valueFor(field) === "selection-first")
                    items.sort(
                      ([a], [b]) =>
                        Number(b === "selection") - Number(a === "selection"),
                    );
                  return items.map(([, item]) => item);
                },
              }
            : field.kind === "node"
              ? h(props.controls.Tag, {}, () => String(valueFor(field)))
              : field.kind === "component"
                ? props.controls[
                    String(valueFor(field)) as keyof typeof props.controls
                  ]
                : parseReviewValue(field, valueFor(field));
    if (field.kind === "json" && value && typeof value === "object")
      value = reactive(value);
    if (!field.path) {
      result[field.name] = value;
      continue;
    }
    const [root, ...path] = fieldPath(field, { ...originals.value, ...result });
    result[root] ??= cloneConfig(originals.value[root]);
    if (root === "model" && result[root] && typeof result[root] === "object")
      result[root] = reactive(result[root] as object);
    let parent: any = result[root];
    if (!parent || typeof parent !== "object") continue;
    path.forEach((key, index) => {
      if (index === path.length - 1) parent[key] = value;
      else {
        parent[key] ??= typeof path[index + 1] === "number" ? [] : {};
        parent = parent[key];
      }
    });
  }
  return result;
});
// Stable slot bindings keep cached/functional child slots subscribed to control changes.
const activeBindings = shallowReactive<Record<string, unknown>>({
  onVnodeMounted: capture,
  onVnodeUnmounted: release,
});
watch(
  bindings,
  (value) => {
    callbackRecords.clear();
    for (const key of Object.keys(activeBindings))
      if (!key.startsWith("onVnode") && !(key in value))
        delete activeBindings[key];
    Object.assign(activeBindings, value);
  },
  { immediate: true, flush: "sync" },
);
function record(name: string, args: unknown[]) {
  if (!logging.value) return;
  const value = summarizeReviewEvent(args);
  if (!/^(callback|return|error):/.test(name)) callbackRecords.clear();
  const rendering = getCurrentInstance();
  if (rendering && /^(callback|return|error):/.test(name)) {
    const signature = `${rendering.uid}:${name}`;
    if (callbackRecords.has(signature)) return;
    callbackRecords.add(signature);
  }
  pendingEntries.push({ id: ++sequence, name, value });
  if (!pendingLog) {
    pendingLog = true;
    queueMicrotask(() => {
      entries.value = [...pendingEntries.reverse(), ...entries.value].slice(
        0,
        30,
      );
      pendingEntries = [];
      pendingLog = false;
    });
  }
}
const listeners = computed(() =>
  Object.fromEntries(
    (props.events ?? []).map((name) => [
      name,
      (...args: unknown[]) => {
        // Keep an enabled controlled value editable after a component emits v-model updates.
        if (name.startsWith("update:")) {
          const key = name
            .slice(7)
            .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
          const field = props.fields.find((item) => item.name === key);
          if (field && enabled[key]) {
            values[key] =
              field.kind === "json" ? JSON.stringify(args[0]) : args[0];
            delete errors[key];
          }
        }
        record(name, args);
      },
    ]),
  ),
);
function edit(field: ReviewField, value: unknown) {
  values[field.name] = value;
  try {
    parseReviewValue(field, value);
    delete errors[field.name];
  } catch (error) {
    errors[field.name] = (error as Error).message;
  }
}
function remount() {
  targets.value = props.service ? [props.service] : [];
  boundInstances.value = [];
  revision.value++;
}
function reset(notify: unknown = true) {
  for (const name of ["close", "clear", "finish", "resetDefaultOptions"]) {
    const action = props.service?.[name];
    if (typeof action === "function") action();
  }
  targets.value = props.service ? [props.service] : [];
  boundInstances.value = [];
  targetIndex.value = 0;
  method.value = "";
  methodResult.value = "";
  for (const state of [enabled, values, errors, slotEnabled])
    Object.keys(state).forEach((key) => delete state[key]);
  Object.assign(slotEnabled, props.slotDefaults ?? {});
  entries.value = [];
  callbackRecords.clear();
  pendingEntries = [];
  revision.value++;
  if (notify !== false) emit("review-reset");
}
</script>

<template>
  <div class="demo-review">
    <div class="demo-review__toolbar">
      <strong>功能调试 / Feature playground</strong>
      <div class="demo-review__actions">
        <component :is="controls.Button" size="sm" @click="remount"
          >重新挂载 / Remount</component
        >
        <component :is="controls.Button" size="sm" @click="reset"
          >重置 / Reset</component
        >
      </div>
    </div>
    <p>
      选择一类功能后调整相关属性。切换功能会清除上一次覆盖，恢复案例原有绑定。
      default-* 等初始属性修改后，点击“重新挂载”验证。
    </p>
    <p lang="en">
      Explore one feature at a time. Changing the topic removes previous
      overrides.
    </p>
    <component
      :is="controls.Select"
      v-if="topics.length > 1"
      class="demo-review__topic"
      :model-value="activeTopic?.name"
      :options="
        topics.map((topic) => ({ label: topic.label, value: topic.name }))
      "
      :clearable="false"
      aria-label="功能分类 / Feature topic"
      @update:model-value="changeTopic"
    />
    <div class="demo-review__search">
      <component
        :is="controls.Input"
        v-model="search"
        aria-label="筛选属性 / Filter"
        placeholder="筛选属性 / Filter"
        clearable
      />
    </div>
    <component :is="controls.Collapse" :default-active-names="['props']">
      <component
        :is="controls.CollapseItem"
        name="props"
        :title="`${activeTopic?.label ?? '属性 / Props'}（${fields.length}）`"
        class="demo-review__controls"
      >
        <div class="demo-review__grid">
          <div
            v-for="field in fields"
            :key="field.name"
            class="demo-review__field"
          >
            <component
              :is="controls.Checkbox"
              v-model="enabled[field.name]"
              :disabled="field.kind === 'scenario' || !canEdit(field)"
              uninject-group-context
              :aria-label="field.name"
              ><code>{{ field.name }}</code></component
            >
            <small
              >{{ field.description }} · {{ field.type }} · 默认 / Default:
              {{ field.defaultValue || "—" }}</small
            >
            <small v-if="!canEdit(field)"
              >当前场景没有此配置，请切换到含该配置的场景 / Choose a scenario
              containing this configuration.</small
            >
            <small v-if="field.kind === 'scenario'"
              >回调、节点及复杂类型请在下方专项案例验证 / Use the scenario demos
              below.</small
            >
            <template v-else>
              <component
                :is="controls.Checkbox"
                v-if="field.kind === 'boolean'"
                class="demo-review__value"
                :model-value="Boolean(valueFor(field))"
                :disabled="!enabled[field.name]"
                uninject-group-context
                :aria-label="`${field.name} value`"
                @update:model-value="edit(field, $event)"
                >true / false</component
              >
              <component
                :is="controls.Select"
                v-else-if="
                  field.kind === 'enum' ||
                  field.kind === 'callback' ||
                  field.kind === 'component' ||
                  field.kind === 'operations' ||
                  field.kind === 'locale'
                "
                :clearable="false"
                class="demo-review__input"
                :aria-label="field.name"
                :disabled="!enabled[field.name]"
                :model-value="valueFor(field)"
                :options="
                  (field.kind === 'callback'
                    ? callbackModes(field)
                    : field.options
                  )?.map((value) => ({ label: value, value }))
                "
                @update:model-value="edit(field, $event)"
              />
              <component
                :is="controls.Textarea"
                v-else-if="field.kind === 'json'"
                class="demo-review__input"
                :aria-label="field.name"
                :disabled="!enabled[field.name]"
                :model-value="String(valueFor(field) ?? '')"
                @update:model-value="edit(field, $event)"
              />
              <component
                :is="controls.InputNumber"
                v-else-if="field.kind === 'number'"
                class="demo-review__input"
                :aria-label="field.name"
                :disabled="!enabled[field.name]"
                :model-value="valueFor(field)"
                @update:model-value="edit(field, $event)"
              />
              <component
                :is="controls.Input"
                v-else
                class="demo-review__input"
                :aria-label="field.name"
                :disabled="!enabled[field.name]"
                :model-value="String(valueFor(field) ?? '')"
                @update:model-value="edit(field, $event)"
              />
              <small v-if="errors[field.name]" role="alert">{{
                errors[field.name]
              }}</small>
            </template>
          </div>
        </div>
      </component>
      <component
        :is="controls.CollapseItem"
        v-if="slotNames?.length"
        name="slots"
        title="案例插槽 / Fixture slots"
      >
        <component
          :is="controls.Checkbox"
          v-for="name in slotNames"
          :key="name"
          class="demo-review__slot"
          :model-value="slotEnabled[name] !== false"
          uninject-group-context
          :aria-label="name"
          @update:model-value="slotEnabled[name] = Boolean($event)"
          >{{ name }}</component
        >
      </component>
    </component>
    <div :key="revision" class="demo-review__preview">
      <slot
        :bindings="activeBindings"
        :listeners="listeners"
        :slot-enabled="slotEnabled"
        :controls="controls"
        :record="record"
      />
    </div>
    <component :is="controls.Collapse">
      <component
        :is="controls.CollapseItem"
        v-if="methods.length || Object.keys(exposedProperties).length"
        name="methods"
        title="实例 API / Instance API"
      >
        <pre
          v-if="Object.keys(exposedProperties).length"
          class="demo-review__exposed"
          >{{ summarizeReviewEvent([exposedProperties]) }}</pre>
        <div
          v-if="methods.length || targetCandidates.length > 1"
          class="demo-review__method-controls"
        >
          <component
            :is="controls.Select"
            v-model="targetIndex"
            aria-label="目标实例 / Target"
            :options="
              targetCandidates.map((item, index) => ({
                label: item.label,
                value: index,
              }))
            "
          />
          <component
            :is="controls.Select"
            v-model="method"
            aria-label="方法 / Method"
            placeholder="选择 / Choose"
            :options="methods.map((name) => ({ label: name, value: name }))"
          />
          <component
            :is="controls.Select"
            :model-value="methodExample"
            :options="
              methodExamples.map((item, index) => ({
                label: item.label,
                value: index,
              }))
            "
            :clearable="false"
            aria-label="方法参数示例 / Method argument example"
            @update:model-value="chooseMethodExample($event)"
          />
          <component
            :is="controls.Checkbox"
            v-if="['validate', 'validateField'].includes(method)"
            v-model="methodCallback"
            uninject-group-context
            aria-label="追加方法回调 / Append method callback"
            >追加方法回调 / Append method callback</component
          >
          <component
            :is="controls.Input"
            v-model="methodArgs"
            aria-label="参数数组 / JSON arguments"
            placeholder="JSON arguments: []"
          />
          <component :is="controls.Button" @click="invoke"
            >调用 / Invoke</component
          >
        </div>
        <pre role="status">{{ methodResult }}</pre>
      </component>
      <component
        :is="controls.CollapseItem"
        name="overrides"
        title="当前覆盖值 / Active overrides"
      >
        <pre>{{ JSON.stringify(bindings, null, 2) }}</pre>
      </component>
      <component
        :is="controls.CollapseItem"
        name="events"
        :title="`事件 / Events（${entries.length}）`"
      >
        <div class="demo-review__actions">
          <component
            :is="controls.Checkbox"
            v-model="logging"
            uninject-group-context
            >记录事件 / Record events</component
          ><component :is="controls.Button" size="sm" @click="entries = []"
            >清空 / Clear</component
          >
        </div>
        <p v-if="!entries.length">
          操作组件后查看事件；最多保留最近 30 条 / Interact to see up to 30
          recent events.
        </p>
        <ol aria-live="polite">
          <li v-for="entry in entries" :key="entry.id">
            <code>{{ entry.name }}</code> {{ entry.value }}
          </li>
        </ol>
      </component>
      <component
        :is="controls.CollapseItem"
        v-if="scenarios?.length"
        name="scenarios"
        title="专项 API 定位 / Scenario API index"
      >
        <p>
          文件名仅表示源码包含该
          API，仍需人工确认行为。没有命中的项目需要补充验证。
        </p>
        <ul>
          <li v-for="item in scenarios" :key="`${item.kind}:${item.name}`">
            <code>{{ item.kind }}: {{ item.name }}</code> —
            {{
              item.demos.length
                ? item.demos.join(", ")
                : "待补充专项验证 / Needs a scenario"
            }}
          </li>
        </ul>
      </component>
    </component>
  </div>
</template>
<style scoped>
.demo-review {
  color: inherit;
  font-size: 14px;
  line-height: 1.5;
  min-width: 0;
}
.demo-review__toolbar,
.demo-review__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.demo-review__toolbar {
  justify-content: space-between;
  gap: 12px;
}
.demo-review small {
  display: block;
  overflow-wrap: anywhere;
  opacity: 0.8;
}
.demo-review__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: 12px;
  max-height: 360px;
  overflow: auto;
  padding: 4px;
}
.demo-review__field {
  border: 1px solid #8885;
  border-radius: 6px;
  padding: 10px;
  display: grid;
  align-content: start;
  gap: 6px;
  min-width: 0;
}
.demo-review__input {
  width: 100%;
  min-width: 0;
}
.demo-review__preview {
  padding: 24px 0;
  min-height: 60px;
  overflow-wrap: anywhere;
}
.demo-review pre,
.demo-review li {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  max-height: 240px;
  overflow: auto;
}
.demo-review__slot {
  margin: 4px 12px 4px 0;
}
.demo-review__search {
  margin-bottom: 12px;
}
.demo-review__method-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
  gap: 12px;
}
</style>
