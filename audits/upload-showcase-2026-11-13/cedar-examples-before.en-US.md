---
lang: en-US
permalink: /en/components/upload/
---

# Upload

For photos, set `accept="image/*"`. Leaving `capture` unset or setting `:capture="false"` keeps the system file/photo picker available. Only set `capture` to `true`, `'user'` or `'environment'` when camera capture is intended. Available choices depend on the device and browser.

Disabled downloads match Link/Button link mode: remove href while retaining the link role, `aria-disabled` and `tabindex=-1`, and cancel the default click action. `readonly` still allows downloading. Re-enabling restores the original file URL and download filename.

Upload UI and a headless useUploader composable. The application owns transport and server file deletion.

## Replacement and video metadata

Enable reupload for per-item replacement, or call replace(file, replacementFile). Validation and beforeRemove rejection preserve the original item. An accepted replacement occupies the same position with a new UID and emits replace/change, not remove. A failed new upload can be retried; it does not automatically restore the old server file or delete it.

Video duration is expressed in seconds and rendered as mm:ss or h:mm:ss. Local files are inspected; remote echoes provide duration from application metadata. Temporary resources are released on success, error, cancellation and disposal.

| Variable | Default |
| --------------------------------------- | ---------------------------------------- |
| --c-upload-gap | var(--c-sys-space-4) |
| --c-upload-trigger-min-height | var(--c-sys-control-height-md) |
| --c-upload-trigger-padding-horizontal | var(--c-sys-space-6) |
| --c-upload-trigger-draggable-min-height | calc(var(--c-sys-control-height-md) * 2) |
| --c-upload-card-size | calc(var(--c-sys-control-height-md) * 2) |
| --c-upload-item-min-height | var(--c-sys-control-height-md) |
| --c-upload-item-padding | var(--c-sys-space-4) |
| --c-upload-thumb-size | var(--c-sys-control-height-lg) |
| --c-upload-border-radius | var(--c-sys-radius-md) |
| --c-upload-border-color | var(--c-sys-color-border-default) |
| --c-upload-background | var(--c-sys-color-surface-default) |
| --c-upload-text-color | var(--c-sys-color-content-primary) |
| --c-upload-secondary-text-color | var(--c-sys-color-content-secondary) |
| --c-upload-hover-background | var(--c-sys-color-state-hover) |
| --c-upload-active-color | var(--c-sys-color-action-primary) |
| --c-upload-error-color | var(--c-sys-color-content-danger) |
| --c-upload-action-size | var(--c-sys-control-touch-target) |
| --c-upload-progress-height | var(--c-sys-space-2) |
| --c-upload-disabled-opacity | .56 |
| --c-upload-font-size | var(--c-sys-font-size-md) |

## Basic examples

### Read Only

<demo src="./__demos__/read-only.vue"></demo>

### Picture list and preview

Use list-type="picture" for thumbnail rows. Click a thumbnail to open the preview; add multiple images or remove an item.

<demo src="./__demos__/en-US/picture.vue"></demo>

## Appearance and states

### Switch list type

Switch between `text`, `picture` and `picture-card` using the same file list. Added and removed images stay in sync across layouts; text rows use the preview button, while picture layouts also support thumbnail preview.

<demo src="./__demos__/en-US/list-type.vue"></demo>

### State Controls

<demo src="./__demos__/state-controls.vue"></demo>

### State Lab

<demo src="./__demos__/state-lab.vue"></demo>

### Custom Surface

<demo src="./__demos__/custom-surface.vue"></demo>

## File sources and validation

### Inline drag and drop

Click the drop zone or drag images into it. Added images appear as picture rows with thumbnail preview. Touch devices can use the file picker.

<demo src="./__demos__/en-US/draggable-picture.vue"></demo>

### Upload inside a Dialog

Open the Dialog, select or drop images, then click a thumbnail to preview. Done or close dismisses the Dialog and keeps the selection for the next visit.

<demo src="./__demos__/en-US/dialog-upload.vue"></demo>

### Image count and size limits

Add up to 3 images, each at most 2 MiB. Rejected files show a reason; remove an image to make room. Files are read locally without requests.

<demo src="./__demos__/en-US/picture-limits.vue"></demo>

### Directory

<demo src="./__demos__/directory.vue"></demo>

### Clipboard

<demo src="./__demos__/clipboard.vue"></demo>

### Replacement Validation

<demo src="./__demos__/replacement-validation.vue"></demo>

## Queues and progress

### External State

<demo src="./__demos__/external-state.vue"></demo>

### Queue Request

<demo src="./__demos__/queue-request.vue"></demo>

## Async hooks and requests

### Before Remove

<demo src="./__demos__/before-remove.vue"></demo>

### Prepare Request

<demo src="./__demos__/prepare-request.vue"></demo>

### Metadata Request

<demo src="./__demos__/metadata-request.vue"></demo>

### Late Request

<demo src="./__demos__/late-request.vue"></demo>

