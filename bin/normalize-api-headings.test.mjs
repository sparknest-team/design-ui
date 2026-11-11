import assert from 'node:assert/strict';
import test from 'node:test';
import { componentName, normalizeHeadingLabels, normalizeApiHeadings, checkApiHeadings } from './normalize-api-headings.mjs';

test('API headings use named PascalCase categories across languages and levels', () => {
  const input = '## API\n### 属性\n### `<c-button>` Events\n#### button-group Expose\n### Slots 与实例方法\n### Props / MessageOptions\n## 类型定义 / Types\n### Style variables\n';
  const expected = '## API\n### Button Props\n### Button Events\n### ButtonGroup Methods\n### ButtonGroup Slots / Methods\n### ButtonGroup Options\n## Types\n## CSS Variables\n';
  assert.equal(normalizeHeadingLabels(input, 'Button'), expected);
  assert.equal(normalizeHeadingLabels(expected, 'Button'), expected);
  assert.equal(componentName('date-range/picker'), 'DateRangePicker');
  assert.equal(componentName('NavMenu.Item'), 'NavMenuItem');
});

test('normalization preserves examples, API tables, prose, and meaningful component boundaries', () => {
  const unchanged = '```md\n### 属性\n```\n~~~md\n### Slots\n~~~\n### 键盘与方向\n| size | ComponentSize | md |\n';
  assert.equal(normalizeHeadingLabels(unchanged, 'Button'), unchanged);
  const source = '## NavMenu API\r\n## NavMenu.Item API\r\n### `<NavMenuItem>` Slots\r\n';
  assert.equal(normalizeHeadingLabels(source, 'NavMenu'), '## API\r\n## NavMenuItem API\r\n### NavMenuItem Slots\r\n');
  for (const heading of ['## CSS Variables\n', '## TabBar CSS Variables\n']) {
    assert.equal(normalizeHeadingLabels(heading, 'TabBar'), heading);
  }
});

test('feature captions and embedded Options API examples remain outside API normalization', () => {
  const feature = '## 外观\n#### 类型\n普通说明。\n#### Options API\n```vue\nconst value = 1\n```\n## Async options\n### Group Methods\n<demo src="./methods.vue"></demo>\n';
  assert.equal(normalizeHeadingLabels(feature, 'Checkbox'), feature);
  const partial = '### `<Dialog>` Props\n| Prop | Type |\n| --- | --- |\n| open | boolean |\n## API\n### 事件\n';
  assert.equal(normalizeHeadingLabels(partial, 'Dialog'), partial.replace('`<Dialog>` Props', 'Dialog Props').replace('### 事件', '### Dialog Events'));
  const versioned = '## API\n### `<image-preview-action>` Props (2.17.0)\n';
  const normalized = '## API\n### ImagePreviewAction Props (2.17.0)\n';
  assert.equal(normalizeHeadingLabels(versioned, 'Image'), normalized);
  assert.equal(normalizeHeadingLabels(normalized, 'Image'), normalized);
  const panel = '### DateRangePicker Props\n| Prop | Type |\n| --- | --- |\n| value | Date |\n### 事件\n无。\n### 样式变量\n| Variable | Default |\n| --- | --- |\n| --mp-date-range-height | 20px |\n';
  assert.equal(normalizeHeadingLabels(panel, 'DateRange'), panel.replace('### 事件', '### DateRangePicker Events').replace('### 样式变量', '### DateRangePicker CSS Variables'));
});

test('all component pages follow the API heading standard', () => {
  assert.deepEqual(checkApiHeadings(), []);
});
