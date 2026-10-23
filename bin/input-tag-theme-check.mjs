import assert from 'node:assert/strict';
import { auditThemes } from './theme-audit-utils.mjs';

let states = 0;
await auditThemes('input-tag', ({ tag, document, cascade, expand, brand, mode }) => {
  const inner = document.createElement('span'); inner.className = 'c-input-tag__inner'; tag.append(inner);
  const chip = document.createElement('span'); chip.className = 'c-input-tag__tag c-tag c-tag--checked c-tag--status-default c-tag--variant-default'; inner.append(chip);
  for (const size of ['xs', 'sm', 'md', 'lg', 'xl'])
    for (const focus of [false, true]) for (const disabled of [false, true]) {
      tag.className = `c-input-tag c-field-decorator c-field-decorator--size-${size}${focus ? ' c-field-decorator--focus' : ''}${disabled ? ' c-field-decorator--disabled' : ''}`;
      const label = `${brand}/${mode}/${size}/${focus}/${disabled}`;
      const style = cascade(chip);
      assert.equal(expand(style['min-height']), expand(`var(--c-input-tag-size-${size}-tag-height)`), label);
      assert.equal(expand(cascade(tag)['font-size']), expand(`var(--c-input-tag-size-${size}-font-size)`), label);
      assert.equal(expand(style['background-color']), expand(`var(--c-input-tag-tag-color-bg${disabled ? '-disabled' : focus ? '-focus' : ''})`), label);
      assert.equal(expand(style['border-color']), expand(`var(--c-input-tag-tag-color-border${disabled ? '-disabled' : focus ? '-focus' : ''})`), label);
      assert.equal(expand(style.color), expand(`var(--c-input-tag-color-text-${disabled ? 'disabled' : 'default'})`), label);
      states++;
    }
}, { platforms: ['c'], themeFileName: null, importsAfter: ['tag'] });
console.log(`InputTag content states passed: ${states} size/focus/disabled cases. Form shell ownership is checked separately; no browser layout validation.`);
