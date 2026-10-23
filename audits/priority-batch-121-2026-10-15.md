# 第一百二十一批：两端 Affix 容器吸附与禁用恢复

核对第120批、主表与两仓Affix无在途修改。复用Cedar4185、Maple8080源码站；实际滚动，不通过脚本改scrollTop或派发合成滚动。

## 浏览器实际交互

- Maple吸附变化示例初始Fixed: false，容器scrollTop=0；在边框内部真实向下滚动后scrollTop=432，显示Fixed: true，按钮相对容器顶部保持20px。反向滚动回scrollTop=0，反馈恢复false。[Maple吸附证据](./evidence/maple-affix-batch121.png)。
- Cedar同一示例实际滚动后scrollTop=402、Fixed: true、顶部差值20px；反向滚动反馈false。[Cedar吸附证据](./evidence/cedar-affix-batch121.png)。两端目标都为Demo自己的容器，不将文档窗口滚动算为同一场景。
- 两端控制示例分别实际滚动至吸附，按钮距容器顶部12px。勾选Disabled后固定定位样式解除，仅剩z-index，按钮随内容滚到顶部上方（差值-87px）；取消Disabled后重新吸附到12px。
- 两端点击Change layout and update position，父级Position updates由0变1，验证公开updatePosition调用完成及反馈；此处不把计数当作全部布局边界正确的证明。两个滚动Demo分开操作，没有共用其scrollTop。
- 两端本批没有捕获error级日志。Cedar首次打开等待超时后绑定原tab，待控件存在才操作，没有新建重复页。Maple右侧未操作。

只读取原生几何、样式、滚动位置和父级反馈，不读取Vue状态。没有把静态定位或挂载成功计为滚动交互通过。

## 验证与同步

- Cedar2文件3项、Maple2文件7项专项回归通过，共10项；不能由此推导所有容器/模式已验收。
- 未发现需修复的新缺陷，无源码/API/样式/Demo变更。两端中文/英文文档已描述独立滚动容器、offset、disabled、CSS模式及updatePosition，保留说明；主表新增独立记录。
- 菜单/调研同步检查通过：72族、56已同源、15逻辑已同源、1独立；Affix分类不变。两仓及审计仓库git diff --check通过。
- 无源码变化，未重跑类型/lint或完整文档构建；第118批两端Token文档构建阻塞和非本批复制漂移没有本批新结论，不接管并行工作。
- 独立部分交互记录49/72（68.1%），双端部分45/72（62.5%），尚无独立族级记录23/72（31.9%）；不是全部Demo/配置完成率。
- 待覆盖：CSS sticky实测、底部offset与窗口目标、target动态替换、嵌套targetContainer、横向滚动、停用/卸载清理和Maple触屏/右侧。未提交、推送或发布。
