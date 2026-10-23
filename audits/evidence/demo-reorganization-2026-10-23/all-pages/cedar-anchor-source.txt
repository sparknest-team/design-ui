<template>
  <c-anchor :show-background="false">
    <c-anchor-link href="#基础用法">基础用法</c-anchor-link>
    <c-anchor-link href="#无轴线模式">无轴线模式</c-anchor-link>
    <c-anchor-link href="#固钉位置">固钉位置
      Affix
      <template #sublist>
        <c-anchor-link href="#boundary"
          >Scroll Boundary
          <template #sublist>
            <c-anchor-link href="#boundary1">Scroll Boundary1</c-anchor-link>
            <c-anchor-link href="#hash1">Hash mode1</c-anchor-link>
          </template>
        </c-anchor-link>
        <c-anchor-link href="#是否改变hash">是否改变hash</c-anchor-link>
      </template>
    </c-anchor-link>
  </c-anchor>
</template>

<script lang="ts" setup></script>
