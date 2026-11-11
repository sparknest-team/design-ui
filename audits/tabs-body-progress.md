# Tabs 六件套同源收尾

日期：2026-10-09。此记录以源码和专项测试为准，不代表浏览器／真机视觉验收。

## 完成范围

- Tabs、TabPane、TabsNavs、TabNav、TabsItems、TabItem 位于各端 src/tabs；全部为独立副本，无共享运行时。
- 删除两端 platform.ts，namespace/types 直接导入本库工具。明确职责的 use-tabs-configuration.ts 仅负责本端配置读取。
- 删除 Maple 无消费方的 tab-item-provide.ts 和面板注册。InfiniteScroll 已直接观察祖先 hidden/style/class。
- 两端一致导出并应用 TabsEmits、六件套 Slots 类型和 TabsNavsExpose。仅 TabsNavs 提供 resize()；没有新增 focus/selection 方法。旧 types.ts 的无调用方类型别名删除。
- 不改变 Props、事件名、默认行为、样式消费者或 Demo；中英文已有文档更新说明。Cedar 未有独立英文组件页，继续现有站点回退行为。

## 有意差异

- Cedar：响应式继承 ConfigProvider.size / rtl；Maple：无相应全局 Provider，默认 md，保留 setPropsDefaults、显式 size 和祖先/自身 DOM dir。未扩建全局 Context。
- 各端独立安装工具及前缀。
- 40 个组件 token 后缀一致，全部经 Less 编译验证真实 var() 消费。没有新 token 或改名；五档尺寸均实现。
- 仅四项既有组件默认值有差异：header-padding（system space-5 / space-4）、content-padding（space-6 / space-5）、capsule-radius（system pill / 12px）、active-shadow（0 1px 3px rgb(0 0 0 / 12%) / none）。其余默认值规范化前缀后相同；system 控件尺寸的两端密度差异继续由既有 system 契约管理。

## 验证

- node design-ui/bin/tabs-core-check.mjs：13 对源码/测试/样式一致，40 个 token 消费者通过，六组件类型出口通过。
- 两端旧 node checks/tabs-same-source.mjs 已改为开发期薄入口并分别运行通过。新门禁保留原有六组件导出集合、主体/测试/结构样式、token 后缀检查，额外验证 token 默认值边界及编译后消费，不删减旧检查能力。
- Cedar：pnpm exec vitest run src/tabs src/infinite-scroll，6 files / 57 tests 通过。退出码 0；测试结束后工具输出 fsevents teardown assertion 与 close timeout，未将其隐瞒为完全无诊断退出。
- Maple：pnpm exec vitest run --config ../cli/lib/node/config/vitest.config.js src/tabs src/infinite-scroll，6 files / 56 tests 通过。
- 两端 pnpm exec eslint src/tabs --ext .vue,.js,.ts --fix 通过。
- 新增受控拒绝与当前 key 删除、多个 SSR 实例稳定唯一 ID、ResizeObserver/window resize 清理、响应式全局配置和 Maple defaults setter 验证；既有测试覆盖键盘、touch、禁用、懒挂载、删除、溢出滚动和隐藏面板 InfiniteScroll。
- 全库类型、构建和根入口聚合由主代理集成验证，本子任务未运行。

## 分类边界

Tabs 为 public，另外五个为 subcomponent；不新增 Tab / Swipe / Uploader 历史别名。主体/Props/事件/插槽/导航方法/结构样式可登记已同源，配置读取与四个默认外观值为已说明端侧差异。
