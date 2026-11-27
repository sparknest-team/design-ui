<template>
  <div ref="container" class="vmi-previewer-example" :class="{ 'vmi-example-pending': deferred && !activated }" :style="[props.transform ? 'transform: translate(0px, 0px);' : '']">
    <iframe v-if="props.iframe" width="100%" :height="height" :src="localizedIframeSrc" frameborder="0"></iframe>
    <ClientOnly v-else><slot v-if="!deferred || activated" /></ClientOnly>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { ClientOnly, usePageFrontmatter } from 'vuepress/client'
import { useRoute } from 'vue-router'

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
  transform: {
    type: Boolean,
    default: false,
  },
})

const frontmatter = usePageFrontmatter()
const deferred = computed(() => frontmatter.value.deferExamples === true && !props.iframe)
const container = ref<HTMLElement>()
const activated = ref(false)
let observer: IntersectionObserver | undefined
onMounted(() => {
  if (!deferred.value || !container.value || typeof IntersectionObserver === 'undefined') {
    activated.value = true
    return
  }
  observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      activated.value = true
      observer?.disconnect()
    }
  }, { rootMargin: '240px' })
  observer.observe(container.value)
})
onBeforeUnmount(() => observer?.disconnect())

const route = useRoute()
const localizedIframeSrc = computed(() => {
  const src = props.iframeSrc
  if (!src.includes('-iframe.html')) return src
  return `${src}${src.includes('?') ? '&' : '?'}language=${/^\/en(?:-US)?\//.test(route.path) ? 'en-US' : 'zh-CN'}`
})
const height = computed(() => {
  return typeof props.iframe === 'boolean' ? '150' : props.iframe
})
</script>

<style scoped>
.vmi-example-pending { min-height: 12rem; }
</style>
