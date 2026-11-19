import { createApp, h } from 'vue'
import { Button as RootButton } from '@cedar-design/ui-vue'
import Button from '@cedar-design/ui-vue/button'
import { IconAlertCircle as RootIcon } from '@cedar-design/icons-vue'
import { IconAlertCircle } from '@cedar-design/icons-vue/icon-alert-circle'
import '@cedar-design/ui-vue/button/style'
import '@cedar-design/ui-vue/style'
import '@cedar-design/ui-vue/reset.css'
import '@cedar-design/icons-vue/style.css'

if (RootButton !== Button || RootIcon !== IconAlertCircle) throw new Error('Entry mismatch')
createApp({
  setup() {
    return () => h(Button, { onClick: () => { document.body.dataset.clicked = 'yes' } }, {
      default: () => [h(IconAlertCircle), 'Webpack 4 works'],
    })
  },
}).mount('#app')
