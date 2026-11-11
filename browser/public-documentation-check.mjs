import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { documentationFiles } from '../bin/normalize-api-headings.mjs';
import { publicDocumentIssues } from '../bin/public-documentation-policy.mjs';
const workspace = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(workspace + 'cedar-design-web/packages/ui/package.json');
const MarkdownIt = require('markdown-it');
const { chromium } = createRequire(workspace + 'cedar-design-web/package.json')('playwright');
const md = new MarkdownIt({ html: true });
md.renderer.rules.table_open = () => '<div class="doc-table"><table>\n';
md.renderer.rules.table_close = () => '</table></div>\n';
let checked = 0;
for (const { filename } of documentationFiles()) {
  const source = fs.readFileSync(filename, 'utf8');
  assert.deepEqual(publicDocumentIssues(source), [], filename);
  const html = md.render(source);
  assert.ok(html.length, filename);
  checked++;
}
const output = process.env.PUBLIC_DOCUMENTATION_EVIDENCE_DIR ?? workspace + 'design-ui/artifacts/public-documentation';
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  const page = await browser.newPage();
  await page.route('**/*', (route) => route.abort());
  const files = [
    'cedar-design-web/packages/ui/src/menu/README.md',
    'cedar-design-web/packages/ui/src/menu/README.en-US.md',
    'maple-design-mobile/packages/ui/src/menu/docs/zh-CN.md',
    'maple-design-mobile/packages/ui/src/menu/docs/en-US.md',
  ];
  for (const [fileIndex, file] of files.entries())
    for (const width of [1280, 375]) {
      const source = fs
        .readFileSync(workspace + file, 'utf8')
        .replace(/^---\n[\s\S]*?\n---\n/, '')
        .replace(/<demo\b[^>]*>[\s\S]*?<\/demo>|```demo\s*\n[^\n]+\n```/g, '<div class="demo">Demo</div>');
      const tokens = md.parse(source, {});
      const toc = [];
      let inCss = false;
      for (let i = 0; i < tokens.length; i++)
        if (tokens[i].type === 'heading_open') {
          const title = tokens[i + 1].content,
            level = tokens[i].tag;
          if (level === 'h2') {
            inCss = title === 'CSS Variables';
            toc.push({ title, level });
          } else if (inCss && level === 'h3') {
            assert.ok(!/定位|触发|数据身份|状态与时长|Placement|trigger|identity|duration/i.test(title), file);
            toc.push({ title, level });
          }
        }
      assert.ok(
        toc.some((x) => /键盘操作|Keyboard interaction/.test(x.title)),
        file,
      );
      const cssIndex = toc.findIndex((item) => item.title === 'CSS Variables');
      assert.ok(cssIndex >= 0, file);
      assert.ok(
        toc.slice(cssIndex + 1).every((item) => item.level === 'h3'),
        file,
      );
      const escaped = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
      const nav = toc.map((item) => '<div class="' + item.level + '">' + escaped(item.title) + '</div>').join('');
      const css =
        '<style>*{box-sizing:border-box}body{margin:0;font:14px/1.65 system-ui;color:#263247;background:#f7f9fc}aside{position:fixed;inset:0 auto 0 0;width:245px;padding:24px 18px;background:#fff;border-right:1px solid #dae1ed;overflow:auto}.h2{font-weight:650;margin:9px 0}.h3{padding-left:14px;font-size:13px;color:#527085}main{margin-left:245px;max-width:1180px;padding:24px 32px;background:#fff;min-width:0}.doc-table{max-width:100%;overflow-x:auto}table{border-collapse:collapse;min-width:100%}th,td{border:1px solid #dbe2ed;text-align:left;padding:8px;vertical-align:top}pre{overflow:auto;background:#f2f5fa;padding:12px}p{overflow-wrap:anywhere}h2{border-bottom:1px solid #dbe2ed;padding:12px 0}.demo{border:1px dashed #b5c5da;padding:20px;color:#7c8ba0}details{padding:12px;background:#f7f9fc}code{font-size:12px}@media(max-width:600px){aside{position:static;width:auto;max-height:300px;border-bottom:1px solid #dae1ed}.h2{display:inline-block;margin:4px 8px}main{margin:0;padding:16px;max-width:100%}}</style>';
      await page.setViewportSize({ width, height: 900 });
      await page.setContent(
        css + '<aside><strong>Menu · Documentation</strong>' + nav + '</aside><main>' + md.render(source) + '</main>',
      );
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), file + ' @ ' + width);
      await page.screenshot({ path: output + '/menu-' + fileIndex + '-' + width + '.png' });
      results.push({ file, width, headings: toc });
    }
  fs.writeFileSync(
    output + '/results.json',
    JSON.stringify(
      {
        checkedDocuments: checked,
        browser: await browser.version(),
        scope:
          'All public Markdown syntax/policy and four Menu document outlines/layouts. Uses a documentation preview fixture; interactive component demos and production sites are not mounted.',
        results,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(JSON.stringify({ checkedDocuments: checked, menuPreviews: results.length }, null, 2));
} finally {
  await browser.close();
}
