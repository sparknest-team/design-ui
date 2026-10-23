<template>
  <div class="divider-bg-demo">
    <p>默认分割线</p>
    <c-divider />
    <p>dashed类型分割线</p>
    <c-divider type="dashed" />
    <p>dotted类型分割线</p>
    <c-divider type="dotted" />
    <p>double类型分割线</p>
    <c-divider type="double" />
    <p>size为3的分割线</p>
    <c-divider :thickness="3" />
    <p>分割线底部内容</p>
  </div>
</template>

<style scoped>
.divider-bg-demo {
  box-sizing: border-box;
  width: 560px;
  padding: 24px;
  border: 30px solid rgb(var(--gray-2));
}
</style>
