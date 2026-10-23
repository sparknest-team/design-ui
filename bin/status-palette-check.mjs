import assert from 'node:assert/strict';
import {auditThemes,rgba,over,luminance} from './theme-audit-utils.mjs';
const roles={brand:'primary',info:'blue',success:'success',warning:'warning',danger:'danger'};
let checks=0,pairs=0,failures=0;const summary={};
const ratio=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
await auditThemes('button',({prefix:p,repo,brand,mode,variables,expand})=>{
 for(const [role,palette] of Object.entries(roles)) {
  const expected=expand(`rgb(var(--${p}-${palette}-6))`);
  const content=expand(`var(--${p}-sys-color-content-${role})`);
  const fill=expand(`var(--${p}-sys-color-${role==='brand'?'action-primary':`status-${role}`})`);
  const normalize=v=>v.replace(/\s+/g,'');
  assert.equal(normalize(content),normalize(expected),`${repo}/${brand}/${mode}/${role}/foreground`);
  assert.equal(normalize(fill),normalize(expected),`${repo}/${brand}/${mode}/${role}/fill`);checks+=2;
  summary[role]??={minimum:Infinity,failures:0,whiteOnFillMinimum:Infinity};
  for(const surface of ['page','default','raised','overlay','muted']) {
   const bg=over(rgba(expand(`var(--${p}-sys-color-surface-${surface})`)),rgba(expand(`var(--${p}-sys-color-surface-page)`)));
   const contrast=ratio(over(rgba(content),bg),bg);pairs++;summary[role].minimum=Math.min(summary[role].minimum,contrast);
   if(contrast<4.5){failures++;summary[role].failures++;}
  }
  summary[role].whiteOnFillMinimum=Math.min(summary[role].whiteOnFillMinimum,ratio([255,255,255,1],rgba(fill)));
 }
});
for(const v of Object.values(summary)){v.minimum=v.minimum.toFixed(3);v.whiteOnFillMinimum=v.whiteOnFillMinimum.toFixed(3);}
console.log(JSON.stringify({checks,pairs,failures,summary}));
