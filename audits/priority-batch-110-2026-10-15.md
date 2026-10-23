# 第一百一十批：两端 Tabs 动态增删与键盘切换

本批由定时续跑实际触发。先核对第 109 批和两仓变化，复用源码开发站 Cedar 4185、Maple 8080，不重复启动服务；无新生产构建通过声明。

## 浏览器实际交互

- Maple `#/zh-CN/tabs?audit=110-source` 中间可编辑 Demo：初始标签 1、标签 2、固定标签共 3 项；点击 Add tab 后变 4 项，标签 4 的 aria-selected=true，唯一可见面板是“标签 4 内容”。按 Delete 删除该项后恢复 3 项，只有标签 1 激活、可见面板“标签 1 内容”。在固定标签上按 Delete，数量仍 3，没有误删。
- Maple 受控步骤 Demo：点击外部“切换到下一步”，第二步激活、面板“确认信息”；点击第一步后面板“填写信息”；再点击外部按钮又到“确认信息”，说明点击也回写了父级 active，而不只是组件局部外观切换。[Maple 受控回写证据](./evidence/maple-tabs-batch110.png)。
- Cedar `/components/tabs/?audit=110-source` 动态增删 Demo：初始 Tab 1–4 共 4 项；点击 Add tab 后新 New Tab 5 激活，唯一可见面板为 Content of New Tab Panel 5。该标签按 Delete 后恢复 4 项，回到 Tab 1 面板；Tab 3 不可关闭，Delete 后仍保留 4 项。
- Cedar 完整组合 Demo：概览按 End 后选择详情，末尾不可用项仍 disabled=true、aria-selected=false；详情按 ArrowRight 跳过禁用项循环回概览，唯一可见面板“概览内容”。[Cedar 键盘跳过禁用项证据](./evidence/cedar-tabs-batch110.png)。

以上从真实输入动作、原生 aria-selected/disabled 与可见 tabpanel 核对，不读取 Vue 内部状态。首次加载较慢，等实际控件出现才操作。固定标签 Delete 的动作只证明没有误删，不把聚焦等同于已激活。

## 验证和同步

- 两端各 5 文件 39 项 Tabs 专项测试通过，共 78 项；自动测试的其他方向/配置不冒充浏览器覆盖。
- 两仓 git diff --check、菜单/调研一致性检查通过。仍为 72 族：56 已同源、15 逻辑已同源、1 独立，Tabs 分类不变。
- 未发现需修复的新缺陷，无源码/API/CSS 或 Demo 变更。现有两端文档已说明动态增删、受控 active 与键盘，保留中英说明；本批新增证据并将 Tabs 加入主验收表，不覆盖并行 Token/NavMenu 等修改。无源码变化未重跑类型、lint 或完整构建，完整构建阻塞不视为解除。
- 部分交互证据组件数增至 39/72（54.2%），其中双端部分记录 35/72（48.6%），尚无独立族级记录 33/72（45.8%）；不是整库场景完成率。
- 未覆盖 Maple 该禁用项分支、右侧实例、真实触屏 swipe、manual 激活模式、溢出滚动、全部 lazy/destroy 状态组合及受控拒绝。未提交、推送或发布。
