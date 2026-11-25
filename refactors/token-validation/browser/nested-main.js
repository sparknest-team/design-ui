import { createApp, h, ref, watchEffect } from 'vue'
import CedarDrawer from '/cedar-design-web/packages/ui/src/drawer/index.ts'
import MaplePopup from '/maple-design-mobile/packages/ui/src/popup/index.ts'
import '/cedar-design-web/packages/ui/src/drawer/style/index.ts'
import '/maple-design-mobile/packages/ui/src/popup/style/index.ts'
import CedarStyleProvider from '/cedar-design-web/packages/ui/src/style-provider/index.ts'
import CedarThemes from '/cedar-design-web/packages/ui/src/themes/index.ts'
import MapleStyleProvider from '/maple-design-mobile/packages/ui/src/style-provider/index.ts'
import MapleThemes from '/maple-design-mobile/packages/ui/src/themes/index.ts'

const platform = ref('Cedar'),
  theme = ref('default/light'),
  parent = ref(false),
  child = ref(false)
const escapes = { parent: ref(0), child: ref(0) }
watchEffect(() => {
  const [brand, mode] = theme.value.split('/')
  CedarStyleProvider.setStyleVars(CedarThemes[brand][mode])
  MapleStyleProvider.setStyleVars(MapleThemes[brand][mode])
})
createApp({
  setup: () => () => {
    const name = platform.value,
      Modal = name === 'Cedar' ? CedarDrawer : MaplePopup
    const props = (kind) => ({
      open: (kind === 'parent' ? parent : child).value,
      'onUpdate:open': (value) => {
        ;(kind === 'parent' ? parent : child).value = value
      },
      onKeyEscape: () => {
        escapes[kind].value++
      },
      ariaLabel: `${name} nested ${kind}`,
      'aria-label': `${name} nested ${kind}`,
      ...(name === 'Cedar' ? { header: false, footer: false, width: kind === 'parent' ? 480 : 340 } : {}),
    })
    return h('main', [
      h('h1', '嵌套浮层真实键盘验收'),
      h(
        'select',
        {
          'aria-label': 'Nested platform',
          value: name,
          disabled: parent.value || child.value,
          onChange: (event) => {
            platform.value = event.target.value
          },
        },
        ['Cedar', 'Maple'].map((value) => h('option', { value }, value)),
      ),
      h(
        'select',
        {
          'aria-label': 'Nested theme',
          value: theme.value,
          disabled: parent.value || child.value,
          onChange: (event) => {
            theme.value = event.target.value
          },
        },
        ['default/light', 'default/dark', 'maple/light', 'maple/dark'].map((value) => h('option', { value }, value)),
      ),
      h(
        'button',
        {
          onClick: () => {
            parent.value = true
          },
        },
        `${name} open nested parent`,
      ),
      h('button', {}, 'Nested background neighbor'),
      h(
        'output',
        { 'aria-label': 'Nested state' },
        JSON.stringify({
          platform: name,
          theme: theme.value,
          parent: parent.value,
          child: child.value,
          parentEscapes: escapes.parent.value,
          childEscapes: escapes.child.value,
        }),
      ),
      h(
        Modal,
        { key: name, ...props('parent') },
        {
          default: () => [
            h(
              'button',
              {
                onClick: () => {
                  child.value = true
                },
              },
              `${name} open nested child`,
            ),
            h('button', { disabled: true }, `${name} disabled nested control`),
            h('button', { hidden: true }, `${name} hidden nested control`),
            h('p', { 'data-nested-copy': 'parent' }, '父层 / Parent / العربية / 日本語'),
            h(
              'button',
              {
                onClick: () => {
                  parent.value = false
                },
              },
              `${name} close nested parent`,
            ),
            h(Modal, props('child'), {
              default: () => [
                h('button', {}, `${name} nested child first`),
                h('p', { 'data-nested-copy': 'child' }, '子层 / Child / العربية / 日本語'),
                h(
                  'button',
                  {
                    onClick: () => {
                      parent.value = false
                    },
                  },
                  `${name} close parent before child`,
                ),
                h(
                  'button',
                  {
                    onClick: () => {
                      child.value = false
                    },
                  },
                  `${name} nested child last`,
                ),
              ],
            }),
          ],
        },
      ),
    ])
  },
}).mount('#app')
