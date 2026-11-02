import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectNamingProps, checkNamingProps, inventory, runCheck } from './api-naming-check.mjs'
const base = { owner: 'props', name: 'orientation', meaning: '轨道横纵轴', values: ['horizontal', 'vertical'] }
const check = (source, entries = [base]) => checkNamingProps(collectNamingProps(source), entries)

test('accepts reviewed runtime props and ignores CSS and event payload objects', () => {
  assert.deepEqual(check(`const props={orientation:{type:String,default:'vertical'}}; const style={position:'absolute'}; const event={direction:'next'}`), [])
})
test('unknown properties require a semantic review, including SFC defineProps', () => {
  const props = collectNamingProps(`<script setup lang="ts">defineProps<{ placement?: 'left' | 'right' }>()</script><style>.x{position:absolute}</style>`, 'Box.vue')
  assert.equal(props.length, 1)
  assert.match(checkNamingProps(props, [])[0], /unreviewed naming/)
})
test('rejects orientation pollution even when an entry tries to permit it', () => {
  assert.match(check(`const props={orientation:{type:String,default:'row'}}`).join('\n'), /outside/)
  assert.match(check(`const props={orientation:{type:String}}`, [{...base, values:['row']}]).join('\n'), /only accepts/)
})
test('rejects horizontal/vertical direction but allows context-specific movement direction', () => {
  const entry={...base,name:'direction',values:['horizontal','vertical']}
  assert.match(check(`const props={direction:{type:String,default:'horizontal'}}`, [entry]).join('\n'), /must use orientation/)
  assert.deepEqual(check(`const props={direction:{type:String,default:'left'}}`, [{...entry,meaning:'动作展开方向',values:['left','right']}]), [])
})
test('validates inline type literals and does not confuse indexed type keys with values', () => {
  assert.match(check(`const props={orientation:{type:String as PropType<'row'|'vertical'>}}`).join('\n'), /inline value row/)
  assert.deepEqual(check(`const props={orientation:{type:String as PropType<Other['orientation']>}}`), [])
})
test('specific pending renames permit either name but reject compatibility aliases', () => {
  const entry={...base,name:'expandDirection',target:'placement',values:['left','right']}
  assert.deepEqual(check(`const props={placement:{type:String,default:'left'}}`, [entry]), [])
  assert.match(check(`const props={expandDirection:{type:String},placement:{type:String}}`, [entry]).join('\n'), /cannot coexist/)
  assert.match(check(`const props={orientation:{type:String}}`, [entry]).join('\n'), /stale registry/)
})
test('placement type names must agree, with narrowly recorded pending migrations', () => {
  const source=`const props={placement:{type:String as PropType<MenuPosition>}}`
  const entry={...base,name:'placement',values:['top']}
  assert.match(check(source,[entry]).join('\n'), /Placement type/)
  assert.deepEqual(check(source,[{...entry,pendingType:'MenuPosition'}]), [])
})
test('registry rejects missing sources and incomplete semantic declarations', () => {
  assert.match(runCheck({entries:[{...base,file:'missing.ts'}]},[])[0], /source is missing/)
  assert.match(check(`const props={orientation:{type:String}}`,[{...base,meaning:''}]).join('\n'), /requires a meaning/)
})
test('duplicate declarations cannot shadow an existing naming policy', () => {
  const entry={...base,file:'props.ts'}
  const files=[{file:'props.ts',props:collectNamingProps(`const props={orientation:{type:String}}`)}]
  assert.match(runCheck({entries:[entry,entry]},files).join('\n'), /duplicate naming contract/)
  assert.match(check(`const props={orientation:{type:String,default:'row' as Orientation}}`).join('\n'), /outside/)
})
test('axis domain is distinct from layout and uses reviewed x/y/xy values', () => {
  assert.match(check(`const props={axis:{type:String}}`,[{...base,name:'axis',values:['row']}]).join('\n'), /only accepts/)
})
test('both lint paths enforce the checker and the real registry covers current declarations', () => {
  const workspace=fileURLToPath(new URL('../../',import.meta.url))
  const registry=JSON.parse(readFileSync(resolve(workspace,'design-ui/configs/api-naming.json'),'utf8'))
  const files=['cedar-design-web/packages/cedar-ui/src','maple-design-mobile/packages/maple-ui/src'].flatMap(p=>inventory(resolve(workspace,p)))
  assert.deepEqual(runCheck(registry,files),[])
  const c=JSON.parse(readFileSync(resolve(workspace,'cedar-design-web/packages/cedar-ui/package.json'),'utf8'))
  const m=JSON.parse(readFileSync(resolve(workspace,'maple-design-mobile/package.json'),'utf8'))
  assert.match(c.scripts.lint,/api-naming-check\.mjs/)
  assert.match(m.scripts['lint:check'],/check:api-naming/)
  assert.match(m.scripts['check:api-naming'],/api-naming-check\.mjs/)
})
