import assert from 'node:assert/strict';
import test from 'node:test';
import { renderCatalog } from './token-catalog.mjs';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../../cedar-design-web/packages/cedar-ui/package.json', import.meta.url));

test('catalog retains conditional declarations, internal scope and actual properties', () => {
  const report = { totals: { errors: 0 }, components: [{ platform: 'c', component: 'example', tokens: {
    '--c-internal-example-active': { visibility: 'internal', consumer: 'local-css', values: ['1'], definitions: [{ selector: ':root', value: '1' }, { selector: ':root[cedar-theme=dark]', value: '2' }], consumerProperties: ['opacity'] },
  } }] };
  const text = renderCatalog(report, 'c', 'zh');
  assert.match(text, /内部/);
  assert.match(text, /cedar-theme=dark/);
  assert.match(text, /`opacity`/);
  assert.doesNotMatch(renderCatalog(report, 'mp', 'en'), /--c-internal/);
});

test('a partial or failed scan cannot become a published reference', () => {
  assert.throws(() => renderCatalog({ totals: { errors: 1 }, components: [] }, 'c', 'zh'));
});

test('delimiter-containing CSS strings retain their rendered value in tables', () => {
  const report = { totals: { errors: 0 }, components: [{ platform: 'c', component: 'example', tokens: {
    '--c-example-content': { visibility: 'public', consumer: 'local-css', values: ['"a|b`<&"'] },
  } }] };
  const MarkdownIt = require('markdown-it');
  const html = new MarkdownIt({ html: true }).render(renderCatalog(report, 'c', 'zh'));
  const { JSDOM } = require('jsdom');
  const document = new JSDOM(html).window.document;
  assert.equal(document.querySelector('tbody td:nth-child(3) code').textContent, '"a|b`<&"');
  assert.equal((html.match(/<td>/g) ?? []).length, 4);
  const table = document.querySelector('table');
  assert.equal(table.parentElement.className, 'token-reference-table');
  assert.equal(table.parentElement.style.overflowX, 'auto');
  assert.equal(table.parentElement.style.maxWidth, '100%');
});
