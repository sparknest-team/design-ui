# Token 消费候选逐项处置

更新：2026-09-30。范围为原 91 项候选中的 89 项；Message 2 项由 Message 变体阶段处理。本次 **17 项接通、72 项删除**，另补 Form/Tree 的 7 项 xl 几何变量。扩展复查再删除3项无效变量，新增双端 Card 动效2项、Maple PageHeader 反馈2项。不以变量引用扫描替代真实浏览器验收。

## 审查方法与结果

先核对编译后的所有 style/index.less、全库 TS/Vue 动态消费者与实际组件 DOM，再决定接通或删除。Image 特别核对新 core/PreviewGroup 实现；Space 动态与 Search 跨组件消费者继续保留。初次复查 needsManualReview=0、编译错误0；总声明数量受其他并行阶段影响，最终统计以 token-inventory 为准。

## 接通的 17 项

| 变量 | 消费路径与含义 |
| --- | --- |
| `--c-card-content-row-margin` | card/style/index.less：row content margin，修正误读 title margin。 |
| `--mp-card-content-row-margin` | card/style/card.less：与 Cedar 相同。 |
| `--c-dialog-simple-border-radius` | dialog/style/index.less：simple 根节点圆角。 |
| `--mp-dialog-margin-top` | dialog/style/dialog.less：对话框根节点 margin-top，默认0。 |
| `--mp-dialog-simple-content-gap` | dialog/style/dialog.less：simple message margin-top，默认0。 |
| `--mp-dialog-simple-actions-gap` | dialog/style/dialog.less：simple actions margin-top，默认0。 |
| `--c-form-size-xs-item-margin-bottom` | Form size 类选择内部有效间距，供 item margin 与 message 高度消费；error/help/inline 优先级保留。 |
| `--c-form-size-sm-item-margin-bottom` | Form size 类选择内部有效间距，供 item margin 与 message 高度消费；error/help/inline 优先级保留。 |
| `--c-form-size-lg-item-margin-bottom` | Form size 类选择内部有效间距，供 item margin 与 message 高度消费；error/help/inline 优先级保留。 |
| `--c-tree-size-xs-icon-size` | Tree size 类选择内部有效图标尺寸，供 switcher、indent 与节点 padding 计算消费。 |
| `--c-tree-size-sm-icon-size` | Tree size 类选择内部有效图标尺寸，供 switcher、indent 与节点 padding 计算消费。 |
| `--c-tree-size-lg-icon-size` | Tree size 类选择内部有效图标尺寸，供 switcher、indent 与节点 padding 计算消费。 |
| `--c-page-header-back-hover-bg` | 返回按钮 hover/focus-visible 伪元素背景。 |
| `--c-page-header-back-hover-size` | 返回按钮伪元素宽高，不推移标题布局。 |
| `--c-split-trigger-size-icon-wrapper` | 水平手柄 height／竖直手柄 width。 |
| `--c-image-preview-arrow-font-size` | PreviewGroup 两端箭头按钮 font-size。 |
| `--mp-breadcrumb-margin-separator-horizontal` | item-separator-margin 经 separator-margin 到分隔符 margin。 |

## 删除的 72 项

正式发布前直接删除无效接口，不保留空壳兼容别名。覆盖无效旧变量的调用方应改用说明中的真实入口。

