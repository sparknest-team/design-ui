# AutoComplete 修改后的最新生产验收

状态：进行中，尚未签收。必须等其他生产输入改造完成，在同一稳定输入上重新构建并完成完整矩阵，不能使用旧结果。

本次要求覆盖 Maple AutoComplete 的 popup / inline 候选样式与 Select 一致、inline 输入框下方 4px 的定位、真实滚动后等宽且左右对齐，以及真实选择与 popup 草稿确认。

## 第一轮记录（不作为最终通过）

- 两库重新构建成功，构建前后指纹一致。
- AutoComplete 专项首次比较暴露测试前置状态不同：Select 行处于 active，AutoComplete 行为普通 selected。保留首次失败；改为分别对齐 selected 与 hover，并分别比较颜色和几何。点击 Select 同值选项正常关闭对照列表，避免列表拦截后续输入。
- 此后 8 项真实生产专项通过，覆盖桌面文档 / 手机示例 × 默认亮暗 × popup / inline；但随后并行主题改造再次改变两库输入，因此这些通过只代表该轮固定快照，不作为最终版本通过。
- Cedar Scheduler 首例从“首页设计评审 / 接口联调”变为“项目同步”，旧浏览器断言未同步。已让完整矩阵和原主题专项分别核对实际月视图、周视图内的“项目同步”，保留模式切换和事件渲染断言。
- 新 SafeArea 手机示例缺少标准 section，实际被手机映射门禁及完整矩阵拦截。补齐 `section[data-demo="basic"]`，不删除案例或豁免映射；文档清单 7/7 通过。
- 验收期间 Alps / Firefly、FieldDecorator 与 Checkbox 生产输入发生修改，守卫实际拦截；停止失效测试，整轮证据封存到 `evidence/autocomplete-final-2026-10-25/round1-invalidated/`。

## 最终签收条件

重新构建同一份稳定输入，完整执行 Cedar 212、Maple 388 项（含各 4 项外网永久挂起专项）及原主题专项 45 / 6 项（Maple 每项内部的主题循环已新增 Alps / Firefly，仍覆盖全部六个桌面／手机断点组合）；另执行最新产物 AutoComplete 8 项真实文档专项。保持 5000ms 导航门槛、真实交互、源码逐字一致性、全部主题和手机分支，不以筛选后的诊断轮代替完整运行。

独立脚本核对完整 TAP / spec 计数为零失败、跳过、取消；源码与生产双指纹前后一致；当前生产 index 与完整矩阵及 AutoComplete 专项哈希一致；本次 AutoComplete 六份实现、样式与 Form demo 文件哈希不变。只有脚本成功写出 `final-receipt.json` 才能最终签收。

## 当前等待条件

主题任务仍在修复生产文档品牌切换问题，不能仅凭一次源码静默采样视为稳定。最近稳定性复核再次实际失败：Maple source 从 `5d9389b914b370ebf2db36b5b5bef0bf496a11010c28adbb81616b0f44cb7624` 变为 `36b54355223238be9de2e7275d62528e34e0a325b758ca813a4c3138dc53e6dc`，production 从 `4ab583929e38029a9be8e31bf80c66450ff99744f4b4c69b19da63161db74e69` 变为 `f31648efad823c12ee1d3ae9d4a46da2916f2bf687ac1e3624c02ea7f963b3dd`。没有继续构建或签收该基线。

已更新本聊天的后续自动检查：等待主题任务完成后实际继续构建、完整矩阵及8项AutoComplete专项，并按独立收据核验；不再只是读取旧协调报告。

## 第二轮执行中

主题与异步数据源改造任务均已完成。重新记录并间隔约一分钟比较两库双指纹，比较通过；已启动全新文档构建。公共 CI／清单／导航契约 30/30、完整同源门禁及样式变量契约通过。此处只记录进度，仍需等完整矩阵和独立最终收据，不作为签收结论。

## 第二轮并行资源诊断（未通过轮保留）

该轮两库生产输入均稳定，但同时运行两个默认并发度为2的矩阵，在本机共形成4个并发页面。Cedar 3项失败于源码展开/点击5000ms门槛，Maple 1项失败于LoadingBar结束等待；均未签收，完整失败轮保留于 `round2-parallel-failed/`。

当时实测主机8核，1分钟负载约29、5分钟约42，可用内存约0.4GiB。没有改产品或延长时限。结束并行作业后，使用独立、单上下文诊断复核 Cedar Badge 全部12份源码及 Maple LoadingBar真实开始/结束：各2轮，4/4通过，源码逐份展开最长约153ms，LoadingBar DOM时序包含从挂载到完成移除。请求、逐步耗时和DOM采样均保留于 `resource-diagnostic/`。

