import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const comparisonPages = new Set('checkbox radio rate tag menu tooltip icon pagination badge tab-bar upload ripple progress progress-group segmented'.split(' '));

export function normalizeDemoLayout(source, prefix, wrapComparisons = false) {
  return source.replace(new RegExp(`<${prefix}-space\\b[^>]*>`, 'g'), tag => {
    tag = tag.replace(/\bdirection=(['"])vertical\1/g, 'direction="column"');
    if (wrapComparisons && !/\bdirection=['"]column['"]/.test(tag) && !/(?:\s|^):?wrap(?:\s|=|>|\/)/.test(tag)) {
      tag = tag.replace(new RegExp(`<${prefix}-space\\b`), `<${prefix}-space wrap`);
    }
    return tag;
  });
}

export function checkLayouts(write = false) {
  const changed = [];
  for (const [library, prefix] of [['cedar-design-web/packages/cedar-ui', 'c'], ['maple-design-mobile/packages/maple-ui', 'mp']]) {
    const base = path.join(root, library, 'src');
    for (const relative of fs.readdirSync(base, { recursive: true })) {
      if (!relative.endsWith('.vue') || !/(?:__demos__|example\/demos)\//.test(relative)) continue;
      const file = path.join(base, relative), source = fs.readFileSync(file, 'utf8');
      const output = normalizeDemoLayout(source, prefix, comparisonPages.has(relative.split(path.sep)[0]));
      if (output !== source) { changed.push(path.relative(root, file)); if (write) fs.writeFileSync(file, output); }
    }
  }
  return changed;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const changed = checkLayouts(process.argv.includes('--write'));
  console.log(JSON.stringify({ changed: changed.length, files: changed }, null, 2));
  if (changed.length && !process.argv.includes('--write')) process.exitCode = 1;
}
