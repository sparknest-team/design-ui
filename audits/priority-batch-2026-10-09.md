# 依赖分批并行：2026-10-09

## 本批范围与顺序

先同步 Cedar Ripple 的独立生命周期实现（运行时不导入CSS，卸载/禁用取消定时器，实例键盘状态隔离），再并行改造 Checkbox/Radio、Rate、Progress/ProgressGroup，最后统一集成。没有跨库共享实例、公共组件核心包或 platform 配置层。

## 逐组件结果

| 组件族 | 本批完成 | 保留差异 |
| --- | --- | --- |
| Checkbox / CheckboxGroup | 原生input/label主体、Group/Context、BEM、实例外观、图标/完整内容槽、原生name/aria-label、表单/批量方法/键盘/SSR | 本库安装/表单接线，已登记的桌面/触控密度默认值 |
| Radio / RadioGroup | 同样独立复制原生主体及组协议；补齐inputAttrs/name/ariaLabel、颜色/尺寸、两图标槽与受控回显；删除旧class/provider实现 | 本库安装/表单接线，已登记密度默认值 |
| Rate | 主体/Props/核心样式同源，修复readonly继承/可聚焦、键盘边界误清空、非法数值/hover回收、半分触控/错误态/SSR | 公共Token名称和金色/主色、布局默认映射仍独立；仅标逻辑已同源 |
| Progress | 主体/Props/样式/Token同源；保留number|string size与0–100 percent，双方steps/buffer/track/rotate/渐变/未知进度补齐，保留圆形完成/失败图标，SSR稳定ID | 安装与本地ConfigProvider尺寸接线 |
| ProgressGroup | 主体/Props/样式/Token同源；status布尔/#status直接迁移showText/#text；超额裁剪、非法值、键盘Tooltip/Escape/SSR | 安装入口 |

Maple根入口同时补齐 ProgressColor、RadioValue/Emits/Slots、CheckboxValue、RateExpose/Emits/CharacterSlotProps。源码、调用方、测试、Demo、中英文文档、OpenSpec、Changesets一并迁移，不保留旧API兼容分支。

## 验证记录

- Cedar整批194项及追加3项Ripple生命周期、Maple整批254项，共451项测试通过；含依赖调用方和Ripple。
- Maple docs:check 911个Demo，0失败。
- 主体门禁15对（含公开类型和配对原生测试）、既有组核心19对及11Demo对；Rate核心/样式/2Demo门禁；Progress家族14源/样式/测试对及5Demo对通过。
- 两端类型检查和完整Lint通过，Maple本批组件定向Lint通过。
- 首轮Maple完整Lint曾遇到本批外文档检查脚本格式/规则问题；未改写其他工作的文件。最终重新运行 lint:check 已通过，上述问题不再复现。
- Choice主题检查桌面/触控两种模式共1920状态、1408对比度组合，最低4.681:1。源码样式依赖无循环/缺失/内嵌foundation。
- 公共主题契约通过：Progress新16项Token纳管，ProgressGroup文本/统一几何同步，Maple旧Progress暗色覆写删除。
- 两端 build:lib 完成。五个组件族及 Ripple 的 ESM/CJS 无CSS loader导入、SSR均通过；Maple声明入口确认新公开类型导出完整。
- 发布样式依赖检查通过，src/es消费者中 foundation 与 Loading 均仅一次；Token参考页已同步并通过3页门禁。
- 浏览器工具连接超时；未完成真实浏览器视觉验收，静态样式门禁不能代替视觉验收。未运行整站文档生产构建。

## 维护说明

同源不等于整目录逐字节相同；前缀、本库安装/表单接线和登记的密度默认值仍独立维护，主体和契约由门禁防止漂移。Rate公共Token治理仍需后续补齐，不能误标完整同源。

详见 [Checkbox](./checkbox-native-body-progress.md)、[Radio](./radio-native-body-progress.md)、[Rate](./rate-interaction-wave-progress.md)、[Progress家族](./progress-complete-wave-progress.md)。

## 本批后状态

71组：48已同源、13逻辑已同源、6待适配、3逻辑待同源、1独立。待推进清单从14组降至9组：
Slider、Input、Textarea、VerificationCode、Search、List；Tabs、Carousel、Upload。
另外13组逻辑已同源不等于整组件完全同源，Rate的Token收口包含在其中。

菜单与调研文档由component-reuse.json统一同步。下一批仍按共同基础先行、无依赖组件并行、逐组件验收执行。

最新批次集成与剩余清单以[第二批记录](./priority-batch-2-2026-10-09.md)为准。组件级“待集成”或“建议逻辑同源”为交付时快照，公共 Token 与适配边界复核后，按现有定义将本批组件登记为同源，不表示整目录逐字节一致。
