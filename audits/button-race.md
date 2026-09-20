# Button 实现竞赛与复制结果

日期：2026-09-08。选择增强后的 **Maple** 实现，已复制到 Cedar；ButtonGroup 同步处理。没有跨仓库运行时导入。

## 先补齐功能，再比较

原始 Cedar 有 icon 插槽、autofocus、default/fill/line 加载布局和部分原生禁用语义；Maple 有完整 Loading 动画配置、touchstart、可生效的图标容器/阴影、xl 尺寸及 tertiary 状态。

共同目标契约 25 项：原始 Cedar 12 项通过、Maple 13 项通过。这个数字包含新 API 与新默认值，不能全部当作旧实现缺陷数。补齐后两版均为 **25/25**。

修复的实际问题包括：Cedar 阴影/icon-container 未接入、组内 block 和 disabled 链接门控遗漏、touchstart 未绑定；Maple 加载时的原生禁用/aria-busy 和禁用链接拦截缺失。两端同步回调会闪 loading，多监听器 Promise 提前拒绝会提前解除 pending；现使用 Promise.allSettled 等待全部完成，卸载/KeepAlive 停用使旧结果失效。

## 赛跑结果

| 项目 | Cedar 功能齐全候选 | Maple 功能齐全候选 |
| --- | --- | --- |
| 共同功能测试 | 25/25 | 25/25 |
| 默认 DOM 元素（含根） | 6 | 3 |
| 100 次挂载/卸载中位耗时 | 34.05 ms | 34.24 ms |
| 交互装饰结构 | 四个独立装饰层 | 复用 HoverOverlay |

Node/jsdom，40 次预热，9 轮交替顺序，每轮 100 次；相同尺寸、颜色、四变体、图标和加载混合场景，两边关闭 ripple。耗时差约 0.56%，视为平局，不能据此宣称真机性能更快。选择依据是功能相同而 DOM 更少、可复用现有 HoverOverlay。原始采样、候选 SHA-256 和环境在 [button-race.json](./button-race.json)。赛跑发生于复制替换之前。

## 统一结果

- 23 个普通属性 + click/touchstart 两个可返回 Promise 的监听器；default/icon 两个插槽。无自定义公开方法，原生 focus/blur 等透传。
- ButtonGroup 的九个属性、default 插槽和 buttonGroupProvider 保留并统一；按钮支持逐字段覆盖组配置。
- default/text/outline/tonal、八状态、xs/sm/md/lg/xl、图标/堆叠/圆形/块级、原生 button/a/form、自动聚焦/顺序聚焦、水波、阴影及三种加载布局均覆盖。
- 两端各 12 组 Button demo，中文 API 区块相同，Maple 英文逐项对齐。菜单更新为同源。
- 注册安装入口和全局基础主题留在各自包内；按钮主体、状态逻辑、Props、ButtonGroup 与样式文件通过规范化复制检查。

## 迁移

- Cedar 的 loading-type=default/fill/line 改用 loading-mode=default/fill/line；loading-type 两端统一为 circle/wave/cube/rect/disappear，默认 circle。
- Maple 默认加载布局从覆盖变为行内；需要旧布局时显式设置 loading-mode=fill。
- 两端 ripple、focusable 默认 true；focusable=false 会设置 tabindex=-1，不是禁止程序聚焦。
- Cedar 样式 Token 改为 Maple 基线命名；例如 button-status-primary-bg-color → button-primary-color、button-size-md-height → button-normal-height（其余尺寸 xs/mini、sm/small、lg/large、xl/xl）。无旧名 alias。default 背景与文字引用基础主题变量，tonal 使用浅色容器。

## 验证

- 两端 Button/ButtonGroup 原有测试、共同契约和基础 axe 可访问性检查共 86 项通过。
- 两端 Less 编译、五尺寸/八状态/加载布局及 Button Token 引用检查通过。
- 38 项复制检查与 51 对 demo（含 12 对 Button）、10 份真实 Maple Markdown 转换、五份完整 API 表覆盖检查通过。
- 原始 Maple 测试的事件使用元素所属 DOM 创建，避免 Node CustomEvent 与 jsdom 跨 realm 冲突；同时将未等待的 async forEach 改为逐项 await，防止虚假通过。已更新变化后的结构快照。

- 两端 Button 范围 vue-tsc 检查通过；额外两个无 DOM 的 SSR 渲染测试通过。
- 全部 51 对示例的 102 次真实组件挂载及四项交互检查通过（106 项），没有因 Button 替换破坏其余四个同源组件示例。
- 浏览器确认 Cedar 原生表单提交、Maple 异步拒绝后解除 loading，Cedar 暗色背景、tonal 浅色层及阴影开关实际生效；未出现页面 error。
