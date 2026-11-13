# Upload

For photos, set `accept="image/*"`. Leaving `capture` unset or setting `:capture="false"` keeps the system file/photo picker available. Only set `capture` to `true`, `'user'` or `'environment'` when camera capture is intended. Available choices depend on the device and browser.

Disabled downloads match Link/Button link mode: remove href while retaining the link role, `aria-disabled` and `tabindex=-1`, and cancel the default click action. `readonly` still allows downloading. Re-enabling restores the original file URL and download filename.

Without action / custom-request, the component only reads files; the application manages progress and results.

## Basic examples

### read-only

```demo
../example/demos/en-US/read-only.vue
```

### Basic usage

```demo
../example/demos/en-US/basic-usage.vue
```

### Picture list and preview

Use list-type="picture" for thumbnail rows. Click a thumbnail to open the preview; add multiple images or remove an item.

```demo
../example/demos/en-US/picture.vue
```

## Appearance and states

### Switch list type

Switch between `text`, `picture` and `picture-card` using the same file list. Added and removed images stay in sync across layouts; text rows use the preview button, while picture layouts also support thumbnail preview.

```demo
../example/demos/en-US/list-type.vue
```

### Dynamic readonly and disabled states

Toggle readonly and disabled around a synthetic local image. The selection callback only increments a counter; it opens no file chooser and sends no request. Readonly preserves preview, while disabled blocks it. Removing restrictions restores actions. Restore sample replaces the parent-owned model, not the Upload reset method.

```demo
../example/demos/state-controls.vue
```

### Queue states

```demo
../example/demos/en-US/state.vue
```

### Interaction state comparison

Toggle disabled, read-only and error states, then interact with the same instance. Recovery controls remain outside the target; error appearance alone does not validate data.

<details>
<summary>Configuration details and limits</summary>

#### Interaction states

Use this example for attachment lists and local file selection. Adjust disabled, read-only and compare the component with the same data. The controls remain available to restore editing; error appearance alone does not run validation.

</details>

```demo
../example/demos/state-lab.vue
```

### custom-surface

```demo
../example/demos/en-US/custom-surface.vue
```

### Custom file item

```demo
../example/demos/en-US/custom-render.vue
```

### Custom remove button

```demo
../example/demos/en-US/remove-button-slot.vue
```

### Custom trigger

```demo
../example/demos/en-US/style.vue
```

### Custom preview

```demo
../example/demos/en-US/custom-preview.vue
```

### Image and video preview

```demo
../example/demos/en-US/preview.vue
```

## File sources and validation

### Inline drag and drop

Click the drop zone or drag images into it. Added images appear as picture rows with thumbnail preview. Touch devices can use the file picker.

```demo
../example/demos/en-US/draggable-picture.vue
```

### Upload inside a Dialog

Open the Dialog, select or drop images, then click a thumbnail to preview. Done or close dismisses the Dialog and keeps the selection for the next visit.

```demo
../example/demos/en-US/dialog-upload.vue
```

### Image count and size limits

Add up to 3 images, each at most 2 MiB. Rejected files show a reason; remove an image to make room. Files are read locally without requests.

```demo
../example/demos/en-US/picture-limits.vue
```

### Directory selection and multiple-file fallback

Compose paste events with the existing addFiles API. Keep a regular file picker on mobile; no network requests are sent.

```demo
../example/demos/directory.vue
```

### Custom file chooser

```demo
../example/demos/en-US/click-action.vue
```

### Clipboard images and file validation

```demo
../example/demos/clipboard.vue
```

### Validation after replacement

Reverse completion order: reset while the old task is pending, add a new file, resolve the newest thumbnail first, then reject the oldest. The stale failure only settles its task; it must not report read-error, remove the accepted new item or increment decoding counts. Reset clears the list and counters afterward. This remains local callback concurrency, not a native reader error.

Pause local thumbnail promise uses the public create-thumbnail-url callback with manual resolve/reject, not native FileReader fault injection. Reset invalidates the old transaction but retains its Demo task to demonstrate late delivery. A new addition starts immediately; resolving the stale task must not append it, while resolving the new task does. Rejection reports read-error and a subsequent addition can recover. Suspension/unmount settles Demo tasks. Reset and KeepAlive suspension detach the old serial wait chain without physically canceling a business promise; custom URLs remain caller-owned.

Enable native Blob/object-url to create local blob: URLs with URL.createObjectURL for subsequent accepted Files. It takes priority over data-url without rereading existing items. Blob URLs counts current blob items; Decoded images accumulates load events from both image modes until reset. The component releases its owned URLs on removal, reset and unmount.

Enable the FileReader/data-url switch before adding small images to read accepted replacement Files using the browser's native FileReader. The 16px images verify decoding; Data URLs counts current data-url items, while Decoded images accumulates load events until reset. Removing an item removes its image but does not decrement that cumulative count; reset clears both. Type rejection happens before reading. Generated local Files are not native file-chooser or network-upload coverage.

