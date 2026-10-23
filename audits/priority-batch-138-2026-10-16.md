# 第一百三十八批：日期面板导航名称与语言响应

2026-10-16北京时间。先检查时钟、137批和两仓变化。保留两端在途DatePanelActions/rejected-close/date-current-range改动，不修改这些文件。使用Vue最佳实践技能补响应式语言与禁用测试。继续复用Cedar4185、Maple8080源码站。

## 修复

- Maple PanelHeader纯图标上/下按钮补aria-label，日面板按月、月面板按年、年列表按年份组命名。接入现有全局Locale，局部LocaleProvider对应键优先，缺键回退全局；不新增platform或组件API。
- Maple内置简中、英文、繁中、日文、波斯文补6个导航翻译键，港繁继续复用繁中；Message类型同步。没有硬编码在模板，不借用Carousel或Pagination不相干文案。
- Cedar原来四个导航名称写死中文，改为useI18n计算值；月/季度面板和年份列表单箭头按实际单位命名。两个内置语言包与CedarLang类型同步。
- 保持两个独立presentation文件，不强行复制不同布局实现，不共享运行时。没有改变值/草稿/确认/边界策略。
- 中英组件文档补导航名称来源、局部回退与边界语义。菜单/调研72族校验通过，56已同源/15逻辑已同源/1独立，分类不变。

## 真实浏览器

- Maple中文entry-boundary移除限制，通过名称“下一月”按Enter，预览2025年3月，模型仍2025-02-12；Cedar中文“下一月”Space也可导航，不仅检查新增属性。
- Maple顶部语言选择English后英文Demo重新挂载，移除限制，再通过Next month按Space到March 2025，已提交仍2月12。Cedar通过顶部English链接进入英文站，按钮可访问名称实际变Previous/Next month/year，Next month Enter可继续导航。
- Maple在3月恢复Apply limits，Next month实际disabled、Previous month仍可返回合法2月，读到isEnabled分别false/true。没有用强制点击或脚本派发绕过禁用。
- Maple移除限制后点击已有日期标题进入月份列表，箭头名称为Previous/Next year；Next year Enter预览2026，已提交仍2025-02-12。再点击年份标题进入年份列表，名称变Previous/Next years。年份组按钮本轮没有实际推进，不声称组翻页已浏览器通过。
- 最后文档HMR后重新操作英文Next month，两端预览分别March/April、父级模型仍2月12；日期不同来自本轮前序预览次数，不是模型漂移。[Maple证据](./evidence/maple-date-navigation-batch138.png)、[Cedar证据](./evidence/cedar-date-navigation-batch138.png)。两端error级日志为空。
- 本批未在右侧iframe重复全部步骤，不沿用上批证据扩大右侧覆盖。没有修改组件状态或注入DOM事件。

## 验证与进度

- 新增Cedar1项：运行中语言切换、导航回调、month/year模式对应名称；Maple2项：语言/模式/禁用不发事件，以及局部覆盖/缺键回退。首轮两库都因测试未注册英文包失败；按正式addI18nMessages/Locale.add注册后通过，不关闭断言。
- Cedar新增1+基础1=2项；Maple新增2+picker基线19=21项，总23项通过。局部LocaleProvider覆盖与禁用事件次数是自动测试，不冒充浏览器/读屏验收。
- 两端typecheck退出0；Cedar受影响源码/测试/语言包lint通过，Maple全量lint退出0，最后测试注册变更另做单文件lint。Maple docs:check检查1037个Demo SFC、0失败。两仓和审计仓diff --check通过。
- 完整文档构建未重复：132批Token解析阻塞源此前核对无变化；本轮不是生产构建产物验收，不接管Token工作。
- 本批扩展既有DatePicker记录，不增加族数：部分63/72（87.5%），双端59/72（81.9%），无独立记录9/72（12.5%）。不等于全部配置或整库完成。
- 待验：真实读屏输出、日文/波斯文/繁中浏览器、局部Provider与全局切换同时变化、年份组实际键盘翻页、触屏、年/季度边界矩阵。Cedar英文星期表头截图存在拥挤，属于视觉待复验，不在本批认定主题/布局全通过。
- 未提交、推送或发布，收尾关闭临时浏览器页。
