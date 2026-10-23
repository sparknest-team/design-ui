<script setup>
import { markRaw } from "vue";
import DemoApiReviewSuite from "../../../docs/.vuepress/components/ApiReviewSuite.vue";
import Case0 from "./api-review-main.vue";
import Case1 from "./api-review-c-nav-menu-1.vue";
import Case2 from "./api-review-c-nav-menu-2.vue";
const cases = [
  { name: "main", label: "c-nav-menu · 组合属性", component: markRaw(Case0) },
  {
    name: "c-nav-menu-1",
    label: "c-nav-menu · controlled",
    component: markRaw(Case1),
  },
  {
    name: "c-nav-menu-2",
    label: "c-nav-menu · field-names",
    component: markRaw(Case2),
  },
];
</script>
<template><DemoApiReviewSuite :cases="cases" /></template>
