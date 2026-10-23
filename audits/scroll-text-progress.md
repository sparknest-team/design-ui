# BackTop / Ellipsis 同源进度

## 2026-09-30 实施结果

- BackTop、Ellipsis 主体、Props、样式和测试独立复制完成；12 对文件由两库 check:scroll-text 验证。没有共享运行时、实例或 platform 配置层。
- BackTop：默认监听页面；targetContainer 支持元素、选择器、响应式 getter。统一 200ms/quartOut，提供 linear/easeInOutCubic/函数曲线；数字字符串阈值按 px。原生按钮、click(MouseEvent)、scrollToTop()、right/bottom/elevation/ariaLabel 对齐；原地与 Teleport、动态容器、重复动画、卸载和 KeepAlive 清理一致。按钮属性显式透传，SSR 不调用目标 getter。
- Ellipsis：expand 为受控值，defaultExpand 是非受控初值；点击、Enter、Space 发出一次 update:expand。Tooltip 配置、禁用、默认内容及 tooltip-content 回退一致，不重复正文。去掉 Cedar 冗余外壳和内部 src 目录，width/class/style 落到实际文本上。提示保留原有不检测溢出的语义；移动触控可显式配置 click。
- CSS 主体与公开 Token 完全复制，仅前缀不同；BackTop 使用 44px 触控目标、中性表面和品牌前景，删除旧色彩/尺寸别名。新增 16 个共享 Token 默认值到主题契约；验证总计 64 system 名称、29 system 标准值、300 组件标准值、37 组件名称集合（包括其他既有批次）。
- 双端 BackTop 四场景、Ellipsis 五场景 Demo 对齐；每个 BackTop 示例通过实例 ref 独立定位，移除重复 ID 与嵌套按钮。Maple 英文文件遵循 demos/en-US/，中间卡片和右侧集合引用同一文件；删除本批已无引用的 example/locale 文件。中英文 API、Token 迁移表、Changesets、OpenSpec、类型清单、菜单和调研均同步。
- 分类：43 已同源、12 逻辑已同源、12 待适配、3 逻辑待同源、1 独立。剩余 15 项；建议下一批 Checkbox / Radio / InputNumber。

## 验证

- 最终组件回归：Cedar 19 项、Maple 26 项通过，包括两端各 2 项 Node SSR、属性透传与 SSR getter 防护。
- 双端最终类型检查与 UI 包 build:lib 通过；Cedar 全量 lint、Maple 全库只读 lint 及最终组件范围 lint 通过。
- 868 个 Demo SFC 校验通过；12 对源码/样式/测试同源检查、主题契约和菜单同步检查通过。
- 全库源码样式检查通过：Cedar 96 入口 / 98 Less 模块，Maple 91 入口 / 93 Less 模块，无依赖环、缺失引用或重复嵌入 foundation。本批两端 src / es 样式消费者均实际打包通过，BackTop / Ellipsis 根样式各出现一次，CJS 样式入口也保留依赖。
- 全库 --built 样式脚本仍被既有 Cedar menu/style/index.ts 失效路径阻塞，不计全库发布消费者检查通过。本轮曾观察到文档开发流程重写 Maple es 为源码引用入口；最终构建后立即验证了上述正式 ESM 产物，未修改或停止现有开发服务。
- 未运行文档生产构建；本地 9991 端口无法连接，未完成真实浏览器视觉验收。单测不替代像素、动效与键盘浏览器验收。
