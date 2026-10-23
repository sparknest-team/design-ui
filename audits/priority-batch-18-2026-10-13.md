# 第十八批：移动日期字段真实手输接线

## 完成

- 调用链与真实原生输入测试复现 Maple Date/DateRange 未连接 commit 的 4 个失败；不是仅修改所有者测试来宣称界面可用。
- 公共 DateField.controlProps 统一 editable 条件：inputEditable 不为 false、format 非函数且非 multiple。先 Cedar 后独立复制至 Maple，两端所有者不夹带平台配置。
- Maple 本地 presentation 接通 PickerField.commit；输入点击只编辑，日历按钮/外壳/ArrowDown 处理草稿后打开 Popup。Enter/空格保留输入键盘语义；禁用/只读禁止打开。
- 单值/范围原生手输的 9 项同一测试独立复制到两端；增加 Maple 5 项输入/Popup 触发测试。IME、受控拒绝恢复、重复 Enter/blur、禁用日期/边界、反序范围与端点锁定均覆盖。函数格式和 multiple 拼接文本保持 readonly，不推测模型。
- 新增两端手输与面板选择 Demo；Maple 单值/范围各自示例文件及中英文右侧集合。纠正旧文档中所有移动字段不会唤起软键盘的绝对说明，补 input-editable 表格与真实展示边界。
- Maple 日历按钮新增四个本地 input-trigger Token，登记 theme-contract.platformComponentTokenValues.maple.date 与 platforms/maple，更新两份自动 Token 目录；Cedar 无对应按钮，不增加空 Token。
- 41 对源码/测试复制门禁，调研与菜单同步，Cedar OpenSpec、Cedar patch / Maple major changeset 更新。Maple 默认开启是接通原已声明 inputEditable=true；仅面板选择可显式设置 false，无旧 API 兼容层。

## 验证

- Cedar 日期逻辑/DOM 24 文件 110 项通过；独立 SSR 4 项通过，共 114 项，进程正常退出。
- Maple 日期族 27 文件 151 项通过，含 SSR；无跳过，无更新快照。
- 两端源码 typecheck、Cedar 受影响 ESLint、Maple 全库 lint:check 通过；最终范围 Demo 拆分后的 Maple 类型/lint 复验也通过。
- 两端 build:lib 与发布消费者 typecheck:contracts 通过。
- Maple Demo 检查首次拒绝跨组件示例导入，按现有规则拆成范围自己的文件，不放宽检查；复验 1000 份 Demo SFC 通过，Cedar 新 Demo 编译通过。
- 41 对复制门禁、71 族调研/菜单、公开导出审计、API 清单与 Token 目录检查通过。
- Theme contract 通过，新增平台默认值已受治理；platform-values 两项测试通过。发布样式图 Cedar 96 入口/98 Less、Maple 91/93 无环/缺失/重复基础样式，源码与发布消费者 foundation/Loading 各单次加载。
- 本批路径 git diff --check 通过；未做整站生产文档构建、真实浏览器软键盘/触控/视觉验收。

## 下一批

字段层审计：Maple DateFieldContent 已声明 update:pickerValue / picker-value-change / select-shortcut，却没有从 DatePanel 转发；Cedar 已转发。下一批补齐事件真实链路及两端单值/范围验证，检查快捷项/嵌套受控视口，不能只凭 emits 类型存在判定可用。

截止北京时间 2026-10-13 14:00；双库独立维护，不共享运行时、实例或 platform，不提交、推送、发布。
