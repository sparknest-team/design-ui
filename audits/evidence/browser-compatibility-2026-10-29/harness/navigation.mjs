import { performance } from 'node:perf_hooks'

const observers = new WeakMap()

// Record outside the renderer: evaluating the DOM after a timeout can miss the
// exact pending request, or hang again when the main thread itself is blocked.
export function observeNavigation(page) {
  if (observers.has(page)) return observers.get(page)
  let started = performance.now(), target, requests = new Map(), events = []
  const elapsed = () => Math.round(performance.now() - started)
  page.on('request', (request) => {
    if (/^https?:/.test(request.url())) requests.set(request, {
      url: request.url(), type: request.resourceType(), startedMs: elapsed(),
    })
  })
  page.on('response', (response) => {
    const item = requests.get(response.request())
    if (item) item.status = response.status()
  })
  page.on('requestfinished', (request) => {
    const item = requests.get(request)
    if (item) item.finishedMs = elapsed()
  })
  page.on('requestfailed', (request) => {
    const item = requests.get(request)
    if (item) Object.assign(item, { finishedMs: elapsed(), error: request.failure()?.errorText })
  })
  for (const name of ['domcontentloaded', 'load']) page.on(name, () => events.push({ name, elapsedMs: elapsed() }))
  const observer = {
    begin(url) {
      started = performance.now()
      target = url
      requests = new Map()
      events = []
    },
    snapshot() {
      const all = [...requests.values()].map((item) => ({ ...item }))
      return {
        url: target, elapsedMs: elapsed(), events: events.map((item) => ({ ...item })),
        requests: all,
        pending: all.filter((item) => item.finishedMs === undefined),
      }
    },
  }
  observers.set(page, observer)
  return observer
}

export async function navigateWithDiagnostics(page, url, options) {
  const observer = observeNavigation(page)
  observer.begin(url)
  try {
    // Keep the caller's load condition and timeout; no retry or DOM-ready fallback.
    return await page.goto(url, options)
  } catch (error) {
    error.navigationDiagnostics = observer.snapshot()
    error.message += `\nNavigation diagnostic: ${JSON.stringify(error.navigationDiagnostics)}`
    throw error
  }
}
