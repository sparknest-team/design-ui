import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { featureRows } from './component-feature-analysis.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))
const ui = path.join(root, 'cedar-design-web/packages/ui')
const coreStrengths = JSON.parse(fs.readFileSync(path.join(root, 'design-ui/configs/core-strengths.json'), 'utf8'))
const spec = JSON.parse(fs.readFileSync(path.join(root, 'design-ui/configs/component-showcase.json'), 'utf8'))
const navigation = JSON.parse(fs.readFileSync(path.join(root, 'design-ui/configs/component-navigation.json'), 'utf8'))
const require = createRequire(path.join(ui, 'package.json'))
const { slugify } = await import(require.resolve('@mdit-vue/shared'))
const read = (p) => fs.readFileSync(p, 'utf8')
const check = process.argv.includes('--check')
const stale = []
function save(file, value) {
  const text = JSON.stringify(value, null, 2) + '\n'
  if (!fs.existsSync(file) || read(file) !== text) {
    if (check) stale.push(path.relative(root, file))
    else {
      fs.writeFileSync(file + '.tmp', text)
      fs.renameSync(file + '.tmp', file)
    }
  }
}
export const libraries = [
  {
    id: 'element-plus',
    name: 'Element Plus',
    repo: 'element-plus/element-plus',
    type: 'Vue 桌面',
    dir: 'docs/examples',
    doc: (key) => `docs/en-US/component/${key}.md`,
  },
  {
    id: 'naive-ui',
    name: 'Naive UI',
    repo: 'tusen-ai/naive-ui',
    type: 'Vue 桌面',
    dir: 'src',
    doc: (key) => `src/${key}/demos/zhCN/index.demo-entry.md`,
    files: (key, all) => all.filter((f) => f.startsWith(key + '/demos/zhCN/') && f.endsWith('.demo.vue')),
  },
  {
    id: 'arco-design-vue',
    name: 'Arco Design Vue',
    repo: 'arco-design/arco-design-vue',
    type: 'Vue 桌面',
    dir: 'packages/web-vue/components',
    doc: (key) => `packages/web-vue/components/${key}/README.zh-CN.md`,
    files: (key, all) => all.filter((f) => f.startsWith(key + '/__demo__/') && /\.(md|vue)$/.test(f)),
  },
  { id: 'vuetify', name: 'Vuetify', repo: 'vuetifyjs/vuetify', type: 'Vue 多端', dir: 'packages/docs/src/examples' },
  { id: 'quasar', name: 'Quasar', repo: 'quasarframework/quasar', type: 'Vue 多端', dir: 'docs/src/examples' },
  {
    id: 'shadcn-vue',
    name: 'shadcn-vue',
    repo: 'unovue/shadcn-vue',
    type: 'Vue 组合式',
    dir: 'apps/v4/registry',
    doc: (key) => `apps/v4/content/docs/components/${key}.md`,
    files: (key, all) =>
      all.filter(
        (f) =>
          /\/examples\//.test('/' + f) &&
          new RegExp(`^${key.replace(/-/g, '[-]?')}(?:[-A-Z.]|$)`, 'i').test(path.basename(f)) &&
          f.endsWith('.vue'),
      ),
  },
  {
    id: 'material-ui',
    name: 'MUI',
    repo: 'mui/material-ui',
    type: 'React 设计参考',
    dir: 'docs/data/material/components',
  },
  { id: 'primeng', name: 'PrimeNG', repo: 'primefaces/primeng', type: 'Angular 交互参考', dir: 'apps/showcase/doc' },
  {
    id: 'varlet',
    name: 'Varlet',
    repo: 'varletjs/varlet',
    type: 'Vue 移动',
    dir: 'packages/varlet-ui/src',
    doc: (key) => `packages/varlet-ui/src/${key}/docs/zh-CN.md`,
    files: (key, all) => all.filter((f) => f.startsWith(key + '/example/') && f.endsWith('.vue')),
  },
  {
    id: 'chakra-ui',
    name: 'Chakra UI',
    repo: 'chakra-ui/chakra-ui',
    type: 'React 组合参考',
    dir: 'apps/compositions/src/examples',
    files: (key, all) => all.filter((f) => path.basename(f).startsWith(key + '-') && f.endsWith('.tsx')),
  },
]
// Semantic equivalents are explicit. Closely related compositions are marked separately in the UI.
const aliases = {
  'auto-complete': ['auto-complete', 'autocomplete'],
  'back-top': ['back-top', 'backtop'],
  'nav-menu': ['menu', 'navigation-menu', 'menubar'],
  menu: ['dropdown', 'dropdown-menu', 'menu', 'context-menu'],
  input: ['input', 'inputtext', 'text-field', 'textfield', 'text-field'],
  textarea: ['input', 'textarea', 'textareas', 'text-field'],
  'input-number': ['input-number', 'number-input', 'inputnumber', 'number-field'],
  'input-tag': ['input-tag', 'dynamic-tags', 'chips', 'tags-input', 'tags'],
  'verification-code': ['input-otp', 'inputotp', 'otp-input', 'pin-input', 'input-otp'],
  date: ['date-picker', 'datepicker', 'date-input', 'date'],
  'date-range': ['date-picker', 'datepicker', 'date-range-picker', 'date'],
  'date-picker': ['date-picker', 'datepicker', 'date'],
  'date-range-picker': ['date-picker', 'datepicker', 'date-range-picker', 'date'],
  time: ['time-picker', 'timepicker', 'time'],
  'time-range': ['time-picker', 'timepicker', 'time'],
  'time-picker': ['time-picker', 'timepicker', 'time'],
  'time-range-picker': ['time-picker', 'timepicker', 'time'],
  color: ['color-picker', 'colorpicker', 'color'],
  'color-picker': ['color-picker', 'colorpicker', 'color'],
  dialog: ['dialog', 'modal'],
  loading: ['loading', 'spin', 'spinner', 'progress-spinner', 'progressspinner', 'circular-progress'],
  segmented: ['segmented', 'select-button', 'selectbutton', 'toggle-button', 'toggle-group'],
  rate: ['rate', 'rating'],
  'resize-box': ['resize-box', 'splitter', 'resizable', 'splitpanels'],
  split: ['split', 'splitter', 'resizable', 'splitpanels'],
  table: ['table', 'table-v2', 'data-table', 'datatable', 'tables'],
  'tree-select': ['tree-select', 'treeselect', 'tree-select'],
  upload: ['upload', 'file-upload', 'fileupload', 'uploader'],
  collapse: ['collapse', 'accordion', 'expansion-panel', 'expansion-panels'],
  image: ['image', 'img'],
  avatar: ['avatar', 'avatars'],
  badge: ['badge', 'badges'],
  breadcrumb: ['breadcrumb', 'breadcrumbs'],
  form: ['form', 'forms'],
  grid: ['grid', 'grid-system'],
  radio: ['radio', 'radio-button', 'radiobutton', 'radio-group', 'radio-buttons'],
  checkbox: ['checkbox', 'checkboxes'],
  switch: ['switch', 'toggle-switch', 'toggleswitch', 'toggle', 'switches'],
  tooltip: ['tooltip', 'tooltips'],
  popover: ['popover', 'popovers'],
  drawer: ['drawer', 'sidebar'],
  overlay: ['overlay', 'backdrop'],
  skeleton: ['skeleton', 'skeleton-loader'],
  carousel: ['carousel', 'carousels'],
  statistic: ['statistic', 'stat', 'stats'],
  countdown: ['countdown', 'statistic'],
  tag: ['tag', 'chip', 'chips', 'badge'],
  icon: ['icon', 'icons'],
  button: ['button', 'buttons'],
  link: ['link', 'links'],
  tabs: ['tabs', 'tab-menu'],
  typography: ['typography', 'text'],
  progress: ['progress', 'progress-bar', 'progressbar', 'linear-progress'],
  notification: ['notification', 'notifications', 'toast', 'snackbar', 'snackbars'],
  message: ['message', 'toast', 'snackbar'],
  empty: ['empty', 'empty-state'],
  pagination: ['pagination', 'paginator'],
  watermark: ['watermark'],
  'split-button': ['split-button', 'splitbutton', 'btn-dropdown'],
  space: ['space', 'flex', 'stack', 'stacks'],
  col: ['grid', 'grid-system'],
  row: ['grid', 'grid-system'],
  paper: ['paper', 'card'],
  layout: ['layout', 'container', 'containers', 'application-layout'],
  card: ['card', 'cards'],
  descriptions: ['descriptions', 'description-list', 'data-list', 'datalist'],
  tree: ['tree', 'treeview', 'tree-view'],
  'infinite-scroll': ['infinite-scroll', 'infinite-scroll'],
  ellipsis: ['ellipsis', 'typography', 'text'],
  'page-header': ['page-header', 'toolbar', 'app-bar'],
  'config-provider': ['config-provider', 'theme-provider', 'theme'],
  'theme-provider': ['theme-provider', 'theme', 'color'],
  hover: ['hover-card', 'hover', 'ripple'],
  'field-decorator': ['input', 'field', 'text-field', 'text-fields'],
  ripple: ['ripple', 'ripples'],
  trigger: ['trigger', 'popover', 'popovers'],
  scrollbar: ['scrollbar', 'scroll-area'],
  anchor: ['anchor', 'scrollspy'],
  search: ['input', 'inputtext', 'text-field'],
  'people-select': ['select', 'autocomplete', 'auto-complete', 'combobox'],
  'table-column-manager': ['table', 'data-table', 'datatable'],
  'filter-form': ['form', 'forms', 'filter'],
  'progress-group': ['progress', 'progressbar', 'meter-group', 'metergroup'],
  scheduler: ['calendar'],
  'overflow-list': ['overflow-list', 'overflow', 'menu', 'navigation-menu'],
  'count-to': ['count-to', 'number-animation', 'statistic', 'stat'],
  list: ['list', 'lists', 'data-list'],
}
const related = new Set([
  'people-select',
  'table-column-manager',
  'filter-form',
  'progress-group',
  'scheduler',
  'overflow-list',
  'field-decorator',
  'hover',
  'search',
  'trigger',
  'paper',
  'col',
  'row',
  'theme-provider',
  'count-to',
  'ellipsis',
  'page-header',
])
const specific = {
  quasar: {
    button: ['QBtn'],
    'split-button': ['QBtnDropdown'],
    input: ['QInput'],
    textarea: ['QInput'],
    'input-number': ['QInput'],
    select: ['QSelect'],
    'people-select': ['QSelect'],
    'auto-complete': ['QSelect'],
    'input-tag': ['QSelect'],
    checkbox: ['QCheckbox'],
    radio: ['QRadio'],
    switch: ['QToggle'],
    segmented: ['QBtnToggle'],
    slider: ['QSlider', 'QRange'],
    rate: ['QRating'],
    date: ['QDate'],
    'date-range': ['QDate'],
    'date-picker': ['QDate'],
    'date-range-picker': ['QDate'],
    time: ['QTime'],
    'time-range': ['QTime'],
    'time-picker': ['QTime'],
    'time-range-picker': ['QTime'],
    color: ['QColor'],
    'color-picker': ['QColor'],
    upload: ['QUploader', 'QFile'],
    table: ['QTable'],
    'table-column-manager': ['QTable'],
    tree: ['QTree'],
    'tree-select': ['QTree', 'QSelect'],
    form: ['QForm'],
    'filter-form': ['QForm'],
    tabs: ['QTabs'],
    menu: ['QMenu'],
    'nav-menu': ['QList'],
    dialog: ['QDialog'],
    drawer: ['QDrawer'],
    tooltip: ['QTooltip'],
    popover: ['QMenu'],
    popconfirm: ['QDialog'],
    loading: ['QSpinner', 'QInnerLoading'],
    skeleton: ['QSkeleton'],
    notification: ['Notify'],
    message: ['Notify'],
    progress: ['QLinearProgress', 'QCircularProgress'],
    'progress-group': ['QLinearProgress'],
    avatar: ['QAvatar'],
    badge: ['QBadge'],
    breadcrumb: ['QBreadcrumbs'],
    card: ['QCard'],
    paper: ['QCard'],
    carousel: ['QCarousel'],
    collapse: ['QExpansionItem'],
    divider: ['QSeparator'],
    image: ['QImg'],
    'infinite-scroll': ['QInfiniteScroll'],
    layout: ['QLayout'],
    link: ['QBtn'],
    list: ['QList'],
    pagination: ['QPagination'],
    ripple: ['Ripple'],
    scrollbar: ['QScrollArea'],
    segmented: ['QBtnToggle'],
    split: ['QSplitter'],
    'resize-box': ['QSplitter'],
    steps: ['QStepper'],
    tag: ['QChip'],
    timeline: ['QTimeline'],
    typography: ['Typography'],
  },
  vuetify: {
    button: ['v-btn'],
    icon: ['v-icon'],
    input: ['v-text-field'],
    textarea: ['v-textarea'],
    'input-number': ['v-number-input'],
    'input-tag': ['v-combobox'],
    'verification-code': ['v-otp-input'],
    'auto-complete': ['v-autocomplete'],
    select: ['v-select'],
    'people-select': ['v-autocomplete'],
    'tree-select': ['v-treeview'],
    cascader: ['v-treeview'],
    date: ['v-date-input', 'v-date-picker'],
    'date-range': ['v-date-picker'],
    'date-picker': ['v-date-picker'],
    'date-range-picker': ['v-date-picker'],
    time: ['v-time-picker'],
    'time-range': ['v-time-picker'],
    'time-picker': ['v-time-picker'],
    'time-range-picker': ['v-time-picker'],
    color: ['v-color-input', 'v-color-picker'],
    'color-picker': ['v-color-picker'],
    table: ['v-data-table'],
    'table-column-manager': ['v-data-table'],
    scheduler: ['v-calendar'],
    'nav-menu': ['v-navigation-drawer'],
    menu: ['v-menu'],
    collapse: ['v-expansion-panel'],
    'config-provider': ['v-defaults-provider'],
    'theme-provider': ['v-theme-provider'],
    'field-decorator': ['v-field'],
    loading: ['v-progress-circular'],
    progress: ['v-progress-linear', 'v-progress-circular'],
    'progress-group': ['v-progress-linear'],
    notification: ['v-snackbar'],
    message: ['v-snackbar'],
    tag: ['v-chip'],
    list: ['v-list'],
    tree: ['v-treeview'],
    steps: ['v-stepper'],
    upload: ['v-file-input', 'v-file-upload'],
    'filter-form': ['v-form'],
    'resize-box': ['v-splitter'],
    split: ['v-splitter'],
  },
  'material-ui': {
    input: ['text-fields'],
    textarea: ['textarea-autosize', 'text-fields'],
    'input-number': ['text-fields'],
    select: ['selects'],
    'auto-complete': ['autocomplete'],
    'people-select': ['autocomplete'],
    button: ['buttons'],
    icon: ['icons'],
    link: ['links'],
    checkbox: ['checkboxes'],
    radio: ['radio-buttons'],
    switch: ['switches'],
    segmented: ['toggle-button'],
    rate: ['rating'],
    tree: ['tree-view'],
    pagination: ['pagination'],
    'page-header': ['app-bar'],
    'nav-menu': ['drawer'],
    menu: ['menus'],
    table: ['table'],
    'table-column-manager': ['table'],
    alert: ['alert'],
    message: ['snackbars'],
    notification: ['snackbars'],
    dialog: ['dialogs'],
    drawer: ['drawers'],
    tooltip: ['tooltips'],
    popover: ['popover'],
    popconfirm: ['dialogs'],
    collapse: ['accordion'],
    loading: ['progress'],
    progress: ['progress'],
    'progress-group': ['progress'],
    overlay: ['backdrop'],
    avatar: ['avatars'],
    badge: ['badges'],
    card: ['cards'],
    paper: ['paper'],
    tag: ['chips'],
    'input-tag': ['chips', 'autocomplete'],
    'field-decorator': ['text-fields'],
    typography: ['typography'],
    layout: ['container'],
    'config-provider': ['theming'],
    'theme-provider': ['theming'],
    'infinite-scroll': ['lists'],
    list: ['lists'],
    space: ['stack'],
    grid: ['grid'],
    col: ['grid'],
    row: ['grid'],
    breadcrumb: ['breadcrumbs'],
  },
}
const roots = {}
function libraryRoot(lib) {
  if (roots[lib.id]) return roots[lib.id]
  const directory = path.join(root, lib.id, lib.dir)
  const all = fs.existsSync(directory)
    ? fs
        .readdirSync(directory, { recursive: true })
        .filter((f) => /\.(vue|tsx?|jsx?|md)$/.test(f) && !/node_modules|__tests__|\.test\./.test(f))
    : []
  let revision = 'HEAD'
  try {
    revision = execFileSync('git', ['-C', path.join(root, lib.id), 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
  } catch {}
  roots[lib.id] = { all, revision }
  return roots[lib.id]
}
const topicRules = [
  ['尺寸', /size|尺寸|大小/],
  ['变体与外观', /variant|appearance|outline|filled|ghost|tonal|变体|外观/],
  ['禁用与只读', /disabled|readonly|read-only|禁用|只读/],
  ['加载与异步', /loading|async|remote|request|resolve|加载|异步|远程/],
  ['键盘与焦点', /keyboard|focus|键盘|焦点/],
  ['受控值', /controlled|model|受控|双向绑定|值模型/],
  ['搜索与过滤', /search|filter|搜索|过滤|筛选/],
  ['多选与范围', /multiple|range|多选|范围/],
  ['布局与响应式', /layout|responsive|direction|布局|响应式|方向/],
  ['定制与组合', /custom|slot|render|group|自定义|插槽|组合/],
  ['拖动与排序', /drag|resize|sort|reorder|拖|排序|调整列宽/],
  ['大数据', /virtual|large-data|虚拟|大数据/],
  ['确认与取消', /confirm|cancel|commit|确认|取消|提交/],
  ['边界与恢复', /lifecycle|race|error|retry|边界|生命周期|失败|重试/],
]
const topicsFor = (values) =>
  topicRules.filter(([, pattern]) => pattern.test(values.join(' ').toLowerCase())).map(([title]) => title)
export function reference(lib, slug) {
  const { all, revision } = libraryRoot(lib)
  const keys = specific[lib.id]?.[slug] ?? aliases[slug] ?? [slug]
  const matches = []
  for (const key of keys) {
    let files = lib.files
      ? lib.files(key, all)
      : all.filter((f) => f.startsWith(key + '/') && /\.(vue|tsx?|jsx?)$/.test(f))
    if (slug === 'table-column-manager') {
      const columns = files.filter((f) => /column|fixed|frozen|reorder|resiz|colgroup/i.test(f))
      if (columns.length) files = columns
    }
    files = files.filter((f) => !/(?:accessibility|import|style)-doc\.ts$/.test(f))
    if (!files.length) continue
    files.sort((a, b) => {
      const rank = (f) =>
        /basic|usage|default/i.test(path.basename(f))
          ? 0
          : /size|variant|state|status/i.test(path.basename(f))
            ? 1
            : /loading|icon|disabled/i.test(path.basename(f))
              ? 2
              : 3
      return rank(a) - rank(b) || a.localeCompare(b)
    })
    matches.push({ key, files })
  }
  if (!matches.length) return undefined
  const seen = new Set()
  const samples = []
  let readBytes = 0
  for (const { key, files } of matches) {
    for (const relative of files) {
      if (seen.has(relative)) continue
      seen.add(relative)
      const file = path.join(root, lib.id, lib.dir, relative),
        source = read(file)
      readBytes += Buffer.byteLength(source)
      const title =
        /zh-CN:\s*(.+)/.exec(source)?.[1]?.trim() ??
        /^#{1,3} (.+)$/m
          .exec(source)?.[1]
          ?.replace(/<[^>]+>/g, '')
          .trim() ??
        path.basename(relative).replace(/(?:\.demo|-doc)?\.(?:vue|tsx?|jsx?)$/, '')
      samples.push({
        title,
        file: `${lib.dir}/${relative}`,
        url: `https://github.com/${lib.repo}/blob/${revision}/${lib.dir}/${relative}`,
      })
    }
  }
  // Every selected example is read; the viewer displays a short sample plus the complete source directory.
  const first = matches[0]
  const doc = lib.doc?.(first.key)
  const sourcePath =
    doc && fs.existsSync(path.join(root, lib.id, doc)) ? doc : `${lib.dir}/${path.dirname(first.files[0])}`
  return {
    library: lib.id,
    name: lib.name,
    type: lib.type,
    relation: related.has(slug) ? '相关组合' : '同类组件',
    exampleCount: seen.size,
    readBytes,
    topics: topicsFor(samples.map((sample) => sample.title + ' ' + sample.file)),
    url: `https://github.com/${lib.repo}/tree/${revision}/${sourcePath}`,
    samples: samples.slice(0, 4),
    _examples: samples,
  }
}
export function improvementsFor(platform) {
  const entries = JSON.parse(read(path.join(root, 'design-ui/configs/component-improvements.json')))
  return entries
    .filter((item) => item.platforms.includes(platform))
    .map((item) => ({
      ...item,
      evidence: item.evidence.map((source) => {
        const lib = libraries.find((lib) => lib.id === source.library)
        return {
          ...source,
          name: lib.name,
          url: `https://github.com/${lib.repo}/blob/${libraryRoot(lib).revision}/${source.file}`,
        }
      }),
    }))
}
export function buildCedarCatalog() {
  const sidebarFile = path.join(ui, 'docs/.vuepress/configs/sidebar/zh.ts')
  const sidebar = read(sidebarFile)
  const names = new Map(
    [...sidebar.matchAll(/text:\s*"([^"]+)"\s*,\s*link:\s*"(\/components\/[^\"]+\/)"/g)].map((m) => [m[2], m[1]]),
  )
  const docs = new Map()
  for (const relative of fs
    .readdirSync(path.join(ui, 'src'), { recursive: true })
    .filter((f) => f.endsWith('.md') && !/en-US/.test(f))) {
    const text = read(path.join(ui, 'src', relative))
    const route = /^permalink:\s*(\S+)/m.exec(text)?.[1]
    if (
      route?.startsWith('/components/') &&
      !route.startsWith('/components/style/') &&
      route !== '/components/palette/'
    )
      docs.set(route.split('/')[2], { relative, text, route })
  }
  const decoratorFile = path.join(ui, 'src/field-decorator/README.md')
  let decorator = read(decoratorFile)
  if (!/^permalink:/m.test(decorator)) {
    decorator = '---\npermalink: /components/field-decorator/\n---\n\n' + decorator
    fs.writeFileSync(decoratorFile, decorator)
  }
  docs.set('field-decorator', {
    relative: 'field-decorator/README.md',
    text: decorator,
    route: '/components/field-decorator/',
  })
  const covered = new Set(spec.groups.flatMap((g) => g.components))
  const missing = [...docs.keys()].filter((slug) => !covered.has(slug))
  const extra = [...covered].filter((slug) => !docs.has(slug))
  if (missing.length || extra.length) throw new Error(JSON.stringify({ missing, extra }))
  const entry = read(path.join(ui, 'src/cedar-vue.ts'))
  const memberFamilies = new Map(
    [...entry.matchAll(/import ([^\n]+) from ['"]\.\/([^'"]+)['"]/g)].map((m) => [
      m[2],
      m[1]
        .replace(/[{}]/g, '')
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean),
    ]),
  )
  const catalog = {
    improvements: improvementsFor('cedar'),
    groups: [],
    libraries: libraries.map(({ id, name, type }) => ({ id, name, type })),
    components: [],
  }
  for (const group of spec.groups) {
    catalog.groups.push({ id: group.id, label: group.label, en: group.en })
    for (const slug of group.components) {
      const doc = docs.get(slug)
      const headings = [...doc.text.matchAll(/^#{2,4} (.+)$/gm)]
      const demos = [...doc.text.matchAll(/<demo\b[^>]*src="([^"]+)"/g)].map((m) => {
        const title = headings.filter((h) => h.index < m.index).at(-1)?.[1] ?? '示例'
        return {
          title,
          source: path.relative(ui, path.resolve(ui, 'src', path.dirname(doc.relative), m[1])),
          anchor: slugify(title),
        }
      })
      const fullRefs = libraries.map((lib) => reference(lib, slug)).filter(Boolean)
      const refs = fullRefs.map(({ _examples, ...reference }) => reference)
      const featurePoints = featureRows({ id: slug, group: group.id, demos }, doc.text, fullRefs)
      catalog.components.push({
        coreStrengths: coreStrengths
          .filter((item) => item.cedar && item.components.includes(slug))
          .map(({ id, title }) => ({ id, title, anchor: slugify(title) })),
        featurePoints,
        id: slug,
        name: spec.labels[slug] ?? names.get(doc.route) ?? /^# (.+)$/m.exec(doc.text)?.[1] ?? slug,
        group: group.id,
        route: doc.route,
        feature: spec.features[slug],
        members: (memberFamilies.get(doc.relative.split('/')[0]) ?? []).filter((name) => {
          const key = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
          return key !== slug && !docs.has(key)
        }),
        topics: topicsFor(demos.map((demo) => demo.title + ' ' + demo.source)),
        demos,
        references: refs,
      })
    }
  }
  save(path.join(ui, 'docs/.vuepress/configs/component-catalog.json'), catalog)
  const navigationIds = navigation.groups.flatMap((group) => group.components)
  const navigationComponents = new Map(catalog.components.map((component) => [component.id, component]))
  if (
    new Set(navigationIds).size !== navigationIds.length ||
    navigationIds.length !== navigationComponents.size ||
    navigationIds.some((id) => !navigationComponents.has(id))
  ) {
    throw new Error('Component navigation must contain every catalog component exactly once')
  }
  save(path.join(ui, 'docs/.vuepress/configs/component-navigation.json'), {
    groups: navigation.groups.map(({ id, label, en }) => ({ id, label, en })),
    components: navigation.groups.flatMap((group) =>
      group.components.map((id) => {
        const { name, route } = navigationComponents.get(id)
        return { id, name, group: group.id, route }
      }),
    ),
  })
  save(path.join(root, 'design-ui/audits/component-showcase-2026-10-26/reference-inventory.json'), {
    revisions: Object.fromEntries(libraries.map((lib) => [lib.id, libraryRoot(lib).revision])),
    components: catalog.components.map((c) => ({ id: c.id, references: c.references, demos: c.demos.length })),
  })
  console.log(
    JSON.stringify({
      groups: catalog.groups.length,
      components: catalog.components.length,
      references: catalog.components.reduce((n, c) => n + c.references.length, 0),
      exampleSources: catalog.components.reduce((n, c) => n + c.references.reduce((s, r) => s + r.exampleCount, 0), 0),
      withoutReferences: catalog.components.filter((c) => !c.references.length).map((c) => c.id),
    }),
  )

  if (check && stale.length) {
    console.error(JSON.stringify({ stale }))
    process.exitCode = 1
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) buildCedarCatalog()
