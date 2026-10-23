# 第一百四十六批：Carousel 滚轮、特效与资源修复

2026-10-16北京时间。核对时间、145批、主记录和两仓变化。发现Carousel主体、生命周期Demo/测试及文档顶部有并行调度改造；本批保留这些修改，只操作原有Demo，修改原本干净的两个Cedar特效Demo及两端样式中的独立fade声明。文档增补在滚轮/特效小节，不覆盖调度章节。使用Vue最佳实践技能核对真实输入、可访问状态和资源测试。

## 历史记录纠正

主表及近期剩余清单误写“Carousel实际拖拽尚未验收”。重新读取32批原文，已有双端受控拒绝/接受的真实鼠标拖动，以及交互输入保值、自动播放独立停止恢复证据。本批不重复这些基本动作，不将其算新增覆盖。保留32批历史事实，主表改为更复杂拖动和触屏尚待。

## 真实浏览器与发现

- Cedar4185、Maple8080均为源码站，非最新生产构建。实际点击滚轮示例标题定位，截图后在图片区域执行原生向下滚动：两端活动页1→2，轨道分别translateX(-600px)/(-487px)。反向滚动回1，再次向上从首项循环至3，偏移-1200px/-974px。两端页面scrollY分别6314/7573，全过程保持，不是页面跳滚造成的假切换。
- fade指示器Enter选3：两端活动页3，其他页opacity0、aria-hidden=true及inert，活动页opacity1。card下一页Space选2：活动项opacity1、scale1，其他项opacity0.6、scale0.85。后续card指示器Enter选3、fade指示器Space选2，均更新aria-current。
- Cedar fade/card图片初始complete=true但naturalWidth=0，资源相对路径cat.jpg落到组件子路由。仅这两个Cedar Demo将表达式中的地址改为站点根路径；Maple同例原来能加载，不作无关修改。修复后两例三图naturalWidth为1440/1000/1920，两端最终图片均实际加载。
- 截图发现Maple fade图片只有约162.469px，而根容器487.40625px。DOM computed grid-area为1，track为3列；Cedar正常为1 / 1、单列798px。源码两端都是grid-area: 1 / 1，但Maple CLI Less3把斜线求值成1。
- 两端同一声明改为转义CSS字面量，保留各自样式副本。复验Maple grid-area为1 / 1、单列487.406px，全部slide和图片宽487.40625px；Cedar仍单列798px、三项图片宽798px。无platform配置或共享运行时，不改调度主体。
- 文档更新后重新操作特效按钮保存截图：[Cedar fade](./evidence/cedar-carousel-fade-batch146.png)、[Maple fade](./evidence/maple-carousel-fade-batch146.png)、[Cedar card](./evidence/cedar-carousel-card-batch146.png)、[Maple card](./evidence/maple-carousel-card-batch146.png)。修复后fade截图覆盖更新，实际宽度另以上述DOM记录为准。

## 验证与文档

- 新增Cedar两个真实Demo资源路径回归、双端各一个使用本地Less编译的fade布局回归，共4项新增。Less编译测试不能冒充浏览器视觉，修复依据是实际几何和截图。
- 最终Cedar7文件47项、Maple6文件46项共93项通过，其中包括工作区既有调度生命周期测试，不把其并行修改归功于本批。
- 第一次Cedar新增Demo测试因静态src=/cat.jpg被Vitest资产转换当作模块导入而失败，并伴fsevents退出警告。保留原Demo的动态绑定写法、只更正地址后重跑全套通过，未关闭资产转换或放宽断言。真实浏览器此前已验证地址能加载。
- Cedar受影响Demo/新增测试lint通过；Maple最终全量lint退出0，包含新增测试。docs:check为1039 SFC、0失败。无组件公开类型改动，不跑全库typecheck。
- Cedar中文、Maple中英文特效/滚轮章节增补；纠正主审计待验项。菜单/调研分类检查72族通过，仍56已同源/15逻辑已同源/1独立，不把局部验收升级为全部完成。
- 完整文档构建仍沿145批核对的未变Token解析阻塞，不重复无变化构建、不接管Token任务。两仓及审计diff --check通过。临时浏览器页收尾关闭，不提交/推送/发布。

## 当前覆盖与后续

有独立部分证据仍72/72（100%），双端部分68/72（94.4%），无独立记录0；不是全部Demo/场景完成率。本批没有新增族名计数。

基本鼠标拖拽已见32批，不再列为完全未做；真实触屏、复杂多视图拖动、fade/card拖拽、滚轮与表单控件/禁用/快速竞争组合、并行生命周期Demo真实路由停用等仍待。Ripple鼠标等既有缺陷继续按安全窗口处理。
