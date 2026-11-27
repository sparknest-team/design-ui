import type { App } from '@vuepress/core'
import type { Node } from 'posthtml-parser'
import type { PageCodeDep } from '../utils/index.js'
import { slugify } from '@mdit-vue/shared'
import { readSource } from './readSource.js'
import { path } from 'vuepress/utils'
import { highlight, markdownText } from '../utils/highlight.js'
import { registerSource } from '../utils/source-assets.js'

export const parseVue = (app: App, node: Node, dep: PageCodeDep): Node => {
  if (typeof node !== 'object') {
    return node
  }

  const sources = readSource(dep.compPath, true, true, app.env.isDev, app)

  const iframeSrc = dep.compAttrs.demoUrl
    ? dep.compAttrs.demoUrl
    : `${app.options.base}-iframe.html#/${dep.compAttrs.id}`

  const isShowDebugStyle = Reflect.has(dep.compAttrs, 'debug') || Reflect.has(dep.compAttrs, 'data-debug')

  node.tag = 'VmiPreviewer'
  node.attrs = {
    direction: dep.compAttrs.direction,
  }
  node.content = [
    {
      tag: 'VmiExample',
      attrs: {
        id: dep.compAttrs.id,
        iframe: dep.compAttrs.iframe,
        iframeSrc,
        transform: dep.compAttrs.transform,
      },
      content: [
        {
          tag: dep.compName,
        },
      ],
    },
    {
      tag: 'div',
      attrs: {
        class: 'vmi-previewer-content',
      },
      content: [
        dep.compAttrs.title
          ? {
              tag: 'div',
              attrs: {
                id: slugify(dep.compAttrs.title),
                class: 'vmi-previewer-title',
              },
              content: [
                {
                  tag: 'a',
                  attrs: {
                    href: `#${slugify(dep.compAttrs.title)}`,
                    class: 'header-anchor',
                  },
                  content: dep.compAttrs.title,
                },
              ],
            }
          : null,
        dep.compAttrs.desc
          ? {
              tag: 'div',
              attrs: {
                class: 'vmi-previewer-desc',
              },
              content: markdownText(dep.compAttrs.desc),
            }
          : null,
        {
          tag: 'VmiSourceCode',
          attrs: {
            id: dep.compAttrs.id,
            iframe: dep.compAttrs.iframe,
            iframeSrc,
            defaultShowCode: dep.compAttrs.defaultShowCode,
            hideActions: dep.compAttrs.hideActions as unknown as string,
            filePath: app.env.isDev ? dep.compPath : '',
            hideAllActions: dep.compAttrs.hideAllActions as unknown as boolean,
          },
          content: sources.map((source, index) => {
            return {
              tag: 'VmiSourceCodeItem',
              attrs: {
                name: source.name,
                sourceUrl: registerSource(app, `${dep.pagePath}:${dep.compPath}:${index}`, source, {
                  filePath: source.filePath,
                  pagePath: dep.pagePath,
                  highlight: app.env.isDev
                    ? () => highlight(source.rawCode, path.extname(source.name).slice(1), true)
                    : undefined,
                }),
              },
            }
          }),
        },
      ],
    },
  ]

  if (isShowDebugStyle) {
    node.attrs['data-debug'] = true
  }

  return node
}
