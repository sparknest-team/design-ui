<template>
  <c-space direction="column" fill size="lg">
    <c-descriptions :data="data" title="User Info" />
    <c-descriptions :column="{ xs: 1, md: 3, lg: 4 }" title="User Info">
      <c-descriptions-item v-for="item of data" :key="item.label" :label="item.label" :span="item.span ?? 1">
        <c-tag>{{ item.value }}</c-tag>
      </c-descriptions-item>
    </c-descriptions>
  </c-space>
</template>

<script lang="ts" setup>
const data = [
  {
    label: 'Name',
    value: 'Socrates',
  },
  {
    label: 'Mobile',
    value: '123-1234-1234',
  },
  {
    label: 'Residence',
    value: 'Beijing',
  },
  {
    label: 'Hometown',
    value: 'Beijing',
  },
  {
    label: 'Address',
    value: 'Yingdu Building, Zhichun Road, Beijing',
  },
]
</script>
