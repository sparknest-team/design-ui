<template>
  <c-layout style="height: 300px">
    <c-layout-header class="layout-header">Header</c-layout-header>
    <c-layout-content class="layout-content">Content</c-layout-content>
    <c-layout-footer class="layout-footer">Footer</c-layout-footer>
  </c-layout>
  <br />
  <c-layout style="height: 300px">
    <c-layout-header class="layout-header">Header</c-layout-header>
    <c-layout>
      <c-layout-sider class="layout-sider">Sider</c-layout-sider>
      <c-layout-content class="layout-content">Content</c-layout-content>
    </c-layout>
    <c-layout-footer class="layout-footer">Footer</c-layout-footer>
  </c-layout>
  <br />
  <c-layout style="height: 300px">
    <c-layout-header class="layout-header">Header</c-layout-header>
    <c-layout>
      <c-layout-content class="layout-content">Content</c-layout-content>
      <c-layout-sider class="layout-sider">Sider</c-layout-sider>
    </c-layout>
    <c-layout-footer class="layout-footer">Footer</c-layout-footer>
  </c-layout>
  <br />
  <c-layout style="height: 300px">
    <c-layout-header class="layout-header">Header</c-layout-header>
    <c-layout>
      <c-layout-sider class="layout-sider" style="width: 64px">Sider</c-layout-sider>
      <c-layout-sider class="layout-sider" style="width: 206px; margin-left: 1px">Sider </c-layout-sider>
      <c-layout-content class="layout-content">Content</c-layout-content>
    </c-layout>
    <c-layout-footer class="layout-footer">Footer</c-layout-footer>
  </c-layout>
</template>

<style scoped lang="less">
.layout-header {
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--c-color-primary-light-3);
  color: var(--c-color-text-1);
}

.layout-content {
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--c-color-primary-light-4);
  color: var(--c-color-text-1);
}

.layout-sider {
  min-height: 100px;
  background-color: var(--c-color-primary);

  :deep(.c-layout-sider-children) {
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--c-color-text-1);
  }
}

.layout-footer {
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--c-color-primary);
  color: var(--c-color-text-1);
}
</style>
