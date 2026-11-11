import { markdownSections, renderSection } from './api-document-structure.mjs';
import { readFileSync } from 'node:fs';

const currentUsage = JSON.parse(
  readFileSync(new URL('../configs/public-component-current-usage.json', import.meta.url), 'utf8'),
).sort((a, b) => b.before.length - a.before.length);

export function rewritePublicProse(source) {
  let result = source;
  for (const { before, after } of currentUsage) result = result.replaceAll(before, after);
  result = result.replace(
    /(?:^|\n\n)(?:预发布迁移：|Pre-release migration:|同步删除两端 tag-custom-icon-bg-hover|此前的跨组件保留项已关闭|Removed 33 unused wrapper variables:|Migrate by responsibility:)[^\n]*(?:\n(?!\n)[^\n]+)*(?=\n\n|$)/g,
    '',
  );
  result = result.replace(
    /(?:^|\n\n)(?:draft-initialize 是 Maple 内部|draft-initialize is (?:an? )?(?:internal|Maple))[\s\S]*?(?=\n\n|$)/g,
    '',
  );
  return result;
}

const headingPairs = [
  ['方位语义与配置入口', '弹层定位', 'Placement semantics and configuration', 'Popup placement'],
  ['状态与时长', '选项状态颜色', 'State and duration', 'Option state colors'],
  ['Form 字段展示与确认', '编辑与确认', 'Form field presentation and confirmation', 'Editing and confirmation'],
  ['守卫等待反馈', '异步操作反馈', 'Guard waiting feedback', 'Async operation feedback'],
  ['before 钩子与 done 兼容', '关闭守卫', 'before hooks and done compatibility', 'Close guards'],
  ['清空值与 1.x 兼容性', '清空值', 'Clear values and 1.x compatibility', 'Clear values'],
  [
    '颜色变量与 tonal 前景迁移',
    '轨道与滑块颜色',
    'Color variables and tonal foreground migration',
    'Track and handle colors',
  ],
  ['公开入口与监听类型', '导入与事件类型', 'Public entries and listener types', 'Imports and event types'],
  ['公开类型入口', '类型导入', 'Public type exports', 'Type imports'],
  ['公开入口与类型', '类型导入', 'Public entry points and types', 'Type imports'],
  ['公开类型与入口', '类型导入', 'Public types and entry points', 'Type imports'],
  ['内置搜索字段配置', '搜索字段', 'Built-in search fields', 'Search fields'],
  ['循环过渡边界', '循环与自动播放', 'Loop transition boundaries', 'Looping and autoplay'],
  ['拖动生命周期', '拖动与取消', 'Drag lifecycle', 'Dragging and cancellation'],
  ['数值与重绘约定', '尺寸与重绘', 'Numeric values and redraw', 'Sizing and redraw'],
  ['原生布局与公开类型', '尺寸与原生方法', 'Native layout and public types', 'Sizing and native methods'],
  ['日期合同与值类型', '值与格式', 'Date contract and value kinds', 'Values and formats'],
  ['字段事件（完整）', '字段事件参数类型', 'Complete field events', 'Field event parameter types'],
  ['独立面板事件（完整）', '面板事件参数类型', 'Complete standalone panel events', 'Panel event parameter types'],
  [
    '字段事件与插槽（完整）',
    '字段事件与插槽参数类型',
    'Complete field events and slots',
    'Field event and slot parameter types',
  ],
  ['纯面板事件（完整）', '面板事件参数类型', 'Complete pure-panel events', 'Panel event parameter types'],
  ['插槽与实例边界（完整）', '插槽与实例方法', 'Complete slot and instance boundaries', 'Slots and instance methods'],
  ['独立面板的公开边界', '面板配置', 'Standalone panel public boundary', 'Panel configuration'],
  ['字段与移动展示的样式边界', '编辑方式', 'Field and mobile-presentation style boundaries', 'Editing mode'],
  ['移动端统一面板', '面板操作', 'Unified mobile panels', 'Panel actions'],
  ['面板业务事件与草稿初始化', '面板事件', 'Panel business events and draft initialization', 'Panel events'],
  [
    '与 Cedar Table 类型配置的边界',
    '表格数据与插槽',
    "Boundary with Cedar Table's typed configuration",
    'Table data and slots',
  ],
  ['外置标签（推荐与 Cedar 对齐）', '外置标签', 'External labels (recommended for Cedar parity)', 'External labels'],
  ['与 Cedar 的对齐 / 平台差', '平台差异', 'Alignment with Cedar / platform differences', 'Platform differences'],
  ['InputTag 旧图标引用收尾', '标签与关闭按钮', 'Removing legacy InputTag icon references', 'Tags and close buttons'],
  [
    '自定义图标尺寸与状态语义',
    '图标与状态提示',
    'Custom icon sizing and status semantics',
    'Icons and status messages',
  ],
];
const titles = new Map(
  headingPairs.flatMap(([zh, nextZh, en, nextEn]) => [
    [zh, nextZh],
    [en, nextEn],
  ]),
);
const styleTitles = new Set([
  '动效',
  'Motion',
  '减少动态效果',
  'Reduced motion',
  '尺寸与动效',
  'Sizing and motion',
  '颜色',
  'Colors',
  '错误与禁用边框',
  'Error and disabled borders',
  '样式定制',
  'Custom styling',
  '选项状态颜色',
  'Option state colors',
  '语义文字色',
  'Semantic text colors',
  '颜色覆盖边界',
  'Color override boundaries',
  '输入光标主题',
  'Input caret theme',
  '覆盖层样式',
  'Overlay styles',
  '轨道与滑块颜色',
  'Track and handle colors',
  '动效变量',
  'Motion variables',
  '默认样式变量',
  'Default style variables',
  '完整变量默认值',
  'Complete variable defaults',
  '分组样式',
  'Group styles',
]);
const migrationTitle =
  /^(?:从旧版本迁移|迁移(?:说明)?|版本变更|变更记录|升级(?:说明|指南)|Migration(?: notes.*)?|Migrating from.*|Search migration|Breaking changes|Changelog)$/i;
