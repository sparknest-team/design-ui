import { createApp, h, nextTick } from 'vue'
import NavMenu, { NavMenuItem } from '/cedar-design-web/packages/ui/src/nav-menu/index.ts'
import '/cedar-design-web/packages/ui/src/nav-menu/style/index.ts'

const host = document.querySelector('#fixture'),
  results = []
const settle = async () => {
  await nextTick()
  await new Promise((r) => setTimeout(r, 300))
  await nextTick()
}
const assert = (v, m) => {
  if (!v) throw Error(m)
}
for (const layout of ['dropdown', 'full-width', 'full-height']) {
  let app
  try {
    app = createApp({
      render: () =>
        h(
          NavMenu,
          { mode: 'horizontal', style: { marginLeft: '150px', marginTop: '60px' } },
          {
            default: () =>
              h(NavMenuItem, {
                label: '分类',
                popupLayout: layout,
                options: [
                  { key: 0, label: '全部' },
                  { key: 'a', label: '分类 A' },
                ],
              }),
          },
        ),
    })
    app.mount(host)
    await settle()
    const entry = host.querySelector('[data-nav-item]')
    if (layout === 'dropdown') {
      entry.focus()
      entry.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }))
    } else entry.click()
    await settle()
    const panel = document.querySelector('.c-nav-menu__panel--' + layout)
    assert(panel, 'panel missing')
    if (layout === 'dropdown')
      assert(document.activeElement === panel.querySelector('[data-nav-key="0"]'), 'keyboard panel focus')
    const rect = panel.getBoundingClientRect()
    if (layout === 'full-width') {
      assert(
        Math.abs(rect.left) < 2 && Math.abs(rect.right - innerWidth) < 2,
        'not viewport width ' + JSON.stringify(rect),
      )
      assert(Math.abs(rect.top - entry.getBoundingClientRect().bottom) < 2, 'not below entry')
    }
    if (layout === 'full-height')
      assert(
        Math.abs(rect.top) < 2 && Math.abs(rect.bottom - innerHeight) < 2,
        'not viewport height ' + JSON.stringify(rect),
      )
    panel.querySelector('[data-nav-key="a"]').click()
    await settle()
    assert(entry.textContent.includes('分类 A'), 'title not updated')
    assert(entry.getAttribute('aria-expanded') === 'false', 'not closed')
    assert(document.activeElement === entry, 'focus not restored')
    results.push({ layout, pass: true })
  } catch (e) {
    results.push({ layout, pass: false, error: String(e) })
  } finally {
    app?.unmount()
  }
  document.querySelector('#results').textContent = JSON.stringify(results, null, 2)
}
document.title = `${results.filter((r) => r.pass).length}/${results.length} NavMenu Item checks`
