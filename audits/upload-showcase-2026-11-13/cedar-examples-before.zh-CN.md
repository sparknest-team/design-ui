---
permalink: /components/upload/
---

# Upload 上传

选择照片时设置 `accept="image/*"`，不设置 `capture` 或设置 `:capture="false"`，保留系统文件 / 相册选择入口。仅在需要直接拍照时设置 `capture` 为 `true`、`'user'` 或 `'environment'`。具体可选入口由设备和浏览器决定。

禁用下载与 Link/Button 的链接模式一致：移除 href，同时保留链接角色、`aria-disabled` 和 `tabindex=-1`，点击不执行默认下载。`readonly` 不禁用下载；恢复非禁用状态后保留原文件地址及下载文件名。

未配置 action / custom-request 时，组件仅读取文件，进度和结果由业务管理。

## 基础示例

### 基础用法

选择本地文件后显示文件列表；未配置 action/custom-request 时仅读取，不发送请求。

<demo src="./__demos__/read-only.vue"></demo>

### 图片列表与预览

使用 list-type="picture" 展示缩略图列表；点击缩略图可弹窗预览，支持多选和删除。

<demo src="./__demos__/picture.vue"></demo>

## 外观与状态

### 切换列表类型

通过单选项切换 `text`、`picture` 和 `picture-card`，三种展示方式共用同一份文件列表。添加或删除图片后切换，文件保持同步；文本列表通过预览按钮打开图片，图片列表和卡片也可点击缩略图预览。

<demo src="./__demos__/list-type.vue"></demo>

### 动态只读与禁用

预置本地合成图片，启用 readonly 与 disabled，比较预览、删除和选择入口的行为。选择按钮只记录 request-choose 次数，不调用原生文件框或请求接口。只读保留预览，禁用同时阻止预览；解除限制后可重新操作。恢复示例由父级更新模型，不是 Upload 的公开重置方法。

<demo src="./__demos__/state-controls.vue"></demo>

### 交互状态切换

适用于附件列表展示与本地选取。调整禁用、只读，用相同数据观察变化。控制区始终可用，可以随时恢复编辑；错误外观本身不会触发表单校验。

<demo src="./__demos__/state-lab.vue"></demo>

### 图卡、插槽与自定义预览

<demo src="./__demos__/custom-surface.vue"></demo>

## 文件来源与约束

### 页面内拖拽上传

点击大块拖拽区域选择图片，或将图片拖入区域。添加后显示 picture 列表，点击缩略图预览。触屏设备可点击选择。

<demo src="./__demos__/draggable-picture.vue"></demo>

### Dialog 内拖拽上传

点击按钮打开 Dialog，在弹窗内选择或拖入图片，再点击缩略图打开预览。完成或关闭仅收起弹窗，保留已选文件；再次打开可继续操作。

<demo src="./__demos__/dialog-upload.vue"></demo>

### 图片数量与大小限制

最多 3 张、每张不超过 2 MiB。尝试添加超限或非图片文件时显示原因，删除后可继续选择。示例仅读取本地文件，不发送请求。

<demo src="./__demos__/picture-limits.vue"></demo>

### 目录选择与多文件回退

使用 directory 选择文件夹，普通多选入口可作为移动设备的替代路径。

<demo src="./__demos__/directory.vue"></demo>

### 剪贴板图片与读取校验

通过现有 useUploader.addFiles 接入 paste 事件，复用数量、大小和类型限制。这是应用层组合，不新增 Upload 的 paste 属性。

<demo src="./__demos__/clipboard.vue"></demo>

### 替换后的约束校验

反向返回顺序：旧任务等待时重置并加入新文件，先点“返回最新缩略图”接受新项，再“拒绝最早缩略图”。旧失败只结清旧任务，不能再显示read-error、删除新项或增加解码数；最后重置清空列表和计数。这仍是本地回调竞争，不是原生读取器异常。

开启 FileReader / data-url 后，接受的 File 会读取为 data URL。Data URLs 显示当前 data-url 项目数，Decoded images 显示重置以来累计的 load 次数。删除项目不会减少累计次数；重置清零两者，类型拒绝发生在读取之前。

开关仅影响后续新增项，不会重新读取既有项目；可按 file/data-url/file 顺序混合加入三项。满额后再加入会报告 max-files，图片和解码计数不变；删除 data-url 项后重新加入会读取新文件，累计解码数继续增加，重置清空整个混合队列。

<demo src="./__demos__/replacement-validation.vue"></demo>

## 队列与进度

### 外部管理进度

可直接加入本地示例项观察 40% 的外部进度，再模拟完成。完成操作只更新仍在上传的项；取消项保持 canceled，已删除的项不会重新出现。外部托管模式隐藏内置请求重试按钮，使用“模拟外部重试”恢复取消或失败项，再由业务端完成。示例不发送网络请求。

<demo src="./__demos__/external-state.vue"></demo>

### 手动队列和可取消请求

