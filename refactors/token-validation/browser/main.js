import { createApp, h, ref, watchEffect } from 'vue'
import CedarCheckbox from '/cedar-design-web/packages/ui/src/checkbox/index.ts'
import CedarRadio, { RadioGroup as CedarRadioGroup } from '/cedar-design-web/packages/ui/src/radio/index.ts'
import MapleCheckbox from '/maple-design-mobile/packages/ui/src/checkbox/index.ts'
import MapleRadio, { RadioGroup as MapleRadioGroup } from '/maple-design-mobile/packages/ui/src/radio/index.ts'
import '/cedar-design-web/packages/ui/src/radio/style/index.ts'
import '/maple-design-mobile/packages/ui/src/radio/style/index.ts'
import '/cedar-design-web/packages/ui/src/checkbox/style/index.ts'
import '/maple-design-mobile/packages/ui/src/checkbox/style/index.ts'
import CedarVerificationCode from '/cedar-design-web/packages/ui/src/verification-code/index.ts'
import MapleVerificationCode from '/maple-design-mobile/packages/ui/src/verification-code/index.ts'
import '/cedar-design-web/packages/ui/src/verification-code/style/index.ts'
import '/maple-design-mobile/packages/ui/src/verification-code/style/index.ts'
import CedarList from '/cedar-design-web/packages/ui/src/list/index.ts'
import CedarSlider from '/cedar-design-web/packages/ui/src/slider/index.ts'
import CedarTextarea from '/cedar-design-web/packages/ui/src/textarea/index.ts'
import MapleList from '/maple-design-mobile/packages/ui/src/list/index.ts'
import MapleSlider from '/maple-design-mobile/packages/ui/src/slider/index.ts'
import MapleTextarea from '/maple-design-mobile/packages/ui/src/textarea/index.ts'
import '/cedar-design-web/packages/ui/src/textarea/style/index.ts'
import '/maple-design-mobile/packages/ui/src/textarea/style/index.ts'
import '/cedar-design-web/packages/ui/src/slider/style/index.ts'
import '/maple-design-mobile/packages/ui/src/slider/style/index.ts'
import '/cedar-design-web/packages/ui/src/list/style/index.ts'
import '/maple-design-mobile/packages/ui/src/list/style/index.ts'
import CedarDate from '/cedar-design-web/packages/ui/src/date/index.ts'
import CedarDrawer from '/cedar-design-web/packages/ui/src/drawer/index.ts'
import CedarInput from '/cedar-design-web/packages/ui/src/input/index.ts'
import CedarTime from '/cedar-design-web/packages/ui/src/time/index.ts'
import MapleDate from '/maple-design-mobile/packages/ui/src/date/index.ts'
import MapleInput from '/maple-design-mobile/packages/ui/src/input/index.ts'
import MaplePopup from '/maple-design-mobile/packages/ui/src/popup/index.ts'
import MapleTime from '/maple-design-mobile/packages/ui/src/time/index.ts'
import '/cedar-design-web/packages/ui/src/drawer/style/index.ts'
import '/maple-design-mobile/packages/ui/src/popup/style/index.ts'
import '/cedar-design-web/packages/ui/src/time/picker/style/index.ts'
import '/maple-design-mobile/packages/ui/src/time/style/index.ts'
import CedarMenu from '/cedar-design-web/packages/ui/src/menu/index.ts'
import CedarRate from '/cedar-design-web/packages/ui/src/rate/index.ts'
import MapleMenu from '/maple-design-mobile/packages/ui/src/menu/index.ts'
import MapleRate from '/maple-design-mobile/packages/ui/src/rate/index.ts'
import '/cedar-design-web/packages/ui/src/rate/style/index.ts'
import '/maple-design-mobile/packages/ui/src/rate/style/index.ts'
import CedarStyleProvider from '/cedar-design-web/packages/ui/src/style-provider/index.ts'
import CedarThemes from '/cedar-design-web/packages/ui/src/themes/index.ts'
import MapleStyleProvider from '/maple-design-mobile/packages/ui/src/style-provider/index.ts'
import MapleThemes from '/maple-design-mobile/packages/ui/src/themes/index.ts'
import '/cedar-design-web/packages/ui/src/input/style/index.ts'
import '/maple-design-mobile/packages/ui/src/input/style/index.ts'
import '/cedar-design-web/packages/ui/src/date/picker/style/index.ts'
import '/maple-design-mobile/packages/ui/src/date/style/index.ts'
import '/cedar-design-web/packages/ui/src/menu/style/index.ts'
import '/maple-design-mobile/packages/ui/src/menu/style/index.ts'

