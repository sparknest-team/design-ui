<script setup lang="ts">
import DirectionToggle from './DirectionToggle.vue'
import DocsSelect from './DocsSelect.vue'
import DocsSourceIcon from './DocsSourceIcon.vue'

defineProps<{
  language: 'zh-CN' | 'en-US'
  repository: string
  theme: string
  themes: { value: string; label: string }[]
}>()
defineEmits<{
  themeChange: [value: string]
  languageChange: [value: string]
}>()
const languages = [
  { value: 'zh-CN', label: '中文' },
  { value: 'en-US', label: 'English' },
]
</script>

<template>
  <div class="docs-navbar-tools">
    <DirectionToggle />
    <a
      :href="repository"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="language === 'en-US' ? 'Source on GitHub' : 'GitHub 源码'"
      :title="language === 'en-US' ? 'Source on GitHub' : 'GitHub 源码'"
      class="docs-navbar-tools__source"
    ><DocsSourceIcon /></a>
    <DocsSelect icon="theme" :label="language === 'en-US' ? 'Theme' : '主题'" :value="theme" :options="themes" @change="$emit('themeChange', $event)" />
    <DocsSelect icon="language" :label="language === 'en-US' ? 'Language' : '语言'" :value="language" :options="languages" @change="$emit('languageChange', $event)" />
  </div>
</template>

<style scoped>
.docs-navbar-tools { display: flex; align-items: center; gap: 4px; }
.docs-navbar-tools__source { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; color: inherit; border-radius: 4px; }
.docs-navbar-tools__source:hover { background: var(--docs-tools-hover, #8882); }
</style>
