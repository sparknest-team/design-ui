import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { basename, dirname, relative, resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import less from 'less'
import { build } from 'vite'
import { collectModuleEntries } from './module-entries.mjs'
import { libraryDefines } from './environment.mjs'
import { browserTargets } from './browser-targets.mjs'
import { downlevelVueDeclarations } from './vue-declarations.mjs'
export { browserTargets } from './browser-targets.mjs'
export { downlevelVueDeclarations } from './vue-declarations.mjs'

export function defineConfig(config) {
  return config
}

async function walk(root) {
  const entries = await readdir(root, { withFileTypes: true })
  return (await Promise.all(entries.map(async (entry) => {
    const path = resolve(root, entry.name)
    return entry.isDirectory() ? walk(path) : [path]
  }))).flat()
}

function run(binary, args, cwd) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(binary, args, { cwd, stdio: 'inherit' })
    child.on('error', reject)
    child.on('exit', (code) => code === 0
      ? resolvePromise()
      : reject(new Error(`${binary} exited with code ${code}`)))
  })
}

function ignoreVueStylePlugin() {
  return {
    name: 'loca-ignore-vue-style',
    transform(_code, id) {
      if (id.includes('type=style')) {
        return 'export default {}'
      }
    },
  }
}

function styleImportPlugin() {
  return {
    name: 'loca-style-import',
    transform(code, id) {
      if (!/\.(?:[cm]?[jt]sx?|vue)$/.test(id)) return
      return code.replace(/((?:import|from)\s*['"][^'"]+)\.less(['"])/g, '$1.css$2')
    },
  }
}

function externalMatcher(externals) {
  return (id) => {
    if (/\.(?:css|less|scss|sass)$/.test(id)) return true
    return externals.some((name) => id === name || id.startsWith(`${name}/`))
  }
}

function isSkippedSource(path) {
  return /(?:^|\/)(?:example|__tests__|docs)(?:\/|$)/.test(path.replaceAll('\\', '/'))
}

async function renderLessFile(path) {
  const source = await readFile(path, 'utf8')
  const { css } = await less.render(source, { filename: path, javascriptEnabled: true })
  return css
}

function extractVueStyleBlocks(source) {
  const blocks = []
  const re = /<style\b([^>]*)>([\s\S]*?)<\/style>/g
  for (const match of source.matchAll(re)) {
    blocks.push({ attrs: match[1] ?? '', content: match[2] ?? '' })
  }
  return blocks
}

async function compileVueSfcStyles({ root, sourceDir, outputs, cssVariables }) {
  const sourceRoot = resolve(root, sourceDir)
  const sourceFiles = (await walk(sourceRoot)).filter((path) => path.endsWith('.vue') && !isSkippedSource(relative(sourceRoot, path)))

  for (const sourcePath of sourceFiles) {
    const source = await readFile(sourcePath, 'utf8')
    const blocks = extractVueStyleBlocks(source)
    const rel = relative(sourceRoot, sourcePath).replaceAll('\\', '/')
    const name = basename(sourcePath, '.vue')
    const dir = dirname(rel)

    for (const [index, block] of blocks.entries()) {
      const lang = /\blang\s*=\s*['"]([^'"]+)['"]/.exec(block.attrs)?.[1] ?? 'css'
      const fileName = index === 0 ? `${name}.css` : `${name}-${index}.css`
      const target = dir === '.' ? fileName : `${dir}/${fileName}`
      let css = block.content
      if (lang === 'less') {
        const rendered = await less.render(block.content, {
          filename: sourcePath,
          javascriptEnabled: true,
        })
        css = rendered.css
      }
      await Promise.all(outputs.map(async (output) => {
        await mkdir(dirname(resolve(root, output, target)), { recursive: true })
        await writeFile(resolve(root, output, target), css)
      }))
    }
  }
}

