<script setup lang="ts">
import { ref } from 'vue'

const active = ref(true)
</script>

<template>
  <div>
    <c-button variant="outline" @click="active = !active">切换局部变量 / Toggle local variables</c-button>
    <c-style-provider tag="section" :style-vars="active ? { '--c-demo-color': 'teal' } : null">
      <p style="color: var(--c-demo-color, currentColor)">局部颜色 / Local color</p>
      <c-style-provider :style-vars="{ '--c-demo-color': 'coral' }">
        <p style="color: var(--c-demo-color)">嵌套覆盖 / Nested override</p>
      </c-style-provider>
    </c-style-provider>
    <p>外部不受影响 / Outside remains unchanged</p>
  </div>
</template>
