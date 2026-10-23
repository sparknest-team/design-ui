import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import CedarPanel from "../../../../cedar-design-web/packages/cedar-ui/docs/.vuepress/components/ApiReviewPanel.vue";
import MaplePanel from "../../../../maple-design-mobile/packages/maple-ui/docs/components/ApiReviewPanel.vue";
import treeReviewConfig from "../../../../cedar-design-web/packages/cedar-ui/src/tree/__demos__/api-review.config.json";
import CTree from "../../../../cedar-design-web/packages/cedar-ui/src/tree";
import CSelect from "../../../../cedar-design-web/packages/cedar-ui/src/select";
import MpSelect from "../../../../maple-design-mobile/packages/maple-ui/src/select";
import CCheckbox from "../../../../cedar-design-web/packages/cedar-ui/src/checkbox";
import MpCheckbox from "../../../../maple-design-mobile/packages/maple-ui/src/checkbox";
import { parseReviewValue, summarizeReviewEvent } from "../src/review-state";
import { reviewMethodExamples } from "../src/review-methods";
import { reviewTopics } from "../src/review-topics";

it("keeps every public field reachable in bounded functional topics", () => {
  const fields = [
    "model-value",
    "default-value",
    "options",
    "disabled",
    "readonly",
    "error",
    "size",
    "width",
    "height",
    "variant",
    "color",
    "loading-type",
    "aria-label",
  ].map((name) => ({
    name,
    type: "string",
    kind: "string" as const,
    description: "",
    defaultValue: "",
  }));
  const topics = reviewTopics(fields);
  expect(topics.every((topic) => topic.fields.length <= 6)).toBe(true);
  expect(
    topics
      .flatMap((topic) => topic.fields)
      .map((field) => field.name)
      .sort(),
  ).toEqual(fields.map((field) => field.name).sort());
  expect(
    topics
      .find((topic) => topic.name.startsWith("state"))
      ?.fields.map((field) => field.name),
  ).toEqual(["disabled", "readonly", "error"]);
});

it("uses arguments for the actual public API when method names overlap", () => {
  expect(reviewMethodExamples("select", {})[0].args).toEqual([]);
  expect(
    reviewMethodExamples("select", { data: [{ key: "row-a" }] })[0].args,
  ).toEqual([["row-a"], true]);
  expect(
    reviewMethodExamples("scrollTo", { "sticky-offset-top": 0 })[0].args,
  ).toEqual(["B", { event: true }]);
  expect(reviewMethodExamples("scrollTo", {})[0].args).toEqual([
    { top: 100, left: 0, behavior: "auto" },
  ]);
});

