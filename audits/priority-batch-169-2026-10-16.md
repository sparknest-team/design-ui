# 第一百六十九批：Carousel 居中自动宽度鼠标循环

## 范围与实现

- 先核对时间、168批、主表与两仓Carousel变化，选取尚未实测的auto-sized已有示例；保留四项目140/220/180/260px、12px间隔、自动宽度和居中，仅补v-model current、change计数及公开status。两端独立维护，不改内核、调度器、API或样式。
- Cedar中文及Maple中英说明同步配置与边界；现有移动集合和中英文页面仍引用同一auto-sized文件，无需新增菜单分类。使用Vue技能的真实组件回归，不共享实例/运行时。

## 真实浏览器验收

Cedar4185、Maple8080中文源码站，CUA原生鼠标drag，公开DOM只读核对：

1. 初值Current0、Changes0；实际项目宽度分别140/220/180/260，未把auto当作等宽。Cedar视口x395.5/w798，Maple x323/w487.40625。
2. 两端依次向左拖动，Current依次1、2、3，Changes依次1、2、3；再向左跨末尾到0/Changes4，反向向右跨首项到3/Changes5。Cedar拖动900→700/700→900，Maple660→500/500→660；都在各自真实视口内。
3. 当前220px项时Cedar中心794.5、Maple中心566.5；最后当前260px项同样为794.5/566.5，与各自视口中心误差小于1px。最终仍只有4个公开slide节点，无克隆项目。
4. evidence/cedar-carousel-auto-batch169.png、evidence/maple-carousel-auto-batch169.png已保存并查看，展示Current3、Changes5及260px项居中。Cedar较宽视口存在边缘空余区域，未据此声称所有空间都被循环项目填满；不通过复制实例填满空间。

两端本组合通过，未发现需改组件内核的新缺陷。本批不覆盖物理触屏/惯性、动态增删、拖拽中尺寸变化、自动宽度受控拒绝、不同速度/阈值的完整矩阵。Maple右侧其他示例及英文页面未计本组合通过。临时页已关闭，现有服务保留。

## 验证与进度

- 两端各新增auto-sized Demo回归1项，模拟视口和四种offsetWidth，以pointer事件检查逐项回写、两个循环边界、事件次数和4项目保留宽度；不把jsdom几何当真实浏览器居中证据。
- Cedar9文件49项、Maple8文件48项，共97项Carousel测试通过。受影响Demo/测试ESLint及Maple全量lint:check通过，Maple docs:check 1046个SFC、0失败；两库及审计仓git diff --check通过。
- 本批仅JS Demo/回归和说明，无公开类型/组件内核变更，未重跑完整typecheck。Token构建阻塞文件hash与168批相同，未重跑同一已知失败、未接管并行Token改动；源码站不冒充新生产构建验收。
- 菜单component-reuse-sync --check通过：72族分类同源56（77.8%）、逻辑同源15（20.8%）、独立1（1.4%）；至少一端部分72/72（100%）、双端部分68/72（94.4%）。本批补1族两端新组合，族数量不变，不是全场景完成率。
- 未创建代理/子任务，未提交、推送或发布，保留其他任务脏改动。
