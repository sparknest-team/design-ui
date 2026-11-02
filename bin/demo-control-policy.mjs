import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(path.join(root, 'cedar-design-web/packages/cedar-ui/package.json'));
const { parse } = require('@vue/compiler-sfc');
const { parse: parseTemplate } = require('@vue/compiler-dom');
const ts = require('typescript');
const configurationNames = /^(?:variant|size|mode|type|trigger|placement|placementValue|position|direction|align|justify|presentation|background|layout|shape|color|status|density|panelType|dateFields|timeFields|openTriggerTarget|duration|orientation|selectionMode|scenario|preset|fieldVariant|fieldSize|calendarMode|calendarZone|dateScenario|rangeLock|guardMode|uploadScenario|uploadLayout)$/;
const attribute = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;');

function evaluateStatic(script) {
  const ast = ts.createSourceFile('demo.ts', script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const values = new Map();
  function collect(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) values.set(node.name.text, node.initializer);
    ts.forEachChild(node, collect);
  }
  collect(ast);
  function value(node, seen = new Set()) {
    if (!node) return undefined;
    if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression(node)) return value(node.expression, seen);
    if (ts.isArrayLiteralExpression(node)) return node.elements.some(ts.isSpreadElement) ? undefined : node.elements.map(item => value(item, seen));
    if (ts.isObjectLiteralExpression(node)) return Object.fromEntries(node.properties.filter(ts.isPropertyAssignment).map(p => [p.name.text, value(p.initializer, seen)]));
    if (ts.isStringLiteral(node)) return node.text;
    if (ts.isNumericLiteral(node)) return Number(node.text);
    if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (ts.isIdentifier(node)) return seen.has(node.text) ? undefined : value(values.get(node.text), new Set(seen).add(node.text));
    if (ts.isCallExpression(node)) {
      if (ts.isIdentifier(node.expression) && ['ref', 'reactive', '__demoReactive'].includes(node.expression.text)) return value(node.arguments[0], seen);
      if (ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'map') return value(node.expression.expression, seen);
      if (ts.isPropertyAccessExpression(node.expression) && node.expression.expression.getText(ast) === 'Object' && node.expression.name.text === 'keys') {
        const object = value(node.arguments[0], seen);
        return object && Object.keys(object);
      }
    }
    return undefined;
  }
  return expression => {
    try {
      const node = ts.createSourceFile('expression.ts', `const v=(${expression})`, ts.ScriptTarget.Latest, true).statements[0].declarationList.declarations[0].initializer;
      return value(node);
    } catch { return undefined; }
  };
}
function property(node, name) {
  return node.props.find(p => p.type === 6 ? p.name === name : p.type === 7 && p.name === 'bind' && p.arg?.content === name);
}
function expression(prop) { return prop?.type === 6 ? prop.value?.content : prop?.exp?.content; }
function significant(node) { return node.children.filter(c => c.type !== 3 && (c.type !== 2 || c.content.trim())); }
function labelOf(node, parent, model) {
  for (const name of ['aria-label', 'label', 'placeholder']) {
    const prop = property(node, name);
    if (expression(prop)) return { value: expression(prop), bound: prop.type === 7 };
  }
  if (parent && ['div', 'label'].includes(parent.tag)) {
    const text = significant(parent).filter(c => c !== node).map(c => c.type === 2 ? c.content : c.type === 1 && c.tag === 'span' ? c.children.filter(x => x.type === 2).map(x => x.content).join('') : '').join('').trim();
    if (text) return { value: text, bound: false };
  }
  const name = model?.match(/\[['"]([^'"]+)['"]\]$/)?.[1] ?? model;
  return name ? { value: name, bound: false } : undefined;
}
function formItem(prefix, inner, label, small) {
  const attributes = label ? `${label.bound ? ':label' : 'label'}="${attribute(label.value)}"` : 'hide-label';
  return `<${prefix}-form-item layout="vertical"${small ? ' size="sm"' : ''} ${attributes}>\n${inner}\n</${prefix}-form-item>`;
}
function isConfiguration(model, owner, filename, form) {
  if (!model) return false;
  if (/^(?:__demo(?:Appearance|Layout|State)|appearance)\[/.test(model)) return true;
  if (owner === 'table' && form) return false; // Business filters already use a real form layout.
  if (/^(date|date-range)$/.test(owner) && /^(zone|lock)$/.test(model)) return true;
  if (owner === 'steps' && model === 'current') return true;
  if (owner === 'safe-area' && model === 'active') return true;
  return configurationNames.test(model);
}
function optionsOf(node, prefix, evaluate) {
  const bound = property(node, 'options');
  if (bound) {
    const options = evaluate(expression(bound));
    return { count: Array.isArray(options) ? options.length : undefined, source: expression(bound) };
  }
  const children = significant(node);
  if (children.length && children.every(c => c.type === 1 && [prefix + '-option', 'option'].includes(c.tag) && !c.props.some(p => p.type === 7 && ['for', 'if', 'else', 'else-if'].includes(p.name)) && c.children.every(child => child.type === 2 || child.type === 3))) {
    const staticProp = (element, name) => {
      const prop = property(element, name);
      return prop?.type === 6 ? prop.value?.content ?? true : prop ? evaluate(expression(prop)) : undefined;
    };
    const options = children.map(c => {
      const label = staticProp(c, 'label') ?? c.children.filter(x => x.type === 2).map(x => x.content).join('').trim();
      return { label, value: staticProp(c, 'value') ?? label, ...(property(c, 'disabled') ? { disabled: staticProp(c, 'disabled') } : {}) };
    });
    if (options.every(o => typeof o.label === 'string' && o.label.length && o.value !== undefined)) return { count: options.length, source: JSON.stringify(options), children: true };
  }
  return {};
}

/** Classify and migrate authored controls; actual Select targets keep their component API. */
export function normalizeDemoControls(source, prefix, filename = 'demo.vue') {
  const parsed = parse(source, { filename });
  if (parsed.errors.length) throw new Error(`${filename}: ${parsed.errors.join(', ')}`);
  const { descriptor } = parsed;
  if (!descriptor.template) return { source, controls: [] };
  const offset = descriptor.template.loc.start.offset;
  const ast = parseTemplate(descriptor.template.content);
  const evaluate = evaluateStatic(descriptor.scriptSetup?.content ?? descriptor.script?.content ?? '');
  const owner = filename.match(/\/src\/([^/]+)/)?.[1] ?? '';
  const edits = [], controls = [];
  function replace(node, text) { edits.push({ start: offset + node.loc.start.offset, end: offset + node.loc.end.offset, text }); }
  function visit(node, parents = []) {
    if (node.type === 1 && [prefix + '-select', 'select'].includes(node.tag)) {
      const parent = parents.at(-1);
      const form = parents.some(p => p.tag === prefix + '-form-item');
      const model = node.props.find(p => p.type === 7 && p.name === 'model')?.exp?.content;
      const config = isConfiguration(model, owner, filename, form);
      const options = optionsOf(node, prefix, evaluate);
      const special = ['multiple', 'filterable', 'searchable', 'remote'].some(name => {
        const prop = property(node, name);
        return prop && expression(prop) !== 'false';
      });
      const small = config && !special && options.count > 0 && options.count <= 5;
      let inner = node.loc.source;
      let reason = config ? options.count > 5 ? 'long-configuration-list' : special ? 'search-or-multiple' : options.count ? 'small-configuration' : 'dynamic-configuration' : 'select-feature-or-business-field';
      if (small) {
        const omit = new Set(['options', 'clearable', 'presentation', 'hint', 'placeholder', 'label', 'variant', 'size', 'width']);
        const attrs = node.props.filter(p => !(p.type === 7 && p.name === 'on') && !omit.has(p.type === 6 ? p.name : p.type === 7 && p.name === 'bind' ? p.arg?.content : '')).map(p => p.loc.source);
        const events = node.props.filter(p => p.type === 7 && p.name === 'on').map(p => p.loc.source);
        if (!property(node, 'aria-label')) {
          const label = labelOf(node, parent, model);
          if (label) attrs.push(`${label.bound ? ':aria-label' : 'aria-label'}="${attribute(label.value)}"`);
        }
        // Keep events and model expressions, including numeric values and async state guards.
        inner = `<${prefix}-radio-group ${attrs.join(' ')} :options="${attribute(options.source)}" variant="button" size="sm" ${events.join(' ')} />`;
      } else if (config && !property(node, 'aria-label')) {
        const label = labelOf(node, parent, model);
        if (label) {
          const modelProp = node.props.find(p => p.type === 7 && p.name === 'model');
          const index = modelProp ? modelProp.loc.end.offset - node.loc.start.offset : node.tag.length + 1;
          inner = inner.slice(0, index) + ` ${label.bound ? ':aria-label' : 'aria-label'}="${attribute(label.value)}"` + inner.slice(index);
        }
      }
      const simpleParent = parent && ['div', 'label'].includes(parent.tag) && parent.props.length === 0 && significant(parent).every(c => c === node || c.type === 2 || c.type === 1 && c.tag === 'span' && significant(c).every(x => x.type === 2));
      const column = parents.some(p => p.tag === prefix + '-space' && expression(property(p, 'direction')) === 'column' && expression(property(p, 'block')) !== 'false');
      const bounded = form || column || parents.some(p => [prefix + '-cell', prefix + '-col'].includes(p.tag)) || !!property(node, 'style') || /control-sizes\.vue$/.test(filename);
      if (config || !bounded) {
        const label = config ? labelOf(node, parent, model) : undefined;
        if (form) { if (inner !== node.loc.source) replace(node, inner); }
        else if (simpleParent) replace(parent, formItem(prefix, inner, labelOf(node, parent, model), config));
        else replace(node, formItem(prefix, inner, label, config));
      } else if (small) replace(node, inner);
      controls.push({ model, count: options.count ?? null, kind: small ? 'radio' : 'select', reason, width: form ? 'form-item' : config || !bounded ? 'standard-form-item' : 'existing-container' });
      return;
    }
    const next = node.type === 1 ? [...parents, node] : parents;
    for (const child of node.children ?? []) visit(child, next);
  }
  visit(ast);
  // Parent wrapping owns its select child. No nested independent edits may overlap.
  const selected = edits.filter(edit => !edits.some(other => other !== edit && other.start <= edit.start && other.end >= edit.end));
  let result = source;
  for (const edit of selected.sort((a, b) => b.start - a.start)) result = result.slice(0, edit.start) + edit.text + result.slice(edit.end);
  return { source: normalizeFieldAreas(result, prefix), controls };
}

function normalizeFieldAreas(source, prefix) {
  const { descriptor } = parse(source);
  if (!descriptor.template) return source;
  const ast = parseTemplate(descriptor.template.content), offset = descriptor.template.loc.start.offset, edits = [];
  function visit(node, parents = []) {
    if (node.type === 1 && node.tag === prefix + '-form-item' && expression(property(node, 'size')) === 'sm') {
      const label = property(node, 'label');
      for (const child of node.children ?? []) {
        if (child.type === 1 && child.tag === prefix + '-radio-group' && !property(child, 'aria-label') && label) {
          const modelProp = child.props.find(p => p.type === 7 && p.name === 'model');
          const position = modelProp ? offset + modelProp.loc.end.offset : offset + child.loc.start.offset + child.tag.length + 1;
          edits.push({ start: position, end: position, text: ` ${label.type === 7 ? ':aria-label' : 'aria-label'}="${attribute(expression(label))}"` });
        }
      }
    }
    if (node.type === 1 && node.tag === prefix + '-space' && !parents.some(parent => parent.tag === prefix + '-form')) {
      const children = significant(node);
      const managedFields = children.some(child => child.type === 1 && child.tag === prefix + '-form-item' && expression(property(child, 'layout')) === 'vertical' && (expression(property(child, 'size')) === 'sm' || property(child, 'hide-label')));
      if (managedFields) {
        const openingEnd = node.loc.source.match(/^<[^\s>]+\b(?:"[^"]*"|'[^']*'|[^'">])*>/)[0].length;
        const allFields = children.every(child => child.type === 1 && [prefix + '-form-item', prefix + '-checkbox'].includes(child.tag));
        const omit = new Set(['direction', 'align', ...(allFields ? ['size', 'wrap', 'justify', 'block'] : [])]);
        const attrs = node.props.filter(p => !omit.has(p.type === 6 ? p.name : p.type === 7 && p.name === 'bind' ? p.arg?.content : '')).map(p => p.loc.source).join(' ');
        if (allFields) {
          edits.push({ start: offset + node.loc.start.offset, end: offset + node.loc.start.offset + openingEnd, text: `<${prefix}-form layout="vertical"${attrs ? ' ' + attrs : ''}>` });
          edits.push({ start: offset + node.loc.end.offset - (`</${prefix}-space>`).length, end: offset + node.loc.end.offset, text: `</${prefix}-form>` });
        } else {
          edits.push({ start: offset + node.loc.start.offset, end: offset + node.loc.start.offset + openingEnd, text: `<${prefix}-space direction="column" align="stretch"${attrs ? ' ' + attrs : ''}>` });
        }
      }
    }
    for (const child of node.children ?? []) visit(child, node.type === 1 ? [...parents, node] : parents);
  }
  visit(ast);
  for (const edit of edits.sort((a, b) => b.start - a.start)) source = source.slice(0, edit.start) + edit.text + source.slice(edit.end);
  return source;
}

