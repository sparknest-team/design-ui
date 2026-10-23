import assert from 'node:assert/strict';
import { auditThemes } from './theme-audit-utils.mjs';

let checks = 0;
await auditThemes('field-decorator', ({ prefix: p, repo, brand, mode, document, tag, cascade, expand, variables }) => {
  for (const variant of ['outline', 'standard'])
    for (const error of [false, true])
      for (const disabled of [false, true])
        for (const focus of [false, true])
          for (const hover of [false, true]) {
            const root = document.createElement('div');
            root.className = [`${p}-field-decorator`, `${p}-field-decorator--variant-${variant}`, error && `${p}-field-decorator--error`, disabled && `${p}-field-decorator--disabled`, focus && `${p}-field-decorator--focus`, hover && 'audit-hover'].filter(Boolean).join(' ');
            tag.append(root);
            const border = document.createElement('fieldset');
            border.className = `${p}-field-decorator__border`;
            root.append(border);
            if (disabled || error) {
              const token = `--${p}-field-variant-${variant}-${variant === 'outline' ? 'border' : 'line'}-color-${disabled ? 'disabled' : 'error'}`;
              const property = variant === 'outline' ? 'border-color' : 'border-bottom-color';
              const label = `${repo}/${brand}/${mode}/${variant}/${error}/${disabled}/${focus}/${hover}`;
              assert.equal(expand(cascade(border)[property]), expand(variables[token]), label);
              const previous = variables[token];
              variables[token] = '#123456';
              assert.equal(expand(cascade(border)[property]), '#123456', `${label}: public override must be consumed`);
              variables[token] = previous;
              checks += 2;
            }
            root.remove();
          }
}, { themeFileName: 'field', pointerMode: 'fine' });
console.log(`Field themes passed: ${checks} error/disabled value and override checks, including hover/focus overlap.`);
