import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDemoLayout } from './demo-layout-contract.mjs';

test('uses the public Space direction on both platforms without rewriting unrelated components', () => {
  for (const prefix of ['c', 'mp']) {
    assert.equal(normalizeDemoLayout(`<${prefix}-space direction="vertical"><div direction="vertical" /></${prefix}-space>`, prefix), `<${prefix}-space direction="column"><div direction="vertical" /></${prefix}-space>`);
  }
});
test('wraps comparisons, preserves explicit choices and column layout, and is idempotent', () => {
  const input = '<mp-space><mp-space direction="vertical"><mp-space :wrap="false"><mp-space wrap>';
  const output = normalizeDemoLayout(input, 'mp', true);
  assert.equal(output, '<mp-space wrap><mp-space direction="column"><mp-space :wrap="false"><mp-space wrap>');
  assert.equal(normalizeDemoLayout(output, 'mp', true), output);
});
