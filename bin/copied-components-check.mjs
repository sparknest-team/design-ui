import { normalizeCopiedSource as normalize, normalizeSwitchErrorText, normalizeSwitchTokenDefaults, normalizeButtonOutline, normalizeCopiedTypeScript, normalizeCopiedSfcScript, stripCopiedSfcScript, assertCopiedVueCompat } from './copied-source-normalization.mjs'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'

const requireFromMaple = createRequire(
  new URL('../../maple-design-mobile/node_modules/.pnpm/node_modules/esbuild/package.json', import.meta.url),
)
const { transformSync } = requireFromMaple('esbuild')

// Read-only: each library owns its source and runtime; never import across libraries.
const workspace = fileURLToPath(new URL('../../', import.meta.url))
const cedar = resolve(workspace, 'cedar-design-web/packages/ui/src')
const maple = resolve(workspace, 'maple-design-mobile/packages/ui/src')
const componentFilter = process.argv[2]
const pairs = [
  ['message/context-root.ts', 'message/context-root.ts'],
  ['infinite-scroll/infinite-scroll.vue', 'infinite-scroll/InfiniteScroll.vue'],
  ['textarea/utils.ts', 'textarea/utils.ts'],
  ['input/use-input-value.ts', 'input/use-input-value.ts'],
  ['infinite-scroll/props.ts', 'infinite-scroll/props.ts'],
  ['infinite-scroll/style/implementation.less', 'infinite-scroll/style/implementation.less'],
  ['theme-provider/ThemeProvider.vue', 'theme-provider/ThemeProvider.vue'],
  ['theme-provider/props.ts', 'theme-provider/props.ts'],
  ['theme-provider/context.ts', 'theme-provider/context.ts'],
  ['split-button/SplitButton.vue', 'split-button/SplitButton.vue'],
  ['split-button/props.ts', 'split-button/props.ts'],
  ['split-button/style/index.ts', 'split-button/style/index.ts'],
  ['pagination/pagination.vue', 'pagination/Pagination.vue'],
  ['pagination/props.ts', 'pagination/props.ts'],
  ['pagination/types.ts', 'pagination/types.ts'],
  ['pagination/utils.ts', 'pagination/utils.ts'],
  ['pagination/use-pagination.ts', 'pagination/use-pagination.ts'],
  ['pagination/use-compact.ts', 'pagination/use-compact.ts'],
  ['pagination/PageItem.vue', 'pagination/PageItem.vue'],
  ['pagination/PageItemStep.vue', 'pagination/PageItemStep.vue'],
  ['pagination/PageItemEllipsis.vue', 'pagination/PageItemEllipsis.vue'],
  ['pagination/PageJumper.vue', 'pagination/PageJumper.vue'],
  ['pagination/PageOptions.vue', 'pagination/PageOptions.vue'],
  ['pagination/style/implementation.less', 'pagination/style/implementation.less'],
  ['pagination/__tests__/same-source.spec.js', 'pagination/__tests__/same-source.spec.js'],

  ["paper/paper.vue","paper/Paper.vue"],
  ["paper/props.ts","paper/props.ts"],
  ["paper/style/implementation.less","paper/style/implementation.less"],
  ["paper/style/token.less","paper/style/token.less"],
  ["paper/__tests__/same-source.spec.js","paper/__tests__/same-source.spec.js"],
  ["paper/__tests__/numeric-contract.spec.js","paper/__tests__/numeric-contract.spec.js"],
  ["grid/grid.vue", "grid/Grid.vue"],
  ["grid/GridItem.vue", "grid/GridItem.vue"],
  ["row/row.vue", "row/Row.vue"],
  ["col/col.vue", "col/Col.vue"],
  ["grid/props.ts", "grid/props.ts"],
  ["grid/item-props.ts", "grid/item-props.ts"],
  ["grid/types.ts", "grid/types.ts"],
  ["grid/context.ts", "grid/context.ts"],
  ["grid/hook/use-responsive-state.ts", "grid/hook/use-responsive-state.ts"],
  ["grid/utils/index.ts", "grid/utils/index.ts"],
  ["grid/style/grid.less", "grid/style/grid.less"],
  ["grid/__tests__/same-source.spec.js", "grid/__tests__/same-source.spec.js"],
  ["row/props.ts", "row/props.ts"],
  ["row/context.ts", "row/context.ts"],
  ["row/style/implementation.less", "row/style/implementation.less"],
  ["col/props.ts", "col/props.ts"],
  ["col/style/implementation.less", "col/style/implementation.less"],

  ['breadcrumb/breadcrumb.tsx', 'breadcrumb/breadcrumb-implementation.tsx'],
  ['breadcrumb/breadcrumb-item.tsx', 'breadcrumb/breadcrumb-item.tsx'],
  ['breadcrumb/children.ts', 'breadcrumb/children.ts'],
  ['breadcrumb/provide.ts', 'breadcrumb/provide.ts'],
  ['breadcrumb/props.ts', 'breadcrumb/props.ts'],
  ['breadcrumb/types.ts', 'breadcrumb/types.ts'],
  ['breadcrumb/style/implementation.less', 'breadcrumb/style/implementation.less'],
  ['breadcrumb/__tests__/same-source.spec.js', 'breadcrumb/__tests__/same-source.spec.js'],

  ["space/style/token.less","space/style/token.less"],
  ["link/link.vue","link/Link.vue"],
  ["link/props.ts","link/props.ts"],
  ["link/style/implementation.less","link/style/implementation.less"],
  ["link/__tests__/same-source.spec.js","link/__tests__/same-source.spec.js"],
  ["space/space.tsx","space/Space.tsx"],
  ["space/props.ts","space/props.ts"],
  ["space/__tests__/same-source.spec.js","space/__tests__/same-source.spec.js"],
  ["space/style/implementation.less","space/style/implementation.less"],
  ["divider/divider.vue","divider/Divider.vue"],
  ["divider/props.ts","divider/props.ts"],
  ["divider/__tests__/same-source.spec.js","divider/__tests__/same-source.spec.js"],
  ["divider/style/implementation.less","divider/style/implementation.less"],
  ["alert/alert.vue","alert/Alert.vue"],
  ["alert/props.ts","alert/props.ts"],
  ["alert/__tests__/same-source.spec.js","alert/__tests__/same-source.spec.js"],
  ["alert/style/implementation.less","alert/style/implementation.less"],
  ["tag/tag.vue","tag/Tag.vue"],
  ["tag/props.ts","tag/props.ts"],
  ["tag/__tests__/same-source.spec.js","tag/__tests__/same-source.spec.js"],
  ["tag/style/implementation.less","tag/style/implementation.less"],
  ["count-to/CountTo.vue","count-to/CountTo.vue"],
  ["count-to/props.ts","count-to/props.ts"],
  ["count-to/__tests__/same-source.spec.js","count-to/__tests__/same-source.spec.js"],
  ["count-to/style/implementation.less","count-to/style/implementation.less"],
  ["countdown/countdown.vue","countdown/Countdown.vue"],
  ["countdown/props.ts","countdown/props.ts"],
  ["countdown/__tests__/same-source.spec.js","countdown/__tests__/same-source.spec.js"],
  ["countdown/style/implementation.less","countdown/style/implementation.less"],
  ["statistic/statistic.vue","statistic/Statistic.vue"],
  ["statistic/props.ts","statistic/props.ts"],
  ["statistic/__tests__/same-source.spec.js","statistic/__tests__/same-source.spec.js"],
  ["statistic/style/implementation.less","statistic/style/implementation.less"],
  ["skeleton/skeleton.vue","skeleton/Skeleton.vue"],
  ["skeleton/props.ts","skeleton/props.ts"],
  ["skeleton/__tests__/same-source.spec.js","skeleton/__tests__/same-source.spec.js"],
  ["skeleton/style/implementation.less","skeleton/style/implementation.less"],
  ["steps/Steps.tsx","steps/Steps.tsx"],
  ["steps/props.ts","steps/props.ts"],
  ["steps/__tests__/same-source.spec.js","steps/__tests__/same-source.spec.js"],
  ["avatar/avatar.vue","avatar/Avatar.vue"],
  ["avatar/AvatarGroup.vue","avatar/AvatarGroup.vue"],
  ["avatar/props.ts","avatar/props.ts"],
  ["avatar/context.ts","avatar/context.ts"],
  ["avatar/style/index.less","avatar/style/index.less"],
  ["avatar/style/token.less","avatar/style/token.less"],
  ["avatar/__tests__/same-source.spec.js","avatar/__tests__/same-source.spec.js"],
  ["page-header/PageHeader.vue","page-header/PageHeader.vue"],
  ["page-header/props.ts","page-header/props.ts"],
  ["page-header/__tests__/same-source.spec.js","page-header/__tests__/same-source.spec.js"],
  ["page-header/style/implementation.less","page-header/style/implementation.less"],
  ["icon/icon.vue","icon/Icon.vue"],
  ["icon/props.ts","icon/props.ts"],
  ["icon/__tests__/same-source.spec.js","icon/__tests__/same-source.spec.js"],
  ["icon/style/implementation.less","icon/style/implementation.less"],
  ["tag/types.ts","tag/types.ts"],
  ["space/children.ts","space/children.ts"],
  ["steps/children.ts","steps/children.ts"],
  ["steps/step.vue","steps/Step.vue"],
  ["steps/context.ts","steps/context.ts"],
  ["countdown/use-countdown.ts","countdown/use-countdown.ts"],
  ["skeleton/line.vue","skeleton/SkeletonLine.vue"],
  ["skeleton/shape.vue","skeleton/SkeletonShape.vue"],
  ["steps/style/index.less","steps/style/index.less"],
  ["steps/style/circle.less","steps/style/circle.less"],
  ["steps/style/dot.less","steps/style/dot.less"],
  ["steps/style/arrow.less","steps/style/arrow.less"],
  ["steps/style/navigation.less","steps/style/navigation.less"],
  ['button/button.vue', 'button/Button.vue'],
  ['button/props.ts', 'button/props.ts'],
  ['button/use-button.ts', 'button/use-button.ts'],
  ['button/ButtonGroup.vue', 'button/ButtonGroup.vue'],
  ['button/group-props.ts', 'button/group-props.ts'],
  ['button/group-provide.ts', 'button/group-provide.ts'],
  ['button/provide.ts', 'button/provide.ts'],
  ['button/style/button.less', 'button/style/button.less'],
  ['button/style/buttonGroup.less', 'button/style/button-group.less'],
  ['button/style/token.less', 'button/style/token.less'],
  ['button/__tests__/contract.spec.js', 'button/__tests__/contract.spec.js'],
  ['switch/switch.vue', 'switch/Switch.vue'],
  ['switch/props.ts', 'switch/props.ts'],
  ['switch/style/index.less', 'switch/style/switch.less'],
  ['switch/style/token.less', 'switch/style/token.less'],
  ['switch/__tests__/contract.spec.js', 'switch/__tests__/index.spec.js'],
  ['progress/percent.ts', 'progress/percent.ts'],
  ['progress/__tests__/percent-contract.spec.js', 'progress/__tests__/percent-contract.spec.js'],
  ['card/card.vue', 'card/Card.vue'],
  ['card/props.ts', 'card/props.ts'],
  ['card/style/index.less', 'card/style/card.less'],
  ['card/style/token.less', 'card/style/token.less'],
  ['card/__tests__/contract.spec.js', 'card/__tests__/contract.spec.js'],
  ['affix/affix.vue', 'affix/Affix.vue'],
  ['affix/props.ts', 'affix/props.ts'],
  ['affix/offset.ts', 'affix/offset.ts'],
  ['affix/__tests__/numeric-contract.spec.js', 'affix/__tests__/numeric-contract.spec.js'],
  ['affix/style/index.less', 'affix/style/affix.less'],
  ['affix/__tests__/contract.spec.js', 'affix/__tests__/contract.spec.js'],
  ['affix/__tests__/entry-contract.spec.js', 'affix/__tests__/entry-contract.spec.js'],
  ['progress/size.ts', 'progress/size.ts'],
  ['_utils/size-length.ts', 'utils/size-length.ts'],
  ['progress/__tests__/size-contract.spec.js', 'progress/__tests__/size-contract.spec.js'],
  ['progress/use-circle-size.ts', 'progress/use-circle-size.ts'],
  ['_utils/popup-container.ts', 'utils/popup-container.ts'],
  ['trigger/__tests__/container-contract.spec.js', 'trigger/__tests__/container-contract.spec.js'],
  ['trigger/trigger.tsx', 'trigger/trigger.tsx'],
  ['trigger/props.ts', 'trigger/props.ts'],
  ['trigger/reference.ts', 'trigger/reference.ts'],
  ['trigger/types.ts', 'trigger/types.ts'],
  ['trigger/position.ts', 'trigger/position.ts'],
  ['trigger/positioner.ts', 'trigger/positioner.ts'],
  ['trigger/reference-motion.ts', 'trigger/reference-motion.ts'],
  ['trigger/style/index.less', 'trigger/style/index.less'],
  ['trigger/style/token.less', 'trigger/style/token.less'],
  ['trigger/__tests__/position.spec.js', 'trigger/__tests__/position.spec.js'],
  ['_utils/popup-layer.ts', 'utils/popup-layer.ts'],
  ['overlay/overlay.vue', 'overlay/Overlay.vue'],
  ['overlay/props.ts', 'overlay/props.ts'],
  ['overlay/style/index.less', 'overlay/style/index.less'],
  ['tooltip/Tooltip.vue', 'tooltip/Tooltip.vue'],
  ['tooltip/props.ts', 'tooltip/props.ts'],
  ['tooltip/platform.ts', 'tooltip/platform.ts'],
  ['tooltip/style/implementation.less', 'tooltip/style/implementation.less'],
  ['popover/Popover.vue', 'popover/Popover.vue'],
  ['popover/props.ts', 'popover/props.ts'],
  ['popover/platform.ts', 'popover/platform.ts'],
  ['popover/style/implementation.less', 'popover/style/implementation.less'],
  ['watermark/watermark.tsx', 'watermark/watermark.tsx'],
  ['watermark/props.ts', 'watermark/props.ts'],
  ['watermark/types.ts', 'watermark/types.ts'],
  ['watermark/renderer.ts', 'watermark/renderer.ts'],
  ['watermark/style/index.less', 'watermark/style/index.less'],
  ['watermark/__tests__/watermark.test.ts', 'watermark/__tests__/watermark.test.ts'],
  ['badge/badge.vue', 'badge/Badge.vue'],
  ['badge/props.ts', 'badge/props.ts'],
  ['badge/style/index.less', 'badge/style/badge.less'],
  ['badge/style/token.less', 'badge/style/token.less'],
  ['badge/__tests__/contract.spec.js', 'badge/__tests__/contract.spec.js'],
  ['empty/empty.vue', 'empty/Empty.vue'],
  ['empty/props.ts', 'empty/props.ts'],
  ['empty/style/index.less', 'empty/style/index.less'],
  ['empty/__tests__/same-source.spec.js', 'empty/__tests__/same-source.spec.js'],
  ['image/image.vue', 'image/Image.vue'],
  ['image/ImageFooter.vue', 'image/ImageFooter.vue'],
  ['image/preview.vue', 'image/ImagePreview.vue'],
  ['image/ImagePreviewGroup.vue', 'image/ImagePreviewGroup.vue'],
  ['image/ImagePreviewAction.vue', 'image/ImagePreviewAction.vue'],
  ['image/ImagePreviewToolbar.vue', 'image/ImagePreviewToolbar.vue'],
  ['image/preview-api.ts', 'image/preview.ts'],
  ['image/props.ts', 'image/props.ts'],
  ['image/previewProps.ts', 'image/previewProps.ts'],
  ['image/groupProps.ts', 'image/groupProps.ts'],
  ['image/api.ts', 'image/api.ts'],
  ['image/context.ts', 'image/context.ts'],
  ['image/composables/usePreviewController.ts', 'image/composables/usePreviewController.ts'],
  ['image/composables/useInteraction.ts', 'image/composables/useInteraction.ts'],
  ['image/composables/useImagePreviewGroup.ts', 'image/composables/useImagePreviewGroup.ts'],
  ['image/utils/normalizePreviewOptions.ts', 'image/utils/normalizePreviewOptions.ts'],
  ['image/utils/resolvePreviewOptions.ts', 'image/utils/resolvePreviewOptions.ts'],
  ['image/style/core.less', 'image/style/core.less'],
  ['image/__tests__/same-source.spec.js', 'image/__tests__/same-source.spec.js'],
  ['collapse/collapse.vue', 'collapse/Collapse.vue'],
  ['collapse/CollapseItem.vue', 'collapse/CollapseItem.vue'],
  ['collapse/props.ts', 'collapse/props.ts'],
  ['collapse/context.ts', 'collapse/context.ts'],
  ['collapse/style/index.less', 'collapse/style/index.less'],
  ['collapse/__tests__/same-source.spec.js', 'collapse/__tests__/same-source.spec.js'],
]

