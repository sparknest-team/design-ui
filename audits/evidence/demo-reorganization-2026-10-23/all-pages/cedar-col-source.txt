<script setup lang="ts">
import { ref } from 'vue'
const span = ref(8)
const offset = ref(4)
</script>
<template><div>
  <div class="controls">Span<c-radio-group v-model="span"><c-radio v-for="value in [4, 8, 12]" :key="value" :value="value">{{ value }}</c-radio></c-radio-group></div>
  <div class="controls">Offset<c-radio-group v-model="offset"><c-radio v-for="value in [0, 4, 8]" :key="value" :value="value">{{ value }}</c-radio></c-radio-group></div>
  <c-row :gutter="12"><c-col :span="span" :offset="offset"><div class="cell">{{ span }} / +{{ offset }}</div></c-col><c-col :span="4"><div class="cell soft">4</div></c-col></c-row>
</div></template>

<style scoped>
.controls { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.cell { box-sizing: border-box; padding: 12px; min-width: 0; border-radius: 4px; background: var(--c-color-primary); color: var(--c-color-white); text-align: center; overflow-wrap: anywhere; }
.soft { opacity: .7; }
</style>
