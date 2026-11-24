import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { inventoryDemoContent } from './inventory-demo-content.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))
const current = inventoryDemoContent()
const baseline = JSON.parse(fs.readFileSync(path.join(root, 'design-ui/audits/demo-content-before-2026-10-28.json')))
const plans = JSON.parse(fs.readFileSync(path.join(root, 'design-ui/configs/demo-content-consolidation.json')))
const rows = current.map((row) => {
  const before = baseline.find((item) => item.platform === row.platform && item.family === row.family)
  const actions = plans.filter((plan) => plan.platform === row.platform && plan.family === row.family)
  return {
    platform: row.platform,
    family: row.family,
    document: row.document,
    before: before.entries.length,
    after: row.entries.length,
    disposition: actions.length ? 'consolidated' : 'retained-distinct-scenarios',
    merges: actions.map((plan) => ({
      into: plan.into,
      retired: plan.cases.filter((name) => name !== plan.into),
      mode: plan.mode,
    })),
    groups: row.groups,
    scenarios: row.entries.map((entry) => ({
      name: entry.name,
      file: entry.file,
      sha256: entry.sha256,
      configuration: entry.props,
      events: entry.events,
      components: entry.tags.filter((tag) => /^(c|mp)-/.test(tag)),
      retainedFor: /appearance-lab/.test(entry.name)
        ? 'Compare one visual axis while sharing content and value.'
        : /state-lab/.test(entry.name)
          ? 'Switch target state and recover using independently enabled controls.'
          : /label-width-comparison/.test(entry.name)
            ? 'Switch automatic, responsive and fixed label sizing with one persistent form model.'
            : /indicator-comparison/.test(entry.name)
              ? 'Compare indicator types and positions using one active-slide model.'
              : row.family === 'steps' && entry.name === 'types'
                ? 'Compare four step types using one current-step model and one status model; localize labels to fit the phone viewport.'
                : actions.some((plan) => plan.into === entry.name)
                  ? 'Related configurations share a source-backed comparison; original independent event models remain isolated where required.'
                  : entry.events.length
                    ? `Preserves the ${entry.name} workflow and its ${entry.events.join(', ')} event contracts.`
                    : entry.props.length
                      ? `Preserves the ${entry.name} scenario using ${entry.props.join(', ')}; it is not a redundant visual preset.`
                      : `Preserves the ${entry.name} composition or platform-specific guidance.`,
    })),
  }
})
const report = {
  date: '2026-10-28',
  families: rows.length,
  consolidatedFamilies: rows.filter((row) => row.merges.length).length,
  before: rows.reduce((n, r) => n + r.before, 0),
  after: rows.reduce((n, r) => n + r.after, 0),
  scope:
    'All authored example families. Browser layout coverage and representative interaction evidence are recorded separately; source review is not a claim that every event was manually exercised.',
  rows,
}
const file = path.join(root, 'design-ui/audits/demo-content-review-2026-10-28.json')
if (process.argv.includes('--write')) fs.writeFileSync(file, JSON.stringify(report, null, 2) + '\n')
console.log(
  JSON.stringify({
    families: report.families,
    consolidatedFamilies: report.consolidatedFamilies,
    before: report.before,
    after: report.after,
  }),
)
