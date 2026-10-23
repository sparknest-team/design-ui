<template>
  <c-button @click="handleClick">Info Message</c-button>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { Message } from "@cedarjs/ui";

export default defineComponent({
  setup() {
    return {
      handleClick() {
        Message.info("This is an info message");
      },
    };
  },
});
</script>
