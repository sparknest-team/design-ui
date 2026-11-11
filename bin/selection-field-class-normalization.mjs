// Only normalize the known brand prefix in explicit Tag size-class assertions.
export function normalizeTagSizeAssertions(source) {
  return source.replace(/(\.toContain\(['"])c-(tag--size-(?:xs|sm|md|lg|xl))(?=['"]\))/g, '$1mp-$2')
}
