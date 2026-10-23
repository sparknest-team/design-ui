<template>
  <c-progress :percent="20" :style="{ width: '50%' }" />
  <br />
  <br />
  <c-progress :percent="30" :style="{ width: '50%' }">
    <template v-slot:text="scope">进度 {{ scope.percent }}%</template>
  </c-progress>
</template>
