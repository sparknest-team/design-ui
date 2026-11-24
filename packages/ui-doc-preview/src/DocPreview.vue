<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { DocPreviewSource } from './types'

const props = withDefaults(
  defineProps<{
    sources?: DocPreviewSource[]
    defaultShowCode?: boolean
    showPlayground?: boolean
    labels?: Partial<{
      playground: string
      copy: string
      copied: string
      showSource: string
      hideSource: string
      loadError: string
      retry: string
    }>
  }>(),
  {
    sources: () => [],
    defaultShowCode: false,
    showPlayground: false,
    labels: () => ({}),
  },
)

const emit = defineEmits<{
  copied: []
  copyError: [error: unknown]
  playground: [source: string]
  toggle: [expanded: boolean]
}>()

const fallbackLabels = {
  playground: 'Edit in Playground',
  copy: 'Copy source code',
  copied: 'Source copied',
  showSource: 'Show source',
  hideSource: 'Hide source',
  loadError: 'Unable to load source.',
  retry: 'Retry',
}
const label = computed(() => ({ ...fallbackLabels, ...props.labels }))
const expanded = ref(props.defaultShowCode)
const active = ref(0)
const loaded = ref<Record<string, DocPreviewSource>>({})
const failed = ref(false)
const retry = ref(0)
const selected = computed(() => props.sources[active.value])
const resolvedSource = computed(() => {
  const source = selected.value
  if (!source) return undefined
  return source.sourceUrl ? loaded.value[source.sourceUrl] : source
})

watch(
  () => [selected.value?.sourceUrl, retry.value, expanded.value] as const,
  async ([sourceUrl, , isExpanded], _, onCleanup) => {
    if (!sourceUrl || !isExpanded || typeof window === 'undefined') return
    if (loaded.value[sourceUrl]) return
    let activeRequest = true
    onCleanup(() => {
      activeRequest = false
    })
    failed.value = false
    try {
      const response = await fetch(sourceUrl)
      if (!response.ok) throw new Error(`Source request failed: ${response.status}`)
      const source = (await response.json()) as DocPreviewSource
      if (activeRequest) loaded.value = { ...loaded.value, [sourceUrl]: source }
    } catch (error) {
      if (activeRequest) failed.value = true
    }
  },
  { immediate: true },
)

function toggle() {
  expanded.value = !expanded.value
  emit('toggle', expanded.value)
}

async function copySource() {
  const source = resolvedSource.value?.rawCode ?? ''
  try {
    await navigator.clipboard.writeText(source)
    emit('copied')
  } catch (error) {
    emit('copyError', error)
  }
}
</script>

<template>
  <div class="loca-doc-preview">
    <div class="loca-doc-preview__example">
      <slot />
    </div>

    <div class="loca-doc-preview__actions">
      <div class="loca-doc-preview__actions-group">
        <slot name="actions-left" :source="resolvedSource" />
        <button
          v-if="showPlayground"
          type="button"
          class="loca-doc-preview__action"
          :aria-label="label.playground"
          :title="label.playground"
          @click="emit('playground', resolvedSource?.rawCode ?? '')"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m8.5 8-4 4 4 4m7-8 4 4-4 4M14 5l-4 14" />
          </svg>
        </button>
      </div>

      <div class="loca-doc-preview__actions-group">
        <button
          v-if="sources.length"
          type="button"
          class="loca-doc-preview__action"
          :aria-label="label.copy"
          :title="label.copy"
          @click="copySource"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 8h11v11H8z" />
            <path d="M16 8V5H5v11h3" />
          </svg>
        </button>
        <button
          v-if="sources.length"
          type="button"
          class="loca-doc-preview__action"
          :aria-expanded="expanded"
          :aria-label="expanded ? label.hideSource : label.showSource"
          :title="expanded ? label.hideSource : label.showSource"
          @click="toggle"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m7 9 5-5 5 5M7 15l5 5 5-5" />
          </svg>
        </button>
      </div>
    </div>

    <div v-if="expanded" class="loca-doc-preview__sources">
      <div v-if="sources.length > 1" class="loca-doc-preview__tabs" role="tablist">
        <button
          v-for="(source, index) in sources"
          :key="source.name"
          type="button"
          role="tab"
          class="loca-doc-preview__tab"
          :class="{ 'loca-doc-preview__tab--active': active === index }"
          :aria-selected="active === index"
          @click="active = index"
        >
          {{ source.name }}
        </button>
      </div>
      <div v-if="failed" class="loca-doc-preview__error" role="alert">
        {{ label.loadError }}
        <button type="button" @click="retry++">{{ label.retry }}</button>
      </div>
      <div v-else class="loca-doc-preview__source" v-html="resolvedSource?.highlightCode" />
    </div>
  </div>
</template>

<style>
.loca-doc-preview {
  overflow: hidden;
  color: var(--loca-doc-preview-text, inherit);
  background: var(--loca-doc-preview-bg, transparent);
  border: 1px solid var(--loca-doc-preview-border, rgb(0 0 0 / 12%));
  border-radius: var(--loca-doc-preview-radius, 4px);
}

.loca-doc-preview__example {
  padding: var(--loca-doc-preview-padding, 32px 24px);
  background: var(--loca-doc-preview-example-bg, inherit);
}

.loca-doc-preview__actions,
.loca-doc-preview__actions-group {
  display: flex;
  align-items: center;
}

.loca-doc-preview__actions {
  justify-content: space-between;
  min-height: 40px;
  padding: 0 5px;
  border-top: 1px dashed var(--loca-doc-preview-border, rgb(0 0 0 / 12%));
}

.loca-doc-preview__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 7px;
  color: inherit;
  background: transparent;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0.65;
}

.loca-doc-preview__action:hover,
.loca-doc-preview__action:focus-visible {
  background: color-mix(in srgb, currentColor 10%, transparent);
  opacity: 1;
}

.loca-doc-preview__action svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.loca-doc-preview__sources {
  border-top: 1px dashed var(--loca-doc-preview-border, rgb(0 0 0 / 12%));
}

.loca-doc-preview__tabs {
  display: flex;
  overflow-x: auto;
  border-bottom: 1px dashed var(--loca-doc-preview-border, rgb(0 0 0 / 12%));
}

.loca-doc-preview__tab {
  position: relative;
  padding: 0 16px;
  color: inherit;
  line-height: 36px;
  white-space: nowrap;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.loca-doc-preview__tab--active::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  content: '';
  background: var(--loca-doc-preview-brand, currentColor);
}

.loca-doc-preview__source {
  overflow: auto;
  background: var(--loca-doc-preview-source-bg, inherit);
}

.loca-doc-preview__source pre {
  margin: 0;
  padding: 20px 24px;
}

.loca-doc-preview__error {
  padding: 16px 24px;
}
</style>