这些数据支持存在资源压力，但不追溯断言每个超时的唯一原因。后续按既有构建/CI规范允许的 `DOCS_BROWSER_CONCURRENCY=1`，并且两库顺序执行，控制本机总浏览器并发为1；仍须完成全部用例、原5000ms与30秒门槛、源码和双指纹检查。单项诊断通过不代替完整矩阵通过。

## 串行重验前再次被输入守卫拦截

2026-10-25 本轮在启动串行完整矩阵前，严格基线比较失败，未启动失效产物测试。Maple source 从 `36b54355223238be9de2e7275d62528e34e0a325b758ca813a4c3138dc53e6dc` 变为 `e45182b6602a091ace74685f49c62c654ecfbd0f0ffaa0c02b4c93aaad4f2c51`，production 从 `f31648efad823c12ee1d3ae9d4a46da2916f2bf687ac1e3624c02ea7f963b3dd` 变为 `aa2057e5d3bcedc3f9ed3318266098187c00c53a0d1a246ae8d38e3858b9ec2e`。Cedar 双指纹未变。

只读复核主题任务 `01a171e8-4bbe-7c20-bac1-a4f7cb9262e8` 的最新一轮为进行中：用户新增完整表单 App 四边安全区模拟及 Alps／Firefly 暗色要求，任务正在修改主题、文档客户端和表单示例并验证。此前“均已完成”仅描述第二轮开始时的状态，目前已重新进入等待。待该轮结束且重新稳定后，须重新构建并执行全部矩阵与 AutoComplete 8项专项；未来主题覆盖也须按实际最新主题清单扩展。

当前无 `final-receipt.json`，所有历史通过及本轮单项诊断均不代表最终签收。最新等待快照保留于 `awaiting-brand-dark-snapshot.json`。

## 第三轮完整串行验收进行中

主题任务新增安全区模拟和 Alps／Firefly 暗色的一轮已完成；异步数据源任务也已完成。重新间隔约一分钟核对双指纹稳定，两库重新构建成功，构建前后再次严格一致。Maple 当前 source 为 `276606094d22eadfe30e1cce466090e3602808869964f92ade9e100542d82bb9`，production 为 `bb57ffaaaf897bd00c716c8f6ab01475b04d83b9d3b355c95fd6ceda47a3f1f4`。

本轮两库顺序执行完整组件矩阵，并发度为1。Maple 原6项主题专项现已逐项循环全部8套主题（含新增 Alps／Firefly 暗色）及320/375/390断点；验收脚本哈希及8套主题清单保存在 `acceptance-runners.json`，最终收据还将核对验收脚本没有中途改变。完整组件矩阵和 AutoComplete 专项仍须全部通过后才可签收。

## 第三轮已失效，重新等待两项改造结束

Cedar 完整矩阵在该轮快照上 212/212 通过，但随后 Maple 完整矩阵执行期间，双库 source / production 守卫再次失败。只读核对发现两个任务均已收到新需求而恢复修改：主题任务继续选择器及品牌适配，另一任务直接给两端 AutoComplete 加入 `caseSensitive` 并迁移测试和 Demo。这些修改不能被本轮旧构建覆盖。

守卫观测到 Cedar source / production 变为 `78fbf04fc6a0a4d4cbbce6b967490fe8b155cefb92563da040ac204ee71f6311` / `37f1908f76c665bbdc060fcde22b02440ff47c96404c25e4453e62316f3fb510`，Maple 变为 `07772389df6af919206ab37d199c9be8a2e03e48970dd2085d22e973282e19d0` / `433a3ff02cba037addfb63721d0b4fd3c0687a8a079c5c01746a97eed8d87e63`。后续实际快照及严格比较错误单独保存，生产输入仍可能继续变化。

已仅停止本聊天本轮 Maple 测试及其浏览器子进程，没有停止其他任务。第三轮构建日志、Cedar 完整通过、Maple 未完成日志、旧基线、验收脚本清单和失效守卫记录均封存至 `round3-invalidated/`，全部不作为最终签收。没有启动主题或 AutoComplete 专项去测试失效产物。须待两个任务均完成且重新稳定后，从新构建开始完整重验；自动检查继续保留。

归档期间另一次复核命令尚未退出，归档移动基线使它记录了 ENOENT；该原始错误保留于 `invalidation-guard.log`。初次实际指纹比较失败已如上记录；后续已完成的 `invalidation-snapshot.json` 与归档基线再做离线严格比较，同样失败，保存在 `invalidation-comparison.log`。不把文件路径错误混作生产指纹变化的依据。
