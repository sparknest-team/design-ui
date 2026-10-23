import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { scanMotionSource } from './motion-source-inventory.mjs';

const workspace = new URL('../../', import.meta.url);
const inventory = JSON.parse(readFileSync(new URL('../audits/motion-source-inventory.json', import.meta.url), 'utf8'));
const cedar = createRequire(new URL('cedar-design-web/packages/cedar-ui/package.json', workspace));
const postcss = cedar('postcss');
const reviewed = [
  ["cedar-design-web", "select/hooks/use-select.ts"],
  ["cedar-design-web", "select/style/index.less"],
  ["maple-design-mobile", "select/style/index.less"],
  ["cedar-design-web", "date/picker/DateRangePicker.vue"],
  ["maple-design-mobile", "carousel/style/index.less"],
  ["maple-design-mobile", "date-range/style/date-range-picker.less"],
  ["maple-design-mobile", "date/style/date-picker.less"],
  ["maple-design-mobile", "time-range/style/time-range-picker.less"],
  ["maple-design-mobile", "time/style/time-picker.less"],
  [
    "cedar-design-web",
    "field-decorator/style/field-decorator.less"
  ],
  [
    "cedar-design-web",
    "filter-form/style/index.less"
  ],
  [
    "cedar-design-web",
    "input/style/input.less"
  ],
  [
    "maple-design-mobile",
    "action-sheet/style/action-sheet.less"
  ],
  [
    "maple-design-mobile",
    "cell/style/cell.less"
  ],
  [
    "maple-design-mobile",
    "checkbox/style/index.less"
  ],
  [
    "maple-design-mobile",
    "counter/style/counter.less"
  ],
  [
    "maple-design-mobile",
    "fab/style/fab.less"
  ],
  [
    "maple-design-mobile",
    "field-decorator/style/field-decorator.less"
  ],
  [
    "maple-design-mobile",
    "form-details/style/form-details.less"
  ],
  [
    "maple-design-mobile",
    "input/style/input.less"
  ],
  [
    "maple-design-mobile",
    "loading/style/loading.less"
  ],
  [
    "maple-design-mobile",
    "notice-bar/style/notice-bar.less"
  ],
  [
    "maple-design-mobile",
    "picker/style/picker.less"
  ],
  [
    "maple-design-mobile",
    "progress-group/style/index.less"
  ],
  [
    "maple-design-mobile",
    "progress/style/index.less"
  ],
  [
    "maple-design-mobile",
    "pull-refresh/style/pull-refresh.less"
  ],
  [
    "maple-design-mobile",
    "radio/style/index.less"
  ],
  [
    "maple-design-mobile",
    "rate/style/rate.less"
  ],
  [
    "maple-design-mobile",
    "result/style/result.less"
  ],
  [
    "maple-design-mobile",
    "slider/style/index.less"
  ],
  [
    "maple-design-mobile",
    "swipe-cell/style/swipe-cell.less"
  ],
  [
    "maple-design-mobile",
    "tab-bar/style/tab-bar-item.less"
  ],
  [
    "maple-design-mobile",
    "tab-bar/style/tab-bar.less"
  ],
  [
    "maple-design-mobile",
    "table/style/table.less"
  ]
];
const roots = new Map();
for (const repo of ['cedar-design-web', 'maple-design-mobile']) {
  const pkg = repo === 'cedar-design-web' ? 'cedar-ui' : 'maple-ui';
  roots.set(repo, new URL(repo + '/packages/' + pkg + '/src/', workspace));
}
for (const [repo, file] of reviewed) {
  test(repo + '/' + file + ': reviewed candidate row and compiled consumers match current source', async () => {
    const source = readFileSync(new URL(file, roots.get(repo)), 'utf8');
    const actual = { file, ...scanMotionSource(file, source) };
    const row = inventory.platforms.find(p => p.repo === repo).candidates.find(r => r.file === file);
    assert.deepEqual(row, actual, 'Refresh only reviewed evidence, not unrelated parallel rows');
    if (!file.endsWith('.less')) return;
    const entry = new URL(file.split('/')[0] + '/style/index.less', roots.get(repo));
    const compiler = repo === 'cedar-design-web' ? cedar('less') : less;
    const compiled = postcss.parse((await compiler.render(readFileSync(entry, 'utf8'), {
      filename: fileURLToPath(entry), javascriptEnabled: true,
    })).css);
    for (const line of actual.css) {
      const property = source.split('\n')[line - 1].trim().match(/^([\w-]+)\s*:/)[1];
      let consumers = 0;
      compiled.walkDecls(property, decl => {
        if (decl.parent.type === 'rule' && decl.parent.selector !== ':root') consumers++;
      });
      assert.ok(consumers > 0, file + ':' + line + '/' + property + ' must compile into a real rule');
    }
  });
}

