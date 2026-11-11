import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const root = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(root + 'cedar-design-web/packages/ui/package.json');
const { chromium } = createRequire(root + 'cedar-design-web/package.json')('playwright');
const less = createRequire(root + 'maple-design-mobile/packages/cli/package.json')('less');
const MarkdownIt = require('markdown-it'),
  { JSDOM } = require('jsdom');
const { documentationFiles } = await import(root + 'design-ui/bin/normalize-api-headings.mjs');
const md = new MarkdownIt({ html: true });
let checked = 0;
for (const { filename } of documentationFiles()) {
  const text = fs.readFileSync(filename, 'utf8'),
    block = text.match(/<!-- component-css-variables:start -->([\s\S]*?)<!-- component-css-variables:end -->/)?.[1];
  if (!block) continue;
  const doc = new JSDOM(md.render(block)).window.document;
  for (const row of doc.querySelectorAll('tbody tr')) assert.equal(row.querySelectorAll('td').length, 3, filename);
  for (const table of doc.querySelectorAll('table')) {
    assert.equal(table.parentElement.style.overflowX, 'auto');
    assert.equal(table.parentElement.style.maxWidth, '100%');
  }
  assert.equal((text.match(/^## CSS Variables$/gm) ?? []).length, 1, filename);
  checked++;
}
const compile = async (rel) => {
  const file = root + 'maple-design-mobile/packages/ui/src/' + rel;
  return (await less.render(fs.readFileSync(file, 'utf8'), { filename: file, javascriptEnabled: true })).css;
};
const css =
  (await compile('_components/picker-field/style/index.less')) +
  (await compile('time/style/index.less')) +
  (await compile('date-range/style/index.less'));
const browser = await chromium.launch({ headless: true });
const results = [];
const evidence = process.env.CSS_VARIABLE_EVIDENCE_DIR ?? root + 'design-ui/artifacts/css-variables';
fs.mkdirSync(evidence, { recursive: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.setContent(
    '<style>' +
      css +
      '</style><div style="width:400px"><div id="time" class="mp-time-picker" style="width:10px;--mp-time-picker-min-width:120px">Time</div></div><div class="mp-date-range-picker" style="--mp-date-range-picker-value-active-color:rgb(123,45,67)"><button id="summary" class="mp-date-range-picker__summary mp-date-range-picker__summary--active">Range</button></div>',
  );
  assert.equal(Math.round(await page.locator('#time').evaluate((e) => e.getBoundingClientRect().width)), 120);
  await page.locator('#time').evaluate((e) => e.style.setProperty('--mp-time-picker-min-width', '240px'));
  assert.equal(Math.round(await page.locator('#time').evaluate((e) => e.getBoundingClientRect().width)), 240);
  assert.equal(await page.locator('#summary').evaluate((e) => getComputedStyle(e).color), 'rgb(123, 45, 67)');
  results.push('compiled Time min-width overrides at 120px and 240px; DateRange active color override');
  const doc = fs
    .readFileSync(root + 'cedar-design-web/packages/ui/src/table/README.md', 'utf8')
    .match(/<!-- component-css-variables:start -->([\s\S]*?)<!-- component-css-variables:end -->/)[1];
  for (const width of [1280, 375]) {
    await page.setViewportSize({ width, height: 800 });
    await page.setContent(
      '<style>body{margin:0;font:14px/1.6 system-ui;color:#1f2937}main{max-width:960px;margin:24px auto;padding:0 16px;min-width:0}table{border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}code{white-space:nowrap}pre{overflow:auto}p{overflow-wrap:anywhere}</style><main><h1>Table CSS Variables</h1>' +
        md.render(doc) +
        '</main>',
    );
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), String(width));
    if (width < 600)
      assert.ok(
        await page.locator('.token-reference-table').evaluate((e) => e.scrollWidth > e.clientWidth),
        String(width),
      );
    await page.screenshot({ path: evidence + '/table-' + width + '.png' });
    results.push('rendered generated Table reference at ' + width + 'px: page fits; narrow tables scroll');
  }
  fs.writeFileSync(
    evidence + '/browser-verification.json',
    JSON.stringify(
      {
        checkedDocuments: checked,
        browser: await browser.version(),
        scope:
          'Compiled CSS fixture and generated Markdown rendering, not full production documentation sites or all component states.',
        results,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(JSON.stringify({ checkedDocuments: checked, results }, null, 2));
} finally {
  await browser.close();
}
