# 第九十七批：Upload 读取替换后的四类约束

## 示例与文档

- 两端替换校验 Demo 从“原文件复制后再选择文件”的单一路径，改为通过公开 `useUploader.addFiles` 加入合成图片，实际执行 before-read 和队列约束，再由 Upload 展示受控结果。没有改 Upload 运行时或增加公共 API，也没有调用私有实例方法。
- 提供小图片、替换为文本、替换为超大图片、768 KiB 图片和重置入口，显示队列和确切拒绝原因。使用 resolve-type=file，不生成预览 URL，不发送请求，也没有调用已知会阻塞的原生文件选择器。
- Cedar 中文、Maple 中英文 Demo 与文档同步；Maple 英文小节使用可读标题 Validation after replacement。
- Maple 的 Demo 检查原本将公开 useUploader 函数误判为模板组件导入。已将它加入 programmaticApis 的明确允许列表；模板组件和深层导入限制保持原逻辑，重新检查 1032 个 Demo SFC 无失败。

## 新构建站真实交互

Cedar `/components/upload/?audit=97-built` 与 Maple `?audit=97-built#/zh-CN/upload` 分别实际点击并核对列表和拒绝反馈：

1. 加入小图片后列表为 1 项、拒绝原因“无”。替换为文本后列表仍为 1、原因 accept；替换为超过 1 MiB 的图片后仍为 1、原因 max-file-size。
2. 重置后加入两张 768 KiB 图片，列表为 2、无拒绝；第三张被 max-total-size 拒绝，列表仍为 2。
3. 重置后加入四张小图片，列表保留 3、原因 max-files；点击删除一项再加入小图片，列表恢复 3、拒绝原因清空。
4. 最后重置，列表为 0、拒绝原因“无”。两端结果一致。

Maple 首次导航出现动态模块 fetch 失败；核对本地生成的路由模块及其静态依赖均存在，使用浏览器正常重新加载后页面恢复，随后上述所有操作完成。本批没有确定该首次加载失败的根因，未把首次打开记为通过。

## 自动验证与边界

- 新增对实际 Demo 的回归：Cedar 1 组、Maple 中英文 2 组通过，涵盖替换类型/单文件大小、合计大小、数量和删除释放名额。
- Cedar 受影响 Demo/测试 lint、Maple 全量 lint:check 通过；允许列表补充另经定向 ESLint 通过。两端 git diff --check 通过。
- 两端完整 build:doc 通过：Cedar 274 页；Maple 1032 个 Demo SFC 无失败、Vite 构建成功（保留大分块提示）。菜单/调研分类不变，Upload 仍为逻辑已同源。
- 本批覆盖公开合成文件入口对应的 before-read 和约束管线，不等同于原生文件选择、实际 FileReader/data-url、before-upload 替换或触屏拖放验收；这些尚未由本批验证。未提交、推送或发布。
