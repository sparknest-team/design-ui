import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const ts = createRequire(new URL('../../maple-design-mobile/packages/maple-ui/package.json', import.meta.url))('typescript')

export const normalizeCopiedSource = (source) => source
  .replaceAll('@cedar-design/shared', '@maple-design/shared')
  .replaceAll('@cedar-design/use', '@maple-design/use')
  .replaceAll('@cedar-design/icons-vue', '@maple-design/icons-vue')
  .replaceAll('../_utils/maple/elements', '../utils/elements')
  .replaceAll('../_utils/size-length', '../utils/size-length')
  .replaceAll('../_utils/popup-container', '../utils/popup-container')
  .replaceAll('../_utils/popup-layer', '../utils/popup-layer')
  .replaceAll('../_utils/popup-transition', '../utils/popup-transition')
  .replaceAll('../_utils/text-input-value', '../utils/text-input-value')
  .replaceAll('../_utils/empty-value', '../utils/empty-value')
  .replaceAll('../_utils/scroll-lock', '../utils/scroll-lock')
  .replaceAll('../_utils/global-config', '../utils/components')
  .replaceAll('../_utils/components', '../utils/components')
  .replaceAll('../_utils/cedar/components', '../utils/components')
  .replaceAll('../_utils/constant', '../utils/constants')
  .replaceAll('./avatar.vue', './Avatar.vue')
  .replaceAll('./avatar-group.vue', './AvatarGroup.vue')
  .replaceAll('./empty.vue', './Empty.vue')
  .replaceAll('./preview-group.vue', './ImagePreviewGroup.vue')
  .replaceAll('./preview-toolbar.vue', './ImagePreviewToolbar.vue')
  .replaceAll('./preview-action.vue', './ImagePreviewAction.vue')
  .replaceAll('./image-footer.vue', './ImageFooter.vue')
  .replaceAll('./preview.vue', './ImagePreview.vue')
  .replaceAll('./Preview.vue', './ImagePreview.vue')
  .replaceAll('./PreviewGroup.vue', './ImagePreviewGroup.vue')
  .replaceAll('./image.vue', './Image.vue')
  .replaceAll('../badge.vue', '../Badge.vue')
  .replaceAll('../card.vue', '../Card.vue')
  .replaceAll('../affix.vue', '../Affix.vue')
  .replaceAll('class="c-breadcrumb', 'class="mp-breadcrumb')
  .replaceAll('c-space-item-', 'mp-space-item-')
  .replaceAll('c-skeleton-animation', 'mp-skeleton-animation')
  .replaceAll('c-icon-spin', 'mp-icon-spin')
  .replaceAll('c-tag', 'mp-tag')
  .replaceAll('cedar-theme', 'maple-theme')
  .replaceAll('cedar-style-vars', 'maple-style-vars')
  .replaceAll('c-switch', 'mp-switch')
  .replaceAll('c-button', 'mp-button')
  .replaceAll('c-row', 'mp-row')
  .replaceAll('c-col', 'mp-col')
  .replaceAll('`c${Capitalize<string>}`', '`mp${Capitalize<string>}`')
  .replaceAll('--c-', '--mp-')
  .replaceAll('.c-', '.mp-')
  .replaceAll("'c-", "'mp-")
  .replaceAll('"c-', '"mp-')
  .replaceAll('import("vue")', "import('vue')")
  .replace(/\n[ \t]*\n/g, '\n')
  .trim()

// Switch error foregrounds are intentionally platform-specific. Limit the
// exception to this exact declaration and assert each reviewed expression.
export function normalizeSwitchErrorText(source, prefix, expected) {
  const pattern = new RegExp(`(&--error:not\\(\\.${prefix}-switch--disabled\\):not\\(\\.${prefix}-switch--loading\\)\\s*&__text\\s*\\{\\s*color:)\\s*([^;]+);`)
  let matches = 0
  const result = source.replace(pattern, (_match, property, value) => {
    matches++
    assert.equal(value.trim(), expected, `${prefix}: unreviewed Switch error foreground`)
    return `${property} PLATFORM_ERROR_TEXT;`
  })
  assert.equal(matches, 1, `${prefix}: missing Switch error text rule`)
  return result
}

export function normalizeSwitchTokenDefaults(source, prefix, expected) {
  const property = new RegExp(`(--${prefix}-switch-checked-text-color:)\\s*([^;]+);`)
  assert.equal(source.match(property)?.[2].trim(), expected, `${prefix}: unreviewed Switch checked foreground`)
  let result = source.replace(property, '$1 PLATFORM_CHECKED_TEXT;')
  if (prefix === 'mp') {
    const internal = /--mp-internal-switch-error-text-color:\s*([^;]+);/
    assert.equal(source.match(internal)?.[1].trim(), expected, 'mp: unreviewed Switch error token')
    result = result.replace(internal, '')
  }
  return result
}

// Identifier minification depends on source character frequency, so formatting
// changes can rename equivalent bindings differently. Normalize syntax/spacing
// while preserving the binding names used by the copied source.
export function normalizeCopiedTypeScript(source, transform, loader = 'ts') {
  const file = ts.createSourceFile('source.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  assert.equal(file.parseDiagnostics.length, 0, 'Cannot compare invalid TypeScript')
  const result = ts.transform(file, [context => {
    const block = statement => ts.isBlock(statement) ? statement : ts.factory.createBlock([statement], true)
    const visit = node => {
      node = ts.visitEachChild(node, visit, context)
      return ts.isIfStatement(node)
        ? ts.factory.updateIfStatement(node, node.expression, block(node.thenStatement), node.elseStatement ? block(node.elseStatement) : undefined)
        : node
    }
    return node => ts.visitNode(node, visit)
  }])
  const printed = ts.createPrinter({ removeComments: true }).printFile(result.transformed[0])
  result.dispose()
  return transform(printed, {
    loader,
    format: 'esm',
    minifyWhitespace: true,
    minifySyntax: true,
    minifyIdentifiers: false,
    treeShaking: false,
  }).code
}
