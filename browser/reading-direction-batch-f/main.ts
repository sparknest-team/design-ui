import { createApp, defineComponent, h, ref } from 'vue'
import AutoComplete from '../../../cedar-design-web/packages/ui/src/auto-complete'
import Cascader from '../../../cedar-design-web/packages/ui/src/cascader'
import TreeSelect from '../../../cedar-design-web/packages/ui/src/tree-select'
import MAutoComplete from '../../../maple-design-mobile/packages/ui/src/auto-complete'
import MCascader from '../../../maple-design-mobile/packages/ui/src/cascader'
import '../../../cedar-design-web/packages/ui/src/cascader/style'
import '../../../cedar-design-web/packages/ui/src/tree-select/style'
import '../../../cedar-design-web/packages/ui/src/auto-complete/style'
import '../../../maple-design-mobile/packages/ui/src/cascader/style'
import '../../../maple-design-mobile/packages/ui/src/auto-complete/style'

const style = document.createElement('style')
style.textContent =
  'body{font:14px sans-serif;margin:20px}.columns{display:flex;gap:24px}#scope{width:900px}.platform{width:420px}.case{margin:20px 0}#portal{position:relative}'
document.head.append(style)
const options = [
  {
    value: 'root',
    label: 'Root العربية',
    children: [
      { value: 'blocked', label: 'Disabled', disabled: true },
      { value: 'one', label: 'One עברית' },
      { value: 'branch', label: 'Branch', children: [{ value: 'deep', label: 'Deep 123' }] },
    ],
  },
  { value: 'other', label: 'Other', children: [{ value: 'two', label: 'Two' }] },
]
const suggestions = [
  { value: 'blocked', label: 'Alpha disabled', disabled: true },
  { value: 'alpha', label: 'Alpha العربية' },
  { value: 'beta', label: 'Beta עברית' },
]
const initial = () => ({
  cCas: null,
  mCas: null,
  cMulti: ['one', 'deep'],
  mMulti: ['one', 'deep'],
  cAuto: '',
  mAuto: '',
  tree: null,
  treeMulti: ['one', 'deep'],
  mPanel: null,
})
createApp(
  defineComponent({
    setup() {
      const dir = ref('ltr'),
        disabled = ref(false),
        readonly = ref(false),
        virtual = ref(false),
        revision = ref(0),
        values = ref<any>(initial()),
        changes = ref(0)
      const field = (id: string, Component: any, props = {}) =>
        h(
          'div',
          { id, class: 'case' },
          h(Component, {
            key: `${id}-${revision.value}`,
            modelValue: values.value[id],
            'onUpdate:modelValue': (value: any) => {
              values.value[id] = value
              changes.value++
            },
            disabled: disabled.value,
            readonly: readonly.value,
            popupContainer: '#portal',
            ...props,
          }),
        )
      const platform = (p: string, C: any, A: any) =>
        h('section', { class: 'platform' }, [
          field(`${p}Cas`, C, {
            options,
            editMode: 'direct',
            pathMode: true,
            clearable: true,
            placeholder: 'Cascader',
            virtualListProps: virtual.value ? { height: 180, estimatedSize: 32 } : undefined,
          }),
          field(`${p}Multi`, C, {
            options,
            editMode: 'direct',
            multiple: true,
            pathMode: false,
            filterable: true,
            clearable: true,
          }),
          field(`${p}Auto`, A, {
            options: suggestions,
            editMode: 'direct',
            searchDelay: 0,
            clearable: true,
            placeholder: 'Type Alpha',
          }),
        ])
      return () =>
        h('main', [
          h('button', { id: 'toggle', onClick: () => (dir.value = dir.value === 'ltr' ? 'rtl' : 'ltr') }, dir.value),
          h(
            'button',
            {
              id: 'reset',
              onClick: () => {
                values.value = initial()
                changes.value = 0
                revision.value++
              },
            },
            'Reset',
          ),
          h('button', { id: 'disabled', onClick: () => (disabled.value = !disabled.value) }, 'Disabled'),
          h('button', { id: 'readonly', onClick: () => (readonly.value = !readonly.value) }, 'Readonly'),
          h('button', { id: 'virtual', onClick: () => (virtual.value = !virtual.value) }, 'Virtual columns'),
          h('output', { id: 'state' }, JSON.stringify({ values: values.value, changes: changes.value })),
          h('div', { id: 'scope', dir: dir.value }, [
            h('div', { class: 'columns' }, [
              platform('c', Cascader, AutoComplete),
              platform('m', MCascader, MAutoComplete),
            ]),
            field('tree', TreeSelect, {
              data: options,
              editMode: 'direct',
              filterable: true,
              clearable: true,
              placeholder: 'TreeSelect',
            }),
            field('treeMulti', TreeSelect, {
              data: options,
              editMode: 'direct',
              multiple: true,
              treeCheckable: true,
              treeCheckedStrategy: 'child',
              filterable: true,
              clearable: true,
            }),
            field('mPanel', MCascader, { options, pathMode: true, placeholder: 'Mobile Cascader' }),
            h(
              'div',
              { dir: 'ltr', id: 'nested' },
              h(Cascader, { options, editMode: 'direct', placeholder: 'Local LTR' }),
            ),
          ]),
          h('div', { id: 'portal', dir: 'ltr' }),
        ])
    },
  }),
).mount('#app')
