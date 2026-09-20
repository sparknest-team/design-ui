import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const root = fileURLToPath(new URL('../../', import.meta.url))
const ui = ['cedar-design-web/packages/cedar-ui/src', 'maple-design-mobile/packages/maple-ui/src']
const groups = [
  ['modal', ['_utils/popup-transition.ts', 'dialog/dialog.vue', 'drawer/drawer.vue', 'overlay/overlay.vue'], ['utils/popup-transition.ts', 'dialog/Dialog.vue', 'popup/Popup.tsx', 'overlay/Overlay.tsx']],
  ['picker', ['_utils/picker-data.ts', 'date/picker/panels/date/index.vue', 'time/picker/utils/index.ts', 'time/picker/hooks/use-time-list.ts'], ['utils/picker-data.ts', 'date/datetime.ts', 'date/picker-panels/day-picker-panel.vue', 'time/picker-utils.ts', 'time-range/picker-utils.ts', 'time-range/TimeRangePicker.vue']],
  ['tooltip', ['tooltip/tooltip.vue', 'tooltip/platform.ts', 'tooltip/props.ts', 'trigger/wrapper.ts'], ['tooltip/Tooltip.vue', 'tooltip/platform.ts', 'tooltip/props.ts', 'trigger/wrapper.ts']],
  ['popover', ['popover/popover.vue', 'popover/platform.ts', 'popover/props.ts'], ['popover/Popover.vue', 'popover/platform.ts', 'popover/props.ts']],
  ['menu', ['menu/render.ts', 'menu/platform.ts', 'menu/level.ts', 'menu/context.ts', 'menu/types.ts', 'menu/option-props.ts', 'menu/group-props.ts', 'menu/submenu-props.ts', 'menu/menu-group.vue', 'menu/menu.vue', 'menu/menu-option.vue', 'menu/menu-submenu.vue', 'menu/menu-panel.vue', 'menu/options.ts', 'menu/selection.ts', 'menu/keyboard.ts', 'menu/props.ts', 'menu/index.ts'], ['menu/render.ts', 'menu/platform.ts', 'menu/level.ts', 'menu/context.ts', 'menu/types.ts', 'menu/option-props.ts', 'menu/group-props.ts', 'menu/submenu-props.ts', 'menu/MenuGroup.vue', 'menu/Menu.vue', 'menu/MenuOption.vue', 'menu/MenuChildren.vue', 'menu/MenuPanel.vue', 'menu/options.ts', 'menu/selection.ts', 'menu/keyboard.ts', 'menu/props.ts', 'menu/index.ts']],
  ['trigger', ['trigger/trigger.tsx', 'trigger/render.ts', 'trigger/render-props.ts', 'trigger/popup.ts', 'trigger/arrow.ts', 'trigger/geometry.ts', 'trigger/resize.ts', 'trigger/state.ts', 'trigger/reference.ts', 'trigger/contract.ts', 'trigger/interaction.ts', 'trigger/interaction-props.ts', 'trigger/props.ts', 'trigger/index.ts'], ['trigger/Trigger.vue', 'trigger/useFloatingTrigger.ts', 'trigger/render.ts', 'trigger/render-props.ts', 'trigger/popup.ts', 'trigger/arrow.ts', 'trigger/geometry.ts', 'trigger/resize.ts', 'trigger/state.ts', 'trigger/reference.ts', 'trigger/contract.ts', 'trigger/interaction.ts', 'trigger/interaction-props.ts', 'trigger/props.ts', 'trigger/index.ts']],
  ['mount', ['_utils/popup-container.ts', '_hooks/use-teleport-container.ts'], ['utils/popup-container.ts', 'utils/components.ts']],
  ['layers', ['_hooks/use-popup-manager.ts', '_utils/popup-layer.ts', 'context/zIndex.ts'], ['context/stack.ts', 'context/zIndex.ts', 'utils/popup-layer.ts']],
  ['scroll-lock', ['_hooks/use-popup-overflow-hidden.ts', '_hooks/use-overflow.ts', '_utils/scroll-lock.ts', 'context/lock.ts'], ['context/lock.ts', 'utils/scroll-lock.ts']],
  ['dom-focus', ['_utils/modal-focus.ts', '_utils/dom.ts', '_utils/keyboard.ts'], ['utils/modal-focus.ts', 'utils/elements.ts']],
  ['vnode', ['_utils/vue-utils.ts', '_hooks/use-first-element.ts'], ['utils/components.ts']],
  ['observer', ['_utils/resize-observer.ts', '_utils/responsive-observe.ts', '_hooks/use-resize-observer.ts', '_components/resize-observer-v2.ts'], ['utils/resize-observer.ts', 'utils/responsive-observe.ts', 'trigger/useFloatingTrigger.ts']],
  ['selection', ['_utils/option-data.ts', '_utils/tree-data.ts', '_utils/input-composition.ts', 'select/hooks/use-options.ts', 'select/utils.ts', 'cascader/utils.ts', '_hooks/use-input.ts', '_components/select-view/select-view.tsx'], ['utils/option-data.ts', 'utils/tree-data.ts', 'utils/input-composition.ts', 'cascader/Cascader.vue', 'input/Input.vue', 'utils/options.ts', 'select/useSelectController.ts']],
  ['form', ['_utils/async-request.ts', '_utils/field-path.ts', 'form/form-item.vue', 'form/utils.ts', '_utils/form-control.ts', '_hooks/use-form-item.ts'], ['utils/async-request.ts', 'utils/field-path.ts', 'form/FormItem.vue', 'form/utils.ts']],
  ['configuration', ['_utils/global-config.ts', 'config-provider/config-provider.vue'], ['utils/components.ts', 'style-provider/index.ts', 'locale-provider/provide.ts']],
  ['measure', ['_utils/size-length.ts', '_utils/throttle-by-raf.ts'], ['utils/size-length.ts', 'utils/throttle-by-raf.ts']],
]
const production = file => /\.(ts|tsx|vue|js)$/.test(file) && !/(?:^|\/)(?:__tests__|__demos__|example|docs|style|themes)(?:\/|$)/.test(file)
async function walk(dir) {
  const result = []
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) result.push(...await walk(full))
    else if (production(full)) result.push(full)
  }
  return result
}
const output = { schema: 1, scope: 'Current workspace; static relative import references only, not runtime or transitive dependency guarantees.', groups: [] }
const graphs = []
for (const dir of ui) {
  const files = await walk(path.join(root, dir))
  const known = new Set(files)
  const consumers = new Map()
  for (const file of files) {
    const source = await fs.readFile(file, 'utf8')
    for (const match of source.matchAll(/\bfrom\s*['"]([^'"]+)['"]/g)) {
      if (!match[1].startsWith('.')) continue
      const base = path.resolve(path.dirname(file), match[1])
      const target = [base, ...['.ts', '.tsx', '.vue', '/index.ts'].map(ext => base + ext), base.replace(/\.js$/, '.ts')].find(candidate => known.has(candidate))
      if (!target) continue
      if (!consumers.has(target)) consumers.set(target, new Set())
      consumers.get(target).add(path.relative(root, file))
    }
  }
  graphs.push(consumers)
}
for (const [name, cedar, maple] of groups) {
  const group = { name, files: [] }
  for (const [index, paths] of [cedar, maple].entries()) for (const file of paths) {
    const relative = `${ui[index]}/${file}`
    try {
      const source = await fs.readFile(path.join(root, relative), 'utf8')
      group.files.push({ path: relative, sha256: createHash('sha256').update(source).digest('hex'), consumers: [...(graphs[index].get(path.join(root, relative)) ?? [])].sort() })
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      group.files.push({ path: relative, missing: true })
    }
  }
  output.groups.push(group)
}
const target = path.join(root, 'design-ui/refactors/foundation-alignment/inventory.json')
const serialized = JSON.stringify(output, null, 2) + '\n'
if (process.argv.includes('--check')) {
  if (await fs.readFile(target, 'utf8') !== serialized) throw new Error('Foundation inventory drift; regenerate after reviewing changes.')
} else await fs.writeFile(target, serialized)
console.log(`${process.argv.includes('--check') ? 'Checked' : 'Updated'} ${groups.length} foundation groups; ${target}`)
