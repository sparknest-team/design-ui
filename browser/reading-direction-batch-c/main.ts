import { createApp, defineComponent, h, ref } from 'vue'
import Scheduler from '../../../cedar-design-web/packages/ui/src/scheduler'
import '../../../cedar-design-web/packages/ui/src/scheduler/style'
const initial = () => [
  { id: 'a', title: 'Alpha', start: '2026-09-22T09:00:00', end: '2026-09-22T10:00:00', resourceIds: ['r0'] },
  { id: 'b', title: 'Beta', start: '2026-09-22T12:00:00', end: '2026-09-22T13:00:00', resourceIds: ['r0'] },
]
const style = document.createElement('style'); style.textContent = 'body{font:14px sans-serif;margin:16px}#scope{width:940px}#scheduler{height:540px}#nested{width:600px;height:300px;margin-top:24px}button,select{font:inherit}'; document.head.append(style)
createApp(defineComponent({ setup() {
  const dir = ref('ltr'), mode = ref('resource-timeline'), scale = ref('hour'), zoom = ref(1), virtual = ref(false), events = ref(initial()), changes = ref(0)
  const resources = Array.from({ length: 100 }, (_, i) => ({ id: `r${i}`, label: `Resource ${i}` }))
  const fewResources = resources.slice(0, 2)
  const props = () => ({ modelValue: events.value, defaultDate: '2026-09-22', mode: mode.value, scale: scale.value, zoom: zoom.value, snapDuration: 15, startHour: 8, endHour: 14, resources: mode.value === 'resource-timeline' ? resources : fewResources, dependencies: [{ id: 'ab', fromId: 'a', toId: 'b' }], virtualListProps: virtual.value ? { height: 280 } : undefined, 'onUpdate:modelValue': (value: any) => { events.value = value; changes.value++ } })
  return () => h('main', [
    h('button', { id: 'toggle', onClick: () => dir.value = dir.value === 'ltr' ? 'rtl' : 'ltr' }, dir.value),
    h('button', { id: 'reset', onClick: () => { events.value = initial(); changes.value = 0 } }, 'Reset'),
    h('button', { id: 'zoom', onClick: () => zoom.value = zoom.value === 1 ? 2 : 1 }, 'Zoom'),
    h('button', { id: 'virtual', onClick: () => virtual.value = !virtual.value }, 'Virtual'),
    h('select', { id: 'mode', value: mode.value, onChange: (e: Event) => mode.value = (e.target as HTMLSelectElement).value }, ['month', 'week', 'day', 'resource-day', 'resource-timeline', 'agenda'].map(value => h('option', { value }, value))),
    h('select', { id: 'scale', value: scale.value, onChange: (e: Event) => scale.value = (e.target as HTMLSelectElement).value }, ['hour','day'].map(value => h('option', { value }, value))),
    h('output', { id: 'state' }, JSON.stringify({ events: events.value, changes: changes.value })),
    h('div', { id: 'scope', dir: dir.value }, [h(Scheduler, { id: 'scheduler', ...props() }), h('div', { dir: 'ltr' }, h(Scheduler, { id: 'nested', defaultDate: '2026-09-22', defaultMode: 'week', defaultValue: initial(), startHour: 8, endHour: 14 }))]),
  ])
} })).mount('#app')
