import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { cleanPublicDocumentation } from './clean-public-component-docs.mjs'
import { cedarDemoFamily, demoRefs, groupDemoSections } from './group-demo-sections.mjs'
import { documentationFiles, normalizeApiHeadings } from './normalize-api-headings.mjs'
import { generatedVariables, publicDocumentIssues } from './public-documentation-policy.mjs'

const workspace = fileURLToPath(new URL('../../', import.meta.url))
const config = Object.fromEntries(
  ['cedar', 'maple'].map((platform) => [
    platform,
    JSON.parse(
      fs.readFileSync(
        new URL(`../configs/demo-groups${platform === 'maple' ? '.maple' : ''}.json`, import.meta.url),
        'utf8',
      ),
    ),
  ]),
)
export function reviewPublicDocuments({ write = false } = {}) {
  const changes = [],
    issues = []
  let checked = 0
  for (const { filename, primary, relative, platform } of documentationFiles()) {
    const before = fs.readFileSync(filename, 'utf8')
    const family =
      platform === 'cedar' ? cedarDemoFamily(relative) : relative.replace(/\/docs\/(?:zh-CN|en-US)\.md$/, '')
    let next = cleanPublicDocumentation(before, { primary }).text
    next = normalizeApiHeadings(next, primary)
    next = groupDemoSections(next, config[platform][family], /en-US/.test(filename))
    const refs = (text) => demoRefs(text).sort().join('\n')
    if (refs(before) !== refs(next))
      throw new Error('Public documentation must preserve all runnable examples: ' + filename)
    for (const issue of publicDocumentIssues(next)) issues.push({ file: path.relative(workspace, filename), issue })
    checked++
    if (next !== before) {
      changes.push({
        file: path.relative(workspace, filename),
        before: before.replace(generatedVariables, '<!-- generated variable reference omitted from archive -->'),
        afterSha256: createHash('sha256').update(next).digest('hex'),
      })
      if (write) fs.writeFileSync(filename, next)
    }
  }
  if (write && changes.length) {
    const archive = path.join(workspace, 'design-ui/audits/evidence/public-doc-structure-2026-11-09.json')
    fs.mkdirSync(path.dirname(archive), { recursive: true })
    const previous = fs.existsSync(archive) ? JSON.parse(fs.readFileSync(archive, 'utf8')) : []
    fs.writeFileSync(archive, JSON.stringify([...previous, ...changes], null, 2) + '\n')
  }
  return { checked, changed: changes.length, files: changes.map((row) => row.file), issues }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const write = process.argv.includes('--write')
  const result = reviewPublicDocuments({ write })
  console.log(JSON.stringify(result, null, 2))
  if (result.issues.length || (!write && result.changed)) process.exitCode = 1
}
