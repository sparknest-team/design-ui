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
  const box = await handle.boundingBox()
  assert.ok(box, 'drag handle must be laid out')
  const x = box.x + box.width / 2, y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + dx, y + dy, { steps: 8 })
  await page.mouse.up()
}

async function touchDrag(page, target, dx, dy) {
  await target.scrollIntoViewIfNeeded()
  const box = await target.boundingBox()
  assert.ok(box)
  const x = box.x + box.width / 2, y = box.y + Math.min(box.height / 2, 30)
  const session = await page.context().newCDPSession(page)
  try {
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
    for (let index = 1; index <= 8; index++) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * index / 8, y: y + dy * index / 8 }] })
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  } finally { await session.detach() }
}

// Each action asserts its own business state, geometry or exposed accessibility
// state. No action can succeed solely because a click did not throw.
export async function exercise({ page, demo, component, library, contract }) {
  const p = library === 'cedar' ? 'c' : 'mp'
  const root = (name = component) => demo.locator(`.${p}-${name}`).first()
  const popup = (name) => visible(page.locator(`.${p}-${name}`)).last()
  const button = (name) => demo.getByRole('button', { name, exact: true })
  const firstInput = () => demo.locator('input:not([type="checkbox"]):not([type="radio"]):not([type="file"])').first()
  const slider = () => demo.getByRole('slider').first()
  const action = contract.action

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
      assert.match(await text(demo), /123456/)
      break
    }
    case 'input': case 'textarea': case 'mention': {
      const input = action === 'textarea' ? demo.locator('textarea').first() : firstInput()
      const value = action === 'verification-code' ? '123456' : action === 'mention' ? '@Byte' : 'Production QA'
      await fillAndRead(input, value)
      if (action === 'verification-code' || action === 'textarea') assert.match(await text(demo), new RegExp(value))
      if (action === 'mention') {
        const panel = library === 'cedar' ? popup('select-dropdown') : visible(page.getByRole('listbox')).last()
        await panel.waitFor({ state: 'visible' })
        assert.match(await text(panel), /Bytedance/)
        await page.keyboard.press('Escape')
        await panel.waitFor({ state: 'hidden' })
      }
      break
    }
    case 'input-number': case 'counter': {
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
      await control.press('ArrowRight')
      await poll(() => attr(control, 'aria-valuenow'), (value) => Number(value) > before, 'ArrowRight increases the value')
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
      else await reference.click()
      const role = action === 'tree-select' ? 'treeitem' : 'option'
      const option = visible(page.getByRole(role)).filter({ hasNot: page.locator('[aria-disabled="true"]') }).first()
      await option.waitFor({ state: 'visible' })
      const chosen = (await text(option)).trim()
      await option.click()
      await poll(() => text(demo), (value) => value.includes(chosen), 'chosen item appears in the actual field')
      await page.keyboard.press('Escape')
      break
    }
    case 'cascader': {
      await demo.getByRole('combobox').first().click()
      for (const name of library === 'cedar' ? ['Shanghai', 'Huangpu'] : ['江苏省', '南京市']) {
        await visible(page.getByText(name, { exact: true })).last().click()
      }
      await poll(() => text(demo), (value) => /Huangpu|南京市/.test(value), 'cascader commits its leaf/path label')
      break
    }
    case 'button': {
      const area = demo
      await area.getByRole('combobox', { name: 'Button variant', exact: true }).click()
      await page.getByRole('option', { name: 'outline', exact: true }).click()
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
      await demo.getByText('error', { exact: true }).click()
      assert.ok(await demo.locator(`[class*="${p}-step"][class*="error"]`).count() > 0, 'step status follows the selected model')
      break
    }
    case 'search': {
      await firstInput().fill('Production QA')
      await firstInput().press('Enter')
      await poll(() => text(demo), (value) => value.includes('Production QA'), 'search output records the submitted query')
      break
    }
    case 'style-provider': {
      const paragraph = demo.getByText('局部颜色 / Local color', { exact: true })
      const before = await paragraph.evaluate((element) => getComputedStyle(element).color)
      const nested = demo.getByText('嵌套覆盖 / Nested override', { exact: true })
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
      if (library === 'maple' && (component === 'date' || component === 'date-range')) await demo.locator('.mp-date__input-trigger').first().click()
      else await input.click()
      const active = visible(page.locator(`.${p}-date-panel,.${p}-time-panel,[role="dialog"]`)).last()
      await active.waitFor({ state: 'visible' })
      assert.ok((await text(active)).trim().length > 0, 'date/time editor has usable content')
      await page.keyboard.press('Escape')
      await active.waitFor({ state: 'hidden' })
      assert.equal(await input.inputValue(), '', 'cancelling the editor does not commit a draft')
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
      await mode.click()
      await page.getByRole('option', { name: '月', exact: true }).click()
      await demo.locator(`.${p}-scheduler__month`).waitFor({ state: 'visible' })
      assert.match(await text(demo), /首页设计评审/)
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
      const field = firstInput(), initial = await field.inputValue()
      if (component === 'color') await demo.locator('.c-color-picker').click()
      const input = component === 'color-picker' ? demo.locator(`.${p}-color-picker-input-hex input`).first() : visible(page.locator(`.${p}-color-picker-input-hex input`)).last()
      await input.fill('FF0000')
      await input.press('Tab')
      if (component === 'color') await poll(() => field.inputValue(), (value) => value !== initial && /ff0000|255/i.test(value), 'hex edit updates the actual color field model')
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
      await poll(() => target.evaluate((element) => getComputedStyle(element).transform), (value) => value !== initial, 'trusted touch drag changes the floating panel anchor')
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
      await page.evaluate(() => scrollTo(0, 0))
      await touchDrag(page, root(), 0, 420)
      await poll(() => text(root()), (value) => value.includes('新的列表项'), 'trusted pull gesture completes the local asynchronous refresh')
      break
    }
    case 'swipe-cell': {
      await touchDrag(page, root().locator(`.${p}-swipe-cell__content`), -130, 0)
      await poll(() => text(demo.getByRole('status')), (value) => value.includes('open: name=order-1001'), 'trusted swipe opens actions with the configured cell identity')
      break
    }
    default: throw new Error(`${component}: unimplemented production action ${action}`)
  }
  return action
}
