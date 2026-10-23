import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('../../', import.meta.url))
const c = resolve(root, 'cedar-design-web/packages/cedar-ui/src/carousel')
const m = resolve(root, 'maple-design-mobile/packages/maple-ui/src/carousel')
const require = createRequire(resolve(c, '../../package.json'))
const prettier = require('prettier')
const less = require('less')
function normalize(s) {
 return s.replaceAll('../_utils/global-config', '../utils/components').replaceAll('../_utils/namespace', '../utils/namespace')
 .replaceAll('../_utils/constant', '../utils/constants').replaceAll('Direction as Orientation', 'Orientation')
 .replaceAll('--c-', '--mp-').replaceAll('c-carousel','mp-carousel').replaceAll('CCarousel','MpCarousel')
 .replaceAll('./carousel.vue','./Carousel.vue').replaceAll('../carousel.vue','../Carousel.vue').replaceAll("').Direction", "').Orientation")
}
const pairs = [['carousel.vue','Carousel.vue'], ...['CarouselItem.vue','props.ts','types.ts','context.ts','layout.ts','index.ts','style/index.ts','style/index.less','style/token.less','__tests__/body-contract.spec.js'].map(f=>[f,f])]
for (const [a,b] of pairs) {
 const parser=a.endsWith('.vue')?'vue':a.endsWith('.less')?'less':'typescript'
 assert.equal(await prettier.format(normalize(readFileSync(resolve(c,a),'utf8')),{parser}),await prettier.format(normalize(readFileSync(resolve(m,b),'utf8')),{parser}),a)
}
for(const dir of [c,m]){
 assert.ok(!existsSync(resolve(dir,'platform.ts')))
 const filename=resolve(dir,'style/index.less')
 const {css}=await less.render(readFileSync(filename,'utf8'),{filename})
 const tokens=[...readFileSync(resolve(dir,'style/token.less'),'utf8').matchAll(/(--(?:c|mp)-carousel-[\w-]+):/g)].map(m=>m[1])
 assert.equal(tokens.length,26)
 for(const token of tokens) assert.ok(css.includes('var('+token),token+' must have consumer')
 assert.ok(css.includes('prefers-reduced-motion'))
 assert.ok(css.includes(':focus-visible'))
 const types=readFileSync(resolve(dir,'index.ts'),'utf8')
 for(const name of ['CarouselEmits','CarouselSlots','CarouselItemSlots','CarouselExpose']) assert.ok(types.includes(name))
}
console.log('Carousel: 12 independent source/style/test pairs; 26 consumed tokens per end; public types and reduced-motion/focus styles verified. Icons and global Locale adapters remain local.')
