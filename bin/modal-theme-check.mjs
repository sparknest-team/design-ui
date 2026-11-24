// Steady-state compiled CSS checks; interaction/Teleport behavior is tested in each library.
import assert from 'node:assert/strict'
import { reportTextContrast } from './contrast-pair.mjs'
import { reportContrast } from './contrast-report.mjs'
import { auditThemes, luminance, over, rgba } from './theme-audit-utils.mjs'

let combinations = 0,
  pairs = 0,
  minimum = Infinity,
  overridePairs = 0
for (const component of ['dialog', 'drawer', 'popup']) {
  await auditThemes(
    component,
    ({ prefix: p, repo, brand, mode, tag, document, cascade, variables, expand }) => {
      const label = `${repo}/${brand}/${mode}/${component}`
      const read = (name) => expand(variables[`--${p}-${name}`])
      // Platform-only components have no fake counterpart in the shared-name contract.
      const platformDefaults =
        component === 'drawer'
          ? {
              'drawer-bg': 'surface-raised',
              'drawer-overlay-bg': 'scrim',
              'drawer-header-text-color': 'content-primary',
              'drawer-content-text-color': 'content-primary',
              'drawer-border-color': 'border-default',
            }
          : component === 'popup'
            ? {
                'popup-content-background-color': 'surface-raised',
                'popup-content-text-color': 'content-primary',
                'popup-overlay-background-color': 'scrim',
              }
            : {}
      for (const [token, role] of Object.entries(platformDefaults)) {
        assert.equal(
          variables[`--${p}-${token}`],
          `var(--${p}-sys-color-${role})`,
          `${label}/${token}: semantic mapping`,
        )
      }
      const node = (classes, parent = tag) => {
        const el = document.createElement('div')
        el.className = classes
        parent.append(el)
        return el
      }
      const check = (el, prop, token) => {
        assert.equal(cascade(el)[prop], `var(--${p}-${token})`, `${label}/${prop}`)
        // Resolve every governed consumer, then verify a public override actually reaches it.
        read(token)
        const key = `--${p}-${token}`,
          before = variables[key]
        variables[key] = '#123456'
        assert.equal(expand(cascade(el)[prop]), '#123456', `${label}/${token} override`)
        variables[key] = before
      }
      let panel,
        backdrop,
        surface,
        overlayToken,
        backgroundProperty = 'background-color'
      const foregrounds = []
      if (component === 'dialog') {
        panel = node(`${p}-dialog`)
        const mobile = p === 'mp'
        backgroundProperty = mobile ? 'background' : 'background-color'
        const title = node(mobile ? 'mp-dialog__title' : 'c-dialog-title', panel)
        const body = node(mobile ? 'mp-dialog__message' : 'c-dialog-body', panel)
        const close = node(mobile ? 'mp-dialog__close-button' : 'c-dialog-close-btn', panel)
        for (const [el, suffix] of [
          [title, 'title-text-color'],
          [body, 'content-text-color'],
          [close, 'close-button-color'],
        ]) {
          check(el, 'color', `dialog-${suffix}`)
          foregrounds.push(el)
        }
        const iconParent = node(mobile ? 'mp-dialog__title-content' : 'c-dialog-title-icon', title)
        for (const [status, iconClass] of [
          ['info', 'info-circle'],
          ['success', 'check-circle'],
          ['warning', 'exclamation-circle'],
          ['danger', 'close-circle'],
        ]) {
          const icon = node(mobile ? 'mp-dialog__title-icon' : `c-icon-${iconClass}-fill`, iconParent)
          if (mobile) panel.className = `mp-dialog mp-dialog--type-${status === 'danger' ? 'error' : status}`
          check(icon, 'color', `dialog-status-${status}-color`)
          // Capture the matched status now: the same title node is reused for other types.
          foregrounds.push({ color: expand(cascade(icon).color) })
        }
        surface = 'dialog-background'
        overlayToken = 'dialog-overlay-background'
        backdrop = mobile ? node('mp-popup__overlay', node('mp-popup mp-dialog__popup')) : node('c-dialog-overlay')
        if (mobile) {
          const popupBackdrop = node('mp-popup__overlay', node('mp-popup'))
          assert.equal(
            cascade(popupBackdrop)['background-color'],
            'var(--mp-popup-overlay-background-color)',
            `${label}: Dialog must not recolor standalone Popup`,
          )
        }
      } else if (component === 'drawer') {
        panel = node('c-drawer')
        // A 100vw/custom width must not exceed a scrollbar-reduced containing block.
        assert.equal(cascade(panel)['max-width'], '100%', `${label}/container width bound`)
        const header = node('c-drawer-header', panel),
          body = node('c-drawer-body', panel)
        const title = node('c-drawer-title', header),
          close = node('c-drawer-close-btn', header)
        for (const [el, suffix] of [
          [title, 'header-text-color'],
          [body, 'content-text-color'],
          [close, 'header-text-color'],
        ]) {
          check(el, 'color', `drawer-${suffix}`)
          foregrounds.push(el)
        }
        assert.equal(read('drawer-border-color'), read('sys-color-border-default'))
        surface = 'drawer-bg'
        overlayToken = 'drawer-overlay-bg'
        backdrop = node('c-drawer-overlay')
      } else {
        panel = node('mp-popup__content mp-popup--content-background-color')
        check(panel, 'color', 'popup-content-text-color')
        foregrounds.push(panel)
        surface = 'popup-content-background-color'
        overlayToken = 'popup-overlay-background-color'
        backdrop = node('mp-popup__overlay')
        const unstyled = node('mp-popup__content')
        assert.equal(cascade(unstyled).color, undefined, `${label}: unstyled keeps consumer-owned colors`)
        assert.equal(cascade(unstyled)['background-color'], undefined)
      }
      check(panel, backgroundProperty, surface)
      check(backdrop, 'background-color', overlayToken)
      assert.equal(read(surface), read('sys-color-surface-raised'), `${label}: surface`)
      assert.equal(read(overlayToken), read('sys-color-scrim'), `${label}: scrim`)
      assert.equal(cascade(panel).opacity, undefined, `${label}: no scrim opacity on foreground`)
      for (const el of foregrounds) {
        const bg = over(rgba(read(surface)), rgba(read('sys-color-surface-page')))
        const fg = over(rgba(el.color ?? expand(cascade(el).color)), bg)
        const a = luminance(fg),
          b = luminance(bg),
          ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
        reportContrast(ratio, 4.5, `${label}: ${ratio} < 4.5`)
        pairs++
        minimum = Math.min(minimum, ratio)
      }
      // Pair overrides are resolved through actual governed CSS consumers.
      // Status icons/custom slots are not assumed to inherit these text tokens.
      for (const surfaceValue of ['#182230', 'rgba(24,34,48,0.75)']) {
        const surfaceKey = `--${p}-${surface}`,
          savedSurface = variables[surfaceKey]
        variables[surfaceKey] = surfaceValue
        for (const el of foregrounds.filter((el) => !el.color)) {
          const declaration = cascade(el).color
          const foregroundKey = declaration.match(/^var\((--[\w-]+)\)$/)?.[1]
          assert.ok(foregroundKey, 'direct public foreground consumer')
          const savedForeground = variables[foregroundKey]
          variables[foregroundKey] = '#f8f9fc'
          const ratio = reportTextContrast(
            expand(cascade(el).color),
            expand(cascade(panel)[backgroundProperty]),
            read('sys-color-surface-page'),
          )
          overridePairs++
          minimum = Math.min(minimum, ratio)
          variables[foregroundKey] = savedForeground
        }
        variables[surfaceKey] = savedSurface
      }
      // Global scrim customization must propagate through every component's public alias.
      const key = `--${p}-sys-color-scrim`,
        original = variables[key]
      variables[key] = 'rgba(0, 0, 0, 0.3)'
      assert.equal(expand(cascade(backdrop)['background-color']), variables[key])
      variables[key] = original
      combinations++
    },
    {
      platforms: component === 'drawer' ? ['c'] : component === 'popup' ? ['mp'] : ['c', 'mp'],
      // Worst load order: generic Popup styles must never steal Dialog's backdrop.
      importsAfter: (p) => (component === 'dialog' && p === 'mp' ? ['popup'] : []),
    },
  )
}
console.log(
  `Modal themes passed: ${combinations} combinations, ${pairs} default and ${overridePairs} explicit foreground/background pairs, minimum ${minimum.toFixed(3)}:1; public and global scrim overrides verified. Compiled CSS, not arbitrary slots/browser proof.`,
)
