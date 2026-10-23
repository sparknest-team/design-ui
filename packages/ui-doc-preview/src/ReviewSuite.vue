<script setup lang="ts">
import { computed, ref, type Component } from "vue";
const props = defineProps<{
  cases: { name: string; label: string; component: Component }[];
  select: Component;
}>();
const selected = ref(props.cases[0]?.name);
const revision = ref(0);
const active = computed(
  () =>
    props.cases.find((item) => item.name === selected.value) ?? props.cases[0],
);
</script>
<template>
  <div class="demo-review-suite">
    <component
      :is="select"
      v-model="selected"
      :options="cases.map((item) => ({ label: item.label, value: item.name }))"
      :clearable="false"
      aria-label="审查对象与场景 / Review target and scenario"
    />
    <component
      v-if="active"
      :is="active.component"
      :key="`${active.name}:${revision}`"
      @review-reset="revision++"
    />
  </div>
</template>
