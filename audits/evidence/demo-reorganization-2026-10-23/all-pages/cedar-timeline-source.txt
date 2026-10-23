<template>
  <div :style="{ marginBottom: '40px' }">
    <c-typography-text :style="{ verticalAlign: 'middle', marginRight: '8px' }"> Reverse </c-typography-text>
    <c-radio-group @change="onChange" :style="{ marginBottom: '30px' }" v-model="isReverse">
      <c-radio :value="false">No Reverse</c-radio>
      <c-radio :value="true">Reverse</c-radio>
    </c-radio-group>
  </div>
  <c-timeline :reverse="isReverse">
    <c-timeline-item label="2017-03-10">The first milestone</c-timeline-item>
    <c-timeline-item label="2018-05-12">The second milestone</c-timeline-item>
    <c-timeline-item label="2020-09-30">The third milestone</c-timeline-item>
  </c-timeline>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const isReverse = ref(false)

const onChange = (bool) => {
  isReverse.value = bool
}
</script>
