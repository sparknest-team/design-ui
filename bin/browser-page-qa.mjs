// Run only inside cua_repl. Every browser operation uses the supplied CUA tabs.
import fs from 'node:fs/promises'

export async function createAudit(tabs, write, options = {}) {
  const root = '/Users/shuaimeng/github_web/'
  const out = root + 'design-ui/audits/evidence/demo-reorganization-2026-10-23/all-pages'
  const inventory = JSON.parse(await fs.readFile(options.inventoryFile ?? out + '/../browser-inventory.json', 'utf8'))
  const baseUrls = { cedar: 'http://localhost:9991', maple: 'http://localhost:8080', ...options.baseUrls }
  const results = JSON.parse(await fs.readFile(out + '/results.json', 'utf8'))
  const roots = { cedar: '.vmi-previewer-example', maple: '.loca-doc-preview__example' }
  const viewers = { cedar: '.vmi-previewer', maple: '.loca-doc-preview' }
  const norm = (s) => s.replace(/[\s;,]/g, '').replace(/'/g, '"')
  const save = () => fs.writeFile(out + '/results.json', JSON.stringify(results, null, 2))
  async function survey(tab, library) {
    return tab.playwright.evaluate(
      ({ selector, viewer }) => {
        const demos = [...document.querySelectorAll(selector)]
        return {
          title: document.querySelector('.vp-page-title h1,.maple-site-doc>h1')?.textContent,
          background: getComputedStyle(document.body).backgroundColor,
          width: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          demoCount: demos.length,
          boxes: demos.map((n, index) => ({
            index,
            width: n.clientWidth,
            height: n.clientHeight,
            overflow: n.scrollWidth > n.clientWidth + 3,
            empty: !n.childElementCount && !n.textContent.trim(),
            background: getComputedStyle(n).backgroundColor,
            title: n.closest(viewer)?.querySelector('h3')?.textContent,
          })),
          brokenImages: demos.flatMap((n, index) =>
            [...n.querySelectorAll('img')]
              .filter((i) => i.complete && !i.naturalWidth)
              .map((i) => ({ index, src: i.getAttribute('src') })),
          ),
          controls: demos.slice(0, 3).flatMap((n, caseIndex) =>
            [
              ...n.querySelectorAll(
                'input,textarea,button,[role="switch"],[role="combobox"],[role="slider"],[role="tab"],[role="radio"]',
              ),
            ].map((e, index) => ({
              caseIndex,
              index,
              tag: e.tagName,
              type: e.getAttribute('type'),
              role: e.getAttribute('role'),
              label:
                e.getAttribute('aria-label') || e.getAttribute('placeholder') || e.textContent?.trim().slice(0, 90),
              disabled:
                e.disabled || e.getAttribute('aria-disabled') === 'true' || !!e.closest('[class*="--disabled"]'),
              readonly:
                (e.readOnly && e.getAttribute('role') !== 'combobox') ||
                e.getAttribute('aria-readonly') === 'true' ||
                !!e.closest('[class*="--readonly"]'),
              visible: !!(e.getBoundingClientRect().width && e.getBoundingClientRect().height),
              value: e.value,
              checked: e.checked,
              ariaChecked: e.getAttribute('aria-checked'),
              ariaValue: e.getAttribute('aria-valuenow'),
            })),
          ),
        }
      },
      { selector: roots[library], viewer: viewers[library] },
    )
  }
  async function theme(tab, library, mode) {
    if (library === 'cedar')
      await tab.playwright.getByRole('button', { name: '切换主题', exact: true }).click({ timeoutMs: 2500 })
    else await tab.playwright.locator('.maple-site-header__theme').click({ timeoutMs: 2500 })
    await tab.playwright.domSnapshot()
    await tab.playwright
      .getByText(mode === 'light' ? '默认亮色' : '默认暗色', { exact: true })
      .first()
      .click({ timeoutMs: 2500 })
    await tab.playwright.domSnapshot()
  }
  async function mobile(tab) {
    return tab.playwright
      .frameLocator('iframe#mobile')
      .locator('body')
      .evaluate((body) => ({
        url: body.ownerDocument.URL,
        background: getComputedStyle(body).backgroundColor,
        width: body.clientWidth,
        scrollWidth: body.scrollWidth,
        text: body.innerText.slice(0, 1200),
        titles: [...body.querySelectorAll('.app-type')].map((n) => n.textContent.trim()),
        overflow: [...body.querySelectorAll('section[data-demo]')]
          .filter((n) => n.scrollWidth > n.clientWidth + 3)
          .map((n) => n.getAttribute('data-demo')),
        controls: [...body.querySelectorAll('input,textarea,[role="switch"],[role="slider"]')]
          .slice(0, 12)
          .map((e) => ({
            value: e.value,
            checked: e.checked,
            role: e.getAttribute('role'),
            ariaChecked: e.getAttribute('aria-checked'),
            disabled: e.disabled,
          })),
      }))
  }
  const presentation = new Set(
    'avatar badge breadcrumb card col descriptions divider empty grid icon layout link list loading page-header paper progress progress-group result row skeleton space statistic timeline typography theme-provider config-provider locale locale-provider highlighter-provider code field-decorator form-details upload map signature drag resize-box split scrollbar ripple hover lazy affix back-top infinite-scroll pull-refresh watermark'.split(
      ' ',
    ),
  )
  function choose(r, dom) {
    if (presentation.has(r.component)) return null
    const controls = dom.controls.filter((e) => e.visible && !e.disabled && !e.readonly)
    let e = controls.find(
      (e) =>
        (e.tag === 'TEXTAREA' || (e.tag === 'INPUT' && ['text', 'search', 'number', null].includes(e.type))) &&
        e.role !== 'combobox',
    )
    if (e)
      return {
        e,
        kind: 'fill',
        value:
          r.component === 'verification-code'
            ? '123456'
            : r.component === 'input-number' || e.type === 'number'
              ? '2'
              : 'Demo QA',
      }
    e = controls.find(
      (e) =>
        e.type === 'checkbox' ||
        (e.type === 'radio' && !e.checked) ||
        ['switch', 'combobox', 'slider', 'tab', 'radio'].includes(e.role),
    )
    if (e) return { e, kind: e.role === 'slider' ? 'press' : 'click' }
    e = controls.find((e) => e.tag === 'BUTTON' && !/上传|下载|文件|upload|download|file/i.test(e.label))
    return e ? { e, kind: 'click' } : null
  }
  const selector = 'input,textarea,button,[role="switch"],[role="combobox"],[role="slider"],[role="tab"],[role="radio"]'
  async function action(r, mode, spec) {
    const tab = tabs[r.library],
      before = await survey(tab, r.library)
    const target = tab.playwright.locator(roots[r.library]).nth(spec.e.caseIndex).locator(selector).nth(spec.e.index)
    try {
      if (spec.kind === 'fill') await target.fill(spec.value, { timeoutMs: 2200 })
      else if (spec.kind === 'press') await target.press('ArrowRight', { timeoutMs: 2200 })
      else await target.click({ timeoutMs: 2200 })
      const ax = await tab.playwright.domSnapshot()
      const after = await survey(tab, r.library)
      r.interaction[mode] = {
        spec,
        before: before.controls,
        after: after.controls,
        valueChanged: JSON.stringify(before.controls) !== JSON.stringify(after.controls),
        visibleState: ax.slice(-2200),
      }
      const dialog = await tab.getJsDialog()
      if (dialog) {
        await dialog.dismiss()
        await tab.playwright.domSnapshot()
      }
      await tab.pressKey(null, 'Escape')
      await tab.playwright.domSnapshot()
      try {
        await tab.playwright
          .locator('[role="dialog"]:visible,[role="menu"]:visible')
          .first()
          .waitFor({ state: 'hidden', timeoutMs: 2200 })
      } catch {
        r.interaction[mode].closePending = true
      }
    } catch (e) {
      r.interaction[mode] = { spec, error: String(e).slice(0, 240) }
    }
  }
  async function source(r) {
    const tab = tabs[r.library],
      viewer = tab.playwright.locator(viewers[r.library]).first()
    const panel = r.library === 'cedar' ? '.vmi-previewer-sources' : '.loca-doc-preview__sources'
    const toggle = () =>
      r.library === 'cedar'
        ? viewer.locator('[title="展开或收起源码"]')
        : viewer.getByRole('button', { name: '展开源码', exact: true })
    if (
      !(await viewer
        .locator(panel + ' pre')
        .first()
        .isVisible())
    ) {
      await toggle().click({ timeoutMs: 2200 })
      await tab.playwright.domSnapshot()
    }
    await viewer
      .locator(panel + ' pre')
      .first()
      .waitFor({ state: 'visible', timeoutMs: 5000 })
    const shown = await viewer
      .locator(panel + ' pre')
      .first()
      .innerText({ timeoutMs: 2000 })
    const file = await fs.readFile(root + r.sourceFile, 'utf8')
    r.sourceMatch = norm(shown) === norm(file)
    r.sourceLength = shown.length
    await fs.writeFile(out + '/' + r.library + '-' + r.component + '-source.txt', shown)
    await (r.library === 'cedar' ? toggle() : viewer.getByRole('button', { name: '收起源码', exact: true })).click({
      timeoutMs: 2200,
    })
    await tab.playwright.domSnapshot()
  }
  async function run(library, component) {
    const p = inventory.find((p) => p.library === library && p.component === component),
      tab = tabs[library]
    if (!p) throw new Error(`Unknown browser audit page: ${library}:${component}`)
    const r = {
      library,
      component,
      startedAt: new Date().toISOString(),
      url: baseUrls[library] + p.route,
      sourceFile: p.demos[0]?.file,
      themes: {},
      interaction: {},
    }
    results.push(r)
    try {
      if ((await tab.url()) !== r.url) {
        const href = library === 'cedar' ? p.route : p.route.slice(1),
          link = tab.playwright.locator('a[href="' + href + '"]')
        if (await link.count()) await link.first().click({ timeoutMs: 3500 })
        else await tab.goto(r.url)
      }
      await tab.playwright.domSnapshot()
      const heading = (p.title ?? 'API')
        .replace(/`/g, '')
        .split(/\s+/)[0]
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      await tab.playwright
        .getByRole('heading', { name: new RegExp('^' + heading + '(?:\\s|$)') })
        .first()
        .waitFor({ state: 'visible', timeoutMs: 12000 })
      await tab.playwright.locator(roots[library]).first().waitFor({ state: 'visible', timeoutMs: 7000 })
      try {
        await source(r)
      } catch (e) {
        r.sourceError = String(e).slice(0, 200)
      }
      for (const mode of ['light', 'dark']) {
        await theme(tab, library, mode)
        r.themes[mode] = await survey(tab, library)
        await fs.writeFile(
          out + '/' + library + '-' + component + '-' + mode + '.png',
          await tab.getScreenshot({ emit: false }),
        )
        if (library === 'maple') {
          try {
            r.themes[mode].mobile = await mobile(tab)
          } catch (e) {
            r.themes[mode].mobile = { error: String(e).slice(0, 160) }
          }
        }
        await save()
        const spec = choose(r, r.themes[mode])
        if (spec) await action(r, mode, spec)
        else r.interaction[mode] = { status: 'Presentation-only / specialized interaction not exercised' }
      }
      r.errors = (await tab.dev.logs({ levels: ['error'], limit: 30 })).filter((e) => e.timestamp >= r.startedAt)
      if (['light', 'dark'].every((mode) => r.themes[mode]?.boxes[0]?.empty))
        r.renderIncomplete = 'First demo body remained empty in both theme observations.'
    } catch (e) {
      r.failure = String(e).slice(0, 250)
    }
    await save()
    write({
      page: library + ':' + component,
      source: r.sourceMatch,
      sourceError: r.sourceError,
      failure: r.failure,
      themes: Object.entries(r.themes).map(([mode, d]) => ({
        mode,
        demos: d.demoCount,
        overflow: d.boxes.filter((b) => b.overflow).map((b) => b.index),
        brokenImages: d.brokenImages,
        mobileOverflow: d.mobile?.overflow,
        mobileError: d.mobile?.error,
        interaction: r.interaction[mode]?.error ?? r.interaction[mode]?.status ?? r.interaction[mode]?.valueChanged,
      })),
      errors: r.errors,
    })
    return r
  }
  return { run, inventory, results, survey, theme, mobile, save, source, tabs }
}
