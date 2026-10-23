import test from 'node:test';
import assert from 'node:assert/strict';
import contract from '../contracts/theme-contract.json' with { type: 'json' };
import { platformComponentTokenValues, platformSystemTokenValues } from './index.mjs';

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
