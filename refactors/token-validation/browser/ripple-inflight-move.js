import Cedar from '/cedar-design-web/packages/ui/src/ripple/index.ts'
import Maple from '/maple-design-mobile/packages/ui/src/ripple/index.ts'
import '/cedar-design-web/packages/ui/src/ripple/style/index.ts'
import '/maple-design-mobile/packages/ui/src/ripple/style/index.ts'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
async function run(name, directive, release) {
  const iframe = document.createElement('iframe')
  document.querySelector('#frames').append(iframe)
  const target = iframe.contentDocument,
    button = document.createElement('button')
  button.textContent = `${name} ${release}`
  document.body.append(button)
  directive.mounted(button, { value: {} })
  if (release === 'mouseup') button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }))
  else {
    const event = new Event('touchstart', { bubbles: true })
    Object.defineProperty(event, 'touches', { value: [{ clientX: 5, clientY: 5 }] })
    button.dispatchEvent(event)
  }
  await wait(80)
  const before = button.querySelectorAll('div').length
  target.body.append(button)
  const ownerBeforeRelease = button._ripple.document === target
  button.dispatchEvent(new target.defaultView.Event(release, { bubbles: true }))
  await wait(700)
  const after = button.querySelectorAll('div').length,
    ownerAfterRelease = button._ripple.document === target
  directive.unmounted(button)
  button.remove()
  iframe.remove()
  return {
    name,
    release,
    before,
    after,
    ownerBeforeRelease,
    ownerAfterRelease,
    passed: before === 1 && after === 0 && !ownerBeforeRelease && ownerAfterRelease,
  }
}
document.querySelector('#run').addEventListener('click', async (event) => {
  event.currentTarget.disabled = true
  const results = []
  try {
    for (const [name, directive] of [
      ['Cedar', Cedar],
      ['Maple', Maple],
    ])
      for (const release of ['mouseup', 'touchend', 'touchcancel']) results.push(await run(name, directive, release))
  } catch (error) {
    results.push({ passed: false, error: String(error), stack: error.stack })
  }
  document.querySelector('#results').textContent = JSON.stringify(results, null, 2)
  event.currentTarget.disabled = false
})
