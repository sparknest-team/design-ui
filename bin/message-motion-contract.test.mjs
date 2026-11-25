import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

for (const [repo, pkg] of [
  ['cedar-design-web', 'ui'],
  ['maple-design-mobile', 'ui'],
]) {
  const source = new URL(`../../${repo}/packages/${pkg}/src/message/`, import.meta.url)
  test(`${repo}: CSS completion is not forced to 150ms`, () => {
    const sfc = readFileSync(new URL('Message.vue', source), 'utf8')
    assert.doesNotMatch(sfc, /:duration\s*=/)
    // 完成信号必须来自 CSS 结束事件：可以直接 emit，也可以走具名处理器，
    // 但该处理器必须转发 'closed'，不能默默吞掉。
    const direct = /@after-leave="emit\('closed'\)"/.test(sfc)
    const handler = sfc.match(/@after-leave="([A-Za-z_$][\w$]*)"/)
    const forwards = handler
      ? new RegExp(`function\\s+${handler[1]}\\s*\\([^)]*\\)[\\s\\S]{0,600}?emit\\(['"]closed['"]\\)`).test(sfc)
      : false
    assert.ok(direct || forwards, "@after-leave must forward 'closed'")
  })
  test(`${repo}: service disposal follows component completion`, () => {
    const service = readFileSync(new URL('index.ts', source), 'utf8')
    assert.doesNotMatch(service, /closeTimers|setTimeout\(/)
    assert.match(service, /onClosed:\s*\(\) => this\.finishClose\(item\)/)
    assert.match(service, /!this\.instances\.has\(item\.id\)/)
    assert.match(service, /!item\.open \|\| !this\.items\.includes\(item\)/)
    assert.match(service, /const index = this\.items\.indexOf\(item\)/)
    assert.match(service, /if \(item\.open\)/)
    assert.match(service, /\[\.\.\.this\.items\]/)
  })
}
