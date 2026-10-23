# 第一百零七批：修复两端文本长度截断拆开 emoji

## 构建站发现的问题

第 104 批构建产物真实操作复现：Cedar 长度 10 文本域填入 `123456789😀Z`，结果为 9 位数字加未配对的高代理码元（显示为 �）；Maple 长度 100 文本域填入 99 个 a 加 `😀Z`，结果长度 100、末尾码元 55357（0xD83D）。Cedar errorOnly 对照保留完整原文、计数 12/10、aria-invalid=true。

原因是两端独立复制的 normalizeTextInputValue 默认直接按 UTF-16 下标 slice，在有效代理对中间截断。不是浏览器挂载问题，也不是字体缺失。

## 修复和说明

- 两端各自 text-input-value.ts 保留 UTF-16 长度预算，默认截断末尾若是高代理且下一码元为低代理，则回退一个码元，不留下半对字符。工具和测试独立维护、没有跨库运行时引用。
- 不更改 errorOnly、自定义 wordLength/wordSlice 或数字格式化协议；自定义裁剪仍由业务负责。此修复不是字素簇分割器，组合符/ZWJ 字素簇仍需自定义成对的计数和裁剪函数。
- Input、Textarea 共用各库自己的 useInputValue，AutoComplete 也调用此工具；两端同步修复基础层，不在 Textarea 单独补分支。
- 两端 Input/Textarea 中文文档及 Maple 对应英文文档明确 UTF-16 计数、代理对安全截断及字素簇扩展。Textarea 长度 Demo 中文及 Maple 英文同步增加提示，无 CSS/Token/API 变更。

## 修复后的真实源码站复验

两端完整生产构建因其他工作中的 Token 文档解析错误失败，故本次修复后浏览器证据来自源码开发站，不声称新生产构建验收通过。

- Cedar `http://127.0.0.1:4185/components/textarea/?audit=107-source`：输入 `123456789😀Z` 得 `123456789`、9/10；输入 `12345678😀Z` 得完整 `12345678😀`、10/10。errorOnly 输入原超长文本保留完整值、12/10、aria-invalid=true；改为 `ok😀` 后 4/10、aria-invalid 清除。默认截断项清空后 0/10，再输入 `ok😀` 得 4/10。[Cedar 边界与 errorOnly 证据](./evidence/cedar-textarea-batch107.png)。
- Maple `http://127.0.0.1:8080/#/zh-CN/textarea?audit=107-source`：99 个 a 加 `😀Z` 得 99 个 a、99/100；98 个 a 加 `😀Z` 得完整 emoji、100/100。点击清空后空值、0/100，再输入 `ok😀` 得 4/100。[Maple 完整 emoji 证据](./evidence/maple-textarea-batch107.png)。现有 Maple Demo 无 errorOnly 分支，未将 Cedar 对照计为 Maple 此分支浏览器通过。
- 开发页首次加载较慢，等待实际控件出现后才操作，不把空页面计为通过。浏览器只读 DOM 核对原生值、计数和错误属性；模型通知另有组件回归断言。

## 验证及未完成项

- 定向运行基础归一化、Unicode Input/Textarea 集成，以及 Input/文本管线/Textarea/AutoComplete 现有测试：Cedar 9 文件 99 项、Maple 10 文件 116 项全部通过。新回归验证半对边界、整对边界、容量 1/2、errorOnly、自定义裁剪和组件 update:modelValue 的安全值。
- 两端 typecheck、Cedar 本批文件 scoped ESLint、Maple 全量 lint:check 通过；两仓 git diff --check 通过。
- 76 份基础复制门禁及 Input/Textarea 24 对主体/API/样式/测试/Demo 门禁通过。菜单/调研检查通过，72 族（56 已同源、15 逻辑已同源、1 独立），分类不变。
- 两端完整 build:doc **失败**：Cedar 编译 `docs/.vuepress/.temp-build/pages/guide/design-tokens/index.html.vue (6:198)` 提示 Element is missing end tag；来源 `packages/cedar-ui/docs/guide/design-tokens.md`。Maple `packages/maple-ui/docs/designTokens.en-US.md (8:426)` 同样缺结束标签。两者均在并行 Token 工作改动范围，未修改、回退或接管。Maple Demo SFC 预检仍为 1036 个、0 失败。待 Token 文档工作完成后必须重跑完整构建及新产物浏览器复验。
- 真实 IME、ZWJ/组合符自定义字素簇、手动 resize、触屏和 Maple errorOnly 浏览器仍未覆盖。保留脏仓库和其他聊天变更，未提交、推送或发布。
