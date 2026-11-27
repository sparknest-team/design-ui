import { fs, path, warn } from 'vuepress/utils'
import { highlight, scanImports, resolve } from '../utils/index.js'
import type { CodeSource } from '../../shared/index.js'
import type { App } from '@vuepress/core'
import { readInitialSource } from '../utils/initial-source-reads.js'

export interface FileCodeSource extends CodeSource { filePath: string }

export const readSource = (filePath: string, scanImport?: boolean, noLineNumbers?: boolean, deferHighlight = false, app?: App): FileCodeSource[] => {
  const sources: FileCodeSource[] = []

  const source = readFileSource(filePath, noLineNumbers, deferHighlight, app)
  sources.push(source)

  if (scanImport) {
    parseImports(source.rawCode, path.dirname(filePath), sources, noLineNumbers, deferHighlight, app)
  }

  return sources
}

export const parseImports = (rawCode: string, dirPath: string, sources: FileCodeSource[], noLineNumbers: boolean, deferHighlight = false, app?: App) => {
  const imports = scanImports(rawCode)

  for (const mod of imports) {
    if (mod.startsWith('.')) {
      const filePath = resolve(dirPath, mod)
      if (filePath && !sources.some((source) => source.filePath === filePath)) {
        const source = readFileSource(filePath, noLineNumbers, deferHighlight, app)
        sources.push(source)
        // Include shared example assets without traversing library implementations.
        if (filePath.split(path.sep).includes('__demos__')) {
          parseImports(source.rawCode, path.dirname(filePath), sources, noLineNumbers, deferHighlight, app)
        }
      }
    }
  }
}

export const readFileSource = (filePath: string, noLineNumbers: boolean, deferHighlight = false, app?: App): FileCodeSource => {
  const name = path.basename(filePath)

  const read = () => {
    try { return fs.readFileSync(filePath, 'utf-8') }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      warn('not exists path:' + filePath)
      return ''
    }
  }
  const code = app ? readInitialSource(app, filePath, read) : read()

  return {
    name,
    filePath,
    rawCode: code,
    highlightCode: deferHighlight ? '' : highlight(code, path.extname(name).slice(1), noLineNumbers),
  }
}