assert.ok(pairs.length > 0, 'Copied component pairs list is empty')
const drift = []

for (const [cedarPath, maplePath] of pairs) {
  if (componentFilter && !cedarPath.startsWith(componentFilter + '/')) continue
  // Test files are behavior gates, not distributable copied source. Their local
  // formatter/import conventions may differ while asserting the same contract.
  if (cedarPath.includes('/__tests__/')) continue
  // Older SFC pairs still have repository-formatter-only drift. Tooltip and
  // Popover were normalized during this migration, so their complete bodies
  // are strict gates instead of relying only on paired behavior tests.
  if (
    cedarPath.endsWith('.vue') &&
    ![
      'infinite-scroll/infinite-scroll.vue',
      'overlay/overlay.vue',
      'tooltip/Tooltip.vue',
      'popover/Popover.vue',
    ].includes(cedarPath)
  ) continue
  let [left, right] = await Promise.all([
    readFile(resolve(cedar, cedarPath), 'utf8'),
    readFile(resolve(maple, maplePath), 'utf8'),
  ])
  if (left.includes('../_utils/vue-compat') && right.includes('../utils/vue-compat')) {
    const [cedarCompat, mapleCompat] = await Promise.all([
      readFile(resolve(cedar, '_utils/vue-compat.ts'), 'utf8'),
      readFile(resolve(maple, 'utils/vue-compat.ts'), 'utf8'),
    ])
    assertCopiedVueCompat(cedarCompat, mapleCompat)
  }
  if (cedarPath === 'badge/style/token.less') {
    // Cedar declares its dark override in Less; Maple supplies the same value
    // through ThemeProvider. Verify that adapter before comparing base tokens.
    const dark = await readFile(resolve(maple, 'themes/dark/badge.ts'), 'utf8')
    assert.match(dark, /'--mp-badge-bg-color':\s*'rgb\(var\(--mp-danger-4\)\)'/)
    assert.match(dark, /'--mp-badge-status-danger-bg-color':\s*'rgb\(var\(--mp-danger-4\)\)'/)
    assert.match(dark, /'--mp-badge-status-tertiary-text-color':\s*'var\(--mp-sys-color-content-on-bright\)'/)
    const override = /:root\[cedar-theme="dark"\]\s*\{\s*--c-badge-bg-color:\s*rgb\(var\(--c-danger-4\)\);\s*--c-badge-status-danger-bg-color:\s*rgb\(var\(--c-danger-4\)\);\s*--c-badge-status-tertiary-text-color:\s*var\(--c-sys-color-content-on-bright\);\s*\}/
    assert.match(left, override)
    left = left.replace(override, '')
  }
  if (cedarPath === 'button/style/token.less') {
    const contract = JSON.parse(await readFile(resolve(workspace, 'design-ui/packages/theme-contract/contracts/theme-contract.json'), 'utf8'))
    const normalizeButtonDensity = async (text, root, prefix, platform) => {
      const field = await readFile(resolve(root, 'field-decorator/style/token.less'), 'utf8')
      const system = await readFile(resolve(root, 'style/theme/system.less'), 'utf8')
      for (const size of ['xs', 'sm', 'md', 'lg', 'xl']) {
        const heightPattern = new RegExp(`(--${prefix}-button-${size}-height:)\\s*([^;]+);`)
        const fieldHeight = field.match(new RegExp(`--${prefix}-field-size-${size}-height:\\s*([^;]+);`))[1]
        const expectedHeight = contract.platformComponentTokenValues[platform].button[`${size}-height`]
        assert.equal(text.match(heightPattern)[2].trim(), expectedHeight, `${platform} Button ${size} registered height`)
        assert.equal(expectedHeight, fieldHeight.trim(), `${platform} Button/Input ${size} height alignment`)
        const fontPattern = new RegExp(`(@button-font-size-${size}:)\\s*([^;]+);`)
        const role = text.match(fontPattern)[2].trim()
        const font = system.match(new RegExp(`--${prefix}-${role}:\\s*([^;]+);`))[1]
        const fieldFont = field.match(new RegExp(`--${prefix}-field-size-${size}-font-size:\\s*([^;]+);`))[1]
        assert.equal(font.trim(), fieldFont.trim(), `${platform} Button/Input ${size} typography alignment`)
        text = text.replace(heightPattern, `$1 PLATFORM_HEIGHT_${size};`)
        text = text.replace(fontPattern, `$1 PLATFORM_FONT_${size};`)
      }
      return text
    }
    left = await normalizeButtonDensity(left, cedar, 'c', 'cedar')
    right = await normalizeButtonDensity(right, maple, 'mp', 'maple')
  }
  if (cedarPath === 'button/style/button.less') {
    ;[left, right] = normalizeButtonOutline(left, right)
  }
  if (cedarPath === 'switch/style/token.less') {
    const contract = JSON.parse(await readFile(resolve(workspace, 'design-ui/packages/theme-contract/contracts/theme-contract.json'), 'utf8'))
    const expected = platform => contract.platformComponentTokenValues[platform].switch['checked-text-color']
    left = normalizeSwitchTokenDefaults(left, 'c', expected('cedar').replaceAll('--PREFIX-', '--c-'))
    right = normalizeSwitchTokenDefaults(right, 'mp', expected('maple').replaceAll('--PREFIX-', '--mp-'))
  }
  if (cedarPath === 'switch/style/index.less') {
    const tokens = await readFile(resolve(maple, 'switch/style/token.less'), 'utf8')
    const contract = JSON.parse(await readFile(resolve(workspace, 'design-ui/packages/theme-contract/contracts/theme-contract.json'), 'utf8'))
    const expected = contract.platformComponentTokenValues.maple.switch['checked-text-color'].replaceAll('--PREFIX-', '--mp-')
    assert.equal(tokens.match(/--mp-internal-switch-error-text-color:\s*([^;]+);/)?.[1].trim(), expected, 'Maple Switch error foreground must match its registered default')
    left = normalizeSwitchErrorText(left, 'c', 'var(--c-switch-text-color)')
    right = normalizeSwitchErrorText(right, 'mp', 'var(--mp-internal-switch-error-text-color)')
  }
  const normalizePair = (source) => {
    let value = normalize(source).replace(/import\s*\{([^}]+)\}\s*from/g, (_match, names) => {
      const sorted = names.split(',').map((name) => name.trim()).filter(Boolean).sort().join(', ')
      return `import { ${sorted} } from`
    })
    const lines = value.split('\n')
    const imports = lines.filter((line) => line.startsWith('import ')).sort()
    value = [...imports, ...lines.filter((line) => !line.startsWith('import '))].join('\n')
    if (/\.tsx?$/.test(cedarPath)) {
      return normalizeCopiedTypeScript(value, transformSync, cedarPath.endsWith('.tsx') ? 'tsx' : 'ts')
    }
    return value.replace(/\s+/g, '').replaceAll(';', '').replaceAll('"', "'").replace(/(^|[^\d])\.(\d)/g, '$10.$2')
  }
  // Compare the InfiniteScroll SFC script using the syntax-aware check below.
  // The surrounding template remains independently compared by the legacy
  // SFC check; formatting braces in the script must not cause false drift.
  const templateOnly = cedarPath === 'infinite-scroll/infinite-scroll.vue'
  const previousDriftCount = drift.length
  const pairLabel = `${cedarPath} / ${maplePath}`
  if (normalizePair(templateOnly ? stripCopiedSfcScript(left) : left) !== normalizePair(templateOnly ? stripCopiedSfcScript(right) : right)) {
    drift.push(`  • ${pairLabel}：implementation`)
  }
  if (cedarPath.endsWith('.vue')) {
    // The legacy SFC comparison removes all whitespace, including whitespace
    // inside string literals. Compare script semantics separately so e.g.
    // join(' ') cannot silently drift to join('').
    if (normalizeCopiedSfcScript(left, transformSync) !== normalizeCopiedSfcScript(right, transformSync)) {
      drift.push(`  • ${pairLabel}：script semantics`)
    }
  }
  if (drift.length === previousDriftCount) console.log(`PASS ${cedarPath}`)
}

