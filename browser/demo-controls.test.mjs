import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(path.join(root, 'maple-design-mobile/package.json'));
const { chromium } = require('playwright');
const cli = createRequire(path.join(root, 'maple-design-mobile/packages/maple-cli/package.json'));
const { createServer } = await import(cli.resolve('vite'));
const vue = (await import(cli.resolve('@vitejs/plugin-vue'))).default;
const jsx = (await import(cli.resolve('@vitejs/plugin-vue-jsx'))).default;

function fixture(cases, prefix, styles) {
  return `import {createApp,h} from 'vue'
import * as UI from '/src/index.ts'
import * as Icons from '@${prefix === 'mp' ? 'maple' : 'cedar'}-design/icons-vue'
import StyleProvider from '/src/style-provider/index.ts'
import Themes from '/src/themes/index.ts'
${styles.map(name => `import '/src/${name}/style/index.ts'`).join('\n')}
${cases.map((name, index) => `import Demo${index} from '/src/${name}'`).join('\n')}
const mode=new URLSearchParams(location.search).get('mode')||'light'
StyleProvider.setStyleVars(Themes.default[mode])
const demos=[${cases.map((name, i) => `{name:${JSON.stringify(name)},component:Demo${i}}`).join(',')}]
const app=createApp({render:()=>demos.map(demo=>h('section',{'data-case':demo.name},[h('h2',demo.name),h(demo.component)]))})
app.use(UI.default)
for(const [name,value] of Object.entries(Icons))if(name.startsWith('Icon'))app.component('${prefix === 'mp' ? 'M' : 'C'}'+name,value)
app.mount('#app')
`;
}

for (const [platform, repo, pkg, prefix, directory] of [
  ['maple', 'maple-design-mobile', 'maple-ui', 'mp', 'example/demos'],
  ['cedar', 'cedar-design-web', 'cedar-ui', 'c', '__demos__'],
]) {
  test(`${platform}: standard demo controls keep values and readable widths at 346px in both themes`, { timeout: 360000 }, async () => {
    const sourceRoot = path.join(root, repo, 'packages', pkg, 'src');
    const files = await fs.readdir(sourceRoot, { recursive: true });
    const cases = files.filter(file => /(?:appearance|layout)-lab\.vue$/.test(file) && file.includes(directory));
    for (const name of [`select/${directory}/standard.vue`, `tooltip/${directory}/placement.vue`]) if (files.includes(name)) cases.push(name);
    const styleOwners = new Set(['button', 'form', 'radio', 'select', 'space', 'card', 'checkbox', 'input', 'row', 'col', 'tooltip', 'icon', ...cases.map(name => name.split('/')[0])]);
    const styles = [...styleOwners].filter(name => files.includes(`${name}/style/index.ts`));
    const entry = fixture(cases, prefix, styles);
    const cacheDir = await fs.mkdtemp(path.join(tmpdir(), `demo-controls-${platform}-`));
    const output = path.join(root, 'design-ui/audits/evidence/demo-controls-2026-10-27', platform);
    await fs.mkdir(output, { recursive: true });
    const html = '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;padding:16px;font:14px/1.5 sans-serif;background:var(--'+prefix+'-color-body);color:var(--'+prefix+'-color-text)}section{min-width:0;padding:16px 0;border-bottom:1px solid #aaa}h2{font-size:15px;overflow-wrap:anywhere}</style></head><body><main id="app"></main><script type="module" src="/__demo-controls-entry.js"></script></body></html>';
    const server = await createServer({
      root: path.dirname(sourceRoot), configFile: false, cacheDir,
      plugins: [vue(), jsx(), {
        name: 'demo-controls-audit',
        enforce: 'pre',
        resolveId(id) {
          if (id === '/__demo-controls-entry.js') return '\0demo-controls-entry';
          if (id === '@maple-design/cli/client') return '\0demo-controls-client';
        },
        load(id) {
          if (id === '\0demo-controls-entry') return entry;
          if (id === '\0demo-controls-client') return `export const watchLang=callback=>callback('zh-CN');export const onThemeChange=()=>{};export const watchTheme=callback=>callback(new URLSearchParams(location.search).get('mode')==='dark'?'darkTheme':'lightTheme')`;
        },
        configureServer(vite) {
          vite.middlewares.use('/__demo-controls', async (req, res) => {
            res.setHeader('Content-Type', 'text/html');
            res.end(await vite.transformIndexHtml('/__demo-controls.html', html));
          });
        },
      }],
      optimizeDeps: { entries: [], include: ['vue'] },
      css: { preprocessorOptions: { less: { javascriptEnabled: true } } },
      server: { host: '127.0.0.1', port: 0 },
    });
    let browser;
    const results = [];
    try {
      await server.listen();
      browser = await chromium.launch();
      for (const mode of ['light', 'dark']) {
        const page = await browser.newPage({ viewport: { width: 346, height: 900 }, reducedMotion: 'reduce' });
        page.setDefaultTimeout(20000);
        const errors = [];
        page.on('pageerror', error => { errors.push(error.message); console.error(platform, error.message); });
        page.on('console', message => { if (message.text().includes('Failed to resolve component')) errors.push(message.text()); });
        await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/__demo-controls?mode=${mode}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
        await page.locator('section[data-case]').first().waitFor({ timeout: 120000 });
        for (const section of await page.locator('section[data-case]').all()) {
          const name = await section.getAttribute('data-case');
          console.log(platform, mode, name);
          const fields = section.locator(`.${prefix}-form-item`);
          const dimensions = await fields.evaluateAll((items, p) => items.map(item => ({
            label: item.textContent.slice(0, 80), width: item.clientWidth, scroll: item.scrollWidth,
            clipped: Array.from(item.querySelectorAll('[class$="radio__button-label"]')).filter(label => label.scrollWidth > label.clientWidth + 1).map(label => label.textContent),
            selectWidths: Array.from(item.querySelectorAll('[role="combobox"]')).map(control => control.closest('.' + p + '-select')?.getBoundingClientRect().width ?? control.getBoundingClientRect().width),
          })), prefix);
          for (const field of dimensions) {
            assert.ok(field.scroll <= field.width + 1, `${name}: ${JSON.stringify(field)}`);
            assert.deepEqual(field.clipped, [], name);
            for (const width of field.selectWidths) assert.ok(width >= 180, `${name}: Select width ${width}`);
          }
          for (const group of await section.getByRole('radiogroup').all()) {
            const labels = group.locator(`label.${prefix}-radio`);
            if ((await labels.count()) > 1 && !(await group.getAttribute('aria-disabled'))) {
              await labels.last().click();
              assert.equal(await group.locator('input[type="radio"]:checked').count(), 1, name);
              await labels.first().click();
            }
          }
          results.push({ mode, name, fields: dimensions.length, dimensions });
          if (/^(?:tag|alert|space|select)\//.test(name)) await section.screenshot({ path: path.join(output, `${mode}-${name.replaceAll('/', '-')}.png`) });
        }
        assert.deepEqual(errors, []);
        await page.close();
      }
      await fs.writeFile(path.join(output, 'report.json'), JSON.stringify({ cases: cases.length, results }, null, 2));
    } finally {
      await browser?.close();
      await server.close();
      await fs.rm(cacheDir, { recursive: true, force: true });
    }
  });
}
