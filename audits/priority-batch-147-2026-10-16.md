# 第一百四十七批：Upload 动态只读、禁用与恢复

2026-10-16北京时间。先检查时间、146批、主表及75/77/78/96/97/98批Upload记录。取消/重试、替换准备及Maple静态只读已有证据，本批不重复计数，补动态开关组合。两仓目标README、旧Demo和部分测试已有前批/其他在途变更，全部保留；新增独立state-controls Demo与测试，仅在文档独立小节和Maple集合增加入口。不修改Upload运行时或API。

## Demo范围

- 两端各自保存相同父级状态逻辑，只改组件前缀；预置合成SVG的data URL，不使用本地文件、凭据或外部业务服务。
- readonly/disabled原生复选框动态传入Upload；选择入口通过公开request-choose回调计数，不调用chooseFile，不打开文件选择器，也不上传。Restore sample仅替换父级数组，不伪称Upload reset行为。
- 新示例不承诺触屏、异步请求或原生读取覆盖。使用Vue最佳实践技能核对ref绑定、父级模型和事件反馈。

## 浏览器实测

Cedar4185、Maple8080源码站，非新生产构建：

1. 两端实际点击/Enter选择入口，choose从0→1，没有出现文件框。开启Readonly后选择入口不可用、删除按钮不可用，预览仍可用。初始locator误用Cedar的“点击上传”名称查找Maple，实际Maple名称为“上传”；读取新DOM后按实际名称操作，不改文案掩盖测试失败。
2. Readonly时预览Enter打开合成SVG，preview0→1；Escape关闭，等待预览节点detached。随后叠加Disabled，两端预览/删除都不可用，原文件保持。
3. 解除Disabled但保留Readonly后，Space预览再次打开，preview1→2；Escape后预览层再次卸载。这里验证了限制解除恢复，而非只看disabled属性。
4. 解除Readonly，Space删除后实际父级Files1→0；Restore sample按Enter后恢复1，再以Enter/Space激活选择回调。最终两端Files1、choose2、preview2。没有真实文件上传或删除用户文件。
5. Cedar另一次尝试对Readonly选择入口按Enter被浏览器工具的disabled语义阻止/超时，未计为实际键盘拦截分支通过；重新观察确认isEnabled=false。只报告不可用状态，不用强制事件绕过限制。
6. Maple右侧iframe独立选择回调、开启Readonly、预览Enter与Escape清理，右侧Files1/choose1/preview1；中间仍1/2/2，状态独立。此为桌面浏览器移动预览，不是物理触屏验收。
7. 最终中间再开启Disabled，保存检查[Cedar证据](./evidence/cedar-upload-state-batch147.png)、[Maple证据](./evidence/maple-upload-state-batch147.png)。未注入页面状态或合成事件。临时页收尾关闭。

## 自动验证与同步

- 新增两端各1项实际Demo绑定回归，核对readonly/disabled独立、父级空数组与恢复。测试内主动emit只用于验证父级模型绑定，不冒充真实删除；删除浏览器证据为上面的第4步。
- 当前Upload Cedar7文件50项、Maple7文件81项共131项通过；包含既有准备/队列/约束回归，不把其已有修改或数量归为本批新增。
- Cedar受影响Demo/测试lint通过，Maple定向格式化后最终全量lint退出0；docs:check1040 SFC、0失败。Maple集合沿用既有english状态，未引入未定义language；没有关闭规则。无公共类型变更，不重跑全库typecheck。
- Cedar现有中文README、Maple中英文文档增加动态状态边界，Maple右侧集合增加双语标题；Cedar Upload原本没有英文README，本批不虚称已同步不存在的文件。新Demo原生控件使用一致英文标签，不引入局部locale t/use。
- 菜单/调研72族校验通过，56已同源/15逻辑已同源/1独立不变，Upload仍逻辑已同源。两仓与审计diff --check通过。
- 完整文档构建的Token阻塞文件再核对SHA1均未变化（Cedar4102526468bfddb774382ad75ec9a55d5766bf62、Mapleaaf1ea4f67aaa413c3271ef442a8ac373af5ed27），不重复无变化构建、不接管Token任务。截图不当生产认证。

## 覆盖与剩余

部分独立证据仍72/72（100%），双端部分68/72（94.4%）；不是全场景完成率。本批只新增动态保护/恢复组合，不增加族计数。

Upload异步headers/data与晚返回transport句柄、准备阶段合计大小并发、原生FileReader/文件选择、真实触屏拖放及高级Form继承竞争仍待。静态只读/预览已存在的旧记录继续保留。未提交、推送、发布；无共享实例或运行时。
