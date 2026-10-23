# 第一百七十批：补齐 Cedar Tag 独立交互证据

## 范围

- 先检查当前时间、169批、主表及相关两仓变化；Token构建阻塞文件hash与169批一致，不接管或反复重跑同一已知失败。
- 主表Tag此前只有Maple关闭和选中记录，本批优先补Cedar，沿用checkable/closable/dynamic-tag三个已有Demo，不新增Demo、不改组件内核/API/样式/platform文件。
- 使用Vue技能补真实组件Demo回归。Cedar说明补键盘、自持/受控边界、loading与动态示例操作；Maple中英同步公开行为边界，不将文档同步或自动测试当作Maple本轮浏览器键盘验收。一次文档补丁因英文标题不匹配原子失败、未落盘，核对真实标题Closable后重新成功。

## 浏览器实际动作

Cedar4185中文源码站，CUA真实输入/按键/点击，DOM只读核对：

1. “点击选中”初始aria-checked=false，Space变true，Enter回false；最终再Space变true。未传checked的Demo自持状态，没有外部父级模型，不描述为受控回写验收。
2. “加载中”项初始aria-checked=true，实际Space和Enter后仍true，没有发生选中切换。
3. 点击Add Tag后原生input获得焦点，输入audit-170并Enter：新增项恰好1个，输入消失；关闭按钮Space后仅该新增项消失。
4. 动态Tag 2关闭按钮Enter后，动态组仅Tag 1、Tag 3及Add Tag；Tag 1没有关闭按钮，Tag 3保留。页面基础示例另有同名Tag 2，因此全页同名数量由2到1，不把基础项误算动态组残留。
5. 可关闭示例两个文字Tag的项目，点击其中首个关闭按钮后数量2→1，动态组保持Tag 1/Tag 3/Add Tag。
6. evidence/cedar-tag-batch170.png已保存并查看：动态剩余项、选中标签与加载项可见；临时页已关闭。

本批未发现新组件缺陷。Maple本轮仅现有测试复跑，不重复冒充已做浏览器动作；历史Maple基本交互证据仍有效，但不能据此声称两端同一完整键盘/受控矩阵通过。未做受控拒绝浏览器、长按、异步、触屏或标签关闭焦点恢复的完整验收。

## 验证和计数

- Cedar新增2条已有Demo回归：键盘选中/加载保护、动态新增一次与关闭隔离。Cedar Tag3文件11项、Maple2文件18项，共29项通过；Cedar新增测试ESLint、Maple全量lint:check通过；Maple docs:check 1046个SFC、0失败；两库及审计仓git diff --check通过。
- 无组件内核、公开类型或Demo源码变化，未重跑完整typecheck；未把源码站记录当新完整生产构建站验收。
- 菜单component-reuse-sync --check通过，72族分类不变：同源56（77.8%）、逻辑同源15（20.8%）、独立1（1.4%）。
- Tag新增Cedar独立记录，双端部分证据从68/72增至69/72（95.8%）；至少一端部分仍72/72（100%）。剩余3族缺少双端独立记录；这不是全场景完成百分比。
- 未创建代理/子任务、未提交/推送/发布；保留其他任务变更。
