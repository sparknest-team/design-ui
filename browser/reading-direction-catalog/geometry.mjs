import assert from 'node:assert/strict'
const readUntil=async(read,accept,message)=>{let value;const deadline=Date.now()+5000;do{value=await read();if(accept(value))return value;await new Promise(r=>setTimeout(r,30))}while(Date.now()<deadline);assert.fail(`${message}: ${JSON.stringify(value)}`)}
/** Domain-aware assertions supplement authored business contracts, not a generic screenshot pass. */
export async function assertDirectionGeometry({demo,component,library}) {
  const p=library==='cedar'?'c':'mp',checks=[]
  if(['pagination','page-header'].includes(component)) {
    const icons=demo.locator(component==='pagination'?`.${p}-pagination-step-icon,.${p}-pagination__step-icon`:`.${p}-page-header__back-icon`)
    for(const icon of await icons.all()) {
      const style=await icon.evaluate(el=>({dir:getComputedStyle(el).direction,matrix:getComputedStyle(el).transform}))
      if(style.dir==='rtl')assert.ok(style.matrix.startsWith('matrix(-1,'),'default navigation SVG follows RTL')
      else assert.ok(style.matrix==='none'||style.matrix.startsWith('matrix(1,'))
    }
    if(await icons.count())checks.push('default-navigation-icon-direction')
  }
  if(component==='verification-code') {
    const cells=demo.locator(`.${p}-verification-code__cells`).first()
    if(await cells.count()) {
      assert.equal(await cells.getAttribute('dir'),'ltr','codes retain string order in an LTR island')
      const inputs=cells.locator('input');if(await inputs.count()>1){const a=await inputs.nth(0).boundingBox(),b=await inputs.nth(1).boundingBox();if(a&&b)assert.ok(a.x<b.x,'code character order never reverses')}
      checks.push('code-string-order')
    }
  }
  if(component==='code'&&library==='maple') {
    const content=demo.locator('.mp-code').first();if(await content.count()){assert.equal(await content.evaluate(el=>getComputedStyle(el).direction),'ltr','source code retains LTR reading order');checks.push('source-code-ltr-isolation')}
  }
  if(component==='number-keyboard') {
    const keys=demo.locator('.mp-number-keyboard__keys').first()
    if(await keys.count()){assert.equal(await keys.getAttribute('dir'),'ltr');checks.push('numeric-keypad-order')}
  }
  if(component==='progress-group') {
    const line=demo.locator(`.${p}-progress-group--horizontal`).first(),segments=line.locator(`.${p}-progress-group__segment[tabindex="0"]`)
    if(await line.count()&&await segments.count()>0) {
      const segment=segments.nth(Math.min(1,(await segments.count())-1));await segment.focus()
      const highlight=line.locator(`.${p}-progress-group__active-segment`)
      await readUntil(async()=>{const a=await segment.boundingBox(),b=await highlight.boundingBox();return a&&b?{x:a.x-b.x,width:a.width-b.width}:null},v=>v&&Math.abs(v.x)<1.5&&Math.abs(v.width)<1.5,'progress highlight matches its real segment in either direction')
      const tooltip=line.getByRole('tooltip');if(await tooltip.count())await readUntil(async()=>{const a=await segment.boundingBox(),b=await tooltip.boundingBox();return a&&b?{delta:(a.x+a.width/2)-(b.x+b.width/2)}:null},v=>v&&Math.abs(v.delta)<2,'progress tooltip remains centered on its segment')
      await segment.evaluate(el=>el.blur());checks.push('logical-progress-highlight-and-tooltip')
    }
  }
  if(component==='progress') {
    const track=demo.locator(`.${p}-progress__track`).first(),bar=track.locator(`:scope > .${p}-progress__bar`).last()
    if(await bar.count()) {
      const a=await track.boundingBox(),b=await bar.boundingBox(),dir=await track.evaluate(el=>getComputedStyle(el).direction)
      if(a&&b&&b.width>0)assert.ok(Math.abs(dir==='rtl'?a.x+a.width-b.x-b.width:a.x-b.x)<1.5,'linear progress starts at the reading edge')
      checks.push('linear-progress-origin')
    }
  }
  return checks
}
