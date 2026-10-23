<template>
  <c-dropdown-menu :options="options">
    <c-button icon-container aria-label="更多操作"><c-icon-more /></c-button>
  </c-dropdown-menu>
</template>

<script setup lang="ts">
const options = [
  { label: '编辑', value: 'edit' },
  { label: '复制', value: 'copy' },
  { type: 'divider' },
  { label: '删除', value: 'delete' },
]
</script>
