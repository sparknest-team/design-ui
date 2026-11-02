import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const { rules } = JSON.parse(fs.readFileSync(new URL('../configs/component-feature-taxonomy.json', import.meta.url), 'utf8'));
export function featureRows(component, documentation, references) {
  return rules.filter(rule => (!rule.groups || rule.groups.includes(component.group)) && (!rule.components || rule.components.includes(component.id)) && !rule.excludeComponents?.includes(component.id)).flatMap(rule => {
    const pattern = new RegExp(rule.pattern, 'i');
    const matches = value => pattern.test(value.replace(/([a-z0-9])([A-Z])/g, '$1-$2'));
    const demos = component.demos.filter(demo => matches(demo.title + ' ' + demo.source));
    const apiLine = rule.apiPattern ? documentation.split('\n').find(line => new RegExp(rule.apiPattern, 'i').test(line)) : undefined;
    const evidence = references.flatMap(reference => {
      const sample = reference._examples?.find(sample => matches(sample.title + ' ' + sample.file));
      return sample ? [{ library: reference.library, name: reference.name, ...sample }] : [];
    });
    if (!demos.length && !apiLine && !evidence.length) return [];
    return [{ id: rule.id, label: rule.label, status: demos.length ? 'demo' : apiLine ? 'documented' : 'candidate', demos: demos.slice(0, 2), documentation: apiLine?.trim(), evidence }];
  });
}
