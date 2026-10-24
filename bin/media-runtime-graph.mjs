import { runtimeGraph } from './runtime-dependency-graph.mjs'

export { findRuntimeCycles } from './runtime-dependency-graph.mjs'

/** Focused closure retained in addition to the whole-library dependency gate. */
export function mediaRuntimeGraph(sourceDir, packageName) {
  return runtimeGraph(sourceDir, packageName, ['image/index.ts', 'upload/index.ts'])
}
