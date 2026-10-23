# 第三十八批：时间范围秒级限制与键盘编辑端

北京时间 2026-10-14 13:02 开始，截止仍为北京时间 2026-10-15 00:00。保留两仓已存在的改造与 Token/其他聊天变更，不引入共享实例、公共兼容 API 或 platform 配置，不提交/推送/发布。

## 真实交互

- Cedar 与 Maple 将最小时间从 10:30:38 收紧到 10:30:40，仍保留原 38 秒模型，但纯面板确认按钮均禁用，不静默改写已有值。
- Cedar 输入 10:30:39→恢复38，10:30:40→提交40；结束端 10:31:03 越过最大 10:31:02，恢复02。
- Maple 原边界 Demo 为面板选择（input-editable 默认 false），没有把不可编辑输入计为失败；Demo 明确开启文本编辑后，最终构建复验同样得到39恢复38、40提交40、上界03恢复02。
- Maple 约束滚轮：分钟45与10:30的秒41为aria-disabled；秒40上按 ArrowDown跳过41到42，取消保持10:30:40–11:00:00。确认全禁用按钮确实切换为 Restore choices 后再开面板，全部小时禁用、Confirm disabled；取消后恢复候选，重新打开允许确认。未把关闭动画期间未命中开关的点击计为开关通过。

## 修复

Maple 移动 TimePanelContent 的起止标题与 DateRange 相同，原为 div 点击；改成 native type=button，aria-pressed 表示编辑端，覆盖滚轮与时钟两个插件展示。样式仅重置原生边框/内边距/背景/字体，保留已有 Token 与激活颜色，不修改 Token 文件或 PC 无对应移动插件。

Maple 中英 bounds Demo 开启 input-editable，不修改组件默认值（Maple false/Cedar true 已有文档）。中英文说明键盘与草稿协议，新增本地 patch changeset，不发布。

## 最终构建后真实验收

- Maple 原生端点：Enter 激活结束端，秒02→ArrowUp01；Space 取消仍40/02。重开 Space 激活起点，ArrowDown40→41，Enter确认提交41/02。
- Maple inline panel切换到clock，Enter激活18:00、Space激活09:30，aria-pressed正确；Valid confirmations仍0，模型仍09:30–18:00，切换端点不提交。
- 右侧 iframe 初始仍38/02，开启同一下限后文本40提交，再Enter激活起点/ArrowDown/Enter确认41；另文本42提交后右侧42/02，中间仍41/02，实例隔离正常。
- 证据：`/private/tmp/maple-time-range-clock-buttons-batch38.jpg`、`/private/tmp/maple-time-range-boundaries-batch38.jpg`、`/private/tmp/cedar-time-range-boundaries-batch38.jpg`。操作及模型回写为验收依据，截图仅为证据。

## 自动检查

- Maple 4 文件18项通过（含新增2项picker/clock原生按钮且不提交契约）；Cedar 2文件8项相关输入/TimeRange测试通过，共26项。没有把无匹配的筛选计为测试。
- Maple 完整文档构建通过：1007 Demo SFC/0失败、37.95s；全量 lint、修改范围 diff --check通过。Cedar沿用第三十六批最终完整构建，组件源码未修改。
- 未执行整库类型或 npm 包构建，不冒称通过。菜单/调研检查通过：72族（56已同源、15逻辑已同源、1独立），分类保持原状态，不把同源等同于全部交互完成。
- 已检查 Maple 时钟按钮和右侧边界截图，未把静态图本身计为交互。

尚未覆盖：跨日范围、所有12小时/步长组合、真实触屏惯性/取消、复杂Form组合。下一批继续跨日和显示/模型格式组合。
