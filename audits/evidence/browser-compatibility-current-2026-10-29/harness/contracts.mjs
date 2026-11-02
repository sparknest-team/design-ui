// Every documented component must be deliberately classified. There is no
// catch-all "click something" recipe and no silent presentation fallback.
const interactive = {
  affix: 'affix', alert: 'alert', anchor: 'anchor', 'auto-complete': 'auto-complete',
  'back-top': 'back-top', button: 'button', calendar: 'calendar', carousel: 'carousel',
  cascader: 'cascader', checkbox: 'checkbox', collapse: 'collapse', color: 'color',
  'color-picker': 'color-picker', 'config-provider': 'config-provider', 'count-to': 'count-to',
  countdown: 'countdown', date: 'temporal', 'date-range': 'temporal', 'date-picker': 'date-panel', 'time-picker': 'time-panel', dialog: 'dialog',
  drawer: 'drawer', ellipsis: 'ellipsis', 'filter-form': 'filter-form', form: 'form',
  'infinite-scroll': 'infinite-scroll', input: 'input', 'input-number': 'input-number',
  'input-tag': 'input-tag', map: 'map', mention: 'mention', menu: 'menu', message: 'message',
  'nav-menu': 'nav-menu', notification: 'notification', 'overflow-list': 'overflow-list',
  overlay: 'overlay', pagination: 'pagination', 'people-select': 'people-select',
  popconfirm: 'popconfirm', popover: 'popover', radio: 'radio', rate: 'rate',
  'resize-box': 'resize-box', ripple: 'ripple', scheduler: 'scheduler', scrollbar: 'scrollbar',
  search: 'search', segmented: 'segmented', select: 'select', slider: 'slider', split: 'split',
  'split-button': 'split-button', steps: 'steps', 'style-provider': 'style-provider',
  switch: 'switch', 'table-column-manager': 'table-column-manager', tabs: 'tabs', tag: 'tag',
  textarea: 'textarea', time: 'temporal', 'time-range': 'temporal', tooltip: 'tooltip',
  transfer: 'transfer', tree: 'tree', 'tree-select': 'tree-select', trigger: 'trigger',
  upload: 'upload', 'verification-code': 'verification-code', watermark: 'watermark', image: 'image',
  'action-sheet': 'action-sheet', drag: 'drag', fab: 'fab',
  'floating-panel': 'floating-panel', hover: 'hover', 'index-bar': 'index-bar', lazy: 'lazy',
  'loading-bar': 'loading-bar', locale: 'locale', 'locale-provider': 'locale',
  'highlighter-provider': 'highlighter-provider', 'notice-bar': 'notice-bar',
  'number-keyboard': 'number-keyboard', picker: 'picker', popup: 'popup',
  'pull-refresh': 'pull-refresh', signature: 'signature', 'swipe-cell': 'swipe-cell', 'tab-bar': 'tab-bar',
}
const presentation = {
  avatar: ['avatar', 1], badge: ['badge', 1], breadcrumb: ['breadcrumb', 1],
  card: ['card', 1], cell: ['cell', 2], col: ['col', 2], code: ['code', 1],
  descriptions: ['descriptions', 1], divider: ['divider', 1], empty: ['empty', 1],
  'field-decorator': ['input', 5], 'form-details': ['form-details', 1], grid: ['grid', 1],
  icon: ['icon', 1], layout: ['layout', 1], link: ['link', 1], list: ['list', 1], loading: ['loading', 1],
  'page-header': ['page-header', 1], paper: ['paper', 1], progress: ['progress', 1],
  'progress-group': ['progress-group', 1], result: ['result', 1], row: ['row', 1],
  'safe-area': ['safe-area', 2],
  skeleton: ['skeleton', 1], space: ['space', 1], statistic: ['statistic', 1],
  table: ['table', 1], timeline: ['timeline', 1], typography: ['typography', 1],
}

const overrides = {
  cedar: {
    paper: { kind: 'interaction', action: 'paper', demo: 'live-properties.vue' },
    'field-decorator': { root: 'field-decorator', minimum: 5 },
    'date-picker': { demo: 'entry-boundary.vue' },
    'time-picker': { demo: 'panel-behavior.vue' },
    button: { demo: 'variants.vue' },
    alert: { demo: 'dismiss-comparison.vue' }, ellipsis: { demo: 'expand.vue' },
    'nav-menu': { demo: 'basic.vue' }, tag: { demo: 'closable.vue' },
  },
  maple: {
    picker: { demo: 'disabled.vue' },
    alert: { demo: 'dismiss-comparison.vue' },
    'nav-menu': { demo: 'basic.vue', action: 'nav-menu-filter' },
    button: { demo: 'variants.vue' },
    'field-decorator': { root: 'field-decorator', minimum: 1 },
    form: { demo: 'events.vue' },
    'date-range': { demo: 'basic-usage.vue' },
    ellipsis: { demo: 'expand.vue' }, upload: { demo: 'read-only.vue' },
    tag: { demo: 'closable-tag.vue' },
  },
}

export function contractFor(library, component) {
  if (interactive[component]) return { kind: 'interaction', action: interactive[component], ...overrides[library]?.[component] }
  if (presentation[component]) {
    const [root, minimum] = presentation[component]
    return { kind: 'presentation', root, minimum, ...overrides[library]?.[component] }
  }
  throw new Error(`${library}/${component}: missing an explicit production-browser contract`)
}

export const contractComponents = [...new Set([...Object.keys(interactive), ...Object.keys(presentation)])].sort()