// Real components and native input events: no mocked component CSS or forced
// pseudo-classes. Keyboard Tab after a pointer click exposes genuine hover-only.
const theme = ref('default/light'),
  override = ref(false)
const rows = [
  ['Cedar', 'c', CedarInput, CedarDate, CedarMenu, CedarThemes],
  ['Maple', 'mp', MapleInput, MapleDate, MapleMenu, MapleThemes],
]
const selection = { c: ref('chosen'), mp: ref('chosen') }
const portalScopes = Object.fromEntries(
  ['c', 'mp'].map((prefix) => [
    prefix,
    {
      host: ref(),
      mode: ref('body'),
      open: ref(false),
      longText: ref(false),
    },
  ]),
)
function scopedModalCases(name, prefix) {
  const Modal = prefix === 'c' ? CedarDrawer : MaplePopup
  const state = portalScopes[prefix]
  const vars = (background, foreground) =>
    prefix === 'c'
      ? {
          '--c-drawer-bg': background,
          '--c-drawer-header-text-color': foreground,
          '--c-drawer-content-text-color': foreground,
        }
      : {
          '--mp-popup-content-background-color': background,
          '--mp-popup-content-text-color': foreground,
        }
  const modeSelect = (suffix) =>
    h(
      'select',
      {
        'aria-label': `${name} portal mode ${suffix}`,
        value: state.mode.value,
        onChange: (event) => {
          state.mode.value = event.target.value
        },
      },
      ['body', 'host', 'inline'].map((value) => h('option', { value }, value)),
    )
  return h(
    'article',
    {
      'data-case': 'portal-token-scope',
      'data-portal-owner': `${prefix}-caller`,
      style: vars('#eef2ff', '#182230'),
    },
    [
      h('label', ['挂载方式 ', modeSelect('outside')]),
      h('label', [
        h('input', {
          type: 'checkbox',
          'aria-label': `${name} long portal text`,
          checked: state.longText.value,
          onChange: (event) => {
            state.longText.value = event.target.checked
          },
        }),
        ' 长文本／多语言',
      ]),
      h(
        'button',
        {
          onClick: () => {
            state.open.value = true
          },
        },
        `${name} open themed modal`,
      ),
      h(
        'output',
        {},
        state.mode.value === 'body'
          ? 'body：全局主题；不复制调用处变量'
          : state.mode.value === 'inline'
            ? 'inline：调用处浅色覆盖'
            : 'host：实际宿主深色覆盖',
      ),
      h('div', {
        ref: (element) => {
          state.host.value = element
        },
        id: `${prefix}-portal-token-host`,
        'data-portal-owner': `${prefix}-host`,
        style: vars('#182230', '#f8f9fc'),
      }),
      h(
        Modal,
        {
          open: state.open.value,
          'onUpdate:open': (value) => {
            state.open.value = value
          },
          popupContainer:
            state.mode.value === 'inline' ? false : state.mode.value === 'host' ? state.host.value : undefined,
          ariaLabel: `${name} token scope`,
          'aria-label': `${name} token scope`,
          ...(prefix === 'c' ? { footer: false, width: 'min(360px, 100vw)' } : {}),
        },
        {
          default: () => [
            h('label', ['面板内切换宿主 ', modeSelect('inside')]),
            h(
              'p',
              { 'data-portal-scope-copy': prefix },
              state.longText.value
                ? (
                    '中文长文本与 English long labels、العربية،日本語；' +
                    'UnbrokenIdentifier'.repeat(12) +
                    '\n'
                  ).repeat(8)
                : `${name} 局部变量按真实 DOM 祖先继承。`,
            ),
            h(
              'button',
              {
                onClick: () => {
                  state.open.value = false
                },
              },
              `${name} close themed modal`,
            ),
          ],
        },
      ),
    ],
  )
}
const modalState = Object.fromEntries(['c', 'mp'].map((prefix) => [prefix, { parent: ref(false), child: ref(false) }]))
function modalCases(name, prefix) {
  const Modal = prefix === 'c' ? CedarDrawer : MaplePopup
  const state = modalState[prefix]
  const props = (kind) => ({
    open: state[kind].value,
    'onUpdate:open': (value) => {
      state[kind].value = value
    },
    ariaLabel: `${name} ${kind} modal`,
    'aria-label': `${name} ${kind} modal`,
    ...(prefix === 'c' ? { header: false, footer: false } : {}),
  })
  return h('article', { 'data-case': 'nested-modal' }, [
    h(
      'button',
      {
        onClick: () => {
          state.parent.value = true
        },
      },
      `${name} open parent`,
    ),
    h(Modal, props('parent'), {
      default: () => [
        h(
          'button',
          {
            onClick: () => {
              state.child.value = true
            },
          },
          `${name} open child`,
        ),
        h('button', { disabled: true }, `${name} disabled modal control`),
        h('button', { hidden: true }, `${name} hidden modal control`),
        h(
          'button',
          {
            onClick: () => {
              state.parent.value = false
            },
          },
          `${name} close parent`,
        ),
        h(Modal, props('child'), {
          default: () => [
            h('button', {}, `${name} child first`),
            h(
              'button',
              {
                onClick: () => {
                  state.child.value = false
                },
              },
              `${name} child last`,
            ),
          ],
        }),
      ],
    }),
  ])
}
const sliderValue = { c: ref([20, 80]), mp: ref([20, 80]) }
const choiceState = Object.fromEntries(
  ['c', 'mp'].map((prefix) => [
    prefix,
    Object.fromEntries(
      ['radio', 'checkbox', 'group'].flatMap((kind) =>
        ['accept', 'reject', 'readonly', 'disabled'].map((mode) => [
          kind + '-' + mode,
          { value: ref(kind === 'group' ? 'a' : false), updates: ref(0), changes: ref(0) },
        ]),
      ),
    ),
  ]),
)
function choiceCases(name, prefix) {
  return ['radio', 'checkbox', 'group'].flatMap((kind) =>
    ['accept', 'reject', 'readonly', 'disabled'].map((mode) => {
      const state = choiceState[prefix][kind + '-' + mode]
      const label = name + ' ' + kind + ' ' + mode
      const component =
        kind === 'group'
          ? prefix === 'c'
            ? CedarRadioGroup
            : MapleRadioGroup
          : kind === 'radio'
            ? prefix === 'c'
              ? CedarRadio
              : MapleRadio
            : prefix === 'c'
              ? CedarCheckbox
              : MapleCheckbox
      return h('article', { 'data-case': kind + '-' + mode }, [
        h(
          component,
          {
            modelValue: state.value.value,
            readonly: mode === 'readonly',
            disabled: mode === 'disabled',
            ariaLabel: label,
            name: prefix + '-' + kind + '-' + mode,
            ...(kind === 'group' ? { options: ['a', 'b'] } : {}),
            'onUpdate:modelValue': (value) => {
              state.updates.value++
              if (mode === 'accept') state.value.value = value
            },
            onChange: () => {
              state.changes.value++
            },
          },
          kind === 'group' ? undefined : { default: () => label },
        ),
        h(
          'output',
          {},
          JSON.stringify({ value: state.value.value, updates: state.updates.value, changes: state.changes.value }),
        ),
      ])
    }),
  )
}
const listData = Array.from({ length: 100 }, (_, index) => ({ key: index, title: `Item ${index + 1}` }))
const themes = ['default/light', 'default/dark', 'maple/light', 'maple/dark']
watchEffect((onCleanup) => {
  const [brand, mode] = theme.value.split('/')
  CedarStyleProvider.setStyleVars(CedarThemes[brand][mode])
  MapleStyleProvider.setStyleVars(MapleThemes[brand][mode])
  onCleanup(() => {
    CedarStyleProvider.setStyleVars(null)
    MapleStyleProvider.setStyleVars(null)
  })
})
createApp({
  setup: () => () => {
    const [brand, mode] = theme.value.split('/')
    return [
      h('header', [
        h('label', [
          '主题 ',
          h(
            'select',
            {
              'aria-label': '主题',
              value: theme.value,
              onChange: (e) => {
                theme.value = e.target.value
              },
            },
            themes.map((v) => h('option', { value: v }, v)),
          ),
        ]),
        h(
          'button',
          {
            onClick: () => {
              override.value = !override.value
            },
            'aria-pressed': override.value,
          },
          '局部变量覆盖',
        ),
        h('button', {}, '焦点停靠'),
      ]),
      h(
        'main',
        rows.map(([name, prefix, Input, Date, Menu, Theme]) =>
          h(
            'section',
            {
              'data-platform': prefix,
              style: {
                ...Theme[brand][mode],
                background: `var(--${prefix}-sys-color-surface-default)`,
                color: `var(--${prefix}-sys-color-content-primary)`,
                ...(override.value
                  ? {
                      [`--${prefix}-field-variant-filled-background`]: '#ddffee',
                      [`--${prefix}-field-variant-filled-background-hover`]: '#cceedd',
                      [`--${prefix}-field-variant-filled-background-focus`]: '#bbddcc',
                    }
                  : {}),
              },
            },
            [
              h('h2', name),
              scopedModalCases(name, prefix),
              modalCases(name, prefix),
              ...choiceCases(name, prefix),
              ...['normal', 'error', 'disabled', 'readonly'].map((state) =>
                h('article', { 'data-case': state }, [
                  h('label', `${name} ${state}`),
                  h(Input, {
                    variant: 'filled',
                    ariaLabel: `${name} ${state}`,
                    'aria-describedby': `${prefix}-input-${state}-help`,
                    defaultValue: state === 'readonly' ? '只读内容' : '',
                    placeholder: state,
                    error: state === 'error',
                    disabled: state === 'disabled',
                    readonly: state === 'readonly',
                    clearable: true,
                  }),
                  h('span', { id: `${prefix}-input-${state}-help` }, state === 'error' ? '请输入有效内容' : '字段说明'),
                ]),
              ),
              ...['date', 'time'].flatMap((kind) =>
                ['normal', 'error', 'readonly', 'disabled'].map((state) =>
                  h(
                    'article',
                    {
                      'data-case': `${kind}-${state}`,
                    },
                    [
                      h(kind === 'date' ? Date : prefix === 'c' ? CedarTime : MapleTime, {
                        variant: 'filled',
                        placeholder: `${name} ${kind} ${state}`,
                        'aria-label': `${name} ${kind} ${state}`,
                        'aria-describedby': `${prefix}-${kind}-${state}-help`,
                        error: state === 'error',
                        readonly: state === 'readonly',
                        disabled: state === 'disabled',
                      }),
                      h(
                        'span',
                        { id: `${prefix}-${kind}-${state}-help` },
                        state === 'error' ? '请选择有效值' : '字段说明',
                      ),
                    ],
                  ),
                ),
              ),
              h('article', { 'data-case': 'menu' }, [
                h(
                  Menu,
                  {
                    modelValue: selection[prefix].value,
                    'onUpdate:modelValue': (value) => {
                      selection[prefix].value = value
                    },
                    popupContainer: false,
                    hideOnSelect: false,
                    submenuTrigger: 'click',
                    options: [
                      { value: 'chosen', label: `${name} selected` },
                      { value: 'off', label: `${name} disabled`, disabled: true },
                      { value: 'other', label: `${name} other` },
                      {
                        value: 'parent',
                        label: `${name} nested`,
                        children: [{ value: 'child', label: `${name} child` }],
                      },
                    ],
                  },
                  { default: () => h('button', {}, `${name} menu`) },
                ),
                h('output', { 'data-selection': prefix }, String(selection[prefix].value)),
              ]),
              h('article', { 'data-case': 'rate' }, [
                h('label', `${name} rate`),
                h(prefix === 'c' ? CedarRate : MapleRate, {
                  ariaLabel: `${name} rate`,
                  defaultValue: 2,
                  style: override.value
                    ? {
                        [`--${prefix}-rate-transition-duration`]: '123ms',
                        [`--${prefix}-rate-scale-duration`]: '456ms',
                        [`--${prefix}-rate-transition-timing-function`]: 'linear',
                        [`--${prefix}-rate-active-color`]: 'rgb(1, 100, 150)',
                      }
                    : {},
                }),
              ]),
              ...['normal', 'error', 'disabled', 'readonly'].map((state) =>
                h('article', { 'data-case': `textarea-${state}` }, [
                  h('label', `${name} textarea ${state}`),
                  h(prefix === 'c' ? CedarTextarea : MapleTextarea, {
                    variant: 'filled',
                    ariaLabel: `${name} textarea ${state}`,
                    'aria-describedby': `${prefix}-textarea-${state}-help`,
                    defaultValue: '第一行\n第二行',
                    autoSize: { minRows: 2, maxRows: 4 },
                    error: state === 'error',
                    disabled: state === 'disabled',
                    readonly: state === 'readonly',
                  }),
                  h(
                    'span',
                    { id: `${prefix}-textarea-${state}-help` },
                    state === 'error' ? '请输入有效内容' : '字段说明',
                  ),
                ]),
              ),
              h('article', { 'data-case': 'slider-range' }, [
                h(prefix === 'c' ? CedarSlider : MapleSlider, {
                  range: true,
                  modelValue: sliderValue[prefix].value,
                  'onUpdate:modelValue': (value) => {
                    sliderValue[prefix].value = value
                  },
                  ariaLabel: [`${name} lower`, `${name} upper`],
                  step: 5,
                  style: override.value
                    ? {
                        [`--${prefix}-slider-active-color`]: 'rgb(1, 100, 150)',
                        [`--${prefix}-slider-thumb-size`]: '24px',
                      }
                    : {},
                }),
                h('output', { 'data-slider': prefix }, JSON.stringify(sliderValue[prefix].value)),
              ]),
              ...['disabled', 'readonly'].map((state) =>
                h('article', { 'data-case': `slider-${state}` }, [
                  h(prefix === 'c' ? CedarSlider : MapleSlider, {
                    defaultValue: 40,
                    ariaLabel: `${name} slider ${state}`,
                    disabled: state === 'disabled',
                    readonly: state === 'readonly',
                  }),
                ]),
              ),
              h('article', { 'data-case': 'list-virtual' }, [
                h(
                  prefix === 'c' ? CedarList : MapleList,
                  {
                    data: listData,
                    maxHeight: 160,
                    virtualListProps: { height: 160, estimatedSize: 40, fixedSize: true },
                  },
                  { item: ({ item }) => h('div', { style: { height: '40px' } }, item.title) },
                ),
              ]),
              ...['outline', 'filled', 'standard'].flatMap((variant) =>
                ['xs', 'sm', 'md', 'lg', 'xl'].map((size) =>
                  h(
                    'article',
                    {
                      'data-case': `code-${variant}-${size}`,
                    },
                    [
                      h('label', `${name} code ${variant} ${size}`),
                      h(prefix === 'c' ? CedarVerificationCode : MapleVerificationCode, {
                        variant,
                        size,
                        length: 4,
                        defaultValue: '1234',
                        ariaLabel: `${name} code ${variant} ${size}`,
                      }),
                    ],
                  ),
                ),
              ),
              ...['custom', 'neighbor'].map((instance) =>
                h('article', { 'data-case': `code-${instance}` }, [
                  h('label', `${name} code ${instance}`),
                  h(prefix === 'c' ? CedarVerificationCode : MapleVerificationCode, {
                    variant: 'filled',
                    size: 'md',
                    length: 4,
                    defaultValue: '1234',
                    ariaLabel: `${name} code ${instance}`,
                    style:
                      instance === 'custom'
                        ? {
                            [`--${prefix}-verification-code-cell-height`]: '52px',
                            [`--${prefix}-verification-code-cell-max-width`]: '48px',
                            [`--${prefix}-verification-code-input-font-size`]: '21px',
                            [`--${prefix}-verification-code-gutter`]: '13px',
                          }
                        : {},
                  }),
                ]),
              ),
            ],
          ),
        ),
      ),
    ]
  },
}).mount('#app')
