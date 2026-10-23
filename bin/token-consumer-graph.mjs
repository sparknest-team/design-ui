// A declaration is live only if it reaches a real CSS property, not merely
// another custom-property declaration. Include fallback references as well.
export function liveTokens(declarations) {
  const references = value => [...value.matchAll(/var\(\s*(--[\w-]+)/g)].map(match => match[1]);
  const dependencies = new Map();
  const live = new Set();
  for (const { prop, value } of declarations) {
    if (prop.startsWith('--')) {
      const deps = dependencies.get(prop) ?? new Set();
      references(value).forEach(name => deps.add(name));
      dependencies.set(prop, deps);
    } else references(value).forEach(name => live.add(name));
  }
  const pending = [...live];
  while (pending.length) {
    for (const name of dependencies.get(pending.pop()) ?? []) {
      if (!live.has(name)) { live.add(name); pending.push(name); }
    }
  }
  return live;
}