const fields = [
  {
    name: "disabled",
    type: "boolean",
    kind: "boolean" as const,
    description: "",
    defaultValue: "false",
  },
  {
    name: "size",
    type: "string",
    kind: "enum" as const,
    description: "",
    defaultValue: "md",
    options: ["sm", "md", "lg"],
    initial: "md",
  },
  {
    name: "model-value",
    type: "string",
    kind: "string" as const,
    description: "",
    defaultValue: "",
  },
];
const Target = defineComponent({
  props: ["disabled", "size", "modelValue"],
  emits: ["update:modelValue", "click"],
  setup(props, { emit, expose }) {
    expose({ focus: () => "focused" });
    return () =>
      h(
        "button",
        {
          class: "target",
          disabled: props.disabled,
          "data-size": props.size,
          onClick: () => {
            emit("update:modelValue", "changed");
            emit("click", { ok: true });
          },
        },
        String(props.modelValue),
      );
  },
});
function render(Panel: typeof CedarPanel | typeof MaplePanel) {
  return mount(Panel, {
    props: {
      fields,
      slotNames: ["icon"],
      events: ["update:modelValue", "click"],
    },
    slots: {
      default: ({ bindings, listeners }) =>
        h(Target, {
          disabled: false,
          size: "sm",
          modelValue: "fixture",
          ...bindings,
          "onUpdate:modelValue": listeners["update:modelValue"],
          onClick: listeners.click,
        }),
    },
  });
}
for (const [name, Panel, Checkbox, Select] of [
  ["Cedar", CedarPanel, CCheckbox, CSelect],
  ["Maple", MaplePanel, MpCheckbox, MpSelect],
] as const) {
  describe(`${name} API review uses real library controls`, () => {
    it("combines overrides, updates model values and resets through component controls", async () => {
      const wrapper = render(Panel);
      expect(wrapper.findAllComponents(Checkbox).length).toBeGreaterThan(3);
      await wrapper.get('input[aria-label="disabled"]').setValue(true);
      await wrapper.get('input[aria-label="disabled value"]').setValue(true);
      await wrapper.get('input[aria-label="size"]').setValue(true);
      wrapper.findComponent(Select).vm.$emit("update:modelValue", "lg");
      await wrapper.vm.$nextTick();
      expect(wrapper.get(".target").attributes("disabled")).toBeDefined();
      expect(wrapper.get(".target").attributes("data-size")).toBe("lg");
      await wrapper.get('input[aria-label="disabled"]').setValue(false);
      expect(wrapper.get(".target").attributes("disabled")).toBeUndefined();
      await wrapper.get('input[aria-label="model-value"]').setValue(true);
      await wrapper.get(".target").trigger("click");
      expect(wrapper.get(".target").text()).toBe("changed");
      expect(wrapper.get("ol").text()).toContain("update:modelValue");
      await wrapper.findAll(".demo-review__toolbar button")[1].trigger("click");
      expect(wrapper.get(".target").text()).toBe("fixture");
      expect(wrapper.get(".target").attributes("data-size")).toBe("sm");
      expect(wrapper.findAll("ol li")).toHaveLength(0);
      wrapper.unmount();
    });
    it("uses library slot checkboxes, selects and buttons to invoke exposed methods", async () => {
      const wrapper = render(Panel);
      await wrapper.get('input[aria-label="icon"]').setValue(false);
      expect(
        (wrapper.get('input[aria-label="icon"]').element as HTMLInputElement)
          .checked,
      ).toBe(false);
      const methodSelect = wrapper
        .findAllComponents(Select)
        .find((select) =>
          select.props("options")?.some((option) => option.value === "focus"),
        );
      expect(methodSelect).toBeDefined();
      methodSelect!.vm.$emit("update:modelValue", "focus");
      await wrapper.vm.$nextTick();
      await wrapper
        .findAll("button")
        .find((button) => button.text().includes("Invoke"))!
        .trigger("click");
      expect(wrapper.get("[role=status]").text()).toContain("focused");
      wrapper.unmount();
    });
  });
}
it("rejects invalid numbers and serializes circular payloads", () => {
  expect(() =>
    parseReviewValue({ ...fields[0], kind: "number" }, ""),
  ).toThrow();
  expect(() => parseReviewValue({ ...fields[0], kind: "json" }, "{")).toThrow();
  const circular: Record<string, unknown> = {};
  circular.self = circular;
  expect(
    parseReviewValue({ ...fields[0], kind: "enum", type: "0 | 1" }, "1"),
  ).toBe(1);
  expect(
    parseReviewValue({ ...fields[0], kind: "enum", type: "'0' | '1'" }, "1"),
  ).toBe("1");
  expect(summarizeReviewEvent([circular])).toContain("[Circular]");
});

import { flushPromises } from "@vue/test-utils";
import ReviewPanel from "../src/ReviewPanel.vue";
import ReviewSlot from "../src/ReviewSlot.vue";
import ReviewSuite from "../src/ReviewSuite.vue";
import { createReviewCallback } from "../src/review-callbacks";

