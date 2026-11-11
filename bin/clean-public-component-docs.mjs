import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { documentationFiles } from './normalize-api-headings.mjs';
import { markdownSections, renderSection } from './api-document-structure.mjs';
import { organizePublicDocument } from './public-documentation-policy.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const rules = JSON.parse(fs.readFileSync(new URL('../configs/public-component-docs-review.json', import.meta.url), 'utf8'));
const normalize = text => text.replace(/`/g, '').replace(/\s+/g, ' ').trim();
const replacements = new Map();
for (const rule of rules) {
  replacements.set(normalize(rule.before), rule.after);
  if (rule.englishBefore && !/[\u4e00-\u9fff]/.test(rule.englishBefore)) replacements.set(normalize(rule.englishBefore), rule.english);
}
const headingPairs = [
  ['同源实现与平台边界', '使用说明', 'Shared implementation and platform boundaries', 'Usage notes'],
  ['独立同源维护', '使用说明', 'Independent source copies', 'Usage notes'],
  ['同源约定', '使用说明', 'Shared-source conventions', 'Usage notes'],
  ['独立同源与公开类型', '使用说明', 'Independent source copies and public types', 'Usage notes'],
  ['独立同源指令', '使用说明', 'Independent shared-source directive', 'Usage notes'],
  ['同源样式约定', '样式定制', 'Shared-source styling conventions', 'Custom styling'],
  ['跨端说明', '使用说明', 'Cross-platform notes', 'Usage notes'],
  ['跨端边界', '平台差异', 'Cross-platform boundaries', 'Platform differences'],
  ['同源规则与事件', '值与事件', 'Shared rules and events', 'Values and events'],
  ['样式迁移', '样式定制', 'Style migration', 'Custom styling'],
  ['变量消费约定', '尺寸与动效', 'Variable consumption rules', 'Sizing and motion'],
  ['变量消费边界', '样式定制', 'Variable consumption boundaries', 'Custom styling'],
  ['受管默认值', '默认样式变量', 'Managed defaults', 'Default style variables'],
];
const headings = new Map(headingPairs.flatMap(([zh, nextZh, en, nextEn]) => [[zh, nextZh], [en, nextEn]]));
headings.set('透传配置边界核对（F07）','透传配置边界');
headings.set('Forwarded configuration boundaries (F07)','Forwarded configuration boundaries');
headings.set('透传配置的现有优先级（F07）','透传配置优先级');
headings.set('Existing precedence of forwarded configuration (F07)','Forwarded configuration precedence');
headings.set('可选的业务行类型配置（F08-A）','可选的业务行类型配置');
headings.set('Optional business-row type configuration (F08-A)','Optional business-row type configuration');
headings.set('Shared-source contract','Usage notes');
headings.set('Shared-source style rules','Custom styling');
const styleTitles = new Set([
  '完整变量默认值', '完整变量默认值与使用边界', '动效变量', '默认样式变量', '尺寸与动效', '颜色覆盖边界', '样式定制',
  'Complete variable defaults', 'Complete variable defaults and boundaries', 'Motion variables', 'Default style variables', 'Sizing and motion', 'Color override boundaries', 'Custom styling',
]);
const internalHeading = /^(?:同源实现与平台边界|独立同源维护|同源约定|独立同源与公开类型|独立同源指令|同源样式约定|Shared implementation and platform boundaries|Independent source copies(?: and public types)?)$/i;

export function internalDocumentationNotes(source) {
  const notes = [];
  let fence;
  const process = /源码一致性检查|配对测试|独立同源|同源复制|同源实现与平台边界|(?:本批|本轮).*(?:验收|审计|源码|契约|测试)|(?:真实\s*IAB|\bIAB\b|\bJSDOM\b).*(?:通过|验收|pass|evidence|acceptance)|audits\/evidence|(?:controlled|scoped|targeted)\s*\d*\s*tests?.*(?:pass|evidence)|\bregression\b.*(?:\bpass\b|\bevidence\b|Cedar\d|Maple\d)|(?:read-only source consistency|independent source copies|shared implementation and platform boundaries)/i;
  for (const paragraph of source.split(/\n\s*\n/)) {
    const wasFenced = Boolean(fence);
    for (const line of paragraph.split('\n')) {
      const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
      if (marker) { if (!fence) fence = marker[0]; else if (fence === marker[0]) fence = undefined; }
    }
    if (wasFenced || fence || /^\s*(?:\||```|~~~|<!--)/.test(paragraph)) continue;
    if (process.test(paragraph)) notes.push(paragraph.trim());
  }
  return notes;
}

