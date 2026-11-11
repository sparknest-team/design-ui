import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../../cedar-design-web/packages/ui/package.json', import.meta.url));
const { parse: parseSfc } = require('@vue/compiler-sfc');
const { parse: parseDom } = require('@vue/compiler-dom');
const ts = require('typescript');
const babel = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

function declared(pattern, names = []) {
  if (ts.isIdentifier(pattern)) names.push(pattern.text);
  else for (const element of pattern.elements ?? []) if (element.name) declared(element.name, names);
  return names;
}
function locals(pattern) {
  const tree = ts.createSourceFile('binding.ts', `const ${pattern} = undefined`, ts.ScriptTarget.Latest, true);
  return new Set(tree.statements.flatMap(statement => ts.isVariableStatement(statement) ? statement.declarationList.declarations.flatMap(declaration => declared(declaration.name)) : []));
}
export function namespaceExpression(expression, names, scope, localNames = new Set()) {
  if (!expression.trim()) return expression;
  let tree, statements = false;
  try { tree = babel.parse(`(${expression})`, { sourceType: 'module', plugins: ['typescript'] }); }
  catch { statements = true; tree = babel.parse(`function handler($event) { ${expression} }`, { sourceType: 'module', plugins: ['typescript'] }); }
  traverse(tree, { Identifier(item) {
    const name = item.node.name;
    if (!names.has(name) || localNames.has(name) || item.scope.hasBinding(name)) return;
    const assigned = item.parentPath.isAssignmentExpression() && item.key === 'left' || item.parentPath.isUpdateExpression() && item.key === 'argument';
    if (!item.isReferencedIdentifier() && !assigned) return;
    item.replaceWith(babel.parseExpression(`${scope}.${name}`)); item.skip();
  } });
  if (statements) return tree.program.body[0].body.body.map(node => generate(node, { compact: false }).code).join(' ');
  return generate(tree.program.body[0].expression, { compact: false }).code;
}
function templateFor(source, names, scope) {
  const tree = parseDom(source), replacements = [];
  const replace = (loc, text) => replacements.push({ start: loc.start.offset, end: loc.end.offset, text });
  function visit(node, inherited = new Set()) {
    if (node.type === 5) { replace(node.content.loc, namespaceExpression(node.content.content, names, scope, inherited)); return; }
    if (node.type !== 1) { for (const child of node.children ?? []) visit(child, inherited); return; }
    const bound = new Set(inherited);
    const iteration = node.props.find(prop => prop.type === 7 && prop.name === 'for');
    if (iteration) {
      const match = /^(.*?)\s+(in|of)\s+([\s\S]+)$/.exec(iteration.exp.content);
      if (!match) throw new Error('Unsupported v-for expression');
      const alias = match[1].trim().replace(/^\(|\)$/g, '');
      for (const entry of alias.split(',')) for (const name of locals(entry.trim())) bound.add(name);
      replace(iteration.exp.loc, `${match[1]} ${match[2]} ${namespaceExpression(match[3], names, scope, inherited)}`);
    }
    const slot = node.props.find(prop => prop.type === 7 && prop.name === 'slot');
    if (slot?.exp) for (const name of locals(slot.exp.content)) bound.add(name);
    for (const prop of node.props) {
      if (prop.type === 6 && prop.name === 'ref' && names.has(prop.value?.content)) {
        replace(prop.loc, `:ref="element => (${scope}.${prop.value.content} = element)"`);
      }
      if (prop.type !== 7 || ['for', 'slot'].includes(prop.name)) continue;
      if (prop.exp) replace(prop.exp.loc, namespaceExpression(prop.exp.content, names, scope, bound).replaceAll('"', '&quot;'));
      if (prop.arg && !prop.arg.isStatic) replace(prop.arg.loc, `[${namespaceExpression(prop.arg.content, names, scope, bound)}]`);
    }
    for (const child of node.children ?? []) visit(child, bound);
  }
  visit(tree);
  for (const replacement of replacements.sort((a, b) => b.start - a.start)) source = source.slice(0, replacement.start) + replacement.text + source.slice(replacement.end);
  return source;
}
const html = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