it("follows synchronous and asynchronous commit contracts and observes original callbacks", async () => {
  const field = {
    name: "before-commit",
    type: "BeforeFieldCommit",
    kind: "callback" as const,
    description: "",
    defaultValue: "",
  };
  const records: string[] = [];
  const record = (name: string) => records.push(name);
  const controls = {};
  expect(
    createReviewCallback(
      field,
      "allow",
      undefined,
      record,
      controls,
    )("new", {}),
  ).toBeUndefined();
  expect(
    createReviewCallback(
      field,
      "reject",
      undefined,
      record,
      controls,
    )("new", {}),
  ).toBe(false);
  expect(
    await createReviewCallback(
      field,
      "async-reject",
      undefined,
      record,
      controls,
    )("new", {}),
  ).toBe(false);
  expect(
    await createReviewCallback(
      field,
      "async-allow",
      undefined,
      record,
      controls,
    )("new", {}),
  ).toBeUndefined();
  const original = (value: string) => `original:${value}`;
  expect(
    createReviewCallback(field, "observe", original, record, controls)("new"),
  ).toBe("original:new");
  expect(
    records.filter((name) => name === "callback:before-commit"),
  ).toHaveLength(5);
  expect(
    records.filter((name) => name === "return:before-commit"),
  ).toHaveLength(5);
});
for (const [platform, Panel] of [
  ["cedar", CedarPanel],
  ["maple", MaplePanel],
] as const) {
  it(`${platform} preserves actual structured values and nested callback siblings`, async () => {
    const sorter = () => 1;
    const Fixture = defineComponent({
      props: ["columns"],
      setup: () => () => h("div", "table fixture"),
    });
    const wrapper = mount(Panel, {
      props: {
        fields: [
          {
            name: "columns",
            type: "Column[]",
            kind: "scenario",
            description: "",
            defaultValue: "",
          },
          {
            name: "Column.title",
            path: ["columns", 0, "title"],
            type: "string",
            kind: "string",
            initial: "Review",
            description: "",
            defaultValue: "",
          },
        ],
      },
      slots: {
        default: ({ bindings }: any) =>
          h(Fixture, { columns: [{ title: "Original", sorter }], ...bindings }),
      },
    });
    await flushPromises();
    const panel = wrapper.findComponent(ReviewPanel);
    const row = panel.findAll(".demo-review__field")[1];
    await row.get("input[type=checkbox]").setValue(true);
    expect((panel.vm as any).bindings.columns[0]).toEqual({
      title: "Review",
      sorter,
    });
    await row.get("input[type=checkbox]").setValue(false);
    expect((panel.vm as any).bindings).toEqual({});
    wrapper.unmount();
  });
  it(`${platform} runs scoped slot actions with a real context object and owning controls`, async () => {
    let received: unknown;
    const item = { id: "review-item" };
    const records: string[] = [];
    const wrapper = mount(Panel, {
      props: { fields: [] },
      slots: {
        default: ({ controls }: any) =>
          h(ReviewSlot, {
            name: "item",
            context: {
              item,
              remove: (value: unknown) => {
                received = value;
                return "removed";
              },
            },
            controls,
            record: (name: string) => records.push(name),
          }),
      },
    });
    const slot = wrapper.findComponent(ReviewSlot);
    const vm: any = slot.vm;
    vm.source = "item";
    await vm.invoke("remove");
    expect(received).toBe(item);
    expect(records).toEqual(["slot:item.remove"]);
    expect(
      slot
        .findComponent({ name: platform === "cedar" ? "CButton" : "MpButton" })
        .exists(),
    ).toBe(true);
    expect(slot.text()).toContain("removed");
    wrapper.unmount();
  });
}

