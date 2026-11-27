import { fs, path } from 'vuepress/utils'
import type { App } from '@vuepress/core'
import type { Plugin } from 'vite'
const iframePath = path.resolve(import.meta.dirname, '../../../src/client-iframe/app.ts')

export const vitePageIframe = (app: App): Plugin => {
  return {
    name: 'cedar:code-block-vue:iframe',
    async config(config) {
      if (config.build.ssr) return

      const input = config.build.rolldownOptions.input
      const inputs = typeof input === 'string' ? [input] : Object.values(input)
      inputs.push(app.dir.temp('vite-root/-iframe.html'))

      config.build.rolldownOptions.input = inputs

      await app.writeTemp(
        'vite-root/-iframe.html',
        fs
          .readFileSync(app.env.isBuild ? app.options.templateBuild : app.options.templateDev)
          .toString()
          .replace(
            /<\/body>/,
            `\
<script type="module">
import '${iframePath}'
</script>
</body>`,
          ),
      )
    },
  }
}
