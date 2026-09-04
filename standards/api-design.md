# API 设计

## status 与 variant

`status` 表示语义意图或业务状态，例如 `success`、`warning`、`danger`；`variant` 表示同一组件的视觉方案，例如 `filled`、`outlined`、`text`。两者正交，但不要求所有组件都提供。

| 组件类型                    | status                                    | variant                      |
| --------------------------- | ----------------------------------------- | ---------------------------- |
| Button、Tag、Alert、Badge   | 通常需要                                  | 通常需要                     |
| Input、Select、DatePicker   | 校验状态由 Form 管理；不要随意暴露 status | 有明确外观方案时提供         |
| Progress、Result、Steps     | 表达结果/阶段时提供                       | 有不同呈现方案时提供         |
| Layout、Space、Grid、Portal | 不提供                                    | 不提供                       |
| Dialog、Drawer、Tooltip     | 通常不提供                                | 仅设计系统确有外观方案时提供 |

新增 `status`/`variant` 前必须有设计稿、Token、文档和测试。禁止为了“API 看起来统一”加入没有视觉或行为效果的属性。

共享语义状态统一为：`default | primary | secondary | info | success | warning | danger | tertiary`。组件只能选择适用子集，不得用 `error` 与 `danger` 表达同一语义。

## placement 与 position

二者不是全局同义词：

- `placement`：浮层相对锚点/触发器的首选方位，适用于 Tooltip、Popover、Menu、Picker popup；它通常参与碰撞检测，最终渲染方位可能发生 flip/shift，值通常是 `top-start`、`bottom`、`left`。
- `position`：元素在自身布局上下文、屏幕区域或坐标系中的固定位置，适用于 Badge 角落、Notification/Message 屏幕区域、Timeline 图标位置和拖拽坐标；它不暗示浮层碰撞算法。
- Drawer 虽然没有外部锚点，但描述从容器哪一侧进入，沿用生态通行的 `placement`。
- Badge 保留 `position`。其徽标是宿主盒子内部的绝对定位元素，不是锚点浮层。Cedar 与 Maple 的公共集合为四角；Cedar 现有 `left/right` 属于桌面扩展，不能让两端同名类型产生静默歧义。
- 内部布局算法可使用 `position` 局部变量，不属于公开 API。

同一组件不得以两个属性表达同一方位。破坏性重命名按版本规范提供弃用周期。

对标说明：Element Plus、Arco Design Vue、Naive UI 的 Badge 固定默认角落，只提供 `offset`；Vuetify Badge 使用 `location`。生态并不存在 Badge 必须使用 `placement` 的共识，因此本规范按是否存在“锚点浮层定位算法”区分，而不是按英文近义词机械统一。
