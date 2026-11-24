import assert from 'node:assert/strict'
import { auditThemes } from './theme-audit-utils.mjs'

let checks = 0
const node = (document, parent, className, tag = 'div') => {
  const element = document.createElement(tag)
  element.className = className
  parent.append(element)
  return element
}
function consume(context, element, property, token, pseudo = '') {
  const { prefix, cascade, variables, expand } = context
  const name = `--${prefix}-${token}`
  const value = cascade(element, pseudo)[property]
  assert.ok(value?.includes(name), `${element.className}/${property} must consume ${name}`)
  const previous = variables[name]
  variables[name] = '19px'
  assert.ok(expand(value).includes('19px'), `${name} override must propagate`)
  variables[name] = previous
  checks++
}

for (const component of ['card', 'dialog', 'breadcrumb']) {
  await auditThemes(
    component,
    (context) => {
      const { prefix: p, document, tag } = context
      if (component === 'card') {
        tag.className = `${p}-card ${p}-card--direction-row`
        consume(context, node(document, tag, `${p}-card__content`), 'margin', 'card-content-row-margin')
      } else if (component === 'dialog') {
        tag.className = p === 'c' ? 'c-dialog c-dialog-simple' : 'mp-dialog mp-dialog--simple'
        consume(context, tag, 'border-radius', 'dialog-simple-border-radius')
        if (p === 'mp') {
          consume(context, tag, 'margin-top', 'dialog-margin-top')
          consume(context, node(document, tag, 'mp-dialog__message'), 'margin-top', 'dialog-simple-content-gap')
          consume(context, node(document, tag, 'mp-dialog__actions'), 'margin-top', 'dialog-simple-actions-gap')
        }
      } else if (p === 'mp') {
        assert.ok(context.expand('var(--mp-breadcrumb-separator-margin)').includes('10px'))
        context.variables['--mp-breadcrumb-margin-separator-horizontal'] = '19px'
        assert.equal(context.expand('var(--mp-breadcrumb-separator-margin)'), '0 19px')
        checks++
      }
    },
    { themeFileName: null, pointerMode: 'fine' },
  )
}

await auditThemes(
  'form',
  (context) => {
    const { document, tag, cascade, variables, expand } = context
    const item = node(document, tag, 'c-form-item')
    const content = node(document, item, 'c-form-item-content')
    const label = node(document, item, 'c-form-item-label-col')
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl']) {
      tag.className = `c-form c-form-size-${size}`
      variables['--c-internal-form-item-margin-bottom'] = cascade(tag)['--c-internal-form-item-margin-bottom']
      assert.equal(expand(cascade(item)['margin-bottom']), expand(`var(--c-form-size-${size}-item-margin-bottom)`))
      assert.equal(expand(cascade(content)['min-height']), expand(`var(--c-form-size-${size}-height)`))
      assert.equal(expand(cascade(label)['line-height']), expand(`var(--c-form-size-${size}-height)`))
      item.className = 'c-form-item c-form-item-error'
      assert.equal(cascade(item)['margin-bottom'], '0')
      item.className = 'c-form-item'
      tag.classList.add('c-form-layout-inline')
      assert.equal(expand(cascade(item)['margin-bottom']), expand('var(--c-form-inline-item-margin-bottom)'))
      checks += 5
    }
  },
  { platforms: ['c'], themeFileName: null, pointerMode: 'fine' },
)

await auditThemes(
  'tree',
  (context) => {
    const { document, tag, cascade, variables, expand } = context
    const item = node(document, tag, 'c-tree-node')
    const switcher = node(document, item, 'c-tree-node-switcher')
    const title = node(document, item, 'c-tree-node-title')
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl']) {
      tag.className = `c-tree c-tree-size-${size}`
      variables['--c-internal-tree-icon-size'] = cascade(tag)['--c-internal-tree-icon-size']
      assert.equal(expand(cascade(switcher)['font-size']), expand(`var(--c-tree-size-${size}-icon-size)`))
      assert.equal(expand(cascade(switcher).height), expand(`var(--c-tree-size-${size}-line-height)`))
      assert.equal(expand(cascade(title)['font-size']), expand(`var(--c-tree-size-${size}-font-size)`))
      const titleStyle = cascade(title)
      assert.equal(
        expand(titleStyle['padding-top'] ?? titleStyle.padding.split(' ')[0]),
        expand(`var(--c-tree-size-${size}-title-padding-vertical)`),
      )
      checks += 4
    }
  },
  { platforms: ['c'], themeFileName: null },
)

