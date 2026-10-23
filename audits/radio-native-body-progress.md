# Radio / RadioGroup 原生主体同源

## 2026-10-09
- Cedar 先补齐 checkedColor / uncheckedColor / iconSize / ripple、图标插槽，再把原生 input 主体、Group、Props、Context 和样式复制至 Maple。
- 两端原生 input 持有 checked/disabled/readonly/error ARIA 和焦点，label 支持点击；受控拒绝恢复原生 checked，click 不重复通知。
- 新增 name、ariaLabel、inputAttrs，Group name 可继承；inputAttrs 不覆盖组件控制的 type/checked/disabled/tabindex。default 槽统一提供 checked/disabled，完整 radio 槽保留。
- 本地 form-adapter 只接既有 Form/ConfigProvider；无共享运行时，无 platform 配置；保留14px/24px等登记密度值。
- Cedar Ripple 同步 Maple 清理过的独立实现，所有使用方 style/index.ts 已显式引入 ripple/style。
- 新增两端6项原生行为/SSR测试和中英文Demo，旧快照按原生结构更新，已有断言仅迁移 DOM 目标。
- Checkbox/Radio 主体门禁13对通过；Radio 单独测试 Cedar8 / Maple25通过。批次集成结果见本批总记录。
- 浏览器连接超时，未完成真实浏览器视觉验收；不把静态样式测试等同视觉验收。

2026-10-09 批次集成结果与最新分类：[依赖分批并行验收记录](./priority-batch-2026-10-09.md)。上文未完成项为该子阶段快照，以批次记录为准。
