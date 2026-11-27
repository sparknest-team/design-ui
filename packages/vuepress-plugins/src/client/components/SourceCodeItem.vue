<template>
  <div v-if="failed" role="alert">Unable to load source. <button type="button" @click="retry++">Retry</button></div>
  <div v-else class="vmi-previewer-sources-item" v-html="html"></div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { loadSource } from '../source-data'
const props = defineProps({
  name: String,
  rawCode: String,
  highlightCode: String,
  sourceUrl: String,
})
const loaded = ref('')
const failed = ref(false)
const retry = ref(0)
const html = computed(() => props.sourceUrl ? loaded.value : decodeURIComponent(props.highlightCode || ''))
watch(() => [props.sourceUrl, retry.value], async (_, __, onCleanup) => {
  if (!props.sourceUrl || typeof window === 'undefined') return
  let active = true
  onCleanup(() => { active = false })
  loaded.value = ''
  failed.value = false
  try {
    const source = await loadSource(props.sourceUrl)
    if (active) loaded.value = source.highlightCode
  } catch {
    if (active) failed.value = true
  }
}, { immediate: true })
</script>
