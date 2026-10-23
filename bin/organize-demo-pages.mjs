import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const write = process.argv.includes('--write');
const changed = [];
const pages = [];
const pairedCases = JSON.parse(fs.readFileSync(path.join(root, 'design-ui/audits/same-source-demos.json'), 'utf8'));
const captionLiteral = text => "'" + text.replaceAll('\\', '\\\\').replaceAll("'", "\\'").replaceAll('\n', '\\n') + "'";
function syncMapleExamples(base) {
  for (const relative of fs.readdirSync(base, { recursive: true }).filter(file => file.endsWith('/example/index.vue'))) {
    const file = path.join(base, relative);
    const directory = path.dirname(file);
    const docFile = path.resolve(directory, '../docs/zh-CN.md');
    if (!fs.existsSync(docFile)) continue;
    const doc = fs.readFileSync(docFile, 'utf8');
    const enFile = path.resolve(directory, '../docs/en-US.md');
    const en = fs.existsSync(enFile) ? fs.readFileSync(enFile, 'utf8') : '';
    let source = fs.readFileSync(file, 'utf8');
    for (const item of [...source.matchAll(/import\s+(OrganizedDemo\d+)\s+from\s+['"]([^'"]+\.vue)['"]/g)]) {
      const name = path.basename(item[2], '.vue');
      const alias = 'Organized' + name.replace(/(^|-)(\w)/g, (_, __, character) => character.toUpperCase());
      source = source.replace(item[0], item[0].replace(item[1], alias));
      source = source.replace(/<section\b[^>]*>[\s\S]*?<\/section>/g, section => section.includes(`data-demo="${name}"`) ? section.replaceAll(item[1], alias) : section);
    }
    // Earlier entries may render a PascalCase import through its kebab-case tag.
    // Keep the authored card if it already exists, instead of duplicating it.
    const existing = [...source.matchAll(/import\s+(\w+)\s+from\s+['"]([^'"]+\.vue)['"]/g)];
    for (const item of existing.filter(item => item[1].startsWith('Organized'))) {
      const original = existing.find(other => other[2] === item[2] && !other[1].startsWith('Organized'));
      if (!original) continue;
      source = source.replace(item[0] + '\n', '');
      source = source.replace(/<section\b[^>]*>[\s\S]*?<\/section>/g, section => section.includes(`<${item[1]}`) ? '' : section);
    }
    const imports = [...source.matchAll(/import\s+(\w+)\s+from\s+['"]([^'"]+\.vue)['"]/g)];
    const missing = [];
    const seen = new Set();
    const title = (text, reference, fallback) => {
      const position = text.includes(reference) ? text.indexOf(reference) : text.indexOf('/' + path.basename(reference));
      return position < 0 ? fallback : [...text.slice(0, position).matchAll(/^### (.+)$/gm)].at(-1)?.[1] ?? fallback;
    };
    const demos = [...doc.matchAll(/```demo\s*\n([^\n]+\.vue)\s*\n```/g)].map(match => match[1].trim());
    const captions = new Map(demos.map(reference => [path.basename(reference, '.vue'), { zh: title(doc, reference, path.basename(reference, '.vue')), en: title(en, reference, path.basename(reference, '.vue')) }]));
    source = source.replace(/<section\b[^>]*data-demo="([^"]+)"[^>]*>[\s\S]*?<\/section>/g, (section, name) => {
      const caption = captions.get(name);
      if (!caption || name === 'api-review') return section;
      const current = /<app-type>([\s\S]*?)<\/app-type\s*>/.exec(section)?.[1] ?? '';
      const hasCaption = text => current.includes(JSON.stringify(text)) || current.includes("'" + text.replaceAll("'", "\\'") + "'");
      if (hasCaption(caption.zh) && hasCaption(caption.en)) return section;
      return section.replace(/<app-type>[\s\S]*?<\/app-type\s*>/, `<app-type>${/\bconst english\b/.test(source) ? `{{ english ? ${captionLiteral(caption.en)} : ${captionLiteral(caption.zh)} }}` : caption.zh}</app-type>`);
    });
    for (const reference of demos) {
      const absolute = path.resolve(path.dirname(docFile), reference);
      const name = path.basename(absolute, '.vue');
      if (name === 'api-review' || seen.has(absolute)) continue;
      seen.add(absolute);
      const imported = imports.find(item => path.resolve(directory, item[2]) === absolute);
      if (imported) {
        const tag = imported[1].replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
        const template = source.slice(source.indexOf('<template>'));
        if (new RegExp(`<(?:${imported[1]}|${tag})(?:\\s|/|>)`).test(template) || new RegExp(`\\b${imported[1]}\\b`).test(template)) continue;
      }
      const component = 'Organized' + name.replace(/(^|-)(\w)/g, (_, __, character) => character.toUpperCase());
      const zh = title(doc, reference, name), english = title(en, reference, name);
      missing.push({ component, name, reference: './' + path.relative(directory, absolute).replaceAll(path.sep, '/'), zh, english });
    }
    if (!missing.length) { update(file, source); continue; }
    if (!/<script\b[^>]*\bsetup\b/.test(source) || !source.includes('AppType')) continue;
    source = source.replace(/(<script\b[^>]*\bsetup\b[^>]*>)/, '$1\n' + missing.map(item => `import ${item.component} from '${item.reference}'`).join('\n'));
    const bilingual = /\bconst english\b/.test(source);
    const sections = missing.map(item => `  <section data-demo="${item.name}">\n    <app-type>${bilingual ? `{{ english ? ${captionLiteral(item.english)} : ${captionLiteral(item.zh)} }}` : item.zh}</app-type>\n    <${item.component} />\n  </section>\n`).join('');
    const end = source.lastIndexOf('</template>');
    source = source.slice(0, end) + sections + source.slice(end);
    update(file, source);
  }
}
function update(file, content) {
  if (/\.(?:md|vue)$/.test(file)) content = content.trimEnd() + '\n';
  if (fs.readFileSync(file, 'utf8') === content) return;
  changed.push(path.relative(root, file));
  if (write) fs.writeFileSync(file, content);
}
function priority(file) {
  const name = path.basename(file, '.vue');
  if (/^(basic(?:-usage)?|example)$/.test(name)) return 0;
  if (/^(size|variant|variants|status|state|disabled|readonly)$/.test(name)) return 1;
  if (/lifecycle|review|workbench|race|regression|async|concurr|aggregate/.test(name)) return 4;
  if (/presentation|slots|range-boundar/.test(name)) return 3;
  return 2;
}
export function organizeSections(source, sharedOrder = []) {
  // A missing newline must not turn the next example heading into a table cell.
  source = source.replace(/^(\|[^\n]*\|)(#{2,6} .+)$/gm, '$1\n\n$2');
  const boundary = /^## (?:API|属性|Props)\s*$/m.exec(source);
  if (!boundary) return source;
  let examples = source.slice(0, boundary.index);
  const first = /^##(?:#)? /m.exec(examples);
  if (!first) return source;
  const prefix = examples.slice(0, first.index);
  const demo = chunk => /<demo\s+src="([^"]+)"|```demo\s*\n([^\n]+)/.exec(chunk);
  const sortChapter = content => {
    content = content.trimStart();
    const chunks = content.split(/(?=^### )/m).filter(chunk => chunk.trim());
    let intro = '';
    const cases = [];
    for (const chunk of chunks) {
      // Keep explanation-only headings attached to the preceding case, rather
      // than abandoning the whole page or moving prose away from its example.
      if (demo(chunk)) cases.push(chunk);
      else if (cases.length) cases[cases.length - 1] = cases[cases.length - 1].trimEnd() + '\n\n' + chunk.trimStart();
      else intro += chunk;
    }
    const rank = chunk => /^### (?:基础|基本|最简单|Basic|Simplest)/im.test(chunk) ? 0 : priority(demo(chunk)[1] ?? demo(chunk)[2]);
    const sharedRank = chunk => {
      const match = demo(chunk);
      const index = sharedOrder.indexOf(path.basename(match[1] ?? match[2], '.vue'));
      return index < 0 ? sharedOrder.length : index;
    };
    cases.sort((a, b) => rank(a) - rank(b) || sharedRank(a) - sharedRank(b));
    return [intro, ...cases].filter(chunk => chunk.trim()).map(chunk => chunk.trimEnd()).join('\n\n');
  };
  const chapters = examples.slice(first.index).split(/(?=^## )/m).filter(chunk => chunk.trim());
  const main = [], others = [];
  for (const chapter of chapters) {
    const heading = /^## (.+)\n/.exec(chapter);
    if (!heading || /^(案例|示例|Examples|Demos)$/.test(heading[1].trim())) main.push(heading ? chapter.slice(heading[0].length) : chapter);
    else others.push(heading[0].trimEnd() + '\n\n' + sortChapter(chapter.slice(heading[0].length)));
  }
  const english = /^## (?:Examples|Demos)/m.test(examples) || /^### (?:Introduction|Basic)/m.test(examples);
  const body = [main.length ? `## ${english ? 'Examples' : '案例'}\n\n${sortChapter(main.join('\n\n'))}` : '', ...others].filter(Boolean).join('\n\n');
  return prefix + body.trimEnd() + '\n\n' + source.slice(boundary.index);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
for (const [platform, library] of [
  ['cedar', 'cedar-design-web/packages/cedar-ui'],
  ['maple', 'maple-design-mobile/packages/maple-ui'],
]) {
  const base = path.join(root, library, 'src');
  const files = fs.readdirSync(base, { recursive: true });
  for (const relative of files.filter(file => platform === 'cedar' ? file.endsWith('/README.md') : /\/docs\/(?:zh-CN|en-US)\.md$/.test(file))) {
    const file = path.join(base, relative);
    const original = fs.readFileSync(file, 'utf8');
    let source = platform === 'maple' ? original.replace(/^<demo\s+src="([^"]+\.vue)"\s*>\s*<\/demo>\s*$/gm, (_, reference) => `\x60\x60\x60demo\n${reference}\n\x60\x60\x60`) : original;
    if (!source.includes('<!-- api-review:start -->') && source.includes('<!-- api-review:end -->')) {
      source = source.replace(/^(### (?:功能调试|Feature playground|组合审查 \/ API review))$/m, '<!-- api-review:start -->\n$1');
    }
    const block = /<!-- api-review:start -->[\s\S]*?<!-- api-review:end -->/.exec(source);
    if (!block) continue;
    const english = relative.endsWith('en-US.md');
    const title = english ? '### Feature playground' : '### 功能调试';
    const review = block[0].replace(/^### .+$/m, title);
    source = source.replace(block[0], '').replace(/\n{4,}/g, '\n\n\n');
    const sharedApi = source.includes('<!-- same-source-api:start -->');
    if (sharedApi) source = source.replace('<!-- same-source-api:start -->', '');
    let anchor = /^## (?:API|属性|Props)\s*$/m.exec(source);
    if (!anchor) {
      const props = /^### (?:.*\bProps|属性)\s*$/m.exec(source);
      if (!props) continue;
      source = source.slice(0, props.index) + '## API\n\n' + source.slice(props.index);
      anchor = /^## API\s*$/m.exec(source);
    }
    const component = relative.split(path.sep)[0];
    source = organizeSections(source, (pairedCases[component] ?? []).map(entry => entry.name));
    const organizedAnchor = /^## (?:API|属性|Props)\s*$/m.exec(source);
    source = source.slice(0, organizedAnchor.index).trimEnd() + '\n\n' + review + '\n\n' + source.slice(organizedAnchor.index);
    if (sharedApi) source = source.replace(/(^## (?:API|属性|Props)[ \t]*$)\n*/m, '$1\n\n<!-- same-source-api:start -->\n');
    update(file, source);
    pages.push({ platform, file: path.relative(root, file), demos: [...source.matchAll(/<demo\s+src="([^"]+)"|```demo\s*\n([^\n]+)/g)].map(match => match[1] ?? match[2]) });
  }
  if (platform === 'maple') {
    syncMapleExamples(base);
    for (const relative of files.filter(file => file.endsWith('/example/index.vue'))) {
      const file = path.join(base, relative);
      const source = fs.readFileSync(file, 'utf8');
      const match = /\s*<section\b[^>]*data-demo="api-review"[^>]*>[\s\S]*?<\/section>/.exec(source);
      if (!match) continue;
      let cleaned = source.replace(match[0], '');
      const sections = [...cleaned.matchAll(/<section\b[^>]*data-demo="([^"]+)"[^>]*>[\s\S]*?<\/section>/g)];
      const documentation = path.resolve(path.dirname(file), '../docs/zh-CN.md');
      const order = fs.existsSync(documentation) ? [...fs.readFileSync(documentation, 'utf8').matchAll(/```demo\s*\n([^\n]+\.vue)\s*\n```/g)].map(item => path.basename(item[1].trim(), '.vue')) : [];
      const rank = name => order.includes(name) ? order.indexOf(name) : order.length + priority(name);
      const ordered = sections.map(section => section[0]).sort((a, b) => rank(/data-demo="([^"]+)"/.exec(a)[1]) - rank(/data-demo="([^"]+)"/.exec(b)[1]));
      let cursor = 0;
      cleaned = cleaned.replace(/<section\b[^>]*data-demo="([^"]+)"[^>]*>[\s\S]*?<\/section>/g, () => ordered[cursor++]);
      const end = cleaned.lastIndexOf('</template>');
      if (end < 0) throw new Error(`${file}: missing template`);
      update(file, cleaned.slice(0, end).trimEnd() + '\n  ' + match[0].trim() + '\n' + cleaned.slice(end));
    }
  }
}
const manifest = path.join(root, 'design-ui/audits/same-source-demos.json');
const cases = JSON.parse(fs.readFileSync(manifest, 'utf8'));
for (const [component, entries] of Object.entries(cases)) {
  const review = entries.find(entry => entry.name === 'api-review');
  if (!review) continue;
  entries.splice(entries.indexOf(review), 1);
  entries.push({ ...review, zh: '功能调试', en: 'Feature playground' });
  const doc = fs.readFileSync(path.join(root, 'cedar-design-web/packages/cedar-ui/src', component, 'README.md'), 'utf8');
  const order = [...doc.matchAll(/<demo src="\.\/__demos__\/([^"/]+)\.vue"/g)].map(match => match[1]);
  for (const name of order) {
    if (entries.some(entry => entry.name === name)) continue;
    const mobile = path.join(root, 'maple-design-mobile/packages/maple-ui/src', component, 'example/demos');
    if (!fs.existsSync(path.join(mobile, name + '.vue')) && !fs.existsSync(path.join(mobile, 'en-US', name + '.vue'))) continue;
    const end = doc.indexOf(`./__demos__/${name}.vue`);
    const title = [...doc.slice(0, end).matchAll(/^### (.+)$/gm)].at(-1)?.[1] ?? name;
    entries.push({ name, zh: title, en: name });
  }
  entries.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
  const englishFile = path.join(root, 'maple-design-mobile/packages/maple-ui/src', component, 'docs/en-US.md');
  if (fs.existsSync(englishFile)) {
    let english = fs.readFileSync(englishFile, 'utf8');
    for (const entry of entries) {
      if (english.includes(`../example/demos/${entry.name}.vue`)) continue;
      if (english.includes(`../example/demos/en-US/${entry.name}.vue`)) continue;
      const directory = path.join(root, 'maple-design-mobile/packages/maple-ui/src', component, 'example/demos');
      const reference = fs.existsSync(path.join(directory, 'en-US', entry.name + '.vue')) ? `../example/demos/en-US/${entry.name}.vue` : `../example/demos/${entry.name}.vue`;
      if (!fs.existsSync(path.resolve(path.dirname(englishFile), reference))) continue;
      const anchor = english.indexOf('<!-- api-review:start -->');
      const section = `### ${entry.en}\n\n\x60\x60\x60demo\n${reference}\n\x60\x60\x60\n\n`;
      english = english.slice(0, anchor) + section + english.slice(anchor);
    }
    update(englishFile, english);
  }
  const messagesFile = path.join(root, 'maple-design-mobile/packages/maple-ui/src', component, 'example/messages.json');
  if (fs.existsSync(messagesFile)) {
    const messages = JSON.parse(fs.readFileSync(messagesFile, 'utf8'));
    for (const lang of ['zh-CN', 'en-US']) for (const entry of entries) {
      if (messages[lang]) messages[lang][entry.name] = entry[lang === 'zh-CN' ? 'zh' : 'en'];
    }
    update(messagesFile, JSON.stringify(messages, null, 2) + '\n');
  }
}
update(manifest, JSON.stringify(cases, null, 2) + '\n');
console.log(JSON.stringify({ pages: pages.length, changed: changed.length, files: changed }, null, 2));
if (!write && changed.length) process.exitCode = 1;
}
