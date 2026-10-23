# 第八十五批：两端 Checkbox / Radio 分组状态

## 生产站浏览器交互

- 复验本地已构建文档站 Cedar `/components/checkbox/`、`/components/radio/` 与 Maple `/#/zh-CN/checkbox`、`/#/zh-CN/radio` 中各自独立的“分组状态与只读” Demo；均为本地合成设备 A/B，无外部服务。
- Checkbox 两端：非受控初值 `['a']`，点击 B 后 A/B 均选；父级接受的受控组点击 B 后模型为 `['a','b']`。切到只读后点击 A、对 B 按空格，模型和勾选均保持。父级拒绝的空数组组点击 A 后只显示提议 `['a']`、按空格操作 B 后只显示提议 `['b']`，六个原生输入中该组两项始终未选。
- Radio 两端：非受控和父级接受的受控组分别从 A 切到 B，父级显示 `b`。只读后对 A 按空格仍为 B。父级拒绝组点击 A、对 B 按空格，提议依次为 `a`、`b`，该组原生 checked 与 `aria-checked` 始终均为 false；另外两组分别保持仅 B 选中。
- Checkbox 两端的独立“分组批量方法” Demo：初值 `["remote","locked","a"]`，`checkAll()` 在 `max=4` 下只追加 B，得到 `["remote","locked","a","b"]`；`inverseAll()` 保留未加载的 remote、只读 locked，移除 A/B 后加入 C，得到 `["remote","locked","c"]`。反转可见选项顺序后再次 `checkAll()` 先加 B 达上限，结果 `["remote","locked","c","b"]`；禁用选项始终未选，A 因上限暂时不可操作。方法返回值与模型显示相同。
- Cedar Radio 首次导航时发生一次动态模块请求失败，造成该页 Demo 暂时空白；重新载入同一已构建页面后 6 个组内输入出现，随后完成上述交互。此环境现象尚未定位为组件源码缺陷，不把首次空白算通过。

## 范围与口径

- 两端 Checkbox/Radio 组件文档已存在对应 Demo，Maple 中英文文档均有入口；两站菜单均包含 Checkbox/Radio。本批没有改组件、Demo、文档或菜单源码，仅同步验收台账。
- 第二十七批总表当前有 57 个已观察交互的组件/组合行，其中 13 行明确标记“部分”或“静态视觉”，即已入表项目中至少 `13/57 ≈ 23%` 尚未完成全组合验收。其余 44 行只代表列出的动作做过，并非整组件完成。未入表组件、每个组件的其他 Demo 与配置不在分母中，因此 **23% 不是整库剩余比例**，目前不能诚实给出整库精确百分比；下一步需按两端独立 Demo 卡片建立全量清单后才能计算。
- 尚未完成的主要交互：Checkbox/Radio 的其他键盘导航和异步竞争；Upload 其他配置；Scheduler 高级拖拽/拉伸及拒绝；Form 高级异步；日期/时间边界；Picker/FloatingPanel 等移动端触屏组合；Carousel 实际拖拽。部分场景已有早期单测或浏览器记录，不能据此宣称全部覆盖。
- 本批无运行时代码变更。两端定向测试各自的 Checkbox `group-contract.spec.js` 16 项、`group-methods.spec.js` 11 项及 Radio `native-body.spec.js` 8 项均通过，即各 35 项。未跑两端完整文档构建或全库 lint/typecheck；未提交、推送或发布。
