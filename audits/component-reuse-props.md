# 公共 Props 导出集合复核

由 api-contract-inventory.mjs 从两库根入口追踪 TypeScript 符号生成（含子组件）。
仅比较实际公开运行时 Props 的键，不把工具目录当组件，也不据此声称事件、插槽、方法或行为完全相同。
已批准且实施的语义迁移见 api-alignment-plan.md；剩余集合差异是后续能力规划清单，不自动求并集。

Cedar：121 个 Props 导出；Maple：115 个；同名可比较：88 个。

| Props | Cedar / Maple 键数量 | 仅 Cedar | 仅 Maple |
| --- | --- | --- | --- |
| affixProps | 7 / 7 | — | — |
| alertProps | 10 / 10 | — | — |
| autoCompleteProps | 13 / 20 | `defaultValue`, `triggerProps`, `virtualListProps` | `blurColor`, `enterkeyhint`, `fieldNames`, `focusColor`, `hint`, `line`, `maxLength`, `placeholder`, `readonly`, `textColor` |
| avatarGroupProps | 9 / 9 | — | — |
| avatarProps | 15 / 15 | — | — |
| backTopProps | 6 / 7 | `ariaLabel`, `easing` | `bottom`, `elevation`, `right` |
| badgeProps | 16 / 16 | — | — |
| breadcrumbItemProps | 5 / 5 | — | — |
| breadcrumbProps | 3 / 3 | — | — |
| buttonGroupProps | 9 / 9 | — | — |
| buttonProps | 25 / 25 | — | — |
| cardProps | 19 / 19 | — | — |
| carouselProps | 25 / 24 | `ariaLabel`, `nextButtonAriaLabel`, `previousButtonAriaLabel` | `centeredSlides`, `effect` |
| cascaderProps | 31 / 28 | `defaultInputValue`, `defaultOpen`, `defaultValue`, `error`, `expandChild`, `fallback`, `filterOption`, `formatLabel`, `inputValue`, `loadMore`, `maxTagCount`, `searchDelay`, `searchOptionOnlyLabel`, `tagNowrap`, `triggerProps`, `virtualListProps` | `blurColor`, `closeOnSelect`, `focusColor`, `hint`, `line`, `pickerProps`, `popupProps`, `presentation`, `readonly`, `separator`, `tag`, `textColor`, `variant` |
| checkboxGroupProps | 7 / 5 | `defaultValue`, `disabled`, `error` | `fieldNames` |
| checkboxProps | 7 / 9 | `defaultChecked`, `error`, `uninjectGroupContext` | `checkedColor`, `iconSize`, `readonly`, `ripple`, `uncheckedColor` |
| colProps | 10 / 10 | — | — |
| collapseItemProps | 5 / 5 | — | — |
| collapseProps | 9 / 9 | — | — |
| countToProps | 6 / 6 | — | — |
| countdownProps | 3 / 3 | — | — |
| datePickerProps | 12 / 21 | `dayStartOfWeek`, `defaultValue`, `disabled`, `format`, `hideTrigger`, `mode`, `showNowBtn` | `buttonElevation`, `color`, `elevation`, `firstDayOfWeek`, `hint`, `max`, `min`, `multiple`, `presentation`, `range`, `readonly`, `showCurrent`, `titleColor`, `touchable`, `type`, `useSeconds` |
| dateProps | 17 / 26 | `defaultOpen`, `defaultValue`, `error`, `format` | `blurColor`, `disabledTime`, `focusColor`, `hint`, `line`, `max`, `min`, `multiple`, `popupProps`, `presentation`, `separator`, `textColor`, `useSeconds` |
| dateRangePickerProps | 35 / 14 | `abbreviation`, `clearable`, `dayStartOfWeek`, `defaultOpen`, `defaultPickerValue`, `defaultValue`, `disabled`, `disabledInput`, `error`, `exchangeTime`, `format`, `hideTrigger`, `locale`, `mode`, `open`, `pickerValue`, `placeholder`, `placement`, `popupContainer`, `previewShortcut`, `separator`, `shortcuts`, `shortcutsPosition`, `showConfirmBtn`, `size`, `triggerProps`, `unmountOnClose`, `valueFormat`, `variant` | `datePickerProps`, `elevation`, `max`, `min`, `pickerProps`, `presentation`, `type`, `useSeconds` |
| dateRangeProps | 18 / 28 | `defaultOpen`, `defaultValue`, `error`, `format` | `blurColor`, `datePickerProps`, `disabledTime`, `focusColor`, `hint`, `line`, `max`, `min`, `pickerProps`, `popupProps`, `presentation`, `textColor`, `timePickerProps`, `useSeconds` |
| dialogProps | 44 / 44 | — | — |
| dividerProps | 10 / 10 | — | — |
| dropdownMenuProps | 25 / 26 | — | `strategy` |
| ellipsisProps | 4 / 4 | — | — |
| emptyProps | 6 / 6 | — | — |
| formProps | 14 / 6 | `autoLabelWidth`, `id`, `labelAlign`, `labelColProps`, `labelColStyle`, `rules`, `size`, `wrapperColProps`, `wrapperColStyle` | `readonly` |
| gridItemProps | 3 / 3 | — | — |
| gridProps | 5 / 5 | — | — |
| hoverOverlayProps | 2 / 2 | — | — |
| iconProps | 7 / 7 | — | — |
| imagePreviewGroupProps | 24 / 24 | — | — |
| imagePreviewProps | 22 / 22 | — | — |
| imageProps | 26 / 26 | — | — |
| infiniteScrollProps | 5 / 5 | — | — |
| inputNumberProps | 17 / 17 | — | — |
| inputProps | 15 / 23 | `defaultValue`, `error`, `showWordLimit`, `wordLength`, `wordSlice` | `ariaLabel`, `autocomplete`, `autofocus`, `blurColor`, `enterkeyhint`, `focusColor`, `hint`, `isForceErrorEffect`, `isForceFocusingEffect`, `line`, `modelModifiers`, `placeholderFocusColor`, `textColor` |
| linkProps | 9 / 9 | — | — |
| listProps | 8 / 5 | `maxHeight`, `scrollbar`, `virtualListProps` | — |
| loadingProps | 7 / 7 | — | — |
| menuOptionProps | 9 / 9 | — | — |
| messageProps | 7 / 18 | `closeButtonAriaLabel`, `resetOnHover`, `resetOnUpdate` | `_update`, `content`, `contentClass`, `elevation`, `forbidClick`, `loadingColor`, `loadingRadius`, `loadingSize`, `loadingType`, `lockScroll`, `open`, `popupContainer`, `position`, `vertical` |
| overlayProps | 8 / 8 | — | — |
| pageHeaderProps | 4 / 4 | — | — |
| paginationProps | 23 / 23 | — | — |
| paperProps | 8 / 8 | — | — |
| popoverProps | 45 / 45 | — | — |
| progressGroupProps | 10 / 10 | — | — |
| progressProps | 12 / 12 | `animation`, `bufferColor`, `steps` | `rotate`, `textClass`, `track` |
| radioGroupProps | 8 / 5 | `defaultValue`, `disabled`, `error`, `size`, `variant` | `ariaLabel`, `fieldNames` |
| radioProps | 7 / 8 | `defaultChecked`, `error`, `uninjectGroupContext`, `variant` | `checkedColor`, `iconSize`, `readonly`, `ripple`, `uncheckedColor` |
| rateProps | 17 / 17 | — | — |
| resultProps | 5 / 5 | — | — |
| rowProps | 5 / 5 | — | — |
| selectProps | 35 / 26 | `creatable`, `defaultActiveFirstOption`, `defaultInputValue`, `defaultOpen`, `defaultValue`, `error`, `fallbackOption`, `filterOption`, `filterable`, `formatLabel`, `inputValue`, `limit`, `loading`, `maxTagCount`, `scrollbar`, `searchDelay`, `showExtraOptions`, `showFooterOnEmpty`, `showHeaderOnEmpty`, `tagNowrap`, `triggerProps`, `unmountOnClose`, `virtualListProps` | `blurColor`, `focusColor`, `hint`, `line`, `offsetY`, `pickerProps`, `placement`, `popupProps`, `presentation`, `readonly`, `separator`, `tag`, `textAlign`, `textColor` |
| skeletonLineProps | 4 / 4 | — | — |
| skeletonProps | 12 / 12 | — | — |
| skeletonShapeProps | 2 / 2 | — | — |
| sliderProps | 13 / 16 | `defaultValue`, `formatTooltip`, `marks`, `showInput`, `showTicks`, `showTooltip` | `activeColor`, `labelColor`, `labelTextColor`, `labelVisible`, `readonly`, `thumbColor`, `thumbSize`, `trackColor`, `trackHeight` |
| spaceProps | 6 / 6 | — | — |
| splitButtonProps | 21 / 21 | — | — |
| statisticProps | 16 / 16 | — | — |
| stepProps | 6 / 6 | — | — |
| stepsProps | 9 / 9 | — | — |
| styleProviderProps | 2 / 2 | — | — |
| switchProps | 17 / 17 | — | — |
| tabItemProps | 2 / 2 | — | — |
| tabNavProps | 4 / 4 | — | — |
| tabPaneProps | 6 / 6 | — | — |
| tableProps | 42 / 3 | `bordered`, `columnResizable`, `columns`, `components`, `data`, `defaultExpandAllRows`, `defaultExpandedKeys`, `defaultSelectedKeys`, `draggable`, `expandable`, `expandedKeys`, `extraColumn`, `filterIconAlignLeft`, `fit`, `height`, `hideExpandButtonOnEmpty`, `hoverable`, `indentSize`, `loadMore`, `loading`, `maxHeight`, `pagePosition`, `pagination`, `rowClass`, `rowKey`, `rowNumber`, `rowSelection`, `scrollbar`, `selectedKeys`, `showEmptyTree`, `showHeader`, `size`, `spanAll`, `spanMethod`, `stickyHeader`, `stickyPagination`, `stripe`, `summary`, `summarySpanMethod`, `summaryText`, `tableLayout`, `virtualListProps` | `elevation`, `fullWidth`, `scrollerHeight` |
| tabsItemsProps | 0 / 0 | — | — |
| tabsNavsProps | 0 / 0 | — | — |
| tabsProps | 25 / 25 | — | — |
| tagProps | 14 / 14 | — | — |
| textareaProps | 15 / 20 | `autoSize`, `defaultValue`, `error`, `showWordLimit`, `wordLength`, `wordSlice` | `ariaLabel`, `autofocus`, `blurColor`, `enterkeyhint`, `focusColor`, `hint`, `line`, `modelModifiers`, `resize`, `rows`, `textColor` |
| timePickerProps | 26 / 13 | `clearable`, `defaultOpen`, `defaultValue`, `disableConfirm`, `disabled`, `disabledHours`, `disabledMinutes`, `disabledSeconds`, `error`, `hideDisabledOptions`, `hideTrigger`, `open`, `placeholder`, `placement`, `popupContainer`, `showNextDay`, `size`, `step`, `triggerProps`, `type`, `unmountOnClose`, `use12Hours`, `variant` | `color`, `disabledTime`, `elevation`, `hint`, `max`, `min`, `pickerProps`, `presentation`, `titleColor`, `useSeconds` |
| timeProps | 20 / 23 | `defaultOpen`, `defaultValue`, `disableConfirm`, `disabledHours`, `disabledMinutes`, `disabledSeconds`, `error`, `step`, `use12Hours` | `blurColor`, `disabledTime`, `focusColor`, `hint`, `line`, `max`, `min`, `pickerProps`, `popupProps`, `presentation`, `textColor`, `useSeconds` |
| timeRangePickerProps | 25 / 12 | `clearable`, `defaultOpen`, `defaultValue`, `disableConfirm`, `disabled`, `disabledHours`, `disabledMinutes`, `disabledSeconds`, `error`, `hideDisabledOptions`, `hideTrigger`, `open`, `placeholder`, `placement`, `popupContainer`, `size`, `step`, `triggerProps`, `unmountOnClose`, `use12Hours`, `variant` | `disabledTime`, `elevation`, `max`, `min`, `pickerProps`, `presentation`, `timePickerProps`, `useSeconds` |
| timeRangeProps | 21 / 26 | `defaultOpen`, `defaultValue`, `disableConfirm`, `disabledHours`, `disabledMinutes`, `disabledSeconds`, `error`, `step`, `use12Hours` | `blurColor`, `disabledTime`, `focusColor`, `hint`, `line`, `max`, `min`, `pickerProps`, `popupProps`, `presentation`, `separator`, `textColor`, `timePickerProps`, `useSeconds` |
| tooltipProps | 48 / 48 | — | — |
| triggerProps | 43 / 43 | — | — |
| uploadProps | 37 / 19 | `action`, `autoUpload`, `beforeUpload`, `createThumbnailUrl`, `customRequest`, `data`, `defaultValue`, `directory`, `draggable`, `headers`, `imageFit`, `isSuccessResponse`, `listType`, `maxTotalSize`, `method`, `name`, `showCancelButton`, `showDownloadButton`, `showPreviewButton`, `showRetryButton`, `showUploadButton`, `withCredentials` | `elevation`, `onClickAction`, `preventDefaultPreview`, `ripple` |
| verificationCodeProps | 11 / 22 | — | `align`, `allowPaste`, `autofocus`, `blurColor`, `focusColor`, `gutter`, `maskSymbol`, `pasteTransform`, `textColor`, `type`, `variant` |
| watermarkProps | 14 / 11 | `antiTamper`, `grayscale`, `repeat`, `staggered` | `fullscreen` |

