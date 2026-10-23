<script setup lang="ts">
import type { ProgressGroupItem } from '@cedarjs/ui'

const items: ProgressGroupItem[] = [
  { label: '系统', value: 24, color: '#64748b' },
  { label: '应用', value: 8, color: '#f53f3f' },
  { label: '多媒体', value: 42, color: '#00b42a' },
]
</script>

<template>
  <c-progress-group :items="items" :max="128" show-text style="max-width: 520px" />
</template>
