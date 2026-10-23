# 第三十五批：Slider 范围、输入与受控拒绝

北京时间 2026-10-14 12:28 开始。保留两仓 Slider 既有重构与其他聊天改动，不改组件核心、Token 或公共 API。

## 真实交互

- Cedar 与 Maple 中间数字输入：范围起点 20 输入 95→80（不越过终点 80）；终点输入 -10→80（不越过起点）。两端单值 step=5 输入 32→30，-9→0，999→100，回读 slider aria-valuenow 与输入值，不仅看挂载。
- Maple 右侧 iframe 范围初值仍为 20/80，不被中间编辑影响。右侧输入 95/-10 后同样为 80/80。
- 两端中间及 Maple 右侧受控拒绝：End 提议为 100，但滑块实际值保持 50。只读 End 保持 40。
- Cedar 和 Maple 中间实际鼠标拖动起点到轨道 50%，结果为 50/70，终点不受影响。先滚入视口，再读取当前轨道/手柄几何，无离屏或旧坐标操作。
- 两端中间禁用滑轨实际点击 90% 位置后保持 40。右侧 disabled 读取 aria-disabled=true、值 40；未把属性读取算作其真实指针验收。
- 已检查 `/private/tmp/cedar-slider-drag-batch35.jpg` 与 `/private/tmp/maple-slider-drag-batch35.jpg`。范围输入过程另存 range 截图。

## 发现与修复

Maple 英文 Markdown 和右侧新增示例标题仍为 keyboard-input/touch-and-labels/controlled-range 文件名。已改为有语义的中英文标题，右侧跟随全局语言；补充中英说明，明确步长/范围不交叉、固定值拒绝更新、只读与禁用行为。没有修改 Demo 模型或实现协议。

## 验证进度

- Slider 两端各 2 文件/22 项测试通过，共 44 项；包含 Form 接线契约。
- Maple 受影响入口 lint 通过，最终完整文档构建通过：1007 Demo SFC、0 失败、28.01s。冷加载后确认中间标题与右侧标题均为 Controlled and Non-crossing Range，并复验拒绝 End 后实际值仍为 50。标题截图 `/private/tmp/maple-slider-title-batch35.jpg` 已检查。
- 菜单/调研检查通过：72 族，56 已同源、15 逻辑已同源、1 独立，状态不变；记录不等于所有 Demo/配置完成。
- Cedar 沿用第三十四批最终完整文档构建，组件代码未改变；未重新跑整库类型或 npm 包构建。

未覆盖：右侧实际指针拖动、垂直/反向轴、真实触屏取消与抓取丢失、全部 Form 嵌套组合。下一轮优先垂直/反向范围与日期时间其他面板边界。截止仍为北京时间 2026-10-15 00:00，无提交/推送/发布。
