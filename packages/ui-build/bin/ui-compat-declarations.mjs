#!/usr/bin/env node
import ts from 'typescript-js'
import { downlevelVueDeclarations } from '../src/vue-declarations.mjs'

downlevelVueDeclarations(process.cwd(), process.argv[2] ?? 'lib', ts)
