# Webpack 4 文档最小项目验证

验证日期：2026-11-18。使用 npm 正式发布的 Cedar / Maple UI 和 icons 1.1.11，不引用本地组件库源码或构建目录。Node 20.19.0、Vue 3.5.45、Webpack 4.47.0、webpack-cli 3.3.12；完整依赖版本见 versions.json 与 package-lock.json。

## 复现

```sh
npm ci --ignore-scripts
npm run check:docs
npm run verify:maple
npm run verify:cedar
```

两端分别在 maple/ 与 cedar/ 下提供 webpack.config.cjs、src/index.js、index.html。配置、入口及 HTML 直接取自对应中英文公开文档；check-docs.cjs 校验二者一致。构建命令均为 webpack --config webpack.config.cjs，不设置 NODE_OPTIONS 或 OpenSSL legacy provider，不将 Vue 或组件库 externalize。

verify:* 在生产构建后使用 jsdom 检查 Button 挂载、SVG 图标、CSS 注入和点击事件；CSS 解析诊断与 JavaScript 错误分别统计。本次两端均为 0。完整浏览器检查另使用独立 ego lite TaskSpace 中的 Chrome 156，结果见 browser-maple.json / browser-cedar.json：按钮挂载、SVG、样式、点击均通过，error / unhandledrejection 为 0。浏览器检查对最小 HTML 增加了测试用错误收集器，应用入口及 bundle 未修改。

本地浏览页面可在当前目录启动 HTTP 服务，例如 python3 -m http.server 8080 --bind 127.0.0.1，再打开 /maple/ 或 /cedar/。

## 验证结果及修正

- 两端生产构建均退出 0，仅有 Webpack 默认体积提示，见 final-*.log、build-*.json 及 cli-*.log。
- 同时验证 UI 根入口、Button 子路径、图标根入口及单图标子路径，并检查根入口和子路径导出身份一致。CSS 导入覆盖组件样式、全量样式、reset 和图标样式。
- 原先仅转换 ?. / ?? 时，Maple 根入口中的 ||= 仍导致解析失败，见 before-logical-assignment.log。
- 补逻辑赋值后，Cedar 仍遇到 .cjs 依赖漏转译和类字段解析失败，见 before-cjs-and-class-fields.log。
- 最终统一使用 Babel preset-env（targets.chrome=70、modules=false），覆盖 .js / .mjs / .cjs；通过 alias 映射真实 ES 目录和特殊样式，并设置 javascript/auto 处理模块互操作。

Chrome 70 仅为语法转换 target，不是浏览器兼容承诺。此次仅验证最小应用，不覆盖全部组件、旧浏览器 API、CSS 降级、SFC 编译或所有 Webpack 4 项目；不纳入持续兼容保证。此最小入口刻意同时导入全量与按需样式用于解析验证，生产应用通常选择一种样式方案。
