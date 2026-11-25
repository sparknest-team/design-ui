import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeButtonSize, normalizeSwitchEditMode } from './same-source-demo-normalization.mjs'

test('maps only the two reviewed Switch edit-mode contracts', () => {
  const cedar = "| edit-mode | FieldEditMode<br>`'direct' \\| 'click' \\| 'dblclick'` | undefined |"
  const maple = "| edit-mode | FieldEditMode<br>`'direct' \\| 'popup'` | undefined |"
  assert.equal(normalizeSwitchEditMode(cedar, 'cedar'), normalizeSwitchEditMode(maple, 'maple'))
  assert.throws(() => normalizeSwitchEditMode(cedar.replace('dblclick', 'hover'), 'cedar'), /reviewed/)
  assert.throws(() => normalizeSwitchEditMode(maple.replace('popup', 'click'), 'maple'), /reviewed/)
  assert.throws(() => normalizeSwitchEditMode(cedar + cedar, 'cedar'), /reviewed/)
  assert.notEqual(
    normalizeSwitchEditMode(cedar, 'cedar'),
    normalizeSwitchEditMode(maple.replace('undefined', 'true'), 'maple'),
  )
})

test('Button size exception requires the exact platform descriptions, type and default', () => {
  const cedar =
    '| size | 尺寸；依次采用自身、按钮组、ConfigProvider，最后为 md | `xs / sm / md / lg / xl` | `undefined` |'
  const maple = '| size | 尺寸；省略时继承按钮组，否则 md | `xs / sm / md / lg / xl` | `undefined` |'
  assert.equal(normalizeButtonSize(cedar, 'cedar'), normalizeButtonSize(maple, 'maple'))
  assert.throws(() => normalizeButtonSize(cedar.replace('ConfigProvider', 'Form'), 'cedar'), /unreviewed/)
  assert.throws(() => normalizeButtonSize(maple.replace('undefined', 'md'), 'maple'), /unreviewed/)
  assert.throws(() => normalizeButtonSize(cedar.replace('xl', 'xxl'), 'cedar'), /unreviewed/)
  assert.throws(() => normalizeButtonSize(cedar + '\n' + cedar, 'cedar'), /one Button size/)
})
