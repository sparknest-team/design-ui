# active / expanded / highlight 浏览器验收（2026-10-24）

环境：Chrome，本地 Cedar 文档站 `http://localhost:9991`、Maple 文档站 `http://localhost:8080`。Maple 同时检查文档正文 demo 与 `iframe#mobile` 手机示例（本次实际宽度约 369px）。通过页面真实点击、键盘激活、可见渲染文字、DOM 状态/样式及截图核对；未从 Vue 私有实例读取状态。

这是本地开发站的针对性验收，不代表生产构建的全组件、亮暗主题矩阵验收。

## 浏览器结果

| 组件 | Cedar 文档页 | Maple 文档页 | Maple 手机示例 | 实际核对内容 |
| --- | --- | --- | --- | --- |
| Menu | 通过 | 通过 | 通过 | 父分支有路径强调但显示“当前项未选中”；账户/通知切换只更新当前子项；渲染函数、option-extra 插槽、自定义 MenuOption 均正常；highlight 不会提前选中帮助项，点击后才变为已选中 |
| NavMenu | 通过 | 无此组件 | 无此组件 | 独立入口主值 null/未知值时 active=false，0/空字符串匹配选项时 active=true；highlight=true 可强调 active=false 的入口，highlight=false 可取消 active=true 的外观强调；open 独立；具名入口只在选择叶子后切换，两个面板值互不清空 |
| Collapse | 通过 | 通过 | 通过 | 子项自定义图标 ^^→vv、根下发图标 ▼→▶，与 aria-expanded 的 true→false 同步 |
| Steps | 通过 | 通过 | 通过 | 切换当前步骤后 active 类移动到新项；当前项 status=error 时仍保留 active；Maple 手机示例切至第 4 步正常 |
| TabBar | 无此组件 | 通过 | 通过 | 通过 name 匹配的标签切换后仅一个 active；手机点击发现后只激活发现；activeColor/inactiveColor 分别作用于当前项与其他项 |

Cedar Steps 可切换示例从第 1 步切到第 2 步，主内容同步为 Step2 Content。Maple 可切换示例切至第 3 步并设为 error，仍只有该项 active。TabBar 自定义颜色例切到收藏后，收藏为 rgb(255,125,0)，其他项为 rgb(78,89,105)。

手机 Menu 的换行触发按钮可能被已打开的菜单遮住；这时先验证可见状态，再使用按钮键盘激活核对菜单切换，不将被遮挡的坐标点击误记为触发按钮成功。

## 本轮发现与修复

1. 实际浏览器复现：展开一个 Menu 子菜单后切换另一个触发按钮，旧父菜单残留。原因是预先挂载的子层可能先处理同一个 document capture click 并关闭自身，父层随后已无法确认原顶层属于自己的后代。
2. 双端共享 Trigger interaction 保留同一事件内的后代关闭归属；点击同级触发器时可关闭旧父子分支，同时继续遵守无关顶层的保护。未增加或改动公开 API。
3. 新增 `nested-peer-close.spec.js`，覆盖 unmountOnClose=false/true 两种挂载方式。浏览器复查 Cedar 和 Maple 文档页仅剩新菜单；Maple 手机示例通过键盘切换也仅剩新菜单。
4. 补充 Cedar `entry-state.vue` 并接入 NavMenu README，直接显示 active/open，提供跟随/强制/取消 highlight、清空和未匹配值操作。具名入口同屏展示，便于人工复查。
5. Maple 旧开发进程缺少已存在的共享预览模块映射；重启当前本地服务后恢复，未通过修改组件或关闭错误覆盖层绕过。

## 验证

- Cedar 受影响测试：39 个文件、294 项通过。
- Maple 受影响测试：34 个文件、265 项通过。
- 双端源码类型检查通过；Cedar 受影响范围 lint、Maple 全库 lint:check 通过。
- 同源基础检查 68 对通过。
- 全量 demo 规范检查：550 review SFC、2862 demo SFC、1873 文档片段通过。
- 当前页面控制台未发现组件运行错误；Cedar 仅有既存 vue-router 深层导入弃用警告，Maple 无 error/warn。

## 截图

- [Cedar Menu 父项路径强调](evidence/active-expanded-browser-2026-10-24/cedar-menu-path.jpg)
- [Cedar Menu 切换后只保留新菜单](evidence/active-expanded-browser-2026-10-24/cedar-menu-peer-fixed.jpg)
- [Cedar NavMenu highlight=true、active=false](evidence/active-expanded-browser-2026-10-24/cedar-nav-highlight.jpg)
- [Cedar NavMenu 具名入口切换](evidence/active-expanded-browser-2026-10-24/cedar-nav-named.jpg)
- [Cedar Collapse expanded](evidence/active-expanded-browser-2026-10-24/cedar-collapse-expanded.jpg)
- [Cedar Steps active](evidence/active-expanded-browser-2026-10-24/cedar-steps-active.jpg)
- [Maple Menu 路径强调](evidence/active-expanded-browser-2026-10-24/maple-menu-path.jpg)
- [Maple Menu highlight](evidence/active-expanded-browser-2026-10-24/maple-menu-highlight.jpg)
- [Maple 手机 Menu 当前项](evidence/active-expanded-browser-2026-10-24/maple-mobile-menu.jpg)
- [Maple 手机 Menu 切换后只保留新菜单](evidence/active-expanded-browser-2026-10-24/maple-mobile-peer-fixed.jpg)
- [Maple Collapse expanded](evidence/active-expanded-browser-2026-10-24/maple-collapse-expanded.jpg)
- [Maple Steps active](evidence/active-expanded-browser-2026-10-24/maple-steps-active.jpg)
- [Maple TabBar active](evidence/active-expanded-browser-2026-10-24/maple-tab-bar-active.jpg)
