# Shared 同源门禁收敛与复验

日期：2026-10-24（Asia/Shanghai）。承接 [全库依赖复查](./runtime-dependencies-2026-10-23.md) 中的 shared 待处理项。

## 结论

原有 shared / foundation 同源失败已关闭。两库采用独立的本地 shared 实现，公开运行时导出均为 41 项，另有 `MotionState` 类型；只有诊断品牌前缀不同。没有把 rattail 的整包转出放回 Maple，没有增加白名单、扩大归一化例外、删除原比较断言或提高体积阈值。

- 68 组运行时 foundation 文件比较通过（86 个登记项中，18 个测试文件仍由各库实际测试运行，不混作源码比较数）。
- shared 十个模块的文件清单、保留类型的 AST 和许可证说明一致。
- `pnpm check:foundations` 全部通过，包含正反门禁测试、Trigger 引用检查及双端各 53 项 Portal 作用域回归。
- 两库类型检查、Maple 全库 lint、两库 runtime-dependencies 门禁、实际亮暗浮层交互通过。

## 稳定性与根因

修复前两次读取 shared 文件时间及 SHA-256 一致；随后收尾快照再次确认 Maple 十个 shared 源码文件整个工作过程未变。未暂停或覆盖其他并行任务，也没有重置脏工作区。

Cedar 原先 `export * from 'rattail'`，并额外导出未被现有仓库使用的 warn / isURL；Maple 已收敛到本地细粒度工具。不能只改 index 的文字，也不能把整个第三方包带回去掩盖差异。

已检查两库现有 shared 导入，包括 UI、use、resolver、CLI、文档站和生成器。Cedar 需要的符号均由公共集合覆盖。按未发布库的规则，直接删除偶然暴露的第三方导出与未使用旧帮助函数，不留兼容 alias；Cedar Changeset 和 OpenSpec 已记录该 API 收敛。

## 修改范围

1. Cedar 增加与 Maple 相同的 array / dom / function / motion / namespace / number / object / predicates / string 本地模块，index 显式导出；保留 THIRD_PARTY_NOTICES 并纳入包发布文件。Cedar shared 移除 rattail 依赖及 lockfile 对应 importer / package / snapshot。
2. 两库 `useMotion` 将 MotionState 改为显式 `import type`，避免类型被当成运行时依赖。
3. 原 shared 比较通过后，完整门禁继续暴露了 popup-container、resize-observer、geometry 的历史差异，均已统一；没有跳过它们。
4. 浮层容器保留完整开发态 DOM / 跨文档校验，仅在 Vue 本来也不执行 prop validator 的生产构建中移除它。
5. 两端共享几何只传递定位真正需要的 scrollTop / scrollLeft / width / height；Cedar 的 RelativeRect 类型和主轴溢出判断一并收敛，与 Maple 相同，并新增精确形状回归。
6. 共享尺寸观察统一使用 ownerDocument.defaultView 的原生 ResizeObserver，加窗口 / visualViewport 事件回退；Cedar 的旧可选 polyfill 接线及调用参数同步迁移。不是只改函数签名而漏掉消费者。

## 没有放宽检查

- 原 `copied-foundations-check.mjs` 的逐对运行时断言和 normalize 规则保持；额外增加九个工具实现与定位计算文件。
- 新 `shared-source-contract.mjs` 遍历两端全部 shared 源文件，文件清单不一致直接失败；比较保留泛型 / 类型声明的 AST，而非仅比较类型擦除后的 JS。
- 四项检查器测试覆盖：格式 / 品牌诊断差异可接受，算法漂移必须失败，仅 MotionState 类型漂移也必须失败，真实两库全清单一致。
- 两库共用同样的包回归测试逻辑，各自构建自己的包到临时目录；没有为了测试清空开发服务正在使用的 shared lib。
- `check:shared` 已加入两库 CI 和 quality，Maple component-bundle 流程也保留 shared 包回归。远端 CI 尚未运行，报告仅记录本机结果。

公共规则已写入 [Shared 工具公共契约](../standards/shared-foundation.md)，由 component-anatomy 和两库 AGENTS 引用。两库 shared README 也提供同一入口。

