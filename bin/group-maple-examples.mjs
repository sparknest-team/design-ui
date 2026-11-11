import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../maple-design-mobile/packages/cli/package.json', import.meta.url));
const { parse } = require('@vue/compiler-sfc');
const attr = (node, name) => node.props?.find(prop => prop.type === 6 && prop.name === name)?.value?.content;

export function readMapleExamples(source) {
  const { descriptor, errors } = parse(source);
  if (errors.length) throw new Error(`Invalid example SFC: ${errors.join(', ')}`);
  const template = descriptor.template;
  if (!template) throw new Error('Example has no template');
  const imports = new Map([...source.matchAll(/import\s+(\w+)\s+from\s+['"]([^'"]+\.vue)['"]/g)].map(match => [match[1], match[2]]));
  const cases = [], other = [], introductions = [];
  for (const node of template.ast.children) {
    if (node.type !== 1) {
      if (node.type === 2 && node.content.trim()) other.push(node.loc.source);
      continue;
    }
    if (node.tag === 'h2' && attr(node, 'data-demo-group')) continue;
    const id = attr(node, 'data-demo');
    if (node.tag === 'section' && attr(node, 'aria-labelledby') === 'layout-usage-title') {
      const indent = node.loc.start.column - 1;
      introductions.push(node.loc.source.split('\n').map((line, index) => index ? line.replace(new RegExp(`^ {0,${indent}}`), '') : line).join('\n'));
      continue;
    }
    if (node.tag !== 'section' || !id) { other.push(node.loc.source); continue; }
    const references = [];
    const visit = element => {
      if (element.type !== 1) return;
      if (imports.has(element.tag)) references.push(imports.get(element.tag));
      for (const prop of element.props ?? []) {
        if (prop.type === 7 && prop.name === 'bind' && prop.arg?.content === 'is') {
          for (const identifier of prop.exp?.content.match(/[A-Za-z_$][\w$]*/g) ?? []) {
            if (imports.has(identifier)) references.push(imports.get(identifier));
          }
        }
      }
      for (const child of element.children ?? []) visit(child);
    };
    visit(node);
    const refs = [...new Set(references)];
    // Prefer the Chinese/shared scenario when a case switches locale components.
    const reference = refs.find(ref => !/\/en-US\/|\.en-US\.vue$/.test(ref)) ?? refs[0];
    const name = reference ? path.basename(reference, '.vue').replace(/\.en-US$/, '') : id;
    const indent = node.loc.start.column - 1;
    const text = node.loc.source.split('\n').map((line, index) => index ? line.replace(new RegExp(`^ {0,${indent}}`), '') : line).join('\n');
    cases.push({ id, name, reference, refs, text });
  }
  return { template, cases, other, introductions };
}

const escape = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
export const groupId = group => group.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function groupMapleExamples(source, groups, componentName) {
  const { template, cases, other, introductions } = readMapleExamples(source);
  const owner = componentName ?? /data-demo-component="([^"]+)"/.exec(source)?.[1];
  if (other.length) throw new Error('Ungrouped inline content in example entry; extract it into a documented scenario first');
  const assigned = new Set();
  const sections = groups.flatMap(group => {
    const matches = cases.filter(item => group.cases.includes(item.name));
    matches.sort((a, b) => group.cases.indexOf(a.name) - group.cases.indexOf(b.name));
    for (const item of matches) {
      if (assigned.has(item)) throw new Error(`Example belongs to multiple groups: ${item.id}`);
      assigned.add(item);
    }
    if (!matches.length) return [];
    const content = group.title === '基础示例' ? [...introductions, ...matches.map(item => item.text)] : matches.map(item => item.text);
    return [`  <h2 class="mobile-demo-group-heading" data-demo-group="${groupId(group)}"${owner && group.title === '基础示例' ? ` data-demo-component="${escape(owner)}"` : ''}>\n    <span lang="zh-CN">${escape(group.title)}</span>\n    <span lang="en-US">${escape(group.en)}</span>\n  </h2>\n\n${content.map(text => text.split('\n').map(line => `  ${line}`).join('\n')).join('\n\n')}`];
  });
  const missing = cases.filter(item => !assigned.has(item));
  if (missing.length) throw new Error(`Ungrouped example cases: ${missing.map(item => item.id).join(', ')}`);
  const content = '\n' + sections.join('\n\n') + '\n';
  return source.slice(0, template.loc.start.offset) + content + source.slice(template.loc.end.offset);
}
