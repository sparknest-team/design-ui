import { createApp, createSSRApp, h, nextTick, ref } from 'vue'
import CedarTrigger from '/cedar-design-web/packages/cedar-ui/src/trigger/index.ts'
import MapleTrigger from '/maple-design-mobile/packages/maple-ui/src/trigger/index.ts'

const results = []
const container = document.querySelector('#fixture')
const settle = async () => { await nextTick(); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); await nextTick() }
const placements = ['top', 'bottom', 'left', 'right'].flatMap(side => [side, `${side}-start`, `${side}-end`])
function expected(reference, panel, placement) {
  const [side, alignment] = placement.split('-')
  const horizontal = side === 'left' || side === 'right'
  let x = reference.x + (reference.width - panel.width) / 2
  let y = reference.y + (reference.height - panel.height) / 2
  if (horizontal) { x = side === 'left' ? reference.x - panel.width : reference.right; if (alignment) y = alignment === 'start' ? reference.y : reference.bottom - panel.height }
  else { y = side === 'top' ? reference.y - panel.height : reference.bottom; if (alignment) x = alignment === 'start' ? reference.x : reference.right - panel.width }
  return { x, y }
}
async function check(label, run) {
  try { await run(); results.push({ label, pass: true }) }
  catch (error) { results.push({ label, pass: false, error: String(error) }) }
  document.querySelector('#results').textContent = JSON.stringify(results, null, 2)
}
for (const [name, Trigger] of [['Cedar', CedarTrigger], ['Maple', MapleTrigger]]) {
  for (const placement of placements) {
    await check(`${name}: ${placement}`, async () => {
      const app = createApp({ render: () => h('div', { class: 'fixture' }, [h(Trigger, { defaultOpen: true, placement, animationName: '', popupContainer: false, showArrow: true, arrowClass: 'test-arrow', arrowStyle: { width: '8px', height: '8px', background: 'red' } }, {
        default: () => h('button', { class: 'anchor' }, 'reference'), content: () => h('div', { class: 'panel' }, 'panel'),
      })]) })
      app.mount(container)
      try {
        await settle()
        const reference = container.querySelector('.anchor').getBoundingClientRect()
        const panel = container.querySelector('.panel').getBoundingClientRect()
        const target = expected(reference, panel, placement)
        const arrow = container.querySelector('.test-arrow')
        if (!arrow || arrow.getAttribute('aria-hidden') !== 'true') throw new Error('decorative arrow missing')
        const edge = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }[placement.split('-')[0]]
        if (arrow.style[edge] !== '0px') throw new Error(`arrow edge ${edge}: ${arrow.style[edge]}`)
        if (Math.abs(target.x - panel.x) > 1 || Math.abs(target.y - panel.y) > 1) throw new Error(JSON.stringify({ target, panel: { x: panel.x, y: panel.y } }))
      } finally { app.unmount() }
    })
  }
  for (const scenario of ['bordered scroll container', 'static teleport target', 'scaled container', 'reference resize', 'panel resize', 'border-box width', 'content-box width', 'window scroll', 'viewport flip', 'flipped screen offset', 'point in container']) {
    await check(`${name}: ${scenario}`, async () => {
      const host = document.createElement('div')
      host.style.cssText = 'position:relative;margin:30px;width:600px;height:440px;border:12px solid transparent;overflow:auto'
      if (scenario === 'scaled container') host.style.cssText += ';transform:scale(1.25);transform-origin:top left'
      if (scenario === 'window scroll') container.style.position = 'absolute'
      container.append(host)
      const target = document.createElement('div')
      target.style.cssText = 'margin:25px;width:1000px;height:900px'
      host.append(target)
      const props = { defaultOpen: true, placement: 'bottom-end', animationName: '', popupContainer: scenario === 'static teleport target' ? target : false, updateAtScroll: true, autoFitTransformOrigin: true }
      if (scenario.endsWith('box width')) props.autoFitPopupWidth = true
      if (scenario.includes('flip') || scenario === 'flipped screen offset') props.placement = 'top-start'
      if (scenario === 'flipped screen offset') Object.assign(props, name === 'Cedar' ? { popupTranslate: [5, 9] } : { offsetX: 5, offsetY: 9 })
      if (scenario === 'point in container') Object.assign(props, { defaultOpen: false, trigger: 'contextMenu', alignPoint: true, placement: 'bottom-start' })
      const app = createApp({ render: () => h(Trigger, props, {
        default: () => h('button', { class: 'anchor', style: { top: props.placement === 'top-start' ? '-30px' : '200px', left: '160px', border: '8px solid transparent', padding: '6px' } }, 'reference'),
        content: () => h('div', { class: 'panel' }, 'panel'),
      }) })
      app.mount(target)
      try {
        await settle()
        const anchor = target.querySelector('.anchor')
        let panel = container.querySelector('.panel')
        if (scenario === 'bordered scroll container') { host.scrollTop = 80; host.scrollLeft = 50; await settle() }
        if (scenario === 'window scroll') { window.scrollTo(0, 80); await settle() }
        if (scenario === 'content-box width') { anchor.style.boxSizing = 'content-box'; await settle(); await settle() }
        if (scenario === 'reference resize') { anchor.style.width = '160px'; anchor.style.height = '60px'; await settle(); await settle() }
        if (scenario === 'panel resize') { panel.style.width = '140px'; panel.style.height = '80px'; await settle(); await settle() }
        if (scenario === 'point in container') { anchor.dispatchEvent(new MouseEvent('contextmenu', { clientX: 220, clientY: 230, bubbles: true })); await settle() }
        panel = container.querySelector('.panel')
        const reference = anchor.getBoundingClientRect()
        const rect = panel.getBoundingClientRect()
        const flipped = scenario.includes('flip') || scenario === 'flipped screen offset'
        const destination = expected(reference, rect, flipped ? 'bottom-start' : props.placement)
        if (scenario === 'point in container') Object.assign(destination, { x: 220, y: 230 })
        if (scenario === 'flipped screen offset') { destination.x += 5; destination.y += 9 }
        if (scenario.endsWith('box width')) {
          const popupWidth = panel.parentElement.getBoundingClientRect().width
          if (Math.abs(popupWidth - reference.width) > 1) throw new Error(`width ${popupWidth} != ${reference.width}`)
          // The panel has an explicit width; compare the positioned popup instead.
          const popup = panel.parentElement.getBoundingClientRect()
          Object.assign(destination, expected(reference, popup, props.placement))
          if (Math.abs(destination.x - popup.x) > 1) throw new Error(`popup x ${popup.x} != ${destination.x}`)
        } else if (Math.abs(destination.x - rect.x) > 1 || Math.abs(destination.y - rect.y) > 1) throw new Error(JSON.stringify({ destination, actual: { x: rect.x, y: rect.y } }))
        if (scenario === 'point in container') {
          anchor.dispatchEvent(new MouseEvent('contextmenu', { clientX: 250, clientY: 260, bubbles: true }))
          await settle()
          const moved = panel.getBoundingClientRect()
          if (Math.abs(moved.x - 250) > 1 || Math.abs(moved.y - 260) > 1) throw new Error('open context menu did not follow the next point')
        }
        if (flipped) {
          const origin = getComputedStyle(panel.closest('[class*=popup-wrapper]')).transformOrigin.split(' ').slice(0, 2).join(' ')
          if (origin !== '0px 0px') throw new Error(`flipped origin ${origin}`)
        }
      } finally { app.unmount(); host.remove(); if (scenario === 'window scroll') { window.scrollTo(0, 0); container.style.position = ''; await settle() } }
    })
  }
  for (const unmountOnClose of [true, false]) {
    await check(`${name}: transition completion, cancellation and cache=${!unmountOnClose}`, async () => {
      const open = ref(true)
      const events = []
      const done = async () => { for (let frame = 0; frame < 10; frame++) await new Promise(resolve => requestAnimationFrame(resolve)); await nextTick() }
      const app = createApp({ render: () => h(Trigger, {
        open: open.value, unmountOnClose, popupContainer: false, animationName: 'contract', duration: 40,
        onOpened: () => events.push('opened'), onClosed: () => events.push('closed'),
      }, { default: () => h('button', { class: 'anchor' }, 'reference'), content: () => h('input', { class: 'panel' }) }) })
      app.mount(container)
      try {
        await done()
        if (events.join() !== 'opened') throw new Error(`defaultOpen events ${events}`)
        const input = container.querySelector('input')
        input.value = 'draft'
        open.value = false
        await nextTick()
        if (!input.isConnected) throw new Error('content unmounted before leave completed')
        open.value = true
        await done()
        if (events.includes('closed') || container.querySelector('input') !== input) throw new Error('cancelled leave lost content or emitted closed')
        open.value = false
        await done()
        if (events.filter(event => event === 'closed').length !== 1) throw new Error(`close events ${events}`)
        if (input.isConnected === unmountOnClose) throw new Error('unmountOnClose not respected')
        open.value = true
        await done()
        if (container.querySelector('input').value !== (unmountOnClose ? '' : 'draft')) throw new Error('content cache incorrect')
      } finally { app.unmount() }
    })
  }
  await check(`${name}: SSR hydration and first open`, async () => {
    const response = await fetch(`/trigger-ssr?name=${name}`)
    if (!response.ok) throw new Error(await response.text())
    container.innerHTML = (await response.json()).html
    const original = container.querySelector('button')
    const warnings = []
    const app = createSSRApp({ render: () => h(Trigger, { trigger: 'click', popupContainer: false, animationName: '' }, {
      default: () => h('button', { class: 'anchor' }, 'hydrated reference'), content: () => h('div', { class: 'panel' }, 'hydrated panel'),
    }) })
    app.config.warnHandler = message => warnings.push(message)
    app.mount(container)
    try {
      await settle()
      if (original !== container.querySelector('button')) throw new Error('SSR reference was replaced')
      original.click()
      await settle()
      const panel = container.querySelector('.panel')
      if (!panel?.getBoundingClientRect().width) throw new Error('hydrated trigger did not open')
      if (warnings.length) throw new Error(warnings.join(' / '))
    } finally { app.unmount() }
  })
  await check(`${name}: direct SVG hover + Escape`, async () => {
    let opened = false
    const app = createApp({ render: () => h(Trigger, { mouseEnterDelay: 0, 'onUpdate:open': value => { opened = value }, popupContainer: false, animationName: '' }, {
      default: () => h('svg', { class: 'anchor', tabindex: 0, viewBox: '0 0 20 20' }, [h('circle', { cx: 10, cy: 10, r: 5 })]), content: () => h('div', { class: 'panel' }, 'SVG tooltip'),
    }) })
    app.mount(container)
    try {
      await settle()
      container.querySelector('svg').dispatchEvent(new MouseEvent('mouseenter'))
      await settle()
      if (!opened || !container.querySelector('.panel')?.getBoundingClientRect().width) throw new Error('SVG did not open')
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      await settle()
      if (opened) throw new Error('Escape did not close')
    } finally { app.unmount() }
  })
}
window.triggerBrowserResults = results
window.triggerBrowserComplete = true
document.title = `${results.filter(item => item.pass).length}/${results.length} Trigger browser checks`
