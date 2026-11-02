# 阅读方向 A 批实现与验收

2026年10月29日，本批补齐 Cedar 的 Steps、Timeline、NavMenu、Tree、Transfer，以及 Maple 已有的 Steps、NavMenu。使用现有文档导航 LTR/RTL 开关，组件继承最近原生方向作用域，不新增全局状态或逐组件切换按钮。

## 已实现行为

| 组件 | 实现 | 保持稳定的语义 |
| --- | --- | --- |
| Steps 两端 | 四种变体的逻辑间距、连接线和箭头；水平键盘随方向变化，纵向上下键稳定；Home/End、禁用跳过、Enter/Space 激活、单一 Tab 入口 | 1-based 进度、状态和自定义图标内容；方向切换及焦点移动不发 change |
| Timeline | 横向连接线使用逻辑起止；纵向物理侧别保持；交替布局改为两个明确物理列，消除 RTL 相对定位越界 | left/right 侧别、top/bottom 侧别、独立 reverse；正文继续继承文字方向 |
| Cedar NavMenu | 横向左右键、层级展开/返回键、子菜单优先展开侧、内联折叠箭头、来源方向传入 Teleport | 纵向上下键、选中业务值、显式 Item placement 的物理侧别、碰撞翻转 |
| Maple NavMenu | 导航栏及选项水平按键随方向变化，Overlay 和 Item 面板明确传递各自来源方向 | 筛选值、选中项、原有手机面板呈现；局部 Item 方向可覆盖父级 |
| Tree | 逻辑缩进与连接线、展开箭头；根节点焦点与 aria-activedescendant；可见节点导航、禁用跳过、Home/End、展开/收起/父子导航、Enter/Space | 节点顺序、独立选择/勾选状态、纵向拖放前/内/后 |
| TreeSelect 组合边界 | 内部交互归属标记区分组合框与独立 Tree，避免重复 treeitem 和焦点抢占；层级左右键遵循方向 | 组合框继续持有输入焦点，不新增公共属性 |
| Transfer | 两栏逻辑布局、拼接圆角、标题/搜索/操作间距；原生移除按钮；全选跳过必选与禁用候选 | 当前为复选框直接移入模式，无中间箭头按钮；目标值及顺序、冻结分组、纵向拖动语义不随 RTL 交换 |

Steps 的既有 `contentPlacement="right"` 是节点旁的横排内容模式，RTL 时节点与正文按阅读顺序排列；bottom 仍在下方。这里没有增加或重命名公开属性。Timeline 的显式物理侧别和 ResizeBox、SwipeCell 等物理 API 不套用此规则。

## 自动验收

| 检查 | 结果 |
| --- | --- |
| Cedar 受影响组件及 TreeSelect 组合回归 | 30 个文件、175 项通过，进程正常退出 |
| Maple Steps/NavMenu 回归 | 7 个文件、30 项通过 |
| design-ui `pnpm check:direction` | Cedar 21、Maple 13、导航 4，共 38 项通过 |
| 两端 typecheck | 通过 |
| Cedar 全量 lint 与 API 命名 | 通过 |
| Maple 全量 lint:check 与 API 命名 | 通过 |
| Steps 跨端同源门禁 | `node bin/copied-components-check.mjs steps` 通过 |
| 生产源码夹具 | Vite production build；Chromium、Firefox、WebKit 三引擎通过 |

Cedar 旧测试器在一次大范围回归结束后触发原生 fsevents 清理异常；最终回归设置 `CHOKIDAR_USEPOLLING=1`，175 项全部通过且退出码为 0。运行时组件没有为此添加兼容分支。

生产夹具入口为 [浏览器检查脚本](../../browser/reading-direction-batch/check.mjs)，命令：

```sh
pnpm --dir design-ui check:direction:browser
```

夹具覆盖 LTR → RTL → LTR、RTL 内嵌 LTR、四种 Steps 变体、纵向步骤、禁用跳过、焦点与值分离、Timeline 横向连接线与独立 reverse、纵向物理侧别、交替正文及相对标签不越界、菜单层级导航与子菜单实际展开侧、Portal 来源方向、虚拟 Tree、Transfer 复选框键盘操作及移除、鼠标点击与触摸。

证据保存在 [三引擎结果](./evidence/reading-direction-batch-2026-10-29/results.json)、[Cedar RTL 截图](./evidence/reading-direction-batch-2026-10-29/cedar-rtl.png)、[Maple 手机 RTL 截图](./evidence/reading-direction-batch-2026-10-29/maple-rtl.png)。完整日志与退出状态见同目录 validation.json。

## 交付边界与后续

本批的标准布局与核心交互已验收。生产源码夹具直接构建实际组件与 Less，不替代完整文档站生产构建、npm 发布产物消费验收、移动真机或整库 quality。特殊长文本、任意业务插槽、拖放组合及所有主题/尺寸组合继续随全库场景矩阵扩展，不能把本批结果写成全库完整支持率。

下一批为 Split、ResizeBox、Table/横向虚拟滚动；再下一批为 Scheduler 坐标层。详见 [实施计划](../refactors/reading-direction-plan.md)。
