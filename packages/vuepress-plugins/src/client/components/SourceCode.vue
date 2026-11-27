<template>
  <div class="vmi-previewer-actions" v-if="!props.hideAllActions">
    <div class="vmi-previewer-actions-left">
      <a
        v-if="!hideActions.includes('EXTERNAL')"
        :title="label('在新标签页打开示例', 'Open demo in new tab')"
        class="vmi-previewer-actions-button no-external-link-icon"
        :href="localizedIframeSrc"
        target="_blank"
        rel="noopener"
      >
        <Open />
      </a>
      <span
        v-if="props.iframe"
        :title="label('重新加载示例', 'Reload demo iframe page')"
        class="vmi-previewer-actions-button"
        @click="refreshIframe"
      >
        <Refresh />
      </span>
      <span
        v-if="props.filePath"
        :title="label('在编辑器中打开示例', 'Open demo file in editor')"
        class="vmi-previewer-actions-button"
        @click="openEditor"
      >
        <Edit />
      </span>
    </div>
    <div class="vmi-previewer-actions-right">
      <span class="vmi-previewer-actions-button" :title="label('复制源码', 'Copy source code')" @click="handleCopy">
        <Copy v-show="!state.isCopy" />
        <CopySuccess v-show="state.isCopy" />
      </span>
      <span class="vmi-previewer-actions-button" :title="label('展开或收起源码', 'Toggle source code panel')" @click="handleExpand">
        <Expand v-show="!state.isExpand" />
        <UnExpand v-show="state.isExpand" />
      </span>
    </div>
  </div>
  <span v-if="copyError" role="alert">{{ label('源码加载或复制失败，请重试', 'Could not load or copy source. Please retry.') }}</span>
  <div v-if="state.isExpand" class="vmi-previewer-sources">
    <div v-if="$slots.default?.().length > 1" class="vmi-previewer-tabs">
      <div
        v-for="(component, index) of $slots.default?.()"
        :key="index"
        :class="{ active: state.active === index }"
        class="vmi-previewer-tabs-tab"
        @click="handleTabClick(index)"
      >
        <File />
        <span>{{ component.props.name }}</span>
      </div>
    </div>
    <component :is="$slots.default?.()[state.active]"></component>
  </div>
</template>

<script lang="ts" setup>
import { useSlots, ref, reactive, computed } from 'vue'
import { loadSource } from '../source-data'
import { useRoute } from 'vue-router'
const route = useRoute()
const english = computed(() => /^\/en(?:-US)?\//.test(route.path) || route.query.language === 'en-US')
const label = (zh: string, en: string) => english.value ? en : zh
const localizedIframeSrc = computed(() => props.iframeSrc.includes('-iframe.html') ? `${props.iframeSrc}${props.iframeSrc.includes('?') ? '&' : '?'}language=${english.value ? 'en-US' : 'zh-CN'}` : props.iframeSrc)
import { useClipboard } from '@vueuse/core'
import Expand from '../icons/Expand.vue'
import UnExpand from '../icons/UnExpand.vue'
import Copy from '../icons/Copy.vue'
import CopySuccess from '../icons/CopySuccess.vue'
import File from '../icons/File.vue'
import Open from '../icons/Open.vue'
import Refresh from '../icons/Refresh.vue'
import Edit from '../icons/Edit.vue'

/**
 * Props define
 */
const props = defineProps({
  id: String,
  iframe: {
    type: [Boolean, String, Number],
    default: false,
  },
  iframeSrc: {
    type: String,
    default: '',
  },
  defaultShowCode: {
    type: Boolean,
    default: false,
  },
  hideActions: {
    type: String,
    default: '',
  },
  filePath: {
    type: String,
    default: '',
  },
  hideAllActions: {
    type: Boolean,
    default: false,
  },
})

/**
 * Get slots
 */
const slots = useSlots()

/**
 * Parse props
 */
const hideActions = ref<string[]>([])
try {
  if (props.hideActions) {
    hideActions.value = JSON.parse(props.hideActions)
  }
} catch (error) {}

/**
 * Code status
 */
const state = reactive({
  active: 0,
  isCopy: false,
  isExpand: props.defaultShowCode,
})

const handleExpand = () => {
  state.isExpand = !state.isExpand
}

const handleTabClick = (index) => {
  state.active = index
}

/**
 * Copy raw code
 */
const rawCode = ref('')
const copyError = ref(false)
const { copy } = useClipboard({ source: rawCode })
const handleCopy = async () => {
  copyError.value = false
  try {
    const source = slots.default?.()[state.active]?.props
    if (!source) return
    rawCode.value = source.sourceUrl
      ? (await loadSource(source.sourceUrl)).rawCode
      : decodeURIComponent(source.rawCode || '')
    await copy()
  } catch {
    copyError.value = true
    return
  }

  state.isCopy = true

  setTimeout(() => {
    state.isCopy = false
  }, 1000)
}

/**
 * Extended functions
 */
const refreshIframe = (e: MouseEvent) => {
  const iframe = (e.target as HTMLElement).parentNode.parentNode.parentNode.parentNode?.parentNode?.querySelector(
    'iframe',
  )
  iframe.src = iframe.getAttribute('src')
}

const openEditor = () => {
  fetch(`http://localhost:9080/?file=${props.filePath}`)
}
</script>
