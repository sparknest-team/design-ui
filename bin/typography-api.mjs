import fs from 'node:fs';
import { markdownSections, renderSection } from './api-document-structure.mjs';

const definitions = JSON.parse(fs.readFileSync(new URL('../configs/typography-api.json', import.meta.url), 'utf8'));
export const typographyComponents = ['TypographyText', 'TypographyTitle', 'TypographyParagraph'];

export function typographyApi(locale) {
  const definition = definitions[locale];
  if (!definition) throw new Error(`Unknown Typography API locale: ${locale}`);
  return typographyComponents.flatMap(name => ['Props', 'Events', 'Slots'].map(kind => {
    let table = definition.shared[kind.toLowerCase()];
    if (kind === 'Props' && definition.specific[name]) {
      table += '\n' + definition.specific[name].split('\n').slice(2).join('\n');
    }
    return `### ${name} ${kind}\n\n${table}`;
  })).join('\n\n');
}

export function expandTypographyApi(source, locale) {
  const root = markdownSections(source);
  const api = root.children.find(node => node.title === 'API');
  if (!api) return source;
  // Expansion bootstraps a legacy shared table. Once each component has its
  // own API, preserve authored current events, slots and behavioral notes.
  if (typographyComponents.every(name => ['Props', 'Events', 'Slots'].every(kind =>
    api.children.some(node => node.title === `${name} ${kind}`)))) return source;
  api.body = '\n' + typographyApi(locale) + '\n\n';
  api.children = [];
  let types = root.children.find(node => node.title === 'Types');
  if (!types) {
    types = { level: 2, title: 'Types', heading: '## Types\n', body: '\n', children: [] };
    root.children.splice(root.children.indexOf(api) + 1, 0, types);
  }
  types.children = types.children.filter(node => node.title !== 'EllipsisConfig');
  types.children.push({ level: 3, title: 'EllipsisConfig', heading: '### EllipsisConfig\n', body: '\n' + definitions[locale].ellipsis + '\n\n', children: [] });
  return renderSection(root);
}
