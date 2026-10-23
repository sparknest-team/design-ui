# 第三十批：高级表单与暗色 Demo 可读性

北京时间 2026-10-14 10:44 开始，承接第二十九批。保持两库独立源码，不改公共 API 或共享内核，不触碰其他聊天的 Token 文件。

## 发现与修复

- Maple InfiniteScroll 的三个 Demo 硬编码浅色背景，暗色主题下文字不可读；背景改用现有主题角色 `--mp-color-bg-1`。不改组件 token 或主题体系。
- Maple Form 中英文事件 Demo 仍使用已移除的 `native-type`，导致提交/重置按钮实际为普通 button。改为现有 `html-type`，新增提交结果和模型明细；源码全局检索未发现其他 Vue 文件残留该旧属性。
- Cedar 异步校验 Demo 的裸 Checkbox 未被正确解析，且无明确提交/重置入口。改用带前缀组件、本地 600ms 异步校验、原生提交/重置、服务端错误模拟及模型结果。卸载/停用/重置清理计时器并忽略取消前的提交结果，不访问外部服务。

## 实际浏览器（修复前基线）

- Maple 英文 Form controller：空值 Validate 显示 Username is required；Clear validation 清除；输入 demo-user 后只读/禁用原生属性分别生效；解除状态并 Reset fields 后值为空。
- Maple 英文 Form events 点击 Submit 及 Enter 都没有提交反馈，据此定位旧按钮属性；这些动作没有成功，不能计为验收通过。
- Cedar 动态表单：Add Post 新增 Post-1，分别填入设备-A/设备-B，删除 Post-0 后剩余字段正确为设备-B。

## 自动检查

- Cedar Form 6 个文件/29 项通过（包括新增异步 Demo 3 项），最终退出码 0；旧 Vitest 工具链出现 close timeout 警告。新增测试首次错选加载图标的 role=status，收窄为结果段落后重跑通过。
- Maple 表单事件 Demo 中英文 2 项及 InfiniteScroll 18 项通过。自动测试的合成 submit/reset 不冒充真实按钮默认行为；仍需修复后浏览器验收。
- Maple Form 全部 7 个文件/43 项通过；本轮全量 Maple lint、Cedar 受影响文件 lint 通过，修改范围 diff --check 通过。
- Maple 完整文档构建通过（1006 Demo SFC、0 失败、46.98s），Cedar 第一次完整构建通过（274 页、250.41s）；补标签关联后的最终完整构建通过（274 页、217.26s）。
- 菜单/调研元数据检查通过，72 组分类一致，未改变同源分类。

## 修复后实际浏览器

- Maple 英文中间卡片：空值点击 Submit 得到 Invalid 和两条错误；填入合成数据后 Enter 提交得到 Valid、模型值正确；点击 Reset 得到 Reset，字段为空、错误清除。
- 右侧移动预览独立实例同样实际完成空值失败、填写成功、Reset 恢复空值。证据：`/private/tmp/maple-form-reset-batch30.jpg`。
- Maple 暗色 InfiniteScroll 中间与右侧基础示例文字可读，浏览器计算值背景 rgb(23,23,26)、文字 rgba(255,255,255,0.9)。截图复核通过：`/private/tmp/maple-infinite-scroll-dark-batch30.jpg`。尚未单独验收亮色/品牌主题或所有滚动组合。
- Maple 中文中间卡片同样实际完成空值未通过、合成值通过、重置恢复空值。浮动占位文案并非原生 placeholder，定位失败后观察原生输入再操作，不计组件故障。
- Cedar 异步 Demo：guest 提交得到未通过和错误；admin + 已阅读得到通过、模型正确、活动校验归零；模拟服务端错误显示两字段错误。校验中重置，观察到活动校验 1→0，超过延迟后仍保持已重置，字段恢复初始值。证据：`/private/tmp/cedar-form-cancel-batch30.jpg`。
- Cedar 嵌套字段：together 的 firstname 清空产生外层聚合错误，修正后消失；separate 的 firstname 清空产生独立错误。模型路径分别正确回写，其他路径不变。
- Cedar 标签的 for 原先为空，本例通过现有 label-attrs.for + Input.id 补齐，并使用 useId 防止多实例冲突；新增关联断言后异步 Demo 3 项和 lint 重跑通过。最终浏览器点击用户名/岗位标签，各自聚焦对应输入，两个 textbox 均可通过标签名称定位；最终产物再次校验中重置，活动校验 2→0、模型恢复初始值。
- Maple 中文右侧实例也已实际完成空值失败、填写成功、原生重置，模型和结果与中间卡片协议一致，实例数据独立。

未覆盖：异步规则所有并发排列、KeepAlive 真浏览器、嵌套字段全部校验类型与品牌/亮色主题。组件内核未修改，未宣称全场景通过；本轮未做整库类型检查或 npm 包构建。

后续优先：Scheduler 受控拒绝/取消/跨资源移动，Form 自定义控件及其他提交组合、Carousel 拖拽与自动播放。基础/自定义状态 InfiniteScroll 模拟计时器的生命周期尚未像 error 示例完整验收，保留为下一批清理项。

截止仍为北京时间 2026-10-15 00:00；尚未宣称表单全部高级配置通过。
