# Upload Demo 浏览器验证 · 2026-11-16

结果：Cedar PC 与 Maple 手机布局各 16 个公开 Demo 的主要交互通过，未发现需要修改组件或 Demo 源码的问题。

环境：ego-browser / ego lite，独立 TaskSpace 37；PC 本地文档站 localhost:9991，Maple 本地示例 localhost:8080。Maple 使用同源 mobile.html iframe 保持手机页面路由，在浏览器中模拟 346 × 780、390 × 844 的视口；不是手机真机验证。PC 检查亮色，手机截图为当前暗色主题。

## 重点场景

- Dialog 中上传：点击入口打开原生文件选择器并添加本地 SVG，列表由 1 项增加到 2 项；派发带 File/DataTransfer 的浏览器 drop 事件后增加到 3 项。关闭并重开保留全部 3 项，完成按钮可关闭。
- 拖拽添加：页面内和 Dialog 内入口都接收文件。页面内 dragover 后出现 dragover 样式和“松开以添加图片”，drop 后文件出现在列表。测试使用浏览器合成拖拽事件，未覆盖从操作系统文件管理器实际拖入。
- 图片预览：弹窗中添加的图片能打开内置预览，上一张切换、关闭预览正常，底下上传 Dialog 保留。独立预览 Demo 的开启/禁用切换正常；自定义预览 Dialog 能加载图片并关闭。
- trigger-position：两端各验证 text / picture / picture-card × before / after，共 12 组。默认入口在列表之后；切换后的实际 DOM 顺序正确；已选 2 项文件不丢失，同一个 file input 节点得到保留。
- 布局：346px 与 390px 无页面横向溢出。346px 上传 Dialog 宽 314px；PC Dialog 宽 640px。保存截图时 3 张缩略图均已加载，无 Vite 错误浮层。

## 全部 Demo 的覆盖

| Demo | 两端已验证的主要行为 |
| --- | --- |
| read-only（基础用法） | 选择本地图片并展示 |
| list-type | 切换三种列表类型，保留文件 |
| trigger-position | 三种列表类型和前后位置组合、输入节点保留 |
| draggable-picture | 拖入提示及合成 drop 添加 |
| picture-limits | 接收图片、拒绝文本文件且不改变已有数量 |
| replacement | 原生替换选择器，替换后仍为单文件 |
| directory | 检查目录输入配置；普通多选后备入口添加文件。未验证系统目录选择器 |
| preview | 图片加载、开启/禁用、打开及关闭 |
| states | 可编辑、只读、禁用、纯阅读的入口和操作呈现；纯阅读移除编辑入口 |
| custom-surface | 卡片操作层预览按钮打开自定义 Dialog，图片加载及关闭 |
| manual-upload | 首次模拟失败，然后重试成功 |
| remove-confirm | 取消保留文件，确认后删除 |
| external-state | 添加外部任务，模拟完成至 success / 100% |
| external-trigger | 切换外置按钮前后位置，通过按钮选择并添加文件 |
| dialog-upload | 点击添加、合成 drop、预览、关闭重开保留、完成关闭 |
| clipboard | 加入本地示例图片、显示接收计数、清空。未修改系统剪贴板 |

## 证据

- [浏览器状态](./browser-state.json)
- [PC 上传弹窗](./c-dialog.png)
- [346px 手机上传弹窗](./mp-dialog.png)

本轮为浏览器交互验证，没有修改产品源码，也没有重新运行单元测试。自动化定位过程中针对两端不同的重试/确认文案、卡片操作层和条件重建按钮调整了临时测试脚本；未将这些定位问题作为组件缺陷。
