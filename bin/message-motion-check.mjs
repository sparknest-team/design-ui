import assert from 'node:assert/strict'
import { auditThemes } from './theme-audit-utils.mjs'
let normal = 0, reduced = 0
const platforms = process.argv.includes('--cedar-only') ? ['c'] : process.argv.includes('--maple-only') ? ['mp'] : ['c','mp']
await auditThemes('message', ({prefix,tag,cascade,variables,expand})=>{
  const names = prefix === 'c' ? ['c-message','fade-message-enter-active','fade-message-appear-active','fade-message-leave-active'] : ['mp-message-fade-enter-active','mp-message-fade-leave-active']
  const duration = '--'+prefix+'-message-transition-duration', curve = '--'+prefix+'-message-transition-timing-function'
  for (const className of names) {
    tag.className=className
    const css=cascade(tag).transition
    assert.ok(css.includes('var('+duration+')'));assert.ok(css.includes('var('+curve+')'))
    assert.match(expand(css), /[\d.]+(?:ms|s)/, 'normal defaults must resolve before override')
    const oldD=variables[duration],oldC=variables[curve]
    variables[duration]='777ms';variables[curve]='linear'
    assert.ok(expand(css).includes('777ms linear'))
    variables[duration]=oldD;variables[curve]=oldC
    normal++
  }
  if(prefix==='c'){
    tag.className='c-message-icon'
    const animation=cascade(tag).animation
    const iconD='--c-message-transition-duration-icon',iconC='--c-message-transition-timing-function-icon'
    for(const key of [duration,curve,iconD,iconC])assert.ok(animation.includes('var('+key+')'))
    assert.match(expand(animation), /[\d.]+(?:ms|s)/, 'icon defaults must resolve before override')
    variables[duration]='777ms';variables[curve]='linear';variables[iconD]='999ms';variables[iconC]='steps(2, end)'
    const expanded=expand(animation)
    assert.ok(expanded.includes('c-msg-fade 777ms linear'));assert.ok(expanded.includes('c-msg-fade 999ms steps(2, end)'))
    normal++
  }
},{platforms,themeFileName:null})
await auditThemes('message', ({prefix,tag,cascade})=>{
  if(prefix==='c'){
    for(const className of ['c-message','fade-message-enter-active','fade-message-appear-active','fade-message-leave-active']){
      tag.className=className
      assert.equal(cascade(tag).transition,'none',className+': isolated reduced transition')
      reduced++
    }
    tag.className='c-message-icon'
    assert.equal(cascade(tag).animation,'none','Cedar icon fade')
    reduced++
    for(const phase of ['enter-from','leave-to']){
      for(const [placement,transform] of [['top','translateX(-50%)'],['center','translate(-50%, -50%)']]){
        tag.className='c-message c-message-standalone c-message-standalone-'+placement+' fade-message-'+phase
        assert.equal(cascade(tag).transform,transform,'Cedar static placement survives reduce')
        reduced++
      }
    }
  }else{
    for(const phase of ['enter-active','leave-active']){
      tag.className='mp-message-fade-'+phase
      assert.equal(cascade(tag).transition,'none','Maple isolated reduced transition')
      reduced++
    }
    for(const phase of ['enter-from','leave-to']){
      for(const [classes,transform] of [
        ['', 'none'],
        [' mp-message__standalone mp-message__standalone-top','translateX(-50%)'],
        [' mp-message__standalone mp-message__standalone-center','translate(-50%, -50%)'],
      ]){
        tag.className='mp-message mp-message-fade-'+phase+classes
        assert.equal(cascade(tag).transform,transform,'Maple static placement must survive reduce: '+tag.className)
        reduced++
      }
    }
  }
},{platforms,themeFileName:null,reducedMotion:true})
console.log('Message compiled motion: '+normal+' consumers/paired overrides; '+reduced+' reduced selectors/layout cases. Not browser/OS acceptance.')
