import Cedar from '/cedar-design-web/packages/ui/src/ripple/index.ts'
import Maple from '/maple-design-mobile/packages/ui/src/ripple/index.ts'
import '/cedar-design-web/packages/ui/src/ripple/style/index.ts'
import '/maple-design-mobile/packages/ui/src/ripple/style/index.ts'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
async function run(name, directive, shadow) {
  const iframe = document.createElement('iframe')
  document.querySelector('#frames').append(iframe)
  const target = iframe.contentDocument,
    shell = document.createElement('div'),
    button = document.createElement('button')
  button.textContent = name
  document.body.append(shell)
  if (shadow) shell.attachShadow({ mode: 'closed' }).append(button)
  else shell.append(button)
  directive.mounted(button, { value: {} })
  button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }))
  await wait(80)
  const before = button.querySelectorAll('div').length
  shell.remove()
  await Promise.resolve()
  const afterDetach = button.querySelectorAll('div').length
  target.body.append(shell)
  await Promise.resolve()
  const owner = button._ripple.document === target
  target.body.dispatchEvent(new target.defaultView.MouseEvent('mouseup', { bubbles: true, button: 0 }))
  await wait(700)
  const afterRelease = button.querySelectorAll('div').length,
    observerActive = Boolean(button._ripple.migrationObserver)
  directive.unmounted(button)
  shell.remove()
  iframe.remove()
  return {
    name,
    shadow,
    before,
    afterDetach,
    owner,
    afterRelease,
    observerActive,
    passed: before === 1 && afterDetach === 0 && afterRelease === 0 && !observerActive,
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
      for (const shadow of [false, true]) results.push(await run(name, directive, shadow))
  } catch (error) {
    results.push({ passed: false, error: String(error), stack: error.stack })
  }
  document.querySelector('#results').textContent = JSON.stringify(results, null, 2)
  event.currentTarget.disabled = false
})
