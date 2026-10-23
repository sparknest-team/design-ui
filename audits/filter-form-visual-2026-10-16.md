# Cedar FilterForm 视觉完善

用户根据截图要求完善Cedar FilterForm外观与背景；本轮替代通用验收批次工作，仅改Cedar FilterForm，不修改Maple或并行Token。

## 变更

- 背景由输入填充色改为主题surface-default；使用轻描边、20px内边距，沿用主题Token适配亮暗，不硬编码白色。
- 操作区预留两列，右对齐并补齐标签高度，防止展开/收起文字被挤断；slot有独立flex容器。Grid行距16px、FormItem底间距0，避免累加空隙。
- 展开/收起由div改为type=button原生按钮，aria-expanded与状态同步，支持键盘及可见焦点。
- 单列/双列默认折叠显示两行，保留一行字段和操作区，避免单列只剩按钮；grid-props仍可覆盖collapsedRows/rowGap等配置。仅复用本仓Grid响应式hook，不新增Observer或公开Props。
- 基础Demo各字段使用outline，按钮去阴影，地区补占位；搜索/重置结果可见而非只打console。模型展示改用语义Token，避免暗色白底白字。中英文说明和样式变量同步。

## 实际验证

- Cedar4185源码站临时243页，原主题为darkTheme。修复前看到展开文字折行、操作按钮顶对齐、填充背景与暗色模型输出不协调。
- 亮色实际背景rgb(255,255,255)，暗色rgb(35,35,36)。两端主题均为同一Cedar实例，没有冒充跨库验证。
- Enter收起、Space展开实际生效；下拉选择“进行中”，关键词“界面验收”后搜索，可见条件含status=doing与keyword；重置清空字段。最后版本再次搜索“筛选验收”并重置，结果“已重置”、关键词为空。
- 390px单列初测发现原先字段全部隐藏，局部修复后保留地区且无横向溢出；Enter展开显示所有字段。1800px宽窗口仍是文档窄容器，操作区初次一列会折行，最终统一预留两列，操作区与输入顶边对齐且无溢出。恢复临时viewport、恢复原暗色主题，关闭临时页。
- 证据：evidence/cedar-filter-form-redesign-light.png（展开及搜索）、evidence/cedar-filter-form-redesign-dark.png（暗色折叠及重置），均已保存查看。

## 检查结果

- FilterForm最终2文件7项通过；Form/Grid依赖回归16文件72项通过，共79项。最初快照因预期结构变化失败，核对后更新；新增样式测试最初使用import.meta.url被旧Vitest转为非file URL，修正测试读取路径后通过，未修改测试环境配置。
- 组件/示例/测试定向ESLint、Cedar类型检查、Less编译均退出0。无公开API新增、无全局Token变更。完整文档生产构建未重跑，既有Token解析阻塞不在本请求范围，浏览器证据来自源码站。
- 未提交、推送或发布，保留其他聊天脏改动。