await auditThemes(
  'page-header',
  (context) => {
    const { document, tag } = context
    tag.className = `${context.prefix}-page-header`
    const back = node(document, tag, `${context.prefix}-page-header__back audit-hover`, 'button')
    consume(context, back, 'width', 'page-header-back-hover-size', '::before')
    consume(context, back, 'background', 'page-header-back-hover-bg', '::before')
  },
  { themeFileName: null, pointerMode: 'fine' },
)

await auditThemes(
  'page-header',
  (context) => {
    const { prefix: p, document, tag, cascade } = context
    tag.className = `${p}-page-header`
    const back = node(document, tag, `${p}-page-header__back audit-hover`, 'button')
    assert.equal(cascade(back, '::before').background, undefined)
    back.classList.add('audit-focus-visible')
    consume(context, back, 'background', 'page-header-back-hover-bg', '::before')
    checks++
  },
  { themeFileName: null, pointerMode: 'coarse' },
)

await auditThemes(
  'split',
  (context) => {
    const { document, tag } = context
    for (const [direction, property] of [
      ['horizontal', 'height'],
      ['vertical', 'width'],
    ]) {
      const trigger = node(document, tag, `c-split-trigger c-split-trigger-${direction}`)
      consume(context, trigger, property, 'split-trigger-size-icon-wrapper')
    }
  },
  { platforms: ['c'], themeFileName: null },
)

await auditThemes(
  'image',
  (context) => {
    const { document, tag } = context
    const arrow = node(document, tag, 'c-image-preview__arrow-left', 'button')
    consume(context, arrow, 'font-size', 'image-preview-arrow-font-size')
  },
  { platforms: ['c'], themeFileName: null, pointerMode: 'fine' },
)

for (const [component, platforms, classes, pseudo] of [
  ['card', ['c', 'mp'], '__content', ''],
  ['dialog', ['c'], '@zoom-modal-enter-active', ''],
  ['dialog', ['mp'], '', ''],
  ['form', ['c'], 'form-blink-enter-active', ''],
  ['radio', ['c', 'mp'], '__icon', '::after'],
  ['select', ['c', 'mp'], '-option audit-hover', ''],
  ['steps', ['c', 'mp'], '-item-title', ''],
  ['tree', ['c'], '-node-list', ''],
  // Textarea shell transitions now belong to the shared FieldDecorator.
  ['field-decorator', ['c', 'mp'], '', ''],
]) {
  for (const pointerMode of ['fine', 'coarse'])
    await auditThemes(
      component,
      (context) => {
        const { prefix: p, document, tag, cascade } = context
        tag.className = `${p}-${component}`
        const target = node(
          document,
          tag,
          component === 'form' ? classes : classes.startsWith('@') ? classes.slice(1) : `${p}-${component}${classes}`,
        )
        const styles = cascade(target, pseudo)
        if (component === 'field-decorator') {
          const duration = `--${p}-field-hint-duration`
          assert.equal(styles[duration], '0s', `${p}/${component}: reduced duration`)
          assert.equal(styles.transition, `background-color var(${duration})`)
        } else {
          assert.equal(styles.transition, 'none', `${p}/${component}/${target.className}/${pseudo}/${pointerMode}`)
        }
        checks++
      },
      { platforms, themeFileName: null, reducedMotion: true, pointerMode },
    )
}
console.log(
  `Consumer resolution passed: ${checks} compiled DOM/cascade/override assertions; browser layout remains a separate check.`,
)
