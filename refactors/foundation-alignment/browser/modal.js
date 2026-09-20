import { createApp, h, KeepAlive, nextTick, ref } from 'vue'
import CedarDialog from '/cedar-design-web/packages/cedar-ui/src/dialog/index.tsx'
import CedarDrawer from '/cedar-design-web/packages/cedar-ui/src/drawer/index.ts'
import MapleDialog from '/maple-design-mobile/packages/maple-ui/src/dialog/index.ts'
import MaplePopup from '/maple-design-mobile/packages/maple-ui/src/popup/index.ts'
import '/cedar-design-web/packages/cedar-ui/src/dialog/style/index.ts'
import '/cedar-design-web/packages/cedar-ui/src/drawer/style/index.ts'
import '/maple-design-mobile/packages/maple-ui/src/dialog/style/index.ts'
import '/maple-design-mobile/packages/maple-ui/src/popup/style/index.ts'
const container = document.querySelector('#fixture'), results = []
const settle = async () => { await nextTick(); await new Promise(resolve => setTimeout(resolve, 420)); await nextTick() }
const assert = (value, message) => { if (!value) throw new Error(message) }
for (const [name, Modal] of [['Cedar Dialog', CedarDialog], ['Cedar Drawer', CedarDrawer], ['Maple Dialog', MapleDialog], ['Maple Popup', MaplePopup]]) {
  for (const scenario of ['focus and nested restoration', 'touch containment', 'cancel leave and KeepAlive']) {
    let app
    const outside = document.createElement('button'); outside.textContent = 'outside'; document.body.append(outside); outside.focus()
    try {
      const open = ref(true), child = ref(false), active = ref(true), events = []
      const Child = { render: () => h(Modal, { open: child.value, popupContainer: 'body', onClosed: () => events.push('child closed') }, { default: () => h('button', { 'data-child': '' }, 'child') }) }
      const Parent = { render: () => h(Modal, { open: open.value, popupContainer: 'body', onOpened: () => events.push('opened'), onClosed: () => events.push('closed') }, { default: () => [h('button', { 'data-first': '' }, 'first'), h('div', { style: 'display:none' }, h('button', 'hidden')), h('div', { 'data-scroll': '', style: 'height:80px;overflow-y:auto' }, h('div', { style: 'height:320px' }, 'scroll')), h('button', { 'data-last': '' }, 'last'), child.value ? h(Child) : null] }) }
      app = createApp({ render: () => h(KeepAlive, null, { default: () => active.value ? h(Parent) : null }) }); app.mount(container); await settle()
      const first = document.querySelector('[data-first]'), last = document.querySelector('[data-last]')
      const dialog = first.closest('[role="dialog"]')
      assert(dialog && dialog.getBoundingClientRect().width > 0, 'modal not visible')
      if (scenario === 'focus and nested restoration') {
        dialog.focus(); dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })); assert(dialog.contains(document.activeElement), 'Tab escaped modal')
        first.focus(); child.value = true; await settle(); const childButton = document.querySelector('[data-child]'); assert(childButton.closest('[role="dialog"]').contains(document.activeElement), 'nested modal did not own focus')
        child.value = false; await settle(); assert(document.activeElement === first, 'child did not restore parent control')
        open.value = false; await settle(); assert(document.activeElement === outside, 'parent did not restore origin')
      } else if (scenario === 'touch containment') {
        const scroll = document.querySelector('[data-scroll]')
        const touch = (target, type, y) => { const event = new Event(type, { bubbles: true, cancelable: true }); Object.defineProperty(event, 'touches', { value: [{ clientX: 0, clientY: y }] }); target.dispatchEvent(event); return event.defaultPrevented }
        touch(scroll, 'touchstart', 100); assert(!touch(scroll, 'touchmove', 50), 'inner scroll blocked')
        scroll.scrollTop = scroll.scrollHeight; assert(touch(scroll, 'touchmove', 0), 'overscroll leaked')
        touch(outside, 'touchstart', 100); assert(touch(outside, 'touchmove', 50), 'background move leaked')
      } else {
        open.value = false; await nextTick(); open.value = true; await settle(); assert(!events.includes('closed'), 'stale closed event after reopen')
        active.value = false; await settle(); assert(document.body.style.overflow !== 'hidden', 'KeepAlive retained scroll lock')
        active.value = true; await settle(); assert(document.body.style.overflow === 'hidden', 'KeepAlive failed to restore lock')
      }
      results.push({ name, scenario, pass: true })
    } catch(error) { results.push({ name, scenario, pass: false, error: String(error) }) }
    finally { app?.unmount(); outside.remove(); await nextTick() }
    document.querySelector('#results').textContent = JSON.stringify(results, null, 2)
  }
}
document.title = `${results.filter(result => result.pass).length}/${results.length} Modal browser checks`
