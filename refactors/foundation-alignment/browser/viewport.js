import { createApp, h, nextTick } from 'vue'
import Cedar from '/cedar-design-web/packages/ui/src/trigger/index.ts'
import Maple from '/maple-design-mobile/packages/ui/src/trigger/index.ts'
import '/cedar-design-web/packages/ui/src/trigger/style/index.ts'
import '/maple-design-mobile/packages/ui/src/trigger/style/index.ts'

const results = [],
  host = document.querySelector('#fixture')
const settle = async () => {
  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 180))
  await nextTick()
}
for (const [name, Trigger] of [
  ['Cedar', Cedar],
  ['Maple', Maple],
]) {
  for (const scenario of ['visual viewport shrink', 'cross-axis boundary']) {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'visualViewport')
    let app
    try {
      const viewport = new EventTarget()
      Object.assign(viewport, {
        width: window.innerWidth,
        height: window.innerHeight,
        offsetLeft: 0,
        offsetTop: 0,
        scale: 1,
      })
      Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport })
      app = createApp({
        render: () =>
          h(
            Trigger,
            { defaultOpen: true, popupContainer: false, placement: 'bottom-start', animationName: '' },
            {
              default: () =>
                h(
                  'button',
                  {
                    'data-anchor': '',
                    style: `position:fixed;top:160px;left:${scenario === 'cross-axis boundary' ? window.innerWidth - 35 : 60}px;width:30px;height:30px`,
                  },
                  'A',
                ),
              content: () => h('div', { 'data-panel': '', style: 'width:120px;height:80px;background:#ddd' }, 'panel'),
            },
          ),
      })
      app.mount(host)
      await settle()
      if (scenario === 'visual viewport shrink') {
        viewport.height = 210
        viewport.dispatchEvent(new Event('resize'))
        await settle()
      }
      const rect = host.querySelector('[data-panel]').getBoundingClientRect(),
        anchor = host.querySelector('[data-anchor]').getBoundingClientRect()
      if (scenario === 'visual viewport shrink' && (rect.bottom > anchor.top + 1 || rect.top < 0))
        throw new Error(`keyboard viewport not respected: ${rect.top}..${rect.bottom}`)
      if (scenario === 'cross-axis boundary' && rect.right > window.innerWidth + 1)
        throw new Error(`cross-axis overflow: ${rect.right}`)
      results.push({ name, scenario, pass: true })
    } catch (error) {
      results.push({ name, scenario, pass: false, error: String(error) })
    } finally {
      app?.unmount()
      if (descriptor) Object.defineProperty(window, 'visualViewport', descriptor)
      else delete window.visualViewport
    }
    document.querySelector('#results').textContent = JSON.stringify(results, null, 2)
  }
}
document.title = `${results.filter((result) => result.pass).length}/${results.length} Viewport browser checks`
