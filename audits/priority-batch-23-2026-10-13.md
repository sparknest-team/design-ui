# 第二十三批：Maple 开发与发布目录边界

## 完成

- 根据第二十二批发布样式文件消失的证据复现旧 dev：冷启动、maple.config.mjs 重启、component-reuse.json 重启三项均覆盖 index.mjs 并删除图标样式入口；已有 Playground bundle/CSS 虽被保留，其他发布模块仍被破坏。
- 删除 Maple CLI dev 中旧 stub 与其生成/文件读写依赖。文档与组件样式现有 Vite 别名直接使用 src，因此无需占用 es；站点配置生成、服务器关闭/启动、配置与调研 watcher、site HMR 同步保持原流程。
- 新增独立 Node 工具回归：真实 dev 源码经 esbuild 转换，隔离文件系统/服务器/watcher依赖，验证发布入口、图标样式、Playground bundle/CSS 内容及目录边界不变。只模拟外部 IO，不把它称为实际 Vite 浏览器验收。
- 添加 pnpm check:dev-boundary 并接入 quality；中英文 CLI README、AGENTS 和 CLI patch changeset 同步。不新增组件 API、兼容 alias、共享运行时或 platform 配置。
- ESLint 自动修复曾将 Node 工具测试的 node:test 改成 Vitest，造成门禁运行失败；仅在 scripts/quality/*.test.mjs 范围关闭框架不匹配的 vitest/no-import-node-test 规则，保留其余规则与全库零警告要求，恢复语言文件工具测试的 Node runner。组件 Vitest 不受影响。

## 验证

- 三项破坏性行为在修复前失败，源码修复后 check:dev-boundary 四项通过；自动格式化/修复之后再次通过。语言文件工具测试三项通过，无跳过。
- Maple CLI build（TypeScript）通过；编译后的 lib/node/commands/dev.js 不再含 ES_DIR、removeSync、outputFileSync、stub，保留站点生成与 createServer。
- Maple 全库 lint:check 通过；本批路径 git diff --check 通过。
- 两库发布样式图通过：Cedar 96 入口/98 Less、Maple 91/93，无缺失、环或重复基础样式，foundation / Loading 在源码及发布消费者均单次加载。
- Maple package:check：3229 文件，15954.2 KiB，0 source maps，0 errors / warnings。
- 日期复制门禁 42 对与 71 族菜单/调研同步检查通过；本批只改工程层，不改变组件同源状态，未重复写 JSON 触发旧 dev 重启。
- 独立 Playground 的配置确认仍读取组件包 es/index.mjs / maple.css 并输出自身 public；文档预览只传源码到配置的 Playground URL，不需要旧占位模块。未实际运行独立 Playground 或生产整站文档构建，未做真实浏览器验收。

## 运行中的旧进程

已重建 CLI，但正在运行的 dev 仍持有旧函数。需要用户手动重启一次 pnpm dev 才会采用新逻辑；不擅自停止现有服务。之后配置/调研菜单变化才不会再覆盖发布目录。

## 后续

截止前按依赖层检查现有复制/导出/类型门禁及剩余待验收清单，避免启动无法安全验证的大改造。正式发布前仍缺真实浏览器触控/软键盘/视觉与生产文档整站验收，不能用调研状态 0 待同源替代它们。

截止北京时间 2026-10-13 14:00；不提交、推送、发布。
