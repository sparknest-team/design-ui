# 第一百八十三批：Upload 原生 FileReader/data-url 与合成图片解码

## 范围与实现

- 起始2026-10-16 02:12 UTC核对182批、27批主表、97/167/176批读取边界及两仓Upload改动，补一直明确未覆盖的FileReader/data-url实际浏览器读取；不触发曾阻塞的原生文件选择器。
- 复用replacement-validation既有Demo，两端独立增加读取开关；默认仍file，开启后公开useUploader使用resolveType=data-url。生成本地114B SVG，before-read返回副本后才读取，Upload受控队列仍沿用原入口。
- 新增16×16 img与原生load计数、当前data-url项目数。Decoded images是自重置以来累计事件，删除不递减；重置清零。不改组件内核/API，不共享实例/运行时，不访问外部服务/凭据。
- Vue技能用于ref驱动读取模式、真实组件回归、替身恢复和卸载清理；Cedar及Maple中英Demo/说明同步，沿用现有菜单与移动集合入口。

## 两端真实浏览器动作

Cedar4185、Maple8080中文源码站，CUA操作可见按钮，DOM只读，不注入FileReader或文件：

1. 开启“使用原生FileReader读取为data-url”，连续加入两张小图片。两项sample-1/2.svg均114B，Data URLs2、Decoded images2。
2. 读取实际img的src为data:image/svg+xml;base64前缀，complete=true、naturalWidth=16、naturalHeight=16，两端均实际解码成功；不是只看url字符串。
3. 点击替换为文本：拒绝原因accept，队列与计数仍2；类型校验先于读取。
4. 删除第一项：队列只余sample-2.svg，img数量1、Data URLs1，累计解码仍2。截图evidence/cedar-upload-data-url-batch183.png与maple-upload-data-url-batch183.png已保存并查看，均可见绿色16px图像与计数。
5. 重置：队列空、Data URLs0、Decoded images0、拒绝无。临时页已关闭，既有源码服务保留。

未发现新内核缺陷。本批没有原生文件选择器、读取失败/abort、正在读取中重置的迟到结果、object-url回收、真实网络或物理触屏验收。仅补合成File的原生FileReader和解码路径，不将其等同于所有上传方式通过。没有本批英文/Maple右侧真实操作。

## 回归与进度

- 新增Cedar1项、Maple中英文各1项Demo测试；用可控FileReader替身检查只读取两个合法替换File、114B与MIME、图片src/列表回写、类型拒绝不读、load累计、删除及重置。load事件在单测手动触发，不将它当真实解码证据；原生读取/解码证据来自上面的浏览器。
- Cedar10文件56项、Maple10文件90项，共146项Upload路径回归通过；两端受影响Demo/测试ESLint、Maple全量lint:check、Maple docs:check1050个Demo SFC（0失败）通过。
- 菜单component-reuse-sync --check和三仓git diff --check通过。JS Demo与测试变化，无公开类型或内核变动，未重跑完整typecheck。
- Token完整文档构建阻塞hash与182批相同，未接管其他任务或重跑已知失败；本批为源码站而非新生产产物。
- 同源分类仍56/72（77.8%）、逻辑同源15/72（20.8%）、独立1/72（1.4%）；双端至少部分证据72/72（100%）不变，无新增组件族，不是整库场景完成率。没有完整场景分母，不能计算剩余百分比。
- 后续Upload需补读取中清理/失败、原生选择、其他网络迟到和触屏；另外仍有Scheduler高级交互、Form异步跨字段/提交、日期时间其他边界、Carousel动态变化、水印暗色视觉及生产构建复验。
- 未创建代理/子任务、未提交/推送/发布，保留脏仓库及并行改动。
