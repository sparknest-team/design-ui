# 第一百三十二批：两端完整文档构建复核（仍阻塞）

2026-10-15 23:15北京时间开始。核对131批及两仓变化；近期Demo/文档已有调整，重新检查根目录正式构建链。使用Vue最佳实践技能核对Vite SFC模板解析，不修改并行Token工作。两端串行运行以避免同时完整构建的峰值内存压力。

## 真实构建结果

- Cedar根目录`pnpm build:doc`，exit 1。VuePress准备数据49.30s后进入Vite，5.44s失败。生成文件`packages/ui/docs/.vuepress/.temp-build/pages/guide/design-tokens/index.html.vue:69:198`报Element is missing end tag。
- 对应原文`packages/ui/docs/guide/design-tokens.md:146`，普通段落中的`Promise<void>`未包代码标记，生成HTML中仍为裸泛型，被当成未闭合void标签。不是本批组件Vue语法错误或堆内存OOM。保留[完整日志](./evidence/cedar-doc-build-batch132.log)。
- Maple根目录`pnpm build:doc`，exit 1。前置maple-vite-plugins ESM/DTS构建、CLI tsc通过，1037个Demo SFC语法检查0失败；生产Vite转换343模块后4.71s失败。
- Maple报`docs/designTokens.en-US.md (72:426): Element is missing end tag`，这是转换模板位置；对应原始英文文档第145行同样裸`Promise<void>`。保留[完整日志](./evidence/maple-doc-build-batch132.log)。未把前置语法检查通过写成完整文档通过。
- 两端失败后均未有成功生产产物可复验；不启动旧dist冒充新构建，不更改开发站或用户其他终端进程。

## 后续重试条件

两份Token原文修改时间均为2026-10-15 19:57:04。记录本轮SHA-1仅用于变化检测，不作为安全校验：

| 原文 | SHA-1 |
| --- | --- |
| Cedar docs/guide/design-tokens.md | 4102526468bfddb774382ad75ec9a55d5766bf62 |
| Maple docs/designTokens.en-US.md | aaf1ea4f67aaa413c3271ef442a8ac373af5ed27 |

后续先比对这两份文件内容指纹；未变化时继续其他安全Demo验收，不重复跑同一已知失败。相关文档修复或构建链发生实质变化后，再运行完整构建并对成功产物进行浏览器复验。普通组件Demo更新不代表这个阻塞已消失。

按本聊天授权边界，不接管Token任务，不把裸泛型转义写回并行文档；这里只记录准确阻塞和证据。

## 状态与范围

- 无本批组件源码/API/样式/Demo修改，无新增浏览器或自动组件测试，不虚增覆盖。构建前置工具产物没有新增tracked diff；保留既有脏仓库。
- 菜单/调研元数据检查通过：72族、56已同源、15逻辑已同源、1独立；无分类变化。
- 两库及审计仓diff --check通过。未提交、推送或发布。
- 部分交互记录仍58/72（80.6%），双端54/72（75.0%），尚无独立记录14/72（19.4%）；不是所有组件/配置验收完成率。继续剩余组件族及已列出的深层交互，不因构建阻塞停止安全的源码站验收。
