import { createApp, defineComponent, h, ref } from 'vue'
import Popup from '/maple-design-mobile/packages/maple-ui/src/popup/index.ts'
import '/maple-design-mobile/packages/maple-ui/src/popup/style/index.ts'
const open = ref(false), enabled = ref(true), host = ref()
const duration = ref('250ms'), easing = ref('ease'), placement = ref('center')
const events = ref([]), mounts = ref(0), unmounts = ref(0)
const event = name => events.value.push({ name, at: performance.now() })
const Probe = defineComponent({
  mounted() { mounts.value++ },
  unmounted() { unmounts.value++ },
  render: () => h('input', { 'aria-label': 'Popup draft', value: 'preserved draft' }),
})
createApp({ setup: () => () => h('main', [
  h('h1', 'Popup 动效 Token 与真实生命周期'),
  ...[['Popup duration', duration, ['250ms', '600ms', '0ms']], ['Popup easing', easing, ['ease', 'linear']], ['Popup placement', placement, ['center', 'top', 'bottom', 'left', 'right']]].map(([label, value, options]) =>
    h('select', { 'aria-label': label, value: value.value, disabled: open.value, onChange: e => { value.value = e.target.value } }, options.map(option => h('option', { value: option }, option)))),
  h('button', { onClick: () => { enabled.value = true; open.value = true } }, 'Open motion popup'),
  h('button', {}, 'Motion outside neighbor'),
  h('output', { 'aria-label': 'Motion state' }, JSON.stringify({ open: open.value, enabled: enabled.value, duration: duration.value, easing: easing.value, placement: placement.value, mounts: mounts.value, unmounts: unmounts.value, events: events.value })),
  h('div', { id: 'motion-host', ref: host, 'data-motion-host': '', style: {
    '--mp-popup-transition-duration': duration.value,
    '--mp-popup-transition-timing-function': easing.value,
  } }),
  host.value && enabled.value ? h(Popup, {
    open: open.value, 'onUpdate:open': value => { open.value = value },
    popupContainer: host.value, placement: placement.value, unmountOnClose: true, 'aria-label': 'Motion popup',
    onOpen: () => event('open'), onOpened: () => event('opened'), onClose: () => event('close'), onClosed: () => event('closed'),
  }, { default: () => [
    h(Probe),
    h('p', '250ms 默认值／600ms 覆写／0ms；真实 Teleport，原生关闭和焦点恢复。'),
    h('button', { onClick: () => { open.value = false } }, 'Close motion popup'),
    h('button', { onClick: () => { open.value = false; setTimeout(() => { open.value = true }, 60) } }, 'Rapid close reopen'),
    h('button', { onClick: () => { enabled.value = false; open.value = false } }, 'Dispose motion popup'),
  ] }) : null,
]) }).mount('#app')
