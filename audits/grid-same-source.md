# Grid / Row / Col 同源验收

两库独立保存同源实现，不跨库引用运行时代码。Grid 与 GridItem 使用 CSS Grid；Row 和 Col 是独立的 24 栏 Flex 组件。原 Grid.Row、Grid.Col、Grid.Item 及具名导出指向相同实例；新增 row/col 独立源码、样式、安装和按需解析入口。

## 一致性

- 主体、Props、类型、父子上下文、响应式 hook、布局算法、样式及行为测试加入 copied-components-check，共新增 17 对。
- Grid 4、Row 5、Col 4 组 demo 成对维护，使用库内控件；中英文文档片段、API 表和菜单同步。
- 六档断点一致，xs 作为 SSR 初始值，挂载后观察视口。GridItem 的跨度样式服务端即可输出，折叠和 DOM 排序挂载后计算。
- 修复 span=0 隐藏后的恢复、offset/order=0 覆盖、完整 div 模式、动态响应式切换与监听清理、动态增删排序和嵌套 Grid 数据隔离。
- Cedar 历史非 BEM class 迁移到与 Maple 相同的 BEM 后缀；见两库 API-MIGRATION.md 和 major changeset。

## 验证

- 53 项 Grid/Row/Col 测试通过，含两端各 21 项同源契约测试。
- 两端无 DOM 的 SSR 渲染通过；受影响源码类型检查通过。
- Grid/Row/Col 两端独立 ESM/CJS 打包通过；Less 编译和六档断点零值覆盖规则通过。
- 全部 64 对 demo 源码与文档检查、132 项 demo 挂载和交互检查通过。
- 浏览器实际验证两端三个独立菜单和同源标记、折叠展开、动态插入排序、窄屏隐藏/宽屏恢复以及偏移排序复位、Row div 模式。
