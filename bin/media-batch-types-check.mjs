import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const workspace = fileURLToPath(new URL("../../", import.meta.url));
for (const [repo, declarations] of [
  ["cedar-design-web/packages/cedar-ui", "types"],
  ["maple-design-mobile/packages/maple-ui", "types-generated"],
]) {
  const root = resolve(workspace, repo);
  const require = createRequire(resolve(root, "package.json"));
  const ts = require("typescript");
  assert.ok(
    existsSync(resolve(root, declarations, "index.d.ts")),
    `${repo}: build the library first`,
  );
  const filename = resolve(root, "__media_batch_published_types__.ts");
  const source =
    ["index", "carousel/index", "upload/index"]
      .map((entry, index) => {
        const components =
          entry === "index"
            ? ["Carousel", "Upload"]
            : [entry.startsWith("carousel") ? "Carousel" : "Upload"];
        return components
          .map((name) => {
            const suffix = name + index;
            const imports = ["Props", "Emits", "Slots", "Expose"]
              .map((part) => `${name}${part} as ${suffix}${part}`)
              .join(", ");
            const props =
              name === "Carousel"
                ? "{ current: 1, effect: 'fade', slidesPerView: 2, centeredSlides: true }"
                : "{ modelValue: [], resolveType: 'file', autoUpload: false, readonly: true, listType: 'picture-card' }";
            const invalid =
              name === "Carousel"
                ? "{ current: 'not-a-number' }"
                : "{ maxFiles: 'not-a-number' }";
            const method =
              name === "Carousel"
                ? "instance.next()"
                : "instance.getFiles('success')";
            return `
import type { ${imports} } from './${declarations}/${entry}'
export const defaults${suffix}: ${suffix}Props = {}
export const props${suffix}: ${suffix}Props = ${props}
export type events${suffix} = ${suffix}Emits
export type slots${suffix} = ${suffix}Slots
export function method${suffix}(instance: ${suffix}Expose) { return ${method} }
// @ts-expect-error numeric inputs must not degrade to any
export const invalid${suffix}: ${suffix}Props = ${invalid}
`;
          })
          .join("\n");
      })
      .join("\n") +
    ["index", "upload/index"]
      .map(
        (entry, index) => `
import { useUploader as useUploader${index} } from './${declarations}/${entry}'
import type { UploadFileItem as UploadFileItem${index}, UploadRequestOptions as UploadRequestOptions${index} } from './${declarations}/${entry}'
export type uploader${index} = ReturnType<typeof useUploader${index}>
export const remote${index}: UploadFileItem${index} = { uid: 'remote', name: 'file.txt', status: 'success', percent: 100 }
export function request${index}(options: UploadRequestOptions${index}) { options.onSuccess({ ok: true }) }
`,
      )
      .join("\n");
  const options = {
    noEmit: true,
    strict: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    allowSyntheticDefaultImports: true,
  };
  const host = ts.createCompilerHost(options);
  const getSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (
    file,
    languageVersion,
    onError,
    shouldCreateNewSourceFile,
  ) =>
    file === filename
      ? ts.createSourceFile(file, source, languageVersion, true)
      : getSourceFile(
          file,
          languageVersion,
          onError,
          shouldCreateNewSourceFile,
        );
  const program = ts.createProgram([filename], options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);
  assert.equal(
    diagnostics.length,
    0,
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: (file) => file,
      getCurrentDirectory: () => root,
      getNewLine: () => "\n",
    }),
  );
  const checker = program.getTypeChecker();
  const module = checker.getSymbolAtLocation(program.getSourceFile(filename));
  for (const symbol of checker.getExportsOfModule(module)) {
    const type =
      symbol.flags & ts.SymbolFlags.TypeAlias
        ? checker.getDeclaredTypeOfSymbol(symbol)
        : checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
    assert.ok(
      !(type.flags & ts.TypeFlags.Any),
      `${repo}: ${symbol.name} degraded to any`,
    );
  }
  console.log(
    `${repo}: Carousel / Upload root and subpath published declarations passed`,
  );
}
