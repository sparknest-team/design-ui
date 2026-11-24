// Normalize syntax only. Preserve semantic var() dependencies and units.
export function normalizeTokenValue(value, prefix) {
  // Only unwrap a complete Less escaped value. Ordinary quoted CSS strings and
  // partial/mismatched expressions must retain their string semantics.
  const literal = value
    .trim()
    .replace(/^~(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)')$/, (_, double, single) => double ?? single)
  const names = literal
    .replaceAll(`--${prefix}-`, '--PREFIX-')
    .replace(/var\(~(['"])(--PREFIX-[a-z0-9-]+)\1\)/g, 'var($2)')
  return names
    .split(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g)
    .map((part, index) =>
      index % 2
        ? part
        : part
            .replace(/\s+/g, ' ')
            .replace(/\(\s+/g, '(')
            .replace(/\s+\)/g, ')')
            .replace(/(^|[\s,(])(-?)\.(\d+)/g, '$1$20.$3')
            .replace(
              /rgb\(\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s*\/\s*([\d.]+)(%)?\s*\)/g,
              (_, red, green, blue, alpha, percent) =>
                `rgba(${red}, ${green}, ${blue}, ${Number(alpha) / (percent ? 100 : 1)})`,
            ),
    )
    .join('')
}
