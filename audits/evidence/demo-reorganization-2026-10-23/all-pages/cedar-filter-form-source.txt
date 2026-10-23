<template>
  <c-filter-form
    v-model="filter"
    v-model:collapsed="collapsed"
    :fields="fields"
    :rules="rules"
  >
    <template #actions>
      <c-button variant="outline" :elevation="false" @click="reset">重置</c-button>
      <c-button status="primary" :elevation="false" @click="search">搜索</c-button>
    </template>
  </c-filter-form>
  <pre class="demo-filter-json">{{ filter }}</pre>
  <p role="status">{{ result }}</p>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import {
  Cascader,
  DateRange,
  Input,
  Select,
  type FilterFormField,
} from '@cedarjs/ui'

const collapsed = ref(true)
const result = ref('尚未搜索')
const filter = ref<Record<string, unknown>>({
  region: undefined,
  status: undefined,
  keyword: '',
  timeRange: undefined,
})

const options = {
  status: [
    { label: '待处理', value: 'pending' },
    { label: '进行中', value: 'doing' },
    { label: '已完成', value: 'done' },
  ],
  owner: [
    { label: '张三', value: 'zhang' },
    { label: '李四', value: 'li' },
  ],
}

const rules = {
  keyword: [{ maxLength: 50, message: '最多 50 个字符' }],
}

const fields: FilterFormField[] = [
  {
    component: Cascader,
    field: 'region',
    label: '地区',
    props: {
      clearable: true,
      placeholder: '请选择地区',
      pathMode: true,
      variant: 'outline',
      options: [
        {
          value: 'beijing',
          label: '北京',
          children: [
            { value: 'chaoyang', label: '朝阳' },
            { value: 'haidian', label: '海淀' },
          ],
        },
        {
          value: 'shanghai',
          label: '上海',
          children: [{ value: 'huangpu', label: '黄浦' }],
        },
      ],
    },
  },
  {
    component: Select,
    field: 'status',
    label: '状态',
    props: { variant: 'outline', clearable: true, placeholder: '全部', options: options.status },
  },
  {
    component: Select,
    field: 'owner',
    label: '负责人',
    props: { variant: 'outline', clearable: true, placeholder: '全部', options: options.owner },
  },
  {
    component: Input,
    field: 'keyword',
    label: '关键词',
    autoEmitChange: false,
    props: { variant: 'outline', clearable: true, placeholder: '回车或失焦触发' },
  },
  {
    component: DateRange,
    field: 'timeRange',
    label: '时间范围',
    gridItemProps: { span: 2 },
    props: { variant: 'outline', valueFormat: 'timestamp', clearable: true, showTime: true },
  },
]

function search() {
  result.value = `搜索条件：${JSON.stringify(filter.value)}`
}

function reset() {
  result.value = '已重置'
  filter.value = {
    region: undefined,
    status: undefined,
    keyword: '',
    timeRange: undefined,
  }
}
</script>

<style scoped>
.demo-filter-json {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 4px;
  background: var(--c-sys-color-surface-muted);
  color: var(--c-sys-color-content-secondary);
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
