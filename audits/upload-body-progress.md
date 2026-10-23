# Upload independent-source alignment

## Completed scope

Cedar is the baseline; Maple receives an independent copy of the SFC, props, public types, queue/request/read core and Less styles. No cross-package runtime import, platform configuration or compatibility aliases were introduced. Local install entries, global-locale adapters and video presentation (Cedar Drawer / Maple Popup) remain explicit independent adapters, not a claim of whole-directory identity.

The source gate verifies 20 pairs, including five Chinese demos and paired contract tests. TypeScript declarations are compared through structural ASTs (interfaces are not transpiled away). The localized English demos remain independently readable source files.

Maple's 16 retained legacy example topics were rewritten as focused examples with dedicated English copies rather than hidden or deleted. Both documentation languages and the right-hand collection now expose all 21 examples. This also removes duplicated unrelated state, demonstrates the canonical trigger slot, and cleans up external-progress timers. The root docs:check passed with 966 SFCs and 0 failures.

## Unified contracts

- Request capability is opt-in through action/customRequest. Without transport, reading yields ready items for externally managed status/progress; autoUpload does not create an empty-URL request.
- Controlled values stay authoritative. Proposals in one Vue update tick merge; rejected proposals do not become a permanently optimistic rendered list. Across ticks only accepted files occupy limits. A delayed accepted candidate can auto-upload once.
- beforeRead and beforeUpload replacements revalidate accept, file size and total size; concurrent replacements reserve total bytes. Guard callback false/rejection cancels safely.
- Request tokens invalidate stale progress/success/error, including external same-uid file replacement. Lifecycle patches do not overwrite parent-owned latest metadata.
- Cancellation during async preparation prevents network work. KeepAlive deactivation invalidates pending work; unload aborts requests and releases component-owned URLs.
- Generated URLs have ownership tracking; external URLs are never revoked. Active preview leases postpone release until preview closes. Upload closes only its own image handle; video presentation is local.
- disabled/readonly inherit Form with explicit false override. Queue changes notify Form once. Native file input, trigger keyboard handling, disabled downloads and non-image thumbnails have component tests.

Canonical changes: after-read → read; oversize → rejected(reason); click-action/onClickAction → requestChoose; preventDefaultPreview → UploadPreviewEvent.preventDefault(); status-specific query helpers → getFiles(status); custom upload node → trigger slot. No legacy aliases remain.

## Preserved capabilities

Directory/drag selection, custom headers/data/transport, queue submission/retry/cancel, text/picture/picture-card lists, image/video preview, per-file fit, createThumbnailUrl, read transformations, custom trigger/item/remove-button slots, reactive external upload progress and Form inheritance. Picture-card actions appear on hover/focus and remain available on touch; overlays do not consume empty-area thumbnail clicks.

## Tokens

20 matching prefix-normalized public tokens: gap, trigger-min-height, trigger-padding-horizontal, trigger-draggable-min-height, card-size, item-min-height, item-padding, thumb-size, border-radius, border-color, background, text-color, secondary-text-color, hover-background, active-color, error-color, action-size, progress-height, disabled-opacity, font-size. Defaults use each library's system roles; disabled-opacity is 0.56. No component-private root-resolution indirection is used. Parent owns theme inventory and dark-theme migration.

## Verification

- Cedar Upload: 41/41 tests (34 core + 6 body + registration).
- Maple Upload: 68/68 tests (same 40 core/body + 28 migrated component tests).
- Paired core reviewed independently; assertions cover rejected/delayed models, replacement validation, cancellation races, XHR terminal callbacks, URL ownership/leases and KeepAlive.
- Scoped Upload ESLint completed; final gate is run after formatting.
- After the final preview-finalizer guard, both six-case body suites passed again. Cedar's old Vitest process exited 0 but printed an fsevents shutdown assertion after reporting the passing tests; this is recorded separately from test correctness.
- Parent integration locale checks: Cedar 2/2, Maple 1/1. Parent owns final full-library type/build and documentation build evidence.
- No claim of real-browser visual acceptance: styles and SSR are tested; final product visual review remains distinct from unit tests.