/** Inline source scenes with isolated setup state; never mount demo SFCs inside a wrapper. */
export function composeDemoComparison(scenes) {
  if (scenes.length < 2 || scenes.length > 3) throw new Error('Compare two or three related configuration scenes');
  const imports = new Map(), importBindings = new Map(), functions = [], templates = [], styles = [];
  for (const [index, scene] of scenes.entries()) {
    const { descriptor, errors } = parseSfc(scene.source, { filename: scene.file });
    if (errors.length) throw new Error(`${scene.file}: invalid source SFC`);
    let script = descriptor.scriptSetup?.content ?? '';
    if (descriptor.script && !descriptor.scriptSetup) {
      const normal = ts.createSourceFile('normal.ts', descriptor.script.content, ts.ScriptTarget.Latest, true);
      const exported = normal.statements.find(ts.isExportAssignment);
      const object = exported && (ts.isCallExpression(exported.expression) ? exported.expression.arguments[0] : exported.expression);
      if (!object || !ts.isObjectLiteralExpression(object) || object.properties.some(prop => !['setup','name'].includes(prop.name?.getText(normal)))) throw new Error(`${scene.file}: Options API data/props needs an independent scene`);
      const setup = object.properties.find(prop => prop.name?.getText(normal) === 'setup');
      const statements = setup?.body?.statements ?? [];
      if (statements.length && (!ts.isReturnStatement(statements.at(-1)) || !ts.isObjectLiteralExpression(statements.at(-1).expression))) throw new Error(`${scene.file}: setup render function needs an independent scene`);
      script = normal.statements.filter(ts.isImportDeclaration).map(node => node.getText(normal)).join('\n') + '\n' + [...statements].slice(0,-1).map(node => node.getFullText(normal)).join('\n');
      script = script.replace(/\bdefineComponent\s*,\s*/g,'').replace(/,\s*defineComponent\b/g,'').replace(/import\s*\{\s*defineComponent\s*\}\s*from\s*['"]vue['"];?/g,'');
    }
    if (/\bdefine(?:Props|Emits|Expose|Model|Options|Slots)\s*[(<]|\bimport\.meta\b/.test(script)) throw new Error(`${scene.file}: retain macro/entry scene separately`);
    const tree = ts.createSourceFile(scene.file + '.ts', script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const names = new Set(), body = [];
    for (const statement of tree.statements) {
      if (ts.isImportDeclaration(statement)) {
        const clause = statement.importClause;
        const bindings = [...(clause?.name ? [clause.name.text] : []), ...(clause?.namedBindings ? ts.isNamedImports(clause.namedBindings) ? clause.namedBindings.elements.map(element => element.name.text) : [clause.namedBindings.name.text] : [])];
        for (const name of bindings) {
          const key = statement.moduleSpecifier.text + ':' + (clause?.isTypeOnly ? 'type:' : '') + (clause?.name?.text === name ? 'default' : clause?.namedBindings && ts.isNamedImports(clause.namedBindings) ? clause.namedBindings.elements.find(element => element.name.text === name)?.propertyName?.text ?? name : '*');
          if (importBindings.has(name) && importBindings.get(name) !== key) throw new Error(`${scene.file}: conflicting import ${name}`);
          importBindings.set(name, key);
        }
        // Reconstruct import clauses one binding at a time, avoiding duplicate locals.
        const module = JSON.stringify(statement.moduleSpecifier.text);
        if (!clause) imports.set(`side:${module}`, `import ${module}`);
        if (clause?.name) imports.set(clause.name.text, `import ${clause.isTypeOnly ? 'type ' : ''}${clause.name.text} from ${module}`);
        if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings)) imports.set(clause.namedBindings.name.text, `import ${clause.isTypeOnly ? 'type ' : ''}* as ${clause.namedBindings.name.text} from ${module}`);
        if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) for (const element of clause.namedBindings.elements) imports.set(element.name.text, `import ${clause.isTypeOnly || element.isTypeOnly ? 'type ' : ''}{ ${element.getText(tree).replace(/^type\s+/, '')} } from ${module}`);
      } else {
        if (statement.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)) throw new Error(`${scene.file}: exports cannot be merged`);
        if (ts.isVariableStatement(statement)) for (const declaration of statement.declarationList.declarations) for (const name of declared(declaration.name)) names.add(name);
        else if (statement.name && ts.isIdentifier(statement.name) && !ts.isInterfaceDeclaration(statement) && !ts.isTypeAliasDeclaration(statement)) names.add(statement.name.text);
        body.push(statement.getFullText(tree));
      }
    }
    const scope = `scene${index + 1}`;
    if (names.size) functions.push(`const ${scope} = demoProxyRefs((() => {\n${body.join('\n')}\nreturn { ${[...names].join(', ')} }\n})())`);
    else if (body.join('').trim()) functions.push(body.join('\n'));
    const template = templateFor(descriptor.template?.content ?? '', names, scope).trim();
    templates.push(`  <section class="demo-comparison-case demo-comparison-case--${index + 1}" data-comparison-scene="${html(scene.name)}">\n    <h4><span lang="zh-CN">${html(scene.title)}</span><span lang="en-US">${html(scene.en)}</span></h4>\n${template.split('\n').map(line => '    ' + line).join('\n')}\n  </section>`);
    for (const style of descriptor.styles) {
      if (style.module || /@import|:root|:global|@(?:-webkit-)?keyframes/.test(style.content)) throw new Error(`${scene.file}: global/module styles require an independent scene`);
      styles.push(`.demo-comparison-case--${index + 1} {\n${style.content}\n}`);
    }
  }
  if (functions.some(source => /^const scene\d+ = demoProxyRefs/.test(source))) imports.set('demoProxyRefs', "import { proxyRefs as demoProxyRefs } from 'vue'");
  return `<script setup lang="ts">\n${[...imports.values()].join('\n')}\n\n${functions.join('\n\n')}\n</script>\n\n<template>\n<div class="demo-comparison">\n${templates.join('\n\n')}\n</div>\n</template>\n\n<style scoped lang="less">\n.demo-comparison { display: grid; gap: 24px; min-width: 0; max-width: 100%; }\n.demo-comparison-case { min-width: 0; max-width: 100%; }\n.demo-comparison-case > h4 { margin: 0 0 12px; font-size: 14px; }\nhtml:not([lang='en-US']) .demo-comparison-case > h4 > [lang='en-US'],\nhtml[lang='en-US'] .demo-comparison-case > h4 > [lang='zh-CN'] { display: none; }\n${styles.join('\n')}\n</style>\n`;
}
