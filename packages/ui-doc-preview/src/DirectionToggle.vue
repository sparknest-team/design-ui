<script setup lang="ts">
import { useDocsDirection } from './docs-direction'
const { direction, toggle } = useDocsDirection()
</script>

<template>
  <button
    type="button"
    class="docs-direction-toggle"
    :aria-pressed="direction === 'rtl'"
    :aria-label="direction === 'ltr' ? '切换到 RTL / Switch to right-to-left' : '切换到 LTR / Switch to left-to-right'"
    :title="direction === 'ltr' ? '切换到 RTL / Switch to right-to-left' : '切换到 LTR / Switch to left-to-right'"
    @click="toggle"
  >
    <span dir="ltr">{{ direction.toUpperCase() }} {{ direction === 'ltr' ? '→' : '←' }}</span>
  </button>
</template>

<style scoped>
.docs-direction-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  min-height: 40px;
  padding: 0 8px;
  margin-inline: 4px;
  color: inherit;
  background: transparent;
  border: 1px solid currentColor;
  border-radius: 6px;
  font: inherit;
  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;
}
.docs-direction-toggle:hover { opacity: .8; }
.docs-direction-toggle:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
</style>
