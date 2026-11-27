# TypeScript

- 公共 Props、Emits、Slots、Expose 必须有导出类型。
- Cedar 和 Maple 主组件库使用 `golar tsc --noEmit` 检查 TypeScript 与 Vue 模板。图标包使用 `tsc --runExternalCode` 和 Vue 官方 `@vue/content-mapper` 生成声明并检查组件类型。
- 开启 `strict`、`noImplicitOverride`、`noUncheckedIndexedAccess` 应分阶段推进并用基线记录遗留问题。
- 类型导入使用 `import type`，避免运行时错误依赖。
- Provide/inject 使用 `InjectionKey<T>` 或具有等价类型安全的封装。
- 公共联合类型只在公共 contracts 中定义一次，组件不得复制同名枚举。
