import { createApp, h, ref, shallowRef } from 'vue'
import CedarDrawer from '/cedar-design-web/packages/ui/src/drawer/index.ts'
import MaplePopup from '/maple-design-mobile/packages/ui/src/popup/index.ts'
import '/cedar-design-web/packages/ui/src/drawer/style/index.ts'
import '/maple-design-mobile/packages/ui/src/popup/style/index.ts'
import CedarStyleProvider from '/cedar-design-web/packages/ui/src/style-provider/index.ts'
import CedarThemes from '/cedar-design-web/packages/ui/src/themes/index.ts'
import MapleStyleProvider from '/maple-design-mobile/packages/ui/src/style-provider/index.ts'
import MapleThemes from '/maple-design-mobile/packages/ui/src/themes/index.ts'

CedarStyleProvider.setStyleVars(CedarThemes.default.light)
MapleStyleProvider.setStyleVars(MapleThemes.default.light)
const frame = shallowRef(),
  frameHost = shallowRef(),
  topHost = shallowRef()
const ready = ref(false),
  platform = ref('Cedar'),
  destination = ref('frame'),
  open = ref(false)
const escapeCount = ref(0),
  closeCount = ref(0)
function connect() {
  const doc = frame.value?.contentDocument
  if (doc?.body.dataset.frameReady !== 'true') return
  frameHost.value = doc.getElementById('frame-host')
  ready.value = true
}
createApp({
  setup: () => () => {
    const name = platform.value
    return h('main', [
      h('h1', '真实同源 iframe 验收'),
      h('label', [
        '组件 ',
        h(
          'select',
          {
            'aria-label': 'Iframe platform',
            value: name,
            disabled: open.value,
            onChange: (event) => {
              platform.value = event.target.value
            },
          },
          ['Cedar', 'Maple'].map((value) => h('option', { value }, value)),
        ),
      ]),
      h('label', [
        '初始目标 ',
        h(
          'select',
          {
            'aria-label': 'Iframe initial target',
            value: destination.value,
            disabled: open.value,
            onChange: (event) => {
              destination.value = event.target.value
            },
          },
          ['top', 'frame'].map((value) => h('option', { value }, value)),
        ),
      ]),
      h('button', { onClick: connect }, 'Connect real iframe'),
      h(
        'output',
        { 'aria-label': 'Iframe fixture state' },
        JSON.stringify({
          ready: ready.value,
          platform: name,
          target: destination.value,
          open: open.value,
          escapeCount: escapeCount.value,
          closeCount: closeCount.value,
        }),
      ),
      h(
        'button',
        {
          disabled: !ready.value,
          onClick: () => {
            open.value = true
          },
        },
        `${name} open iframe modal`,
      ),
      h('button', {}, 'Top untouched neighbor'),
      h('div', { class: 'realms' }, [
        h('div', { id: 'top-host', 'data-owner': 'top', ref: topHost }, 'Top document / default light'),
        h('iframe', {
          id: 'acceptance-frame',
          title: 'Real same-origin target',
          ref: frame,
          src: './iframe-target.html',
        }),
      ]),
      ready.value
        ? h(
            name === 'Cedar' ? CedarDrawer : MaplePopup,
            {
              key: name,
              open: open.value,
              'onUpdate:open': (value) => {
                open.value = value
                if (!value) closeCount.value++
              },
              onKeyEscape: () => {
                escapeCount.value++
              },
              popupContainer: destination.value === 'frame' ? frameHost.value : topHost.value,
              ariaLabel: `${name} iframe acceptance`,
              'aria-label': `${name} iframe acceptance`,
              ...(name === 'Cedar' ? { footer: false, width: 'min(360px, 100vw)' } : {}),
            },
            {
              default: () => [
                h(
                  'button',
                  {
                    onClick: () => {
                      destination.value = 'top'
                    },
                  },
                  `${name} move to top`,
                ),
                h(
                  'button',
                  {
                    onClick: () => {
                      destination.value = 'frame'
                    },
                  },
                  `${name} move to frame`,
                ),
                h(
                  'p',
                  { 'data-iframe-copy': name },
                  ('跨文档 / English / العربية / 日本語；LongIdentifier'.repeat(5) + '\n').repeat(4),
                ),
                h(
                  'button',
                  {
                    onClick: () => {
                      open.value = false
                      closeCount.value++
                    },
                  },
                  `${name} close iframe modal`,
                ),
              ],
            },
          )
        : null,
    ])
  },
}).mount('#app')
