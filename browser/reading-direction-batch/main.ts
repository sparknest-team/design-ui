import { createApp, defineComponent, h, ref } from 'vue'
import NavMenu from '../../../cedar-design-web/packages/ui/src/nav-menu'
import Steps, { Step } from '../../../cedar-design-web/packages/ui/src/steps'
import Timeline, { TimelineItem } from '../../../cedar-design-web/packages/ui/src/timeline'
import Transfer from '../../../cedar-design-web/packages/ui/src/transfer'
import Tree from '../../../cedar-design-web/packages/ui/src/tree'
import MapleNavMenu, { NavMenuItem as MapleNavItem } from '../../../maple-design-mobile/packages/ui/src/nav-menu'
import MapleSteps, { Step as MapleStep } from '../../../maple-design-mobile/packages/ui/src/steps'
import '../../../cedar-design-web/packages/ui/src/steps/style'
import '../../../cedar-design-web/packages/ui/src/timeline/style'
import '../../../cedar-design-web/packages/ui/src/nav-menu/style'
import '../../../cedar-design-web/packages/ui/src/tree/style'
import '../../../cedar-design-web/packages/ui/src/transfer/style'
import '../../../maple-design-mobile/packages/ui/src/steps/style'
import '../../../maple-design-mobile/packages/ui/src/nav-menu/style'

const options = [
  { key: 'parent', label: 'Parent', children: [{ key: 'child', label: 'Child' }] },
  { key: 'second', label: 'Second' },
]
const data = [
  {
    value: 'parent',
    label: 'Parent',
    children: [
      { value: 'disabled', label: 'Disabled', disabled: true },
      { value: 'child', label: 'Child' },
    ],
  },
  { value: 'second', label: 'Second' },
]
const styles = document.createElement('style')
styles.textContent =
  'body{font:16px sans-serif;margin:24px;padding-bottom:100vh}section{margin:18px 0;padding:16px;border:1px solid #aaa}#scope{max-width:1000px;margin:auto}.timeline{height:160px}.tree{height:220px}button{font:inherit}.nested{padding:12px;border:1px dashed #777}'
document.head.append(styles)
createApp(
  defineComponent({
    setup() {
      const dir = ref<'ltr' | 'rtl'>('ltr'),
        current = ref(1),
        changes = ref(0),
        reverse = ref(false)
      const section = (id: string, content: any, cls?: string) => h('section', { id, class: cls }, content)
      const stepChildren = (Comp: any) => () => [
        h(Comp, { title: 'One', description: 'First' }),
        h(Comp, { title: 'Disabled', disabled: true }),
        h(Comp, { title: 'Three', description: 'Last' }),
      ]
      const steps = (id: string, extra = {}, local = false) =>
        section(
          id,
          h(
            Steps,
            {
              modelValue: current.value,
              changeable: true,
              'onUpdate:modelValue': (value) => {
                current.value = value
                changes.value++
              },
              ...extra,
            },
            { default: stepChildren(Step) },
          ),
          local ? 'nested' : undefined,
        )
      const timeline = (mode: string, orientation: 'horizontal' | 'vertical' = 'vertical', labelPosition = 'same') =>
        h(
          Timeline,
          { mode, orientation, labelPosition, reverse: reverse.value },
          {
            default: () =>
              [1, 2, 3].map((value) => h(TimelineItem, { label: `Time ${value}` }, () => `Event ${value}`)),
          },
        )
      return () =>
        h('main', [
          h(
            'button',
            {
              id: 'toggle',
              onClick: () => {
                dir.value = dir.value === 'ltr' ? 'rtl' : 'ltr'
              },
            },
            `Direction: ${dir.value}`,
          ),
          h(
            'button',
            {
              id: 'reverse',
              onClick: () => {
                reverse.value = !reverse.value
              },
            },
            'Reverse timeline',
          ),
          h('output', { id: 'state' }, `${current.value}:${changes.value}`),
          h('div', { id: 'scope', dir: dir.value }, [
            steps('steps'),
            steps('dot', { type: 'dot' }),
            steps('arrow', { type: 'arrow' }),
            steps('navigation', { type: 'navigation' }),
            steps('vertical', { orientation: 'vertical' }),
            section('nested', h('div', { dir: 'ltr' }, [steps('local-steps')])),
            section('timeline', timeline('top', 'horizontal'), 'timeline'),
            section('timeline-left', timeline('left', 'vertical', 'relative')),
            section('timeline-right', timeline('right', 'vertical', 'relative')),
            section('timeline-alternate', timeline('alternate')),
            section('timeline-alternate-relative', timeline('alternate', 'vertical', 'relative')),
            section('menu', h(NavMenu, { mode: 'horizontal', responsive: false, options })),
            section('vertical-menu', h(NavMenu, { options })),
            section('collapsed-menu', h(NavMenu, { collapsed: true, options, style: { marginInline: '350px' } })),
            section('tree', h(Tree, { data, animation: false, showLine: true }), 'tree'),
            section(
              'virtual-tree',
              h(Tree, { data, animation: false, virtualListProps: { height: 120, threshold: 0 } }),
              'tree',
            ),
            section(
              'transfer',
              h(Transfer, {
                data: [
                  { value: 'a', label: 'Alpha' },
                  { value: 'b', label: 'Beta' },
                  { value: 'required', label: 'Required', required: true },
                ],
                defaultValue: [{ value: 'b' }],
                sourceTitle: 'Candidates',
                targetTitle: 'Selected',
                sourceFilterable: true,
                targetFilterable: true,
              }),
            ),
            section('maple-steps', h(MapleSteps, { changeable: true }, { default: stepChildren(MapleStep) })),
            section(
              'maple-menu',
              h(
                MapleNavMenu,
                {},
                {
                  default: () => [
                    h(MapleNavItem, {
                      name: 'one',
                      label: 'One',
                      options: [
                        { key: 'a', label: 'Alpha' },
                        { key: 'b', label: 'Beta' },
                      ],
                    }),
                    h(MapleNavItem, { name: 'two', label: 'Two' }),
                  ],
                },
              ),
            ),
          ]),
        ])
    },
  }),
).mount('#app')
