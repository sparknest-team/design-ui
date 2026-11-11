import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { assertMotionOnlyRule } from './theme-audit-utils.mjs';
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
