import path from 'node:path'
import { fileURLToPath } from 'node:url'

const write = process.argv.includes('--write')
function priority(file) {
  const name = path.basename(file, '.vue')
  if (/^(basic(?:-usage)?|example)$/.test(name)) return 0
  if (/^(size|variant|variants|status|state|disabled|readonly)$/.test(name)) return 1
  if (/lifecycle|review|workbench|race|regression|async|concurr|aggregate/.test(name)) return 4
  if (/presentation|slots|range-boundar/.test(name)) return 3
  return 2
}
export function organizeSections(source, sharedOrder = []) {
  // A missing newline must not turn the next example heading into a table cell.
  source = source.replace(/^(\|[^\n]*\|)(#{2,6} .+)$/gm, '$1\n\n$2')
  const boundary = /^## (?:API|属性|Props)\s*$/m.exec(source)
  if (!boundary) return source
  let examples = source.slice(0, boundary.index)
  const first = /^##(?:#)? /m.exec(examples)
  if (!first) return source
  const prefix = examples.slice(0, first.index)
  const demo = (chunk) => /<demo\s+src="([^"]+)"|```demo\s*\n([^\n]+)/.exec(chunk)
  const sortChapter = (content) => {
    content = content.trimStart()
    const chunks = content.split(/(?=^### )/m).filter((chunk) => chunk.trim())
    let intro = ''
    const cases = []
    for (const chunk of chunks) {
      // Keep explanation-only headings attached to the preceding case, rather
      // than abandoning the whole page or moving prose away from its example.
      if (demo(chunk)) cases.push(chunk)
      else if (cases.length) cases[cases.length - 1] = cases[cases.length - 1].trimEnd() + '\n\n' + chunk.trimStart()
      else intro += chunk
    }
    const rank = (chunk) =>
      /^### (?:基础|基本|最简单|Basic|Simplest)/im.test(chunk) ? 0 : priority(demo(chunk)[1] ?? demo(chunk)[2])
    const sharedRank = (chunk) => {
      const match = demo(chunk)
      const index = sharedOrder.indexOf(path.basename(match[1] ?? match[2], '.vue'))
      return index < 0 ? sharedOrder.length : index
    }
    cases.sort((a, b) => rank(a) - rank(b) || sharedRank(a) - sharedRank(b))
    return [intro, ...cases]
      .filter((chunk) => chunk.trim())
      .map((chunk) => chunk.trimEnd())
      .join('\n\n')
  }
  const chapters = examples
    .slice(first.index)
    .split(/(?=^## )/m)
    .filter((chunk) => chunk.trim())
  const main = [],
    others = []
  for (const chapter of chapters) {
    const heading = /^## (.+)\n/.exec(chapter)
    if (!heading || /^(案例|示例|Examples|Demos)$/.test(heading[1].trim()))
      main.push(heading ? chapter.slice(heading[0].length) : chapter)
    else others.push(heading[0].trimEnd() + '\n\n' + sortChapter(chapter.slice(heading[0].length)))
  }
  const english = /^## (?:Examples|Demos)/m.test(examples) || /^### (?:Introduction|Basic)/m.test(examples)
  const body = [
    main.length ? `## ${english ? 'Examples' : '案例'}\n\n${sortChapter(main.join('\n\n'))}` : '',
    ...others,
  ]
    .filter(Boolean)
    .join('\n\n')
  return prefix + body.trimEnd() + '\n\n' + source.slice(boundary.index)
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { organizeLibraryDocs } = await import('./organize-component-showcase.mjs')
  const report = organizeLibraryDocs({ write })
  console.log(JSON.stringify(report, null, 2))
  if (!write && report.changed) process.exitCode = 1
}
