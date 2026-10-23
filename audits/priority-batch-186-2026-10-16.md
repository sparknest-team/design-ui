# 第一百八十六批：Carousel 自动宽度的动态尺寸与拖动恢复

## 范围与实现

- 起始2026-10-16 02:35:48 UTC核对27批、185批、169批自动宽度及两仓Carousel/Scheduler改动。避开在途Scheduler和Carousel运动内核，仅复用auto-sized Demo添加两个原生开关：各项目加宽80px、容器收窄为300px。
- 两端独立computed/ref驱动公开样式和四个既有项目；模型及change计数保持原绑定，无新API、共享运行时或platform配置。Vue技能用于响应式尺寸、真实组件回归和卸载清理。
- 中英文组件说明同步，沿用既有菜单/移动集合入口，没有新Demo或同源分类变更。

## 真实浏览器

Cedar4185、Maple8080中文源码站；CUA真实鼠标拖动和原生开关，DOM只读，不注入指针事件或调用resize：

1. 初始四项140/220/180/260px、Current0/Changes0。向右拖动循环到末项，两端Current3/Changes1。
2. 开启加宽和窄容器：实际项目220/300/260/340px，viewport300px。两端仍Current3/Changes1，最后340px项中心与容器中心误差0px；尺寸变化本身未发change或改模型。
3. Cedar在窄容器左拖循环到首项，Current0/Changes2。Maple首次拖动未切换，不计通过；重新观察300px实际位置后，从卡片空白区长拖完成Current0/Changes2，未修改内核或声称首次尝试成功。
4. 恢复两开关：两端首项宽140px，Cedar viewport798px/中心误差0，Maple viewport487.40625px/误差-0.203125px；模型0/Changes2不变。
5. 再开启两个开关保存evidence/cedar-carousel-size-batch186.png、maple-carousel-size-batch186.png并查看，均显示220px首项、300px容器和0/2。临时页关闭，既有开发服务保留。

两端本组合通过，没有发现需改内核的新缺陷。未覆盖按住拖动途中改变尺寸、动态项目增删、物理触屏/惯性、英文或Maple右侧真实交互；截图右侧其他示例不算通过。本批是源码站，不是新生产构建。

## 自动验证与进度

- 扩展两端原auto-sized回归，各增加动态宽度/容器后模型计数不变、下一次跨边界拖动和恢复样式断言。单测模拟offsetWidth/clientWidth并调用公开resize，不将它当真实ResizeObserver或几何证据。
- Cedar10文件50项、Maple9文件49项，共99项Carousel回归通过；两端受影响Demo/测试ESLint通过。Maple docs:check1050个Demo SFC、0失败。
- Maple全量lint:check通过。三仓git diff --check通过，菜单component-reuse-sync --check通过72族（首次从工作区父目录误运行找不到脚本，改为design-ui目录后通过）。
- 无公开类型/运行时修改，未重跑typecheck。Token文档阻塞hash与185批相同，未重跑已知失败构建、未接管并行Token改动。
- 同源56/72（77.8%）、逻辑同源15/72（20.8%）、独立1/72（1.4%）不变；双端至少部分证据72/72（100%），新增族0，不能当全场景完成率。缺少完整场景分母，不能计算剩余百分比。
- 后续仍有Carousel项目增删/手势中尺寸变化、Scheduler高级拖拽拉伸、Upload读取清理/失败/object-url/网络、Form异步跨字段/提交、日期时间边界、物理触屏、水印暗色及生产构建复验。
- 未创建代理/子任务、未提交/推送/发布，保留其他脏改动。