it("lets upload chooser callbacks allow or suppress the supplied file chooser", async () => {
  const field = {
    name: "request-choose",
    type: "UploadRequestChoose",
    kind: "callback" as const,
    description: "",
    defaultValue: "",
  };
  let chosen = 0;
  for (const mode of ["reject", "async-reject", "allow", "async-allow"]) {
    await createReviewCallback(
      field,
      mode,
      undefined,
      () => {},
      {},
    )(() => chosen++, new Event("click"));
  }
  expect(chosen).toBe(2);
});
it("keeps local upload requests cancellable and reports success or failure without network access", async () => {
  const field = {
    name: "custom-request",
    type: "UploadCustomRequest",
    kind: "callback" as const,
    description: "",
    defaultValue: "",
  };
  const seen: string[] = [];
  const options = {
    onSuccess: () => seen.push("success"),
    onError: () => seen.push("error"),
    onProgress: () => seen.push("progress"),
  };
  const request = createReviewCallback(
    field,
    "allow",
    undefined,
    () => {},
    {},
  )(options);
  request.abort();
  await Promise.resolve();
  expect(seen).toEqual([]);
  createReviewCallback(field, "allow", undefined, () => {}, {})(options);
  await Promise.resolve();
  expect(seen).toEqual(["progress", "success"]);
  createReviewCallback(field, "reject", undefined, () => {}, {})(options);
  await Promise.resolve();
  expect(seen).toEqual(["progress", "success", "error"]);
});
it("supports nested validator callback signatures and invalid regular expressions", () => {
  const field = {
    name: "FieldRule.validator",
    path: ["rules", "name", 0, "validator"],
    type: "(value, callback) => void",
    kind: "callback" as const,
    description: "",
    defaultValue: "",
  };
  let message: unknown;
  createReviewCallback(
    field,
    "reject",
    undefined,
    () => {},
    {},
  )("value", (value: unknown) => {
    message = value;
  });
  expect(String(message)).toContain("Review rejected");
  expect(() => parseReviewValue({ ...field, kind: "regexp" }, "[")).toThrow();
  expect(
    (
      parseReviewValue({ ...field, kind: "regexp" }, "/^Review/i") as RegExp
    ).test("review"),
  ).toBe(true);
});

for (const [platform, Panel] of [
  ["cedar", CedarPanel],
  ["maple", MaplePanel],
] as const) {
  it(`${platform} keeps cached functional slots subscribed to later property overrides`, async () => {
    const Cached = defineComponent({
      setup(_, { slots }) {
        const original = slots.default;
        return () => h("section", original?.());
      },
    });
    const wrapper = mount(Panel, {
      props: { fields },
      slots: {
        default: ({ bindings }: any) =>
          h(Cached, null, {
            default: () =>
              h(Target, { disabled: false, size: "sm", ...bindings }),
          }),
      },
    });
    await flushPromises();
    const panel = wrapper.findComponent(ReviewPanel);
    const state: any = panel.vm;
    const identity = state.activeBindings;
    const row = panel
      .findAll(".demo-review__field")
      .find((row) => row.find("code").text() === "disabled")!;
    await row.get("input[type=checkbox]").setValue(true);
    await row.findAll("input[type=checkbox]")[1].setValue(true);
    expect(wrapper.findComponent(Target).props("disabled")).toBe(true);
    expect(state.activeBindings).toBe(identity);
    await row.get("input[type=checkbox]").setValue(false);
    expect(wrapper.findComponent(Target).props("disabled")).toBe(false);
    wrapper.unmount();
  });
}

for (const [name, Panel] of [
  ["Cedar", CedarPanel],
  ["Maple", MaplePanel],
] as const) {
  it(`${name} inspects documented Options API methods and releases remounted instances`, async () => {
    const OptionsTarget = defineComponent({
      methods: {
        getResult() {
          return "review result";
        },
      },
      render() {
        return h("span", "Options API");
      },
    });
    const wrapper = mount(Panel, {
      props: { fields: [], methodNames: ["get-result"] },
      slots: { default: ({ bindings }) => h(OptionsTarget, bindings) },
    });
    await wrapper.vm.$nextTick();
    const state = wrapper.findComponent({ name: "ReviewPanel" }).vm as any;
    expect(state.methods).toEqual(["getResult"]);
    state.method = "getResult";
    await wrapper.vm.$nextTick();
    await state.invoke();
    expect(state.methodResult).toContain("review result");
    state.remount();
    await wrapper.vm.$nextTick();
    expect(state.methods).toEqual(["getResult"]);
    expect(state.targetCandidates).toHaveLength(1);
    wrapper.unmount();
  });
}

