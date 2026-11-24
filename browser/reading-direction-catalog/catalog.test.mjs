import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineProductionComponentTests } from '../runner.mjs'

const library = process.env.DIRECTION_LIBRARY
if (!['cedar', 'maple'].includes(library)) throw new Error('DIRECTION_LIBRARY must be cedar or maple')
defineProductionComponentTests({
  root: resolve(
    fileURLToPath(new URL('.', import.meta.url)),
    '../../../',
    library === 'cedar' ? 'cedar-design-web' : 'maple-design-mobile',
  ),
  library,
})
