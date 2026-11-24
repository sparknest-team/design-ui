import base from './vitest.config.mjs'

export default { ...base, test: { ...base.test, include: ['test/direction.test.ts'] } }
