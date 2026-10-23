import assert from 'node:assert/strict'
import { auditThemes, rgba } from './theme-audit-utils.mjs'

let checks = 0
await auditThemes('button', ({ prefix: p, repo, brand, mode, tag, cascade, expand }) => {
  for (const loading of [false, true])
    for (const hover of [false, true])
      for (const active of [false, true]) {
        tag.className = [
          `${p}-button`, `${p}-button--variant-default`, `${p}-button--status-primary`,
          loading && `${p}-button--loading`, hover && `${p}-button--hovering`, active && 'audit-active',
        ].filter(Boolean).join(' ')
        assert.deepEqual(rgba(expand(cascade(tag).color)).slice(0, 3), [255, 255, 255],
          `${repo}/${brand}/${mode}: primary solid buttons must use white foreground`)
        checks++
      }
})
console.log(`Primary solid button white foreground passed: ${checks} platform/theme/state combinations.`)
