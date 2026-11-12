import Cedar from '/cedar-design-web/packages/ui/src/ripple/index.ts'
import Maple from '/maple-design-mobile/packages/ui/src/ripple/index.ts'
import '/cedar-design-web/packages/ui/src/ripple/style/index.ts'
import '/maple-design-mobile/packages/ui/src/ripple/style/index.ts'

const out = document.querySelector('#results')
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
async function run(name, directive, update) {
  const iframe = document.createElement('iframe')
  document.querySelector('#frames').append(iframe)
  const target = iframe.contentDocument
  const button = document.createElement('button')
  button.textContent = `${name} ${update ? 'update' : 'activation'}`
  document.body.append(button)
  directive.mounted(button, { value: {} })
  let releases = 0
  const original = button._ripple.removeRipple
  button._ripple.removeRipple = () => { releases++; original() }
  target.body.append(button)
  if (update) directive.updated(button, { value: {} })
  const ownerAfterMove = button._ripple.document === target
  button.dispatchEvent(new target.defaultView.MouseEvent('mousedown', { bubbles: true, button: 0 }))
  await wait(80)
  const wavesBefore = button.querySelectorAll('div').length
  const before = releases
  document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
  const oldReleased = releases - before
  target.dispatchEvent(new target.defaultView.MouseEvent('mouseup', { bubbles: true }))
  const newReleased = releases - before - oldReleased
  await wait(700)
  const wavesAfter = button.querySelectorAll('div').length
  const owner = button._ripple.document === target
  directive.unmounted(button)
  button.remove(); iframe.remove()
  return { name, mode: update ? 'update' : 'activation', ownerAfterMove, owner, wavesBefore, wavesAfter, oldReleased, newReleased,
    passed: ownerAfterMove === update && owner && wavesBefore === 1 && wavesAfter === 0 && oldReleased === 0 && newReleased === 1 }
}
document.querySelector('#run').addEventListener('click', async event => {
  event.currentTarget.disabled = true
  const results = []
  try { for (const [name, directive] of [['Cedar', Cedar], ['Maple', Maple]]) for (const update of [true, false]) results.push(await run(name, directive, update)) }
  catch (error) { results.push({ passed: false, error: String(error), stack: error.stack }) }
  out.textContent = JSON.stringify(results, null, 2)
  event.currentTarget.disabled = false
})
