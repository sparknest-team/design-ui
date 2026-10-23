# 第四十四批：拒绝关闭时重复确认及焦点组合

用户明确要求继续验收。使用Vue最佳实践技能核对事务与父级受控关闭协议。两库default-state示例同步新增独立“接受关闭请求”开关和change计数；Maple中英同步。没有修改公共API、组件主体或Token，未提交/推送/发布。

## 实际交互

- 直接在已展开面板外切换原展开开关，会先触发关闭，不能稳定构造拒绝关闭场景。新开关仅拒绝false请求，允许正常打开；没有注入Vue状态或DOM事件。
- Maple中间示例取消接受关闭后打开，选09:01、点击Confirm：父级09:01/10:00、open=true，提交次数1，关闭提案false，dialog仍存在。
- 再按Confirm Enter与Space，次数始终1，模型不变。Cancel Space和Confirm Escape仍请求关闭、保持open=true，不额外提交。
- Cancel Tab移至Confirm，读到真实activeElement文字Confirm；没有仅根据样式判断焦点。Escape后仍1次提交。
- 已保存并查看`/private/tmp/maple-refused-close-batch44.jpg`。随后重新加载合成示例清理被父级保持的面板，dialog=0。截图看不到全部计数，因此计数结论以逐步读取输出为证据。
- Cedar实际打开并选09:01确认，模型09:01/10:00、open=true、次数1。随后确定Enter/Space和Escape均保持1；起点Tab移至终点，真实activeElement为combobox、值10:00，模型和次数不变。
- 已查看Cedar证据`/private/tmp/cedar-refused-close-batch44.jpg`。尝试在持续展开时check关闭开关未改变checked状态，不计作恢复接受通过；随后重载合成示例清理，dialog=0。本批不声称验收了面板展开期间修改父级策略。

## 检查与同步

- 两端各2文件8项相关测试最终通过，共16项。新增计数output导致旧测试泛选output失败，改为明确Controlled proposals定位后重跑通过，不是组件事务失败。
- Maple完整文档构建：1010 Demo SFC、0失败，Vite约65秒。总数变化包含脏仓库其他工作，不宣称新增两个示例属于本批。
- Cedar改动Demo eslint通过；Maple整库lint发现测试换行格式问题，已格式化并重跑，最终整库lint通过。
- Cedar完整构建274页427.20秒通过；未执行整库组件类型或npm包构建。
- 菜单/调研72族同步检查通过，56已同源/15逻辑已同源/1独立。现有组件文档已明确关闭请求非父级实际关闭且不重复提交，示例补齐及验收索引同步，无需改变同源分类。

剩余：右侧拒绝关闭焦点组合、真实触屏/多种展示模式、更多异步Form组合。当前不得标记全库交互完成。