| 变量 | 审查结论／迁移方向 |
| --- | --- |
| `--c-anchor-line-margin-right` | 定位线与标题之间距离由 title-padding-x 控制；没有独立 line margin DOM。 |
| `--c-breadcrumb-size-separator-height` | 分隔符跟随文本行高，字号由 separator-font-size 控制，无独立固定高度。 |
| `--c-date-picker-circle-bg-selected` | 选中日期背景已有 panel-cell-bg-selected，旧 circle-bg-selected 没有消费者。 |
| `--c-password-color-eye-icon` | InputPassword 的 toggle 使用 field-suffix-text-color 与继承字体／1em SVG，不使用旧 password 命名。 |
| `--c-password-size-eye-icon` | InputPassword 的 toggle 使用 field-suffix-text-color 与继承字体／1em SVG，不使用旧 password 命名。 |
| `--c-image-font-size-actions-item` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-padding-actions-item-vertical` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-padding-actions-item-horizontal` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-spacing-actions-item-left` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-border-radius-actions-item` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-actions-item-footer-inner-hover-bg` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-actions-item-footer-outer-hover-bg` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-actions-item-trigger-text-color` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-actions-item-trigger-hover-bg` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-spacing-actions-trigger-item-vertical` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-spacing-actions-trigger-item-horizontal` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-spacing-footer-inner-simple-vertical` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-spacing-footer-inner-simple-horizontal` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-size-error-min-height` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-size-loader-min-height` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-preview-size-scale-value-height` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-preview-spacing-scale-value-vertical` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-preview-spacing-scale-value-horizontal` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-preview-font-size-scale-value` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-preview-color-scale-value-bg` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-preview-spacing-toolbar-horizontal-simple` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-preview-spacing-toolbar-vertical-simple` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-preview-font-size-action-name` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-preview-spacing-action-name-right` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-preview-spacing-trigger-padding-vertical` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-preview-spacing-trigger-padding-horizontal` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-preview-margin-action-bottom` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-trigger-spacing-padding-vertical` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-trigger-spacing-padding-horizontal` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-trigger-bg` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-trigger-border-color` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-trigger-size-border` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-image-trigger-border-radius` | 已核查 Image.vue、ImageFooter.vue、Preview.vue、PreviewGroup.vue、PreviewAction.vue 与新 core.less：旧 actions/trigger/scale 数值／simple toolbar DOM 不存在；error/loader 为填满图片的 overlay，不另加最小高度。保留实际 footer、toolbar-action、indicator 与箭头消费者。 |
| `--c-mention-padding-horizontal` | 实际 Input/Textarea 控制排版；测量镜像 getSizeStyles 复制原生输入框计算样式，不能另设一套。 |
| `--c-mention-padding-vertical` | 实际 Input/Textarea 控制排版；测量镜像 getSizeStyles 复制原生输入框计算样式，不能另设一套。 |
| `--c-mention-font-size` | 实际 Input/Textarea 控制排版；测量镜像 getSizeStyles 复制原生输入框计算样式，不能另设一套。 |
| `--c-mention-line-height` | 实际 Input/Textarea 控制排版；测量镜像 getSizeStyles 复制原生输入框计算样式，不能另设一套。 |
| `--c-progress-line-size-md-text-margin-left` | 默认间距统一由 line-text-margin-left 控制；size-md 同义入口无消费者。 |
| `--c-internal-radio-button-font-weight-active` | 内部 active 字重没有消费者；删除而不引入未设计的加粗状态。 |
| `--c-rate-bg-hover` | hover 通过预览值与缩放体现，着色仍为 bg-active；不额外叠加另一套背景。 |
| `--c-select-multi-popup-option-padding-horizontal` | 当前 Option 普通文本／slot 和多选 SelectionIndicator 使用同一 option-padding；无搜索 highlight DOM。 |
| `--c-select-popup-option-highlight-text-color` | 当前 Option 普通文本／slot 和多选 SelectionIndicator 使用同一 option-padding；无搜索 highlight DOM。 |
| `--c-select-popup-option-highlight-font-weight` | 当前 Option 普通文本／slot 和多选 SelectionIndicator 使用同一 option-padding；无搜索 highlight DOM。 |
| `--c-slider-input-range-height` | 范围输入两端使用 input-height；中间横杠使用 input-range-content-height，没有额外 range 高度容器。 |
| `--c-steps-dot-vertical-item-title-margin-top` | 竖向连线使用 *vertical-tail-padding* 与节点几何计算；标题偏移由 dot 节点居中公式计算。 |
| `--c-steps-dot-vertical-spacing-tail-top` | 竖向连线使用 *vertical-tail-padding* 与节点几何计算；标题偏移由 dot 节点居中公式计算。 |
| `--c-steps-dot-vertical-spacing-tail-bottom` | 竖向连线使用 *vertical-tail-padding* 与节点几何计算；标题偏移由 dot 节点居中公式计算。 |
| `--c-steps-circle-vertical-spacing-tail-top` | 竖向连线使用 *vertical-tail-padding* 与节点几何计算；标题偏移由 dot 节点居中公式计算。 |
| `--c-steps-circle-vertical-spacing-tail-bottom` | 竖向连线使用 *vertical-tail-padding* 与节点几何计算；标题偏移由 dot 节点居中公式计算。 |
| `--c-table-size-middle-padding-horizontal` | 公开 size 不含 middle；当前 md 使用 size-md，删除不可达旧 middle 档位。 |
| `--c-table-size-middle-padding-vertical` | 公开 size 不含 middle；当前 md 使用 size-md，删除不可达旧 middle 档位。 |
| `--c-table-size-middle-font-size` | 公开 size 不含 middle；当前 md 使用 size-md，删除不可达旧 middle 档位。 |
| `--c-table-size-middle-header-font-size` | 公开 size 不含 middle；当前 md 使用 size-md，删除不可达旧 middle 档位。 |
| `--c-textarea-counter-margin-top` | Cedar 为输入内绝对定位计数器，仅 inset/scrollbar 有意义；Maple 为输入外计数行，仅 counter-margin-top 有意义。 |
| `--c-transfer-width` | 容器自适应 width:100%，两列各50%；高度可定制但200px旧宽度不是当前布局入口。 |
| `--mp-breadcrumb-size-separator-height` | 分隔符跟随文本行高，字号由 separator-font-size 控制，无独立固定高度。 |
| `--mp-select-multi-popup-option-padding-horizontal` | 当前 Option 普通文本／slot 和多选 SelectionIndicator 使用同一 option-padding；无搜索 highlight DOM。 |
| `--mp-select-popup-option-highlight-text-color` | 当前 Option 普通文本／slot 和多选 SelectionIndicator 使用同一 option-padding；无搜索 highlight DOM。 |
| `--mp-select-popup-option-highlight-font-weight` | 当前 Option 普通文本／slot 和多选 SelectionIndicator 使用同一 option-padding；无搜索 highlight DOM。 |
| `--mp-steps-dot-vertical-item-title-margin-top` | 竖向连线使用 *vertical-tail-padding* 与节点几何计算；标题偏移由 dot 节点居中公式计算。 |
| `--mp-steps-dot-vertical-spacing-tail-top` | 竖向连线使用 *vertical-tail-padding* 与节点几何计算；标题偏移由 dot 节点居中公式计算。 |
| `--mp-steps-dot-vertical-spacing-tail-bottom` | 竖向连线使用 *vertical-tail-padding* 与节点几何计算；标题偏移由 dot 节点居中公式计算。 |
| `--mp-steps-circle-vertical-spacing-tail-top` | 竖向连线使用 *vertical-tail-padding* 与节点几何计算；标题偏移由 dot 节点居中公式计算。 |
| `--mp-steps-circle-vertical-spacing-tail-bottom` | 竖向连线使用 *vertical-tail-padding* 与节点几何计算；标题偏移由 dot 节点居中公式计算。 |
| `--mp-textarea-counter-inset-inline-end` | Cedar 为输入内绝对定位计数器，仅 inset/scrollbar 有意义；Maple 为输入外计数行，仅 counter-margin-top 有意义。 |
| `--mp-textarea-counter-inset-block-end` | Cedar 为输入内绝对定位计数器，仅 inset/scrollbar 有意义；Maple 为输入外计数行，仅 counter-margin-top 有意义。 |
| `--mp-textarea-scrollbar-offset` | Cedar 为输入内绝对定位计数器，仅 inset/scrollbar 有意义；Maple 为输入外计数行，仅 counter-margin-top 有意义。 |