async function rewriteComponentStyleEntries({ root, cssVariables }) {
  const skip = new Set(['styles', 'style'])
  const esRoot = resolve(root, 'es')
  if (!existsSync(esRoot)) {
    return
  }
  const dirs = (await readdir(esRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && !skip.has(entry.name))

  await Promise.all(dirs.map(async (entry) => {
    const dirRoot = resolve(esRoot, entry.name)
    const cssFiles = (await walk(dirRoot)).filter((path) => {
      const rel = relative(dirRoot, path).replaceAll('\\', '/')
      return path.endsWith('.css') && !rel.startsWith('style/')
    })
    if (!cssFiles.length) {
      return
    }
    const specs = cssFiles.map((path) => `../${relative(dirRoot, path).replaceAll('\\', '/')}`)
    const lines = specs.map((spec) => `import '${spec}'`)
    if (cssVariables) {
      lines.unshift(`import '../../${cssVariables.replace(/\.less$/, '.css')}'`)
    }
    const esCode = `${lines.join('\n')}\n`
    const cjsCode = esCode.replace(/^import '([^']+)'$/gm, "require('$1')")
    await Promise.all([
      mkdir(resolve(root, 'es', entry.name, 'style'), { recursive: true }),
      mkdir(resolve(root, 'lib', entry.name, 'style'), { recursive: true }),
    ])
    await writeFile(resolve(root, 'es', entry.name, 'style', 'index.mjs'), esCode)
    await writeFile(resolve(root, 'lib', entry.name, 'style', 'index.js'), cjsCode)
  }))
}

/**
 * Aggregate foundation + every component style/index.less into one CSS string (no physical index.less).
 */
async function renderAggregatedLibraryCss(sourceRoot) {
  const foundation = 'style/index.less'
  const foundationPath = resolve(sourceRoot, foundation)
  const sourceFiles = await walk(sourceRoot)
  const styleLess = sourceFiles
    .map((path) => relative(sourceRoot, path).replaceAll('\\', '/'))
    .filter((rel) => /(?:^|\/)style\/index\.less$/.test(rel) && rel !== foundation)
    .sort()

  if (!existsSync(foundationPath) && !styleLess.length) {
    return null
  }

  const lines = []
  const seen = new Set()
  const collect = async (path) => {
    if (seen.has(path) || !existsSync(path)) return
    seen.add(path)
    if (path.endsWith('.css')) {
      lines.push(`@import (inline) ${JSON.stringify(path)};`)
      return
    }
    if (path.endsWith('.less')) {
      lines.push(`@import "./${relative(sourceRoot, path).replaceAll('\\', '/')}";`)
      return
    }
    const source = await readFile(path, 'utf8')
    for (const match of source.matchAll(/import\s+['"]([^'"]+)['"]/g)) {
      if (!match[1].startsWith('.') && !match[1].endsWith('.css')) continue
      const target = match[1].startsWith('.')
        ? resolve(dirname(path), match[1])
        : createRequire(path).resolve(match[1])
      await collect(/\.(?:less|css|ts)$/.test(target) ? target : resolve(target, 'index.ts'))
    }
  }
  if (existsSync(foundationPath)) {
    await collect(foundationPath)
  }
  // Match on-demand dependency order in the full-library entry as well.
  for (const entry of sourceFiles.filter(path => /\/style\/index\.ts$/.test(path.replaceAll('\\', '/'))).sort()) {
    await collect(entry)
  }
  for (const rel of styleLess) {
    await collect(resolve(sourceRoot, rel))
  }

  const { css } = await less.render(lines.join('\n'), {
    // Anchor relative @imports at sourceRoot without writing a real index.less.
    filename: resolve(sourceRoot, 'index.less'),
    javascriptEnabled: true,
  })
  return css
}

