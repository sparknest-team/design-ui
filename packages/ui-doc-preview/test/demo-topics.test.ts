import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeAll, expect, test, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import * as CedarIcons from '../../../../cedar-design-web/packages/icons/src/index'
import Cedar from '../../../../cedar-design-web/packages/ui/src/cedar-vue'
import * as MapleIcons from '../../../../maple-design-mobile/packages/icons/src/index'
import Maple from '../../../../maple-design-mobile/packages/ui/src/maple-vue'

const demos = import.meta.glob(
  '../../../../{cedar-design-web/packages/ui,maple-design-mobile/packages/ui}/src/**/{appearance-lab,state-lab,layout-lab,feedback,field-choice,field-components,field-date,field-time,field-tree,field-rating,field-selection,field-upload,field-specialized,field-panel-actions,value-mapping,clearable,field-names,custom-icons}.vue',
)
const buttonDemos = import.meta.glob(
  '../../../../{cedar-design-web/packages/ui,maple-design-mobile/packages/ui}/src/button/{__demos__,example/demos}/{variants,loading,button-group,button-group-layout,button-group-content}.vue',
)
const formDemos = import.meta.glob(
  '../../../../{cedar-design-web/packages/ui,maple-design-mobile/packages/ui}/src/form/{__demos__,example/demos}/{field-range-boundaries,field-presentation,presentation-state}.vue',
)
let wrapper: ReturnType<typeof mount> | undefined
beforeAll(() => {
  class Observer {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('ResizeObserver', Observer)
  vi.stubGlobal('IntersectionObserver', Observer)
  window.matchMedia ??= ((media: string) => ({
    matches: false,
    media,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  })) as any
  Element.prototype.scrollTo ??= function () {}
  Element.prototype.scrollIntoView ??= function () {}
})
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})
for (const [file, load] of Object.entries({
  ...demos,
  ...buttonDemos,
  ...formDemos,
})) {
  if (!/(?:__demos__|example\/demos)\//.test(file)) continue
  const maple = file.includes('maple-design-mobile')
  test(`runs ${file.split('/src/')[1]}`, async () => {
    const warnings: string[] = []
    const Library = maple ? Maple : Cedar
    const icons = Object.fromEntries(
      Object.entries(maple ? MapleIcons : CedarIcons)
        .filter(([name]) => name.startsWith('Icon'))
        .map(([name, component]) => [(maple ? 'M' : 'C') + name, component]),
    )
    wrapper = mount(((await load()) as any).default, {
      attachTo: document.body,
      global: {
        plugins: [
          Library,
          createRouter({
            history: createMemoryHistory(),
            routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }],
          }),
        ],
        components: icons,
        config: {
          warnHandler(message) {
            warnings.push(message)
          },
        },
      },
    })
    await flushPromises()
    expect(wrapper.findAll(maple ? '[class*="mp-"]' : '[class*="c-"]').length).toBeGreaterThan(0)
    const selectors = wrapper.findAllComponents({
      name: maple ? 'MpSelect' : 'CSelect',
    })
    if (/-lab\.vue$/.test(file)) {
      const script = wrapper.vm as any
      const state = script.__demoAppearance ?? script.__demoLayout ?? script.__demoState
      expect(Object.keys(state).length).toBeLessThanOrEqual(3)
      for (const select of script.__demoAppearance || script.__demoLayout
        ? selectors.slice(0, Object.keys(state).length)
        : []) {
        const options = select.props('options') as any[]
        select.vm.$emit('update:modelValue', options.at(-1).value)
      }
      for (const checkbox of wrapper
        .findAllComponents({ name: maple ? 'MpCheckbox' : 'CCheckbox' })
        .slice(0, Object.keys(state).length))
        checkbox.vm.$emit('update:modelValue', true)
      await flushPromises()
      const component = file
        .split('/src/')[1]
        .split('/')[0]
        .replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase())
      const target = wrapper.findAllComponents({ name: (maple ? 'Mp' : 'C') + component }).at(-1)!
      expect(target.exists()).toBe(true)
      for (const [key, value] of Object.entries(state)) expect(target.props(key)).toEqual(value)
    }
    expect(
      warnings.filter((message) =>
        /Failed to resolve component|Unhandled error|Invalid prop|Property .* was accessed during render/.test(message),
      ),
    ).toEqual([])
  })
}
