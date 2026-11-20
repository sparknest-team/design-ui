// Native form ownership is the subject of these localized Search examples.
const nativeFormExamples = new Set([
  'cedar-design-web/packages/ui/src/search/__demos__/native-form.vue',
  'cedar-design-web/packages/ui/src/search/__demos__/native-form.en-US.vue',
  'maple-design-mobile/packages/ui/src/search/example/demos/native-form.vue',
  'maple-design-mobile/packages/ui/src/search/example/demos/en-US/native-form.vue',
])

export function allowsNativeDemoControl(workspaceRelativeFile, tag) {
  return tag === 'form' && nativeFormExamples.has(workspaceRelativeFile)
}
