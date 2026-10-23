# Token 全量收尾复核 — 2026-10-19

后续 lint 复验：三文件历史 8 项诊断在当前快照已消失，未重复改源码；Maple 根 lint／类型、300 项相关回归及共享 motion／目录／消费门禁通过，库存／80 hash／三页无新增漂移。详见 audits/evidence/field-presentation-lint-closure-2026-10-19/results.json。以下历史失败不覆写；Map／144 原生组恢复条件和自动化 PAUSED 不变。

后续状态：用户已明确授权 FieldPresentation／Form 及审计器限域接管。下文为授权前快照；本批已复现并修复搜索／关闭焦点任务归属与 Maple Less min-width 消费，支持真实私有入口并同步 6 处库存、hash 和三页目录。当前 184/184 已分类、80 源码；严格 motion／目录门禁通过，Map SDK 和 144 原生组的恢复条件仍有效。新证据：`audits/evidence/field-presentation-form-closure-2026-10-19/results.json`；自动化保持 PAUSED。

复核时间：上海 2026-10-19 18:15 起。本轮是手动只读核对与文档同步；自动化 `cedar-maple-14-00-2` 配置仍为 `PAUSED`，未修改调度。保留并行业务、生产源码、Token 默认值、原库存／分类登记及三页生成目录；没有自动刷新证据。

## 结果：发现新增变化，不能宣布无漂移

| 项目 | 当前结果 | 与上次区别 |
| --- | --- | --- |
| motion 库存 | 198 文件、418 CSS 提示、184 runtime 提示；6 处文件键差异 | 原登记 196／416／182；新增 2 文件、2 CSS 行提示、2 runtime 提示，不是 4 个产品缺陷 |
| 分类 hash | 78 登记源文件中 76 匹配、2 过期 | 两端 `form/Form.vue`；没有自动刷新 hash |
| 调用分类 | 当前 184 条中，176 条有匹配源码身份的既有登记；8 条需审／重验（4.3%） | 6 条来自过期 Form 文件，2 条为新增搜索任务；176/184 为 95.7%，不是行为验收率 |
| 组件族口径 | 原 33 族中 32 族的登记源身份仍匹配（97.0%），Form 1 族需重验（3.0%） | 原 33/33 是 10-16 历史分类；新增私有搜索任务的归属尚待登记，不武断新建第 34 族 |
| Token／目录 | 当前扫描 172 条文件记录、4552 已处理声明、2 项入口错误，目录完整性未确认 | 原 170 条记录；新两端私有 Token 文件未纳入声明统计，不能把 4552 当完整当前声明数 |

6 处库存差异（hash 过期是其中的子集，不能重复累加）：

| 仓库 | 文件 | 差异 |
| --- | --- | --- |
| Cedar | `_components/field-presentation/use-field-search.ts` | 新文件，runtime 第 14 行 |
| Maple | `_components/field-presentation/use-field-search.ts` | 新文件，runtime 第 14 行 |
| Cedar | `form/Form.vue` | runtime 122／134 → 154／168，hash 过期 |
| Maple | `form/Form.vue` | runtime 102／105／116／133 → 107／110／121／138，hash 过期 |
| Cedar | `date/picker/style/index.less` | CSS 94／118／190 → 95／119／191；并行标题 nowrap／范围箭头样式保留 |
| Cedar | `form/style/index.less` | CSS 277／279 → 239／240／281／282；含多声明展开、格式及私有 form.less 导入，不把提示行数变化当故障数 |

两端 Form 已接入新的 field-presentation 上下文；Cedar 样式也导入私有 form.less。不能仅凭行号移动认定完整业务等价。需要负责人确认可交接边界，或限域授权审查两端 FieldPresentation／Form 关联接线与审计器；之后核对新搜索任务的取消、旧回调／重复交付、停用／卸载、关闭／只读／重入，再决定是否需要实现修复和分类刷新。

### 目录检查为何中断

两项错误都为 `No sibling style/index.less`，对应两端 `src/_components/field-presentation/token.less`。当前审计器按旧 `src/<component>/style/token.less` 结构确定组件和入口，误将新文件归为 `_components`。真实路径是组件样式入口导入 `field-presentation/style.ts`，再导入 `style.less → token.less`；已确认两端各 4 个声明以及 gap／padding／min-width／max-height 消费，真实 Less 入口分别编译通过。

这不是已复现的 Less 语法故障，但仍是严格审计门禁失败：需让审计器识别真实私有入口和归属，并明确这些实现变量的目录／API 可见性，再补正反回归。不能增加空 `style/index.less`、忽略 `_components`、把错误数改成零或用不完整报告生成三页。当前三页是否有多少新增行漂移仍未知，旧“21 行已收口”是历史，不套用为当前差异数量。

## 本轮验证层级

- `pnpm check:motion-themes`：失败，首段 79 项中 76 通过／3 失败。包含 Form hash 失败以及两项因 Token 报告不完整而中断的测试模块；后续串行编译检查未执行，不声称全量 motion 通过。
- `node bin/motion-source-inventory.mjs --check`：失败，6 处上述差异；另逐文件扫描全部 78 份登记 hash，确认只有两端 Form 过期。
- `pnpm check:token-reference`：失败，11 项中 8 通过／3 模块失败；未到全量三页匹配阶段。模块级异步错误来自底层 Token 报告非零，不是额外三组件产品故障。
- `node bin/token-inventory.mjs --check-consumers --summary`：失败，2 项入口识别错误；已处理部分候选仍为 70（40 跨组件、10 字面 runtime、20 动态，0 待人工），不能据此认证未处理的私有声明。
- 两端 field-presentation 真实 `style.less` 各自用本平台 Less 编译通过；只作定位证据，不取代完整消费／目录门禁。
- `pnpm check:browser-evidence`：202 项及既有证据完整性链通过。仅验证保存数据／图片 hash，不是重跑原生浏览器；新增原生验收 0，144 组仍阻塞。
- 未改生产源码，无新增产品修复、类型／构建／全组件单测／lint 通过的暗示；Vue 技能用于清理职责与证明边界核对，本轮未扩展模拟测试覆盖。