## xl 几何补足

| 变量 | 默认值与场景 |
| --- | --- |
| `--c-form-size-xl-height` | `var(--c-size-xl)`；标签行高、内容与 wrapper 最小高度。 |
| `--c-form-size-xl-label-font-size` | `var(--c-sys-font-size-lg)`；xl 标签字号。 |
| `--c-form-size-xl-item-margin-bottom` | `var(--c-spacing-8)`；项目与验证文案预留间距。 |
| `--c-tree-size-xl-icon-size` | `var(--c-size-4)`；switcher 与缩进尺寸。 |
| `--c-tree-size-xl-font-size` | `var(--c-sys-font-size-lg)`；节点标题。 |
| `--c-tree-size-xl-line-height` | `var(--c-size-xl)`；switcher、checkbox 与 show-line 几何。 |
| `--c-tree-size-xl-title-padding-vertical` | `12px`；节点上下留白，承接 lg 的10px密度。 |

## 中央契约整合

- Select 删除 `multi-popup-option-padding-horizontal` 与 `popup-option-highlight-{font-weight,text-color}`。
- Steps 删除 `circle-vertical-spacing-tail-{top,bottom}`、`dot-vertical-item-title-margin-top`、`dot-vertical-spacing-tail-{top,bottom}`。
- Textarea 共享名称列表删除 `counter-inset-block-end`、`counter-inset-inline-end`、`counter-margin-top`、`scrollbar-offset`；两端登记 textarea 平台扩展，保留真正需要的本端布局入口。共同颜色/字号仍共享。
- 新增 `check:token-resolution` → `node bin/token-consumer-resolution-check.mjs`；纳入总验收链。
- inventory 新增每个 token 的 `definitions: [{selector,value}]`、`consumerProperties`，便于目录明确条件值与终端 CSS 属性。此属性证据仍不是 DOM 可达性的保证。

