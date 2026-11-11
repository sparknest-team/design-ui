import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import CedarTrigger from '/cedar-design-web/packages/ui/src/trigger/index.ts'
import MapleTrigger from '/maple-design-mobile/packages/ui/src/trigger/index.ts'
export function render(name) {
  const Trigger = name === 'Cedar' ? CedarTrigger : MapleTrigger
  return renderToString(createSSRApp({ render: () => h(Trigger, { trigger: 'click', popupContainer: false, animationName: '' }, {
    default: () => h('button', { class: 'anchor' }, 'hydrated reference'), content: () => h('div', { class: 'panel' }, 'hydrated panel'),
  }) }))
}