export function cleanPublicDocumentation(source, {primary} = {}) {
  const edits = [];
  let fence;
  let text = source.split(/(\n\n+)/).map(paragraph => {
    if (/^\n+$/.test(paragraph)) return paragraph;
    const wasFenced = Boolean(fence);
    for (const line of paragraph.split('\n')) {
      const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
      if (marker) { if (!fence) fence = marker[0]; else if (fence === marker[0]) fence = undefined; }
    }
    if (wasFenced || fence || /^(?:\||```|~~~|<demo\b)/.test(paragraph.trim())) return paragraph;
    const key = normalize(paragraph);
    if (replacements.has(key)) {
      const next = replacements.get(key);
      if (next !== paragraph.trim()) edits.push({ before: paragraph.trim(), after: next });
      return next ? (paragraph.match(/^\s*/)?.[0] ?? '') + next + (paragraph.match(/\s*$/)?.[0] ?? '') : '';
    }
    return paragraph.split('\n').map(line => {
      if (!/^\s*[-*] /.test(line)) return line;
      const next = replacements.get(normalize(line));
      if (next === undefined || next === line) return line;
      edits.push({ before: line, after: next });
      return next;
    }).join('\n');
  }).join('');
  const tree = markdownSections(text);
  let css = tree.children.find(node => node.title === 'CSS Variables' || primary && node.title === primary+' CSS Variables');
  if (css && css.title !== 'CSS Variables') {
    edits.push({before:css.heading.trim(),after:'## CSS Variables'});
    css.title = 'CSS Variables';
    css.heading = '## CSS Variables\n';
  }
  const moved = [];
  function visit(nodes, inCss = false) {
    const retained = [];
    for (const node of nodes) {
      const oldTitle = node.title;
      const nextTitle = headings.get(oldTitle) ?? (/^列表滚动任务审计/.test(oldTitle) ? '选择与滚动' : oldTitle);
      if (nextTitle !== oldTitle) {
        node.title = nextTitle;
        node.heading = '#'.repeat(node.level)+' '+nextTitle+'\n';
        edits.push({ before: '#'.repeat(node.level)+' '+oldTitle, after: node.heading.trim() });
      }
      node.children = visit(node.children, inCss || node === css);
      if (!inCss && node !== css && styleTitles.has(node.title) && /--(?:c|mp)-/.test(renderSection(node)) && !/<demo\b|```demo/.test(renderSection(node))) {
        node.level = 3;
        node.heading = '### '+node.title+'\n';
        moved.push(node);
        continue;
      }
      if (['使用说明','Usage notes'].includes(node.title) && !node.body.trim() && !node.children.length) {
        edits.push({ before: node.heading.trim(), after: '' });
        continue;
      }
      if (internalHeading.test(node.title)) throw new Error('Unreviewed maintenance heading: '+node.title);
      retained.push(node);
    }
    return retained;
  }
  tree.children = visit(tree.children);
  if (moved.length) {
    if (!css) {
      css = { level: 2, title: 'CSS Variables', heading: '## CSS Variables\n', body: '\n', children: [] };
      tree.children.push(css);
    }
    css.children.push(...moved);
  }
  if (css) tree.children = tree.children.filter(node => {
    if (node === css || !(node.title === 'CSS Variables' || primary && node.title === primary+' CSS Variables')) return true;
    css.body = css.body.trimEnd()+'\n\n'+node.body.trim()+'\n\n';
    css.children.push(...node.children);
    edits.push({before:node.heading.trim(),after:'merged into CSS Variables'});
    return false;
  });
  text = tree.body + tree.children.map(node => renderSection(node).trimEnd()).join('\n\n') + '\n';
  const organized = organizePublicDocument(text, {primary, en: /^## Basic examples/m.test(source) || /lang: en-US/.test(source)});
  if (organized !== text) { text = organized; edits.push({before:'mixed public documentation sections',after:'current usage, API, types and CSS customization'}); }
  if (!edits.length && !moved.length) return { text: source, edits: [] };
  return { text: text.replace(/\n+$/,'\n'), edits };
}

export function cleanPublicComponentDocs({ write = false } = {}) {
  const records = [];
  const unreviewed = [];
  for (const {filename,primary} of documentationFiles()) {
    const source = fs.readFileSync(filename,'utf8');
    const result = cleanPublicDocumentation(source,{primary});
    for (const note of internalDocumentationNotes(result.text)) unreviewed.push({ file: path.relative(root, filename), note });
    if (source === result.text) continue;
    records.push({ file: path.relative(root,filename), edits: result.edits });
    if (write) fs.writeFileSync(filename,result.text);
  }
  if (write && records.length) {
    const archive = path.join(root,'design-ui/audits/evidence/public-component-docs-2026-11-06.json');
    const previous = fs.existsSync(archive) ? JSON.parse(fs.readFileSync(archive,'utf8')) : [];
    fs.writeFileSync(archive,JSON.stringify([...previous,...records],null,2)+'\n');
  }
  return { checked: documentationFiles().length, changed: records.length, records, unreviewed };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const write = process.argv.includes('--write');
  const result = cleanPublicComponentDocs({write});
  console.log(JSON.stringify(result,null,2));
  if (result.unreviewed.length || !write && result.changed) process.exitCode = 1;
}
