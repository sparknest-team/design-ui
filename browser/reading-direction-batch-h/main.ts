import { createApp, defineComponent, h, ref } from 'vue'
import cButton, { ButtonGroup as cGroup } from '../../../cedar-design-web/packages/ui/src/button'
import cSplit from '../../../cedar-design-web/packages/ui/src/split-button'
import cSpace from '../../../cedar-design-web/packages/ui/src/space'
import cDivider from '../../../cedar-design-web/packages/ui/src/divider'
import cOption from '../../../cedar-design-web/packages/ui/src/menu/MenuOption.vue'
import '../../../cedar-design-web/packages/ui/src/button/style'
import '../../../cedar-design-web/packages/ui/src/split-button/style'
import '../../../cedar-design-web/packages/ui/src/space/style'
import '../../../cedar-design-web/packages/ui/src/divider/style'
import mButton, { ButtonGroup as mGroup } from '../../../maple-design-mobile/packages/ui/src/button'
import mSplit from '../../../maple-design-mobile/packages/ui/src/split-button'
import mSpace from '../../../maple-design-mobile/packages/ui/src/space'
import mDivider from '../../../maple-design-mobile/packages/ui/src/divider'
import mOption from '../../../maple-design-mobile/packages/ui/src/menu/MenuOption.vue'
import '../../../maple-design-mobile/packages/ui/src/button/style'
import '../../../maple-design-mobile/packages/ui/src/split-button/style'
import '../../../maple-design-mobile/packages/ui/src/space/style'
import '../../../maple-design-mobile/packages/ui/src/divider/style'
const style=document.createElement('style');style.textContent='body{font:14px sans-serif;margin:16px}.platforms{display:flex;gap:24px}.platform{width:570px;min-width:0}.case{margin:20px 0}.line{width:100%;box-sizing:border-box}.vertical-divider{height:100px;display:flex}.wrapped{width:190px}.tile{display:block;width:72px;height:26px;background:#eee}#portal{position:relative}output{display:block;direction:ltr;font-size:11px}';document.head.append(style)
createApp(defineComponent({setup(){
 const dir=ref('ltr'),disabled=ref(false),loading=ref(false),actions=ref(0),selections=ref<string[]>([]),opens=ref(0)
 const icon=()=>h('svg',{width:14,height:14,viewBox:'0 0 14 14','data-icon':''},[h('circle',{cx:7,cy:7,r:5,fill:'currentColor'})])
 const platform=(p:string,B:any,G:any,S:any,Space:any,D:any,O:any)=>h('section',{class:'platform'},[
 h('h2',p==='c'?'Cedar':'Maple'),
 ...['default','outline','text','tonal'].map(variant=>h('div',{id:p+'Group-'+variant,class:'case'},h(G,{variant,disabled:disabled.value},()=>['First','Middle','Last'].map((label,i)=>h(B,{dir:i===2?'rtl':'ltr',onClick:()=>actions.value++},()=>label))))),
 h('div',{id:p+'Single',class:'case'},h(G,{},()=>h(B,{},()=> 'Only'))),
 h('div',{id:p+'SingleVertical',class:'case'},h(G,{vertical:true},()=>h(B,{},()=> 'Only vertical'))),
 h('div',{id:p+'Vertical',class:'case'},h(G,{vertical:true},()=>['First','Last'].map(label=>h(B,{},()=>label)))),
 h('div',{id:p+'Icon',class:'case'},h(B,{loading:loading.value,disabled:disabled.value,onClick:()=>actions.value++},{default:()=> 'Action العربية',icon})),
 h('div',{id:p+'Stacked',class:'case'},h(B,{stacked:true},{default:()=> 'Stacked',icon})),
 h('div',{id:p+'Split',class:'case'},h(S,{disabled:disabled.value,popupContainer:'#portal',placement:'bottom-start',onClick:()=>actions.value++,onSelect:(value:string)=>selections.value.push(value),'onUpdate:open':()=>opens.value++},{default:()=> 'Publish العربية',content:()=>[h(O,{value:'blocked',label:'Disabled',disabled:true}),h(O,{value:'save',label:'Save العربية'}),h(O,{value:'publish',label:'Publish 123'})]})),
 h('div',{id:p+'Row',class:'case'},h(Space,{size:[8,20]}, {default:()=>['A','B','C'].map(label=>h('button',{},()=>label)),split:()=>h('span',{},'|')})),
 h('div',{id:p+'Wrap',class:'case wrapped'},h(Space,{size:[8,20],wrap:true},()=>['A','B','C'].map(label=>h('span',{class:'tile'},label)))),
 h('div',{id:p+'Column',class:'case'},h(Space,{direction:'column',align:'flex-start',size:[8,20]},()=>['A','BBBB'].map(label=>h('button',{},()=>label)))),
 h('div',{id:p+'DividerStart',class:'case line'},h(D,{description:'Start العربية',textAlign:'start',inset:[12,24],spacing:0})),
 h('div',{id:p+'DividerEnd',class:'case line'},h(D,{description:'End עברית',textAlign:'end',spacing:0})),
 h('div',{id:p+'DividerVertical',class:'case vertical-divider'},h(D,{orientation:'vertical',description:'Vertical',textAlign:'start',inset:[12,24],spacing:[6,10],hairline:true})),
 h('div',{id:p+'DividerPlain',class:'case vertical-divider'},h(D,{orientation:'vertical',spacing:[6,10],type:'dashed'})),
 ])
 return()=>h('main',[
 h('button',{id:'toggle',onClick:()=>dir.value=dir.value==='ltr'?'rtl':'ltr'},dir.value),h('button',{id:'disabled',onClick:()=>disabled.value=!disabled.value},'Disabled'),h('button',{id:'loading',onClick:()=>loading.value=!loading.value},'Loading'),
 h('div',{id:'nativeTab'},['A','B','C'].map(label=>h('button',{},'Native '+label))),
 h('output',{id:'state'},JSON.stringify({actions:actions.value,selections:selections.value,opens:opens.value})),
 h('div',{id:'scope',dir:dir.value},[h('div',{class:'platforms'},[platform('c',cButton,cGroup,cSplit,cSpace,cDivider,cOption),platform('m',mButton,mGroup,mSplit,mSpace,mDivider,mOption)]),h('div',{id:'local',dir:'ltr'},h(cGroup,{},()=>[h(cButton,{},()=> 'Local first'),h(cButton,{},()=> 'Local last')]))]),h('div',{id:'portal',dir:'ltr'})])
}})).mount('#app')
