# 跨端契约

共享组件的逻辑 Props、Emits、Slots、状态枚举和 Token 后缀默认一致；平台特有能力必须以 `platforms/` 覆盖规则登记。

允许差异：默认尺寸、触控目标、hover 行为、safe-area、虚拟键盘、PC 专属快捷键、移动端手势。禁止差异：同名 Prop 表达不同含义、同一事件在一端 emit 而另一端为普通回调 Prop、同一 Token 后缀表达不同 CSS 属性。

每次公共 API 变更生成 Cedar/Maple contract diff；只有显式 allowlist 的平台差异可以通过门禁。
