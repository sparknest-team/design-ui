<template>
  <c-space>
    <c-button @click="handleNotification"> Open Notification </c-button>
  </c-space>
</template>
<script lang="ts" setup>
import { Notification } from '@cedarjs/ui'

const handleNotification = () => {
  Notification.info({
    title: 'Notification',
    content: 'This is a notification!',
  })
}
</script>
