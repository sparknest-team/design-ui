# 当前源码生命周期证据（2026-11-12 重采集）

本目录的 `results.json` 与 `screenshot.png` 来自独立 ego lite TaskSpace 280，使用任务专用 Vite 服务（`127.0.0.1:5298`，关闭文件监听）加载当前源码。任务 Space 已在采集完成后关闭。

## 采集协议与结果

- 按 Cedar InputNumber、Maple InputNumber、Cedar Countdown、Maple Countdown 的顺序执行四个真实组件案例，全部通过，最终组件节点均清理。
- 本轮通过页面内 `HTMLElement.click()` 激活夹具入口，再读取页面实际输出。InputNumber 内部仍使用夹具的脚本 pointerdown/pointercancel，Countdown 仍调用公开方法。**本轮不是原生输入、原生长按或 OS 验收证据**；截图中的通用夹具说明不改变本轮的实际入口方式。
- 没有模拟或改写计时器、`performance.now()`、RAF。初始倒计时仍为 1600ms，重置仍为 900ms；原有等待边界、行为断言、哈希校验及历史证据检查均未修改。不据此宣称 200ms 内必有动画帧。
- 页面 console warn/error、error/unhandledrejection 诊断为空；已启用的 CDP Runtime 异常采集也未发现异常。
- 8 个受检源码的采集前后 SHA-256 完全一致；已视检截图的“完成 4/4；通过 4；失败 0”状态，并记录截图哈希。

## 旧记录与失败采集

`previous-capture/` 保留替换前的报告和截图。旧报告中的诊断脚本及 Maple Countdown 源码指纹已过期，因此不能继续作为当前源码的通过证据。

`rejected-captures/` 保留本次前三轮原始输出与截图，未作为通过证据：前两轮使用指针入口，第三轮使用键盘入口。各轮都出现过运行与恢复观察之间的长帧间隔，使 1600ms 倒计时自然结束，触发原有“无结束通知”断言。前两轮的执行顺序也不符合最终校验器规定的顺序。第四轮将整个入口执行和结果等待放在页面内，按规定顺序采集；不拼接不同轮次的数据，不修改阈值或忽略失败。

## 复核

```sh
node --test bin/business-lifecycle-current-check.test.mjs bin/business-lifecycle-evidence-check.test.mjs bin/business-lifecycle-historical-archive-check.test.mjs
node bin/business-lifecycle-current-check.mjs
```

之后若受检源码变化，需要重新运行夹具并采集报告与截图，不能只更新哈希。
