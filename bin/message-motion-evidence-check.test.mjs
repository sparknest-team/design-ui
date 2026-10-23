import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { evidenceURL, validateMessageEvidence } from './message-motion-evidence-check.mjs'
const source = JSON.parse(readFileSync(evidenceURL)), jpeg = readFileSync(new URL('native.jpg', evidenceURL))
test('accepts eight actual Message cases', ()=>validateMessageEvidence(source,jpeg))
for (const [name, change] of [
  ['missing group', r=>r.cases.pop()],
  ['duplicate group', r=>r.cases[1].id=r.cases[0].id],
  ['leftover node', r=>r.cases[0].finalNodes=1],
  ['duplicate closed', r=>r.cases[0].callbacks.push(['closed',10000])],
  ['shortened long leave', r=>r.cases[1].entries[0].removed=r.cases[1].entries[0].leaveTo+200],
  ['premature closed', r=>r.cases[1].callbacks.at(-1)[1]=r.cases[1].entries[0].leaveTo+200],
  ['wrong CSS duration', r=>r.cases[1].duration='0.15s'],
  ['wrong easing', r=>r.cases[1].easing='ease'],
  ['old deadline closes replacement', r=>r.cases[3].callbacks[5][1]=r.cases[3].commands[2][1]+200],
  ['reused DOM identity', r=>r.cases[3].entries[1].identity=r.cases[3].entries[0].identity],
  ['fake OS acceptance', r=>r.osPreferencePassesAdded=8],
  ['short native elapsed time', r=>r.nativeLeavingEnds[0].elapsedSeconds=0.2],
]) test('rejects '+name,()=>{const r=structuredClone(source);change(r);assert.throws(()=>validateMessageEvidence(r,jpeg))})
test('rejects altered original image',()=>{const bytes=Buffer.from(jpeg);bytes[bytes.length-1]^=1;assert.throws(()=>validateMessageEvidence(source,bytes))})
