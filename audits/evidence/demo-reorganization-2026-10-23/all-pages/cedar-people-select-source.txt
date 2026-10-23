<script setup lang="ts">
import { ref } from "vue";

const value = ref("demo.chen");
const latest = ref("等待操作");
const people = [
  { user_id: "demo.lin", display_name: "林晓", name: "林晓" },
  { user_id: "demo.zhou", display_name: "周宁", name: "周宁" },
  { user_id: "demo.chen", display_name: "陈悦", name: "陈悦" },
];
const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 250));

// Local asynchronous adapter: no credentials or external personnel requests.
const fetch = {
  async get(_url: string, options: { params: { worker_user_id?: string } }) {
    await wait();
    return {
      resultCode: "success",
      data: {
        list: people
          .filter((person) => person.user_id === options.params.worker_user_id)
          .map((person) => ({ ...person })),
      },
    };
  },
  async post(_url: string, options: { params: { name?: string } }) {
    await wait();
    const query = options.params.name?.toLowerCase();
    const matches = query
      ? people.filter((person) =>
          `${person.display_name} ${person.user_id}`
            .toLowerCase()
            .includes(query),
        )
      : people.slice(0, 2);
    return {
      resultCode: "success",
      data: { result_list: matches.map((person) => ({ ...person })) },
    };
  },
};
</script>

<template>
  <c-space direction="column" fill>
    <p>
      初始 ID 不在首批列表中，通过异步详情接口反显。搜索姓名或
      ID；下方阅读模式与选择值同步。
    </p>
    <c-people-select
      v-model="value"
      style="width: 320px; max-width: 100%"
      placeholder="搜索姓名或 ID"
      clearable
      :fetch="fetch"
      @change="latest = `change: ${$event || '已清空'}`"
      @clear="latest = 'clear'"
    />
    <c-people-select :model-value="value" :fetch="fetch" is-label />
    <p>当前 ID：{{ value || "未选择" }}；最近通知：{{ latest }}</p>
    <c-button @click="value = 'demo.chen'">恢复异步反显 ID</c-button>
  </c-space>
</template>
