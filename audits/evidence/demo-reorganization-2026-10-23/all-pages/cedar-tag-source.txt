<template>
  <c-space fill>
    <c-tag>Default</c-tag>
    <c-tag>Tag 1</c-tag>
    <c-tag>Tag 2</c-tag>
    <c-tag>
      <template #icon>
        <c-icon-check-circle-fill />
      </template>
      Complete
    </c-tag>
  </c-space>
  <br />
  <c-space fill>
    <c-tag>gray</c-tag>
    <c-tag color="brand">brand</c-tag>
    <c-tag color="green">green</c-tag>
    <c-tag color="orange">orange</c-tag>
    <c-tag color="red">red</c-tag>
    <c-tag color="blue">blue</c-tag>
  </c-space>
</template>

<script lang="ts" setup>
</script>
