import assert from 'node:assert/strict'

/** The two Switch implementations intentionally expose different edit modes. */
export function normalizeSwitchEditMode(block, platform) {
  const variants = {
    cedar: "FieldEditMode<br>`'direct' \\| 'click' \\| 'dblclick'`",
    maple: "FieldEditMode<br>`'direct' \\| 'popup'`",
  }
  const expected = variants[platform]
  assert(expected, `Unknown Switch platform: ${platform}`)
  const lines = block.split('\n')
  const rows = lines.flatMap((line, index) => (/^\|\s*edit-mode\s*\|/.test(line) ? [index] : []))
  assert.equal(rows.length, 1, `${platform}: expected one Switch edit-mode row`)
  const parts = lines[rows[0]].split(expected)
  assert.equal(parts.length, 2, `${platform}: Switch edit-mode must match its reviewed platform contract`)
  lines[rows[0]] = parts.join('FieldEditMode<br>`PLATFORM_EDIT_MODES`')
  return lines.join('\n')
}

/** Preserve each platform's reviewed Button size inheritance. */
export function normalizeButtonSize(block, platform) {
  const descriptions = {
    cedar: '尺寸；依次采用自身、按钮组、ConfigProvider，最后为 md',
    maple: '尺寸；省略时继承按钮组，否则 md',
  }
  const expected = descriptions[platform]
  assert(expected, `Unknown Button platform: ${platform}`)
  const lines = block.split('\n')
  const rows = lines.flatMap((line, index) => (/^\|\s*size\s*\|/.test(line) ? [index] : []))
  assert.equal(rows.length, 1, `${platform}: expected one Button size row`)
  const cells = lines[rows[0]]
    .split('|')
    .slice(1, -1)
    .map((value) => value.trim())
  assert.deepEqual(
    cells,
    ['size', expected, '`xs / sm / md / lg / xl`', '`undefined`'],
    `${platform}: unreviewed Button size contract`,
  )
  lines[rows[0]] = '| size | PLATFORM_SIZE_INHERITANCE | `xs / sm / md / lg / xl` | `undefined` |'
  return lines.join('\n')
}