The switch affects subsequent additions without rereading existing items. Add file/data-url/file items to fill the three slots: another addition reports max-files without changing the image or decoding counts. Remove the data-url item and add again to read the new file and increment the cumulative decoding count. Reset clears the mixed queue.

This demo feeds synthetic images through the public `useUploader.addFiles` method and displays the controlled queue with Upload. Add a small image, then replace an image with text or an image larger than 1 MiB to see `accept` / `max-file-size` rejections. After resetting, the third 768 KiB image exceeds the 2 MiB total limit; reset again and the fourth small image hits `max-files`. Removing an accepted item frees a slot. All checks run after `before-read` returns its replacement, with no network request.

```demo
../example/demos/en-US/replacement-validation.vue
```

### Batch filtering

```demo
../example/demos/en-US/before-add.vue
```

### Before reading

```demo
../example/demos/en-US/before-read.vue
```

### File size and count limits

Choose local files exceeding the size or count limits and inspect the rejection feedback. Selection limits are separate from request preparation and upload queues.

```demo
../example/demos/en-US/selection-limits-comparison.vue
```

## Queues and progress

### Application-managed progress

Add local sample items to see externally managed progress at 40%, then complete the active uploads. Completion only updates items that are still uploading: canceled items remain canceled and removed items do not reappear. The built-in request retry button is hidden; use “Retry externally” to restart canceled or failed items before completing them. This demo makes no network requests.

```demo
../example/demos/en-US/external-state.vue
```

### External progress

```demo
../example/demos/en-US/use-progress.vue
```

### queue-request

Add a generated example file or choose a local file; neither sends a network request. Submit manually, observe progress, cancel, and retry. Enable the first-attempt failure option to exercise error recovery. Active requests return to zero after completion, cancellation, failure, or leaving the demo.

```demo
../example/demos/en-US/queue-request.vue
```

## Async hooks and requests

### Before removing

With manual async confirmation enabled, the synchronous allow switch is ignored. Repeated removal of a pending file invokes one hook. Cancel keeps the file; resolving after disabling also keeps it, and a fresh removal is required after re-enabling. Counters expose the list, pending tasks, hook calls and remove notifications. Deactivation/unmount settles local tasks without network requests.

All extra controls are local. Reject removal rejects the pending Promise, keeps the file and allows a fresh attempt. Replace same UID file creates a new local File; an old confirmation must not remove that replacement. Reset upload queue invokes public reset without a late remove notification. Activate upload suspends/restores Upload through KeepAlive; the outer Demo keeps pending jobs for manual completion, whose old results must stay invalid after activation. Suspending Upload does not physically cancel external business Promises; leaving the whole Demo settles its local jobs.

```demo
../example/demos/en-US/before-remove.vue
```

### Preparation and cancellation races

For cancellation plus total-size retry, prepare two items, cancel, then submit again: four jobs remain pending, including two obsolete attempts. Resolving all jobs starts only one valid request. The over-limit item retains its original file and canceled status; it is not counted as a new failure or automatically restored to ready. Remove the successful item and resubmit the remaining item to succeed. Obsolete preparation results consume no extra capacity.

In the total-size example, a 600B replacement fits the individual limit, but two replacements exceed the 1024B total limit. One request starts; the other item retains its original file and reports max-total-size. Remove the successful item, then prepare the remaining item again to free capacity. Reset clears the queue and pending preparations. This example uses local generated files and simulated requests.

“Prepare and submit” pauses before-upload; repeated submission does not duplicate the same attempt. Cancel and submit again, then resolve both preparations: only the current valid attempt starts a request. Text and oversized replacements are rechecked against the image type and 1 KiB size limit. Rejected items stay ready and can be retried with a valid copy. The demo uses public useUploader and immediate local requests. Resetting, deactivation and unmounting release pending preparations.

```demo
../example/demos/en-US/prepare-request.vue
```

### Async request metadata

Configure a local receiver you control, then resolve headers and data separately to exercise the default XHR transport. Resolving only one does not send; cancel before resolving the other to prevent the request. The receiver can inspect `X-Demo-Upload`, `auditMarker` and the `attachment` file field; its response is shown below. The endpoint starts empty, with no external upload service configured. The receiver must allow the documentation origin through CORS. Only generated synthetic text is used.

Use Reject headers / Reject data to fail a preparation: the current attempt becomes error once. Retry before settling the other old Promise to verify that its late result cannot overwrite the new attempt. Rejections after cancellation do not add errors. Resolve/reject buttons settle all pending jobs of that kind, including obsolete ones, to make races observable; reset drains pending jobs. A preparation rejection is not an HTTP error.

```demo
../example/demos/en-US/metadata-request.vue
```

### Delayed request handles

The local custom-request returns a Promise. Return an old handle after cancellation to see abort called immediately; its late success cannot restore the canceled item. Cancel, start again, and return all handles and callbacks: only the current attempt succeeds once. Counters show callbacks accepted by the queue, not real transmission. No network is used; reset, deactivation and unmounting release local waits.

```demo
../example/demos/en-US/late-request.vue
```