async function compileStyles(config) {
  const { root, sourceDir, outputs, bundleName, vueSfcStyles, cssVariables } = config
  const sourceRoot = resolve(root, sourceDir)
  const sourceFiles = await walk(sourceRoot)
  const files = new Set()
  // Foundation only (normalize / tokens / utilities). Not the full library CSS.
  const foundationStyle = resolve(sourceRoot, 'style/index.less')
  // Optional hand-written full entry; when absent, styles are auto-aggregated.
  const fullCssEntry = resolve(sourceRoot, config.fullCssEntry ?? 'index.less')
  if (existsSync(foundationStyle)) {
    files.add(foundationStyle)
  }
  if (cssVariables) {
    const cssVariablesPath = resolve(sourceRoot, cssVariables)
    if (existsSync(cssVariablesPath)) {
      files.add(cssVariablesPath)
    }
  }
  const styleEntries = sourceFiles.filter((path) => /\/style\/index\.ts$/.test(path.replaceAll('\\', '/')))

  for (const sourcePath of sourceFiles.filter((path) => /\.(?:[cm]?[jt]sx?|vue)$/.test(path) && !isSkippedSource(relative(sourceRoot, path)))) {
    const source = await readFile(sourcePath, 'utf8')
    for (const match of source.matchAll(/(?:import|from)\s*['"]([^'"]+\.less)['"]/g)) {
      files.add(resolve(dirname(sourcePath), match[1]))
    }
  }

  await Promise.all([...files].map(async (path) => {
    if (!existsSync(path)) {
      return
    }
    const css = await renderLessFile(path)
    const target = relative(sourceRoot, path).replace(/\.less$/, '.css')
    await Promise.all(outputs.map(async (output) => {
      await mkdir(dirname(resolve(root, output, target)), { recursive: true })
      await writeFile(resolve(root, output, target), css)
    }))
  }))

  await Promise.all(styleEntries.map(async (entry) => {
    const styleDir = dirname(entry)
    const targetDir = relative(sourceRoot, styleDir)
    // Keep the source side-effect graph: shared CSS must remain separate modules.
    const source = await readFile(entry, 'utf8')
    const imports = [...new Set([...source.matchAll(/import\s+['"]([^'"]+)['"]/g)]
      .map((match) => match[1].replace(/\.less$/, '.css')))]
    const resolveImport = (specifier, extension) => {
      if (specifier.startsWith('.') && existsSync(resolve(styleDir, specifier, 'index.ts'))) {
        return `${specifier}/index.${extension}`
      }
      return specifier.replace(/\.ts$/, `.${extension}`)
    }
    const esCode = imports.length ? imports.map((s) => `import '${resolveImport(s, 'mjs')}'\n`).join('') : 'export {}\n'
    const cjsCode = imports.length ? imports.map((s) => `require('${resolveImport(s, 'js')}')\n`).join('') : "'use strict'\n"
    await Promise.all([
      mkdir(resolve(root, 'es', targetDir), { recursive: true }),
      mkdir(resolve(root, 'lib', targetDir), { recursive: true }),
    ])
    await Promise.all([
      writeFile(resolve(root, 'es', targetDir, 'index.mjs'), esCode),
      writeFile(resolve(root, 'lib', targetDir, 'index.js'), cjsCode),
    ])
  }))

  if (vueSfcStyles) {
    await compileVueSfcStyles(config)
    await rewriteComponentStyleEntries(config)
  }

  let bundleCss = null
  if (existsSync(fullCssEntry)) {
    bundleCss = await renderLessFile(fullCssEntry)
  } else {
    bundleCss = await renderAggregatedLibraryCss(sourceRoot)
  }
  if (bundleCss == null) {
    const cssFiles = (await walk(resolve(root, 'es'))).filter((path) => path.endsWith('.css') && !path.endsWith(`${bundleName}.css`))
    bundleCss = (await Promise.all(cssFiles.map((path) => readFile(path, 'utf8')))).join('\n')
  }

  await Promise.all(outputs.map(async (output) => {
    await mkdir(resolve(root, output), { recursive: true })
    await writeFile(resolve(root, output, `${bundleName}.css`), bundleCss)
  }))
}

function vitePlugins(config) {
  return [vue(), vueJsx(), styleImportPlugin(), ...(config.vueSfcStyles ? [ignoreVueStylePlugin()] : [])]
}

async function buildModules(config, format, outDir, extension) {
  const root = resolve(config.root)
  await build({
    root,
    configFile: false,
    define: libraryDefines(format),
    logLevel: 'warn',
    plugins: vitePlugins(config),
    build: {
      target: [...browserTargets],
      cssTarget: [...browserTargets],
      copyPublicDir: false,
      emptyOutDir: false,
      minify: false,
      outDir,
      rollupOptions: {
        input: await collectModuleEntries(root, config.sourceDir, config.entry),
        external: externalMatcher(config.external),
        preserveEntrySignatures: 'strict',
        output: {
          format,
          preserveModules: true,
          preserveModulesRoot: resolve(root, config.sourceDir),
          entryFileNames: `[name].${extension}`,
          exports: 'named',
        },
      },
    },
  })
}

// A published library must not ship bundler-private helpers. Vite's module
// preload injection is the known offender: it emits `_virtual/preload-helper`
// and rewrites every dynamic `import()` into `__vitePreload(...)`. When a
// consumer bundles the library with rolldown (vite 8), rolldown injects its own
// helper into the same module -> `PARSE_ERROR: Identifier __vitePreload has
// already been declared`. `build.modulePreload: false` does NOT prevent this on
// vite 5 (insertPreload only checks ssr / build.lib / isWorker), so the fix has
// to happen in the library source: ship a static import (externalized) instead
// of a dynamic one.
async function assertNoBundlerHelpers(config) {
  const root = resolve(config.root)
  const markers = ['_virtual/preload-helper', '__vitePreload']
  const offenders = []
  for (const output of ['es', 'lib']) {
    const dir = resolve(root, output)
    if (!existsSync(dir)) continue
    for (const path of await walk(dir)) {
      if (!/\.[cm]?js$/.test(path)) continue
      const code = await readFile(path, 'utf8')
      if (markers.some((marker) => code.includes(marker))) {
        offenders.push(relative(root, path))
      }
    }
  }
  if (offenders.length) {
    throw new Error([
      'Library output contains bundler-private preload helpers; consumers bundling with rolldown/vite 8 cannot parse them:',
      ...offenders.map((path) => `  ${path}`),
      'Replace the dynamic import() in the matching source file with a static import and mark the module external.',
    ].join('\n'))
  }
}

