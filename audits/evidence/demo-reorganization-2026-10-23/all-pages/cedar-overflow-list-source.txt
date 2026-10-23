<template>
  <c-form auto-label-width>
    <c-form-item label="Tag Number">
      <c-input-number v-model="number" :min="0" :max="20" style="width: 200px" />
    </c-form-item>
    <c-form-item label="List Width">
      <c-slider v-model="width" :min="0" :max="800" />
    </c-form-item>
  </c-form>
  <div :style="{ width: `${width}px`, marginTop: '20px' }">
    <c-overflow-list>
      <div>DIV Element</div>
      <c-tag v-for="item of tags" :key="item">Tag{{ item }}</c-tag>
    </c-overflow-list>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

const width = ref(500)
const number = ref(10)
const tags = computed(() => Array.from({ length: number.value }, (_, idx) => idx + 1))
</script>
