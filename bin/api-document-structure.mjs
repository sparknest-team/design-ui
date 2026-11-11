// Keep API members in one flat chapter, and schema documentation in Types.
export function markdownSections(source) {
  const root = { level: 0, title: '', heading: '', body: '', children: [] };
  const stack = [root];
  let fence;
  for (const line of source.split(/(?<=\n)/)) {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    if (marker) {
      if (!fence) fence = marker[0]; else if (fence === marker[0]) fence = undefined;
    }
    const heading = !fence && !marker && /^(#{2,6}) (.+?)\r?\n?$/.exec(line);
    if (heading) {
      const node = { level: heading[1].length, title: heading[2], heading: line, body: '', children: [] };
      while (stack.at(-1).level >= node.level) stack.pop();
      stack.at(-1).children.push(node);
      stack.push(node);
    } else stack.at(-1).body += line;
  }
  return root;
}
export const renderSection = node => node.heading + node.body + node.children.map(renderSection).join('');
const hasDemo = source => /<demo\b|```demo/.test(source);
const memberTitle = title => /^([A-Z][\w.]*) (Props|Events|Slots|Methods|Options|Instance Properties)(?: \/ (?:Props|Events|Slots|Methods))*(?: \([\d.]+\))?$/.exec(title);
const schemaTitle = title => /^[A-Z][A-Za-z0-9]*$/.test(title) && !/^(?:API|Types|Props|Events|Slots|Methods|Options)$/.test(title);
const table = source => /^\|[^\n]+\|\r?\n\|\s*[-:]/m.test(source);
const memberKeys = node => node.body.split('\n').filter(line => line.startsWith('|')).slice(2)
  .flatMap(line => line.split(/(?<!\\)\|/)[1].replace(/[`*_]/g, '').trim().split(/\s+\/\s+/))
  .map(key => key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase());

function mergeSections(nodes) {
  const result = [];
  const seen = new Map();
  for (const node of nodes) {
    const previous = memberTitle(node.title) && seen.get(node.title);
    if (!previous) {
      result.push(node);
      if (memberTitle(node.title)) seen.set(node.title, node);
      continue;
    }
    const old = (previous.body + previous.children.map(renderSection).join('')).trim();
    const next = (node.body + node.children.map(renderSection).join('')).trim();
    if (!next || old === next) continue;
    if (!old) { previous.body = node.body; previous.children = node.children; continue; }
    if (!table(old) && !table(next)) {
      previous.body = '\n' + [...new Set([old, next])].join('\n\n') + '\n\n';
      previous.children = [];
      continue;
    }
    if (!previous.formal && node.formal) {
      const keys = new Set(memberKeys(node));
      if (memberKeys(previous).every(key => keys.has(key))) {
        Object.assign(previous, node);
        continue;
      }
    }
    // Different member tables require an explicit decision, rather than dropping rows.
    throw new Error(`Conflicting duplicate API section: ${node.title}`);
  }
  return result;
}

export function flattenApiStructure(source, primary, { components = [], schemas = [] } = {}) {
  const contracts = [];
  const input = source.replace(/<!-- ((?:date|time)-contract):start -->[\s\S]*?<!-- \1:end -->/g, block => {
    const token = `<!-- api-document-contract-${contracts.length} -->`;
    contracts.push([token, block]);
    return token;
  });
  const root = markdownSections(input);
  const componentNames = new Set([primary, ...components]);
  const schemaNames = new Set(schemas);
  const api = [], types = [];
  let insertion = -1;
  let found = false;
  function visit(nodes, afterApi = false, collect = false) {
    const retained = [];
    for (const node of nodes) {
      if (/^(?:[A-Z][\w.]* )?CSS Variables$/.test(node.title)) {
        retained.push(node);
        continue;
      }
      const apiHeading = node.title === 'API' || /^[\w.]+ API$/.test(node.title) && node.level === 2;
      const component = /^[A-Z][\w.]*$/.test(node.title) && (componentNames.has(node.title) || node.title.startsWith(primary) && /(?:Group|Item|Header|Content|Footer|Sider|Panel|Picker|Password|Label|Line|Shape|Navs|Nav|Pane|Link|Column)$/.test(node.title)) && !hasDemo(renderSection(node));
      const member = memberTitle(node.title);
      const schema = schemaNames.has(node.title) || schemaTitle(node.title) && !componentNames.has(node.title) &&
        (afterApi || found) && (table(node.body) || /```(?:ts|typescript)/.test(node.body));
      if (node.title === 'Types' && node.level === 2) {
        types.push(node);
        continue;
      }
      if (apiHeading || component) {
        if (apiHeading) found = true;
        if (insertion < 0 && node.level === 2) insertion = retained.length;
        if (component && table(node.body) || apiHeading && table(node.body)) {
          const owner = component ? node.title : node.title === 'API' ? primary : node.title.replace(/ API$/, '');
          const props = { ...node, title: owner + ' Props', heading: `### ${owner} Props\n`, level: 3, children: [], formal: afterApi || found };
          api.push(props);
          props.children = visit(node.children, true);
        } else {
          if (node.body.trim()) api.push({ ...node, title: '', heading: '', children: [] });
          visit(node.children, true, true);
        }
        continue;
      }
      if (schema && !hasDemo(renderSection(node))) {
        types.push({ ...node, level: 3, heading: `### ${node.title}\n` });
        continue;
      }
      if (member && !hasDemo(renderSection(node))) {
        const section = { ...node, level: 3, heading: `### ${node.title}\n`, formal: afterApi || found };
        api.push(section);
        section.children = visit(node.children, afterApi || found);
      } else {
        node.children = visit(node.children, afterApi || found);
        if (collect) api.push(node); else retained.push(node);
      }
    }
    return retained;
  }
  root.children = visit(root.children);
  if (!found && !api.length) return source;
  const chunks = mergeSections(api).map(renderSection).map(text => text.trim()).filter(Boolean);
  if (!chunks.length) return source;
  const section = { level: 2, title: 'API', heading: '## API\n', body: '\n' + chunks.join('\n\n') + '\n\n', children: [] };
  const additions = [section];
  if (types.length) {
    const content = types.map(node => node.title === 'Types' ? node.body + node.children.map(renderSection).join('') : renderSection(node)).map(text => text.trim()).filter(Boolean);
    additions.push({ level: 2, title: 'Types', heading: '## Types\n', body: '\n' + [...new Set(content)].join('\n\n') + '\n\n', children: [] });
  }
  root.children.splice(insertion < 0 ? root.children.length : insertion, 0, ...additions);
  let result = renderSection(root).replace(/\n+$/, '\n');
  for (const [token, block] of contracts) result = result.replace(token, block);
  const nonblank = text => text.split('\n').filter(line => line.trim()).join('\n');
  return nonblank(result) === nonblank(source) && !/\n\n$/.test(source) ? source : result;
}
