import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const roots = ['cedar-design-web/packages/ui/src', 'maple-design-mobile/packages/ui/src']
const entries = []
async function walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (/^(?:__tests__|__demos__|example|docs|style|themes)$/.test(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) await walk(full)
    else if (/\.(vue|tsx|ts)$/.test(full)) {
      const source = await fs.readFile(full, 'utf8')
      for (const match of source.matchAll(
        /<(Trigger|trigger|MpTrigger|CTrigger|mp-trigger|c-trigger)(?=[\s>])([\s\S]*?)>/g,
      )) {
        const relative = path.relative(root, full)
        const wrapperBinding =
          /v-bind="triggerBindings"/.test(match[2]) &&
          /const\s*\{\s*triggerRef,\s*triggerBindings\s*\}\s*=\s*controls/.test(source) &&
          /const controls = useTriggerWrapper\(props, attrs,/.test(source)
        if (wrapperBinding) {
          const props = await fs.readFile(path.join(dir, 'props.ts'), 'utf8')
          assert.match(props, /\btrigger:\s*\{/, `${relative}: wrapper must declare interaction defaults`)
          assert.match(props, /\bunmountOnClose:\s*\{/, `${relative}: wrapper must declare cache defaults`)
        }
        if (!wrapperBinding) {
          assert.match(
            match[2],
            /(?:^|\s):?trigger\s*=|v-bind\s*=\s*"\s*\{[^"]*\btrigger\s*:/,
            `${relative}: direct Trigger consumer must declare its interaction explicitly`,
          )
          if (relative.startsWith('maple-design-mobile/'))
            assert.match(
              match[2],
              /(?:^|\s)(?::unmount-on-close|unmountOnClose)\s*=|v-bind\s*=\s*"\s*\{[^"]*\bunmountOnClose\s*:/,
              `${relative}: Maple wrapper must declare its content cache policy`,
            )
        }
        const callbacks = [...match[2].matchAll(/(?:onOpen-change|onUpdate:open)=\{([^}]+)\}/g)].map((item) =>
          item[1].trim(),
        )
        assert.equal(new Set(callbacks).size, callbacks.length, `${relative}: duplicated state request callback`)
        entries.push({ path: relative, line: source.slice(0, match.index).split('\n').length, tag: match[1] })
      }
      for (const match of source.matchAll(/triggerComponent:\s*(Trigger|MpTrigger)\s*,/g)) {
        const relative = path.relative(root, full)
        const descriptor = source.slice(
          match.index,
          source.indexOf('panel:', match.index) === -1 ? source.length : source.indexOf('panel:', match.index),
        )
        assert.match(
          descriptor,
          /triggerProps:\s*{[\s\S]*?\btrigger:/,
          `${relative}: render descriptor must declare interaction`,
        )
        if (relative.startsWith('maple-design-mobile/'))
          assert.match(
            descriptor,
            /unmountOnClose:\s*(?:true|false|props\.unmountOnClose)/,
            `${relative}: render descriptor must declare cache policy`,
          )
        entries.push({
          path: relative,
          line: source.slice(0, match.index).split('\n').length,
          tag: `${match[1]} via MenuView`,
        })
      }
      for (const match of source.matchAll(/\bh\(Trigger,\s*{/g)) {
        const relative = path.relative(root, full)
        const descriptor = source.slice(match.index, source.indexOf('}, { default:', match.index))
        assert.match(descriptor, /\btrigger:/, `${relative}: functional Trigger must declare interaction`)
        assert.match(descriptor, /\bunmountOnClose:/, `${relative}: functional Trigger must declare cache policy`)
        entries.push({ path: relative, line: source.slice(0, match.index).split('\n').length, tag: 'Trigger via h()' })
      }
      assert.ok(!source.includes('triggerInjectionKey'), `${full}: obsolete Trigger context reference`)
      assert.ok(
        !/\b(?:addLock|releaseLock|resolveLock)\b/.test(source),
        `${full}: obsolete Maple scroll lock reference`,
      )
    }
  }
}
for (const dir of roots) await walk(path.join(root, dir))
entries.sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line)
const report = {
  scope:
    'Production Vue/TSX direct Trigger tags and MenuView Trigger descriptors; relative import graph is recorded separately in inventory.json. MenuView dynamic rendering is checked by copied-foundations and browser tests; other dynamic consumers are not inferred.',
  consumers: entries,
}
const file = path.join(root, 'design-ui/refactors/foundation-alignment/trigger-consumers.json')
const serialized = JSON.stringify(report, null, 2) + '\n'
if (process.argv.includes('--write')) await fs.writeFile(file, serialized)
else
  assert.equal(
    await fs.readFile(file, 'utf8'),
    serialized,
    'Trigger consumer inventory drift: review and run with --write',
  )
console.log(
  `Verified ${entries.length} direct Trigger call sites: explicit interaction, no duplicate request handlers or obsolete context/lock references.`,
)
