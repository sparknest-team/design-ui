<template>
  <div :style="{ background: 'var(--color-fill-2)', padding: '28px' }">
    <c-page-header
      :style="{ background: 'var(--color-bg-2)' }"
      show-back
      title="Cedar Design"
      subtitle="页面级标题区"
      @back="onBack"
    >
      <template #extra>
        <c-radio-group type="button" default-value="md">
          <c-radio value="xs">xs</c-radio>
          <c-radio value="sm">sm</c-radio>
          <c-radio value="md">md</c-radio>
        </c-radio-group>
      </template>
    </c-page-header>
  </div>
</template>

<script lang="ts" setup>
import { Message } from '@cedarjs/ui'
const onBack = () => {
  Message.info('点击返回')
}
</script>
