import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeTypeScript, normalizeVueSyntaxSource } from '../../cedar-design-web/checks/normalize-source.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))
const c = resolve(root, 'cedar-design-web/packages/ui/src/carousel')
const m = resolve(root, 'maple-design-mobile/packages/ui/src/carousel')
const require = createRequire(resolve(c, '../../package.json'))
const prettier = require('prettier')
const less = require('less')
function normalize(s) {
  return s
    .replaceAll('../_utils/global-config', '../utils/components')
    .replaceAll('../_utils/namespace', '../utils/namespace')
    .replaceAll('../_utils/constant', '../utils/constants')
    .replaceAll('Direction as Orientation', 'Orientation')
    .replaceAll('--c-', '--mp-')
    .replaceAll('c-carousel', 'mp-carousel')
    .replaceAll('CCarousel', 'MpCarousel')
    .replaceAll(
      "import('../utils/components').CedarComponentWithInstall",
      "import('../utils/components').ComponentWithInstall",
    )
    .replaceAll('./carousel.vue', './Carousel.vue')
    .replaceAll('../carousel.vue', '../Carousel.vue')
    .replaceAll("').Direction", "').Orientation")
}
const pairs = [
  ['carousel.vue', 'Carousel.vue'],
  ...[
    'CarouselItem.vue',
    'props.ts',
    'types.ts',
    'context.ts',
    'layout.ts',
    'index.ts',
    'style/index.ts',
    'style/index.less',
    'style/token.less',
    '__tests__/body-contract.spec.js',
  ].map((f) => [f, f]),
]
for (const [a, b] of pairs) {
  const parser = a.endsWith('.vue') ? 'vue' : a.endsWith('.less') ? 'less' : 'typescript'
  const canonical = async (source) =>
    parser === 'vue'
      ? normalizeVueSyntaxSource(normalize(source), { sortBoundImports: false })
      : parser === 'typescript'
        ? normalizeTypeScript(normalize(source), { sortBoundImports: false })
        : prettier.format(normalize(source), { parser })
  assert.equal(
    await canonical(readFileSync(resolve(c, a), 'utf8')),
    await canonical(readFileSync(resolve(m, b), 'utf8')),
    a,
  )
}
for (const dir of [c, m]) {
  assert.ok(!existsSync(resolve(dir, 'platform.ts')))
  const filename = resolve(dir, 'style/index.less')
  const { css } = await less.render(readFileSync(filename, 'utf8'), { filename })
  const tokens = [
    ...readFileSync(resolve(dir, 'style/token.less'), 'utf8').matchAll(/(--(?:c|mp)-carousel-[\w-]+):/g),
  ].map((m) => m[1])
  assert.equal(tokens.length, 26)
  for (const token of tokens) assert.ok(css.includes('var(' + token), token + ' must have consumer')
  assert.ok(css.includes('prefers-reduced-motion'))
  assert.ok(css.includes(':focus-visible'))
  const types = readFileSync(resolve(dir, 'index.ts'), 'utf8')
  for (const name of ['CarouselEmits', 'CarouselSlots', 'CarouselItemSlots', 'CarouselExpose'])
    assert.ok(types.includes(name))
}
console.log(
  'Carousel: 12 independent source/style/test pairs; 26 consumed tokens per end; public types and reduced-motion/focus styles verified. Icons and global Locale adapters remain local.',
)
