// Module consumers choose development/production diagnostics; a standalone UMD
// build has no bundler (or Node process global) and is always production.
export function libraryDefines(format) {
  return {
    'process.env.NODE_ENV': format === 'umd' ? JSON.stringify('production') : 'process.env.NODE_ENV',
  }
}
