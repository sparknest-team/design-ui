import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { basename, dirname, resolve } from 'node:path'
import { optimize } from 'svgo'

const pascalCase = (value) => value.split(/[-_\s]+/).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('')

async function svgFiles(root) {
  const entries = await readdir(root, { withFileTypes: true })
  return (await Promise.all(entries.map(async (entry) => {
    const path = resolve(root, entry.name)
    return entry.isDirectory() ? svgFiles(path) : path.endsWith('.svg') ? [path] : []
  }))).flat().sort()
}

function componentSource({ classPrefix, runtimeName, svg }) {
  return `<template>\n  ${svg}\n</template>\n\n<script setup lang="ts">\nimport { computed, type CSSProperties } from 'vue'\n\ndefineOptions({ name: '${runtimeName}' })\n\nconst props = defineProps<{ size?: string | number; color?: string; rotate?: number; spin?: boolean; title?: string }>()\nconst emit = defineEmits<{ click: [event: MouseEvent] }>()\nconst style = computed<CSSProperties>(() => ({\n  width: '1em',\n  height: '1em',\n  flexShrink: 0,\n  color: props.color,\n  fontSize: typeof props.size === 'number' ? \`\${props.size}px\` : props.size,\n  transform: props.rotate ? \`rotate(\${props.rotate}deg)\` : undefined,\n}))\n</script>\n`
}

function componentIndex({ componentName, fileName }) {
  return `import type { App } from 'vue'\nimport _${componentName} from './${fileName}.vue'\n\nexport const ${componentName} = Object.assign(_${componentName}, {\n  install(app: App) { app.component(_${componentName}.name, _${componentName}) },\n})\n`
}

export async function generateVueIcons({
  svgRoot,
  sourceRoot,
  exportPrefix = '',
  runtimePrefix = '',
  classPrefix = 'ui-icon',
  check = false,
}) {
  const expected = new Map()
  const icons = []
  const names = new Map()

  for (const path of await svgFiles(svgRoot)) {
    const source = await readFile(path, 'utf8')
    const rootUsesNoFill = /<svg\b[^>]*\bfill=["']none["']/i.test(source)
    const rawName = basename(path, '.svg')
    const fileName = `icon-${rawName}`
    const componentName = `${exportPrefix}${pascalCase(rawName)}`
    const runtimeName = `${runtimePrefix}${componentName}`
    if (names.has(componentName)) throw new Error(`Duplicate icon ${componentName}: ${names.get(componentName)} and ${path}`)
    names.set(componentName, path)
    const result = optimize(source, {
      path,
      plugins: [
        { name: 'preset-default', params: { overrides: { removeViewBox: false } } },
        'removeDimensions',
        { name: 'removeAttrs', params: { attrs: ['class', 'style', 'fill'] } },
        { name: 'addAttributesToSVGElement', params: { attributes: [
          { ':class': `['${classPrefix}', { '${classPrefix}--spin': props.spin }]` },
          { ':style': 'style' }, { fill: rootUsesNoFill ? 'none' : 'currentColor' }, { ':aria-hidden': '!props.title' },
          { role: 'img' }, { '@click': `emit('click', $event)` },
        ] } },
      ],
    })
    const svg = result.data.replace(/<svg([^>]*)>/, `<svg$1><title v-if="props.title">{{ props.title }}</title>`)
    icons.push({ fileName, componentName })
    expected.set(`${fileName}/${fileName}.vue`, componentSource({ classPrefix, runtimeName, svg }))
    expected.set(`${fileName}/index.ts`, componentIndex({ componentName, fileName }))
  }

  expected.set('index.ts', `export const iconNames = ${JSON.stringify(icons.map(({ fileName }) => fileName.slice(5)))} as const\n${icons.map(({ fileName, componentName }) => `export { ${componentName} } from './${fileName}'`).join('\n')}\n`)
  expected.set('icons.json', `${JSON.stringify(icons, null, 2)}\n`)
  const stale = []
  for (const [target, content] of expected) {
    const path = resolve(sourceRoot, target)
    if (check) {
      try { if (await readFile(path, 'utf8') !== content) stale.push(target) } catch { stale.push(target) }
    } else {
      await mkdir(dirname(path), { recursive: true })
      await writeFile(path, content)
    }
  }

  const expectedDirs = new Set(icons.map(({ fileName }) => fileName))
  try {
    for (const entry of await readdir(sourceRoot, { withFileTypes: true })) {
      if (entry.isDirectory() && entry.name.startsWith('icon-') && !expectedDirs.has(entry.name)) {
        if (check) stale.push(entry.name)
        else await rm(resolve(sourceRoot, entry.name), { recursive: true, force: true })
      }
    }
  } catch (error) {
    if (check || error?.code !== 'ENOENT') throw error
  }
  if (stale.length) throw new Error(`Generated icon sources are stale:\n${stale.join('\n')}`)
  return { iconCount: icons.length, fileCount: expected.size }
}