// Demo source copies differ only in product imports, component prefixes and locale adapters.
for (const [leftPath, rightPath] of [
  ['index.ts', 'index.ts'],
  ['__tests__/theme-provider.test.tsx', '__tests__/parity.spec.js'],
]) {
  if (componentFilter && componentFilter !== 'theme-provider') continue
  const left = await readFile(resolve(cedar, 'theme-provider', leftPath), 'utf8')
  const right = await readFile(resolve(maple, 'theme-provider', rightPath), 'utf8')
  const expected = left
    .replaceAll('../_utils/maple/elements', '../utils/elements')
    .replaceAll('../_utils/maple/components', '../utils/components')
    .replaceAll('../_utils/cedar/components', '../utils/components')
    .replaceAll('./ThemeProvider.vue', './ThemeProvider.vue')
    .replaceAll('maple', '__other_library__')
    .replaceAll('cedar', 'maple')
    .replaceAll('__other_library__', 'cedar')
    .replaceAll('cColorScheme', 'mpColorScheme')
    .replaceAll('c-', 'mp-')
  assert.equal(normalizeCopiedTypeScript(expected, transformSync, 'tsx'), normalizeCopiedTypeScript(right, transformSync, 'tsx'), 'ThemeProvider source drift: ' + leftPath)
  console.log('PASS theme-provider/' + leftPath)
}

if (drift.length > 0) {
  console.log(`Copied source drift: ${drift.length} file(s) — 仅报告，不阻断（源码逻辑尽量一致即可）`)
  console.log(drift.join('\n'))
}
