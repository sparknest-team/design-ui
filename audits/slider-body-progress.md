# Slider 主体同源

日期：2026-10-09

## 实现范围

两库独立复制 Slider.vue、SliderInput.vue、props.ts、model.ts 和完整样式，不引用另一库运行时，不新增 platform.ts。安装入口、Form 合并和内部数字输入的 Provider 隔离使用本地文件。

- 保留 Cedar marks、showTicks、showInput/InputNumber、defaultValue、formatTooltip。
- 补齐 Cedar readonly、Maple 颜色/几何能力；补齐 Maple 非受控值、标记、刻度和数字输入。
- showTooltip:boolean|'always' 统一替换 Maple labelVisible；所有源码 Demo / 文档已直接迁移，无兼容别名。
- Pointer Events 统一 mouse/touch/pen；使用 pointerId、capture 和临时 ownerDocument 监听，键盘仅在拇指本地处理。
- pointerup 使用最后坐标；pointercancel / lost capture 结束最近提议；禁用/卸载/KeepAlive 失活清理监听与 capture。
- 方向键、PageUp/PageDown、Home/End；max 不落在 step 网格时仍可到达，反向按键回到最近前一网格点，不跳过 .9。
- 范围固定低/高端不可交叉，倒序初始值排序，动态 ARIA min/max；重合在最大值时也能向下拆开低端。
- 受控显示由父级决定，拒绝提议不改本地显示；非受控通过 defaultValue 初始化。
- Form 继承 disabled/readonly/error；InputNumber 事件隔离后一次输入只触发一次 Form 校验、focus、blur。
- 所有颜色/几何 Prop 有真实消费；非法几何不覆盖主题默认。17 项公开 Token 与 3 项 internal Token；暗色默认继承 system。
- SliderEmits / SliderSlots / SliderExpose 导出并用于 Vue 宏；提供 focus/blur。

## 验证与门禁

最终：Cedar 22 / Maple 22 项测试通过（每端20交互+2Form）；两端定向 ESLint 与 git diff --check 通过。

node bin/slider-core-check.mjs 验证 7 对主体/模型/Props/样式入口文件、交互测试对、3 对独立 Demo 及两端 Less 编译。Form Provider 键/父级类型和安装机制是有意本地接线差异。

测试覆盖 SSR、安装/快照、数值归一化、键盘/范围/重合、受控接受与拒绝、三种 Pointer、cancel/lost capture/up、卸载/失活/禁用清理、零尺寸轨道、marks/ticks/格式化/插槽、InputNumber 和 Form 去重。

本记录不宣称浏览器视觉、屏幕阅读器或真机触控完成。全库类型、主题契约、Demo 编译、库构建和发布样式由主批次集成验证。

## 交互细节

change 与 update:model-value 是不同数值提议；end 携带最后提议，不保证受控父级接受。button 插槽 index=0 表示范围低端，index=1 表示高端或单值；公开 focus(index) 则按显示顺序从 0 开始。父容器须给垂直 Slider 明确高度。
