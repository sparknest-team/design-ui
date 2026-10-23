# Token 全量收尾复核 — 2026-10-20

后续授权收口：本轮 3 库存／2 hash／三页 11 逻辑行已完成真实消费与调度归属核对、回归和同步；当前共享 motion 106／目录 47／完整三页匹配通过，80 hash 匹配、184/184 提示与 33/33 族分类收口。生产源码和默认值未改。以下待交接与失败是授权前快照，不覆写历史；Map SDK／144 原生组的恢复条件、自动化 PAUSED 仍有效。最终详细结果见 audits/evidence/date-drift-closure-2026-10-20/results.json。

核对时间：上海 2026-10-20 13:42 起。范围是只读全量库存／分类身份／三页目录及审计文档；未改生产源码、并行业务、Token 默认值、库存登记、分类 hash 或生成表格。自动化 cedar-maple-14-00-2 的保存状态为 PAUSED，未修改调度。

## 结论：有新的日期并行漂移，不能沿用 10-19 的通过结论

| 核对项 | 本轮快照 |
| --- | --- |
| 库存总量 | 198 文件／418 CSS／184 runtime，与上次总量相同，但 3 处文件键内容不同 |
| 分类身份 | 80 源码中 78 匹配；Cedar DateRangePicker、Maple YearPickerPanel 两份 hash 过期 |
| 提示进度 | 182/184 有匹配身份（98.9%）；2 条需重验（1.1%），不是新增缺陷或新分母 |
| 族进度 | 历史 33/33 已分类；按当前身份 32/33 匹配（97.0%），Date 1/33 待重验（3.0%） |
| 当前完整 Token 报告 | 172 文件／4565 声明／70 已分类候选；40 跨 CSS＋10 字面运行时＋20 动态；0 待人工／0 编译错误 |
| 三页目录 | 3/3 有漂移；Cedar 3 个逻辑行、Maple 中英各 4 行，共 11 行；新增唯一声明 5 个 |

族／提示分类不是全库业务或真实浏览器验收率。首轮消费扫描为 4564 声明，随后完整报告为 4565；两端日期源码与 Token 在检查期间继续改变，不能把多个快照拼成“全程稳定”。两端生产树汇总 hash 也变化，本轮不归因全部变化、不接管其他业务。已登记文件中的过期范围仍是上述两份；不以当前两份 hash 推断其全部业务等价。

### 3 处库存差异（两个 hash 是其中子集，不能累加为 5 处）

| 仓库 | 文件 | 登记 → 本轮观察 |
| --- | --- | --- |
| Cedar | date/picker/DateRangePicker.vue | runtime 644 → 652 |
| Maple | date/picker-panels/YearPickerPanel.vue | runtime 236 → 262 |
| Maple | date/style/date-picker.less | CSS 47／68 保留；245／251／271／291／297／367 → 288／294／314／334／340／410 |

Cedar DateRangePicker 存在范围预览上下文、清理接线和选点业务改动；Maple 年面板接入范围高亮／预览、只读及清除接口，关联 use-calendar-range-style 和日期样式／Token。不能只看定时器行号移动就刷新 hash。本轮未建立新产品故障复现，未修业务源码。

### 三页生成差异

- Cedar date/picker：cell-bg-hover-in-range 与 cell-hover-range-boundary-bg 默认值从 primary-light 角色改为 fill-2；新增 --c-date-picker-preview-outline（1px dashed primary，消费到 outline）。
- Maple date：新增 --mp-date-picker-range-background、range-disabled-background、range-preview-background、range-preview-outline；分别消费 background／outline。中英各 4 行。
- 总共 2 行默认值修改＋9 行新增＝11 个逻辑行；唯一新增声明为 Cedar 1＋Maple 4＝5。不是 11 个产品缺陷。

生成器只输出差异供审查，未应用表格。编译报告零错误不等于日期 DOM 状态、局部覆盖、资源归属和设计变更已验收。需要日期负责人确认可交接范围，或明确允许限域审查上述两份 SFC／关联预览助手、样式与 Token 后，先核对真实消费／复现，再重验并同步登记和三页。此前授权批已关闭，不能自动将新一轮日期业务变化归为旧格式修正。

## 实际验证层级

- pnpm check:motion-themes：首段 96 项中 92 通过、4 失败；涉及日期库存／hash。后续串行库存／分类和完整编译链未执行，不声称 motion 全量通过。独立库存／分类 CLI 也失败，定位结果与上述范围一致。
- pnpm check:token-reference：37 项专项通过，随后全量目录匹配失败；另用同一完整 Token 报告逐一比较三页，确认三页均有上述差异，而非只报告首个失败。
- node bin/token-inventory.mjs --check-consumers --summary：首轮通过（4564 声明）；后续完整报告通过（4565 声明），保留并行变化的时间差。
- pnpm check:browser-evidence：202 项及后续保存证据完整性链通过；不是新的浏览器运行，新增原生验收 0。
- 未重跑全部组件业务测试、类型或根 lint，不引用 10-19 的结果冒充 10-20 结果。
- 本轮临时只读汇总脚本有语法／模块路径纠正，修正后取得结构化结果；没有安装模块或改审计器来跳过门禁。

