# 同源组件 Demo 对齐

更新日期：2026-09-08。范围：Card、Badge、Affix、Switch、Button。共 51 个成对场景。

| 组件 | 场景数 | 覆盖内容 |
| --- | --- | --- |
| Button | 12 | 八状态、四变体、五尺寸、禁用链接、三加载布局/五动画、同步/异步/失败恢复、块级、颜色/水波/阴影、图标/圆形、堆叠、按钮组、原生表单/焦点/触摸 |
| Card | 10 | 基础/副标题、header、hover、变体/阴影、图片/三种方向、sm/md、长标题提示、内容插槽、水波/click、全屏/关闭 |
| Badge | 10 | 基础/content 插槽、内联/独立、小圆点、自定义内容、max/零值、状态/颜色、五种尺寸、六种物理位置/两种内联位置/偏移、显隐、实心/描边 |
| Affix | 6 | 基础、顶部偏移、底部偏移、滚动容器、change 状态反馈、disabled/css-mode/updatePosition |
| Switch | 13 | 受控/非受控、四种变体、三种尺寸、禁用、只读、loading、颜色、文字、图标、水波/阴影、自定义值/change、异步允许/false/拒绝、focus/blur/事件顺序 |

Cedar 使用 `src/<component>/__demos__/*.vue`；Maple 使用 `src/<component>/example/demos/*.vue`，由原有 `example/index.vue` 按相同顺序组合。demo 主体只替换 `c-` / `mp-` 前缀；Maple 的主题监听、语言切换及中英文场景标题保留在站点外壳中。示例内部采用两端相同的简短英文样本文案。两端 `cat.jpg` 内容一致。

Cedar README 的场景入口和 Maple 中英文文档的代码片段同步更新。移除了 Badge 中无效的 dotStyle 用法；修复 Switch 的裸 Space / Sapce；Affix 的 change 在页面显示状态。Card 长标题通过插槽内 CSS 和原生 title 实现，不再暗示 Card 提供 ellipsis/tooltip Props。此轮未修改组件源码或 API。

Affix 的 demo 使用独立 200px 滚动容器，确保在桌面文档和移动 iframe 内都能操作。省略 target 时寻找最近滚动父元素，找不到则监听窗口；窗口滚动和不同主题的最终视觉效果不属于本次自动化验收。

## 首轮历史验证

- 38 对源码规范化一致，场景清单/顺序、中英文片段、语言键及 76 份 SFC 编译通过。
- 76 个真实组件挂载检查无 Vue 警告，另有 10 项交互检查通过（两端各 5 项：自定义值、只读、Card loading、Badge 偏移、异步允许/false/拒绝）。交互验证使用临时 Vitest harness。
- 原有组件源码一致性 27 项检查仍通过。
- 本次未进行浏览器像素级视觉对比，不把代码相同等同于主题渲染完全相同。

## 后续维护

场景清单在 [same-source-demos.json](./same-source-demos.json)。修改任一端示例后，将相同主体复制到另一端，仅替换组件前缀，并同步 Maple 文档片段；新增场景同时更新两端页面入口与 Maple 中英文标题。

在 design-ui 中运行 `pnpm check:demos`，或从工作区运行 `node design-ui/bin/same-source-demos-check.mjs`。此只读检查已加入 `pnpm check`，用于防止两端示例再次漂移；它不会生成或覆盖组件源码。

## 2026-09-08 页面回归修复

- Card 图片路径改为 `import.meta.env.BASE_URL + cat.jpg`，避免 Cedar 子路由将相对地址解析到 `/components/card/cat.jpg`。
- Maple 的完整 SFC 展示片段使用 `html` 围栏；该站点的 `vue` 围栏用于组件预览导入，不能放带 `import { ref }` 的完整示例，否则会生成错误的组件注册语法。
- `check:demos` 新增八份中英文文档的真实 Markdown 插件转换及生成 SFC 编译检查，覆盖之前仅测试示例组件而遗漏的页面编译链路。
- 浏览器确认 Cedar Card 与 Maple Card 页面无控制台 error，两端各四张图片均成功加载（原图宽度 1440）；Cedar 加载切换及全屏展开可操作。

## 2026-09-08 移除 Card.loading

Card loading 属性及其成对 demo、语言键、文档片段已删除；当时 Card 10 个、总计 37 个场景。上面的 38 对/86 项结果为移除前历史验证。Loading 组合示例保留在 Loading 文档；Card 的新契约测试验证指令切换时保留原有输入节点。

## 2026-09-08 API 文档与示例再次对齐

新增 Affix 禁用、CSS 模式及手动更新位置示例，以及 Switch 焦点和事件顺序示例，总计 39 对。两端中文 API 区块保持一致，Maple 英文逐项覆盖相同接口：

| 组件 | 属性 | 自定义事件 | 插槽 | 公开方法 |
| --- | --- | --- | --- | --- |
| Card | 19 | 2 | 10 | 0 |
| Badge | 16 | 0 | 2 | 0 |
| Affix | 7 | 1 | 1 | 1 |
| Switch | 17 | 5 | 4 | 0 |

修正 Card 遗漏的图片、全屏、事件和作用域插槽说明，以及阴影类型和默认值；样式变量表同步实际 token。修正 Affix target/target-container 说明与 updatePosition 返回类型。Switch 明确列出 focus、blur 和四个插槽；事件表使用模板 kebab-case。此轮不修改运行时 API。

“同源”表示组件主体契约一致，不表示平台适配完全一致：Cedar Card/Switch 可以继承配置尺寸，Maple 回退 md；Maple Switch 额外继承 Form readonly；Badge 的方向分别读取 Cedar 配置或继承 DOM。主题、命名空间和站点外壳各自保留，跨端说明已放到 API 文档中。

本轮验证：

- 39 对源码、场景顺序、双语片段、语言文件语法、78 份示例 SFC 及 8 份真实站点 Markdown 转换编译通过。
- 78 项真实组件挂载检查及 4 项新增示例交互检查通过（共 82 项）；Affix 验证禁用/CSS 模式和公开更新方法，Switch 验证焦点、点击、值更新、change、失焦顺序及清空记录。
- 27 项规范化源码一致性检查通过，包含四个组件的 Props 和主体。
- `check:demos` 增加中英文 API 名称与实际源码核对，以及两端中文 API 区块一致性检查，防止新增接口后文档漏项。参数类型、默认值及平台行为仍需代码审查，不由名称覆盖检查代替。

## Button 加入同源示例

Button/ButtonGroup 已按 [竞赛结果](./button-race.md) 复制统一，增加 12 对示例。当前检查覆盖五个组件、51 对示例及 10 份双语站点文档。

Button 替换后全量回归：102 次真实示例挂载及四项交互检查全部通过（106 项）；两个组件库 Button 专项 86 项及两个无 DOM SSR 检查通过。
