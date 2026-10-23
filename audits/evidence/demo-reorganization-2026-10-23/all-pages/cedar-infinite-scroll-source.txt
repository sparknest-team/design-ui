<template>
  <div ref="scroller" class="infinite-scroll-demo">
    <c-infinite-scroll
      v-model:status="status"
      :target="scroller"
      :bottom-offset="32"
      @load="fetchData"
    >
      <c-list :data="data" :scrollbar="false">
        <template #header>Infinite list</template>
        <template #item="{ item }">
          <c-list-item>{{ item }}</c-list-item>
        </template>
      </c-list>
    </c-infinite-scroll>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onDeactivated, ref } from "vue";
import type { InfiniteScrollStatus } from "@cedarjs/ui";

const scroller = ref<HTMLElement>();
const page = ref(0);
const data = ref<string[]>([]);
const status = ref<InfiniteScrollStatus>("idle");
let timer: ReturnType<typeof window.setTimeout> | undefined;

const fetchData = () => {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    timer = undefined;
    const start = data.value.length;
    data.value.push(
      ...Array.from(
        { length: 8 },
        (_, index) => `Cedar list item ${start + index + 1}`,
      ),
    );
    page.value += 1;
    status.value = page.value >= 5 ? "finished" : "idle";
  }, 600);
};
onBeforeUnmount(() => window.clearTimeout(timer));
onDeactivated(() => {
  window.clearTimeout(timer);
  timer = undefined;
  if (status.value === "loading") {
    status.value = "idle";
  }
});
</script>

<style scoped>
.infinite-scroll-demo {
  max-height: 320px;
  overflow-y: auto;
}
</style>
