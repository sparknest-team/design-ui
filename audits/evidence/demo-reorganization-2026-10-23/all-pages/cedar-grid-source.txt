<template><div>
  <c-grid :cols="4" :col-gap="12" :row-gap="12"><c-grid-item v-for="i in 8" :key="i" class="cell">{{ i }}</c-grid-item></c-grid>
  <c-grid :cols="4" :col-gap="12" :row-gap="12"><c-grid-item :span="2" class="cell">span 2</c-grid-item><c-grid-item :offset="1" class="cell soft">offset 1</c-grid-item><c-grid-item :span="4" class="cell">span 4</c-grid-item></c-grid>
</div></template>

<style scoped>
.controls { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.cell { box-sizing: border-box; padding: 12px; min-width: 0; border-radius: 4px; background: var(--c-color-primary); color: var(--c-color-white); text-align: center; overflow-wrap: anywhere; }
.soft { opacity: .7; }
</style>