const less = createRequire(new URL('maple-design-mobile/packages/maple-cli/package.json', workspace))('less');
const routes = {
  checkbox: [
    ['.mp-checkbox__control', 'transition', '--mp-checkbox-animation-duration', '.mp-checkbox__control', 'transition', 'none'],
    ['.mp-checkbox__icon', 'transition', '--mp-checkbox-animation-duration', '.mp-checkbox__icon', 'transition', 'none'],
  ],
  radio: [['.mp-radio__icon::after', 'transition', '--mp-radio-animation-duration', '.mp-radio__icon::after', 'transition', 'none']],
  rate: [
    ['.mp-rate__content', 'transition', '--mp-internal-rate-duration', '.mp-rate__content', 'transition', 'none'],
    ['.mp-rate__content-scale', 'animation', '--mp-internal-rate-scale-duration', '.mp-rate__content', 'animation', 'none'],
  ],
  slider: [['.mp-slider__handle', 'transition', '--mp-slider-transition-duration', '.mp-slider__handle', 'transition', 'none']],
  progress: [
    ['.mp-progress__bar', 'transition', '--mp-progress-transition-duration', '.mp-progress__bar', 'transition', 'none'],
    ['.mp-progress__circle-bar', 'transition', '--mp-progress-transition-duration', '.mp-progress__circle-bar', 'transition', 'none'],
    ['.mp-progress__bar--animated::after', 'animation', '--mp-progress-animation-duration', '.mp-progress__bar--animated::after', 'display', 'none'],
    ['.mp-progress--indeterminate .mp-progress__svg', 'animation', '--mp-progress-animation-duration', '.mp-progress--indeterminate .mp-progress__svg', 'animation', 'none'],
    ['.mp-progress__indeterminate > div', 'animation', '--mp-progress-animation-duration', '.mp-progress__indeterminate > div', 'animation', 'none'],
  ],
  'progress-group': [
    ['.mp-progress-group__segment', 'transition', '--mp-progress-group-transition-duration', '.mp-progress-group__segment', 'transition', 'none'],
    ['.mp-progress-group__active-segment', 'transition', '--mp-progress-group-transition-duration', '.mp-progress-group__active-segment', 'transition', 'none'],
    ['.mp-progress-group__circle-segment', 'transition', '--mp-progress-group-transition-duration', '.mp-progress-group__circle-segment', 'transition', 'none'],
    ['.mp-progress-group__tooltip', 'animation', '--mp-progress-group-tooltip-duration', '.mp-progress-group__tooltip', 'animation', 'none'],
    ['.mp-progress-group__circle-active-segment', 'animation', '--mp-progress-group-transition-duration', '.mp-progress-group__circle-active-segment', 'animation', 'none'],
  ],
};
for (const [component, paths] of Object.entries(routes)) {
  test('Maple ' + component + ': actual compiled duration and reduced-motion consumers', async () => {
    const entry = new URL(component + '/style/index.less', roots.get('maple-design-mobile'));
    const css = postcss.parse((await less.render(readFileSync(entry, 'utf8'), {
      filename: fileURLToPath(entry), javascriptEnabled: true,
    })).css);
    const values = (selector, prop, reduced) => {
      const found = [];
      css.walkRules(rule => {
        const inReduce = rule.parent.type === 'atrule' && rule.parent.params === '(prefers-reduced-motion: reduce)';
        if (inReduce === reduced && rule.selectors.includes(selector))
          rule.walkDecls(prop, decl => found.push(decl.value));
      });
      return found;
    };
    for (const [selector, prop, token, reduceSelector, reduceProp, result] of paths) {
      assert.ok(values(selector, prop, false).some(value => value.includes(token)), selector + '/' + prop + '/' + token);
      assert.ok(values(reduceSelector, reduceProp, true).includes(result), reduceSelector + '/' + reduceProp);
    }
  });
}