## 验证结果

| 验证 | 结果 |
| --- | --- |
| Cedar 消费者回归 | 52 个测试文件，336 项通过 |
| Maple 消费者回归 | 45 个测试文件，293 项通过 |
| Cedar / Maple 真实 shared 包回归 | 各 13 项通过；ESM、CJS、DTS、泛型、断言收窄、深拷贝、合并、动画、节流、DOM、SSR 导入与 tree shaking |
| 类型与源码门禁自测 | 4 项通过 |
| 小工具按需导入 | 两端均为 165 gzip 字节，低于原 512 字节阈值 |
| Maple 全组件按需 JS | 92 个入口全部通过原 bytes / gzip 上限，无 rattail / mitt 残留 |
| Runtime dependency gate | Cedar 1,183、Maple 930 个源码模块，环路 / 根入口回流 / HMR 兜底均为 0 |
| 两库全库 typecheck | 通过 |
| Maple 全库 lint:check | 通过 |
| Cedar shared / use / resolver 构建 | ESM / CJS / DTS 通过 |
| 三仓库 diff --check | 通过 |

消费者回归覆盖 Trigger、foundation、Avatar、Tooltip、Popover、Ellipsis、CountTo、Card、Affix，以及 Cedar NavMenu。表内包含重复复跑的子集，不能把 Portal 门禁中的 53×2、共享夹具重复运行再叠加成新的测试覆盖数。

实际浏览器：两库 Tooltip 焦点触发正常，浮层可见、位置与尺寸有效，Escape 关闭正常；Cedar 默认亮 / 暗色与 Maple 默认亮 / 暗色均复核，无控制台错误。主题测试后恢复进入前的偏好。该验证不是所有页面、所有旧浏览器的穷举认证，也未重新宣称完成整库发布构建。

证据：[browser.json](./evidence/shared-foundation-2026-10-24/browser.json)、[validation.json](./evidence/shared-foundation-2026-10-24/validation.json)、[源码稳定性与 SHA-256](./evidence/shared-foundation-2026-10-24/source-stability.json)。截图：[Cedar 亮色](./evidence/shared-foundation-2026-10-24/cedar-tooltip-light.png)、[Cedar 暗色](./evidence/shared-foundation-2026-10-24/cedar-tooltip-open.png)、[Maple 亮色](./evidence/shared-foundation-2026-10-24/maple-tooltip-open.png)、[Maple 暗色](./evidence/shared-foundation-2026-10-24/maple-tooltip-dark.png)。

## 遇到的问题与明确边界

- 试验保留旧可选 polyfill 接线时，四个 Maple 入口超出原 gzip 上限；没有更新 baseline。最终采用两端一致的原生观察 / 窗口回退实现，92 个入口恢复通过。
- 没有原生 ResizeObserver 时，窗口 / visualViewport 事件和 Vue 更新会触发布局重测，但不模拟任意纯 CSS 内容尺寸变化。需要完整旧浏览器尺寸观察能力的应用，应在应用入口提供标准 polyfill。Cedar Table 的独立 resize-observer-polyfill 用途仍在，未删除其依赖。
- 类型检查发现 Cedar 的旧 RelativeRect 仍要求已不再返回的字段，已同步修复类型与计算消费者，不使用 any 绕过。
- 新增测试最初在旧版 Vitest 的 window 代理上布置监听，未覆盖实际宿主窗口；已改为真实 ownerDocument.defaultView，保留所有帧合并与卸载后旧回调断言，两端通过。
- 本机 pnpm 为 10.14.0，而仓库声明 9.6.0。冻结安装尝试提示重建 node_modules，未确认执行，以免影响并行服务；另以只读 YAML 校验确认 shared manifest 与 lockfile 声明一致，rattail package / snapshot 已移除。不能将这次提示退出算作冻结安装验证通过。
- 此前报告中 shared 的待处理状态已关闭；整项目完整发布构建、远端 CI 和所有旧浏览器视觉行为不是本轮 shared 专项完成声明。后续完整构建、frozen 安装与 CI 验收结果另见 [完整构建与 CI 报告](full-build-ci-2026-10-24.md)，不要以本节历史边界替代后续结果。