## 仅 Cedar 根入口存在的 Props 导出

`anchorProps`, `calendarProps`, `colorPickerProps`, `colorProps`, `configProviderProps`, `descriptionsItemProps`, `descriptionsProps`, `drawerProps`, `filterFormProps`, `inputPasswordProps`, `inputTagProps`, `layoutProps`, `mapProps`, `mentionProps`, `navMenuItemProps`, `navMenuProps`, `notificationProps`, `overflowListProps`, `peopleSelectProps`, `popconfirmProps`, `resizeBoxProps`, `schedulerProps`, `scrollbarProps`, `segmentedProps`, `splitProps`, `timelineProps`, `transferProps`, `treeProps`, `treeSelectProps`, `typographyParagraphProps`, `typographyProps`, `typographyTextProps`, `typographyTitleProps`

## 仅 Maple 根入口存在的 Props 导出

`actionSheetProps`, `carouselItemProps`, `cellProps`, `codeProps`, `counterProps`, `dragProps`, `fabProps`, `fieldDecoratorProps`, `floatingPanelProps`, `formDetailsProps`, `formItemProps`, `highlighterProviderProps`, `indexAnchorProps`, `indexBarProps`, `loadingBarProps`, `localeProviderProps`, `noticeBarProps`, `numberKeyboardProps`, `optionProps`, `pickerProps`, `popupProps`, `pullRefreshProps`, `searchProps`, `signatureProps`, `swipeCellProps`, `tabBarItemProps`, `tabBarProps`
