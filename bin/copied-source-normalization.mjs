import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const ts = createRequire(new URL('../../maple-design-mobile/packages/ui/package.json', import.meta.url))('typescript')

export const normalizeCopiedSource = (source) =>
  source
    .replaceAll('@cedar-design/shared-vue', '@maple-design/shared-vue')
    .replaceAll('@cedar-design/use-vue', '@maple-design/use-vue')
    .replaceAll('@cedar-design/icons-vue', '@maple-design/icons-vue')
    .replaceAll('../_utils/maple/elements', '../utils/elements')
    .replaceAll('../_utils/size-length', '../utils/size-length')
    .replaceAll('../_utils/popup-container', '../utils/popup-container')
    .replaceAll('../_utils/popup-layer', '../utils/popup-layer')
    .replaceAll('../_utils/popup-transition', '../utils/popup-transition')
    .replaceAll('../_utils/text-input-value', '../utils/text-input-value')
    .replaceAll('../_utils/empty-value', '../utils/empty-value')
    .replace(/^([ \t]*import[^\n]*?\bfrom[ \t]*['"])\.\.\/_utils\/vue-compat(?=['"])/gm, '$1../utils/vue-compat')
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
    .replaceAll('data-c-theme', 'data-mp-theme')
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

export function assertCopiedVueCompat(cedarSource, mapleSource) {
  const normalize = (source, platform, prefix) => {
    const replacements = [
      [`duplicate ${platform} module formats`, 'duplicate platform module formats'],
      [`@${platform.toLowerCase()}-design/vue-id-counter/v1`, '@platform-design/vue-id-counter/v1'],
      [`@${platform.toLowerCase()}-design/vue-id-fallback-registry/v1`, '@platform-design/vue-id-fallback-registry/v1'],
      [`return \`${prefix}-v-\${count}\``, 'return `platform-v-${count}`'],
    ]
    for (const [expected, canonical] of replacements) {
      assert.equal(source.split(expected).length - 1, 1, `Expected one ${platform} vue-compat namespace`)
      source = source.replace(expected, canonical)
    }
    return source
  }
  assert.equal(
    normalize(cedarSource, 'Cedar', 'c'),
    normalize(mapleSource, 'Maple', 'mp'),
    'Copied vue-compat implementations differ',
  )
}

// Cedar and Maple now share the outline border and border-color rules for all three statuses.
// Validate both complete rules before normalizing their form for comparison.
export function normalizeButtonOutline(cedarSource, mapleSource) {
  const cedar =
    /&--variant-outline\s*\{\s*border:\s*thin\s+solid\s+currentColor;\s*&\.c-button--status-default:not\(\.c-button--disabled\),\s*&\.c-button--status-secondary:not\(\.c-button--disabled\),\s*&\.c-button--status-tertiary:not\(\.c-button--disabled\)\s*\{\s*border-color:\s*var\(--c-sys-color-border-default\);\s*\}\s*\}/g
  const maple =
    /&--variant-outline\s*\{\s*border:\s*thin\s+solid\s+currentColor;\s*&\.mp-button--status-default:not\(\.mp-button--disabled\),\s*&\.mp-button--status-secondary:not\(\.mp-button--disabled\),\s*&\.mp-button--status-tertiary:not\(\.mp-button--disabled\)\s*\{\s*border-color:\s*var\(--mp-sys-color-border-default\);\s*\}\s*\}/g
  assert.equal([...cedarSource.matchAll(cedar)].length, 1, 'Cedar Button outline platform rule changed')
  assert.equal([...mapleSource.matchAll(maple)].length, 1, 'Maple Button outline platform rule changed')
  const outline = '&--variant-outline { border: thin solid currentColor; }'
  return [cedarSource.replace(cedar, outline), mapleSource.replace(maple, outline)]
}

// Switch error foregrounds are intentionally platform-specific. Limit the
// exception to this exact declaration and assert each reviewed expression.
export function normalizeSwitchErrorText(source, prefix, expected) {
  const pattern = new RegExp(
    `(&--error:not\\(\\.${prefix}-switch--disabled\\):not\\(\\.${prefix}-switch--loading\\)\\s*&__text\\s*\\{\\s*color:)\\s*([^;]+);`,
  )
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
  const result = ts.transform(file, [
    (context) => {
      const block = (statement) => (ts.isBlock(statement) ? statement : ts.factory.createBlock([statement], true))
      const visit = (node) => {
        node = ts.visitEachChild(node, visit, context)
        return ts.isIfStatement(node)
          ? ts.factory.updateIfStatement(
              node,
              node.expression,
              block(node.thenStatement),
              node.elseStatement ? block(node.elseStatement) : undefined,
            )
          : node
      }
      return (node) => ts.visitNode(node, visit)
    },
  ])
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

// Parse the SFC script independently: removing all SFC whitespace would also
// erase significant whitespace in JavaScript strings and template literals.
export function normalizeCopiedSfcScript(source, transform) {
  const script = normalizeCopiedSource(source).match(/<script\b[^>]*>([\s\S]*?)<\/script>/)?.[1]
  assert.notEqual(script, undefined, 'Cannot compare an SFC without a script')
  const lines = script
    .replace(/import\s*\{([^}]+)\}\s*from/g, (_match, names) => {
      const imports = names
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean)
        .sort()
        .join(', ')
      return `import { ${imports} } from`
    })
    .split('\n')
  const imports = lines.filter((line) => line.startsWith('import ')).sort()
  return normalizeCopiedTypeScript(
    [...imports, ...lines.filter((line) => !line.startsWith('import '))].join('\n'),
    transform,
  )
}

/** Leave SFC markup intact while comparing its script through the AST path. */
export function stripCopiedSfcScript(source) {
  const pattern = /(<script\b[^>]*>)[\s\S]*?(<\/script>)/
  assert.match(source, pattern, 'Cannot compare an SFC without a script')
  return source.replace(pattern, '$1$2')
}
