# Shared 工具公共契约

Cedar 的 `@cedar-design/shared` 与 Maple 的 `@maple-design/shared` 保持独立源码、独立构建和实例，不互相引用。工具运行时、泛型、类型收窄、导出清单和边界行为必须一致，只有诊断消息中的 Cedar / Maple 品牌前缀允许不同。

采用本地细粒度模块：array、dom、function、motion、namespace、number、object、predicates、string；index 只显式导出约定工具和 `MotionState` 类型。禁止重新整包转出 rattail、引入未使用的 mitt，或增加只为旧入口保留的 alias。保留适用的第三方许可说明。

两端公共运行时导出为：assert、call、camelize、clamp、clampArrayRange、cloneDeep、createNamespaceFn、doubleRaf、error、floor、getRect、getScrollLeft、getScrollTop、getStyle、hasOwn、inBrowser、inMobile、inViewport、isArray、isBoolean、isEmpty、isFunction、isNumber、isNumeric、isObject、isPlainObject、isString、isWindow、kebabCase、mergeWith、motion、normalizeToArray、pascalCase、preventDefault、raf、removeItem、slash、supportTouch、throttle、toNumber、uniq。新增导出须同步两端实现、消费者、文档、类型与测试。

不得仅让 index 一致：`bin/shared-source-contract.mjs` 比较全部源码文件清单和保留类型声明的 AST；原有 `bin/copied-foundations-check.mjs` 的运行时比较继续保留。不允许排除新增文件、扩大名称替换或忽略类型来消除差异。检查器正反测试必须验证算法漂移和仅类型漂移都会失败。

每库执行 `pnpm check:shared`：将真实 shared 包构建到临时目录，验证 ESM / CJS 的完整导出、独立声明、泛型与断言收窄，以及数值、字符串、数组、深拷贝、合并、动画、节流、DOM / SSR 导入和按需体积。不覆盖开发服务正在使用的发布产物；小工具导入保持现有 512 gzip 字节上限。两库 CI 都运行此测试。完整横向同源检查在 design-ui 中执行 `pnpm check:foundations`。

UI 的共享几何只传递定位实际需要的 scrollTop / scrollLeft / width / height。共享尺寸观察使用目标 ownerDocument 的原生 ResizeObserver；无原生观察器时监听其窗口 resize 与 visualViewport resize/scroll，仍保留 Vue 更新时的目标重绑、KeepAlive 停用和卸载清理。此降级不模拟任意纯 CSS 内容尺寸变化；需要覆盖旧浏览器原生尺寸观察能力的应用，应在应用入口提供标准 ResizeObserver polyfill，而不是让基础浮层为所有用户打包兼容分支。不能通过放宽体积门禁恢复全量依赖。