const isMigration = (entry) => migrationTitle.test(entry.title) ||
  (/^(?:兼容说明|Compatibility)$/i.test(entry.title) && /\|\s*(?:旧|Previous(?: API)?)\s*\|/i.test(entry.body));
export const generatedVariables = /<!-- component-css-variables:start -->[\s\S]*?<!-- component-css-variables:end -->/g;

export function markdownParagraphs(text) {
  const result = [];
  let lines = [],
    fence;
  for (const line of text.split('\n')) {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    if (marker) {
      if (!fence) fence = marker[0];
      else if (fence === marker[0]) fence = undefined;
    }
    if (!fence && !line.trim() && lines.length) {
      result.push(lines.join('\n'));
      lines = [];
    } else if (line.trim() || lines.length) lines.push(line);
  }
  if (lines.length) result.push(lines.join('\n'));
  return result;
}

export function isStyleExplanation(text) {
  if (/component-css-(?:variables|localization-placeholder)|public-doc-generated-variables/.test(text)) return true;
  if (/^```(?:ts|typescript|js|javascript|vue)/m.test(text)) return false;
  if (
    /--[a-z][\w-]*|```(?:css|less)|prefers-reduced-motion|ThemeProvider|CSS\s*(?:变量|variables)|\b(?:surface|content|border)-(?:default|primary|secondary|muted|raised|overlay|on-dark)\b/i.test(
      text,
    )
  )
    return true;
  return (
    /配色|颜色变量|动效|过渡|阴影|圆角|描边|对比度|字号|背景|\b(?:transition|color|background|shadow|radius|font size|motion)\b/i.test(
      text,
    ) && !/^(?:`?(?:orientation|modelValue|open|before|value|select|change)|函数规则|提示支持)/.test(text)
  );
}

function node(title, body = '', level = 3) {
  return {
    title,
    level,
    heading: '#'.repeat(level) + ' ' + title + '\n',
    body: body.trim() ? '\n' + body.trim() + '\n\n' : '\n',
    children: [],
  };
}
function setLevel(entry, level) {
  entry.level = level;
  entry.heading = '#'.repeat(level) + ' ' + entry.title + '\n';
  entry.children?.forEach((child) => setLevel(child, level + 1));
}
function hasVisibleContent(entry) {
  if (entry.body.includes('component-css-localization-placeholder')) return true;
  return entry.body.replace(/<!--[\s\S]*?-->/g, '').trim() || entry.children?.some(hasVisibleContent);
}
function typeSection(title) {
  return /类型|导入|参数类型|ChoiceFieldNames|^Value types$|types$|Type imports|Imports and event types/i.test(title);
}
function isStyleSubsection(entry) {
  return (
    styleTitles.has(entry.title) ||
    (/^[A-Z][\w.]*$/.test(entry.title) &&
      /--(?:c|mp)-/.test(entry.body) &&
      !/```(?:ts|typescript|vue|js)/.test(entry.body))
  );
}
function usageTitle(text, en) {
  if (/键盘|方向键|\b(?:Enter|Space|Tab|keyboard)\b/.test(text)) return en ? 'Keyboard interaction' : '键盘操作';
  if (/case-sensitive|filterOption|search-fields|searchFields/.test(text)) return en ? 'Search rules' : '搜索规则';
  if (/aria-|role=|role\s*[:=]|播报|屏幕阅读器|live region|status message/i.test(text))
    return en ? 'Accessibility' : '可访问性';
  if (/事件|通知|监听|Promise|\b(?:events?|listeners?|notify|notification)\b/i.test(text))
    return en ? 'Events and callbacks' : '事件与回调';
  if (/测量|观察|tag|layout|resize/i.test(text)) return en ? 'Layout updates' : '布局更新';
  return en ? 'Configuration' : '配置说明';
}