## Map SDK：解除阻塞需要什么

Map 在 Cedar；Maple 没有对应运行时，不为对齐创建移动组件。当前 Cedar 的 map-core 运行时导入仍被注释，`MapService`／`SearchService`／`LngLat` 等声明只是类型，不是可运行 provider。缺依赖降级测试不覆盖活动 SDK。

1. **交接正式适配器**：明确可使用的包／版本、driver、入口和维护者，接通 MapService 初始化、地图实例、坐标、搜索／逆地理服务；提供真实开发验证入口。不要把任意 mock 或重新声明全局量当迁移完成。
2. **明确原资源契约**：实例和搜索服务如何销毁，`on` 的解绑方式／句柄／回调身份；初始化、搜索、逆解析能否取消、取消后是否仍回调、同步重入和错误如何交付。仅现有 `on(...): void` 类型不足以推断 `off`／`destroy`／`abort` 方法，不能猜接口。
3. **冻结业务边界**：确认 KeepAlive 停用是保留还是释放 SDK 实例，实例替换／重初始化／地图中心更新与选点通知如何归属；保留现有 model／地址提交语义。取得交接边界后先复现再修复，不接管迁移业务。
4. **提供可运行环境**：测试 driver 的 SDK／瓦片／搜索／逆解析网络可达；若 driver 需要 key／域名白名单，提供已配置的受控开发环境，不在文档／聊天粘贴密钥。真实定位需安全上下文和用户自行授予定位权限；本轮不安装依赖、不改权限、不请求定位。
5. **完成活动分支验证**：300／500ms moveend 抑制任务的取消／代次／一次消费、连续选点、新旧中心替换、停用／卸载、旧监听／初始化／搜索／逆解析结果迟到和重入；再验证 MapSelect 地址回填、定位成功／失败／拒绝和真实地图交互。受控回归与真实 SDK／网络证据分别记录。

以上是所需输入／契约和后续验收条件，不是声称已发现或修复活动分支缺陷。Map 原有职责分类不等于 SDK 生命周期已验收。

## 144 组原生环境：三套各需要什么

原环境观察为 **2026-10-13 的历史记录**：Chrome 连接曾超时，Safari 原生入口曾超时，Firefox 在四个标准路径未找到；不是 10-19 新的安装／连接探测结论。本轮未重试超时入口，未安装软件或修改权限。只有相关连接／环境确有变化后，才有界检查恢复。

| 套件 | 剩余 | 恢复前提 |
| --- | ---: | --- |
| Chrome 原生页面缩放 200% | 48 | 可响应的受支持 Chrome 连接／原生控制，能打开专用测试页、操作浏览器自带页面缩放，并保存可见的 100%→200% UI 证据；不能仅凭 viewport／DPR 推断 |
| 已安装 Safari，确认 100% | 48 | 可响应的受支持 Safari 浏览器会话或原生控制；记录实际产品版本、缩放、键盘导航设置，不以模拟 WebKit 替代 |
| 已安装 Firefox，确认 100% | 48 | 用户提供实际安装位置／版本及可响应的受支持控制入口；若当前未安装，安装由用户另行决定，本任务不安装、不改权限 |

每套 48 = 两端（Cedar Drawer／Maple Popup）× 4 品牌／明暗组合 × 3 挂载目标（body／host／inline）× 2 内容长度。Safari／Firefox 的额外 200% 不包含在这 144 组内。

共同前提：使用可加载当前两仓源码的固定测试页，明确本轮源码快照；用 `TOKEN_ACCEPTANCE_FROZEN=1` 关闭 fixture watching，避免并行构建打断采样（不是冻结其他任务修改仓库）。记录真实宿主、主题、前景／背景、视口／面板／关闭控件边界和滚动尺寸；完整打开／关闭、长文滚动、Tab／Shift+Tab／Enter／Escape、挂载迁移、焦点约束／归还、滚动锁释放、相邻实例不受影响。截图带浏览器版本、确认缩放、条件、结果与失败原因。Chrome 要同时保留原生 UI 缩放证据；结束恢复原缩放，只清理测试拥有的资源。

不接受 CSS zoom／transform、窄屏、pinch、纯文字缩放、JSDOM、Less、IAB 或模拟 WebKit 冒充这三套原生证明；不绕道 AppleScript／原始 CDP，不以超时为理由修改产品 CSS。完整操作／判定协议见 `refactors/token-validation/browser/README.md` 的 Native zoom and Safari/Firefox resume protocol。

## 下一步边界

安全核对与文档已完成；本轮不自动接管新 FieldPresentation／Form 并行改造，也不篡改 hash、库存或目录让门禁变绿。继续收口需要明确上述新关联代码／Token 与审计器的交接范围；Map／原生环境分别按条件恢复，不要求先恢复这两类环境才审安全的源码事项。Button 白字 on-dark 2.305:1 非 AA 例外保持，其他文本阈值不降。自动化保持暂停。

逐项 JSON：`audits/evidence/full-closure-recheck-2026-10-19/results.json`。10-16 结果保留为当时快照，不回写历史。

最终收尾：上海 18:20 完成；三仓 diff 检查和证据 JSON 通过。文档更新前后 Cedar 1407、Maple 1192 个生产源码文件（排除示例／测试／文档）的汇总 hash 均未变；验证进程全部结束。这里的 diff／保存证据通过不抵消本轮库存、分类和目录门禁失败。
