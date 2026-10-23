<template>
  <c-button @click="open = true">Open Dialog</c-button>

  <c-dialog
    v-model:open="open"
    title="Dialog Title"
    message="This is a basic component dialog."
    @confirm="Message.success('Confirmed')"
    @cancel="Message.info('Cancelled')"
  />
</template>

<script setup lang="ts">
import { Message } from "@cedarjs/ui";
import { ref } from "vue";

const open = ref(false);
</script>