/** Public docs describe current use. Historical changes are archived by the CLI. */
export function organizePublicDocument(
  source,
  { primary = '', en = !/[\u4e00-\u9fff]/.test(source.replace(/```[\s\S]*?```/g, '')) } = {},
) {
  const tree = markdownSections(rewritePublicProse(source));
  const isMenu = /^# Menu(?: 菜单)?$/m.test(source);
  const css = tree.children.find((entry) => entry.title === 'CSS Variables');
  const pending = [];
  function enqueue(entry, kind) {
    if (hasVisibleContent(entry)) pending.push({ entry, kind });
  }
  function clean(nodes, parent) {
    const kept = [];
    for (const entry of nodes) {
      if (isMenu && /^(?:键盘操作|键盘交互|Keyboard interaction)$/.test(entry.title)) continue;
      if (isMenu && /^(?:实例与键盘|Instance methods and keyboard)$/.test(entry.title)) {
        entry.title = 'Menu Methods';
        entry.heading = '### Menu Methods\n';
        entry.body =
          '\n' +
          (en
            ? 'Use `open()` to open the menu, `close()` to close it, `resize()` to update positioning, and `setReference(reference?)` to change the trigger element.'
            : '通过 `open()` 打开菜单、`close()` 关闭菜单、`resize()` 更新定位、`setReference(reference?)` 更换触发元素。') +
          '\n\n';
      }
      if (
        isMenu &&
        /^(?:配置说明|Configuration)$/.test(entry.title) &&
        /分组标题|group titles|group headings/i.test(entry.body)
      ) {
        entry.title = en ? 'Group styles' : '分组样式';
        entry.heading = '### ' + entry.title + '\n';
        entry.body =
          '\n' +
          (en
            ? 'Use `group-title-height` for the group-title line height and the component’s group-title padding variables for spacing. The first group has no extra group gap.'
            : '通过 `group-title-height` 调整分组标题行高，通过组件的 group-title padding 变量调整留白；首组不增加额外组间距。') +
          '\n\n';
        const prefix = source.includes('--mp-menu-') ? 'mp' : 'c';
        entry.body = entry.body.replace('`group-title-height`', '`--' + prefix + '-menu-group-title-height`');
        enqueue(entry, 'style');
        continue;
      }
      if (isMenu && /^(?:弹出方向|Placement|弹层定位|Popup placement)$/.test(entry.title)) {
        entry.body =
          markdownParagraphs(entry.body)
            .filter((paragraph) => !/^触发器支持 Enter|^Enter, Space and arrow keys can open/.test(paragraph))
            .join('\n\n') + '\n\n';
      }
      if (/^(?:数据身份与触发器切换|Data identity and trigger switching)$/.test(entry.title)) {
        const [values, ...switching] = markdownParagraphs(entry.body);
        enqueue(node(en ? 'Option values' : '选项值', values ?? ''), 'options');
        if (switching.length)
          enqueue(node(en ? 'Switching triggers' : '切换触发元素', switching.join('\n\n')), 'position');
        continue;
      }
      const renamed = titles.get(entry.title);
      if (renamed) {
        entry.title = renamed;
        entry.heading = '#'.repeat(entry.level) + ' ' + renamed + '\n';
      }
      if (!en && entry.title === 'Geometry and motion') {
        entry.title = '布局与动效';
        entry.heading = '#'.repeat(entry.level) + ' ' + entry.title + '\n';
        entry.body = entry.body.replace(
          'Built-in effects respect `prefers-reduced-motion: reduce`. Track thickness applies to both horizontal and vertical layouts; circle geometry remains prop-driven.',
          '内置动效遵循 `prefers-reduced-motion: reduce`。线形厚度同时适用于横向和纵向布局；环形尺寸通过属性配置。',
        );
      }
      if (!en && entry.title === 'Landscape safe areas') {
        entry.title = '横屏安全区';
        entry.heading = '#'.repeat(entry.level) + ' ' + entry.title + '\n';
        entry.body =
          '\n通过 `safe-area-inset-left`、`safe-area-inset-right` 为左右两侧增加安全区留白，默认均为 `false`。宿主边距与嵌套容器的用法见 [SafeArea](#/zh-CN/safe-area)。\n\n';
      }
      if (/^MenuOptionData (Events|Methods|Slots)$/.test(entry.title)) {
        entry.title = entry.title.replace('MenuOptionData ', 'Menu ');
        entry.heading = '#'.repeat(entry.level) + ' ' + entry.title + '\n';
      }
      if (/^(?:选项状态颜色|Option state colors)$/.test(entry.title)) {
        const prefix = source.includes('--mp-menu-') ? 'mp' : 'c';
        const selected = prefix === 'mp' ? 'selected-background' : 'bg-selected';
        const hover = prefix === 'mp' ? 'bg-selected-hover' : 'bg-selected-hover';
        entry.body =
          '\n' +
          (en
            ? `Use \`--${prefix}-menu-option-${selected}\` for selected rows and \`--${prefix}-menu-option-${hover}\` for their hover background. Disabled colors take precedence over selected, hover and focus styles.`
            : `通过 \`--${prefix}-menu-option-${selected}\` 设置选中背景，\`--${prefix}-menu-option-${hover}\` 设置选中后的悬停背景。禁用样式优先于选中、悬停和聚焦样式。`) +
          '\n\n';
      }
      if (entry.title === 'Brand appearance') {
        entry.title = /函数规则|validate\(/.test(entry.body)
          ? '校验结果与异常'
          : /function rules|validate\(/i.test(entry.body)
            ? 'Validation results and errors'
            : en
              ? 'Service callbacks'
              : '函数调用回调';
        entry.heading = '#'.repeat(entry.level) + ' ' + entry.title + '\n';
      }
      if (isMigration(entry)) {
        // Color-role explanations are current styling guidance even when an
        // obsolete migration heading used to wrap them.
        for (const child of entry.children ?? [])
          if (/颜色变量与 tonal|Color variables and tonal/i.test(child.title)) {
            child.title = titles.get(child.title);
            setLevel(child, 3);
            enqueue(child, 'style');
          }
        continue;
      }
      entry.children = clean(entry.children ?? [], entry);
      if (!hasVisibleContent(entry)) continue;
      if (
        /^# Menu(?: 菜单)?$/m.test(source) &&
        /^(?:弹层定位|Popup placement)$/.test(entry.title) &&
        /^(?:触发与定位|Triggers and positioning)$/.test(parent.title)
      ) {
        const placement = parent.children.find((child) => /^(?:弹出方向|Placement)$/.test(child.title));
        if (placement) {
          if (!placement.body.includes(entry.body.trim()))
            placement.body = '\n' + entry.body.trim() + '\n\n' + placement.body.trim() + '\n\n';
          continue;
        }
      }
      if (
        /^(?:弹层定位|Popup placement)$/.test(entry.title) &&
        !/^(?:触发与定位|Triggers and positioning)$/.test(parent.title)
      ) {
        enqueue(entry, 'position');
        continue;
      }
      if (parent === css && !isStyleSubsection(entry)) {
        const kinds = typeSection(entry.title) ? 'types' : 'usage';
        enqueue(entry, kinds);
        continue;
      }
      kept.push(entry);
    }
    return kept;
  }
  tree.children = clean(tree.children, tree);

  if (css && tree.children.includes(css)) {
    function splitStyle(entry) {
      const generated = [];
      const bare = entry.body.replace(generatedVariables, (block) => {
        generated.push(block);
        return '<!-- public-doc-generated-variables-' + (generated.length - 1) + ' -->';
      });
      const styles = [],
        usage = [];
      for (const paragraph of markdownParagraphs(bare))
        (isStyleExplanation(paragraph) ? styles : usage).push(paragraph);
      entry.body = '\n' + styles.join('\n\n') + '\n\n';
      generated.forEach((block, index) => {
        entry.body = entry.body.replace('<!-- public-doc-generated-variables-' + index + ' -->', block);
      });
      for (const paragraph of usage) enqueue(node(usageTitle(paragraph, en), paragraph), 'usage');
      for (const child of entry.children) splitStyle(child);
      entry.children = entry.children.filter(hasVisibleContent);
    }
    splitStyle(css);
  }

  function section(title, beforeApi = false) {
    let result = tree.children.find((entry) => entry.title === title);
    if (result) return result;
    result = node(title, '', 2);
    const index = tree.children.findIndex((entry) =>
      beforeApi
        ? entry.title === 'API' || entry.title === 'Types' || entry.title === 'CSS Variables'
        : entry.title === 'CSS Variables',
    );
    tree.children.splice(index < 0 ? tree.children.length : index, 0, result);
    return result;
  }
  for (const { entry, kind } of pending) {
    const target =
      kind === 'style'
        ? section('CSS Variables')
        : kind === 'types'
          ? section('Types')
          : kind === 'options'
            ? section(en ? 'Options and hierarchy' : '选项与层级', true)
            : kind === 'position'
              ? section(en ? 'Triggers and positioning' : '触发与定位', true)
              : section(en ? 'Usage notes' : '使用说明', true);
    setLevel(entry, 3);
    if (
      /^# Menu(?: 菜单)?$/m.test(source) &&
      kind === 'position' &&
      /^(?:弹层定位|Popup placement)$/.test(entry.title)
    ) {
      const placement = target.children.find((child) => /^(?:弹出方向|Placement)$/.test(child.title));
      if (placement) {
        if (!placement.body.includes(entry.body.trim()))
          placement.body = '\n' + entry.body.trim() + '\n\n' + placement.body.trim() + '\n\n';
        continue;
      }
    }
    // Preserve distinct statements while avoiding duplicated subsection titles.
    const existing = target.children.find((child) => child.title === entry.title);
    if (existing) {
      const a = existing.body.trim(),
        b = entry.body.trim();
      if (b && !a.includes(b)) existing.body = '\n' + [a, b].filter(Boolean).join('\n\n') + '\n\n';
      existing.children.push(...entry.children);
    } else target.children.push(entry);
  }
  if (isMenu) {
    const keyboard = section(en ? 'Keyboard interaction' : '键盘操作', true);
    keyboard.body =
      '\n' +
      (en
        ? 'Enter, Space or an arrow key opens the menu from its trigger. Up/Down and Home/End move between enabled options; Enter or Space activates an option. The forward key enters a submenu and the backward key returns, following the reading direction. Escape requests closing the topmost menu; focus returns to its trigger after closing. Tab requests close and continues browser focus navigation. Editable inputs retain their text-editing keys.'
        : '在触发元素上按 Enter、Space 或方向键进入菜单。菜单内使用上下键、Home/End 在可用选项间移动，Enter 或 Space 激活选项。前进方向键进入子菜单，后退方向键返回，方向随阅读方向变化。Escape 请求关闭最上层菜单，关闭后焦点返回触发元素。Tab 请求关闭并继续浏览器焦点导航；可编辑输入保留文本编辑按键。') +
      '\n\n';
  }
  // A CSS reference never owns later API/configuration paragraphs by accident.
  if (css && tree.children.includes(css)) tree.children = [...tree.children.filter((entry) => entry !== css), css];
  const result = tree.body + tree.children.map((entry) => renderSection(entry).trimEnd()).join('\n\n') + '\n';
  return result
    .split('\n')
    .filter((line) => line.trim())
    .join('\n') ===
    source
      .split('\n')
      .filter((line) => line.trim())
      .join('\n')
    ? source
    : result;
}

export function publicDocumentIssues(source) {
  const issues = [];
  const tree = markdownSections(source);
  const css = tree.children.find((entry) => entry.title === 'CSS Variables');
  function inspect(entry) {
    if (isMigration(entry)) issues.push('migration chapter: ' + entry.title);
    entry.children.forEach(inspect);
  }
  inspect(tree);
  if (css)
    for (const child of css.children)
      if (!isStyleSubsection(child)) issues.push('unrelated CSS subsection: ' + child.title);
  const prose = source.replace(/```[\s\S]*?```/g, '').replace(/<!--[\s\S]*?-->/g, '');
  if (/^\|[^|\n]+\|[^|\n]*(?:Removed:|[（(]已废除[）)])/m.test(prose))
    issues.push('removed API listed in a current reference table');
  if (
    /消费核验|真实 Less 编译|旧版本|预发布迁移|旧[^。！？\n]{0,80}(?:已删除|已移除)|(?:本次|本轮)(?: API 调整|删除|移除|新增)|legacy[^.\n]{0,100}(?:removed|alias)|old [^.\n]{0,100}(?:removed|renamed)|(?:removed|renamed) (?:API|prop|token|variable)/i.test(
      prose,
    )
  )
    issues.push('historical implementation or migration prose');
  return issues;
}
