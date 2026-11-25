<script setup lang="ts">
import { computed, ref, type Component } from 'vue'
import { summarizeReviewEvent } from './review-state'

const props = defineProps<{
  name: string
  context?: unknown
  controls: Record<string, Component>
  record?: (name: string, args: unknown[]) => void
}>()
const argsText = ref('[]')
const source = ref(props.name === 'clear-icon' ? 'event' : 'json')
const result = ref('')
const scope = computed<Record<string, any>>(() =>
  props.context && typeof props.context === 'object' && !Array.isArray(props.context)
    ? (props.context as Record<string, any>)
    : props.context === undefined
      ? {}
      : { value: props.context },
)
const actions = computed(() => Object.keys(scope.value).filter((key) => typeof scope.value[key] === 'function'))
const sources = computed(() => [
  { label: 'JSON 参数 / Arguments', value: 'json' },
  { label: '当前按钮事件 / Button event', value: 'event' },
  ...Object.keys(scope.value)
    .filter((key) => typeof scope.value[key] !== 'function')
    .map((key) => ({ label: `上下文 / Scope: ${key}`, value: key })),
])
const label = computed(() => {
  const columnKey = scope.value.column?.dataIndex
  const cellValue =
    props.name === 'cell' && typeof columnKey === 'string'
      ? columnKey.split('.').reduce((value: any, key: string) => value?.[key], scope.value.record)
      : undefined
  const value =
    scope.value.label ??
    scope.value.title ??
    scope.value.value ??
    cellValue ??
    scope.value.record?.name ??
    scope.value.node?.title ??
    scope.value.item?.label ??
    scope.value.date ??
    scope.value.percent ??
    scope.value.current ??
    props.name
  if (value instanceof Date) return String(value.getDate())
  if (value && typeof value === 'object')
    return String(value.label ?? value.title ?? value.name ?? value.value ?? summarizeReviewEvent([value])).slice(0, 80)
  return String(value)
})
async function invoke(name: string, event?: Event) {
  try {
    const args =
      source.value === 'json'
        ? JSON.parse(argsText.value)
        : source.value === 'event'
          ? [event]
          : [scope.value[source.value]]
    if (!Array.isArray(args)) throw new Error('参数必须为数组 / Expected an array')
    props.record?.(`slot:${props.name}.${name}`, args)
    const value = await scope.value[name](...args)
    result.value = summarizeReviewEvent([value])
  } catch (error) {
    result.value = String(error)
  }
}
</script>
<template>
  <component
    v-if="name === 'clear-icon' && typeof scope.clear === 'function'"
    :is="controls.Button"
    size="xs"
    aria-label="自定义清空 / Custom clear"
    @mousedown.prevent
    @click.stop="invoke('clear', $event)"
    >清除</component
  >
  <component v-else :is="controls.Space" direction="column" size="xs" class="demo-review-slot">
    <component :is="controls.Tag" size="sm">{{ label }}</component>
    <component :is="controls.Collapse" @click.stop v-if="Object.keys(scope).length">
      <component :is="controls.CollapseItem" :name="name" :title="`插槽参数 / Scope: ${name}`">
        <pre>{{ summarizeReviewEvent([scope]) }}</pre>
        <template v-if="actions.length">
          <component
            :is="controls.Select"
            v-model="source"
            :options="sources"
            :aria-label="`${name} argument source`"
            :clearable="false"
          />
          <component
            :is="controls.Input"
            v-if="source === 'json'"
            v-model="argsText"
            :aria-label="`${name} JSON arguments`"
          />
          <component :is="controls.Space" wrap>
            <component
              :is="controls.Button"
              v-for="action in actions"
              :key="action"
              size="sm"
              @click.stop="invoke(action, $event)"
              >{{ action }}</component
            >
          </component>
          <pre role="status">{{ result }}</pre>
        </template>
      </component>
    </component>
  </component>
</template>
<style scoped>
.demo-review-slot {
  max-width: 100%;
  min-width: 0;
}
pre {
  max-width: 100%;
  max-height: 180px;
  overflow: auto;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
