import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const pages = [];
for (const [library, relative] of [['cedar', 'cedar-design-web/packages/cedar-ui'], ['maple', 'maple-design-mobile/packages/maple-ui']]) {
  const base = path.join(root, relative, 'src');
  for (const relativeFile of fs.readdirSync(base, { recursive: true }).filter(file => library === 'cedar' ? file.endsWith('.md') : file.endsWith('/docs/zh-CN.md'))) {
    const file = path.join(base, relativeFile);
    const content = fs.readFileSync(file, 'utf8');
    const references = [...content.matchAll(/<demo\b[^>]*\bsrc="([^"]+\.vue)"|```demo\s*\n([^\n]+\.vue)\s*\n```/g)].map(match => (match[1] ?? match[2]).trim());
    const route = library === 'cedar' ? /^permalink:\s*(\S+)/m.exec(content)?.[1] : `/#/zh-CN/${relativeFile.split(path.sep)[0]}`;
    if (!route || !references.length) continue;
    const component = library === 'cedar' ? route.replace(/^\/components\//, '').replace(/^\/+|\/+$/g, '').replaceAll('/', '-') : relativeFile.split(path.sep)[0];
    pages.push({
      library, component, route, title: /^# (.+)$/m.exec(content)?.[1],
      file: path.relative(root, file),
      demos: references.map(reference => {
        const absolute = path.resolve(path.dirname(file), reference);
        return { file: path.relative(root, absolute), source: fs.readFileSync(absolute, 'utf8') };
      }),
    });
  }
}
const outputIndex = process.argv.indexOf('--output');
const destination = outputIndex >= 0
  ? path.resolve(process.argv[outputIndex + 1])
  : path.join(root, 'design-ui/audits/evidence/demo-reorganization-2026-10-23/browser-inventory.json');
if (process.argv.includes('--write')) fs.writeFileSync(destination, JSON.stringify(pages, null, 2) + '\n');
console.log(JSON.stringify({ cedar: pages.filter(page => page.library === 'cedar').length, maple: pages.filter(page => page.library === 'maple').length, file: destination }));
