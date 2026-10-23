# 第五批：DropdownMenu 定位 API 与遗留聚合层

## 范围

第四批完成的是登记组件族的复制范围，不代表全部 API 差异或实际浏览器问题清零。本批以实际残留差集为依据，不给未实现能力重新贴完成标签。

- Cedar 补齐 strategy，直接复用本库 Trigger 的 `absolute | fixed` 类型及默认值。
- 两端根和任意深度子菜单响应式继承 strategy；独立嵌套 DropdownMenu 保持自己的值。
- public Props 不再通过 rootPlatformProps 注入；删除 platform.ts 聚合入口。公共定位选项为两库独立复制的 trigger-options.ts，局部视觉/触控默认值保留 appearance.ts，没有共享运行时。
- 保持原有 popupContainer 挂载、hover/click、动画和视图差异；不把 fixed 描述为必然规避 transform/overflow 的方案。
- 新增 DropdownMenuStrategy / DropdownMenuReference 两端入口导出，补齐 Cedar DropdownMenuSubmenuTrigger 导出。
- 两端中文 Demo + Maple 英文 Demo、右侧集合、公开类型消费者同步。本批不改视觉 token。

## 验证

- DropdownMenu + SplitButton：Cedar 40 / Maple 41 项测试通过。
- 新增三层定位契约两端各 4 项，包含 fixed → absolute 的实际 DOM style 变化；最终 CSS 断言追加后各 4 项复跑通过。
- 两端完整源码 Typecheck 通过；Cedar src ESLint 通过。Maple 全量 lint 首次发现新增类型样例导入位置/格式问题，修正后复跑通过，最终 type-tests/demo 增补也通过 scoped lint。
- 74 对基础逻辑源码门禁通过。修正检查器对无语义差别的类型导入格式导致 esbuild 变量压缩名不同的误报；保留标识符比较，不放宽逻辑内容。
- Maple docs:check：968 个 Demo SFC、0 失败。两端 UI 包 build:lib 与发布类型消费者 typecheck:contracts 通过。公共 Props 导出 26 / 26，无名称差集；根入口 API 导出审计通过。
- 发布类型集成额外修复过时样例：Cedar Form.model 已有空对象默认值，允许省略；Maple Tooltip 的 backgroundColor/xs 已改 color/size，旧名作为反向类型测试拒绝；useVModel 的错误预期定位到实际错误属性行。未改 Form/Tooltip/useVModel 运行时。
- Cedar Vitest 收尾有旧版本 close timed out 提示，报告 40/40 通过且进程退出 0，未隐藏该诊断。
- 三仓 git diff --check 通过。
- 未重跑整站生产文档构建；本批文档通过源文件 Demo 编译检查，上一批整站构建结果不冒充本批结果。
不宣称完成真实浏览器视觉验收。

## 剩余 API 分类（后续逐批）

1. Time / TimeRange 的 inputEditable：已由[第六批](./priority-batch-6-2026-10-12.md)补齐。Maple 默认不唤起键盘，开启后消费同源解析/校验/提交链，独立保留移动端面板入口。
2. Form 的 label/grid 配置：Cedar autoLabelWidth、labelColProps 等当前属于视图布局能力，需按移动布局场景评估补齐，不机械填充 Props。
3. DatePicker / DateRangePicker 同名不同层级：需把公开字段与内部/独立面板的对应关系整理清楚，不能凭同名 Props 数量判断丢失能力。
4. Select/Cascader/日期时间的 picker/popup/presentation：用户要求保留移动端扩展，不为了数量一致给 Cedar 增加无用端侧 Props。
5. Table 继续独立；未配对组件不在 71 族完成统计内。
6. 浏览器反馈：另一验收任务发现 Radio 点击后 aria/外观与原生 checked 可能不一致，已由该任务登记后续处理。本批不并发修改 Radio，也不宣称已修复。

复核发现 DropdownMenu 原来被标为“已同源”，但其列表/滚动/动画/触控视图确有差异，本批纠正为“逻辑已同源”。这是分类准确性修正，不是实现退回。菜单当前为 55 已同源 /15 逻辑已同源 /1 独立，待处理分类仍为 0；后续 API 工作按上面的明确差异清单推进。