## Map SDK：需要的输入与解除条件

当前只涉及 Cedar，Maple 没有对应运行时，不创建空壳。已读当前 map/map.tsx：map-core 运行时导入仍注释，MapService／SearchService／LngLat 的声明不构成正式 provider；缺依赖降级测试不能验收活动 SDK。

1. **正式 SDK 适配器**：明确包名／版本、driver（google／amaps／qqmaps 等实际使用项）、初始化入口和维护者，提供可运行开发页。不能凭 mock 或 ambient declarations 宣称迁移完成。
2. **资源契约**：明确监听解绑方式、句柄／回调身份、实例／搜索服务销毁方法；初始化／搜索／逆解析的取消能力、取消后迟到回调、同步重入和错误交付语义。不得猜测 off／destroy／abort 是否存在。
3. **业务交接**：确认 KeepAlive 停用保留还是释放实例、实例替换与重初始化、中心更新／选点通知的归属，并保留现有 model／地址提交语义；需具体可交接边界。
4. **受控环境**：SDK／瓦片／搜索／逆解析网络可达；key 与域名白名单由受控环境配置，不在聊天／文档粘贴密钥。真实定位需安全上下文和用户自行授予定位权限；本任务不安装依赖或修改权限。
5. **随后验收**：先复现再修复，覆盖 300／500ms moveend 抑制任务、取消／代次／一次消费、连续选点、停用／卸载、旧监听和初始化／搜索／逆解析迟到及重入；再验证 MapSelect 回填、定位成功／失败／拒绝及真实地图交互。受控测试与真实 SDK／网络证据分别记录。

所缺的是正式实现／契约、交接与可运行环境；不是已确认的活动分支缺陷数。源码职责分类与 SDK 生命周期验收分开。

## 144 组原生环境：分别需要什么

| 套件 | 待验 | 必要条件 |
| --- | ---: | --- |
| Chrome 原生页面缩放 200% | 48 | 可响应、受支持的真实 Chrome 会话／原生控制；能打开固定测试页，操作浏览器自带页面缩放，并保留可见的 100%→200% UI 证据 |
| Safari 确认 100% | 48 | 实际安装版本与可响应、受支持的 Safari 会话／原生控制，记录缩放和键盘导航设置；不得用模拟 WebKit |
| Firefox 确认 100% | 48 | 实际安装位置／版本及可响应、受支持控制入口；若未安装由用户另行决定，本任务不安装、不改权限 |

每套 48＝Cedar Drawer／Maple Popup 两端 × 4 品牌／明暗组合 × 3 挂载目标（body／host／inline）× 2 内容长度。Safari／Firefox 额外 200% 不在这 144 组内。

共同要求：当前源码可加载的固定测试页、明确源码／fixture 快照；TOKEN_ACCEPTANCE_FROZEN=1 仅关闭 fixture watching，不冻结其他人工作。逐组记录主题／真实宿主／缩放／版本／前景背景／面板和关闭控件边界、滚动尺寸；实际验证打开关闭、长文滚动、Tab／Shift+Tab／Enter／Escape、宿主迁移、焦点约束／归还、滚动锁释放与相邻实例不受影响，保存截图和失败原因，结束恢复原缩放并只清理测试拥有的资源。

已有连接超时／Safari 入口超时、Firefox 标准路径未发现是 2026-10-13 历史观察，不是本轮安装或连接探测。没有获得环境变化证据，因此本轮未重复超时入口。恢复时需新建恢复证据，不覆写旧阻塞／失败记录。不得以 CSS zoom／transform、窄屏／DPR、pinch、文字缩放、JSDOM／Less／IAB／模拟引擎代替；不绕道 AppleScript／原始 CDP，不擅自安装或修改权限。

协议：refactors/token-validation/browser/README.md 的 Native zoom and Safari/Firefox resume protocol。

## 保留边界与下一步

当前可安全的只读核对与文档同步已完成。需日期负责人交接上述新范围，或用户明确限域授权后才能接管新的库存／hash／目录收口；不能为了全绿刷新证据。Map SDK 与原生环境按各自条件恢复，不妨碍未来其他不重叠源码事项。

Button 主色白字 on-dark 保留；默认明亮主色 2.305:1 是非 AA 设计例外，其他文本阈值不降低。自动化保持 PAUSED，无提交、推送、发布、子代理、新聊天或权限变化。

结构化证据：audits/evidence/full-closure-recheck-2026-10-20/results.json。10-19 结果保留为历史。
