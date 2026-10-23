import assert from 'node:assert/strict';
import { auditThemes, rgba, over, luminance } from './theme-audit-utils.mjs';

let states = 0, pairs = 0, overrides = 0, minimum = Infinity;
await auditThemes('badge', ({ prefix, repo, brand, mode, tag, document, variables, expand, cascade }) => {
  const content = document.createElement('span');
  tag.append(content);
  for (const status of ['', 'default', 'primary', 'secondary', 'tertiary', 'info', 'success', 'warning', 'danger'])
    for (const variant of ['default', 'outline'])
      for (const part of ['content', 'dot-content']) {
        tag.className = `${prefix}-badge ${prefix}-badge--variant-${variant} ${status ? `${prefix}-badge--status-${status}` : ''}`;
        content.className = `${prefix}-badge__${part}`;
        const style = cascade(content);
        const label = `${repo}/${brand}/${mode}/${status}/${variant}/${part}`;
        const base = `--${prefix}-badge-`;
        const fg = variant === 'outline' ? `variant-outline-${status ? `status-${status}-` : ''}text-color` : `${status ? `status-${status}-` : ''}text-color`;
        const bg = variant === 'outline' ? 'variant-outline-bg-color' : `${status ? `status-${status}-` : ''}bg-color`;
        assert.equal(style['background-color'], `var(${base}${bg})`, label);
        if (part === 'content' || status || variant === 'outline') assert.equal(style.color, `var(${base}${fg})`, label);
        if (variant === 'outline') assert.equal(style.border, `thin solid var(${base}${fg})`, label);
        states++;
        if (part === 'content') {
          for (const surface of ['page', 'default', 'raised', 'overlay', 'muted']) {
            const backdrop = over(rgba(expand(`var(--${prefix}-sys-color-surface-${surface})`)), rgba(expand(`var(--${prefix}-sys-color-surface-page)`)));
            const background = over(rgba(expand(style['background-color'])), backdrop);
            const foreground = over(rgba(expand(style.color)), background);
            const a = luminance(foreground), b = luminance(background);
            const ratio = (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);
            assert.ok(ratio >= 4.5, `${label}/${surface}: ${ratio}`);
            minimum = Math.min(minimum,ratio); pairs++;
          }
        }
        const old = variables[base+bg]; variables[base+bg] = '#123456';
        assert.equal(expand(style['background-color']), '#123456', label);
        variables[base+bg] = old; overrides++;
      }
});
console.log(`Badge themes passed: ${states} states, ${pairs} contrast pairs, ${overrides} overrides; minimum ${minimum.toFixed(3)}:1.`);