## 验证

- `node bin/token-consumer-resolution-check.mjs`：308 项编译 DOM/级联/覆盖断言通过；含两品牌明暗、五档 Form/Tree、error/inline 优先级与 reduced-motion。
- 全量 inventory：候选人工审查归零、编译错误零。
- Cedar：24测试文件、133测试通过；Maple：18文件、144测试通过。Maple全局lint与同源copies检查通过。
- `node bin/token-inventory.mjs --check-consumers --summary`：134个token文件、4026声明、54跨组件消费者、5已审查literal runtime消费者、20动态Space消费者；零人工候选、零编译错误。数量是此检查点，不覆盖其他并行阶段后续变化。
- 最终集成build/type与真实浏览器验收由主阶段汇总；不提前宣称浏览器全矩阵或可发布。

## 扩展复查与非颜色职责

- 删除 `--c-filter-form-col-gap`：原来只出现在注释中，实际Grid使用数值16；合法入口为 `gridProps.colGap`，不能用CSS覆盖绕过Grid的数值测量。
- 删除 `--c-internal-radio-transition-duration-1`、`--c-internal-radio-transition-timing-function-linear`：RadioButton迁移后不可达，保留新的RadioButton实现与样式。
- 5项literal runtime已逐条检查：两端Switch的shadow-color → handleStyle.boxShadow；NavMenu panel-width → full-height popup style.width；Scheduler editor-width → Drawer width → panelStyle.width；virtual-height → VirtualList height。扫描通过精确路径、表达式、去注释源码登记这些例外，新literal仅作为待审线索。
- Card明确只支持sm/md；Steps明确只支持sm/md；不是遗漏五档。Maple Form的size通过context继承给控件，自身表单布局保持移动端固定行规则。Cedar Form/Tree公共五档已补齐xl。Select/Textarea通过FieldDecorator继承五档，RadioGroup按钮尺寸由同源RadioButton实现负责。
- Card `animation-duration` 统一为system slow，`animation-easing`统一为system standard；Image缩放/滑动与Maple Textarea颜色过渡转为system动效。Form、Radio、Select、Steps、Tree、Image及Card每个动画分区添加精确reduced-motion规则。
- PageHeader两端使用30px反馈圆及system hover背景，hover限fine pointer且支持hover的媒体条件；focus-visible始终可用。圆形伪元素不推移标题布局。

Additional final checks: Maple PageHeader/Image 9 files / 75 tests and Cedar FilterForm 1 file / 5 tests pass. Both OpenSpec changes validate in strict mode (exit 0; optional telemetry network errors do not affect validation). Dialog reduced-motion and coarse-pointer PageHeader feedback are included in the 308 assertions. Image preview RGBA channels above 255 were normalized to 255, preserving browser-clamped appearance.
