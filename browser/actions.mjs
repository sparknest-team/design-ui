import { touchDrag } from './touch.mjs'
import { assertDirectionGeometry } from './reading-direction-catalog/geometry.mjs'
import { chooseDemoOption } from './demo-control.mjs'
import assert from 'node:assert/strict'

export async function poll(read, accept, message, timeout = 5000) {
  const deadline = Date.now() + timeout
  let value
  do {
    value = await read()
    if (accept(value)) return value
    await new Promise((resolve) => setTimeout(resolve, 25))
  } while (Date.now() < deadline)
  assert.fail(`${message}; last observed: ${JSON.stringify(value)}`)
}

const visible = (locator) => locator.filter({ visible: true })
const attr = (locator, name) => locator.getAttribute(name)
const text = (locator) => locator.innerText()
const dimensions = (locator) => locator.evaluate((element) => ({ width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height }))

export async function hoverAfterScroll(locator) {
  // Chromium's scroll-into-view can continue a smooth document scroll after
  // returning. A stationary pointer must not be swept off a 100ms hover target.
  await locator.scrollIntoViewIfNeeded()
  let previous, stable = 0
  await poll(async () => {
    const position = await locator.evaluate((element) => {
      const box = element.getBoundingClientRect()
      return JSON.stringify([scrollX, scrollY, box.x, box.y, box.width, box.height])
    })
    stable = position === previous ? stable + 1 : 0
    previous = position
    return stable
  }, (count) => count >= 3, 'hover target and document scroll settle before pointer entry')
  await locator.hover()
}

async function fillAndRead(locator, value) {
  await locator.fill(value)
  assert.equal(await locator.inputValue(), value)
}

async function toggleChecked(control, label) {
  const before = await attr(control, 'aria-checked') ?? String(await control.isChecked())
  await label.click()
  await poll(async () => await attr(control, 'aria-checked') ?? String(await control.isChecked()), (value) => value !== before, 'check state updates after user click')
}

async function drag(page, handle, dx, dy) {
  await handle.scrollIntoViewIfNeeded()
  await handle.click({ trial: true })
  const box = await handle.boundingBox()
  assert.ok(box, 'drag handle must be laid out')
  const x = box.x + box.width / 2, y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + dx, y + dy, { steps: 8 })
  await page.mouse.up()
}