async function buildBundle(config, format, outDir, fileName) {
  const root = resolve(config.root)
  await build({
    root,
    configFile: false,
    define: libraryDefines(format),
    logLevel: 'warn',
    plugins: vitePlugins(config),
    build: {
      target: [...browserTargets],
      cssTarget: [...browserTargets],
      copyPublicDir: false,
      emptyOutDir: false,
      // vite 8 (rolldown) dropped esbuild from its own dependencies; naming the
      // `'esbuild'` minifier requires installing esbuild separately. `true` selects
      // the bundler's default minifier (oxc on vite 8).
      minify: format === 'cjs',
      outDir,
      lib: {
        entry: resolve(root, config.entry),
        name: config.globalName,
        formats: [format],
        fileName: () => fileName,
      },
      rollupOptions: {
        external: externalMatcher(format === 'umd' ? config.umdExternal : config.external),
        output: { exports: 'named', globals: config.globals },
      },
    },
  })
}

async function assertOutputs(config) {
  const root = resolve(config.root)
  const required = [
    'es/index.mjs',
    `es/${config.bundleName}.esm.js`,
    `es/${config.bundleName}.css`,
    `lib/${config.bundleName}.cjs.js`,
    `umd/${config.bundleName}.js`,
  ]
  if (config.emitTypes !== false) {
    required.push('types/index.d.ts')
  }
  const missing = []
  for (const path of required) {
    try { await readFile(resolve(root, path)) } catch { missing.push(path) }
  }
  if (missing.length) throw new Error(`Missing build outputs:\n${missing.join('\n')}`)
}

export async function buildLibrary(userConfig) {
  // A custom NODE_ENV makes Vite compile development-only Vue branches into a
  // release. Reject it before cleaning any existing output, rather than silently
  // mutating the environment of another build in the same process.
  if (process.env.NODE_ENV && process.env.NODE_ENV !== 'production') {
    throw new Error('buildLibrary requires NODE_ENV=production (or unset); custom compile/test modes are not release builds')
  }
  const config = {
    sourceDir: 'src',
    entry: 'src/index.ts',
    external: ['vue'],
    globals: { vue: 'Vue' },
    umdExternal: ['vue'],
    tsconfig: 'tsconfig.build.json',
    emitTypes: true,
    vueSfcStyles: false,
    // Optional. When missing, full `{bundleName}.css` is auto-aggregated from **/style/index.less.
    fullCssEntry: 'index.less',
    ...userConfig,
  }
  config.root = resolve(config.root ?? process.cwd())

  const cleanDirs = config.emitTypes === false ? ['es', 'lib', 'umd'] : ['es', 'lib', 'umd', 'types']
  for (const dir of cleanDirs) {
    await rm(resolve(config.root, dir), {
      recursive: true,
      force: true,
      maxRetries: 3,
      retryDelay: 100,
    })
  }

  await buildModules(config, 'es', 'es', 'mjs')
  await buildModules(config, 'cjs', 'lib', 'js')
  await assertNoBundlerHelpers(config)
  await buildBundle(config, 'es', 'es', `${config.bundleName}.esm.js`)
  await buildBundle(config, 'cjs', 'lib', `${config.bundleName}.cjs.js`)
  await buildBundle(config, 'umd', 'umd', `${config.bundleName}.js`)
  await compileStyles({ ...config, outputs: ['es', 'lib', 'umd'] })
  if (config.emitTypes !== false) {
    await run('vue-tsc', ['-p', config.tsconfig], config.root)
    if (existsSync(resolve(config.root, '../../node_modules/vue-compat-min/package.json'))) {
      downlevelVueDeclarations(config.root, 'types', createRequire(resolve(config.root, 'package.json'))('typescript'))
    }
  }

  await assertOutputs(config)
}
