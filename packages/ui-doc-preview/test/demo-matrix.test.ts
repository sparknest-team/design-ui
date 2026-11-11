import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { nextTick } from "vue";
import { createRouter, createMemoryHistory } from "vue-router";
import {
  writeFileSync,
  renameSync,
  mkdirSync,
  readFileSync,
  existsSync,
} from "node:fs";
import { pathToFileURL } from "node:url";
import Cedar from "../../../../cedar-design-web/packages/ui/src/cedar-vue";
import Maple from "../../../../maple-design-mobile/packages/ui/src/maple-vue";
import * as CedarIcons from "../../../../cedar-design-web/packages/icons/src/index";
import * as MapleIcons from "../../../../maple-design-mobile/packages/icons/src/index";
import ReviewPanel from "../src/ReviewPanel.vue";
import { ImagePreviewAction as MpImagePreviewAction } from "../../../../maple-design-mobile/packages/ui/src/image";
import CLoading from "../../../../cedar-design-web/packages/ui/src/loading";
import CEllipsis from "../../../../cedar-design-web/packages/ui/src/ellipsis";
import { initialReviewValue, parseReviewValue } from "../src/review-state";

const demos = import.meta.glob(
  "../../../../{cedar-design-web/packages/ui,maple-design-mobile/packages/ui}/src/**/api-review*.vue",
);
const caseManifest = JSON.parse(
  readFileSync(
    new URL("../../../audits/demo-review-cases.json", import.meta.url),
    "utf8",
  ),
);
const reviewCases = caseManifest.flatMap((entry: any) =>
  entry.cases.map((item: any) => ({
    ...item,
    full: entry.directory + "/" + item.file,
  })),
);
const results: any[] = [];
const selectedFiles = process.env.DEMO_AUDIT_FILES
  ? JSON.parse(process.env.DEMO_AUDIT_FILES)
  : undefined;
const batchIndex = Number(process.env.DEMO_AUDIT_BATCH ?? 0);
const batchSize = Number(process.env.DEMO_AUDIT_BATCH_SIZE ?? 10000);
const auditFolder = process.env.DEMO_AUDIT_REPORT_DIR
  ? pathToFileURL(process.env.DEMO_AUDIT_REPORT_DIR + "/")
  : new URL(
      "../../../audits/evidence/demo-recheck-2026-10-21/",
      import.meta.url,
    );
