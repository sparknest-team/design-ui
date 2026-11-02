import { createServer } from 'node:http'
import { readFile, realpath, stat } from 'node:fs/promises'
import { resolve, extname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
export function createKitServer(root, configuration) {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.webm': 'video/webm', '.mp4': 'video/mp4', '.md': 'text/plain; charset=utf-8' }
  return createServer(async (request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405).end(); return }
    try {
      const url = new URL(request.url, 'http://localhost')
      if (configuration && url.pathname === '/server.json') {
        response.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' }).end(JSON.stringify(configuration()))
        return
      }
      let file = resolve(root, '.' + decodeURIComponent(url.pathname))
      if (!file.startsWith(root + '/') && file !== root) { response.writeHead(403).end(); return }
      if ((await stat(file)).isDirectory()) {
        if (!url.pathname.endsWith('/')) { response.writeHead(302, { location: url.pathname + '/' + url.search }).end(); return }
        file = resolve(file, 'index.html')
      }
      file = await realpath(file)
      if (!file.startsWith(root + '/')) { response.writeHead(403).end(); return }
      const contents = await readFile(file)
      const headers = { 'content-type': types[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }
      const range = request.headers.range
      if (range) {
        const match = /^bytes=(\d+)-(\d*)$/.exec(range)
        if (!match) { response.writeHead(416).end(); return }
        const start = Number(match[1]), end = match[2] ? Math.min(Number(match[2]), contents.length - 1) : contents.length - 1
        if (start > end || start >= contents.length) { response.writeHead(416).end(); return }
        response.writeHead(206, { ...headers, 'content-range': `bytes ${start}-${end}/${contents.length}`, 'content-length': end - start + 1, 'accept-ranges': 'bytes' })
        response.end(request.method === 'HEAD' ? undefined : contents.subarray(start, end + 1))
      } else {
        response.writeHead(200, { ...headers, 'content-length': contents.length, 'accept-ranges': 'bytes' })
        response.end(request.method === 'HEAD' ? undefined : contents)
      }
    } catch { if (!response.headersSent) response.writeHead(404); response.end() }
  })
}
export async function startKitServers(root, { host = '127.0.0.1', port = 4173 } = {}) {
  if (!host || !Number.isInteger(port) || port < 0 || port > 65533) throw new Error('Invalid host/port')
  root = await realpath(root)
  const servers = {}, configuration = () => Object.fromEntries(Object.entries(servers).map(([name, server]) => [name, server.address().port]))
  try {
    for (const [index, name] of ['control', 'cedar', 'maple'].entries()) {
      const server = createKitServer(name === 'control' ? root : resolve(root, name), name === 'control' ? configuration : undefined)
      servers[name] = server
      await new Promise((done, reject) => { server.once('error', reject); server.listen(port ? port + index : 0, host, done) })
    }
    return { ports: configuration(), close: async () => { for (const server of Object.values(servers)) { server.closeAllConnections(); await new Promise(done => server.close(done)) } } }
  } catch (error) {
    for (const server of Object.values(servers)) { server.closeAllConnections(); if (server.listening) await new Promise(done => server.close(done)) }
    throw error
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(await realpath(resolve(process.argv[1]))).href) {
  const args = process.argv.slice(2)
  const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback
  const host = option('--host', '127.0.0.1'), port = Number(option('--port', '4173'))
  const root = await realpath(fileURLToPath(new URL('.', import.meta.url)))
  const kit = await startKitServers(root, { host, port })
  console.log(`Read-only native handoff: http://${host}:${kit.ports.control}/; Cedar ${kit.ports.cedar}; Maple ${kit.ports.maple}`)
  for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, async () => { await kit.close() })
}
