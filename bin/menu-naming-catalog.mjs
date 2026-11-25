// Comparison catalogs contain upstream source names, not only this library's APIs.
// Remove only verified source coordinates from the two generated catalogs.
function upstreamSource(value, library) {
  if (!value || typeof value !== 'object' || typeof library !== 'string') return undefined
  if (/cedar|maple/i.test(library) || typeof value.url !== 'string') return undefined
  const match = /^https:\/\/github\.com\/([^/]+\/[^/]+)\/(?:blob|tree)\/([a-f0-9]{40})\/(.+)$/.exec(value.url)
  if (!match || /cedar-design|maple-design/i.test(match[1])) return undefined
  return { repository: match[1], path: match[3] }
}
function sourceRecord(value, library, repository) {
  const source = upstreamSource(value, library)
  if (!source || (repository && repository !== source.repository)) return value
  const result = { ...value }
  delete result.url
  if (result.file === source.path) {
    const filename = source.path
      .split('/')
      .at(-1)
      .replace(/\.[^.]+$/, '')
    delete result.file
    if (result.title === filename) delete result.title
  }
  return result
}
export function catalogNamingText(text) {
  const catalog = JSON.parse(text)
  for (const component of catalog.components ?? []) {
    component.references = component.references?.map((reference) => {
      const result = sourceRecord(reference, reference.library)
      const source = upstreamSource(reference, reference.library)
      if (source && result.samples) {
        result.samples = result.samples.map((sample) =>
          sourceRecord(sample, sample.library ?? reference.library, source.repository),
        )
      }
      return result
    })
    for (const point of component.featurePoints ?? []) {
      point.evidence = point.evidence?.map((evidence) => sourceRecord(evidence, evidence.library))
    }
  }
  return JSON.stringify(catalog)
}
