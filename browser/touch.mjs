import assert from 'node:assert/strict'

export async function touchDrag(page, target, dx, dy) {
  await target.scrollIntoViewIfNeeded()
  await target.click({ trial: true })
  const box = await target.boundingBox()
  assert.ok(box, 'touch target must have layout')
  const viewport = page.viewportSize() ?? (await page.evaluate(() => ({ width: innerWidth, height: innerHeight })))
  const left = Math.max(box.x, 0),
    right = Math.min(box.x + box.width, viewport.width)
  const top = Math.max(box.y, 0),
    bottom = Math.min(box.y + box.height, viewport.height)
  assert.ok(right > left && bottom > top, 'touch target must intersect the viewport')
  const x = (left + right) / 2,
    y = (top + bottom) / 2
  assert.ok(
    await target.evaluate((element, point) => element.contains(document.elementFromPoint(point.x, point.y)), { x, y }),
    'touch starts on the target rather than a sticky header or overlay',
  )
  if (page.context().browser().browserType().name() === 'chromium') {
    const session = await page.context().newCDPSession(page)
    try {
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
      for (let step = 1; step <= 8; step++)
        await session.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x: x + (dx * step) / 8, y: y + (dy * step) / 8 }],
        })
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    } finally {
      await session.detach()
    }
    return
  }
  // Playwright exposes no cross-engine trusted touch-drag API. Keep handler
  // coverage on Firefox/WebKit, label it synthetic, and require native device
  // acceptance separately for gesture arbitration, scrolling and keyboards.
  await target.evaluate(
    async (element, { x, y, dx, dy }) => {
      const dispatch = (type, step) => {
        const touch = {
          identifier: 1,
          target: element,
          clientX: x + (dx * step) / 8,
          clientY: y + (dy * step) / 8,
          pageX: x + (dx * step) / 8 + scrollX,
          pageY: y + (dy * step) / 8 + scrollY,
          screenX: x + (dx * step) / 8,
          screenY: y + (dy * step) / 8,
        }
        const event = new Event(type, { bubbles: true, cancelable: true })
        for (const [key, value] of Object.entries({
          touches: type === 'touchend' ? [] : [touch],
          targetTouches: type === 'touchend' ? [] : [touch],
          changedTouches: [touch],
        })) {
          Object.defineProperty(event, key, { value })
        }
        element.dispatchEvent(event)
      }
      dispatch('touchstart', 0)
      for (let step = 1; step <= 8; step++) {
        await new Promise((done) => requestAnimationFrame(done))
        dispatch('touchmove', step)
      }
      dispatch('touchend', 8)
    },
    { x, y, dx, dy },
  )
}
