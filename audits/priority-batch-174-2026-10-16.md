# 第一百七十四批：Radio 本地Promise加载乱序

## 范围与实现

- 检查时间、173批、主表及两仓Radio现有改动后，转回尚未覆盖的真正挂起请求乱序。沿用async-options，不重复新增Demo；默认800ms定时模式保留，新增手动返回开关。
- 手动模式每次创建本地Promise，返回最早/最新按钮真实resolve任务；应用版本只允许最新加载更新options/结束loading，旧任务记Ignored。Applied显示已应用加载序号，Pending是尚未手动返回数，不等于当前loading。
- 移除选项使在途版本失效但保留模型；旧等待仍可手动返回观察。停用/卸载结清等待并取消定时器。业务版本保护在Demo，不改Radio/RadioGroup内核或API，不宣称组件自动解决网络乱序，也未访问外部接口/凭据。
- Cedar及Maple中英文Demo/说明各自维护；现有菜单/移动集合沿用同文件。Vue技能用于shallowRef等待队列、生命周期清理和真实组件回归，保留149批稳定提示节点，避免重建焦点控件。

## 两端真实浏览器动作

Cedar4185、Maple8080中文源码站，CUA操作可见控件，DOM仅只读：

1. 开启Manual responses，连续加载两次，等待2。先返回最新，Applied2/Pending1，业务值remote；实际Enter选设备A，模型a，用户变更1。
2. 再返回旧任务，Applied2/Ignored1/Pending0，A仍aria-checked=true，用户变更仍1。
3. 再加载两次，先返回旧任务：仍显示加载中，Applied2/Ignored2/Pending1，旧结果不能提前结束新加载。返回最新后Applied4、Pending0。
4. 发起加载5后移除选项，再返回旧任务：radio节点0，模型仍a，用户变更1，Applied4/Ignored3/Pending0，没有旧选项复活。
5. 发起加载6并返回最新：Applied6/Ignored3/Pending0，A重新按模型反显，用户变更仍1。
6. 两端截图evidence/cedar-radio-race-batch174.png、maple-radio-race-batch174.png已保存并查看，展示最后反显和计数；临时页关闭，已有开发服务保留。

两端未发现新内核缺陷。本批没有真实网络失败/重连、按住键后失焦、物理触屏、Maple右侧或英文浏览器乱序；返回按钮会自然获取焦点，不把它们点击后的焦点当作Radio一直保留焦点。生命周期清理来自自动测试，不冒充本批路由离开实测。

## 验证和进度

- 两端各新增2条已有Demo回归，分别覆盖新旧两种顺序/模型与事件不被污染/移除及恢复，以及KeepAlive停用时结清两个Promise、激活后新请求可应用。既有默认定时重载焦点回归继续通过。
- Cedar4文件13项、Maple4文件30项，共43项Radio路径测试通过；追加radio-group筛选未匹配额外文件，不虚增数量。受影响Demo/测试ESLint及Maple全量lint:check通过；Maple docs:check1046个SFC、0失败；两库及审计仓git diff --check通过。
- JS Demo/回归和说明变化，无公开类型或组件内核变动，未重跑完整typecheck。Token完整文档构建阻塞hash与173批相同，未重跑同一失败、不接管Token改动；仅源码站证据。
- 菜单component-reuse-sync --check通过，72族分类仍同源56（77.8%）、逻辑同源15（20.8%）、独立1（1.4%）；双端至少部分证据72/72（100%）不变，绝非全场景完成率。本批新增Radio两端乱序组合，不新增族数量。
- 后续仍有Checkbox对应竞争、Upload其他准备/读取组合、Scheduler高级交互、Form依赖/提交、日期时间边界、物理触屏、Carousel动态变化，以及水印暗色和生产构建阻塞。
- 未创建代理/子任务、未提交/推送/发布，保留并行脏改动。
