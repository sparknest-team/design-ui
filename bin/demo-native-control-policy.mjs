// Native form ownership is the subject of these two Search examples.
const nativeFormExamples = new Set([
  'cedar-design-web/packages/ui/src/search/__demos__/native-form.vue',
  'maple-design-mobile/packages/ui/src/search/example/demos/native-form.vue',
])

export function allowsNativeDemoControl(workspaceRelativeFile, tag) {
  return tag === 'form' && nativeFormExamples.has(workspaceRelativeFile)
}
