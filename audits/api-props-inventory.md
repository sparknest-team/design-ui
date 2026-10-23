# 公共 Props 导出集合复核

由 api-contract-inventory.mjs 从两库根入口追踪 TypeScript 符号生成（含子组件）。
仅比较实际公开运行时 Props 的键，不把工具目录当组件，也不据此声称事件、插槽、方法或行为完全相同。
已批准且实施的语义迁移见 api-alignment-plan.md；剩余集合差异是后续能力规划清单，不自动求并集。

Cedar：129 个 Props 导出；Maple：119 个；同名可比较：97 个。

| Props | Cedar / Maple 键数量 | 仅 Cedar | 仅 Maple |
| --- | --- | --- | --- |
| affixProps | 7 / 7 | — | — |
| alertProps | 10 / 10 | — | — |
| autoCompleteProps | 29 / 29 | — | — |
| avatarGroupProps | 9 / 9 | — | — |
| avatarProps | 15 / 15 | — | — |
| backTopProps | 9 / 9 | — | — |
| badgeProps | 16 / 16 | — | — |
| breadcrumbItemProps | 5 / 5 | — | — |
| breadcrumbProps | 3 / 3 | — | — |
| buttonGroupProps | 9 / 9 | — | — |
| buttonProps | 25 / 25 | — | — |
| cardProps | 19 / 19 | — | — |
| carouselItemProps | 0 / 0 | — | — |
| carouselProps | 27 / 27 | — | — |
| cascaderPanelProps | 0 / 0 | — | — |
| cascaderProps | 43 / 45 | — | `pickerProps`, `popupProps` |
| checkboxGroupProps | 11 / 11 | — | — |
| checkboxProps | 14 / 14 | — | — |
| colProps | 10 / 10 | — | — |
| collapseItemProps | 5 / 5 | — | — |
| collapseProps | 9 / 9 | — | — |
| countToProps | 6 / 6 | — | — |
| countdownProps | 3 / 3 | — | — |
| datePickerProps | 24 / 34 | — | `buttonElevation`, `color`, `elevation`, `hint`, `multiple`, `pickerProps`, `presentation`, `range`, `titleColor`, `touchable` |
| dateProps | 32 / 35 | — | `multiple`, `pickerProps`, `presentation` |
| dateRangePickerProps | 24 / 28 | — | `datePickerProps`, `elevation`, `pickerProps`, `presentation` |
| dateRangeProps | 32 / 35 | — | `datePickerProps`, `pickerProps`, `presentation` |
| dialogProps | 45 / 45 | — | — |
| dividerProps | 10 / 10 | — | — |
| menuProps | 26 / 26 | — | — |
| ellipsisProps | 5 / 5 | — | — |
| emptyProps | 6 / 6 | — | — |
| fieldDecoratorProps | 20 / 20 | — | — |
| formItemProps | 31 / 31 | — | — |
| formProps | 16 / 16 | — | — |
| gridItemProps | 3 / 3 | — | — |
| gridProps | 5 / 5 | — | — |
| hoverOverlayProps | 2 / 2 | — | — |
| iconProps | 7 / 7 | — | — |
| imagePreviewGroupProps | 24 / 24 | — | — |
| imagePreviewProps | 22 / 22 | — | — |
| imageProps | 26 / 26 | — | — |
| infiniteScrollProps | 5 / 5 | — | — |
| inputGroupProps | 5 / 5 | — | — |
| inputNumberProps | 19 / 19 | — | — |
| inputPasswordProps | 27 / 27 | — | — |
| inputProps | 24 / 24 | — | — |
| linkProps | 9 / 9 | — | — |
| listProps | 8 / 8 | — | — |
| loadingProps | 7 / 7 | — | — |
| menuOptionProps | 9 / 9 | — | — |
| messageProps | 14 / 14 | — | — |
| optgroupProps | 0 / 0 | — | — |
| optionProps | 0 / 0 | — | — |
| overlayProps | 8 / 8 | — | — |
| pageHeaderProps | 4 / 4 | — | — |
| paginationProps | 23 / 23 | — | — |
| paperProps | 8 / 8 | — | — |
| popoverProps | 45 / 45 | — | — |
| progressGroupProps | 11 / 11 | — | — |
| progressProps | 15 / 15 | — | — |
| radioGroupProps | 12 / 12 | — | — |
| radioProps | 15 / 15 | — | — |
| rateProps | 18 / 18 | — | — |
| resultProps | 5 / 5 | — | — |
| rowProps | 5 / 5 | — | — |
| searchProps | 39 / 39 | — | — |
| selectProps | 45 / 47 | — | `pickerProps`, `popupProps` |
| skeletonLineProps | 4 / 4 | — | — |
| skeletonProps | 12 / 12 | — | — |
| skeletonShapeProps | 2 / 2 | — | — |
| sliderProps | 23 / 23 | — | — |
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
| textareaProps | 26 / 26 | — | — |
| timePickerProps | 16 / 20 | `showNextDay`, `type` | `color`, `elevation`, `hint`, `pickerProps`, `presentation`, `titleColor` |
| timeProps | 30 / 32 | — | `pickerProps`, `presentation` |
| timeRangePickerProps | 15 / 19 | — | `elevation`, `pickerProps`, `presentation`, `timePickerProps` |
| timeRangeProps | 32 / 35 | — | `pickerProps`, `presentation`, `timePickerProps` |
| tooltipProps | 48 / 48 | — | — |
| triggerProps | 43 / 43 | — | — |
| uploadProps | 40 / 40 | — | — |
| verificationCodeProps | 22 / 22 | — | — |
| watermarkProps | 15 / 15 | — | — |

## 仅 Cedar 根入口存在的 Props 导出

`anchorProps`, `calendarProps`, `colorPickerProps`, `colorProps`, `configProviderProps`, `descriptionsItemProps`, `descriptionsProps`, `drawerProps`, `filterFormProps`, `inputTagProps`, `layoutProps`, `mapProps`, `mentionProps`, `navMenuItemProps`, `navMenuProps`, `notificationProps`, `overflowListProps`, `peopleSelectProps`, `popconfirmProps`, `resizeBoxProps`, `schedulerProps`, `scrollbarProps`, `segmentedProps`, `splitProps`, `timelineProps`, `transferProps`, `treeProps`, `treeSelectProps`, `typographyParagraphProps`, `typographyProps`, `typographyTextProps`, `typographyTitleProps`

## 仅 Maple 根入口存在的 Props 导出

`actionSheetProps`, `cellProps`, `codeProps`, `counterProps`, `dragProps`, `fabProps`, `floatingPanelProps`, `formDetailsProps`, `highlighterProviderProps`, `indexAnchorProps`, `indexBarProps`, `loadingBarProps`, `localeProviderProps`, `noticeBarProps`, `numberKeyboardProps`, `pickerProps`, `popupProps`, `pullRefreshProps`, `signatureProps`, `swipeCellProps`, `tabBarItemProps`, `tabBarProps`
