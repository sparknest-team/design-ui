<template>
  <c-tabs default-active-key="2">
    <c-tabs-navs>
      <c-tab-nav key="1" title="Lg Table" />
      <c-tab-nav key="2" title="Md Table" />
      <c-tab-nav key="3" title="Sm Table" />
      <c-tab-nav key="4" title="Xs Table" />
      <c-tab-nav key="5" title="Xs Table" />
      <c-tab-nav key="6" title="Xs Table" />
    </c-tabs-navs>
    <c-tabs-items>
      <c-tab-item key="1">
        <c-table emptyType="default" size="lg" :columns="columns" :data="data" />
      </c-tab-item>
      <c-tab-item key="2">
        <c-table emptyType="network" :columns="columns" :data="data" />
      </c-tab-item>
      <c-tab-item key="3">
        <c-table emptyType="unknown" size="sm" :columns="columns" :data="data" />
      </c-tab-item>
      <c-tab-item key="4">
        <c-table emptyType="success" size="xs" :columns="columns" :data="data" />
      </c-tab-item>
      <c-tab-item key="5">
        <c-table size="xs" :columns="columns" :data="data" />
      </c-tab-item>
      <c-tab-item key="6">
        <c-table size="xs" :columns="columns" :data="data" emptyText="空白列表"></c-table>
      </c-tab-item>
    </c-tabs-items>
  </c-tabs>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
  },
  {
    title: 'Salary',
    dataIndex: 'salary',
  },
  {
    title: 'Address',
    dataIndex: 'address',
  },
  {
    title: 'Email',
    dataIndex: 'email',
  },
]
// const data = reactive([
//   {
//     key: '1',
//     name: 'Jane Doe',
//     salary: 23000,
//     address: '32 Park Road, London',
//     email: 'jane.doe@example.com',
//   },
//   {
//     key: '2',
//     name: 'Alisa Ross',
//     salary: 25000,
//     address: '35 Park Road, London',
//     email: 'alisa.ross@example.com',
//   },
//   {
//     key: '3',
//     name: 'Kevin Sandra',
//     salary: 22000,
//     address: '31 Park Road, London',
//     email: 'kevin.sandra@example.com',
//   },
//   {
//     key: '4',
//     name: 'Ed Hellen',
//     salary: 17000,
//     address: '42 Park Road, London',
//     email: 'ed.hellen@example.com',
//   },
//   {
//     key: '5',
//     name: 'William Smith',
//     salary: 27000,
//     address: '62 Park Road, London',
//     email: 'william.smith@example.com',
//   },
// ])
const data = []
</script>
