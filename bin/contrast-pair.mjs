import { reportContrast } from './contrast-report.mjs';
import assert from 'node:assert/strict'
import { rgba, over, luminance } from './theme-audit-utils.mjs'

// Resolve a translucent surface against a known opaque backing before text.
export function contrastPair(foreground, surface, backing) {
  const parse = value => {
    const color = rgba(value)
    assert.equal(color.length, 4, 'RGBA tuple required')
    assert.ok(color.every(Number.isFinite), 'finite color values required')
    assert.ok(color.slice(0, 3).every(value => value >= 0 && value <= 255), 'RGB channel range')
    assert.ok(color[3] >= 0 && color[3] <= 1, 'alpha range')
    return color
  }
  const base = parse(backing)
  assert.equal(base[3], 1, 'provide an actual opaque backing, not an unknown business slot')
  const bg = over(parse(surface), base)
  const fg = over(parse(foreground), bg)
  const a = luminance(fg), b = luminance(bg)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}
export function reportTextContrast(foreground, surface, backing, minimum = 4.5) {
  const ratio = contrastPair(foreground, surface, backing)
  reportContrast(ratio, minimum, `text contrast ${ratio} < ${minimum}; compare unrounded values`)
  return ratio
}
