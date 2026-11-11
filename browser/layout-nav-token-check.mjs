import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const workspace=fileURLToPath(new URL('../../',import.meta.url));
const require=createRequire(workspace+'cedar-design-web/packages/ui/package.json');
const {chromium}=createRequire(workspace+'cedar-design-web/package.json')('playwright');
const less=require('less');
const root=workspace+'cedar-design-web/packages/ui/src/';
const input=['style/theme/css-variables.less','layout/style/index.less','nav-menu/style/index.less'].map(file=>'@import "'+root+file+'";').join('\n');
const {css}=await less.render(input,{filename:root+'__layout_nav_consumer_fixture.less',javascriptEnabled:true});
const output=process.env.LAYOUT_NAV_EVIDENCE_DIR??workspace+'design-ui/artifacts/layout-nav-tokens';
fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true});const results=[];
try{
 const page=await browser.newPage({viewport:{width:1100,height:850}});
 const markup=id=>`<section id="${id}" class="scope"><div class="c-layout-sider"><div class="c-layout-sider-children">Sider</div><button class="c-layout-sider-trigger">Toggle</button></div><nav class="c-nav-menu"><div class="c-nav-menu__item normal">Normal</div><div class="c-nav-menu__item c-nav-menu--selected">Selected</div><div class="c-nav-menu__item c-nav-menu--disabled">Disabled</div></nav><div class="c-nav-menu__popup"><div class="c-nav-menu__item">Popup item</div></div></section>`;
 await page.setContent('<style>'+css+'\nbody{margin:24px;font:14px system-ui}.scope{padding:16px;margin:16px 0;border:1px solid #888;display:flex;gap:24px;align-items:start}.c-layout-sider{position:relative;width:180px;height:160px}.c-nav-menu{width:220px}.c-nav-menu__popup{position:static;width:220px}*{transition:none!important}</style>'+markup('global')+'<div data-c-theme="dark">'+markup('dark')+'<div data-c-theme="light">'+markup('light')+'</div></div>');
 const value=(selector,property)=>page.locator(selector).first().evaluate((element,property)=>getComputedStyle(element).getPropertyValue(property),property);
 for(const globalTheme of ['light','dark']){
  await page.evaluate(theme=>document.documentElement.setAttribute('cedar-theme',theme),globalTheme);
  assert.equal(await value('#global .c-layout-sider','background-color'),globalTheme==='dark'?'rgb(35, 35, 36)':'rgb(255, 255, 255)');
  for(const[id,expected]of [['dark','rgb(35, 35, 36)'],['light','rgb(255, 255, 255)']]){
   for(const selector of ['.c-layout-sider','.c-nav-menu','.c-nav-menu__popup'])assert.equal(await value('#'+id+' '+selector,'background-color'),expected,globalTheme+'/'+id+'/'+selector);
  }
  results.push({globalTheme,nestedDarkAndLight:'passed'});
 }
 const overrides={
  '--c-layout-sider-background-light':'rgb(20, 30, 40)',
  '--c-layout-font-color':'rgb(210, 220, 230)',
  '--c-layout-sider-light-box-shadow':'0 3px 8px rgb(30, 40, 50)',
  '--c-nav-menu-light-bg':'rgb(10, 20, 30)',
  '--c-nav-menu-light-item-bg-hover':'rgb(40, 50, 60)',
  '--c-nav-menu-light-item-bg-selected':'rgb(70, 80, 90)',
  '--c-nav-menu-light-item-text-color':'rgb(190, 200, 210)',
  '--c-nav-menu-light-item-text-color-selected':'rgb(220, 230, 240)',
  '--c-nav-menu-light-item-text-color-disabled':'rgb(110, 120, 130)',
 };
 for(const id of ['global','dark','light']){
  await page.locator('#'+id).evaluate((host,values)=>{for(const[name,value]of Object.entries(values))host.style.setProperty(name,value)},overrides);
  assert.equal(await value('#'+id+' .c-layout-sider','background-color'),'rgb(20, 30, 40)');
  assert.equal(await value('#'+id+' .c-layout-sider-trigger','color'),'rgb(210, 220, 230)');
  assert.ok((await value('#'+id+' .c-layout-sider','box-shadow')).includes('rgb(30, 40, 50)'));
  for(const selector of ['.c-nav-menu','.c-nav-menu__popup'])assert.equal(await value('#'+id+' '+selector,'background-color'),'rgb(10, 20, 30)');
  assert.equal(await value('#'+id+' .normal','color'),'rgb(190, 200, 210)');
  assert.equal(await value('#'+id+' .c-nav-menu--selected','background-color'),'rgb(70, 80, 90)');
  assert.equal(await value('#'+id+' .c-nav-menu--selected','color'),'rgb(220, 230, 240)');
  assert.equal(await value('#'+id+' .c-nav-menu--disabled','color'),'rgb(110, 120, 130)');
  await page.locator('#'+id+' .normal').hover();assert.equal(await value('#'+id+' .normal','background-color'),'rgb(40, 50, 60)');
  await page.locator('#'+id).evaluate(host=>host.style.setProperty('--c-layout-sider-light-box-shadow','none'));
  assert.equal(await value('#'+id+' .c-layout-sider','box-shadow'),'none');
  results.push({scope:id,publicOverrides:'passed',shadowNone:'passed',hoverSelectedDisabled:'passed'});
 }
 await page.screenshot({path:output+'/overrides.png'});
 fs.writeFileSync(output+'/results.json',JSON.stringify({browser:await browser.version(),scope:'Real compiled foundation/Layout/NavMenu CSS, global and nested explicit theme boundaries, matching rendered DOM classes. Component behavior is covered separately by Vue tests.',results},null,2)+'\n');
 console.log(JSON.stringify({passed:results.length,results},null,2));
}finally{await browser.close()}