it("does not edit callback arguments as nested configuration or mutate the original function", async () => {
  const callback = () => 0;
  const Nested = defineComponent({
    props: ["config"],
    setup: () => () => h("span", "callback"),
  });
  const wrapper = mount(CedarPanel, {
    props: {
      fields: [
        {
          name: "Record.key",
          kind: "string",
          type: "string",
          description: "",
          defaultValue: "",
          path: ["config", "sorter", "key"],
        },
      ],
    },
    slots: {
      default: ({ bindings }) =>
        h(Nested, { config: { sorter: callback }, ...bindings }),
    },
  });
  await wrapper.vm.$nextTick();
  expect(
    wrapper.get('input[aria-label="Record.key"]').attributes("disabled"),
  ).toBeDefined();
  expect(callback).not.toHaveProperty("key");
  wrapper.unmount();
});

import ReviewSuite from "../src/ReviewSuite.vue";
import { ref as vueRef } from "vue";
it("resets the authored fixture owner as well as its controlled preview value", async () => {
  const Fixture = defineComponent({
    setup() {
      const value = vueRef("initial");
      return () =>
        h(
          CedarPanel,
          { fields: [] },
          {
            default: () =>
              h("div", [
                h("span", { class: "fixture-value" }, value.value),
                h(
                  "button",
                  {
                    class: "fixture-change",
                    onClick: () => (value.value = "changed"),
                  },
                  "change",
                ),
              ]),
          },
        );
    },
  });
  const wrapper = mount(ReviewSuite, {
    props: {
      cases: [{ name: "fixture", label: "fixture", component: Fixture }],
      select: defineComponent({ render: () => h("span") }),
    },
  });
  await wrapper.get(".fixture-change").trigger("click");
  expect(wrapper.get(".fixture-value").text()).toBe("changed");
  await wrapper.findAll(".demo-review__toolbar button")[1].trigger("click");
  await wrapper.vm.$nextTick();
  expect(wrapper.get(".fixture-value").text()).toBe("initial");
  wrapper.unmount();
});

it("creates visible, distinct lazy table rows including a zero parent key", () => {
  const field = {
    name: "load-more",
    type: "(record, done) => void",
    kind: "callback" as const,
    description: "",
    defaultValue: "",
  };
  const batches: any[] = [];
  const callback = createReviewCallback(
    field,
    "allow",
    undefined,
    () => {},
    {},
    () => ({ columns: [{ dataIndex: "name" }], rowKey: "id" }),
  );
  callback({ id: 0 }, (rows: any[]) => batches.push(rows));
  callback({ id: 1 }, (rows: any[]) => batches.push(rows));
  expect(batches[0][0]).toMatchObject({
    id: "0-review-child",
    key: "0-review-child",
    name: "Review child",
    isLeaf: true,
  });
  expect(batches[1][0].id).not.toBe(batches[0][0].id);
});

it("uses current lazy-tree field names for async completion and rejection", async () => {
  const field = {
    name: "load-more",
    type: "(option, done) => void",
    kind: "callback" as const,
    description: "",
    defaultValue: "",
  };
  let properties = {
    fieldNames: { value: "id", label: "name", isLeaf: "leaf" },
  };
  let children: any;
  const callback = createReviewCallback(
    field,
    "async-allow",
    undefined,
    () => {},
    {},
    () => properties,
  );
  await callback({ id: "factory" }, (rows: unknown) => {
    children = rows;
  });
  expect(children[0]).toMatchObject({
    id: "factory-review-child",
    name: "Review child",
    leaf: true,
  });
  properties = {
    fieldNames: { value: "code", label: "title", isLeaf: "terminal" },
  };
  await callback({ code: "device" }, (rows: unknown) => {
    children = rows;
  });
  expect(children[0]).toMatchObject({
    code: "device-review-child",
    title: "Review child",
    terminal: true,
  });
  children = "pending";
  await createReviewCallback(
    field,
    "async-reject",
    undefined,
    () => {},
    {},
    () => properties,
  )({ code: "device" }, (rows: unknown) => {
    children = rows;
  });
  expect(children).toBeUndefined();
});

