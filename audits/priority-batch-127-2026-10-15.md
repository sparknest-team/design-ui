# 第一百二十七批：Avatar 动态文本测量修复与回退验收

核对时间、126批、主表和两端Avatar，无重叠在途改动。使用Vue最佳实践技能补内容更新回归。沿用Cedar4185、Maple8080源码站，不是生产构建产物验收。

## 真实发现与修复

- 在两端现有“文字自适应”Demo中实际输入ABCDEFGHIJKLMNOPQRSTUVWXYZ。输入值、三个头像文字都更新，但两个开启自适应头像仍使用初始Cedar文本的缩放：Maple约0.615385、Cedar约0.606061；实际内容宽334/344px、外壳40px。不是仅凭源码推断。
- 原逻辑只在挂载、尺寸/开关变化及外壳resize时测量，插槽文本改变而外壳不变不会重测。两端独立Avatar.vue增加onUpdated测量，不改API、Token或Demo数据。
- 重载后同样实际输入，Maple两头像scale0.116959（40/(334+8)），Cedar0.113636（40/(344+8)）；关闭自适应的第三个头像仍不设置transform。
- 两端再实际输入A，相关头像恢复无transform。[Cedar长文本证据](./evidence/cedar-avatar-batch127.png)、[Maple长文本证据](./evidence/maple-avatar-batch127.png)，截图为长文本阶段，第三项故意保留不缩放对照。
- 两端失败回退示例实际DOM已转为/cat.jpg，complete为true、naturalWidth1440；缺失主图的回退内容不是空占位。错误插槽NA在当前页面DOM中可见，但本批没有主动切换其src，不把它计作异步重试验收。
- 两端实际点击alt为“编辑头像”的图片后出现click · button；点击“更换头像”后出现click · overlay，验证通知到父级可见反馈。没有读取Vue内部值或注入事件。
- 两端error级日志均为空。Maple浮动label不是原生placeholder，首次按placeholder定位无匹配；读取DOM确认唯一textbox后改用角色定位，不把该定位失败当组件错误。

## 验证与同步

- 新增每端1项动态文本回归，精确检查长文本scale和短文本恢复；需等组件更新、nextTick测量、测量后的渲染完成。初次只等两轮时断言早于style刷新，补足三轮后通过，没有降低断言或修改组件API。
- Cedar3文件11项、Maple3文件12项通过，共23项，含原有同源检查。Cedar测试退出带close timed out after 1000ms提示，最终进程exit 0；如实保留，不宣称无运行器警告。
- 两端类型检查通过，Cedar受影响组件/测试lint通过，Maple受影响文件格式化后全量lint通过。两仓及审计仓diff --check通过。
- Cedar中文与Maple中英说明更新：插槽文字重测、短文本恢复、auto-fix-font-size关闭行为。菜单/调研同步检查通过：72族，56已同源、15逻辑已同源、1独立；Avatar分类不变。
- 未执行完整文档构建，前批Token解析阻塞仍需后续构建复验；本批只证明当前源码站和自动测试结果，不覆盖完整构建状态。
- 独立部分交互记录54/72（75.0%），双端部分50/72（69.4%），尚无独立记录18/72（25.0%）；不是全部Demo/配置通过率。
- 尚待：图片src异步竞争/失败后恢复、动态slot图片识别、group继承变化、lazy交叉视口、尺寸/形状矩阵、真正hover/触屏及卸载后待执行测量。本批未推定这些通过。
- 未提交、推送或发布。
