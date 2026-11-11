// Local theme boundaries share the root declarations, not a separate token value.
export function tokenSelectorCondition(selector = '') {
  if (!selector.includes(':root')) return selector;
  return selector.replace(/,\s*:where\(\[data-(?:c|mp)-theme(?:=(?:"dark"|'dark'|dark))?\]\)/g, '');
}
