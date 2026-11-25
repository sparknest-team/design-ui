import { createApp, defineComponent, h, ref } from 'vue'
import CCollapse, { CollapseItem as CItem } from '../../../cedar-design-web/packages/ui/src/collapse'
import { ImagePreviewGroup as CPreview } from '../../../cedar-design-web/packages/ui/src/image'
import Layout, { LayoutContent, LayoutSider } from '../../../cedar-design-web/packages/ui/src/layout'
import MCollapse, { CollapseItem as MItem } from '../../../maple-design-mobile/packages/ui/src/collapse'
import { ImagePreviewGroup as MPreview } from '../../../maple-design-mobile/packages/ui/src/image'
import '../../../cedar-design-web/packages/ui/src/image/style'
import '../../../maple-design-mobile/packages/ui/src/image/style'
import '../../../cedar-design-web/packages/ui/src/collapse/style'
import '../../../maple-design-mobile/packages/ui/src/collapse/style'
import '../../../cedar-design-web/packages/ui/src/layout/style'
import CCarousel, { CarouselItem as CSlide } from '../../../cedar-design-web/packages/ui/src/carousel'
import MCarousel, { CarouselItem as MSlide } from '../../../maple-design-mobile/packages/ui/src/carousel'
import '../../../cedar-design-web/packages/ui/src/carousel/style'
import '../../../maple-design-mobile/packages/ui/src/carousel/style'

const images = ['red', 'green', 'blue'].map(
  (fill) =>
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="300" height="200" fill="${fill}"/></svg>`,
    ),
)
createApp(
  defineComponent({
    setup() {
      const carouselRefs: Record<string, any> = {}
      const dir = ref('ltr'),
        platform = ref('c'),
        opened = ref(false),
        index = ref(2),
        changes = ref(0)
      const change = (value: number) => {
        index.value = value
        changes.value++
      }
      return () =>
        h('main', { dir: dir.value, id: 'scope' }, [
          h('button', { id: 'direction', onClick: () => (dir.value = dir.value === 'ltr' ? 'rtl' : 'ltr') }, dir.value),
          h(
            'button',
            { id: 'platform', onClick: () => (platform.value = platform.value === 'c' ? 'm' : 'c') },
            platform.value,
          ),
          h(
            'button',
            {
              id: 'open',
              onClick: () => {
                index.value = 2
                opened.value = true
              },
            },
            'Open',
          ),
          h(
            'output',
            { id: 'state' },
            JSON.stringify({ index: index.value, changes: changes.value, opened: opened.value }),
          ),
          ...[
            ['c', CCollapse, CItem],
            ['m', MCollapse, MItem],
          ].flatMap(([p, C, I]: any) =>
            ['left', 'right'].map((side) =>
              h(
                'div',
                { id: p + '-' + side, style: 'width:360px;margin:12px' },
                h(C, { expandIconPosition: side, defaultValue: ['a'] }, () =>
                  h(I, { name: 'a', title: 'Title العربية' }, () => 'Content עברית'),
                ),
              ),
            ),
          ),
          ...['left', 'right'].map((placement) =>
            h(Layout, { id: 'layout-' + placement, style: 'width:600px;height:100px' }, () => [
              h(LayoutSider, { placement, width: 120 }, () => 'Sider'),
              h(LayoutContent, {}, () => 'Content'),
            ]),
          ),
          ...(
            [
              ['c', CCarousel, CSlide],
              ['m', MCarousel, MSlide],
            ] as const
          ).map(([p, C, S]) =>
            h('section', { style: 'width:360px;margin:12px', id: p + '-carousel-case' }, [
              h(
                'button',
                { id: p + '-carousel-reset', onClick: () => carouselRefs[p]?.to(2, { event: false }) },
                'Reset carousel',
              ),
              h(
                C,
                {
                  id: p + '-carousel',
                  ref: (el: any) => (carouselRefs[p] = el),
                  defaultValue: 2,
                  loop: true,
                  height: 120,
                  moveSpeed: 200,
                  autoPlay: false,
                  showArrow: 'always',
                },
                () => ['one', 'two', 'three'].map((label) => h(S, {}, () => label)),
              ),
            ]),
          ),
          h(platform.value === 'c' ? CPreview : MPreview, {
            key: platform.value,
            images,
            open: opened.value,
            modelValue: index.value,
            popupContainer: false,
            keyboard: true,
            'onUpdate:open': (v: boolean) => (opened.value = v),
            onChange: change,
          }),
        ])
    },
  }),
).mount('#app')
