<template>
  <c-button status="primary" @click="handleClick">Open Drawer</c-button>
  <c-drawer v-model:open="visible" :width="340" @confirm="handleConfirm" @cancel="handleCancel" unmount-on-close>
    <template #title>Title</template>
    <div>
      You can customize modal body text by the current situation. This modal will be closed immediately once you press
      the OK button.
    </div>
  </c-drawer>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const visible = ref(false)

const handleClick = () => {
  visible.value = true
}
const handleConfirm = () => {
  visible.value = false
}
const handleCancel = () => {
  visible.value = false
}
</script>
