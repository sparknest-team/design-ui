import { createApp, defineComponent, h, ref } from 'vue'
import Split from '../../../cedar-design-web/packages/ui/src/split'
import ResizeBox from '../../../cedar-design-web/packages/ui/src/resize-box'
import Table from '../../../cedar-design-web/packages/ui/src/table'
import VirtualList from '../../../cedar-design-web/packages/ui/src/_components/virtual-list-v2'
import MapleVirtualList from '../../../maple-design-mobile/packages/ui/src/_components/virtual-list-v2'
import MapleTable from '../../../maple-design-mobile/packages/ui/src/table'
import '../../../cedar-design-web/packages/ui/src/split/style'
import '../../../cedar-design-web/packages/ui/src/resize-box/style'
import '../../../cedar-design-web/packages/ui/src/table/style'
import '../../../maple-design-mobile/packages/ui/src/table/style'
const rows = Array.from({ length: 200 }, (_, key) => ({ key, l1: `L1-${key}`, l2: `L2-${key}`, name: `Row ${key}`, amount: key, r1: `R1-${key}`, r2: `R2-${key}` }))
const columns = [
  { title: 'Left group', children: [{ title: 'Left 1', dataIndex: 'l1', width: 100, fixed: 'left' }, { title: 'Left 2', dataIndex: 'l2', width: 100, fixed: 'left' }] },
  { title: 'Name', dataIndex: 'name', width: 300 }, { title: 'Amount', dataIndex: 'amount', width: 300, sortable: { sortDirections: ['ascend', 'descend'] } },
  { title: 'Right group', children: [{ title: 'Right 1', dataIndex: 'r1', width: 100, fixed: 'right' }, { title: 'Right 2', dataIndex: 'r2', width: 100, fixed: 'right' }] },
]
const style = document.createElement('style'); style.textContent = 'body{font:14px sans-serif;margin:24px}section{margin:18px 0;padding:12px;border:1px solid #aaa;width:740px;box-sizing:border-box}#scope{width:800px;margin:auto}.pane{padding:12px;box-sizing:border-box}button{font:inherit}'; document.head.append(style)
createApp(defineComponent({ setup() {
  const dir = ref<'ltr' | 'rtl'>('ltr'), size = ref(0.5), changes = ref(0), virtual = ref(true)
  const panes = { first: () => h('div', { class: 'pane' }, 'First pane'), second: () => h('div', { class: 'pane' }, 'Second pane') }
  const section = (id: string, contents: any) => h('section', { id }, contents)
  const table = (id: string, props = {}) => section(id, h(Table, { columns, data: rows, height: 190, stickyPagination: true, pagination: { pageSize: 50 }, columnResizable: true, summary: true, rowSelection: { fixed: true, showCheckedAll: true }, ...props }))
  const list = (Comp: any) => h(Comp, { data: rows, height: 140, fixedSize: true, estimatedSize: 30 }, { item: ({ item }) => h('div', { style: 'width:1200px;height:30px;display:flex;justify-content:space-between', 'data-row': item.key }, [h('span', `Start ${item.key}`), h('span', `End ${item.key}`)]) })
  return () => h('main', [h('button', { id: 'toggle', onClick: () => { dir.value = dir.value === 'ltr' ? 'rtl' : 'ltr' } }, dir.value), h('button', { id: 'toggle-virtual', onClick: () => { virtual.value = !virtual.value } }, 'Virtual rows'), h('output', { id: 'split-state' }, `${size.value}:${changes.value}`), h('div', { id: 'scope', dir: dir.value }, [
    section('split', h(Split, { size: size.value, min: 0.2, max: 0.8, style: 'height:100px', 'onUpdate:size': value => { size.value = value; changes.value++ } }, panes)),
    section('vertical', h(Split, { orientation: 'vertical', style: 'height:180px', min: '30px', max: '150px', defaultSize: '90px' }, panes)),
    section('nested', h('div', { dir: 'ltr' }, [h(Split, { style: 'height:80px' }, panes)])),
    section('resize', h(ResizeBox, { directions: ['left', 'right', 'top', 'bottom'], style: 'width:350px;height:110px;box-sizing:content-box' }, () => 'Physical edges')),
    table('table'), table('mixed-table', { columns: [{ title: 'Mixed group', children: [{ title: 'Left 1', dataIndex: 'l1', width: 100, fixed: 'left' }, { title: 'Nested', children: [{ title: 'Name', dataIndex: 'name', width: 300 }, { title: 'Amount', dataIndex: 'amount', width: 300 }, { title: 'Right 1', dataIndex: 'r1', width: 100, fixed: 'right' }, { title: 'Right 2', dataIndex: 'r2', width: 100, fixed: 'right' }] }] }] }), table('virtual-table', { virtualListProps: virtual.value ? { height: 190, estimatedSize: 40, fixedSize: true } : undefined }),
    table('portal-table', { pagination: { pageSize: 50, container: '#footer-host' } }),
    section('virtual-list', list(VirtualList)), section('maple-virtual', list(MapleVirtualList)),
    section('maple-table', h(MapleTable, { fullWidth: 1200, scrollerHeight: 150 }, () => [h('thead', [h('tr', ['A','B','C'].map(t => h('th',t)))]), h('tbody', [h('tr', ['First','Middle','Last'].map(t => h('td',t)))])])),
  ]), h('div', { id: 'footer-host', dir: 'ltr', style: 'width:716px;margin:auto' })])
} })).mount('#app')
