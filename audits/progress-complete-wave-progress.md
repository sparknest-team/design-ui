# Progress / ProgressGroup 同源收口

日期：2026-10-09

## 结论

两个组件主体、公共 Props、CSS 规则和 Token 已独立复制对齐，可在整批集成通过后将组件状态由待适配升级为同源。没有跨库运行时引用，没有 platform 配置层。Progress 仅安装入口和本地 use-progress-size.ts 配置接线不同：Cedar 继承 ConfigProvider，Maple 没有对应全局 Provider 时默认 md。

## Progress

- percent 保持十进制 0–100；小数和数字字符串有效，CSS 百分比不是合法输入，非法值归零，越界裁剪。
- size 支持 xs/sm/md/lg/xl、number、string；数字按 px，字符串可用 CSS 长度。line 表示厚度，circle 表示直径；strokeWidth 覆盖厚度。五档厚度 2/3/4/6/8px，圆形直径 16/48/64/80/96px。
- 两端补齐 steps、animation、bufferColor、track、rotate、textClass、默认/text 插槽及不确定圆形。
- showText 默认 true；确定 default 状态 100 推导 success，显式 status 不被覆盖。不确定状态没有 aria-valuenow，不会自动成功。
- 保留 Cedar 环形 success/danger 默认图标（含 xs），text 插槽可覆盖，ARIA 继续暴露数值。
- 修复动态渐变切换、SSR gradient ID、bufferColor 和扫光实际不生效的问题；内置动效尊重 reduced-motion。
- CSS 公开变量收口为 16 项；没有旧 Token 别名。主题契约与暗色覆盖由整批集成同步。

## ProgressGroup

- 布尔 status → showText；status 插槽 → text，无兼容别名。Demo、API 表和测试同步迁移。
- 线形/环形均按顺序累计裁剪到 max；图例和 tooltip 保留原始占比，不把裁剪后 30% 误报成原始值的占比。
- 非有限/负数 item.value 归零；非法 max 回退 100；circleSize 支持 CSS 长度和安全回退。
- 两种模式可用 Tab 聚焦可见分段，aria-describedby 关联提示；Escape 关闭；鼠标移出不关闭仍被聚焦的提示。
- 源码、样式、尺寸/动效/颜色变量一致，保留独立安装导出机制。

## 验证

- Cedar 68 / Maple 68 个测试通过（Progress 56 + Group 12，每端），包含百分比、尺寸、状态、插槽、SSR、渐变、Observer 生命周期、超额裁剪、方向与键盘提示。
- 两端组件目录定向 ESLint 通过。
- 两端 vue-tsc 通过（最终静态状态 SVG 与文档变更由整批再验）。
- node bin/progress-core-check.mjs：14 对源/测试/样式、5 对 Demo 与两端 Less 编译通过。
- 首次快照变化为刻意统一 DOM、单一 progressbar 根、默认文本和 BEM 类名；旧未消费三份 Cedar 渲染子组件、Maple 旧 progress.less 已移除。

尚未完成浏览器视觉/真机验收，不能将上述测试视作全浏览器像素保证。包构建、按需样式、完整文档编译和菜单元数据由主批次集成统一验证。


2026-10-09 批次集成结果与最新分类：[依赖分批并行验收记录](./priority-batch-2026-10-09.md)。上文未完成项为该子阶段快照，以批次记录为准。