可直接“加入示例文件”，也可选择本地文件；两种方式均不访问网络。点击提交后观察进度，取消会停止活动请求，重试会重新上传。开启“首次请求失败”时，同一文件首次失败、重试成功。活动请求数在完成、取消、失败及离开 Demo 后清零。

<demo src="./__demos__/queue-request.vue"></demo>

## 异步钩子与请求

### 删除前确认

未勾选时，`before-remove` 拒绝移除并保留文件；勾选后再次删除才更新队列。示例使用本地预置数据，不访问网络。

开启“手动异步确认”后忽略同步允许开关，删除等待“确认删除 / 取消删除”。同一文件等待时重复点击不会新增钩子；取消保留文件，等待中禁用后再确认也不会删除，解除禁用后需重新发起。计数核对列表、等待任务、钩子和 remove 通知；停用或卸载结清本地等待。

With manual async confirmation enabled, the synchronous allow switch is ignored. Repeated removal of a pending file invokes one hook. Cancel keeps the file; resolving after disabling also keeps it, and a fresh removal is required after re-enabling. Counters expose the list, pending tasks, hook calls and remove notifications. Deactivation/unmount settles local tasks without network requests.

新增操作均不访问网络：“异常拒绝删除”拒绝本地Promise，文件保留且后续可重试；“替换同 UID 文件”生成新的本地File，旧删除确认不得移除替换项。“重置上传队列”调用公开reset，旧确认不再产生remove；“激活上传组件”通过KeepAlive停用/恢复Upload，等待任务保留在外层Demo用于手动返回，旧结果不得影响恢复后的实例。停用Upload不等于取消外部业务Promise；离开整个Demo才结清其本地等待。

All extra controls are local. Reject removal rejects the pending Promise, keeps the file and allows a fresh attempt. Replace same UID file creates a new local File; an old confirmation must not remove that replacement. Reset upload queue invokes public reset without a late remove notification. Activate upload suspends/restores Upload through KeepAlive; the outer Demo keeps pending jobs for manual completion, whose old results must stay invalid after activation. Suspending Upload does not physically cancel external business Promises; leaving the whole Demo settles its local jobs.

<demo src="./__demos__/before-remove.vue"></demo>

### 上传前准备与取消竞争

取消后重试合计大小组合：双项进入准备后取消，再次提交会保留四个待返回任务（含两次已失效尝试）。统一返回时仍只启动一次有效请求；超限项保留取消前的原文件和 `canceled` 状态，不误算为新失败或自动恢复为 ready。删除成功项后可再次提交剩余项并成功；旧准备结果不占用额外容量。

合计大小组合：空队列选择“每项替换600B，合计上限1024B”，连续加入两个62B合成图片，再准备并统一完成。每项均满足单文件1024B限制，但两项替换后总量超限，因此只有一项发起本地请求，另一项保留ready原文件并报告max-total-size。删除成功项后，再准备剩余项可成功；重置清空队列、等待和请求计数。此处验证本地before-upload替换，不涉及原生文件选择或真实网络上传。

点击“准备并提交”后，`before-upload` 保持等待；重复提交不会重复创建同一尝试。取消准备后可以再次提交，再点击“完成准备”同时返回旧、新结果，只有当前有效尝试能发起请求。选择文本或超大图片替换时会再次检查类型和 1 KiB 大小限制，拒绝后保持 ready，可改为有效副本后重试。本示例使用公开 useUploader 和本地即时请求，不访问网络；重置、停用和卸载会释放等待任务。

<demo src="./__demos__/prepare-request.vue"></demo>

### 异步请求元数据

填写你控制的本地接收接口后，分别手动返回 headers 和 data，观察默认 XHR 的准备与取消。只返回一项时仍不发送；取消后再返回另一项不得启动请求。成功响应显示在示例下方，可由接收端核对 `X-Demo-Upload`、`auditMarker` 和 `attachment` 文件字段。接口地址默认留空，不预设外部上传服务；接收器必须允许文档站来源的 CORS。本例仅使用生成的合成文本，不选择真实文件。

使用“拒绝 headers / 拒绝 data”模拟准备失败，当前尝试只进入一次 error。可在另一项旧 Promise 未结清时重试，观察旧结果不会覆盖新尝试；取消后再拒绝不增加错误计数。返回/拒绝按钮会结清该类所有等待任务（包括旧尝试），便于验证竞争；重置会释放等待任务。准备失败不等同 HTTP 错误。

<demo src="./__demos__/metadata-request.vue"></demo>

### 请求句柄迟到与取消

本地模拟 custom-request 返回 Promise。取消后再返回旧句柄会立即调用其 abort；返回旧成功回调不会恢复已取消项。取消后再次发起、统一返回句柄和成功回调时，只接受当前尝试一次。计数展示回调是否被内核接受，不代表真实传输；本例不访问网络，重置/停用/卸载释放本地等待。

<demo src="./__demos__/late-request.vue"></demo>

