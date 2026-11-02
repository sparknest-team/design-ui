import { createApp, defineComponent, h, ref } from 'vue'
import Form from '../../../cedar-design-web/packages/cedar-ui/src/form'
import Input from '../../../cedar-design-web/packages/cedar-ui/src/input'
import Select from '../../../cedar-design-web/packages/cedar-ui/src/select'
import Checkbox from '../../../cedar-design-web/packages/cedar-ui/src/checkbox'
import Radio from '../../../cedar-design-web/packages/cedar-ui/src/radio'
import Switch from '../../../cedar-design-web/packages/cedar-ui/src/switch'
import MForm from '../../../maple-design-mobile/packages/maple-ui/src/form'
import MInput from '../../../maple-design-mobile/packages/maple-ui/src/input'
import MSelect from '../../../maple-design-mobile/packages/maple-ui/src/select'
import MCheckbox from '../../../maple-design-mobile/packages/maple-ui/src/checkbox'
import MRadio from '../../../maple-design-mobile/packages/maple-ui/src/radio'
import MSwitch from '../../../maple-design-mobile/packages/maple-ui/src/switch'
import '../../../cedar-design-web/packages/cedar-ui/src/form/style'
import '../../../cedar-design-web/packages/cedar-ui/src/input/style'
import '../../../cedar-design-web/packages/cedar-ui/src/select/style'
import '../../../cedar-design-web/packages/cedar-ui/src/checkbox/style'
import '../../../cedar-design-web/packages/cedar-ui/src/radio/style'
import '../../../cedar-design-web/packages/cedar-ui/src/switch/style'
import '../../../maple-design-mobile/packages/maple-ui/src/form/style'
import '../../../maple-design-mobile/packages/maple-ui/src/input/style'
import '../../../maple-design-mobile/packages/maple-ui/src/select/style'
import '../../../maple-design-mobile/packages/maple-ui/src/checkbox/style'
import '../../../maple-design-mobile/packages/maple-ui/src/radio/style'
import '../../../maple-design-mobile/packages/maple-ui/src/switch/style'
const style = document.createElement('style'); style.textContent = 'body{font:14px sans-serif;margin:20px}#scope{display:flex;gap:24px;width:1120px}.platform{width:540px}button,select{font:inherit}.test-row{margin:16px 0}'; document.head.append(style)
const requiredName = (value: unknown) => Boolean(value) || 'Name required'
const options = [{ value: 'a', label: 'Alpha العربية' }, { value: 'skip', label: 'Disabled', disabled: true }, { value: 'b', label: 'Beta עברית' }, { value: 'c', label: 'Gamma 123' }]
createApp(defineComponent({ setup() {
 const dir = ref('ltr'), align = ref<any>(undefined), labelAlign = ref<any>(undefined), layout = ref('horizontal'), disabled = ref(false), readonly = ref(false), loading = ref(false), orientation = ref('horizontal'), variant = ref('radio'), changes = ref(0)
 const models = ref<Record<string, any>>({ c: { name: '', checks: ['a'], choice: 'a', enabled: false }, m: { name: '', checks: ['a'], choice: 'a', enabled: false } })
 const forms: Record<string, any> = {}
 const platform = (p: string, F: any, I: any, C: any, R: any, S: any, Sel: any) => {
  const model = models.value[p]
  const field = (key: string, Component: any, props = {}, slots?: any) => h(Component, { modelValue: model[key], 'onUpdate:modelValue': (v: any) => { model[key] = v; changes.value++ }, disabled: disabled.value, readonly: readonly.value, ...props }, slots)
  const item = (key: string, children: any, props = {}) => h(F.Item, { id: `${p}-${key}`, field: key, label: `${key} العربية`, ...props }, { default: () => children })
  return h('section', { class: 'platform', id: p }, h(F, { ref: (el: any) => forms[p] = el, model, layout: layout.value, editMode: 'direct', contentAlign: align.value, labelAlign: labelAlign.value, autoLabelWidth: true, rules: { name: p === 'm' ? [{ required: true }, requiredName] : [{ required: true, message: 'Name required' }] } }, { default: () => [
   item('name', field('name', I, { placeholder: 'Name', clearable: true }), { help: 'Help العربية', extra: 'Extra 123', feedback: true }),
   item('checks', field('checks', C.Group, { options, orientation: orientation.value })),
   item('choice', field('choice', R.Group, { options, orientation: orientation.value, variant: variant.value })),
   item('enabled', field('enabled', S, { loading: loading.value, checkedText: 'On', uncheckedText: 'Off' })),
   h(F.Item, { id: `${p}-read`, label: 'Read', readPretty: true }, { default: () => h('span', { 'data-value': '' }, 'Read value العربية') }),
   h(F.Item, { id: `${p}-select`, label: 'Select' }, { default: () => h(Sel, { modelValue: 'a', options, editMode: 'direct' }) }),
   h(F.Item, { id: `${p}-override`, label: 'Override', contentAlign: 'left', labelAlign: 'right' }, { default: () => h('span', { 'data-value': '' }, 'Physical left') }),
  ] }))
 }
 const chooser = (id: string, values: string[], state: any) => h('select', { id, value: state.value || '', onChange: (e: Event) => state.value = (e.target as HTMLSelectElement).value || undefined }, values.map(value => h('option', { value }, value || 'default')))
 return () => h('main', [
  h('button', { id: 'toggle', onClick: () => dir.value = dir.value === 'ltr' ? 'rtl' : 'ltr' }, dir.value),
  h('button', { id: 'disabled', onClick: () => disabled.value = !disabled.value }, 'Disabled'), h('button', { id: 'readonly', onClick: () => readonly.value = !readonly.value }, 'Readonly'), h('button', { id: 'loading', onClick: () => loading.value = !loading.value }, 'Loading'),
  h('button', { id: 'validate', onClick: () => Object.values(forms).forEach(form => form?.validate()?.catch?.(() => {})) }, 'Validate'),
  chooser('align', ['', 'start','end','left','right','center'], align), chooser('label-align', ['', 'start','end','left','right'], labelAlign), chooser('layout', ['horizontal','vertical','inline'], layout), chooser('orientation', ['horizontal','vertical'], orientation), chooser('variant', ['radio','button'], variant),
  h('output', { id: 'state' }, JSON.stringify({ models: models.value, changes: changes.value })),
  h('div', { id: 'scope', dir: dir.value }, [platform('c', Form, Input, Checkbox, Radio, Switch, Select), platform('m', MForm, MInput, MCheckbox, MRadio, MSwitch, MSelect)]),
  h('div', { dir: 'ltr', id: 'nested' }, h(Radio.Group, { defaultValue: 'a', options })),
 ])
} })).mount('#app')
