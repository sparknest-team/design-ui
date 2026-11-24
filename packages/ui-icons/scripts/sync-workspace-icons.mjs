import { cp, mkdir, readdir, rename, rm } from 'node:fs/promises'
import { basename, dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const workspace = resolve(here, '../../../..')
const mapleRoot = resolve(workspace, 'maple-design-mobile/packages/icons/svg')
const cedarRoot = resolve(workspace, 'cedar-design-web/packages/icons/svg')

const sharedRenames = new Map([
  ['bg-colors', 'background-color'],
  ['faceBook-circle-fill', 'facebook-circle-fill'],
  ['face-book-circle-fill', 'facebook-circle-fill'],
  ['font-colors', 'font-color'],
  ['idcard', 'id-card'],
  ['magnify-minus', 'zoom-out'],
  ['magnify-minus-fill', 'zoom-out-fill'],
  ['magnify-plus', 'zoom-in'],
  ['magnify-plus-fill', 'zoom-in-fill'],
  ['map-marker-radius', 'location-radius'],
  ['map-marker-radius-fill', 'location-radius-fill'],
  ['qrcode', 'qr-code'],
  ['qrcode-scan', 'qr-code-scan'],
  ['wechatpay', 'wechat-pay'],
])

const mapleRenames = new Map([
  ['account-circle', 'user-circle'],
  ['cellphone', 'mobile'],
  ['cog', 'settings'],
  ['content-copy', 'copy'],
  ['dots-vertical', 'more-vertical'],
  ['help-circle', 'question-circle'],
  ['information', 'info-circle'],
  ['magnify', 'search'],
  ['magnify-minus', 'zoom-out'],
  ['magnify-plus', 'zoom-in'],
  ['map-marker', 'location'],
  ['map-marker-radius', 'location-radius'],
  ['view', 'eye'],
  ['window-close', 'close'],
  ['wrench', 'tool'],
])

const normalizeShared = (name) => sharedRenames.get(name) ?? name
const normalizeMapleBase = (name) => {
  const fill = name.endsWith('-fill')
  const base = fill ? name.slice(0, -'-fill'.length) : name
  const normalized = normalizeShared(mapleRenames.get(base) ?? base)
  return fill ? `${normalized}-fill` : normalized
}

async function walk(root) {
  const entries = await readdir(root, { withFileTypes: true })
  return (
    await Promise.all(
      entries.map((entry) => {
        const path = resolve(root, entry.name)
        return entry.isDirectory() ? walk(path) : path.endsWith('.svg') ? [path] : []
      }),
    )
  ).flat()
}

async function collect(root, kind) {
  const files = await walk(root)
  const rawNames = new Set(files.map((file) => basename(file, '.svg')))
  const icons = new Map()

  for (const file of files.sort()) {
    const oldName = basename(file, '.svg')
    let newName
    if (kind === 'maple' && oldName.endsWith('-outline')) {
      newName = normalizeMapleBase(oldName.slice(0, -'-outline'.length))
    } else if (kind === 'maple' && rawNames.has(`${oldName}-outline`)) {
      newName = `${normalizeMapleBase(oldName)}-fill`
    } else {
      newName = kind === 'maple' ? normalizeMapleBase(oldName) : normalizeShared(oldName)
    }
    if (icons.has(newName)) {
      const existing = icons.get(newName)
      const preferMappedMapleSource = kind === 'maple' && oldName !== newName && existing.oldName === newName
      if (!preferMappedMapleSource) continue
    }
    const category = kind === 'cedar' ? dirname(relative(root, file)) : '.'
    icons.set(newName, { file, oldName, category })
  }
  return { icons }
}

async function materialize(root, own, fallback, fallbackCategory) {
  const temporary = `${root}.normalized`
  await rm(temporary, { recursive: true, force: true })
  await mkdir(temporary, { recursive: true })
  const names = new Set([...own.keys(), ...fallback.keys()])
  for (const name of [...names].sort()) {
    const source = own.get(name) ?? fallback.get(name)
    const category = own.has(name) ? source.category : fallbackCategory
    const target = resolve(temporary, category === '.' ? '' : category, `${name}.svg`)
    await mkdir(dirname(target), { recursive: true })
    await cp(source.file, target)
  }
  await rm(root, { recursive: true, force: true })
  await rename(temporary, root)
}

const maple = await collect(mapleRoot, 'maple')
const cedar = await collect(cedarRoot, 'cedar')
await materialize(mapleRoot, maple.icons, cedar.icons, '.')
await materialize(cedarRoot, cedar.icons, maple.icons, 'supplemental/maple')

console.log(`Maple: ${maple.icons.size} native, ${new Set([...maple.icons.keys(), ...cedar.icons.keys()]).size} total`)
console.log(`Cedar: ${cedar.icons.size} native, ${new Set([...maple.icons.keys(), ...cedar.icons.keys()]).size} total`)
