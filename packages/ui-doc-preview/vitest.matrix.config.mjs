import { createRequire } from 'node:module'
import base from './vitest.config.mjs'

const routerRequire = createRequire(
  new URL(
    process.env.DEMO_AUDIT_PLATFORM === 'maple'
      ? '../../../maple-design-mobile/packages/ui/package.json'
      : '../../../cedar-design-web/package.json',
    import.meta.url,
  ),
)
export default {
  ...base,
  resolve: {
    ...base.resolve,
    alias: [
      {
        find: 'vue-router',
        replacement: routerRequire.resolve('vue-router/package.json').replace(/package\.json$/, 'dist/vue-router.mjs'),
      },
      ...Object.entries(base.resolve.alias).map(([find, replacement]) => ({
        find,
        replacement,
      })),
      {
        find: '@config',
        replacement: new URL(
          '../../../maple-design-mobile/packages/cli/lib/node/config/maple.default.config.js',
          import.meta.url,
        ).pathname,
      },
      ...['cedar', 'maple'].flatMap((platform) => {
        const library = platform === 'cedar' ? '@cedar-design/ui-vue' : '@maple-design/ui-vue'
        const directory = new URL(
          platform === 'cedar'
            ? '../../../cedar-design-web/packages/ui/src/'
            : '../../../maple-design-mobile/packages/ui/src/',
          import.meta.url,
        ).pathname
        return [
          {
            find: new RegExp('^' + library + '$'),
            replacement: directory + 'index.ts',
          },
          {
            find: new RegExp('^' + library + '/(.+)/style$'),
            replacement: directory + '$1/style',
          },
        ]
      }),
    ],
  },
  test: {
    ...base.test,
    include: ['test/demo-matrix.test.ts', 'test/demo-topics.test.ts'],
    testTimeout: 30000,
    deps: { inline: ['vue-router'] },
  },
}
