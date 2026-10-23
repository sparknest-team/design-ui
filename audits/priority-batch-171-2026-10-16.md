# 第一百七十一批：补齐 Cedar Watermark 开关与清理证据

## 范围

- 检查当前时间、170批、主表及两仓相关变化，Watermark此前只有Maple独立全屏记录，本批补Cedar现有fullscreen示例；不新增Demo、不改组件内核/公开API/Token。
- Cedar与Maple中英全屏说明同步实例隔离及边界，沿用已有菜单/移动集合。一次文档补丁因Maple标题实际为“全屏”而非“全屏水印”原子失败未写入，纠正后成功。
- Vue技能用于真实组件回归；容器外层直接查询document.body，卸载后确认无残留，不用stub伪装全屏位置。

## 真实浏览器

Cedar4185中文源码站，CUA真实点击和按键，DOM仅只读：

1. 点击开启全屏，出现1个c-watermark__layer--fullscreen；position=fixed、x/y=0、宽1269高720，与当前视口一致。背景为data:image/png，pointer-events=none；内容按钮仍保留原局部位置。
2. 退出按钮Space后全屏层数0，开启按钮恢复；Enter重开后全屏层数1；鼠标点击退出后全屏层数0，原示例内仍有普通c-watermark__layer。不是销毁整个局部水印，也没有重复积累全屏层。
3. evidence/cedar-watermark-batch171.png已保存并查看，显示开启后的退出按钮。临时页已关闭，原开发服务保留。

### 视觉限制与未覆盖

暗色截图中的水印文字很淡，不能仅因存在PNG背景就声称暗色可读性通过；当前默认content-color为rgba(0,0,0,0.15)。本批没有擅自修改并行Token工作，也未通过Demo硬编码颜色掩盖默认行为。这里只认证实际开关、覆盖几何、指针不拦截及回局部清理；暗色可读性仍需在Token/主题任务中核对。未发现这些开关/清理操作的新故障，不等于视觉无缺陷。

图片失败/异步替换、动态主题、防篡改、真机触屏、路由卸载的浏览器证据未覆盖；卸载清理由本批自动回归验证，不能冒充浏览器离开路由实测。Maple本轮仅复跑既有测试，不将历史基本开关或说明同步夸大为同一完整矩阵两端通过。

## 验证与进度

- 新增Cedar既有fullscreen Demo回归1项，canvas用局部测试mock，核对同一层局部/全屏迁移、重复开关与卸载body层归零。mock不作为实际PNG像素质量证据。
- Cedar3文件7项、Maple1文件5项，共12项Watermark测试通过；Cedar新增测试ESLint、Maple全量lint:check通过；Maple docs:check 1046个SFC、0失败；两库及审计仓git diff --check通过。
- 无公开类型或运行时/Demo源码变化，未重跑完整typecheck。完整文档构建Token阻塞hash与170批相同，未重跑同一已知失败；源码站不冒充新生产构建站。
- 菜单component-reuse-sync --check通过，72族分类同源56（77.8%）、逻辑同源15（20.8%）、独立1（1.4%）不变。
- Watermark新增Cedar独立记录，双端部分证据由69族增加至70/72（97.2%），至少一端部分72/72（100%）。仍有2族缺双端独立记录；这不是全场景完成率，也不包含暗色视觉可读性通过。
- 未创建代理/子任务，未提交、推送或发布，保留其他聊天变更。
