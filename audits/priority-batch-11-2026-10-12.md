# 第十一批：当前日期与范围交互策略

日期：2026-10-12。范围：两端 Date / DateRange / DatePicker / DateRangePicker，以及 Cedar 的旧 ConfigProvider.exchangeTime 覆盖。

## 完成

- showCurrent 统一为当前日/月/年高亮，默认 true；通过独立复制的实例上下文传递。高亮变化不修改模型。
- showNowButton 为 DatePicker 单选当前动作，默认 true；删除旧 showNowBtn，范围不接受该 Prop，多选不显示。
- 当前候选按面板 type、时间精度和 valueFormat 生成。Date/timestamp 日期归零时分秒，月/年/季度取周期起点，周按本实例 dayStartOfWeek 计算，分钟精度清零秒和毫秒。
- 当前动作走日期/时间禁用、包含边界、readonly/disabled 和统一选择/确认事务；disableConfirm=false 只产生草稿，确认后提交。挂载不自动写模型。
- 确认与当前动作放回共同日期所有者，DatePanelActions 独立复制。actions 插槽为 confirm/disabled/selectNow/nowDisabled，并只渲染一次。
- 两端使用各自全局 Locale 系统，差异只在本地 use-panel-actions-locale；Maple 五份语言字典补齐 Now 文案，Demo 不引入 t/use。
- normalizeDateRange 独立复制，只处理渲染器交互候选。exchangeTime=true 交换整个日期时间端点，false 交换日期并保留起止时分秒；最终继续校验端点和锁定状态。
- 外部模型、手输值、快捷项保持原来的严格顺序校验，不自动重排。保留时间位置后同日时间仍逆序的候选不能提交。
- Maple 日期时间范围接收未排序的日历候选，合并起止时间后再使用公共算法；不提前丢失时间归属。嵌套 datePickerProps 不接受或覆盖 showCurrent/showNowButton。
- Cedar 删除 ConfigProvider 的单端 exchangeTime 覆盖，范围策略由面板定义，不保留兼容入口。
- 当前/范围中英文 Demo、文档、发布类型正反例、两端 major changeset、OpenSpec 与调研/菜单同步；复制门禁 33 个唯一文件对，增加重复条目断言。仍为 logicSame，没有宣称旧日历主体/外观全部一致。

## 验证

- Cedar 日期 DOM/逻辑回归原 74 项，加精度测试后 75 项；独立 SSR 4 项，共 79 项。ConfigProvider 另 1 项通过。
- Maple 最终全日期族 15 文件 111 项通过；嵌套当前选项收紧后另复验当前渲染器和范围展示用例。
- 本批配对控制器/所有者 15 项、实际日历 3 项（高亮独立、反序范围两种时间策略）均通过；入口 6 项覆盖旧名删除、范围无当前按钮和 actions 单次渲染。
- 两端源码类型检查、npm build:lib、发布声明消费者验证；消费者新增当前/范围 Boolean、旧名、范围错误当前动作和 Cedar 错误全局覆盖正反例。
- Cedar 日期及 ConfigProvider scoped ESLint、Maple 全量 lint:check；公共导出审计均无缺失。
- Maple 990 份 Demo SFC 编译、Cedar 新 Demo script/template 编译通过。
- 33 对独立源码/测试门禁通过，调研与菜单元数据检查通过。门禁不消除真实 presentation 差异。
- CSS 变量契约通过：64 共享系统 Token / 57 系统值 / 1057 组件值 / 49 组件契约。未新增 CSS Token，3 份生成参考匹配。
- 发布样式依赖图：Cedar 96 入口/98 Less，Maple 91/93，无环、缺失依赖或重复内嵌基础样式；foundation 与 Loading 仅一次。首次检查与 Maple 编译并行时读取尚未生成的 icon/style 失败，等待构建完成后复验通过。
- 本批路径 git diff --check 验证；原有未关联变更保持不动。
- Cedar 旧 Vitest SSR 与 DOM 分进程执行；部分退出 0 的运行仍有 close timed out 提示，未跳过断言。
- 未执行真实浏览器视觉/触屏验收或整站生产文档构建；SFC 编译及 jsdom 测试不替代这两项。

## 下一批

月份标签已在[第十二批](./priority-batch-12-2026-10-13.md)完成；标题、Locale 与嵌套选项继续收口。

继续日期标题、月份/星期 abbreviation 与 Locale 边界，以及嵌套展示选项精确化。Cedar 周/季度与 Maple presentation、触控及日历外观仍为实际平台能力差异，后续独立评估，不机械加入空 API。

71 族仍为 55 same / 15 logicSame / 1 separate；状态数量不代表所有 API 和样式差异归零。