mkdirSync(auditFolder, { recursive: true });
let owner: ReturnType<typeof mount> | undefined;
let issues: string[] = [];
beforeAll(() => {
  class Observer {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", Observer);
  vi.stubGlobal("IntersectionObserver", Observer);
  window.matchMedia ??= ((media: string) => ({
    matches: false,
    media,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return true;
    },
  })) as any;
  Element.prototype.scrollTo ??= function () {};
  Element.prototype.scrollIntoView ??= function () {};
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});
afterEach(() => {
  try {
    owner?.unmount();
  } catch (error) {
    const record = results.at(-1);
    if (record) {
      record.status = "failed";
      record.error = `Unmount: ${String(error)}`;
    }
    throw error;
  } finally {
    owner = undefined;
    document.body.innerHTML = "";
  }
});
afterAll(() => {
  const folder = auditFolder;
  mkdirSync(folder, { recursive: true });
  writeFileSync(
    new URL(`runtime-${process.pid}.tmp`, folder),
    JSON.stringify(
      [
        ...(existsSync(new URL("runtime.json", folder))
          ? JSON.parse(
              readFileSync(new URL("runtime.json", folder), "utf8"),
            ).filter(
              (previous) =>
                !results.some((current) => current.file === previous.file),
            )
          : []),
        ...results,
      ].sort((a, b) => a.file.localeCompare(b.file)),
      null,
      2,
    ) + "\n",
  );
  renameSync(
    new URL(`runtime-${process.pid}.tmp`, folder),
    new URL("runtime.json", folder),
  );
  vi.restoreAllMocks();
});
for (const [file, load] of Object.entries(demos)
  .filter(([file]) => reviewCases.some((item: any) => file.endsWith(item.full)))
  .filter(
    ([file]) =>
      !process.env.DEMO_AUDIT_PLATFORM ||
      file.includes(
        process.env.DEMO_AUDIT_PLATFORM === "cedar"
          ? "cedar-design-web"
          : "maple-design-mobile",
      ),
  )
  .filter(
    ([file]) =>
      !selectedFiles ||
      selectedFiles.some((item: string) => file.endsWith(item)),
  )
  .filter(
    ([file]) =>
      !process.env.DEMO_AUDIT_PATTERN ||
      new RegExp(process.env.DEMO_AUDIT_PATTERN).test(file),
  )
  .sort()
  .slice(batchIndex * batchSize, (batchIndex + 1) * batchSize)) {
  const platform = file.includes("cedar-design-web") ? "cedar" : "maple";
  const component = file
    .split("/src/")[1]
    .replace(/\/(?:__demos__|example)\/.*$/, "");
  describe(`${platform}/${component}/${file.split("/").at(-1)}`, () => {
    it("mounts the real fixture and combines, removes, remounts and resets overrides", async () => {
      const record: any = {
        platform,
        component,
        file,
        status: "failed",
        fields: [],
        combination: [],
        warnings: [],
      };
      results.push(record);
      issues = [];
      try {
        const module: any = await load();
        const router = createRouter({
          history: createMemoryHistory(),
          routes: [
            { path: "/:pathMatch(.*)*", component: { render: () => null } },
          ],
        });
        await router.push("/");
        await router.isReady();
        owner = mount(module.default, {
          attachTo: document.body,
          global: {
            plugins: [platform === "cedar" ? Cedar : Maple, router],
            components: {
              ...Object.fromEntries(
                Object.entries(platform === "cedar" ? CedarIcons : MapleIcons)
                  .filter(([name]) => name.startsWith("Icon"))
                  .map(([name, value]) => [
                    (platform === "cedar" ? "C" : "M") + name,
                    value,
                  ]),
              ),
              ...(platform === "cedar"
                ? {
                    CLoading,
                    CEllipsis,
                    CImagePreviewAction: Cedar.ImagePreviewAction,
                  }
                : { MpImagePreviewAction }),
            },
            config: {
              warnHandler(message) {
                issues.push(message);
              },
            },
          },
        });
        await flushPromises();
        const panel = owner.findComponent(ReviewPanel);
        expect(panel.exists()).toBe(true);
        const reviewState = panel.vm as any;
        const visitedFields = new Set<string>();
        for (const topic of reviewState.topics) {
          reviewState.changeTopic(topic.name);
          await flushPromises();
          const visible = panel.findAll(".demo-review__field");
          expect(visible.length).toBeLessThanOrEqual(3);
          expect(visible.map((row) => row.find("code").text())).toEqual(
            reviewState.fields.map((field) => field.name),
          );
          for (const field of reviewState.fields) {
            visitedFields.add(field.name);
            record.fields.push({
              name: field.name,
              control: field.kind,
              controllerRendered: true,
              available: reviewState.canEdit(field),
            });
          }
        }
        expect(visitedFields.size).toBe(reviewState.resolvedFields.length);
        const selectedTopic = [...reviewState.topics].sort(
          (a, b) =>
            b.fields.filter((field) =>
              [
                "size",
                "variant",
                "status",
                "disabled",
                "readonly",
                "clearable",
              ].includes(field.name),
            ).length -
            a.fields.filter((field) =>
              [
                "size",
                "variant",
                "status",
                "disabled",
                "readonly",
                "clearable",
              ].includes(field.name),
            ).length,
        )[0];
        if (selectedTopic) reviewState.changeTopic(selectedTopic.name);
        await flushPromises();
        const fields = reviewState.fields;
        const rows = new Map(
          panel
            .findAll(".demo-review__field")
            .map((row) => [row.find("code").text(), row]),
        );
        const caseInfo = reviewCases.find((item: any) =>
          file.endsWith(item.full),
        );
        const name =
          (platform === "cedar" ? "C" : "Mp") +
          caseInfo.tag
            .replace(/^(?:c|mp)-/, "")
            .split(/[-/]/)
            .map((part) => part[0].toUpperCase() + part.slice(1))
            .join("");
        const targets = () =>
          panel
            .find(".demo-review__preview")
            .findAllComponents({ name })
            .filter(
              (target) =>
                target.isVisible() && target.vm.$.vnode.props?.onVnodeMounted,
            );
        record.targets = (panel.vm as any).boundInstances.length;
        record.methods = (panel.vm as any).methods;
        record.exposedProperties = Object.keys(
          (panel.vm as any).exposedProperties,
        );
        record.methodArguments = {};
        for (const methodName of (panel.vm as any).methods) {
          (panel.vm as any).method = methodName;
          await nextTick();
          record.methodArguments[methodName] = (panel.vm as any).methodExamples;
        }
        (panel.vm as any).method = "";
        const state: any = panel.vm;
        function inspectBindings(selectedFields: any[]) {
          for (const field of selectedFields)
            for (const instance of state.boundInstances) {
              const key = field.name.replace(
                /-([a-z])/g,
                (_match: string, c: string) => c.toUpperCase(),
              );
              if (key in instance.props)
                expect(instance.props[key]).toEqual(state.bindings[field.name]);
            }
        }
        expect(rows.size).toBe(fields.length);
        // Verify each real component controller, then retain two independent scalar
        // properties together and inspect the bindings consumed by the real fixture.
        const candidates = fields.filter((f: any) =>
          [
            "boolean",
            "enum",
            "string",
            "scalar",
            "number",
            "json",
            "callback",
            "regexp",
            "date",
            "node",
            "component",
            "operations",
            "locale",
          ].includes(f.kind),
        );
        for (const field of candidates) {
          const control = rows.get(field.name)!;
          expect(control.find("input[type=checkbox]").exists()).toBe(true);
          const controlName = {
            boolean: "Checkbox",
            enum: "Select",
            number: "InputNumber",
            json: "Textarea",
            string: "Input",
            scalar: "Input",
            callback: "Select",
            regexp: "Input",
            date: "Input",
            node: "Input",
            component: "Select",
            operations: "Select",
            locale: "Select",
          }[field.kind];
          expect(
            control
              .findComponent({
                name: (platform === "cedar" ? "C" : "Mp") + controlName,
              })
              .exists(),
          ).toBe(true);
          expect(() =>
            parseReviewValue(field, initialReviewValue(field)),
          ).not.toThrow();
          Object.assign(
            record.fields.find((item) => item.name === field.name),
            { initial: initialReviewValue(field) },
          );
        }
        const preferred = [
          "size",
          "variant",
          "status",
          "disabled",
          "round",
          "bordered",
          "clearable",
          "loading",
          "readonly",
          "placeholder",
        ];
        const selected = candidates
          .filter((f: any) => !f.path && preferred.includes(f.name))
          .sort(
            (a: any, b: any) =>
              preferred.indexOf(a.name) - preferred.indexOf(b.name),
          )
          .slice(0, 2);
        if (selected.length < 2)
          selected.push(
            ...candidates
              .filter(
                (f: any) =>
                  !f.path &&
                  ![
                    "callback",
                    "node",
                    "component",
                    "operations",
                    "locale",
                  ].includes(f.kind) &&
                  !selected.includes(f) &&
                  !/auto|default|open|show|current|model|duration|interval|anchor/.test(
                    f.name,
                  ),
              )
              .slice(0, 2 - selected.length),
          );
        for (const field of selected) {
          const row = rows.get(field.name)!;
          await row.get("input[type=checkbox]").setValue(true);
          await flushPromises();
          const initial = parseReviewValue(field, initialReviewValue(field));
          if (
            JSON.stringify(state.bindings[field.name]) !==
            JSON.stringify(initial)
          ) {
            // Stateful loaders can emit update:status during the same tick.
            // An emitted model update must stay in sync rather than be reset.
            const update = `update:${field.name.replace(/-([a-z])/g, (_match: string, c: string) => c.toUpperCase())}`;
            expect(state.entries.some((entry) => entry.name === update)).toBe(
              true,
            );
          } else expect(state.bindings[field.name]).toEqual(initial);
          for (const target of targets()) {
            const key = field.name.replace(
              /-([a-z])/g,
              (_match: string, c: string) => c.toUpperCase(),
            );
            if (key in target.props())
              expect(target.props(key)).toEqual(state.bindings[field.name]);
          }
          inspectBindings([field]);
          record.combination.push(field.name);
        }
        if (selected.length) {
          const fieldToEdit = selected[0];
          const rowToEdit = rows.get(fieldToEdit.name)!;
          if (fieldToEdit.kind === "boolean") {
            await rowToEdit
              .findAll("input[type=checkbox]")[1]
              .setValue(!initialReviewValue(fieldToEdit));
            await flushPromises();
          } else if (
            fieldToEdit.kind === "enum" &&
            fieldToEdit.options.length > 1
          ) {
            const select = rowToEdit.findComponent({
              name: platform === "cedar" ? "CSelect" : "MpSelect",
            });
            select.vm.$emit(
              "update:modelValue",
              fieldToEdit.options.find(
                (value) => value !== initialReviewValue(fieldToEdit),
              ),
            );
            await flushPromises();
          }
          for (const field of selected)
            for (const target of targets()) {
              const key = field.name.replace(
                /-([a-z])/g,
                (_match: string, c: string) => c.toUpperCase(),
              );
              if (key in target.props())
                expect(target.props(key)).toEqual(state.bindings[field.name]);
            }
          inspectBindings(selected);
          const bindings = { ...state.bindings };
          await panel
            .findAll(".demo-review__toolbar button")[0]
            .trigger("click");
          await nextTick();
          expect(Object.keys(state.bindings)).toEqual(Object.keys(bindings));
          const field = selected[0];
          await panel
            .findAll(".demo-review__field")
            .find((row) => row.find("code").text() === field.name)!
            .get("input[type=checkbox]")
            .setValue(false);
          expect(state.bindings).not.toHaveProperty(field.name);
        }
        await panel.findAll(".demo-review__toolbar button")[1].trigger("click");
        expect(state.bindings).toEqual({});
        expect(
          issues.filter((x) =>
            /Failed to resolve component|Unhandled error|Invalid prop/.test(x),
          ),
        ).toEqual([]);
        record.slots = [];
        for (const slot of panel.props("slotNames") ?? []) {
          (panel.vm as any).slotEnabled[slot] = true;
          await flushPromises();
          (panel.vm as any).slotEnabled[slot] = false;
          await flushPromises();
          record.slots.push(slot);
        }
        record.callbackControls = [];
        for (const field of fields.filter(
          (f: any) => f.kind === "callback" && state.canEdit(f),
        )) {
          (panel.vm as any).enabled[field.name] = true;
          await nextTick();
          const path = field.path ? state.fieldPath(field) : [field.name];
          const callback = path.reduce(
            (value: any, key: string) => value?.[key],
            state.bindings,
          );
          expect(typeof callback).toBe("function");
          (panel.vm as any).enabled[field.name] = false;
          record.callbackControls.push(field.name);
        }
        expect(
          issues.filter((x) =>
            /Failed to resolve component|Unhandled error|Invalid prop/.test(x),
          ),
        ).toEqual([]);
        if (
          process.env.DEMO_AUDIT_SERVICE_ACTIONS &&
          caseInfo.name === "service"
        ) {
          const trigger = panel
            .findAll("button")
            .find((button) => button.text() === "触发 / Trigger");
          expect(trigger).toBeTruthy();
          await trigger!.trigger("click");
          await flushPromises();
          expect(
            state.entries.some((entry: any) => entry.name === "service:error"),
          ).toBe(false);
          record.serviceTriggered = true;
          record.handleMethods = [...state.methods];
          record.methods = [...new Set([...record.methods, ...state.methods])];
          if (
            panel.props("handle") &&
            typeof (panel.props("handle") as any).close === "function"
          ) {
            state.method = "close";
            await nextTick();
            await state.invoke();
            await flushPromises();
          }
          state.reset();
          await flushPromises();
        }
        record.status = "passed";
      } catch (error) {
        record.error = String(error);
        throw error;
      } finally {
        record.warnings = [...new Set(issues)];
        writeFileSync(
          new URL("runtime-progress.json", auditFolder),
          JSON.stringify(results, null, 2),
        );
      }
    }, 120000);
  });
}
