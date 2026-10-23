<template>
  <c-space size="lg" fill>
    <c-radio value="radio">Radio</c-radio>
    <c-radio value="disabled radio" default-value="disabled radio" disabled>Disabled Radio </c-radio>
    <c-radio-group v-model="type" variant="button">
      <c-radio value="rounded1">Rounded1</c-radio>
      <c-radio value="rounded">Rounded</c-radio>
      <c-radio value="capsule">Capsule</c-radio>
    </c-radio-group>
  </c-space>
</template>

<script lang="ts">
</script>
