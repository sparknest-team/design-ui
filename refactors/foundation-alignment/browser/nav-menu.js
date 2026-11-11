import { createApp, h, ref, nextTick } from 'vue'
import NavMenu from '/cedar-design-web/packages/ui/src/nav-menu/index.ts'
import '/cedar-design-web/packages/ui/src/nav-menu/style/index.ts'
const host = document.querySelector('#fixture'), results = []
const settle = async () => { await nextTick(); await new Promise(resolve => setTimeout(resolve, 250)); await nextTick() }
const assert = (value, message) => { if (!value) throw new Error(message) }
const key = async (element, key) => { element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })); await settle() }
for (const scenario of ['vertical keyboard', 'horizontal popup', 'overflow resize', 'overflow selection', 'resize focus', 'controlled rejection', 'collapsed labels']) {
  let app
  try {
    const selections = [], expanded = [], width = ref(220), selected = ref(0)
    const options = [{ key: 0, label: '首页' }, { key: 'products', label: '产品与服务', children: [{ key: 'a', label: '云服务器' }, { key: 'off', label: '禁用', disabled: true }, { key: 'b', label: '对象存储' }] }, { key: 'solutions', label: '解决方案' }, { key: 'about', label: '关于我们' }]
    const props = { options, popupContainer: false, onSelect: value => selections.push(value), 'onUpdate:expandedKeys': keys => expanded.push(keys) }
    if (scenario !== 'vertical keyboard') props.mode = 'horizontal'
    if (scenario === 'controlled rejection') Object.assign(props, { modelValue: 0, expandedKeys: [] })
    if (scenario === 'collapsed labels') Object.assign(props, { mode: 'vertical', collapsed: true })
    if (scenario === 'horizontal popup' || scenario === 'controlled rejection' || scenario === 'resize focus') width.value = 700
    app = createApp({ render: () => h(NavMenu, { ...props, style: { width: `${width.value}px` } }) }); app.mount(host); await settle()
    const row = value => document.querySelector(`[data-nav-key="${value}"]`)
    const visible = element => !!element && element.getBoundingClientRect().width > 0 && getComputedStyle(element).visibility !== 'hidden'
    if (scenario === 'vertical keyboard') {
      row(0).focus(); await key(row(0), 'ArrowDown'); assert(document.activeElement === row('products'), 'root arrow navigation')
      await key(row('products'), 'ArrowRight'); assert(document.activeElement === row('a'), 'enter branch')
      await key(row('a'), 'ArrowDown'); assert(document.activeElement === row('b'), 'skip disabled')
      await key(row('b'), 'Enter'); assert(selections.join() === 'b', 'single selection')
    } else if (scenario === 'horizontal popup') {
      row('products').focus(); await key(row('products'), 'ArrowDown'); assert(visible(row('a')), 'popup visible')
      assert(document.activeElement === row('a'), 'popup focus'); await key(row('a'), 'Escape'); assert(document.activeElement === row('products'), 'restore reference')
    } else if (scenario === 'overflow resize') {
      assert(row('__nav_more'), 'more entry missing')
      width.value = 1000; await settle(); assert(!row('__nav_more'), 'more remains after grow')
      width.value = 180; await settle(); assert(row('__nav_more'), 'more missing after shrink')
      const menu = host.querySelector('nav'), list = menu.querySelector('ul')
      assert(list.getBoundingClientRect().right <= menu.getBoundingClientRect().right + 1, 'horizontal items overflow container')
    } else if (scenario === 'resize focus') {
      row('about').focus(); width.value = 150; await settle()
      assert(document.activeElement === row('__nav_more'), 'focus lost after overflow migration')
    } else if (scenario === 'overflow selection') {
      const more = row('__nav_more'); more.focus(); await key(more, 'ArrowDown')
      assert(visible(row('about')), 'hidden items not in popup'); row('about').click(); await settle()
      assert(selections.join() === 'about', 'overflow value changed'); assert(document.activeElement === more, 'overflow focus restoration')
    } else if (scenario === 'controlled rejection') {
      row('products').focus(); await key(row('products'), 'ArrowDown'); assert(!row('a'), 'rejected expanded changed popup')
      row('about').click(); await settle(); assert(!row('about').hasAttribute('aria-current'), 'rejected selection changed row')
    } else {
      assert(host.querySelector('nav').getBoundingClientRect().width === 56, 'collapsed width overridden')
      assert(row(0).getAttribute('aria-label') === '首页', 'collapsed accessible name')
      row('products').focus(); await key(row('products'), 'ArrowRight'); assert(visible(row('a')), 'collapsed popup missing')
    }
    results.push({ scenario, pass: true })
  } catch (error) { results.push({ scenario, pass: false, error: String(error) }) }
  finally { app?.unmount() }
  document.querySelector('#results').textContent = JSON.stringify(results, null, 2)
}
document.title = `${results.filter(result => result.pass).length}/${results.length} NavMenu checks`
