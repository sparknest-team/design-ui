# Countdown 暂停展示与业务时钟

两端的 `pause` 在动画帧未执行时按当前时间冻结剩余时长，但此前未同步格式化文本和插槽数据；例如 1000ms 倒计时在 400ms 暂停，内部剩余 600ms，展示却仍是 1000ms。现在暂停和 KeepAlive 停用会同步冻结值，不额外触发 `change`。若暂停时已过截止时间，显示零；保持原有事件时机，恢复运行时触发一次 `end`。

两端新增回归用例覆盖暂停、暂停后修改格式、KeepAlive 停用和到期后暂停恢复；原时钟所有权测试继续运行。Cedar 的 13 个时钟用例及 5 个同源用例通过，Maple 的 13 个时钟用例通过，均在 jsdom 下执行。

## 当前源码的浏览器复核

使用独立 ego lite TaskSpace 对当前源码重新采集首帧诊断：Cedar／Maple 各自的 InputNumber 与 Countdown 共四个场景通过，采集前后被追踪源码指纹一致；报告、截图和指纹由 `node --test bin/business-lifecycle-evidence-check.test.mjs` 校验（28 项通过）。旧报告与截图保存在 `evidence/business-lifecycle-first-frame-2026-11-12-before-pause-fix/`，当前结果在 `evidence/business-lifecycle-first-frame-2026-11-12-ego/`。该诊断覆盖真实帧上的既有生命周期行为，未专门证明暂停显示修复，也不替代原有固定 200ms 采样门禁；后者仍待处理。

另用 `countdown-pause-diagnostic.html` 在真实浏览器中控制 RAF 不执行、使用真实 performance 时钟，验证两端真实组件默认文本及插槽。延迟约 300ms 后暂停，Cedar 读取 2696／2696ms、Maple 2698／2697ms；两端暂停前后 change 数量都为 4。原始报告、截图和前后源码指纹位于 `evidence/countdown-pause-2026-11-12-ego/`。这个夹具不验证真实 RAF 调度或组件帧清理（页面全局 RAF 计数无法归因），帧所有权仍由单测及独立生命周期诊断覆盖。

同一浏览器空间重新运行原固定 200ms Countdown 采样：两端 inactive reset 均为 900ms，reactivated 样本仍为 900ms，均未通过；原始结果另存为 `original-200ms-sample.json`。这与首帧诊断属于不同采样条件，不能将前者标绿或用后者代替。

### 诊断完整性复核

原固定时间夹具的 `remaining` 取自最后一次 `change`，其断言要求重新激活后 200ms 内事件值小于 900ms；两端采样没有满足。首帧诊断证明所测环境首次实际帧执行后可追赶时间，不证明 200ms 内必有帧。`node bin/business-lifecycle-evidence-check.mjs` 仍因历史夹具指纹不一致失败，该历史门禁尚未关闭。

上一次首帧证据只记录了 CDP 异常，未采集页面的 console 警告、错误和未处理拒绝，因此不能据其空诊断数组推断页面无警告。本次在独立 ego lite 空间重采集四个场景：全部通过，页面诊断及 CDP 异常均为空，源码指纹前后一致；之前仅采集 CDP 的报告和截图归档在 `evidence/business-lifecycle-first-frame-2026-11-12-cdp-only/`。校验器现要求明确记录两类诊断来源，并增加缺失来源的反例；`node --test bin/business-lifecycle-evidence-check.test.mjs` 29 项通过。此结果不改变原 200ms 门禁状态。
