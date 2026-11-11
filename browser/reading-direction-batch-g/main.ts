import { createApp, defineComponent, h, ref } from 'vue'
import CDate, { DatePicker as CDatePicker } from '../../../cedar-design-web/packages/ui/src/date'
import CDateRange, { DateRangePicker as CDateRangePicker } from '../../../cedar-design-web/packages/ui/src/date-range'
import CTime, { TimePicker as CTimePicker } from '../../../cedar-design-web/packages/ui/src/time'
import CRange, { TimeRangePicker as CRangePicker } from '../../../cedar-design-web/packages/ui/src/time-range'
import MDate, { DatePicker as MDatePicker } from '../../../maple-design-mobile/packages/ui/src/date'
import MDateRange, { DateRangePicker as MDateRangePicker } from '../../../maple-design-mobile/packages/ui/src/date-range'
import MDatePanel from '../../../maple-design-mobile/packages/ui/src/date/DatePanel.vue'
import MTime, { TimePicker as MTimePicker } from '../../../maple-design-mobile/packages/ui/src/time'
import MRange, { TimeRangePicker as MRangePicker } from '../../../maple-design-mobile/packages/ui/src/time-range'
import '../../../cedar-design-web/packages/ui/src/date/picker/style'
import '../../../cedar-design-web/packages/ui/src/time/picker/style'
import '../../../maple-design-mobile/packages/ui/src/date/style'
import '../../../maple-design-mobile/packages/ui/src/date-range/style'
import '../../../maple-design-mobile/packages/ui/src/time/style'
import '../../../maple-design-mobile/packages/ui/src/time-range/style'
const style=document.createElement('style');style.textContent='body{font:14px sans-serif;margin:16px}.platforms{display:flex;gap:28px}.platform{width:600px;min-width:0}.case{margin:16px 0;overflow:auto}#portal{position:relative}output{display:block;font-size:11px;direction:ltr}';document.head.append(style)
const initial=()=>({cDate:'2025-01-15',mDate:'2025-01-15',cRange:['2025-01-12','2025-01-17'],mRange:['2025-01-12','2025-01-17'],cTime:'09:30',mTime:'09:30',cTimes:['09:30','16:30'],mTimes:['09:30','16:30'],cDateRangeField:['2025-01-12','2025-01-17'],mDateRangeField:['2025-01-12','2025-01-17'],cField:'2025-01-15',mField:'2025-01-15',cTimeField:'09:30',mTimeField:'09:30',cRangeField:['09:30','16:30'],mRangeField:['09:30','16:30']})
createApp(defineComponent({setup(){
 const dir=ref('ltr'),side=ref('left'),values=ref<any>(initial()),revision=ref(0),changes=ref(0)
 const field=(id:string,C:any,props={})=>h('div',{id,class:'case'},h(C,{key:id+revision.value,modelValue:values.value[id],'onUpdate:modelValue':(v:any)=>{values.value[id]=v;changes.value++},...props}))
 const platform=(p:string,D:any,T:any,R:any,DF:any,TF:any,RF:any)=>h('section',{class:'platform'},[
 h('h2',p==='c'?'Cedar':'Maple'),
 field(p+'Date',D,{presentation:'calendar',pickerValue:'2025-01-01',shortcutsPosition:side.value,shortcuts:[{label:'January 15 العربية',value:'2025-01-15'},{label:'Disabled',value:'2025-01-16',disabled:true}]}),
 field(p+'Range',p==='c'?CDateRangePicker:MDateRangePicker,{presentation:'calendar',pickerValue:['2025-01-01','2025-02-01']}),
 ...(p==='m'?[h('div',{id:'mRibbon',class:'case'},h(MDatePanel,{range:true,options:{range:true,presentation:'calendar',modelValue:['2025-01-12','2025-01-17'],pickerValue:'2025-01-01'}}))]:[]),
 field(p+'Time',T,{format:'HH:mm',disabledHours:()=>[10]}),
 field(p+'Times',R,{format:'HH:mm'}),
 field(p+'Field',DF,{presentation:'calendar',editMode:'direct',popupContainer:'#portal',pickerValue:'2025-01-01',clearable:true}),
 field(p+'DateRangeField',p==='c'?CDateRange:MDateRange,{presentation:'calendar',editMode:'direct',popupContainer:'#portal'}),
 field(p+'TimeField',TF,{format:'HH:mm',editMode:'direct',popupContainer:'#portal'}),
 field(p+'RangeField',RF,{format:'HH:mm',editMode:'direct',popupContainer:'#portal'}),
 ])
 return()=>h('main',[
 h('button',{id:'toggle',onClick:()=>dir.value=dir.value==='ltr'?'rtl':'ltr'},dir.value),
 h('button',{id:'side',onClick:()=>side.value=side.value==='left'?'right':'left'},side.value),
 h('button',{id:'reset',onClick:()=>{values.value=initial();revision.value++;changes.value=0}},'Reset'),
 h('output',{id:'state'},JSON.stringify({values:values.value,changes:changes.value})),
 h('div',{id:'scope',dir:dir.value},[
 h('div',{class:'platforms'},[platform('c',CDatePicker,CTimePicker,CRangePicker,CDate,CTime,CRange),platform('m',MDatePicker,MTimePicker,MRangePicker,MDate,MTime,MRange)]),
 h('div',{id:'mDateWheel',class:'case'},h(MDatePicker,{presentation:'picker',modelValue:'2025-01-15'})),
 h('div',{id:'mRangeWheel',class:'case'},h(MDateRangePicker,{presentation:'picker',modelValue:['2025-01-12','2025-01-17']})),
 h('div',{id:'local',dir:'ltr'},h(CDatePicker,{modelValue:'2025-01-15',pickerValue:'2025-01-01'}))]),
 h('div',{id:'portal',dir:'ltr'})])
}})).mount('#app')
