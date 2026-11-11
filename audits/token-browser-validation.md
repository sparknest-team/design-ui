# 2026-09-30 实际浏览器验收记录

## 环境与范围

使用 Cua 控制本机 Chrome，通过仅监听 127.0.0.1 的临时 Vite 页面直接加载两库实际 Vue/TSX 源码和 style 入口，无组件 mock。browser provider 连接失败后采用原生 Chrome AX/截图接口；未使用外部 Playwright，也未改变系统偏好。

这是一组有界浏览器抽查，不等于全库、所有尺寸、全部键盘流程或跨浏览器验收。截图已在本次验收工具记录中展示；本报告不引用不存在的截图文件。

## 已观察到的结果

| 场景 | 实际观察 |
| --- | --- |
| Message 基础矩阵 | 初始 38 个真实面板：两端各默认 1 个 + 三变体 × 六状态 18 个；均渲染正文、图标和可关闭按钮，无可见裁切 |
| 默认外观 | Cedar success 默认中性白/暗灰面板；Maple success 默认绿色实色面板，默认行为保留 |
| 显式变体 | 两端 neutral/tonal/solid 的强调层级一致；neutral 中性底、tonal 低强调状态底、solid 强状态底；default/loading 的 solid 深色底白前景 |
| 主题切换 | 操作 default/light、default/dark、maple/light、maple/dark；截图可见 loading 品牌图标从青色切换为橙棕色，状态色仍保持其独立语义 |
| CSS 局部覆盖 | 在面板实际 DOM 父节点覆盖 success-bg 为 #f5ccff；两端三变体 success 面板均变为紫色，其余状态和单独默认面板不变；计算值 rgb(245, 204, 255) |
| 关闭事件 | Maple tonal 和 Cedar solid 各实际点击一次关闭；受控 open 更新后消息数 38 → 37 → 36，事件计数 0 → 1 → 2 |
| InputTag 五档尺寸 | 实际 getBoundingClientRect 高度 xs/sm/md/lg/xl = 24/28/32/36/44px |
| InputTag filled | light 未聚焦 rgb(247, 248, 250)；XL 聚焦 rgb(229, 230, 235)，底色保留且是 fill3；dark 未聚焦 rgba(255,255,255,.04) |
| InputTag 编辑 | XL 实际输入 Gamma 并 Enter 创建；Backspace 删除新增标签；共享受控模型在五档样例同步更新 |
| InputTag disabled | 自定义蓝色标签文本与底色保留、没有关闭按钮；shell light rgb(242,243,245)、dark rgba(255,255,255,.08) |
| 双端 Input / FieldDecorator | 实际输入 Cedar test / Maple test；Cedar light focus 为 rgb(229,230,235)，Maple maple/dark focus 为 rgba(255,255,255,.12)，disabled 均保持 fill2。端侧高度分别 32 / 48px，为桌面与浮动标签触控密度差异 |
| 双端 Button / Tag / Alert / Switch | default/light 与 maple/dark 实际截图检查：primary 按钮跟随青/橙品牌；disabled 按钮 AX 不可用；gold Tag 与 warning Alert 前景清晰、布局无裁切；两个 Switch 分别点击后 AX 从 on 变为 off |

## 尚未由本次浏览器抽查覆盖

- hover-only、error × focus 的完整 FieldDecorator 双端矩阵；InputTag 已覆盖鼠标聚焦，但不把它等同于全部 hover 优先级验收。
- prefers-reduced-motion 的浏览器媒体模拟及全组件动画生命周期；对应编译审计由主线提供，不冒充真实媒体模拟。
- 真机触摸、窄屏移动 Safari、屏幕阅读器、多行长文本和完整全库视觉回归。

## 验收过程中的环境影响

并行库构建会重建 use/lib 与 icons/es，临时页面观察到大量热更新和短暂依赖缺失；这些是验收服务器监视构建产物造成的重载，不应记为组件运行时缺陷。完成的静态画面/操作观察均在实际组件页面加载后记录。

已关闭本次创建的 Chrome 标签页，停止临时 Vite 服务，并删除两份自建临时 fixture。未修改或关闭用户原有标签页。
