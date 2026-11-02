import base from './vitest.config.mjs'
export default { ...base, server: { ...base.server, watch: { useFsEvents: false } }, test: { ...base.test, include: ['test/direction.test.ts'] } }
