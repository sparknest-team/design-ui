# Token 局部覆盖与文档响应式收尾

本轮接续 [桌面验收](./token-desktop-validation-2026-10-09.md)，只覆盖 Rate 消费／实例作用域和 Maple 文档布局。其他任务同时修改 Input、Textarea、Slider、List 与 Rate 的公开契约；保留其改动，不把并发失败归因于本轮，也不把临时零候选当作最终全库结论。

## Rate：已关闭原两个候选

- 选中缩放动画与普通 hover／颜色过渡分别消费独立时长；缓动曲线接入两者，不删除公开入口来满足检查。
- 采用并行 API 任务收敛后的两端公开名称：`rate-transition-duration`、`rate-scale-duration`、`rate-transition-timing-function`。旧名称迁移与默认值契约由对应 API 任务维护，本轮不恢复旧别名。
- 两端 `appearance.less` 的私有映射从 `:root` 移至 `.c-rate`／`.mp-rate`。CSS 变量在声明元素解析；放在根上的私有别名不能保证实例公开覆盖生效。
- 真实 Chromium 中，两端实例定制得到普通过渡 `0.123s`、选中动画 `0.456s`、`linear` 曲线及 `rgb(1, 100, 150)` 选中色。通过实际 ArrowRight 触发动画读取，不强制伪类。
- `rate-core-check.mjs` 增加组件作用域和终端动效消费者断言；保持两端样式规则规范化一致。Cedar Rate 22 项、Maple Rate 39 项测试通过；默认无效输入案例的 Vue warning 属于预期。

## 文档响应式实现

- 大于等于 1200px 保留侧栏／正文／模拟器；768–1199px 保留侧栏，模拟器排在正文下方；小于 768px 使用非模态目录展开区。
- 删除文档壳的 1200px 与正文的 500px 最小宽度约束，正文列允许收缩，长表局部滚动；不靠裁剪整个页面掩盖溢出。
- 保留小屏语言选择；页头隐藏非必要快捷链接。窄屏规则置于普通规则之后，防止等权选择器把 `display: none` 覆盖回去。
- 目录按钮提供 aria-expanded / aria-controls；Escape 返回按钮，选页后关闭目录并把焦点移入 main。恢复目录链接的 focus-visible 描边。
- 这不是独立营销首页重设计，也不等同于触屏硬件测试。

## 文档与检查

- 共享 Design Token 规范及 Cedar／Maple 中文、Maple 英文镜像增加重构后消费链与局部作用域说明。
- 自动目录同步本轮 Rate 部分；对并行组件中间态不盲目覆盖整张目录。
- 新增 `responsive-layout.spec.ts` 两项真实 Less 编译／模板契约回归；通过。它不模拟布局，真实尺寸结果另行记录。
- 修改的 CLI 文件原本被全库 ESLint 忽略，本轮额外使用 `--no-ignore --max-warnings 0` 检查，并移除页头未使用图标、修正属性顺序。

## 最终生产验收

Maple `pnpm build:doc` 最终成功：915 个示例 SFC 零失败，Vite 构建完成（日志 `/private/tmp/token-responsive-maple-build-verified.log`）。此前 Slider 入口改造中曾令整站构建失败，来源任务同步入口后解除；未通过补旧别名绕过。

真实 Chromium、生产构建，中英文参考页均验证：

| 请求视口宽度 | 文档 clientWidth / scrollWidth | 目录 |
| --- | --- | --- |
| 320 | 305 / 305 | 折叠目录 |
| 390 | 375 / 375 | 折叠目录 |
| 768 | 753 / 753 | 常驻侧栏 |
| 960 | 945 / 945 | 常驻侧栏 |
| 1280 | 1265 / 1265 | 常驻侧栏 |

差值来自浏览器滚动条。390px 下长表局部容器 343px、内容宽度可达 392px，横滚留在表内。中英文语言选择始终可见；Space／Enter 展开目录，Escape 关闭并恢复按钮焦点；选 Rate 后关闭目录、聚焦 MAIN。Rate 预览 iframe 位于正文下方（327 × 640px），加载真实的 18 个评分示例，并随语言从 en-US 切回 zh-CN。被测生产页无捕获的 console error。Design Token 新章节已在生产页面确认出现。

Rate 普通过渡／曲线／选中色的实例覆盖另在 default/light、default/dark、maple/light、maple/dark 四主题重验通过；456ms 动画通过真实 ArrowRight 操作验证。未模拟系统 reduced-motion 偏好或宣称真机通过。

## 同工作区集成边界

最终消费快照：142 个 token 文件、4064 项声明、79 个候选，其中跨组件 40、精确运行时 5、动态运行时 20、待审 14，编译错误 0。原 Rate 两项已关闭；新的 14 项属于并行 Input／Textarea 改造涉及的 FieldDecorator 内部变量，已通知对应任务。全量消费门禁退出 1，不记为通过。

最终目录 `--check` 仍提示 Cedar 参考页漂移，原因是其他组件在本轮期间继续变化；本轮只同步 Rate 的生成差异，最终全量目录由组件集成阶段重生成。Maple 全库 `lint:check` 最后一次快照失败，137 项位于并行 Input／Textarea／VirtualList 与主题测试；本轮 CLI 修改额外以 `--no-ignore --max-warnings 0` 检查通过。三仓库 `git diff --check` 通过。不能把局部完成表述为整个工作区已绿。

剩余环境项仍是 Safari／Firefox、真实触屏设备、输入法／安全区域、动态 reduced-motion、屏幕阅读器及更广泛业务场景。本轮没有重新构建 Cedar 全站；Cedar 的变化通过 Less 消费检查、Rate 测试、真实源码浏览器及目录更新验证。
