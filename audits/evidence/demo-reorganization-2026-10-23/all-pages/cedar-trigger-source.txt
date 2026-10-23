<template>
  <div class="trigger-demo">
    <c-trigger trigger="click" :popup-offset="10" show-arrow>
      <c-button>点击打开</c-button>
      <template #content>
        <div class="trigger-demo__panel">Trigger 只负责浮层行为，面板外观由使用者决定。</div>
      </template>
    </c-trigger>
  </div>
</template>

<style scoped>
.trigger-demo {
  display: flex;
  justify-content: center;
  padding: calc(var(--c-sys-space-8) * 2) var(--c-sys-space-6);
}

.trigger-demo__panel {
  max-width: 260px;
  padding: var(--c-sys-space-5) var(--c-sys-space-6);
  color: var(--c-sys-color-content-primary);
  background: var(--c-sys-color-surface-overlay);
  border: 1px solid var(--c-sys-color-border-default);
  border-radius: var(--c-sys-radius-md);
}
</style>
