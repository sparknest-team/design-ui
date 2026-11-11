import assert from 'node:assert/strict';
import test from 'node:test';
import { markdownSections, renderSection } from './api-document-structure.mjs';
import { organizePublicDocument, publicDocumentIssues, rewritePublicProse } from './public-documentation-policy.mjs';

test('CSS references never own placement, values, guards or type APIs', () => {
  const source =
    '# Menu\n\n## API\n\n### Menu Props\n\n| Prop | Type |\n| --- | --- |\n| placement | MenuPlacement |\n\n## CSS Variables\n\n<!-- component-css-variables:start -->\n\n| Variable | Default |\n| --- | --- |\n| --mp-menu-background-color | white |\n\n<!-- component-css-variables:end -->\n\n### Placement semantics and configuration\n\nUse placement for the popup.\n\n### Guard waiting feedback\n\nA rejected guard keeps the menu open.\n\n### Public type exports\n\n```ts\nimport type { MenuProps } from "pkg"\n```\n';
  const result = organizePublicDocument(source, { primary: 'Menu', en: true });
  const tree = markdownSections(result);
  const css = renderSection(tree.children.find((row) => row.title === 'CSS Variables'));
  assert.doesNotMatch(css, /Use placement|guard|import type/);
  assert.match(css, /--mp-menu-background-color/);
  assert.match(renderSection(tree.children.find((row) => row.title === 'Types')), /MenuProps/);
  assert.match(renderSection(tree.children.find((row) => row.title === 'Triggers and positioning')), /Use placement/);
  assert.deepEqual(publicDocumentIssues(result), []);
  assert.equal(organizePublicDocument(result, { primary: 'Menu', en: true }), result);
});
test('archives migration chapters while preserving current style roles and runtime cancellation', () => {
  const source =
    '# Switch\n\n## API\n\n### Switch Props\n\nCurrent props.\n\n## Migration\n\nOld API history.\n\n### Color variables and tonal foreground migration\n\n--mp-switch-text-color controls text.\n\n## Interaction\n\nAn older request cannot overwrite a newer result.\n';
  const result = organizePublicDocument(source, { en: true });
  assert.doesNotMatch(result, /Old API history|## Migration/);
  assert.match(result, /Track and handle colors/);
  assert.match(result, /older request cannot overwrite/);
  assert.equal(organizePublicDocument(result, { en: true }), result);
});
test('menu values are consumer configuration, not Vue-key implementation notes', () => {
  const source =
    "# Menu\n\n## CSS Variables\n\n### 数据身份与触发器切换\n\n可重排的数据项应提供稳定、唯一的 `value`，内部 Vue key 由业务值生成；数字 `0`、字符串 `'0'`、布尔值 `false` 保持不同身份。没有显式 value 的分组、分隔符或展示项按原始选项对象维持渲染身份，不新增公开 key 别名。点击另一个已经因 hover 打开的同级触发按钮，会关闭原先的菜单；点击子菜单内部不会误关父级。\n";
  const result = organizePublicDocument(source, { primary: 'Menu', en: false });
  assert.doesNotMatch(result, /Vue key|别名/);
  assert.match(result, /### 选项值/);
  assert.match(result, /### 切换触发元素/);
});
test('migration removal does not delete domain changes, data removal or code examples', () => {
  const source =
    '# Scheduler\n\n## 修改本次及以后\n\nChanging a recurrence rule can remove occurrences.\n\n```md\n## Migration\n```\n';
  assert.equal(organizePublicDocument(source, { en: false }), source);
  assert.match(
    rewritePublicProse(
      'Time 旧 `use-seconds` 和 format 枚举已删除，不保留别名。\n\nOlder asynchronous results are ignored.',
    ),
    /Older asynchronous/,
  );
});

test('API translation retains its protected generated CSS block in the styling chapter', () => {
  const placeholder = '<!-- component-css-localization-placeholder -->';
  const source = '# Popup\n\n## API\n\n### Popup Props\n\nPublic props.\n\n## CSS Variables\n\n' + placeholder + '\n';
  const result = organizePublicDocument(source, { en: true });
  const css = markdownSections(result).children.find((entry) => entry.title === 'CSS Variables');
  assert.ok(css.body.includes(placeholder));
  assert.equal(organizePublicDocument(result, { en: true }), result);
});

test('compatibility migration tables are archived while browser compatibility remains public', () => {
  const source = '# Alert\n\n## API\n\n### Compatibility\n\n| Previous API | Current API |\n| --- | --- |\n| closeable | closable |\n\n## Browser compatibility\n\nSupports modern browsers.\n';
  const result = organizePublicDocument(source, { en: true });
  assert.doesNotMatch(result, /Previous API|closeable|### Compatibility/);
  assert.match(result, /Browser compatibility/);
  assert.deepEqual(publicDocumentIssues(result), []);
});

test('current API tables reject removed members while retaining business removal states', () => {
  assert.ok(publicDocumentIssues('# Table\n\n## Types\n\n| Property | Description |\n| --- | --- |\n| old-height | Removed: use fixedSize |\n').includes('removed API listed in a current reference table'));
  assert.ok(publicDocumentIssues('# Table\n\n## Types\n\n| 属性 | 说明 |\n| --- | --- |\n| old-height | （已废除）请使用 fixedSize |\n').includes('removed API listed in a current reference table'));
  assert.deepEqual(publicDocumentIssues('# Upload\n\n## Types\n\n| State | Description |\n| --- | --- |\n| removed | Item removed by the caller |\n'), []);
});
