# Before hooks and clear-value contracts

User decision: keep before* names; support returned values/Promises and existing done callbacks. Unpublished closeGuard/confirmGuard/cancelGuard props are removed from source, demo configuration and public types.

| Family | Current contract | Treatment |
|---|---|---|
| Cedar/Maple Dialog; Cedar Drawer | beforeClose(action, done, refs) | Boolean/Promise or callback; first completion wins |
| Cedar Popconfirm | beforeConfirm(done), beforeCancel(done) | Same completion adapter; pending deduplication |
| Maple Popup and ActionSheet | beforeClose(reason, done) | Same completion adapter; seven enabled close reasons |
| Switch.beforeChange | Existing returned boolean/Promise | Preserved; no done overload added |
| Field beforeCommit | Existing draft transaction and signal | Preserved; does not veto every popup close |
| Scheduler beforeChange/beforeTransaction | Existing domain transaction context | Preserved |
| Upload beforeAdd/beforeRead/beforeUpload | May transform files | Preserved; not converted into a boolean close hook |
| Upload.beforeRemove | Existing boolean/Promise | Preserved |
| Cascader/Table loadMore; Tree loadMore | Child-data loading completion | Preserved; not a close hook |

Synchronous void waits for done; Promise<void> allows. done(false) rejects. If a callback and return value compete, first completion wins. A synchronous callback that only logs must return true. This deliberately changes the newly consolidated hook semantics: old Promise<void> without done now allows, and pending callback attempts are deduplicated. Service/config APIs use the same hook types. Internal cancellation cannot undo a server-side action.

## Empty values: reviewed model families

value-on-clear means the value produced by an explicit clear operation. empty-values means which values are interpreted as empty. They are different controls. User selected emptyValue / empty-value. The unpublished Select.valueOnClear name is removed; model-safe overrides now cover fields that expose a clear action. Defaults remain unchanged.

| Model family | Existing empty output | Important boundary |
|---|---|---|
| Input/Textarea/AutoComplete/Search/PeopleSelect | Empty string | null/undefined would widen text/identity and event types |
| Select single | Empty string, or undefined with an empty-string option; optional emptyValue override | Empty string can also be a valid selectable value |
| Select multiple/Cascader paths/CheckboxGroup/Upload | Array | Disabled selections/files and path dimensions need component-specific rules |
| Date/Time | Undefined or the existing component-specific empty state | Display format and model type are separate |
| DateRange/TimeRange | Existing array/endpoint protocol | Empty array and partially empty endpoints are distinct |
| Switch/Radio/Slider/Rate | Meaningful primitive values | false and 0 are valid values, not universally empty |

The override is restricted to each existing model type. Text/person identities remain strings. Components without a clear action are not assigned a new synthetic clear/reset behavior. Form reset and semantic empty detection are unchanged.
