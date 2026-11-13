// Check compiled option styles in direct menus and desktop/mobile editors.
import assert from 'node:assert/strict'
import { auditThemes, rgba, over, luminance } from './theme-audit-utils.mjs'

let states = 0
let minimum = Infinity
for (const component of ['select', 'auto-complete', 'cascader']) {
  await auditThemes(component, ({ prefix: p, repo, brand, mode, document, tag, variables, cascade, expand }) => {
    const context = `${repo}/${brand}/${mode}/${component}`
    const read = name => expand(variables[`--${p}-${name}`])
    const element = (classes, parent = tag) => {
      const node = document.createElement('div')
      node.className = classes
      parent.append(node)
      return node
    }
    const contrast = color => {
      const fg = rgba(color), bg = rgba(read('sys-color-surface-overlay'))
      const a = luminance(over(fg, bg)), b = luminance(bg)
      const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05)
      minimum = Math.min(minimum, ratio)
    }
    for (const editor of [null, 'desktop', 'mobile']) {
      const host = editor ? element(`${p}-selection-editor ${p}-selection-editor--${component}${editor === 'mobile' ? ` ${p}-selection-editor--mobile` : ''}`) : tag
      const root = element(component === 'cascader' ? `${p}-cascader-panel` : `${p}-select-dropdown${component === 'auto-complete' ? ` ${p}-auto-complete__dropdown` : ''}`, host)
      for (const kind of component === 'cascader' ? ['cascader-option', 'cascader-search-option'] : ['select-option'])
      for (const selected of [false, true]) for (const hover of [false, true]) for (const active of [false, true]) for (const disabled of [false, true]) {
        if (!selected && !hover && !active) continue
        const node = element([`${p}-${kind}`, selected && `${p}-${kind}-selected`, hover && 'audit-hover', hover && kind === 'cascader-search-option' && `${p}-${kind}-hover`, active && `${p}-${kind}-active`, disabled && `${p}-${kind}-disabled`].filter(Boolean).join(' '), root)
        const styles = cascade(node)
        if (kind === 'select-option' || kind === 'cascader-option' && editor) {
          const radius = styles['border-radius'] ? expand(styles['border-radius']) : '0'
          const expected = brand === 'default' ? '0' : editor && !(editor === 'mobile' && kind === 'select-option') ? '8px' : kind === 'select-option' ? expand(variables[`--${p}-sys-radius-lg`]) : '0'
          assert.equal(radius, expected, `${context}/${editor}: option radius matches the theme`)
          if (kind === 'select-option') {
            const key = `--${p}-${editor === 'desktop' ? 'selection-editor-option-radius' : 'select-popup-option-border-radius'}`
            const previous = variables[key]
            variables[key] = '7px'
            assert.equal(expand(styles['border-radius']), '7px', `${context}/${editor}: explicit radius override works`)
            variables[key] = previous
          }
        }
        const tokenPrefix = component === 'cascader' ? 'cascader-item' : component === 'auto-complete' ? 'auto-complete-option' : 'select-popup-option'
        const color = expand(styles.color)
        if (disabled) {
          const suffix = component === 'cascader' && (selected || active) ? 'disabled-active' : 'disabled'
          assert.equal(color, read(`${tokenPrefix}-text-color-${suffix}`), `${context}/${editor}: disabled color wins`)
        } else if (selected) {
          assert.equal(color, read('sys-color-action-primary'), `${context}/${editor}: selected text matches the primary button through hover and keyboard activation`)
          const isEditorOverride = Boolean(editor) && kind !== 'cascader-search-option'
          const background = expand(isEditorOverride ? styles.background : styles['background-color'])
          assert.equal(background, hover || active ? read(component === 'cascader' ? 'cascader-item-bg-hover' : component === 'auto-complete' ? 'auto-complete-option-bg-hover' : 'select-popup-option-bg-hover') : 'transparent', `${context}/${editor}: selected fill does not replace hover`)
          contrast(color)
        } else {
          assert.equal(color, read(`${tokenPrefix}-text-color-hover`), `${context}/${editor}: unselected hover color is unchanged`)
          assert.equal(expand(styles['background-color']), read(`${tokenPrefix}-bg-hover`), `${context}/${editor}: unselected hover fill is unchanged`)
        }
        states++
        node.remove()
      }
      if (editor) host.remove(); else root.remove()
    }
  }, {
    importsAfter: ['_components/selected-options'],
    tokenImports: component === 'auto-complete' ? ['select/style/index.less'] : [],
    themeFileName: component === 'auto-complete' ? 'select' : component,
  })
}
console.log(`Selection option styles passed: ${states} direct/editor states; selected text minimum contrast ${minimum.toFixed(3)}:1.`)

await auditThemes('tree-select', ({ prefix: p, brand, document, tag, variables, cascade, expand }) => {
  for (const hover of [false, true]) {
    const popup = document.createElement('div')
    popup.className = `${p}-tree-select-popup`
    popup.innerHTML = `<div class="${p}-tree"><div class="${p}-tree-node ${p}-tree-node-selected"><span class="${p}-tree-node-title${hover ? ' audit-hover' : ''}">Selected</span></div></div>`
    tag.append(popup)
    const title = popup.querySelector(`.${p}-tree-node-title`)
    const node = popup.querySelector(`.${p}-tree-node`)
    assert.equal(expand(cascade(node)['border-radius']), brand === 'default' ? '0' : expand(variables[`--${p}-sys-radius-lg`]), 'TreeSelect option radius matches the theme')
    assert.equal(expand(cascade(title).color), expand(variables[`--${p}-sys-color-action-primary`]), 'TreeSelect selected text matches the primary button, including hover')
    popup.remove()
  }
}, { platforms: ['c'], tokenImports: ['select/style/index.less', 'tree/style/index.less'] })
console.log('TreeSelect primary selected text passed in light/dark themes and hover states.')
