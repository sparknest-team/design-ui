import { createApp, h } from 'vue'
import { Button as RootButton } from '@maple-design/ui-vue'
import Button from '@maple-design/ui-vue/button'
import { IconAlertCircle as RootIcon } from '@maple-design/icons-vue'
import { IconAlertCircle } from '@maple-design/icons-vue/icon-alert-circle'
import '@maple-design/ui-vue/button/style'
import '@maple-design/ui-vue/style'
import '@maple-design/ui-vue/reset.css'
import '@maple-design/icons-vue/style.css'

if (RootButton !== Button || RootIcon !== IconAlertCircle) throw new Error('Entry mismatch')
createApp({
  setup() {
    return () => h(Button, { onClick: () => { document.body.dataset.clicked = 'yes' } }, {
      default: () => [h(IconAlertCircle), 'Webpack 4 works'],
    })
  },
}).mount('#app')
