// Local synthetic Upload audit only. Never stores files or binds a public interface.
import { createServer } from 'node:http'

const origins = new Set(['http://localhost:4185', 'http://localhost:8080', 'http://127.0.0.1:4185', 'http://127.0.0.1:8080'])
let received = 0
const server = createServer((request, response) => {
  const origin = request.headers.origin
  if (origin && !origins.has(origin)) {
    response.writeHead(403).end()
    return
  }
  if (origin) response.setHeader('Access-Control-Allow-Origin', origin)
  response.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'X-Demo-Upload, Content-Type')
  response.setHeader('Content-Type', 'application/json')
  if (request.method === 'OPTIONS') { response.writeHead(204).end(); return }
  if (request.method === 'GET' && request.url === '/stats') { response.end(JSON.stringify({ received })); return }
  if (request.method !== 'POST' || request.url !== '/upload') { response.writeHead(404).end(); return }
  const chunks = []
  let size = 0
  request.on('data', chunk => {
    size += chunk.length
    if (size > 16384) { request.destroy(); return }
    chunks.push(chunk)
  })
  request.on('end', () => {
    const body = Buffer.concat(chunks).toString('utf8')
    received++
    const result = { received, header: request.headers['x-demo-upload'], marker: body.includes('audit-local'), attachment: body.includes('name="attachment"') }
    response.end(JSON.stringify(result))
    console.log(JSON.stringify(result))
  })
})
server.listen(4197, '127.0.0.1', () => console.log('Local upload audit: http://127.0.0.1:4197/upload'))
