<script setup>
import { ref } from "vue";

const bordered = ref(false);
const round = ref(false);
const explicitRadius = ref(false);
const elevated = ref(false);
const clicks = ref(0);
</script>

<template>
  <section class="paper-live-demo">
    <div class="controls">
      <c-checkbox v-model="bordered"> Paper border</c-checkbox>
      <c-checkbox v-model="round"> Round paper</c-checkbox>
      <c-checkbox v-model="explicitRadius"> Explicit radius</c-checkbox>
      <c-checkbox v-model="elevated"> Paper shadow</c-checkbox>
    </div>
    <p role="status">Surface clicks: {{ clicks }}</p>
    <c-paper
      data-testid="live-paper"
      :bordered="bordered"
      :round="round"
      :radius="explicitRadius ? '12' : undefined"
      :elevation="elevated ? 2 : false"
      width="160"
      :height="100"
      @click="clicks++"
    >
      <c-button html-type="button">Surface action</c-button>
    </c-paper>
  </section>
</template>

<style scoped>
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.controls label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
[data-testid="live-paper"] {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
