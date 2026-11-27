import ts from 'typescript-js'
import { downlevelVueDeclarations } from '../packages/ui-build/src/vue-declarations.mjs'

const root = process.cwd()
downlevelVueDeclarations(root, process.argv[2] ?? 'lib', ts)
