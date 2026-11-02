import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import contract from '../contracts/theme-contract.json' with { type: 'json' };
import { platformComponentTokenValues, platformSystemTokenValues } from './index.mjs';
import { normalizeTokenValue } from './normalize-value.mjs';

test('every system value is registered exactly once per platform', () => {
  for (const platform of ['cedar', 'maple']) {
    const names = [...Object.keys(contract.systemTokenValues), ...Object.keys(contract.platformSystemTokenValues[platform])];
    assert.equal(new Set(names).size, names.length);
    assert.deepEqual(names.sort(), contract.tokens.system);
    assert.ok(Object.isFrozen(platformSystemTokenValues[platform]));
  }
});

test('platform component defaults never contradict shared defaults', () => {
  for (const platform of ['cedar', 'maple']) {
    for (const [component, values] of Object.entries(contract.platformComponentTokenValues[platform])) {
      assert.ok(Object.isFrozen(platformComponentTokenValues[platform][component]));
      for (const [token, value] of Object.entries(values)) {
        assert.equal(contract.componentTokenValues[component]?.[token], undefined);
        assert.equal(typeof value, 'string');
        assert.ok(value.length);
      }
    }
  }
});

test('Checkbox mark-color is shared by name and preserves both existing platform defaults', () => {
  assert.ok(contract.tokens.components.checkbox.includes('mark-color'));
  assert.equal(contract.componentTokenValues.checkbox['mark-color'], undefined);
  for (const [platform, repository, prefix, role] of [
    ['cedar', 'cedar-design-web', 'c', 'surface-default'],
    ['maple', 'maple-design-mobile', 'mp', 'content-on-bright'],
  ]) {
    const expected = `var(--PREFIX-sys-color-${role})`;
    const source = readFileSync(new URL(`../../../../${repository}/packages/${platform}-ui/src/checkbox/style/token.less`, import.meta.url), 'utf8');
    const value = source.match(new RegExp(`--${prefix}-checkbox-mark-color:\\s*([^;]+);`))?.[1];
    assert.ok(value, `${platform}: Checkbox mark-color must be declared`);
    assert.equal(normalizeTokenValue(value, prefix), expected);
    assert.equal(platformComponentTokenValues[platform].checkbox['mark-color'], expected);
  }
});

test('Switch checked text has a public contract without changing platform foreground defaults', () => {
  assert.ok(contract.tokens.components.switch.includes('checked-text-color'));
  assert.equal(contract.componentTokenValues.switch['checked-text-color'], undefined);
  for (const [platform, repository, prefix, expected] of [
    ['cedar', 'cedar-design-web', 'c', 'var(--PREFIX-switch-text-color)'],
    ['maple', 'maple-design-mobile', 'mp', 'var(--PREFIX-sys-color-content-on-bright)'],
  ]) {
    const root = new URL(`../../../../${repository}/packages/${platform}-ui/src/`, import.meta.url);
    const tokens = readFileSync(new URL('switch/style/token.less', root), 'utf8');
    const value = tokens.match(new RegExp(`--${prefix}-switch-checked-text-color:\\s*([^;]+);`))?.[1];
    assert.ok(value);
    assert.equal(normalizeTokenValue(value, prefix), expected);
    assert.equal(platformComponentTokenValues[platform].switch['checked-text-color'], expected);
    const style = readFileSync(new URL(`switch/style/${platform === 'maple' ? 'switch' : 'index'}.less`, root), 'utf8');
    assert.match(style, new RegExp(`&--checked &__text\\s*\\{[^}]*color: var\\(--${prefix}-switch-checked-text-color\\)`));
  }
});
