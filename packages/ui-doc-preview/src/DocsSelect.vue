<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

defineProps<{ label: string; icon: 'theme' | 'language'; value: string; options: { value: string; label: string }[] }>()
const emit = defineEmits<{ (event: 'change', value: string): void }>()
const root = ref<HTMLDetailsElement>()
function close(focus = false) {
  if (root.value) {
    root.value.open = false
    if (focus) root.value.querySelector('summary')?.focus()
  }
}
function choose(value: string) {
  close(true)
  emit('change', value)
}
function outside(event: Event) {
  if (!root.value?.contains(event.target as Node)) close()
}
function leave(event: FocusEvent) {
  if (!root.value?.contains(event.relatedTarget as Node)) close()
}
onMounted(() => document.addEventListener('pointerdown', outside))
onBeforeUnmount(() => document.removeEventListener('pointerdown', outside))
</script>
<template>
  <details ref="root" class="docs-select" @keydown.esc.prevent.stop="close(true)" @focusout="leave">
    <summary :aria-label="label" :title="label">
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        aria-hidden="true"
      >
        <path
          v-if="icon === 'language'"
          d="M3 5h12M9 2v3M5 5c1 5 4 8 9 10M13 5c-1 5-4 8-10 11M14 21l4-10 4 10M15.5 17h5"
        />
        <template v-else>
          <path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1.5-3.3 1.7 1.7 0 0 1 1.3-2.7H18a3 3 0 0 0 3-3 9 9 0 0 0-9-9Z" />
          <circle cx="7" cy="11" r=".7" />
          <circle cx="10" cy="7" r=".7" />
          <circle cx="15" cy="7" r=".7" />
          <circle cx="18" cy="11" r=".7" />
        </template>
      </svg>
      <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" aria-hidden="true">
        <path d="m3 4.5 3 3 3-3" />
      </svg>
    </summary>
    <div class="docs-select__options">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        :aria-pressed="value === option.value"
        @mousedown.prevent
        @click="choose(option.value)"
      >
        <span>{{ option.label }}</span
        ><span aria-hidden="true">{{ value === option.value ? '✓' : '' }}</span>
      </button>
    </div>
  </details>
</template>
<style scoped>
.docs-select {
  position: relative;
  color: var(--docs-tools-text, inherit);
  font-size: 13px;
}
summary {
  color: var(--docs-tools-trigger-color, inherit);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 36px;
  padding: 0 6px;
  list-style: none;
  cursor: pointer;
  border-radius: 4px;
}
summary::-webkit-details-marker {
  display: none;
}
summary:hover,
button:hover {
  background: var(--docs-tools-hover, #8882);
}
.docs-select__options {
  position: absolute;
  inset-inline-end: 0;
  top: calc(100% + 6px);
  z-index: 100;
  min-width: 148px;
  max-height: min(360px, 65vh);
  overflow-y: auto;
  padding: 4px;
  border: 1px solid var(--docs-tools-border, #8884);
  border-radius: 6px;
  background: var(--docs-tools-bg, #fff);
  box-shadow: 0 4px 16px #0002;
}
button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-height: 36px;
  padding: 6px 10px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: start;
  white-space: nowrap;
  cursor: pointer;
}
button[aria-pressed='true'] {
  color: var(--docs-tools-brand, inherit);
  font-weight: 500;
}
summary:focus-visible,
button:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: -2px;
}
</style>
