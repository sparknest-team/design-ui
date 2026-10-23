# Token 生产文档与桌面交互验收

日期：2026-10-09。范围：真实源码组件、两端生产文档、桌面 Chromium。不是全库视觉、跨浏览器或真机验收。

后续更新：[Rate 局部覆盖与文档响应式](./token-responsive-followup-2026-10-09.md)已关闭本文记录的原 Rate 两个候选及 Maple 文档壳 1200px 最小宽度问题。下文保留当时快照；最新并行集成状态见后续记录。

## 本轮修复

- 自动变量参考表增加局部横向滚动容器；同步 Cedar 中文、Maple 中英文三页及文档规范。Cedar 原 960px 页面被 Scheduler 长变量撑到 1058px；修复后文档可用宽度和 scrollWidth 均为 949px，长表在 528px 容器内滚动，不再撑宽页面。
- Maple 示例检查按文档语言选择平铺的 `.zh-CN.vue`／`.en-US.vue` 文件，保留普通 `.vue` 回退与语言目录优先级，避免要求中文引用英文专用示例。增加三项回归测试。
- 保留实际组件验收夹具及生产预览入口：`refactors/token-validation/browser/README.md`。主题通过公开 StyleProvider API 切换，包含暗色根节点属性；不模拟伪类或替换组件 CSS。

## 已验证

| 范围 | 实际结果 |
| --- | --- |
| Cedar 完整 `pnpm build:doc` | 修复后成功，267 页，551.33 秒；包含 Git 页面历史初始化 |
| Maple 完整 `pnpm build:doc` | 成功；911 个示例 SFC 检查零失败，Vite 构建成功 |
| 生成器测试 | `node --test bin/token-catalog.test.mjs`，3 项通过 |
| 语言选择测试 | Maple 包内 Vitest 执行 `scripts/quality/demo-language-files.test.mjs`，3 项通过；沙箱 localhost 解析失败后经授权在沙箱外运行 |
| 本轮脚本 lint | 示例检查器及两份语言选择文件的 scoped ESLint 通过 |
| Maple 全库 lint | 最终重跑 `pnpm lint:check` 成功，退出 0；日志 `/private/tmp/token-docs-maple-lint-final-20261009.log` |
| 最新目录漂移 | `node bin/token-catalog.mjs --check`，三页与运行时最新源码匹配；不是用旧 inventory 文件覆盖并发更新 |
| 文档浏览器 | Cedar 实际侧栏导航、页内锚点及长表；Maple 实际侧栏导航、中英文切换、两种语言参考表；被测生产页面未捕获 console error |
| 差异格式 | 三个仓库 `git diff --check` 通过 |

构建日志：`/private/tmp/token-docs-cedar-20261009-final.log`、`/private/tmp/token-docs-maple-20261009-final2.log`。日志是本机临时证据，不是发布产物。

## 真实交互矩阵

两端均检查 default/light、default/dark、maple/light、maple/dark：

- Input 正常态 fill1，真实鼠标 hover 为 fill2，hover 与 focus 同时存在为 fill3。通过点击后保持指针不动并按 Tab，区分 hover-only 与 hover+focus；等过渡结束后读取 computed style。
- 错误 Input 保留错误底色与 `aria-invalid`；禁用 Input 不获焦点，hover 不替换禁用底色；readonly 输入不改变值。
- Date 打开时保持 fill3；Cedar Escape 关闭，Maple Cancel 关闭。
- DropdownMenu selected 身份保留，禁用项不参与选择，ArrowDown 跳过禁用项，Escape 焦点回到触发器。Cedar 中性底色与 Maple 品牌 cover 是不同绘制策略，不宣称像素相同。
- maple/dark 下两端额外检查嵌套菜单：ArrowRight 进入子菜单，Escape 退回父级，再回到触发器。
- default/light 下两端局部覆盖验证默认／hover／focus 分别为 `#ddffee`／`#cceedd`／`#bbddcc`，错误与禁用仍使用状态专属颜色。

本轮该矩阵未发现需要修改组件生产 CSS 的问题。点击最终状态不等于已测量鼠标按住期间的 pressed 帧。

## 仍未关闭的边界

- 最后全量消费检查：140 个 token 文件、4007 项声明、81 个候选（54 跨组件 CSS、5 精确运行时、20 动态运行时、2 待审），编译错误 0。门禁因 2 项待审退出 1，不能记为通过：Cedar Rate 的 `--c-rate-transition-duration-scale`、`--c-rate-transition-timing-function`。这两项处于其他任务正在改动的组件，需在其实现稳定后核验真实消费；没有为了门禁删除声明。

- Maple 桌面文档站 `.maple-site` 在 `packages/maple-cli/site/pc/Layout.vue` 设置 `min-width: 1200px`。960px 下可用宽度 945px、scrollWidth 1200px；参考表自身没有额外溢出，但整个站点不是窄屏通过。后续应单独设计侧栏／正文／模拟器的响应式布局，不能只移除 min-width 就宣称完成。
- Safari、Firefox、iOS／Android 真机、输入法、安全区域、粗指针、屏幕阅读器、动态 reduced-motion、大字号／缩放仍未在本轮实测。
- 这是 Input、Date、DropdownMenu 的代表性矩阵，不代表所有组件、所有变体、Teleport 宿主、自定义背景和按压中间帧通过。
- 工作区同时存在 Radio、Rate、Progress 等其他任务改动。早期构建曾被 Radio 导出和 Progress 示例引用阻断，随后其来源任务更新解除；本轮未接管或覆盖这些组件实现。较早 inventory 的候选数也不应当作最新结论。
