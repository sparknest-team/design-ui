import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { assertMotionOnlyRule, excludeViewportGeometryRule } from './theme-audit-utils.mjs';
const require = createRequire(new URL('../../cedar-design-web/packages/ui/package.json', import.meta.url));
const postcss = require('postcss');
test('motion auditing accepts scale geometry without excluding color declarations', () => {
  const root = postcss.parse('@keyframes zoom { from { scale: .5; opacity: 0 } to { scale: 1; opacity: 1 } }');
  root.walkRules(rule => assert.doesNotThrow(() => assertMotionOnlyRule(rule)));
  for (const property of ['color', 'background-color', 'border-color', '--c-sys-color-content-brand']) {
    const colored = postcss.parse(`@media (prefers-reduced-motion: reduce) { .control { scale: 1; ${property}: red } }`);
    colored.walkRules(rule => assert.throws(() => assertMotionOnlyRule(rule), /Unaudited conditional property/));
  }
});

test('dynamic viewport support excludes only known Dialog geometry tokens', () => {
  for (const prefix of ['c', 'mp']) {
    const root = postcss.parse(`@supports (height: 100dvh) { :root { --${prefix}-dialog-max-height: 90dvh; --${prefix}-dialog-fullscreen-height: 100dvh; } }`);
    root.walkRules(rule => assert.equal(excludeViewportGeometryRule(rule), true));
  }
  for (const property of ['color', '--c-dialog-background', '--mp-dialog-title-text-color', '--c-sys-color-content-brand']) {
    postcss.parse(`@supports (height: 100dvh) { :root { ${property}: red } }`).walkRules(rule => {
      assert.throws(() => excludeViewportGeometryRule(rule), /Unaudited viewport conditional property/);
    });
  }
  postcss.parse('@supports (display: grid) { :root { color: red } }').walkRules(rule => assert.equal(excludeViewportGeometryRule(rule), false));
  postcss.parse('@media print { @supports (height: 100dvh) { :root { --c-dialog-max-height: 90dvh } } }').walkRules(rule => assert.throws(() => excludeViewportGeometryRule(rule), /Nested viewport/));
});
