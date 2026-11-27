export interface SourceData { name: string; rawCode: string; highlightCode: string }
const requests = new Map<string, Promise<SourceData>>()

export function loadSource(url: string): Promise<SourceData> {
  const existing = requests.get(url)
  if (existing) return existing
  const pending = fetch(url).then(async response => {
    if (!response.ok) throw new Error(`Source request failed: ${response.status}`)
    return response.json() as Promise<SourceData>
  }).catch(error => {
    if (requests.get(url) === pending) requests.delete(url)
    throw error
  })
  if (requests.size >= 32) requests.delete(requests.keys().next().value!)
  requests.set(url, pending)
  return pending
}
