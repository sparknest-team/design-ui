import { createApp, h, nextTick, ref } from 'vue'
import CedarMenu from '/cedar-design-web/packages/ui/src/menu/index.ts'
import MapleMenu from '/maple-design-mobile/packages/ui/src/menu/index.ts'
import '/cedar-design-web/packages/ui/src/menu/style/index.ts'
import '/maple-design-mobile/packages/ui/src/menu/style/index.ts'

const container = document.querySelector('#fixture')
const results = []
const settle = async () => {
  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 180))
  await nextTick()
}
const assert = (value, message) => {
  if (!value) throw new Error(message)
}
async function key(key) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
  await settle()
}
for (const [name, Menu] of [
  ['Cedar', CedarMenu],
  ['Maple', MapleMenu],
]) {
  for (const scenario of [
    'nested keyboard',
    'rejected checkbox',
    'closed branch cascade',
    'hover child selection',
    'focus restoration',
    'Space once',
    'slot submenu',
  ]) {
    let app
    try {
      const requests = [],
        selections = [],
        model = ref([])
      const props = {
        defaultOpen: true,
        popupContainer: false,
        hideOnSelect: false,
        options: [
          {
            value: 'p',
            label: 'Parent',
            children: [
              { value: 'a', label: 'Alpha' },
              { value: 'off', label: 'Disabled', disabled: true },
              { value: 'b', label: 'Beta' },
            ],
          },
        ],
        'onUpdate:open': (value) => requests.push(value),
        onSelect: (...args) => selections.push(args),
      }
      if (scenario === 'rejected checkbox')
        Object.assign(props, {
          multiple: true,
          modelValue: [],
          options: [{ value: 'a', label: 'Alpha' }],
          'onUpdate:modelValue': (value) => selections.push(value),
        })
      if (scenario === 'closed branch cascade')
        Object.assign(props, {
          multiple: true,
          'onUpdate:modelValue': (value) => {
            model.value = value
          },
        })
      if (scenario === 'hover child selection')
        Object.assign(props, { trigger: 'hover', hideOnSelect: true, options: props.options })
      if (scenario === 'focus restoration')
        Object.assign(props, {
          defaultOpen: false,
          trigger: 'focus',
          hideOnSelect: true,
          options: [{ value: 'a', label: 'Alpha' }],
        })
      if (scenario === 'Space once') props.options = [{ value: 'a', label: 'Alpha' }]
      if (scenario === 'slot submenu') props.options = []
      app = createApp({
        render: () =>
          h(
            Menu,
            { ...props, ...(scenario === 'closed branch cascade' ? { modelValue: model.value } : {}) },
            {
              default: () => h('button', { 'data-reference': '' }, 'Open menu'),
              ...(scenario === 'slot submenu'
                ? {
                    content: () =>
                      h(Menu.Group, { title: 'Actions' }, () =>
                        h(
                          Menu.Submenu,
                          {},
                          {
                            default: () => 'More',
                            content: () => h(Menu.Option, { value: 'slot' }, () => 'Slot child'),
                          },
                        ),
                      ),
                  }
                : {}),
            },
          ),
      })
      app.mount(container)
      await settle()
      const reference = container.querySelector('[data-reference]')
      const items = () => Array.from(document.querySelectorAll('[data-menu-item]'))
      const visible = (element) =>
        element && element.getBoundingClientRect().width > 0 && getComputedStyle(element).visibility !== 'hidden'
      if (scenario === 'nested keyboard') {
        const parent = items()[0]
        parent.focus()
        await key('ArrowRight')
        assert(
          document.activeElement.textContent.includes('Alpha') && visible(document.activeElement),
          'first child focus/visibility',
        )
        await key('ArrowDown')
        assert(document.activeElement.textContent.includes('Beta'), 'disabled row was not skipped')
        await key('Escape')
        assert(document.activeElement === parent && !requests.length, 'Escape closed parent menu')
        await key('Escape')
        assert(document.activeElement === reference && requests.join() === 'false', 'root close/focus')
      } else if (scenario === 'rejected checkbox') {
        const checkbox = items()[0].querySelector('input[type="checkbox"], [role="checkbox"], [tabindex="0"]')
        assert(checkbox, 'checkbox missing')
        checkbox.click()
        await settle()
        assert(items()[0].getAttribute('aria-checked') === 'false', 'rejected model changed row')
        if ('checked' in checkbox) assert(!checkbox.checked, 'rejected model changed native checkbox')
        checkbox.click()
        await settle()
        assert(
          JSON.stringify(selections[0]) === '["a"]' && JSON.stringify(selections[2]) === '["a"]',
          'repeated checkbox request drift',
        )
      } else if (scenario === 'closed branch cascade') {
        items()[0].click()
        await settle()
        assert(
          JSON.stringify(model.value) === '["p","a","b"]',
          'cascade missing unmounted/closed children or selected disabled item',
        )
        assert(items()[0].getAttribute('aria-checked') === 'true', 'accepted parent selection missing')
      } else if (scenario === 'hover child selection') {
        const parent = items()[0]
        // Cedar preserves its click submenu default; Maple preserves hover.
        if (name === 'Cedar') parent.click()
        else parent.dispatchEvent(new MouseEvent('mouseenter'))
        await settle()
        const child = items().find((item) => item.textContent.includes('Alpha'))
        assert(visible(child), 'child popup not visible')
        child.click()
        await settle()
        assert(
          selections.length === 1 && selections[0][0] === 'a' && selections[0][2] instanceof Event,
          'child select payload',
        )
        assert(requests.join() === 'false', 'child selection did not close root')
      } else if (scenario === 'Space once') {
        items()[0].focus()
        await key(' ')
        window.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true, cancelable: true }))
        await settle()
        assert(selections.length === 1 && selections[0][0] === 'a', 'Space duplicate/missing selection')
      } else if (scenario === 'slot submenu') {
        const parent = items()[0]
        parent.focus()
        await key('ArrowRight')
        assert(
          visible(document.activeElement) && document.activeElement.textContent.includes('Slot child'),
          'slot submenu focus',
        )
        await key('Enter')
        assert(selections.length === 1 && selections[0][0] === 'slot', 'slot submenu selection')
        await key('ArrowLeft')
        assert(document.activeElement === parent, 'slot submenu focus restoration')
      } else {
        reference.focus()
        await settle()
        await key('ArrowDown')
        await key('Escape')
        assert(
          document.activeElement === reference && requests.join() === 'true,false',
          'Escape reopened focus trigger',
        )
        reference.blur()
        reference.focus()
        await settle()
        await key('ArrowDown')
        await key('Enter')
        assert(
          document.activeElement === reference && requests.join() === 'true,false,true,false',
          'selection reopened focus trigger',
        )
      }
      results.push({ name, scenario, pass: true })
    } catch (error) {
      results.push({ name, scenario, pass: false, error: String(error) })
    } finally {
      app?.unmount()
    }
    document.querySelector('#results').textContent = JSON.stringify(results, null, 2)
  }
}
document.title = `${results.filter((result) => result.pass).length}/${results.length} Menu browser checks`
