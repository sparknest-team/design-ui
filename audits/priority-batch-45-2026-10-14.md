# 第四十五批：右侧拒绝关闭与焦点隔离

北京时间2026-10-14 14:23开始，仍在授权截止前。核对第二十七批清单、第四十四批与当前示例差异后继续。使用Vue最佳实践技能核对受控事务及实例隔离；无组件/Demo/API/Token改动，无提交/推送/发布。

## 真实交互

- Maple英文站右侧mobile iframe独立示例，取消接受关闭请求后正常打开，分钟ArrowDown选择09:01、Confirm Enter。
- 父级模型09:01/10:00、open=true、提交计数1、关闭提案false。再Enter与Space确认，仍1次，不重复提交。
- Cancel Tab后直接读取Confirm与ownerDocument.activeElement相等；确有原生焦点，不是静态截图推断。Confirm Escape、Cancel Space后仍open=true、次数1、模型不变。
- 同时读取中间示例：09:00/10:00、open=false、次数0、提案空，右侧没有影响中间实例。
- 查看证据`/private/tmp/maple-right-refused-close-batch45.jpg`；随后重新加载合成示例清理，右侧dialog=0。截图显示持续展开与取消焦点；模型、计数结论来自逐步DOM输出。

## 验证与同步

- Maple time-field-transaction/field-owner-isolation，2文件10项测试通过。
- 菜单/调研72族校验通过，分类保持56已同源/15逻辑已同源/1独立。新增验收文档及索引；现有中英组件文档已准确，无需改写公共协议或菜单分类。
- 没有代码修改，沿用第四十四批两端完整构建及最终lint。不声称本批重跑整库lint/类型/构建。

拒绝关闭重复确认现已覆盖Cedar字段、Maple中间和右侧实例。仍未覆盖：持续展开期间新的选择是否开启新事务、不同展示模式、真实触屏惯性、复杂Form与其余组件组合；不标记全库交互完成。
