import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
const fixture = fileURLToPath(new URL('.', import.meta.url))
const workspace = resolve(fixture, '../../..')
const require = createRequire(resolve(workspace, 'cedar-design-web/packages/ui/package.json'))
const { build, preview } = await import(new URL('./dist/node/index.js', `file://${require.resolve('vite')}`).href)
const vue = (await import(require.resolve('@vitejs/plugin-vue'))).default
const jsx = (await import(require.resolve('@vitejs/plugin-vue-jsx'))).default
const { chromium, firefox, webkit } = createRequire(resolve(workspace, 'cedar-design-web/package.json'))('playwright')
const output = await mkdtemp(join(tmpdir(), 'reading-direction-batch-'))
const evidence = process.env.DIRECTION_EVIDENCE_DIR ? resolve(process.env.DIRECTION_EVIDENCE_DIR, 'batch-d') : resolve(workspace, 'design-ui/audits/evidence/reading-direction-batch-d-2026-10-29')
await mkdir(evidence, { recursive: true })
const config = {
  configFile: false, root: fixture, logLevel: 'warn', plugins: [vue(), jsx()],
  resolve: { dedupe: ['vue'], alias: { vue: require.resolve('vue/dist/vue.runtime.esm-bundler.js'), '@cedar-design/use-vue': resolve(workspace, 'cedar-design-web/packages/use/src/index.ts'), '@maple-design/use-vue': resolve(workspace, 'maple-design-mobile/packages/use/src/index.ts') } },
  css: { preprocessorOptions: { less: { javascriptEnabled: true } } },
  build: { outDir: output, emptyOutDir: true, minify: false },
}
let server
const results = []
try {
  await build(config)
  server = await preview({ ...config, preview: { host: '127.0.0.1', port: 0, open: false } })
  const port = server.httpServer.address().port
  for (const [engine, launcher] of Object.entries({ chromium, firefox, webkit })) {
    if (process.env.DIRECTION_ENGINES && !process.env.DIRECTION_ENGINES.split(',').includes(engine)) continue
    const browser = await launcher.launch({ headless: true })
    try {
      const page = await browser.newPage({ viewport: { width: 1280, height: 1000 }, hasTouch: true })
      page.setDefaultTimeout(10000)
      const errors = []; page.on('pageerror', error => errors.push(error.message))
      await page.goto(`http://127.0.0.1:${port}`);
      await page.locator('#cInput input').waitFor();
      const state = async () => JSON.parse(await page.locator('#state').textContent());
      for (const direction of ['ltr', 'rtl', 'ltr']) {
        if (await page.locator('#toggle').textContent() !== direction) await page.locator('#toggle').click();
        await page.waitForTimeout(100);
        assert.equal(await page.locator('#nested input').evaluate(el => getComputedStyle(el).direction), 'ltr');
        for (const p of ['c', 'm']) {
          const prefix = p === 'c' ? 'c' : 'mp';
          const input = page.locator(`#${p}Input input`);
          await input.fill('abc العربية 123'); await input.focus();
          await input.evaluate(el => el.setSelectionRange(2, 2));
          const before = await state();
          await page.locator('#toggle').evaluate(el => el.click()); await page.waitForTimeout(80);
          assert.equal(await input.evaluate(el => el.selectionStart), 2);
          assert.equal(await input.evaluate(el => document.activeElement === el), true);
          assert.deepEqual(await state(), before);
          await page.locator('#toggle').evaluate(el => el.click()); await page.waitForTimeout(80);
          const shell = page.locator(`#${p}Input .${prefix}-field-decorator`);
          const pre = await shell.locator('[data-prefix]').boundingBox(), suffix = await shell.locator('[data-suffix]').boundingBox();
          assert.ok(direction === 'rtl' ? pre.x > suffix.x : pre.x < suffix.x);
          await page.waitForFunction(({p,prefix,direction}) => {
            const root = document.querySelector(`#${p}Input .${prefix}-field-decorator`), middle = root.querySelector(`.${prefix}-field-decorator__middle`), label = root.querySelector('label');
            const r = root.getBoundingClientRect(), m = middle.getBoundingClientRect(), l = label.getBoundingClientRect();
            return direction === 'rtl' ? Math.abs(l.right - m.right) < 3 : Math.abs(l.left - m.left) < 3;
          }, {p,prefix,direction});
          await input.evaluate(el => el.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true })));
          await input.evaluate(el => { el.setSelectionRange(el.value.length, el.value.length); el.value = '拼音 العربية'; el.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true })) });
          assert.equal((await state()).values[`${p}Input`], 'abc العربية 123');
          await input.evaluate(el => { el.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true })); el.dispatchEvent(new InputEvent('input', { bubbles: true })) });
          assert.equal((await state()).values[`${p}Input`], '拼音 العربية');
          await shell.locator(`.${prefix}-field-decorator__clear-btn`).click(); assert.equal((await state()).values[`${p}Input`], '');
          const number = page.locator(`#${p}Number input`); await number.focus();
          const old = Number(await number.getAttribute('aria-valuenow')); await page.keyboard.press('ArrowUp'); assert.equal(Number(await number.getAttribute('aria-valuenow')), old + 1); await page.keyboard.press('ArrowDown'); assert.equal(Number(await number.getAttribute('aria-valuenow')), old);
          const area = page.locator(`#${p}Textarea textarea`); await area.fill('First العربية\nSecond 123'); await area.focus(); await area.evaluate(el => el.setSelectionRange(3,3));
          await page.locator('#toggle').evaluate(el => el.click()); await page.waitForTimeout(70); assert.equal(await area.evaluate(el => el.selectionStart), 3); await page.locator('#toggle').evaluate(el => el.click()); await page.waitForTimeout(70);
          const multi = page.locator(`#${p}Multi input`); await multi.focus(); await page.keyboard.press('Backspace'); assert.deepEqual((await state()).values[`${p}Multi`], ['a']);
          await page.keyboard.type('Beta'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter'); await page.keyboard.press('Escape');
          assert.deepEqual((await state()).values[`${p}Multi`], ['a','b']);
          const select = page.locator(`#${p}Select input`); await select.click(); await select.fill('Gamma'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter');
          assert.equal((await state()).values[`${p}Select`], 'c');
          await select.focus(); await page.keyboard.press('Enter');
          const popup = page.locator(`#portal .${prefix}-select-dropdown:visible`).last();
          await popup.waitFor();
          assert.equal(await popup.evaluate(el => getComputedStyle(el).direction), direction);
          await page.locator('#scope').evaluate((el, dir) => el.setAttribute('dir', dir), direction === 'rtl' ? 'ltr' : 'rtl'); await page.waitForTimeout(100);
          assert.equal(await popup.evaluate(el => getComputedStyle(el).direction), direction === 'rtl' ? 'ltr' : 'rtl');
          await page.locator('#scope').evaluate((el, dir) => el.setAttribute('dir', dir), direction); await page.keyboard.press('Escape');
          for (const align of ['left','right','center','']) {
            await page.selectOption('#align', align);
            const content = page.locator(`#${p}Select .${prefix}-selection-field__content`);
            assert.equal(await content.evaluate(el => getComputedStyle(el).textAlign), align || 'start');
            if (align) assert.equal(await content.evaluate(el => getComputedStyle(el).justifyContent), align);
          }
        }
        const stable = await state();
        for (const variant of ['outline','filled','standard']) {
          await page.selectOption('#variant', variant);
          for (const size of ['sm','md','lg']) {
            await page.selectOption('#size', size); await page.waitForTimeout(70);
            for (const p of ['c','m']) {
              const group = page.locator(`#${p}Group`), labels = group.locator(p === 'c' ? '.c-input-group-label' : '.mp-input-group-label');
              const first = await labels.first().boundingBox(), last = await labels.last().boundingBox();
              assert.ok(direction === 'rtl' ? first.x > last.x : first.x < last.x);
              if (variant !== 'standard') {
                const corner = await labels.first().evaluate(el => ({ left: getComputedStyle(el).borderTopLeftRadius, right: getComputedStyle(el).borderTopRightRadius }));
                assert.ok(parseFloat(direction === 'rtl' ? corner.right : corner.left) > 0);
                assert.equal(parseFloat(direction === 'rtl' ? corner.left : corner.right), 0);
              }
            }
          }
        }
        await page.selectOption('#variant', 'outline'); await page.selectOption('#size', 'md');
        assert.deepEqual(await state(), stable);
        const panelBefore = (await state()).values.mPanel;
        await page.locator('#mPanel').getByRole('button').click();
        const panel = page.locator('#portal .mp-field-presentation__panel'); await panel.waitFor();
        assert.equal(await panel.evaluate(el => getComputedStyle(el).direction), direction);
        await panel.getByRole('option', { name: 'Gamma 123' }).click();
        assert.deepEqual((await state()).values.mPanel, panelBefore);
        await page.locator('#toggle').evaluate(el => el.click()); await page.waitForTimeout(100);
        assert.equal(await panel.evaluate(el => getComputedStyle(el).direction), direction === 'rtl' ? 'ltr' : 'rtl');
        await page.locator('#toggle').evaluate(el => el.click());
        await panel.locator('.mp-field-presentation__footer button').last().click();
        assert.deepEqual((await state()).values.mPanel, panelBefore.includes('c') ? panelBefore.filter(value => value !== 'c') : [...panelBefore, 'c']);
        const tags = page.locator('#tags input'); await tags.focus(); await tags.fill('Gamma'); await page.keyboard.press('Enter'); assert.deepEqual((await state()).values.tags, ['Alpha','Beta','Gamma']);
        await page.keyboard.press('Backspace');
        assert.deepEqual((await state()).values.tags, ['Alpha','Beta']);
        const saved = await state();
        await page.locator('#disable').click();
        for (const id of ['cInput','mInput','cNumber','mNumber','cTextarea','mTextarea']) assert.equal(await page.locator(`#${id} input,#${id} textarea`).isDisabled(), true);
        await page.locator('#disable').click(); await page.locator('#readonly').click();
        for (const id of ['cInput','mInput','cNumber','mNumber','cTextarea','mTextarea']) assert.equal(await page.locator(`#${id} input,#${id} textarea`).getAttribute('readonly') !== null, true);
        await page.locator('#readonly').click(); assert.deepEqual(await state(), saved);
        results.push({ engine, direction, platforms: ['Cedar','Maple'], fields: 9, floatingHint: true, nativeSelection: true, composition: true, portal: true, explicitAlignment: true });
        console.log(`${engine} ${direction}: field contracts passed`);
      }
      assert.deepEqual(errors, []);
      if (engine === 'chromium') { await page.locator('#toggle').click(); await page.waitForTimeout(100); await page.screenshot({ path: join(evidence, 'rtl-fields.png') }); }
    } finally { await browser.close() }
  }
  await writeFile(join(evidence, 'results.json'), JSON.stringify({ passed: true, results }, null, 2));
  console.log(JSON.stringify({ passed: true, results }, null, 2));
} finally { await new Promise(resolve => server?.httpServer.close(resolve) ?? resolve()); await rm(output, { recursive: true, force: true }) }
