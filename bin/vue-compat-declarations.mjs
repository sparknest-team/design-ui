import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { downlevelVueDeclarations } from '../packages/ui-build/src/vue-declarations.mjs'

const root = process.cwd()
const require = createRequire(resolve(root, 'package.json'))
downlevelVueDeclarations(root, process.argv[2] ?? 'lib', require('typescript'))
