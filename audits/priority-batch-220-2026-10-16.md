# 第二百二十批：Upload 全量一致性与日期范围动态规则

2026-10-16 北京时间。用户授权优先处理Upload差异、保留并行改动且不改Token语义，再继续可执行场景；自动化保持暂停。不创建子任务/代理，不提交、推送、发布。先核对时钟、27/219批、两仓状态及Vue技能/仓库规范。

## Upload 一致性修复

- 原门禁重跑确有四组差异：use-uploader停用清理顺序、Token .56/0.56、queue-request和replacement-validation的本地包导入；修复首层后又显露两个Demo文本周围的换行空格差异。
- Cedar停用清理统一为inactive/generation失效→adding新Promise链→removals.clear，保留两端并行增加的队列解锁、取消请求等全部逻辑；不复制覆盖文件，不移除并行新增内容。
- Cedar disabled-opacity仅从.56改写为0.56，Token名、值、角色、引用关系和主题语义不变。Maple Token未改。
- 门禁只在TS ImportDeclaration的精确模块名中映射@cedarjs/ui至@maplejs/maple-ui；Demo继续导入各自本地包。其他包/子路径、业务字符串、语句顺序、Token值和回调行为仍严格比较，未跳过配对或忽略运行时差异。
- Cedar两个Demo局部对齐模板文本的排版空格，保留本地请求模拟、队列/缩略图Promise、清理和所有并行状态控制。不改Maple既有Upload源码。
- node bin/upload-core-check.mjs：20对SFC/Props/Types/样式/测试/Demo全部通过；不是整个目录及全部配置行为的完成声明。新增3项门禁正反向测试通过，覆盖根包映射、拒绝未知包/子路径/业务字符串、清理顺序或解锁缺失、Token数值改变及成功/失败回调交换仍失败。新增门禁回归接入check:media-core，防止未来只跑正向源码比较。
- 两端Upload各4文件回归通过：Cedar45项、Maple48项，覆盖core-contract、queue-demo、validation-demo、remove-demo；未以单测冒充浏览器验收。此前中途口头“各45项”由本条更正。

## 新增真实开发站验收：日期范围草稿后的规则变化

- 沿用两端entry-boundary纯范围面板，增加可关闭的“禁用20日结束”复选框和disabled-date回调；原默认行为、字段实例、边界开关、Maple周起始日控制保留。Maple英文Demo与双端中英文说明同步。
- Cedar4185/262页、Maple8080/263页均首次导航等待超时，复用原页读到实际组件后才操作，不把超时或挂载算通过。两者均源码开发站，不是生产产物。
- 初始已提交2025-02-12~14。真实选择10与20，提交可用但父模型仍12~14；打开禁用后提交立即不可用、父模型不变。
- Cedar两日历20日的aria-disabled分别false/true、tabindex分别0/-1，禁用仅作用结束端。Maple单活动日历没有借用Cedar端点结论。
- 解除禁用后提交可用，模型仍12~14；Cedar Enter、Maple Space显式确认后才写10~20。
- 再启用禁用，保留已提交10~20且提交禁用；真实重新选10与21、确认后两端均写10~21，新合法事务恢复，不被旧非法候选卡住。
- 没有发现需改日期组件内核的新缺陷；两端各新增1项真实面板Demo回归，另保留端点锁定5/6项回归，共13项通过。新增用例补入后半恢复路径后又各重跑1项通过，不重复加计。
- 截图已查看并归档：evidence/cedar-date-dynamic-batch220.png、maple-date-dynamic-batch220.png。Maple右侧iframe未操作，不将中间Demo证据推及该实例/物理触屏。

## 最终检查与新生产产物

- Cedar Upload与DateRange受影响源码/Demo/测试最终ESLint通过；Maple本轮受影响DateRange最终ESLint通过。新增日期测试后两端最终类型通过。Maple全量lint:check首轮通过，40082在并行Form新增/更新期间因6处格式/解析错误退出1；保留其他工作不接管。观察到Form导入已更新后51585只读复查退出0（/private/tmp/maple-lint220-recheck.log），没有替其他工作改文件或使用--fix。
- 菜单元数据--check通过：72族，同源56/72（77.8%）、逻辑同源15/72（20.8%）、独立1/72（1.4%）；双端至少部分交互72/72（100%）不变，不是全场景或本清单完成率。无新菜单项，不重复生成分类文件。
- 两端最新完整文档构建退出0：Cedar64313 /private/tmp/cedar-docs220.log，274页、485.21s；Maple22202 /private/tmp/maple-docs220.log，1050 Demo语法0失败、Vite 1m38s。保留既有chunk体积/旧工具弃用告警，不声称零警告。
- 本机生产静态站Cedar4191(dist)、Maple4192(site)分别在已完成构建后复验：10~20草稿后启用结束日禁用，确认禁用且模型12~14不变；解禁不自动回写，Enter/Space确认写10~20；再次禁用保留已提交值，重新选择10~21并确认成功。不是重复计算开发站为新的配置。
- Cedar新产物另外回归Upload KeepAlive：等待删除时停用、旧确认返回后文件1/等待0/钩子1/remove0；激活后新删除确认文件0/等待0/钩子2/remove1。保留的队列清理和旧任务失效协议正常。
- 生产证据已查看并归档evidence/cedar-date-prod-batch220.png、maple-date-prod-batch220.png、cedar-upload-prod-batch220.png。Maple首次静态导航早于Python监听就绪而连接拒绝，263错误页不计通过；其data URL被安全策略拒绝重新绑定，不绕过策略，新264页在监听就绪后完成复验。
- 三仓git diff --check通过。受设备/输入限制的Scheduler持按取消/失焦/禁用/源行卸载、Carousel持按中变化及Maple物理触屏仍待验；其他日期范围交叉组合未穷举，不宣称全部配置完成。
- 自动化磁盘状态PAUSED，不恢复；保留原共享开发服务。本轮业务页262/264和静态服务收尾关闭；263错误页未标保留，交由回合结束自动清理。未提交、推送或发布。

收尾补充：check:media-core通过现有npm run执行退出0，包含3项门禁回归、Carousel12对、Upload20对；直接pnpm执行曾因尝试创建全局10.23.0工具缓存被沙箱拒绝，并非门禁失败，没有安装/下载工具或改packageManager。临时静态服务75863/69705中断后退出0，4191/4192无监听；自动化再次只读核对仍PAUSED。Upload93项+日期13项共106项组件回归通过，另3项门禁回归，不重复计算后续复跑。
