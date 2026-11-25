import assert from 'node:assert/strict'

let count = 0
let minimum = Infinity
const examples = []

// Color customization is intentional: contrast targets are advice, not merge gates.
// Invalid calculations still indicate broken CSS/input data and must fail.
export function reportContrast(ratio, target, context = 'color pair') {
  assert.ok(Number.isFinite(ratio) && ratio >= 1, 'valid contrast ratio required')
  assert.ok(Number.isFinite(target) && target >= 1, 'valid contrast target required')
  if (ratio >= target) return true
  count++
  minimum = Math.min(minimum, ratio)
  examples.push({ ratio, target, context: String(context) })
  examples.sort((a, b) => a.ratio - b.ratio)
  examples.length = Math.min(examples.length, 8)
  return false
}

process.once('beforeExit', () => {
  if (!count) return
  const escape = (value) => String(value).replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A')
  console.warn(
    `::warning title=Color contrast advisory::${escape(`${count} color pairs are below suggested contrast targets; minimum ${minimum}:1. Custom colors are retained; this does not block merging.`)}`,
  )
  for (const { ratio, target, context } of examples)
    console.warn(`[contrast advisory] ${context}: ${ratio}:1; suggested ${target}:1`)
})