/** Simple one-axis layouts use Space; positioned, explicit-column and component teaching layouts stay authored. */
export function normalizeSimpleLayout(source, prefix, filename = '') {
  if (/\/src\/(?:space|row|col|grid)\//.test(filename)) return source;
  const { descriptor } = parse(source, { filename });
  if (!descriptor.template) return source;
  const ast = parseTemplate(descriptor.template.content), offset = descriptor.template.loc.start.offset, edits = [];
  function visit(node) {
    if (node.type === 1 && node.tag === 'div' && !node.isSelfClosing && !property(node, 'ref') && !property(node, 'role') && !node.props.some(p => p.type === 7 && ['html', 'text'].includes(p.name))) {
      const style = property(node, 'style');
      if (style?.type === 6 && style.value) {
        const declarations = Object.fromEntries(style.value.content.split(';').filter(x => x.trim()).map(x => x.split(/:(.*)/s).slice(0, 2).map(v => v.trim())));
        const display = declarations.display;
        if (['flex', 'grid'].includes(display) && (!declarations['flex-direction'] || ['row', 'column'].includes(declarations['flex-direction'])) && !['position', 'transform', 'grid-template-columns', 'grid-template-rows'].some(key => key in declarations)) {
          const allowed = new Set(['display', 'flex-direction', 'flex-wrap', 'gap', 'align-items', 'justify-content', 'width', 'max-width', 'margin-bottom', 'padding']);
          if (Object.keys(declarations).every(key => allowed.has(key))) {
            const props = [];
            if (display === 'grid' || declarations['flex-direction'] === 'column') props.push('direction="column"');
            else if (declarations['flex-wrap'] === 'wrap' || !declarations['flex-wrap']) props.push('wrap');
            if (declarations.gap) props.push(`size="${attribute(declarations.gap)}"`);
            if (declarations['align-items']) props.push(`align="${attribute(declarations['align-items'])}"`);
            if (declarations['justify-content']) props.push(`justify="${attribute(declarations['justify-content'])}"`);
            for (const key of ['display', 'flex-direction', 'flex-wrap', 'gap', 'align-items', 'justify-content']) delete declarations[key];
            const remaining = Object.entries(declarations).map(([key, val]) => `${key}: ${val}`).join('; ');
            const attrs = node.props.filter(p => p !== style).map(p => p.loc.source).join(' ');
            const openingEnd = node.loc.source.match(/^<div\b(?:"[^"]*"|'[^']*'|[^'">])*>/)[0].length;
            edits.push({ start: offset + node.loc.start.offset, end: offset + node.loc.start.offset + openingEnd, text: `<${prefix}-space ${props.join(' ')}${attrs ? ' ' + attrs : ''}${remaining ? ` style="${attribute(remaining)}"` : ''}>` });
            edits.push({ start: offset + node.loc.end.offset - 6, end: offset + node.loc.end.offset, text: `</${prefix}-space>` });
          }
        }
      }
    }
    for (const child of node.children ?? []) visit(child);
  }
  visit(ast);
  for (const edit of edits.sort((a, b) => b.start - a.start)) source = source.slice(0, edit.start) + edit.text + source.slice(edit.end);
  return source;
}

export function renderConfigurationField(prefix, field, model) {
  if (!field.options) return `<${prefix}-checkbox v-model="${model}">${field.name}</${prefix}-checkbox>`;
  const tag = field.options.length <= 5 ? 'radio-group' : 'select';
  const attrs = tag === 'radio-group' ? 'variant="button" size="sm"' : ':clearable="false"';
  const control = `<${prefix}-${tag} v-model="${model}" ${attrs} :options="${attribute(JSON.stringify(field.options.map(value => ({ label: value, value }))))}" aria-label="${attribute(field.name)}" />`;
  return formItem(prefix, control, { value: field.name, bound: false }, true);
}

export function normalizeDemoSource(source, prefix, filename) {
  const first = normalizeDemoControls(source, prefix, filename);
  const layout = normalizeSimpleLayout(first.source, prefix, filename);
  return { source: normalizeDemoControls(layout, prefix, filename).source, controls: first.controls };
}
