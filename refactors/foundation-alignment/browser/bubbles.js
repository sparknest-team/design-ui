import { createApp, h, nextTick, ref } from 'vue'
import CedarTooltip from '/cedar-design-web/packages/ui/src/tooltip/index.ts'
import CedarPopover from '/cedar-design-web/packages/ui/src/popover/index.ts'
import MapleTooltip from '/maple-design-mobile/packages/ui/src/tooltip/index.ts'
import MaplePopover from '/maple-design-mobile/packages/ui/src/popover/index.ts'
import { IconMore as CedarMore } from '/cedar-design-web/packages/ui/src/breadcrumb/platform.ts'
import { IconMore as MapleMore } from '/maple-design-mobile/packages/ui/src/breadcrumb/platform.ts'
import '/cedar-design-web/packages/ui/src/tooltip/style/index.ts'
import '/cedar-design-web/packages/ui/src/popover/style/index.ts'
import '/maple-design-mobile/packages/ui/src/tooltip/style/index.ts'
import '/maple-design-mobile/packages/ui/src/popover/style/index.ts'

const fixture = document.querySelector('#fixture'), results = []
const settle = async () => { await nextTick(); await new Promise(resolve => setTimeout(resolve, 130)); await nextTick() }
const assert = (value, message) => { if (!value) throw new Error(message) }
for (const [name, Tooltip, Popover, More] of [['Cedar', CedarTooltip, CedarPopover, CedarMore], ['Maple', MapleTooltip, MaplePopover, MapleMore]]) {
  for (const scenario of ['top', 'bottom', 'left', 'right', 'direct More SVG', 'popover controlled title', 'popover cache']) {
    let app
    try {
      if (['top', 'bottom', 'left', 'right'].includes(scenario)) {
        app = createApp({ render: () => h(Tooltip, { defaultOpen: true, animationName: '', showArrow: true, arrowClass: 'test-arrow', backgroundColor: '#123456', placement: scenario, content: 'Shared tooltip' }, { default: () => h('button', { style: 'margin:40px' }, 'reference') }) })
        app.mount(fixture); await settle()
        const content = document.querySelector('[role="tooltip"]'), arrow = document.querySelector('.test-arrow')
        assert(content && arrow, 'content/arrow missing')
        const c = content.getBoundingClientRect(), a = arrow.getBoundingClientRect()
        const edge = scenario === 'top' ? c.bottom : scenario === 'bottom' ? c.top : scenario === 'left' ? c.right : c.left
        const center = ['top','bottom'].includes(scenario) ? a.top + a.height / 2 : a.left + a.width / 2
        assert(c.width > 0 && Math.abs(edge - center) < 2, `arrow detached: ${edge} vs ${center}`)
        assert(getComputedStyle(arrow).backgroundColor === 'rgb(18, 52, 86)', 'arrow color mismatch')
      } else if (scenario === 'direct More SVG') {
        const requests = []
        app = createApp({ render: () => h(Tooltip, { mouseEnterDelay: 0, mouseLeaveDelay: 0, animationName: '', content: ['Home', 'Catalog'].join(' / '), 'onUpdate:open': value => requests.push(['update', value]), onOpenChange: value => requests.push(['change', value]) }, { default: () => h(More, { tabindex: 0, style: 'width:24px;height:24px' }) }) })
        app.mount(fixture); await settle()
        const svg = fixture.querySelector('svg'); assert(svg, 'More SVG missing')
        svg.dispatchEvent(new MouseEvent('mouseenter')); await settle()
        const content = document.querySelector('[role="tooltip"]')
        assert(content?.textContent === 'Home / Catalog' && content.getBoundingClientRect().width > 0, 'omitted labels not visible')
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })); await settle()
        assert(JSON.stringify(requests) === JSON.stringify([['update',true],['change',true],['update',false],['change',false]]), 'event forwarding duplicated or missing')
        assert(document.activeElement === svg, 'SVG focus was not restored')
      } else if (scenario === 'popover controlled title') {
        const visible = ref(false), instance = ref(), lifecycle = [], requests = []
        app = createApp({ render: () => h(Popover, { ref: instance, open: visible.value, title: 'Heading', content: 'Body', animationName: '', 'onUpdate:open': value => requests.push(value), onOpen: () => lifecycle.push('open'), onClose: () => lifecycle.push('close') }, { default: () => h('button', 'reference') }) })
        app.mount(fixture); await settle()
        instance.value.open(); await settle()
        assert(requests.join() === 'true' && lifecycle.length === 0, 'rejected open changed lifecycle')
        visible.value = true; await settle()
        assert(document.body.textContent.includes('Heading') && document.body.textContent.includes('Body'), 'title/content not forwarded')
        instance.value.close(); await settle()
        assert(lifecycle.join() === 'open', 'rejected close changed lifecycle')
        visible.value = false; await settle()
        assert(lifecycle.join() === 'open,close', 'accepted lifecycle missing')
      } else {
        const instance = ref()
        app = createApp({ render: () => h(Popover, { ref: instance, defaultOpen: true, unmountOnClose: false, animationName: '' }, { default: () => h('button', 'reference'), content: () => h('input', { 'data-draft': '' }) }) })
        app.mount(fixture); await settle()
        const input = document.querySelector('[data-draft]'); input.value = 'draft'
        instance.value.close(); await settle(); instance.value.open(); await settle()
        assert(document.querySelector('[data-draft]') === input && input.value === 'draft', 'cached draft was reset')
      }
      results.push({ name, scenario, pass: true })
    } catch (error) { results.push({ name, scenario, pass: false, error: String(error) }) }
    finally { app?.unmount() }
    document.querySelector('#results').textContent = JSON.stringify(results, null, 2)
  }
}
document.title = `${results.filter(item => item.pass).length}/${results.length} Tooltip/Popover checks`
