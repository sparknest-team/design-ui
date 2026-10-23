# 第二十五批：六组复制门禁漂移全部收口

用户在 14:00 临时自动续跑停止后明确要求继续，本批为新授权的手动工作；不恢复临时自动化、不提交/推送/发布。

## 完成范围与依赖顺序

1. Select / Cascader / SelectionField：公共主体、控制器与语义样式按 Cedar 整理后独立复制；移动 list/picker 扩展保留。修复 Maple 旧 Checkbox/Radio BEM 引用，改为当前同源原生控件的 --状态 / __control / __label。选择与路径算法的首项赋值改为同义解构，去掉两端 lint 不一致的局部屏蔽。
2. AutoComplete：统一主体、Props、类型、样式和配对交互测试源码，不修改 shouldOpen/过滤/受控值协议。
3. Ripple / Rate：规范 Rate 主体与 Props；Rate 门禁原起始标记失效可能仅比较末尾空片段，改为实际含 classes 的标记并断言存在。Ripple 两端对称处理 Less import，并新增实际入口编译及 Token 声明/消费断言，不忽略视觉规则。
4. Loading / Result / Message：统一源码格式和计时器写法；Token 门禁读取规范 style/token.less，修复错误旧路径。Message 默认 variant 两端统一 neutral，组件、可调用函数、默认选项重置一致；显式 solid/tonal 不变，不保留旧默认兼容。
5. BackTop / Ellipsis：主体和样式格式收口，滚动/取消/KeepAlive/SSR 与受控展开/Tooltip 协议保留。

两库仍独立维护源码、组件实例与系统接线，没有共享运行时或新的 platform 配置。

## 导入与格式门禁

本地路径从 _utils 改为 utils 后，已有格式化插件会重新排序绑定导入，原逐字检查与两端 lint 要求冲突。两端独立复制 normalize-bound-imports 工具，仅规范绑定导入的路径映射与排序；保留模块、别名、类型导入信息，所有非导入主体、Vue 模板和副作用导入顺序仍严格比较。

新增正反例：合法绑定导入排序等效；更改主体表达式、导入别名、公开值、Vue 模板或副作用导入顺序均不等效。没有通过删除复制检查、忽略主体或关闭 lint 规避漂移。

## 每个组件验证

最终合并回归覆盖 Select、Cascader、AutoComplete、Ripple、Rate、Loading、Result、Message、BackTop、Ellipsis 及选择外壳。

- Cedar：26 文件 181 项逻辑/DOM通过；BackTop 独立进程 SSR 2 项通过，共 183 项。Loading/Result 的 SSR 渲染契约也包含在组件回归中。
- Maple：30 文件 246 项通过，含 BackTop SSR；因 loading 路径匹配另覆盖 LoadingBar 三项。无跳过、无更新快照。
- Message 新增两端独立复制的 4 项计时器用例（剩余时间暂停/恢复、暂停时更新、禁止更新重置、关闭/卸载取消与零时长持久）与 2 项默认变体/函数式/默认重置/id 更新回归。最初 Cedar 旧 Vitest 把返回 vi 对象的 beforeEach 误当清理函数，辅助钩子改为不返回对象后六项通过，未修改组件逻辑来迎合测试。
- Rate 无效 count 用例出现预期 Vue 校验警告，不是测试失败。

## 最终门禁与构建

- 六组门禁在 Cedar / Maple 两个入口全部通过，共十二次检查：selection-presentations、auto-complete、ripple、rate、lightweight-feedback、scroll-text。
- 两端源码 typecheck、build:lib、发布消费者 typecheck:contracts、公开导出审计通过。
- Cedar 受影响组件 ESLint、Maple 受影响路径与 checks ESLint通过；Maple 全库 lint:check 最终也通过。中途另一批进行中的 modal-focus/基础测试改动导致全库 lint 失败，本批没有改动这些文件，未降低规则，收尾时重验已通过。
- 发布样式图 Cedar 96 入口/98 Less、Maple 91/93通过，无环、缺失或重复 foundation；foundation / Loading 在源码与发布消费者中单次加载。
- 1004 份 Maple Demo SFC、Cedar Message 与 Ripple 新/改 Demo SFC 编译通过；三份 Token 目录、本批路径 git diff --check 通过。
- API 清单 129 Cedar / 119 Maple / 97 同名入口；missingExports / missingContracts 均为空。统计仍不代表整库语义或视觉验收。

## 文档与菜单

- 两端 Message 默认值说明、Maple 中英文 Props 表与变体 Demo同步；Demo增加未指定 variant 的默认 neutral 展示。
- Ripple 之前漏出调研清单，补录独立同源指令；新增 Cedar README/基本 Demo，修正 Maple Ripple 文档无前缀 Token 名，并说明样式与本地默认值边界。
- 调研新增 Ripple 后共72族：56已同源、15逻辑已同源、1独立。九个原条目验证说明及新Ripple条目更新；两端生成调研文档、Cedar sidebar、Maple菜单状态同步检查通过。
- OpenSpec、两端 changeset 更新；第二十四批历史失败记录增加后续解决链接。

## 未做与边界

未进行生产整站文档构建或真实浏览器视觉、触控、软键盘验收。六组复制门禁漂移已解决，不宣称整库所有场景均已完成验收。临时自动续跑保持暂停，不擅自停止或重启用户开发服务。
