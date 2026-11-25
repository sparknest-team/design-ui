# 模态组件族同源实施计划

更新日期：2026-09-21。实施规范真源见 Cedar OpenSpec `unify-modal-family`。Overlay 已完成完整同源；Drawer / Popup、Dialog 与 Message 已完成逻辑同源。

## 关键判断

- 基础工具“源码已同源”不等于“组件已接入”：Overlay、Drawer / Popup、Dialog 均已切换到唯一基础链。
- Overlay 已完成完整同源，并验证了 popup-layer、容器滚动锁、真实 Teleport 宿主、背景 pointer 序列、ESC、KeepAlive 与过渡生命周期。
- Drawer 与 Popup 是异名对应组件且职责层次不同。两端现已各自保存相同 `modal-surface.ts`，布局 API 保持端侧表达，分类为“逻辑已同源”。
- Dialog 已直接消费 modal surface；关闭动作、拖拽和命令式宿主由三份同源核心约束，PC/移动 DOM 与样式保留合理差异。
- Message 已完成服务、队列、计时、id 更新和生命周期收口；仅保留 PC 紧凑提示与移动卡片的合理外观差异。

## 执行顺序

1. 先验证并冻结 popup-container、popup-layer、scroll-lock、modal-focus、popup-transition，随后把本组件族消费者全部切到唯一基础链。
2. 完整同源 Overlay，跑通受控/非受控、Teleport、最上层 ESC、锁滚动、过渡取消和 KeepAlive。（已完成）
3. 抽出两端各自保存的 modal surface controller；分别接入 Cedar Drawer 与 Maple Popup，直接迁移最终 API，不保留 `position` 等旧名 alias。（已完成）
4. 让 Dialog 消费 controller，统一异步 `beforeClose`、事件时序、焦点和命令式宿主管理。（已完成）
5. 最后统一 Message 的函数入口、队列、计时、id 更新、回调和销毁；视图只在自然一致时复制。（已完成）
6. 每一层完成后立即更新 Demo、文档、类型、resolver、token、门禁和调研状态，不积压到整批结束。

## Message 定稿（已完成）

### 最终公开 API

- 两端同时支持 `Message(options | string)`、`Message.info/success/warning/error/loading(...)`、`Message.clear(position?)`、`setDefaultOptions` 和 `resetDefaultOptions`。
- 删除 `Message.normal`。普通提示直接调用 `Message(...)`；`error` 是便捷方法名，写入组件的标准语义状态仍是 `status="danger"`。
- `status` 统一为 `default | info | success | warning | danger | loading`；`position` 统一为 `top | center | bottom`。
- `id` 统一支持 `string | number`。相同 `id` 只更新原实例，不新增 DOM；返回句柄只公开幂等 `close()`。
- 组件与函数调用共同支持 `content`、`icon`、`action`、`duration`、`showIcon`、`closable`、`pauseOnHover`、`resetOnUpdate`、`closeButtonAriaLabel`、`popupContainer` 和受控 `open`。
- 事件统一为 `update:open`、`open`、`opened`、`close`、`closed`，每轮打开最多各触发一次。

### 删除与收口

- 删除 Maple 的公开内部字段 `_update`，改由服务内部 revision 驱动更新。
- 删除 `lockScroll` 和 `forbidClick`：Message 不是模态组件，不应锁页面滚动或用全屏层阻断背景点击。
- 删除 `contentClass`、`vertical`、`elevation`、`loadingType/loadingSize/loadingRadius/loadingColor` 等端侧外观 Props；自定义内容、操作区和加载图标分别通过 `content`、`action`、`icon` 完成，外观由端侧 token 与 class 覆盖。
- `resetOnHover` 更名为语义准确的 `pauseOnHover`，发布前不保留旧名兼容层。

### 同源边界与实现顺序

1. 先以 Maple 的可调用入口和默认配置能力为基础，吸收 Cedar 的分位置队列、关闭按钮无障碍和悬停计时能力，定稿同一份 service/controller。
2. 把队列按 `Document + popupContainer + position` 隔离；补齐 SSR 空句柄、app context、相同 id 更新、幂等关闭和最后一项离场后销毁。
3. 抽出同源计时逻辑：悬停保存剩余时间，离开后续计；仅当 `resetOnUpdate` 为 true 时重置完整时长；`duration=0` 永不自动关闭。
4. 两端复制相同 controller、timer 和公开类型，只替换 `c/mp` 前缀与本地图标；Cedar 保留紧凑 PC 外观，Maple 保留移动端卡片外观。
5. 最后同步 Demo、双语文档、类型导出、函数式 resolver 样式注入、token 和同源门禁，再把菜单及总审计状态改为“逻辑已同源”。

## 源码策略

- 不共享运行时核心；同源文件由一端定稿后复制到另一端，只改前缀、本地 import 和端侧 token。
- 不新增 `platform.ts`。合理差异写回组件自己的 view、props 或 style；差异过大时只同源 controller 和契约。
- 不用空 Props、无意义分支或配置表伪造逐字一致。
- 发布前不保留 deprecated alias、双事件、双属性或兼容转换。

## 预期结果

| 对应组            | 目标分类   | 原因                                                              |
| ----------------- | ---------- | ----------------------------------------------------------------- |
| Overlay / Overlay | 已同源     | 2026-09-21 完成主体、Props、结构样式、基础层消费和同源门禁        |
| Drawer / Popup    | 逻辑已同源 | 相同控制器纳入门禁，呈现职责不同                                  |
| Dialog / Dialog   | 逻辑已同源 | 控制器、关闭/拖拽状态机和命令式服务同源；端侧 DOM、图标与样式不同 |
| Message / Message | 逻辑已同源 | 服务、队列、计时、API 与生命周期一致；PC/移动外观由各自样式维护   |

## 主要验收风险

- 同一 Escape 或 pointer 事件关闭多个嵌套实例；
- 离场未结束就释放锁或焦点，取消离场后状态错乱；
- 受控组件内部隐藏但父级 `open` 仍为 true；
- selector 容器、跨 Document 和动态换容器时残留层级/锁；
- `beforeClose` 多次 done、抛错或重复点击造成 Promise 多次完成；
- Message 相同 id 更新生成重复 DOM、重置错误计时或多次调用回调；
- Teleport 测试只检查 wrapper，漏掉真实宿主与监听器清理。

## 不进入本批范围

- 不把 Trigger 锚点定位重新并入模态系统；两者只复用 popup container/layer 等已存在基础能力。
- 不强制 Drawer 支持 center，也不把 Popup 填充成带标题、页脚和确认按钮的 Drawer。
- 不让 Message 默认捕获焦点或锁滚动。
- 不在计划阶段提前修改完成分类；以实现、测试和构建证据为准。
