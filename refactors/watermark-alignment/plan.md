# Watermark 同源实施计划

更新日期：2026-09-20。实施规范真源见 Cedar OpenSpec `unify-watermark`；本文记录跨库边界和执行顺序。双端实现、源码门禁、目标测试、类型检查、库构建和文档构建均已完成，当前分类为“已同源”；手动视觉复核仍作为发布前验收项保留。

## 现状判断

| 维度            | Cedar                          | Maple                                 | 结论                                             |
| --------------- | ------------------------------ | ------------------------------------- | ------------------------------------------------ |
| 生成方式        | Canvas data URL                | 隐藏 SVG + `foreignObject` + Blob URL | 统一为 Canvas；Maple 路线跨浏览器和 CSP 风险更高 |
| 文字            | `string/string[]`、自动测量    | `string`、固定 100×100                | 采用多行与自动测量                               |
| 图片            | Canvas，支持灰阶               | 图片转 base64 再嵌 SVG                | 保留 Canvas，补竞态、错误和跨域异常处理          |
| 排列            | repeat + staggered             | 永远 repeat                           | 统一 repeat/staggered，重写真实错列算法          |
| 防篡改          | 有，默认 true                  | 无                                    | 统一保留，但重写观察范围和清理                   |
| 全屏            | 无                             | 有                                    | 纳入公共 API，不作为移动端特例                   |
| 主题            | 观察 Cedar 根主题              | Demo 手动 `resize()`                  | 组件自动观察根主题、全局和局部 StyleProvider     |
| 自定义内容      | 无                             | `content` slot / foreignObject        | 删除不稳定插槽，复杂标记使用 image/Data URL      |
| SSR / KeepAlive | setup 直接访问 window/document | mounted 后访问，但无 deactivate 清理  | 两端统一 mounted 创建、完整清理                  |

## 执行顺序

1. 在 Cedar 冻结最终 Props/types，并先为现有缺陷建立失败测试。
2. 抽出纯 `renderer.ts`，使尺寸、旋转、DPR、错列和灰阶可脱离 Vue 单测。
3. 实现 `use-watermark.ts` 和精确 observer，完成异步版本控制、主题与生命周期。
4. 将 Cedar 主体改为 script setup SFC，完成本地、全屏、error、redraw 和 ARIA。
5. 迁移 Cedar Demo/文档后，把自然一致的实现独立复制到 Maple；在各自职责文件中直接修改命名空间、本地 import 和 StyleProvider 标识，不新增平台配置层。
6. 删除 Maple SVG/Blob/content 插槽和手动主题 resize 代码，迁移所有 Demo。
7. 双端运行单测、类型、lint、SSR、build:lib、build:doc，补浏览器视觉对照。
8. 加入同源门禁、同步主题/API/Web Types；全部通过后把 Watermark 升级为“已同源”。

## 不进入本次范围

- 不把 Watermark 做成安全或 DRM 产品；antiTamper 只是客户端 DOM 误删/简单篡改恢复。
- 不支持任意 HTML/组件序列化进水印。
- 不共享跨库运行时核心，不生成组件源码，不建立 Cedar → Maple 或 Maple → Cedar 依赖。
- 不顺带改造 BackTop；两者此前共用一段调研描述，但没有实现依赖。

## 源码组织原则

- 不新增 `platform.ts` 或只为跨库源码比较服务的配置对象。
- `renderer.ts`、Props/types 等自然一致的部分保持同源复制；本地前缀、import、主题属性和 StyleProvider 标识直接写在所属文件中。
- 少量差异由一致性检查规范化后比较；差异较大的 Vue 主体、observer 或样式允许各自实现，以 API、行为和生命周期测试约束。
- 如果最终只能统一契约与核心算法，分类应如实保持“待适配”或调整为“逻辑同源”，不能为获得“已同源”标签制造抽象层。

## 完成判定

只有计划中声明为同源的源码、Props、纯 renderer、生命周期、防篡改、测试、Demo、文档和发布元数据全部同步，合理端侧差异通过契约验证，且两端构建通过，才允许从“待适配”升级。若组件主体最终存在显著端侧差异，应调整为准确的分类，而不是为了升级标签增加平台适配层。仅完成 Canvas 算法或 Props 求并集仍属于未完成。