it("treats selected table filter values as alternatives", () => {
  const field = {
    name: "TableFilterable.filter",
    type: "(values, record) => boolean",
    kind: "callback" as const,
    description: "",
    defaultValue: "",
  };
  const callback = createReviewCallback(
    field,
    "custom",
    undefined,
    () => {},
    {},
  );
  expect(callback(["Ada", "Lin"], { name: "Ada" })).toBe(true);
  expect(callback(["Ada", "Lin"], { name: "Lin" })).toBe(true);
  expect(callback(["Ada", "Lin"], { name: "Grace" })).toBe(false);
  expect(callback([], { name: "Grace" })).toBe(true);
});

it("preserves case-insensitive single-query option filtering", () => {
  const field = {
    name: "filter-option",
    type: "(input, option) => boolean",
    kind: "callback" as const,
    description: "",
    defaultValue: "",
  };
  const callback = createReviewCallback(
    field,
    "custom",
    undefined,
    () => {},
    {},
  );
  expect(callback("aD", { label: "Ada" })).toBe(true);
  expect(callback("aD", { label: "Lin" })).toBe(false);
});

it("completes promise-only tree loading using the current mapped node fields", async () => {
  const field = {
    name: "load-more",
    type: "(node) => Promise<void>",
    kind: "callback" as const,
    description: "",
    defaultValue: "",
  };
  const node: any = { id: 0, caption: "Parent" };
  await createReviewCallback(
    field,
    "async-allow",
    undefined,
    () => {},
    {},
    () => ({
      fieldNames: {
        key: "id",
        title: "caption",
        children: "nodes",
        isLeaf: "terminal",
      },
    }),
  )(node);
  expect(node.nodes).toHaveLength(1);
  expect(node.nodes[0]).toMatchObject({
    id: "0-review-child",
    caption: "Review child",
    terminal: true,
  });
  expect(node.children).toBeUndefined();
});

it("reports async tree loading rejection without mutating existing children", async () => {
  const field = {
    name: "load-more",
    type: "(node) => Promise<void>",
    kind: "callback" as const,
    description: "",
    defaultValue: "",
  };
  const children = [{ key: "retained" }];
  const node = { key: "parent", children };
  const records: string[] = [];
  await expect(
    createReviewCallback(
      field,
      "async-reject",
      undefined,
      (name) => records.push(name),
      {},
    )(node),
  ).rejects.toThrow("Review loading rejected");
  expect(node.children).toBe(children);
  expect(records).toEqual(["callback:load-more", "error:load-more"]);
});

it("keeps the active Tree loader stable while its source data is mutated", async () => {
  const data = ref([{ key: "parent", title: "Parent" }]);
  const wrapper = mount(CedarPanel, {
    props: { fields: treeReviewConfig.fields as any },
    slots: {
      default: ({ bindings }: any) =>
        h(CTree, { data: data.value, ...bindings }),
    },
  });
  await flushPromises();
  const topic = reviewTopics(treeReviewConfig.fields as any).find((topic) =>
    topic.fields.some((field) => field.name === "load-more"),
  );
  wrapper
    .findAllComponents(CSelect)
    .find((select) =>
      select.props("options")?.some((option) => option.value === topic!.name),
    )!
    .vm.$emit("update:modelValue", topic!.name);
  await flushPromises();
  const row = wrapper
    .findAll(".demo-review__field")
    .find((item) => item.text().startsWith("load-more"))!;
  await row.get("input[type=checkbox]").setValue(true);
  row.findComponent(CSelect).vm.$emit("update:modelValue", "async-allow");
  await flushPromises();
  await wrapper.get(".c-tree-node-switcher-icon").trigger("click");
  await flushPromises();
  expect(wrapper.get(".demo-review__preview").text()).toContain("Review child");
  expect(wrapper.findAll(".c-tree-node")).toHaveLength(2);
  wrapper.unmount();
});