// Each action asserts its own business state, geometry or exposed accessibility
// state. No action can succeed solely because a click did not throw.
export async function exercise({ page, demo, component, library, contract, demos, capture }) {
  const p = library === 'cedar' ? 'c' : 'mp'
  const root = (name = component) => demo.locator(`.${p}-${name}`).first()
  const popup = (name) => visible(page.locator(`.${p}-${name}`)).last()
  const button = (name) => demo.getByRole('button', { name, exact: true })
  const firstInput = () => demo.locator('input:not([type="checkbox"]):not([type="radio"]):not([type="file"])').first()
  const slider = () => demo.getByRole('slider').first()
  const action = contract.action
  const authoredDemo = demo
  let fieldReference, editor
  if (library === 'maple' && contract.kind === 'interaction' && ['input', 'textarea', 'input-number', 'verification-code', 'checkbox', 'radio', 'switch', 'slider', 'rate', 'select', 'auto-complete', 'cascader', 'tree-select', 'people-select', 'upload'].includes(action)) {
    const reference = demo.locator(action === 'input-number' ? '.number-demo > .mp-field-presentation__reference' : '.mp-field-presentation__reference').first()
    if (await reference.count()) {
      fieldReference = reference
      await reference.click()
      editor = visible(page.locator('.mp-field-presentation__panel')).last()
      await editor.waitFor({ state: 'visible' })
      assert.equal(await reference.evaluate((element) => getComputedStyle(element).display), 'flex', 'field reference stylesheet survives production tree-shaking')
      assert.equal(await editor.locator('header').evaluate((element) => getComputedStyle(element).display), 'flex', 'field toolbar stylesheet survives production tree-shaking')
      demo = editor
    }
  }

  if (process.env.DOCS_READING_DIRECTION && ['verification-code','number-keyboard'].includes(action)) await assertDirectionGeometry({demo,component,library})
  if (contract.kind === 'presentation') {
    const nodes = demo.locator(`.${p}-${contract.root}`)
    assert.ok(await nodes.count() >= contract.minimum, `${component}: expected rendered ${contract.root} instances`)
    const box = await dimensions(nodes.first())
    assert.ok(box.width > 0 && box.height > 0, `${component}: rendered component has nonzero geometry`)
    if (component === 'table') {
      assert.ok(await demo.locator('tbody tr').count() >= 2)
      assert.ok(await demo.locator('thead th').count() >= 3)
    } else if (component === 'icon' || component === 'avatar' || component === 'empty') {
      assert.ok(await demo.locator('svg,img,[class*="icon"]').count() > 0 || (await text(demo)).trim().length > 0, 'graphic or fallback content is rendered')
    } else if (component === 'row' || component === 'col' || component === 'grid') {
      assert.ok(await demo.locator(`.${p}-col,.${p}-grid-item`).count() >= 2, 'layout contains multiple real child cells')
    } else if (component === 'paper') {
      const shadow = await nodes.locator('xpath=self::*[contains(@class,"elevation")]').first().evaluate((element) => getComputedStyle(element).boxShadow)
      assert.notEqual(shadow, 'none', 'paper renders its configured elevation')
    } else if (component === 'field-decorator') {
      const field = demo.locator('[data-control="Input"] input').first()
      const initial = await dimensions(field)
      await demo.getByText('xl', { exact: true }).click()
      await poll(async () => (await dimensions(field)).height, (height) => height > initial.height, 'shared size controls change actual field height')
    } else if (component === 'progress' || component === 'progress-group') {
      assert.ok(await demo.locator('[role="progressbar"],svg,[class*="progress"]').count() > 0)
    } else {
      assert.ok((await text(demo)).trim().length > 0 || await demo.locator('svg,[class*="skeleton"],[class*="loading"]').count() > 0, 'component has real content, graphic, skeleton or loading structure')
    }
    return `${contract.root}: rendered content and geometry`
  }

  switch (action) {
    case 'date-panel': {
      const panel = demo.locator('.c-picker-container').last()
      await panel.getByText('15', { exact: true }).click()
      assert.match(await text(demo), /已提交：2025-02-12/)
      await demo.getByRole('button', { name: /^(?:确认|确定)$/ }).click()
      await poll(() => text(demo), (value) => value.includes('已提交：2025-02-15'), 'standalone date panel commits its selected draft only on confirmation')
      break
    }
    case 'time-panel': {
      await demo.getByRole('listbox', { name: 'Hours', exact: true }).getByRole('option', { name: '10', exact: true }).click()
      assert.match(await text(demo), /已提交值: 09:30/)
      await demo.getByRole('button', { name: /^(?:确认|确定)$/ }).click()
      await poll(() => text(demo), (value) => value.includes('已提交值: 10:30') && value.includes('有效确认次数: 1'), 'standalone time panel confirms exactly once')
      break
    }
    case 'paper': {
      await demo.locator('.c-checkbox').filter({ hasText: 'Paper shadow' }).click()
      await poll(() => root().evaluate((element) => getComputedStyle(element).boxShadow), (value) => value !== 'none', 'paper toggles its actual elevation')
      await button('Surface action').click()
      assert.match(await text(demo.getByRole('status')), /Surface clicks: 1/)
      break
    }
    case 'verification-code': {
      const fields = demo.locator(`.${p}-verification-code input`)
      assert.equal(await fields.count(), 6)
      for (let i = 0; i < 6; i++) await fields.nth(i).fill(String(i + 1))
      if (!editor) assert.match(await text(demo), /123456/)
      break
    }
    case 'input': case 'textarea': case 'mention': {
      const input = action === 'textarea' ? demo.locator('textarea').first() : firstInput()
      const value = action === 'verification-code' ? '123456' : action === 'mention' ? '@Byte' : 'Production QA'
      await fillAndRead(input, value)
      if (action === 'textarea' && !editor) assert.match(await text(demo), new RegExp(value))
      if (action === 'mention') {
        const panel = library === 'cedar' ? popup('select-dropdown') : visible(page.getByRole('listbox')).last()
        await panel.waitFor({ state: 'visible' })
        assert.match(await text(panel), /Bytedance/)
        await page.keyboard.press('Escape')
        await panel.waitFor({ state: 'hidden' })
      }
      break
    }
    case 'input-number': {
      const input = firstInput()
      await fillAndRead(input, '24')
      await input.press('Tab')
      await poll(() => input.inputValue(), (value) => Number(value) === 24, 'numeric business value commits')
      break
    }
    case 'input-tag': {
      const before = await demo.locator(`.${p}-tag`).count()
      const input = firstInput()
      await input.fill('qa-tag')
      await input.press('Enter')
      await poll(() => demo.locator(`.${p}-tag`).count(), (count) => count > before, 'Enter creates a new tag')
      assert.match(await text(demo), /qa-tag/)
      break
    }
    case 'checkbox': case 'radio': {
      const control = demo.getByRole(action, { disabled: false }).first()
      await toggleChecked(control, root(action))
      break
    }
    case 'switch': {
      const control = demo.getByRole('switch').first()
      const initial = await attr(control, 'aria-checked')
      await control.click()
      await poll(() => attr(control, 'aria-checked'), (value) => value !== initial, 'switch value changes')
      await control.press('Space')
      assert.equal(await attr(control, 'aria-checked'), initial)
      break
    }
    case 'slider': case 'rate': {
      const control = slider()
      const before = Number(await attr(control, 'aria-valuenow'))
      const rtl = await control.evaluate(element => getComputedStyle(element).direction === 'rtl')
      const vertical = await attr(control, 'aria-orientation') === 'vertical'
      const increase = vertical ? 'ArrowUp' : rtl ? 'ArrowLeft' : 'ArrowRight'
      await control.press(increase)
      await poll(() => attr(control, 'aria-valuenow'), (value) => Number(value) > before, 'the visual forward key increases the value')
      break
    }
    case 'tabs': {
      const target = demo.getByRole('tab', { name: '详情', exact: true })
      await target.click()
      assert.equal(await attr(target, 'aria-selected'), 'true')
      assert.match(await text(visible(demo.getByRole('tabpanel'))), /详情内容/)
      break
    }
    case 'tab-bar': {
      const target = demo.getByText('发现', { exact: true })
      await target.click()
      await poll(() => demo.locator(`.${p}-tab-bar-item--active`).innerText(), (value) => value.includes('发现'), 'tab bar selects discovery')
      break
    }
    case 'select': case 'auto-complete': case 'people-select': case 'tree-select': {
      const reference = demo.getByRole('combobox').first()
      if (action === 'auto-complete') await firstInput().fill('Bei')
      else if (!editor) await reference.click()
      const role = action === 'tree-select' ? 'treeitem' : 'option'
      const option = action === 'tree-select' && library === 'cedar'
        ? visible(page.getByRole(role, { name: '设计部', exact: true })).first()
        : action === 'people-select' && library === 'maple'
          ? visible(page.locator('[role="option"]:not([aria-selected="true"]):not([aria-disabled="true"])')).first()
        : visible(page.getByRole(role)).filter({ hasNot: page.locator('[aria-disabled="true"]') }).first()
      await option.waitFor({ state: 'visible' })
      const chosen = (await text(option)).trim()
      await option.click()
      if (editor) {
        const confirm = editor.locator('footer').getByRole('button', { name: '确认', exact: true })
        if (await confirm.isVisible()) await confirm.click()
        await editor.waitFor({ state: 'hidden' })
        await poll(() => text(fieldReference), (value) => value.includes(chosen), 'confirmed item appears in the committed field reference')
        editor = undefined
      } else {
        await poll(async () => `${await text(demo)} ${await reference.evaluate((element) => 'value' in element ? String(element.value) : element.textContent ?? '')}`, (value) => value.includes(chosen), 'chosen item appears in the actual field')
        await page.keyboard.press('Escape')
      }
      break
    }
    case 'cascader': {
      if (!editor) await demo.getByRole('combobox').first().click()
      for (const name of library === 'cedar' ? ['Shanghai', 'Huangpu'] : ['江苏省', '南京市']) {
        await visible(page.getByText(name, { exact: true })).last().click()
      }
      if (editor) {
        const confirm = editor.locator('footer').getByRole('button', { name: '确认', exact: true })
        if (await confirm.isVisible()) await confirm.click()
        await editor.waitFor({ state: 'hidden' })
        await poll(() => text(fieldReference), (value) => /南京市/.test(value), 'cascader confirms its committed leaf/path label')
        editor = undefined
      } else await poll(() => text(demo), (value) => /Huangpu|南京市/.test(value), 'cascader commits its leaf/path label')
      break
    }
    case 'button': {
      const area = demo
      await area.getByRole('radiogroup', { name: 'Button variant', exact: true }).getByText('outline', { exact: true }).click()
      assert.equal(await area.locator(`.${p}-button--variant-outline`).count(), 8)
      break
    }
    case 'dialog': case 'drawer': case 'overlay': case 'popup': case 'table-column-manager': {
      await demo.getByRole('button').first().click()
      const panel = action === 'dialog' || action === 'drawer' || action === 'table-column-manager'
        ? visible(page.getByRole('dialog')).last() : popup(action)
      await panel.waitFor({ state: 'visible' })
      if (action === 'overlay' && library === 'maple') {
        assert.ok(await panel.locator(`.${p}-overlay__backdrop`).evaluate((element) => getComputedStyle(element).backgroundColor !== 'rgba(0, 0, 0, 0)'), 'overlay paints its backdrop')
      } else assert.ok((await text(panel)).trim().length > 0, 'opened surface contains its real content')
      if (action === 'dialog' || action === 'drawer' || action === 'table-column-manager') {
        await panel.getByRole('button', { name: /取消|Cancel/ }).last().click()
      } else await page.keyboard.press('Escape')
      await panel.waitFor({ state: 'hidden' })
      break
    }
    case 'popover': case 'trigger': case 'tooltip': case 'popconfirm': case 'menu': {
      const target = demo.getByRole('button').first()
      if (action === 'tooltip') await target.hover()
      else await target.click()
      const panel = action === 'menu' ? visible(page.getByRole('menu')).last()
        : action === 'tooltip' ? visible(page.getByRole('tooltip')).last()
          : action === 'trigger' ? visible(page.locator('.trigger-demo__panel')).last() : popup(action)
      await panel.waitFor({ state: 'visible' })
      assert.ok((await text(panel)).trim().length > 0)
      if (action === 'menu') await panel.getByText('编辑', { exact: true }).click()
      else if (action === 'popconfirm') await panel.getByRole('button', { name: /取消|Cancel/ }).click()
      else { await page.mouse.move(1, 1); await page.keyboard.press('Escape') }
      await panel.waitFor({ state: 'hidden' })
      if (action === 'menu') {
        // A pre-mounted nested popup must not keep its root menu alive when
        // another demo's reference opens a peer menu. Exercise reuse as well.
        for (let attempt = 0; attempt < 2; attempt++) {
          await page.getByRole('button', { name: '多级菜单', exact: true }).click()
          const previous = page.getByRole('menu').filter({ hasText: '关于我们' })
          const branch = previous.getByText('产品', { exact: true })
          if (library === 'maple') await branch.click()
          else await hoverAfterScroll(branch)
          await poll(() => page.getByRole('menu').count(), (count) => count === 2, 'nested menu opens its actual child popup')
          // On phones the open popup can legitimately cover another wrapped
          // trigger; exercise its real keyboard activation, never a force click.
          if (await page.evaluate(() => navigator.maxTouchPoints > 0)) await target.press('Enter')
          else await target.click()
          await poll(() => previous.count(), (count) => count === 0, 'switching references closes the previous menu root and child')
          const next = page.getByRole('menu')
          await poll(() => next.count(), (count) => count === 1, 'only the new peer menu remains visible')
          await next.getByText('复制', { exact: true }).click()
          await next.waitFor({ state: 'hidden' })
        }
      }
      break
    }
    case 'tag': case 'alert': case 'notice-bar': {
      const item = action === 'notice-bar' ? root().locator('xpath=..').locator(`.${p}-notice-bar`).filter({ hasText: '可关闭通知' }) : root()
      const before = await visible(demo.locator(`.${p}-${component}`)).count()
      await item.locator('button,[class*="close"]').last().click()
      await poll(async () => await visible(demo.locator(`.${p}-${component}`)).count(), (count) => count < before, 'closable item is dismissed')
      break
    }
    case 'pagination': {
      await demo.getByRole('button', { name: /下一页|Next page/, exact: true }).first().click()
      assert.match(await text(demo), /Current:\s*2|当前.*2/)
      break
    }
    case 'segmented': {
      const target = demo.getByRole('radio', { name: 'Weekly', exact: true })
      await demo.getByText('Weekly', { exact: true }).click()
      assert.ok(await target.isChecked())
      break
    }
    case 'collapse': {
      const target = demo.getByRole('button').first()
      const before = await attr(target, 'aria-expanded')
      await target.click()
      assert.notEqual(await attr(target, 'aria-expanded'), before)
      break
    }
    case 'ellipsis': {
      const control = root()
      const before = await attr(control, 'aria-expanded')
      await control.click()
      assert.notEqual(await attr(control, 'aria-expanded'), before)
      await control.press('Enter')
      assert.equal(await attr(control, 'aria-expanded'), before)
      break
    }
    case 'steps': {
      const reference = demo.locator('.status-switch.mp-field-presentation__reference')
      if (library === 'maple' && await reference.count()) {
        await reference.click()
        const panel = visible(page.locator('.mp-field-presentation__panel')).last()
        await panel.getByText('error', { exact: true }).click()
        await panel.getByRole('button', { name: '确认', exact: true }).click()
        await panel.waitFor({ state: 'hidden' })
      } else await demo.getByText('error', { exact: true }).click()
      assert.ok(await demo.locator(`[class*="${p}-step"][class*="error"]`).count() > 0, 'step status follows the selected model')
      break
    }
    case 'search': {
      await firstInput().fill('Production QA')
      await firstInput().press('Enter')
      await poll(() => text(demo), (value) => value.includes('Production QA'), 'search output records the submitted query')
      break
    }
    case 'theme-provider': {
      const paragraph = demo.getByText(library === 'cedar' ? '局部颜色' : '局部颜色 / Local color', { exact: true })
      const before = await paragraph.evaluate((element) => getComputedStyle(element).color)
      const nested = demo.getByText(library === 'cedar' ? '嵌套覆盖' : '嵌套覆盖 / Nested override', { exact: true })
      const nestedColor = await nested.evaluate((element) => getComputedStyle(element).color)
      await demo.getByRole('button').first().click()
      assert.notEqual(await paragraph.evaluate((element) => getComputedStyle(element).color), before)
      assert.equal(await nested.evaluate((element) => getComputedStyle(element).color), nestedColor)
      break
    }
    case 'config-provider': {
      const input = firstInput(), before = (await dimensions(input)).height
      await demo.getByRole('button', { name: '切换尺寸', exact: true }).click()
      assert.ok((await dimensions(input)).height > before, 'provider size propagates to the real input')
      break
    }
    case 'locale': case 'highlighter-provider': {
      const target = demo.locator(`.${p}-empty,.${p}-code`).first()
      const before = await text(target)
      await demo.locator(`.${p}-checkbox`).filter({ hasText: action === 'locale' ? '自定义语言包 / Custom messages' : '自定义着色器 / Custom highlighter' }).click()
      await poll(() => text(target), (value) => value !== before, 'provider changes its child output')
      break
    }
    case 'image': case 'lazy': {
      const image = demo.locator('img').first()
      await image.scrollIntoViewIfNeeded()
      await poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0), Boolean, 'real image loads/decodes')
      if (action === 'image') {
        await image.click()
        const preview = visible(page.locator('[data-image-preview-stage]')).last()
        await preview.waitFor({ state: 'visible' })
        await preview.locator('[data-image-preview-close]').click()
        await preview.waitFor({ state: 'hidden' })
      }
      break
    }
    case 'upload': {
      const input = demo.locator('input[type="file"]').first()
      await input.setInputFiles({ name: 'production-qa.txt', mimeType: 'text/plain', buffer: Buffer.from('local synthetic demo file') })
      await poll(() => text(demo), (value) => value.includes('production-qa.txt'), 'upload displays the selected local file')
      break
    }
    case 'affix': case 'scrollbar': case 'back-top': case 'infinite-scroll': {
      const selector = action === 'affix' ? '.scroller' : action === 'scrollbar' ? `.${p}-scrollbar-container` : action === 'back-top' ? '.back-top-demo__scroll' : '.infinite-scroll-demo'
      const scroller = demo.locator(selector).first()
      if (action === 'back-top') {
        await demo.getByRole('button', { name: '回到顶部', exact: true }).click()
        await poll(() => scroller.evaluate((element) => element.scrollTop), (value) => value === 0, 'back-top restores scroll position')
      } else {
        if (action === 'infinite-scroll') await poll(() => text(scroller), (value) => /(?:item|列表项)\s*\d/i.test(value), 'initial local page loads')
        const before = await text(scroller)
        await scroller.evaluate((element, infinite) => { element.scrollTop = infinite ? element.scrollHeight : 160; element.dispatchEvent(new Event('scroll')) }, action === 'infinite-scroll')
        if (action === 'infinite-scroll') await poll(() => text(scroller), (value) => value.length > before.length, 'scrolling loads the next local page')
        else {
          assert.ok(await scroller.evaluate((element) => element.scrollTop) > 0)
          if (action === 'affix') assert.equal(await root().locator('button').evaluate((element) => getComputedStyle(element.parentElement).position), 'fixed')
        }
      }
      break
    }
    case 'resize-box': case 'split': case 'drag': case 'signature': {
      if (action === 'signature') {
        const canvas = demo.locator('canvas').first()
        const before = await canvas.evaluate((element) => element.toDataURL())
        await touchDrag(page, canvas, 50, 20)
        assert.notEqual(await canvas.evaluate((element) => element.toDataURL()), before)
        await button('确认').click()
        assert.equal(await demo.locator('img[src^="data:image"]').count(), 1)
        await button('重置').click()
        assert.equal(await demo.locator('img[src^="data:image"]').count(), 0)
      } else {
        const target = action === 'resize-box' ? root('resizebox') : root()
        const before = await target.evaluate((element) => element.getAttribute('style') + ':' + element.firstElementChild?.getAttribute('style'))
        const handle = action === 'drag' ? target : demo.locator(`[class*="${p}-${action === 'resize-box' ? 'resizebox' : action}-trigger"]`).first()
        if (action === 'drag') await touchDrag(page, handle, 45, 25)
        else await drag(page, handle, 45, 0)
        await poll(() => target.evaluate((element) => element.getAttribute('style') + ':' + element.firstElementChild?.getAttribute('style')), (value) => value !== before, 'pointer drag changes geometry')
      }
      break
    }
    case 'ripple': {
      const target = library === 'cedar' ? button('Ripple') : demo.locator('.ripple-example__block')
      await target.scrollIntoViewIfNeeded()
      await target.click({ trial: true })
      const box = await target.boundingBox()
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      await page.mouse.down()
      const wave = target.locator(`.${p}-ripple`).first()
      await wave.waitFor({ state: 'visible' })
      await poll(() => wave.evaluate((element) => Number(getComputedStyle(element).opacity)), (value) => value > 0, 'pointer press displays the generated wave')
      await page.mouse.up()
      break
    }
    case 'hover': {
      if (library === 'cedar') {
        const target = demo.locator('.hover-example-target')
        const overlay = target.locator('.c-button__content .c-hover-overlay').first()
        await page.mouse.move(1, 1)
        await poll(() => overlay.evaluate((element) => Number(getComputedStyle(element).opacity)), (value) => value === 0, 'sample overlay starts idle')
        const before = await overlay.evaluate((element) => Number(getComputedStyle(element).opacity))
        await target.hover()
        await poll(() => text(demo.getByRole('status')), (value) => value.includes('悬停：是'), 'hover updates its actual state')
        await poll(() => overlay.evaluate((element) => Number(getComputedStyle(element).opacity)), (value) => value > before, 'hover overlay becomes visible')
        await page.mouse.move(1, 1)
        await target.focus()
        await poll(() => text(demo.getByRole('status')), (value) => value.includes('焦点：是'), 'focus updates the same overlay state')
        break
      }
      const target = demo.getByText('HOVER', { exact: true })
      const before = await target.evaluate((element) => getComputedStyle(element).backgroundColor)
      await target.hover()
      await poll(() => target.evaluate((element) => getComputedStyle(element).backgroundColor), (value) => value !== before, 'hover applies the bound style')
      break
    }
    case 'count-to': case 'countdown': {
      const target = root()
      const initial = await text(target)
      if (action === 'count-to') await poll(() => text(target), (value) => value.replace(/[,\s]/g, '') === '123456', 'count-to reaches its configured target')
      else await poll(() => text(target), (value) => value !== initial && /\d/.test(value), 'countdown displayed value advances')
      break
    }
    case 'watermark': {
      const target = demo.getByRole('button', { name: /Click through|点击内容/ }).first()
      await target.click()
      assert.match(await text(demo), /Clicks:\s*1/)
      const marking = root()
      assert.ok(await marking.locator('[style*="background-image"]').count() > 0 || await marking.evaluate((element) => getComputedStyle(element).backgroundImage !== 'none'), 'watermark tile is generated')
      break
    }
    case 'map': {
      await button('使用上海示例位置').click()
      assert.match(await text(demo), /上海示例位置/)
      await button('重置位置').click()
      assert.match(await text(demo), /北京示例位置/)
      assert.match(await text(demo), /地图|SDK/, 'no-SDK fallback explains its local mode')
      break
    }
    case 'form': case 'filter-form': {
      if (action === 'form' && library === 'cedar') {
        await demo.getByRole('button', { name: 'Submit', exact: true }).click()
        await poll(() => text(demo), (value) => /必填|不能为空|required/i.test(value), 'required validation is rendered')
        await demo.getByRole('combobox').click()
        await page.getByRole('option', { name: 'Beijing', exact: true }).click()
        assert.match(await text(demo), /Beijing/)
        const presentationIndex = demos.findIndex((item) => item.file.endsWith('/field-presentation.vue'))
        assert.ok(presentationIndex >= 0, 'Cedar form documents the actual field presentation demo')
        const presentationDemo = page.locator('.vmi-previewer-example').nth(presentationIndex)
        await chooseDemoOption(page, 'Form 展示方式', 'click', presentationDemo)
        const reference = presentationDemo.locator('.c-field-presentation__reference').first()
        assert.equal(await reference.evaluate((element) => getComputedStyle(element).display), 'flex', 'Cedar field reference style is retained in the production bundle')
        const committed = await text(reference)
        await reference.click()
        const panel = visible(page.locator('.c-field-presentation__panel')).last()
        await panel.waitFor({ state: 'visible' })
        assert.equal(await panel.locator('footer').evaluate((element) => getComputedStyle(element).display), 'flex', 'Cedar compact editor actions style is retained in the production bundle')
        await panel.locator('input').first().fill('Discard this draft')
        await panel.getByRole('button', { name: '关闭', exact: true }).click()
        await panel.waitFor({ state: 'hidden' })
        assert.equal(await text(reference), committed, 'Cedar click editor cancellation preserves the committed model')
      } else {
        if (action === 'filter-form') await button('展开').click()
        const input = visible(demo.locator('input:not([readonly]):not([type="checkbox"]):not([type="radio"])')).first()
        await fillAndRead(input, 'QA user')
        if (action === 'filter-form') {
          await button('搜索').click()
          assert.match(await text(demo), /QA user/)
        } else {
          await demo.getByRole('button', { name: /提交|验证/ }).first().click()
          await poll(() => text(demo), (value) => /不能为空|不能低于/.test(value), 'form displays the remaining required-field errors')
        }
      }
      break
    }
    case 'temporal': {
      const input = firstInput()
      const reference = demo.locator('.mp-field-presentation__reference').first()
      const deferred = library === 'maple' && await reference.count() > 0
      const initial = deferred ? await text(reference) : await input.inputValue()
      if (deferred) await reference.click()
      else if (library === 'maple' && (component === 'date' || component === 'date-range')) await demo.locator('[data-field-open-trigger]').first().click()
      else await input.click()
      const active = visible(page.locator(`.${p}-date-panel,.${p}-time-panel,[role="dialog"]`)).last()
      await active.waitFor({ state: 'visible' })
      assert.ok((await text(active)).trim().length > 0, 'date/time editor has usable content')
      await page.keyboard.press('Escape')
      await active.waitFor({ state: 'hidden' })
      assert.equal(deferred ? await text(reference) : await input.inputValue(), initial, 'cancelling the editor does not commit a draft')
      break
    }
    case 'message': case 'notification': case 'loading-bar': case 'action-sheet': {
      await demo.getByRole('button').first().click()
      const panel = popup(action)
      await panel.waitFor({ state: 'visible' })
      if (action === 'loading-bar') {
        await button('结束').click()
        await panel.waitFor({ state: 'hidden' })
      } else if (action === 'action-sheet') {
        await panel.getByText('Item 01', { exact: true }).click()
        await panel.waitFor({ state: 'hidden' })
        await poll(() => page.locator(`.${p}-message`).innerText(), (value) => value.includes('Item 01'), 'action-sheet returns the selected action')
      } else assert.ok((await text(panel)).trim().length > 0, 'service displays real notification content')
      break
    }
    case 'scheduler': {
      const mode = demo.locator(`.${p}-scheduler__mode-select`).first().getByRole('combobox')
      // Source panels above can leave the toolbar against the sticky page
      // header. Center it so the real popup opens in unobstructed space.
      await mode.evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }))
      await mode.click()
      const monthOption = page.getByRole('option', { name: '月', exact: true })
      await monthOption.evaluate((element) => {
        const animations = new Set()
        for (let node = element; node && node !== document.body; node = node.parentElement) {
          for (const animation of node.getAnimations()) {
            if (animation.playState === 'running' && animation.effect?.getComputedTiming().iterations !== Infinity) animations.add(animation)
          }
        }
        return Promise.all([...animations].map(animation => animation.finished.catch(() => {})))
      })
      await monthOption.click()
      const month = demo.locator(`.${p}-scheduler__month`)
      await month.waitFor({ state: 'visible' })
      assert.match(await text(month), /项目同步/)
      break
    }
    case 'split-button': {
      await demo.locator(`.${p}-split-button`).getByRole('button').first().click()
      await poll(() => page.locator(`.${p}-message`).innerText(), (value) => value.includes('发布成功'), 'primary action callback runs')
      await demo.locator(`.${p}-split-button`).getByRole('button').last().click()
      await visible(page.getByText('保存草稿', { exact: true })).last().click()
      await poll(() => page.locator(`.${p}-message`).allInnerTexts(), (values) => values.some((value) => value.includes('保存草稿')), 'menu selection callback runs')
      break
    }
    case 'anchor': {
      const previous = await page.evaluate(() => scrollY)
      await demo.getByRole('link', { name: '无轴线模式', exact: true }).click()
      await poll(() => page.evaluate(() => scrollY), (value) => Math.abs(value - previous) > 10, 'anchor scrolls to the named documentation section')
      break
    }
    case 'color': case 'color-picker': {
      const field = component === 'color' ? demo.locator('.c-color-picker-value').first() : firstInput()
      const initial = component === 'color' ? await text(field) : await field.inputValue()
      if (component === 'color') await demo.locator('.c-color-picker').click()
      const input = component === 'color-picker' ? demo.locator(`.${p}-color-picker-input-hex input`).first() : visible(page.locator(`.${p}-color-picker-input-hex input`)).last()
      await input.fill('FF0000')
      await input.press('Tab')
      if (component === 'color') await poll(() => text(field), (value) => value !== initial && /ff0000|255/i.test(value), 'hex edit updates the actual color field model')
      else await poll(() => demo.locator('.c-color-picker-preview').first().evaluate((element) => getComputedStyle(element).backgroundColor), (value) => value === 'rgb(255, 0, 0)', 'standalone color panel renders the edited red color')
      await page.keyboard.press('Escape')
      break
    }
    case 'calendar': {
      await demo.locator(`.${p}-calendar-date-value`).filter({ hasText: /^\s*15\s*$/ }).first().click()
      await poll(() => text(demo.locator('.demo-result')), (value) => value.includes('15日'), 'calendar day selection updates the bound Date')
      break
    }
    case 'carousel': {
      const indicator = root().locator(`.${p}-carousel__indicator`).nth(1)
      await indicator.click()
      await poll(() => attr(indicator, 'aria-current'), (value) => value === 'true', 'second indicator selects the second slide')
      break
    }
    case 'nav-menu-filter': {
      const activePanel = () => page.locator(`.${p}-nav-menu__popup:not([inert]):visible`)
      const verifyLayout = async (owner, full = false) => {
        await poll(async () => {
          const box = await activePanel().evaluate((element) => {
            const rect = element.getBoundingClientRect(), viewport = window.visualViewport
            return { left: rect.left, top: rect.top, width: rect.width, bottom: rect.bottom,
              viewportLeft: viewport?.offsetLeft ?? 0, viewportWidth: viewport?.width ?? innerWidth,
              viewportBottom: (viewport?.offsetTop ?? 0) + (viewport?.height ?? innerHeight) }
          })
          const barBottom = await owner.locator(`.${p}-nav-menu__bar`).evaluate(element => element.getBoundingClientRect().bottom)
          return Math.abs(box.left - box.viewportLeft) <= 1 && Math.abs(box.width - box.viewportWidth) <= 1 &&
            Math.abs(box.top - barBottom) <= 1 && box.bottom <= box.viewportBottom + 1 &&
            (!full || Math.abs(box.bottom - box.viewportBottom) <= 1)
        }, Boolean, full ? 'full panel fills the viewport below the complete filter bar' : 'ordinary panel fills viewport width below the complete filter bar')
      }
      const waitForClosed = () => page.locator(`.${p}-nav-menu__overlay:visible`).waitFor({ state: 'hidden' })
      await demo.locator(`.${p}-nav-menu`).scrollIntoViewIfNeeded()
      await demo.getByRole('button', { name: '分类', exact: true }).click()
      await verifyLayout(demo)
      await capture?.('full-width')
      await demo.getByRole('button', { name: '地区', exact: true }).click()
      assert.equal(await demo.getByRole('button', { name: '分类', exact: true }).getAttribute('aria-expanded'), 'false')
      await activePanel().getByRole('button', { name: '华东', exact: true }).click()
      await waitForClosed()
      await demo.getByRole('button', { name: '分类', exact: true }).click()
      await activePanel().getByRole('button', { name: '设计资源', exact: true }).click()
      await poll(() => text(demo), (value) => value.includes('分类：设计资源') && value.includes('地区：华东'), 'switching entries preserves independent filter values')
      await waitForClosed()
      await demo.getByRole('button', { name: '更多筛选', exact: true }).click()
      await verifyLayout(demo, true)
      await activePanel().getByRole('textbox', { name: '资源名称' }).fill('design')
      await activePanel().getByRole('button', { name: '应用', exact: true }).click()
      await poll(() => text(demo), (value) => value.includes('关键词：design'), 'custom full panel commits its draft')
      await waitForClosed()

      const longDemo = page.locator('[data-nav-long-demo]')
      await longDemo.evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
      await longDemo.getByRole('button', { name: '长列表', exact: true }).click()
      await verifyLayout(longDemo)
      const backgroundY = await page.evaluate(() => scrollY)
      assert.ok(await activePanel().evaluate(element => element.scrollHeight > element.clientHeight), 'long options overflow inside the constrained panel')
      const lastOption = activePanel().getByRole('button', { name: '选项 40', exact: true })
      await lastOption.scrollIntoViewIfNeeded()
      assert.ok(await activePanel().evaluate(element => element.scrollTop > 0), 'last option is reached by panel scrolling')
      assert.equal(await page.evaluate(() => scrollY), backgroundY, 'scrolling long options does not scroll the background')
      await lastOption.click()
      await poll(() => text(longDemo), value => value.includes('长列表选中：39'), 'last option updates the actual independent model')
      await waitForClosed()
      await longDemo.getByRole('button', { name: '更多条件', exact: true }).click()
      await verifyLayout(longDemo, true)
      const filterBody = activePanel().locator('[data-nav-filter-body]')
      assert.ok(await filterBody.evaluate(element => element.scrollHeight > element.clientHeight), 'full filter body scrolls independently')
      const fullBackgroundY = await page.evaluate(() => scrollY)
      const lastCondition = activePanel().locator('.mp-checkbox').filter({ hasText: '条件 40' })
      await lastCondition.scrollIntoViewIfNeeded()
      await lastCondition.click()
      assert.equal(await activePanel().getByRole('checkbox', { name: '条件 40', exact: true }).isChecked(), true)
      assert.ok(await filterBody.evaluate(element => element.scrollTop > 0), 'last condition can be selected inside the scrolling body')
      assert.equal(await page.evaluate(() => scrollY), fullBackgroundY, 'scrolling filter conditions leaves the background fixed')
      const apply = activePanel().getByRole('button', { name: '应用条件', exact: true })
      assert.ok(await apply.evaluate(element => element.getBoundingClientRect().bottom <= (window.visualViewport?.height ?? innerHeight) + (window.visualViewport?.offsetTop ?? 0) + 1), 'bottom actions remain visible while the filter body scrolls')
      await capture?.('full-panel')
      const portrait = page.viewportSize()
      if (portrait.width <= 480 && portrait.height >= 800) {
        await page.setViewportSize({ width: portrait.width, height: portrait.height - 200 })
        await verifyLayout(longDemo, true)
        assert.ok(await apply.evaluate(element => element.getBoundingClientRect().bottom <= (window.visualViewport?.height ?? innerHeight) + (window.visualViewport?.offsetTop ?? 0) + 1), 'actions remain inside a shortened mobile viewport')
        await capture?.('short-viewport')
        await page.setViewportSize(portrait)
        await verifyLayout(longDemo, true)
      }
      await apply.click()
      await poll(() => text(longDemo), value => value.includes('已应用 1 项'), 'fixed action commits the last condition')
      await waitForClosed()
      if (portrait.width <= 480) {
        await page.setViewportSize({ width: portrait.height, height: portrait.width })
        await longDemo.evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
        await longDemo.getByRole('button', { name: '更多条件', exact: true }).click()
        await verifyLayout(longDemo, true)
        await capture?.('landscape')
        await activePanel().getByRole('button', { name: '应用条件', exact: true }).click()
        await waitForClosed()
        await page.setViewportSize(portrait)
      }
      break
    }
    case 'nav-menu': {
      await demo.getByText('关于我们', { exact: true }).click()
      await poll(() => text(demo), (value) => value.includes('当前页面：about'), 'navigation leaf updates the model')
      break
    }
    case 'overflow-list': {
      const input = firstInput()
      await input.fill('2')
      await input.press('Tab')
      await poll(() => text(root()), (value) => !value.includes('Tag10') && value.includes('Tag1'), 'overflow list responds to its data source')
      break
    }
    case 'transfer': {
      const panels = demo.locator(`.${p}-transfer-view`)
      const destination = panels.last()
      await demo.getByText('Option 2', { exact: true }).click()
      await poll(() => text(destination), (value) => value.includes('Option 2'), 'checked option is transferred to the destination list')
      break
    }
    case 'tree': {
      const children = demo.getByText('Branch 0-0-1', { exact: true })
      const before = await children.isVisible()
      await demo.locator(`.${p}-tree-node-switcher`).first().click()
      await poll(() => children.isVisible(), (value) => value !== before, 'tree switcher changes actual child visibility')
      break
    }
    case 'fab': {
      await root().locator(`.${p}-fab__trigger`).click()
      await demo.getByRole('button', { name: '查看用户', exact: true }).click()
      await poll(() => page.locator(`.${p}-message`).innerText(), (value) => value.includes('查看用户'), 'FAB action callback is invoked')
      break
    }
    case 'floating-panel': {
      const target = root()
      const initial = await target.evaluate((element) => getComputedStyle(element).transform)
      await touchDrag(page, target.locator(`.${p}-floating-panel__header`), 0, -160)
      await poll(() => target.evaluate((element) => getComputedStyle(element).transform), (value) => value !== initial, 'touch drag changes the floating panel anchor')
      break
    }
    case 'index-bar': {
      await demo.locator(`.${p}-index-bar__anchor-item`).filter({ hasText: /^M$/ }).click()
      await poll(() => demo.locator(`.${p}-index-bar__anchor-item--active`).innerText(), (value) => value === 'M', 'index navigation activates and scrolls to M')
      break
    }
    case 'number-keyboard': {
      const input = firstInput()
      await input.click()
      const keyboard = popup('number-keyboard')
      await keyboard.getByRole('button', { name: '1', exact: true }).click()
      await keyboard.getByRole('button', { name: '2', exact: true }).click()
      await poll(() => input.inputValue(), (value) => value === '12', 'numeric keyboard updates its bound input')
      await page.keyboard.press('Escape')
      await keyboard.waitFor({ state: 'hidden' })
      break
    }
    case 'picker': {
      await demo.locator(`.${p}-checkbox`).click()
      const control = demo.getByRole('listbox').first()
      await control.press('ArrowDown')
      await poll(() => text(demo.locator('output')), (value) => value === 'B', 'enabling the picker restores keyboard selection')
      break
    }
    case 'pull-refresh': {
      const firstRow = root().locator(`.${p}-cell`).first()
      await firstRow.evaluate((element) => element.scrollIntoView({ block: 'center', inline: 'nearest' }))
      await demo.locator('.pull-refresh-demo__scroller').evaluate((element) => { element.scrollTop = 0 })
      await touchDrag(page, firstRow, 0, 240)
      await poll(() => text(root()), (value) => value.includes('新的列表项'), 'pull gesture completes the local asynchronous refresh')
      break
    }
    case 'swipe-cell': {
      await touchDrag(page, root().locator(`.${p}-swipe-cell__content`), -130, 0)
      await poll(() => text(demo.getByRole('status')), (value) => value.includes('open: name=order-1001'), 'swipe opens actions with the configured cell identity')
      break
    }
    default: throw new Error(`${component}: unimplemented production action ${action}`)
  }
  if (editor) {
    await editor.locator('footer').getByRole('button', { name: '确认', exact: true }).click()
    await editor.waitFor({ state: 'hidden' })
    assert.equal(await fieldReference.getAttribute('aria-expanded'), 'false', 'confirmation closes the actual field editor')
    const committed = await text(fieldReference)
    const expected = { input: 'Production QA', textarea: 'Production QA', 'input-number': '24', 'verification-code': '123456', upload: 'production-qa.txt' }[action]
    if (expected) assert.ok(committed.includes(expected) || (await text(authoredDemo)).includes(expected), `${action}: confirmed value is rendered outside the isolated draft`)
    if (['input', 'textarea'].includes(action)) {
      await fieldReference.click()
      const panel = visible(page.locator('.mp-field-presentation__panel')).last()
      await panel.locator(action === 'textarea' ? 'textarea' : 'input').first().fill('Discard this draft')
      await panel.locator('header button').click()
      await panel.waitFor({ state: 'hidden' })
      assert.equal(await text(fieldReference), committed, 'cancel preserves the previously confirmed model')
    }
  }
  return action
}
