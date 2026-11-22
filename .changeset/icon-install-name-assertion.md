---
'@sparknest/ui-icons-vue': patch
---

生成的图标 `index.ts` 改用非空断言注册组件名：`app.component(_Icon.name!, _Icon)`。

- 模板里 `defineOptions({ name })` 已经保证运行时有名字，但 `DefineComponent.name` 的类型是
  `string | undefined`。TypeScript 5.9 收紧了这个推理，下游（maple）用 TS 5.9 重新生成 377 个图标后，
  `packages/icons` 的 `vue-tsc` 编译直接报 377 处 `TS2345: Argument of type 'string | undefined' is not
  assignable to parameter of type 'string'`，`build:lib` 整体失败
- cedar 的独立生成器早就是这个写法（`_${exportName}.name!`），本次把 design-ui 的共享模板与它对齐
- 只是类型断言，运行时行为不变，产物 JS 不变
