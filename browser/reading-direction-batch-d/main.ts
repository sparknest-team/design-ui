import { createApp, defineComponent, h, ref } from 'vue'
import Input from '../../../cedar-design-web/packages/ui/src/input'
import NumberInput from '../../../cedar-design-web/packages/ui/src/input-number'
import InputTag from '../../../cedar-design-web/packages/ui/src/input-tag'
import Select from '../../../cedar-design-web/packages/ui/src/select'
import Textarea from '../../../cedar-design-web/packages/ui/src/textarea'
import MapleInput from '../../../maple-design-mobile/packages/ui/src/input'
import MapleNumber from '../../../maple-design-mobile/packages/ui/src/input-number'
import MapleSelect from '../../../maple-design-mobile/packages/ui/src/select'
import MapleTextarea from '../../../maple-design-mobile/packages/ui/src/textarea'
import '../../../cedar-design-web/packages/ui/src/input/style'
import '../../../cedar-design-web/packages/ui/src/input-number/style'
import '../../../cedar-design-web/packages/ui/src/input-tag/style'
import '../../../cedar-design-web/packages/ui/src/textarea/style'
import '../../../cedar-design-web/packages/ui/src/select/style'
import '../../../maple-design-mobile/packages/ui/src/input/style'
import '../../../maple-design-mobile/packages/ui/src/input-number/style'
import '../../../maple-design-mobile/packages/ui/src/textarea/style'
import '../../../maple-design-mobile/packages/ui/src/select/style'

const style = document.createElement('style')
style.textContent =
  'body{font:14px sans-serif;margin:20px}.columns{display:flex;gap:24px}.platform{width:420px}.case{margin:16px 0;max-width:420px}#scope{width:900px}#portal{position:relative}'
document.head.append(style)
const options = [
  { value: 'a', label: 'Alpha العربية' },
  { value: 'b', label: 'Beta עברית' },
  { value: 'c', label: 'Gamma 123' },
]
createApp(
  defineComponent({
    setup() {
      const dir = ref('ltr'),
        disabled = ref(false),
        readonly = ref(false),
        align = ref<any>(undefined),
        variant = ref('outline'),
        size = ref('md'),
        changes = ref(0)
      const values = ref<Record<string, any>>({
        cInput: '',
        mInput: '',
        cNumber: 2,
        mNumber: 2,
        cTextarea: '',
        mTextarea: '',
        tags: ['Alpha', 'Beta'],
        cSelect: 'a',
        mSelect: 'a',
        cMulti: ['a', 'b'],
        mMulti: ['a', 'b'],
        mPanel: ['a', 'b'],
      })
      const field = (id: string, Component: any, props: any = {}, slots: any = {}) =>
        h(
          'div',
          { id, class: 'case' },
          h(
            Component,
            {
              modelValue: values.value[id],
              'onUpdate:modelValue': (v: any) => {
                values.value[id] = v
                changes.value++
              },
              disabled: disabled.value,
              readonly: readonly.value,
              variant: variant.value,
              size: size.value,
              ...props,
            },
            slots,
          ),
        )
      const slots = {
        prefix: () => h('b', { 'data-prefix': '' }, 'Prefix 123'),
        suffix: () => h('b', { 'data-suffix': '' }, 'Suffix'),
      }
      const platform = (p: string, I: any, N: any, T: any, S: any) =>
        h('div', { class: 'platform' }, [
          field(`${p}Input`, I, { hint: true, clearable: true, placeholder: 'Account العربية' }, slots),
          field(`${p}Number`, N, { hint: true, placeholder: 'Quantity', mode: 'button', min: 0, max: 9 }, slots),
          field(`${p}Textarea`, T, {
            hint: true,
            clearable: true,
            placeholder: 'Message العربية',
            showCount: true,
            maxLength: 100,
          }),
          field(
            `${p}Select`,
            S,
            {
              options,
              editMode: 'direct',
              filterable: true,
              hint: true,
              clearable: true,
              placeholder: 'Choose العربية',
              textAlign: align.value,
              popupContainer: '#portal',
            },
            slots,
          ),
          h(
            'div',
            { id: `${p}Group`, class: 'case' },
            h(
              I.Group,
              { variant: variant.value, size: size.value },
              {
                default: () => [
                  h(I.GroupLabel, null, { default: () => 'Start' }),
                  h(I, { placeholder: 'Grouped' }),
                  h(I.GroupLabel, null, { default: () => 'End' }),
                ],
              },
            ),
          ),
          field(`${p}Multi`, S, {
            options,
            editMode: 'direct',
            multiple: true,
            filterable: true,
            clearable: true,
            textAlign: align.value,
            tagNowrap: true,
          }),
        ])
      return () =>
        h('main', [
          h('button', { id: 'toggle', onClick: () => (dir.value = dir.value === 'ltr' ? 'rtl' : 'ltr') }, dir.value),
          h('button', { id: 'disable', onClick: () => (disabled.value = !disabled.value) }, 'Disabled'),
          h('button', { id: 'readonly', onClick: () => (readonly.value = !readonly.value) }, 'Readonly'),
          h(
            'select',
            { id: 'align', onChange: (e: Event) => (align.value = (e.target as HTMLSelectElement).value || undefined) },
            ['', 'left', 'right', 'center'].map((value) => h('option', { value }, value || 'start')),
          ),
          h(
            'select',
            { id: 'variant', onChange: (e: Event) => (variant.value = (e.target as HTMLSelectElement).value) },
            ['outline', 'filled', 'standard'].map((value) => h('option', { value }, value)),
          ),
          h(
            'select',
            {
              id: 'size',
              value: size.value,
              onChange: (e: Event) => (size.value = (e.target as HTMLSelectElement).value),
            },
            ['sm', 'md', 'lg'].map((value) => h('option', { value }, value)),
          ),
          h('output', { id: 'state' }, JSON.stringify({ values: values.value, changes: changes.value })),
          h('div', { id: 'scope', dir: dir.value }, [
            h('div', { class: 'columns' }, [
              platform('c', Input, NumberInput, Textarea, Select),
              platform('m', MapleInput, MapleNumber, MapleTextarea, MapleSelect),
            ]),
            field('mPanel', MapleSelect, {
              options,
              multiple: true,
              popupContainer: '#portal',
              placeholder: 'Mobile picker',
            }),
            field('tags', InputTag, { clearable: true }, slots),
            h(
              'div',
              { dir: 'ltr', id: 'nested' },
              h(Input, { defaultValue: 'Local LTR', hint: true, placeholder: 'Local' }),
            ),
          ]),
          h('div', { id: 'portal', dir: 'ltr' }),
        ])
    },
  }),
).mount('#app')
