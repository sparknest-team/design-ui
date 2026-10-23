# Desktop Token acceptance fixture

## Shared scroll native execution

scroll-execution.html imports the two actual independent JS helpers. Eight native button cases cover main default300ms/zero and same-origin srcdoc iframe element/Window. Fixture-owned request counters forward unchanged to original native RAF and restore descriptors after each case; actual coordinates are read after native callbacks. No fake clock or RAF, CSS zoom, viewport override or OS setting change.

All8 pass. Six interpolated cases have19 owner requests each with native intermediate coordinates; zero cases have0. All iframe host counts0, final left80/top220 remains stable after50ms and target nodes0. Evidence keeps first/middle/last coordinate excerpts, not full pixel traces, plus original viewed JPEG/hash. Current reduce queryfalse is an observation, not OS acceptance. Helper/source/fixture hashes and18 new positive/negative checks join185 browser-evidence tests.

Form/IndexBar cancellation, other easing/durations/engines and OS preference changes remain separate. pagehide clears fixture waits and restores forwarding probes/removes targets. Close the agent-owned tab and frozen service after the run.

## Business lifecycle real IAB

business-lifecycle.html imports both independent InputNumber/Countdown components and style entries. Four native fixture-entry clicks run actual timers, RAF, public model/change callbacks and DOM cleanup. Internal pointerdown/pointercancel is scripted, Countdown uses public methods: not trusted native long press, stale/dequeued-callback replay, cross-window or OS acceptance.

InputNumber checks actual800ms first/150ms subsequent repeats, cancellation and unmount before the replacement deadline with positive repeat controls. Countdown checks pause/start, KeepAlive inactive stability, inactive time reset-to900ms and reactivation/unmount. Stable cached containers keep their render effect alive to deliver inactive time changes; directly skipping the Clock vnode would defer delivery and fail the fixture's intended coverage.

After that correction restart the frozen service and reload; all4 final cases pass, original viewed JPEG and relative0.1ms phase/event excerpts retained. Preliminary cases are not counted again. pagehide clears fixture jobs and unmounts the app. Close the agent-owned tab/service afterward. New19 evidence tests join the full167-test browser-evidence chain;144 environment-blocked groups remain separate.

Run from `design-ui`:

```sh
node refactors/token-validation/browser/serve.mjs
```

Open the printed loopback URL. This page imports actual Cedar/Maple source components and their style entries. Theme changes call each library's public `StyleProvider.setStyleVars`, including its dark-theme document attribute. Do not replace this with local palette assignments: root aliases and dark selectors must be exercised.

## Message native completion

message-motion.html imports actual independent services/CSS. Eight native button runs cover each platform's default,600ms/linear,explicit zero and same-id reopen. Commands, public callbacks, DOM identity/phases and computed styles are observed; no private timer state or browser-evaluated mutations. The fixture schedules explicit 800ms handle close and 100ms replacement business actions. Evidence stores canonical phase/callback excerpts, final table JPEG and hash; duplicate class mutations are omitted.

Zero is not an OS preference test. Reopen replaces a cancelled root, not a completed old leave. Final completion uses real DOM timing; not every exit produces captured transitionend. pagehide disconnects the observer/cancels fixture timers and clears services; close the agent-owned tab/service after evidence capture.

## Repeatable checks

For `default/light`, `default/dark`, `maple/light`, `maple/dark`, on each platform:

1. Click the focus parking button; normal Input and Date use fill1.
2. Click normal Input; verify real `:hover` and `:focus-within`, background fill3.
3. Press Tab without moving the pointer; normal Input becomes hover-only/fill2 and the error Input receives keyboard focus. Wait for component transitions before recording computed values.
4. Click error Input; error background and `aria-invalid=true` survive hover+focus.
5. Click disabled shell; no input focus, value mutation or hover-specific background. Tab navigation skips the disabled input.
6. Type in readonly Input; the original value remains and the input is still keyboard-focusable.
7. Open Date; shell remains fill3 while expanded. Close Cedar with Escape and Maple with Cancel; wait for the popup to disappear before another interaction.
8. Open Menu. Selected background/cover survives hover; disabled item cannot select. ArrowDown skips disabled; Escape returns focus to the trigger.
9. Enter the nested menu with ArrowRight; Escape returns to the parent, then to the trigger.
10. Enable local variable overrides; normal default/hover/focus use `#ddffee/#cceedd/#bbddcc`, while error and disabled retain their state-specific tokens.
11. Rate instance overrides use 123ms for ordinary transitions, 456ms for the selection animation, linear easing and `rgb(1, 100, 150)` for selected symbols. Press ArrowRight and inspect both the transition and animated nodes. Public overrides must resolve on the component, not be frozen by a private alias declared at `:root`.
12. Repeat filled-state checks with Textarea. Enter six lines: `autoSize` must stop at four rows and retain an internal scroll area. Disabled/readonly values must not change.
13. Slider range starts at `[20,80]`; ArrowRight on the lower thumb yields `[25,80]`. Readonly/disabled sliders retain 40. Local overrides produce 24px thumbs and the custom active color.
14. Each virtual List contains 100 rows of 40px inside a 160px viewport (`estimatedSize: 40`, `fixedSize: true`; `itemHeight` is not a supported prop). Check that the full scroll range remains 4000px while only a subset of rows is mounted. Use native scrolling to reach the last row, return to the top and inspect an intermediate window; do not assign scrollTop or dispatch synthetic scroll events as a substitute.
15. Check 320px and 390px widths. The fixture itself switches to one column; document scroll width must not exceed its client width. This does not replace production-site responsive checks.
16. VerificationCode includes five sizes × three variants per platform plus a customized instance and an untouched neighbor. Check cell geometry, character size and gap across all four themes. The custom instance must measure 52px height / 48px preferred width / 21px font / 13px gap without changing its neighbor. In narrow containers the preferred width may shrink while height remains fixed.

### Latest bounded verification — 2026-10-09

After the Input/Textarea/Slider/List API refactor, Chromium source-fixture checks confirmed both libraries' Input and Textarea focus-with-hover background in all four themes: light `rgb(229, 230, 235)`, dark `rgba(255, 255, 255, 0.12)`. Inactive peers use light `rgb(247, 248, 250)` / dark `rgba(255, 255, 255, 0.04)`. Textarea local default/focus overrides resolved to `#ddffee` / `#bbddcc`. Record settled computed values, not animation frames.

Slider keyboard steps and readonly protection passed; overridden thumbs measured 24×24px. Six-line textareas were capped at four rows (Cedar 92px, Maple 96px, with larger scroll heights). Both virtual list viewports measured 160px with 4000px scroll content and 30 initially mounted rows. Native virtual-list scrolling is still pending. At 320/390 viewport widths, document client/scroll widths matched at 305/375px respectively.

Cedar production docs built successfully (267 pages). Maple's 928 demo SFC checks passed, but its production build encountered an in-progress VerificationCode export migration in the separate API task. Production-page acceptance and cross-browser/device checks are not implied by these source-fixture results.

### Follow-up: VerificationCode and native List scrolling — 2026-10-09

This follow-up completes the two bounded source-fixture items, not a production-site or whole-library acceptance.

- Four themes × 34 code instances (two platforms × 15 size/variant combinations plus two override/neighbor pairs): dimensions remain stable when switching themes. Cedar xs/sm/md/lg/xl cell heights are 24/28/32/36/44px; Maple heights are 32/40/48/56/64px. These intentional density differences follow each platform's field tokens.
- Outline draws a four-sided border, filled uses the field fill background, and standard draws an underline. Both platforms' filled md cell retains fill3 while focused and hovered: light `rgb(229, 230, 235)`, dark `rgba(255, 255, 255, 0.12)`.
- Both custom instances measure 52×48px with 21px text and 13px gap. Untouched md neighbors remain Cedar 32×32px / 14px and Maple 48×48px / 16px, each with 4px gap. No instance leakage observed.
- At 390/320px viewport widths, clientWidth equals scrollWidth (375/305px). At 320px, Maple xl cells shrink to 59.25px wide while retaining 64px height. The custom dimensions still fit. Desktop light and narrow dark screenshots were visually inspected.
- Native scroll actions on both Lists reach scrollTop 3840 with Item 100 mounted, return to 0 with Item 1, and produce continuous intermediate windows. Thirty rows remain mounted out of 100. This supersedes the earlier pending native-scroll note; variable-height rows, data shrink, keyboard accessibility and touch hardware are not covered by this fixture check.
- `node bin/verification-code-core-check.mjs` and `node bin/list-body-check.mjs` pass (11 and 9 normalized source pairs respectively; List has 34 public suffixes). Fixture JavaScript syntax checks pass. No component implementation was changed in this follow-up; the invalid fixture-only `itemHeight` option was corrected.
- The Chinese optional-token guide sections match across the shared standard and both sites; English terminology was checked. Maple full `pnpm lint:check` exits 1 with 238 errors in the concurrent Upload migration and its locale test (log: `/private/tmp/token-code-list-lint.log`). Those files were not changed here; this run is not recorded as a global pass.

Next: wait for the concurrent Carousel/Upload integration to freeze, rebuild production docs against that stable state, then inspect Search/Tabs and the changed documentation pages. Cross-browser, physical-device and accessibility/motion work remain separate later stages.

The fixture does not force pseudo-classes or mock component CSS. Browser automation should use pointer/keyboard input and read actual DOM/computed styles. Synthetic DOM-event dispatch is not proof of native hover.

## Production docs

After Cedar's `build:doc` succeeds, run `node refactors/token-validation/browser/serve-docs.mjs`. Follow the actual sidebar from the design guide to the variable reference. Verify anchors and long tables at 1280px and 960px: horizontal overflow must stay inside `.token-reference-table`, not widen the document.

After Maple's `build:doc` succeeds, run `node refactors/token-validation/browser/serve-docs.mjs maple`. This serves `packages/maple-ui/site`, not the repository-root `site`. Use the language selector to verify both reference pages. Check 1280px, 960px and phone-width layouts: below 1200px the preview follows the document; below 768px the navigation is a disclosure. Verify Enter/Space, Escape returning to the toggle, route selection focusing the main content, and language selection remaining reachable. Tables must scroll locally; viewport resizing is not touch-device acceptance.

This is a bounded Chromium desktop matrix, not Safari/Firefox, mobile hardware, screen-reader, reduced-motion or a complete component gallery acceptance. Preserve unrelated in-progress work and report build blockers instead of patching around it.

### Production follow-up: Search, Tabs and guide pages — 2026-10-09

Used the fourth integration batch's built Cedar `dist` and Maple `site`; no new build was started. That batch records Cedar 270 pages, Maple 966 checked demo SFCs and successful production builds/type/lint checks, superseding the earlier in-progress Upload lint failure.

- Cedar's menu opens the design-token guide, Search and Tabs. The optional-override / initial / size-fallback section is present in the rendered guide. Maple's Chinese and English rendered guides contain the same new topic and reset semantics.
- Both Search controlled-model demos accept a test name and submit that accepted model. After disabling model acceptance, typing a different value and pressing Enter still submits the prior accepted model. Maple's full-screen history opens as a named dialog; selecting the existing Project A entry updates the demo result and closes the popup.
- Cedar Tabs ArrowRight switches from overview to details, then skips the disabled item and returns to overview. Dark mode retains distinct selected, ordinary and disabled text colors. Maple Tabs ArrowRight skips the disabled books tab; vertical ArrowDown selects the second panel, and the external next-step button displays its confirmation panel.
- At 390px Maple Tabs document clientWidth and scrollWidth both measure 375px, with a 327×640px preview. The narrow production layout was visually inspected. This is not touch-device acceptance or all-variant visual coverage.

**Open finding — Radio native checked state:** In Cedar `/components/tabs/`, click the `Card` radio. In Maple `#/zh-CN/tabs`, inside `iframe#mobile`, click the `vertical` radio. Both update the model, visual checked class and `aria-checked="true"`, while the native input's `checked` property remains `false`; a native `check()` operation reports failure. The related Tabs variant/orientation does change. Source inspection finds both Radio click handlers cancel the native activation with `preventDefault()` and schedule `nextTick(restore)`; event/default-action timing is the suspected cause, not yet a proven fix. Do not replace this observation with an ARIA-only assertion. Next stage must verify native clicks, controlled rejection, labels/keyboard, readonly/disabled and the analogous Checkbox path, then repeat production acceptance. No Radio/Checkbox source was changed in this stage.

## Radio native-state repair — 2026-10-12

The source acceptance page now includes Cedar/Maple Radio, Checkbox and named
RadioGroup cases for accepted/rejected controlled updates, readonly and disabled.
Each case exposes the current model and update/change counts beside the actual
component. Inspect the native `input.checked` property as well as `aria-checked`.

Chromium source-page verification passed: native clicks and labels propose one
update, accepted values remain checked, rejected values revert, and rejected
named groups restore the previous checked input too. Space, Enter and group arrow
navigation preserve the same model/native contract. Readonly/disabled remain
unchanged. Checkbox passed the analogous checks without an implementation change.

Radio keeps permitted native activation uncanceled, commits once on click, and
retains direct change-event support. The local navigation registry restores all
group members, because native same-name activation unchecks the previous input
even when a controlled parent rejects the proposal.

Regression results: Cedar 100 tests / 11 files; Maple 139 tests / 12 files; the
choice-body paired-source gate passed. Cedar uses
`vitest --config vitest.choice-validation.config.ts` to isolate files with one
worker; the older no-thread runner can cache Vue before JSDOM initialization when
SSR and DOM cases are combined.

Production rebuild/retest passed: Cedar rendered 270 pages; Maple checked 968 demo
SFCs and completed its production build. Cedar Tabs Card and Maple Tabs iframe
vertical both report native checked=true and aria-checked=true after check(),
with matching selected classes. Maple's related tablist becomes vertical.
Both typechecks and scoped component lint passed. The full Maple lint snapshot
initially contained 5 formatting errors and 1 attribute-order warning under Time.
The subsequent Time lint closure on 2026-10-12 confirmed those component issues
were resolved and formatted both copies of the Time contract checker. Cedar's
complete source lint and Maple's full-workspace lint now pass with zero errors
and warnings; both Time checker copies pass their 34 source/test pairs.
This is bounded Chromium acceptance; Safari, Firefox and physical-device checks
remain later phases. No design-token name, default value or public CSS-variable
contract changed in this repair.

## Field focus and popup association — 2026-10-12

The fixture now includes Date and Time normal/error/readonly/disabled cases, plus
existing Input/Textarea cases. All four expose aria-describedby references to
actual helper text. It is ready for native keyboard and focus restoration checks.

Source fixes: both FieldDecorator shells draw an independent :focus-visible ring,
preserving error colors; Date/Time presentations connect expanded comboboxes to
stable, named dialog IDs. Maple's editable Time button shares the association.
Regression tests verify the target role, name and closed-state link removal.
Cedar 302 and Maple 394 relevant tests passed, plus both Less outputs via
node bin/field-focus-check.mjs and scoped lint.

No real-browser result is claimed in this stage. Initial navigation raced server
startup and left a data: connection-error page; Browser Use URL policy blocked
recovery from that page. HTTP 200 was confirmed after startup, but native focus,
visual and popup lifecycle acceptance remains pending. Maple full checks also
encounter unrelated in-progress Form layout test typing/formatting issues. The
whole Input parity gate encounters existing Input SFC import/if-block formatting
differences; Date/Time and compiled-focus gates passed separately.

## Full closure follow-up — 2026-10-12

The earlier browser/Form/Input blockers are historical, not current. The source fixture's Cedar Time style import was also corrected to time/picker/style/index.ts. Server readiness was verified before a fresh page navigation; the source page now loads successfully through the supported browser session.

Actual Chromium checks:

- 32 error-field focus/description cases: four brand/mode combinations, both platforms, Input/Textarea/Date/Time. Independent outlines and existing helper IDs passed; error backgrounds remained visible.
- Date/Time keyboard open connects aria-controls to a named dialog and Escape removes the expanded association. Four readonly Date/Time cases do not open; disabled native controls remain disabled.
- Maple Time closes back to its input after pending-draft commit. Picker ArrowDown/End keep column focus and update the active option.
- Cedar Drawer and Maple Popup nested layers: initial panel focus, Tab/Shift+Tab wrapping with hidden/disabled controls excluded, child Escape returns to its opening button, parent Escape returns to the outside trigger. Maple Popup's missing actual-panel marker was discovered and repaired during this check.

The browser does not expose reduced-motion emulation. Real OS preference switching, Safari/Firefox, physical touch devices and screen readers are not claimed. Static motion gates and Picker initial/dynamic matchMedia unit tests are separate evidence, not substitutes.

Temporary screenshot evidence: /private/tmp/token-closure-maple-error-focus.png, /private/tmp/token-closure-four-theme-focus.png and /private/tmp/token-closure-picker-stable.png. The last screenshot is captured after the panel settles (computed background white, opacity 1), not during its opening animation. Logs and aggregate source-check results are linked from audits/token-closure-progress.md.

## Portal scope / long-content follow-up — 2026-10-12

Each platform now provides a themed modal with body/host/inline controls, including a control inside the open panel. Caller overrides use a light surface; the real custom host uses a dark surface. Body mode must use the global theme instead of copying caller variables. The fixture overrides actual component tokens rather than assuming root system aliases will rebind locally.

Enable the long-text checkbox for Chinese, English, Arabic, Japanese and an unbroken identifier. Planned browser matrix: 2 platforms × 4 brand/mode choices × 3 destinations × 2 content lengths = 48 cases. Also inspect 320/390px widths, 200% browser zoom, host changes while open, close/return focus, horizontal overflow and an untouched neighboring instance. These are acceptance instructions, not pass results.

The current turn has no browser-control tool. Source syntax and independent Vite production compilation passed, but no new layout screenshot or computed-style result is claimed. Real Teleport regression tests cover DOM targets, component-state retention, scroll-lock release, foreign-document argument/event ownership and cleanup; they deliberately do not stand in for CSS variable evaluation or iframe browser focus.

The source guides document the supported local override contract. A component alias declared at root resolves before inheritance; changing only a descendant system token is not an automatic scoped-theme rebuild. Redeclare the required alias on the local host, or directly override the public component variable. Historical integration limitations are superseded by the latest closure-progress entry.

## Portal visual acceptance completed — 2026-10-13

Actual Chromium acceptance completed all 48 combinations at 1280×720: both platforms, all four brand/mode selections, three destinations and two content lengths. Read the actual selected theme, DOM owner, computed colors, bounds, focused element and lock cleanup for each case. Capture after opening animations settle; screenshots were visually reviewed in four labelled contact sheets.

Body surfaces are white / rgb(29,33,41) in both light brands, and #2a2a2b / rgba(255,255,255,.9) in both dark brands. Host overrides are #182230 / #f8f9fc; inline overrides are #eef2ff / #182230. Equal neutral surfaces across brands are intentional system mappings, not a failed theme switch. Fixture buttons/selects are native controls, not themed component Button examples.

Found and repaired: both libraries retained an old host after host → inline → body; preserving the enabled Teleport target while disabled fixes actual DOM placement. Inline scroll-lock ownership still follows the actual document body. Real Teleport regression tests now reject stale hosts rather than merely checking body.contains(). Cedar Drawer also bounds its width to the containing block, avoiding a 15px left crop at 320px when the document scrollbar remains visible.

Additional acceptance: 12 long-content cases at 320/390px, ten open-panel target checks, keyboard Tab/Enter close reachability at 320px, and two untouched-neighbor/root isolation checks. Unbroken identifiers scroll inside the panel without document-wide overflow; arbitrary business content can explicitly choose a wrapping policy. No new public token or API was introduced.

Evidence: [per-case data](../../../audits/evidence/portal-2026-10-13/results.json) and 66 actual screenshot files in that directory (48 desktop, 12 narrow, 2 keyboard and 4 contact sheets). The latest [closure record](../../../audits/token-closure-progress.md) describes fixes and verification. Earlier “planned/no browser control” paragraphs are historical, not current blockers.

For an uninterrupted visual run, start with `TOKEN_ACCEPTANCE_FROZEN=1 node refactors/token-validation/browser/serve.mjs`. Reload after repairs: this disables file watching, not repository edits. A concurrent date/docs build interrupted one collection, so the final matrix was rerun with watching disabled. Do not count interrupted groups or capture the opening fade as steady-state evidence.

Not covered: 200% native browser zoom, Safari/Firefox, physical iOS/Android, real OS reduced-motion, screen readers, real iframe focus/styles and arbitrary business-slot contrast. A 320px viewport is not 200% browser zoom.

## Native zoom and Safari/Firefox resume protocol — 2026-10-13

Latest bounded recheck at 14:12 Shanghai: the current Chrome extension binding was identified correctly, but nameSession → tabs.list did not complete within 20 seconds; which operation completed is unknown. No test tab or native zoom was created/set. Safari/Firefox are still absent from supported sessions, and four standard Firefox application paths remain absent. The previously long-hanging Safari native entry was not blindly retried. [Separate recheck evidence](../../../audits/evidence/browser-environment-2026-10-13/recheck-1412.json) adds zero accepted cases; all three 48-case suites remain blocked pending a changed supported connection. This does not supersede or rewrite the historical snapshot below.

Environment inspection added **zero accepted visual cases**. Chrome 154.0.8037.98 is installed and listed, but tab creation/navigation and a separate tab-list request timed out. Safari 18.4 is installed but absent from supported browser sessions; native inventory and direct Safari app control timed out. Firefox was absent from supported sessions and not found under /Applications or the user's Applications directory using standard and Developer Edition names. Other installation paths were not exhaustively searched. See [recorded environment checks and pending matrix](../../../audits/evidence/browser-environment-2026-10-13/status.json). No browser was installed or permissions changed.

Resume three distinct 48-case suites: Chrome at native 200% page zoom, Safari at confirmed 100%, and Firefox at confirmed 100%. Each uses both platforms × four brand/mode selections × three targets × two content lengths. Existing IAB Chromium captures do not count as Chrome-native-zoom or other-engine evidence. Additional Safari/Firefox 200% coverage can follow their baseline; it is not included in the pending 144-case count.

Native zoom proof:

1. Use a dedicated test tab on the fixture URL. Record browser version, original zoom, window/display conditions and OS text scaling. Do not change displays or window size between the 100% baseline and 200% comparison.
2. Use the browser's own **page zoom** control and capture its visible 100%, then 200%, indication. Text-only zoom, pinch magnification, CSS zoom/transform and resized viewports are different tests. Do not infer “200%” solely from DPR or innerWidth; browser implementations differ.
3. Record supporting DOM measurements at both levels: innerWidth/innerHeight, document client/scroll dimensions, panel and close-control bounds, scroll dimensions, focus and computed foreground/background. Preserve the browser UI zoom proof separately from page-only screenshots. Wait for opening animations to settle before evaluating geometry.
4. Run every group through a real open/close cycle. Confirm the actual selected theme and actual DOM ancestor, not merely the selected mounting label. Scroll long content and use Tab/Shift+Tab/Enter/Escape; the close action must remain reachable, with focus and scroll locks restored after closing. Internal long-identifier scrolling is permitted; page-wide overflow or unreachable controls is not.
5. Restore original zoom and any temporary viewport override; close only test-owned tabs. Record restoration. Failed operations or interrupted groups remain blocked/pending, never passed.

Safari/Firefox baseline proof follows the same matrix and lifecycle checks. Verify native keyboard navigation configuration without silently changing system preferences; a browser setting that changes Tab behavior must be recorded and distinguished from a component bug. Check host → inline → body while open and after reopening, paired foreground/background inheritance, untouched neighbors, focus containment/restoration, scrollbar-reduced Drawer bounds and actual overlay ordering. Engine differences in native fixture selects/buttons are not component Button defects. Use the installed product; a Playwright WebKit run would be supplementary engine coverage, not installed Safari acceptance.

For each case record browser/version, confirmed zoom, platform/theme/target/content, actual owner, colors, dimensions, focus, lock cleanup, screenshot path and pass/fail/blocked reason. A passed 200% case requires recorded native UI zoom proof. Preserve a failing screenshot before repair, add a focused regression test, reload the frozen fixture after changing source, and rerun affected cases. Never repair CSS solely because a browser control session timed out. See the design-token standard for component-variable and containing-block boundaries.

## Evidence integrity and relocation focus correction — 2026-10-13

Run `pnpm check:browser-evidence` to validate saved records and artifact integrity, not to perform a new browser run. The historical raw screenshots are JPEG: 62 misleading .png names were corrected to .jpg without changing bytes; the four PNG contact sheets remain unchanged. [screenshots.json](../../../audits/evidence/portal-2026-10-13/screenshots.json) records actual encoded dimensions and SHA-256 values. Exported image dimensions can differ from CSS viewport dimensions, so preserve both rather than treating image pixels as zoom proof.

The gate also verifies all twelve native before/after focus screenshots against a separate SHA-256/dimensions manifest, preserves the two pre-fix native failures, and checks the latest bounded recheck still reports zero passes and three blocked 48-case suites. It now has 46 positive/negative tests. A changed connection must produce a new recovery evidence record; do not overwrite a historical blocked observation or old failure to satisfy the gate.

The historical ten live target/color/lock checks contained eight focusInside=false readings; these were overlooked by the original collector. They are now disclosed through knownIssues in the original results and must not be rewritten as successful focus checks. Native IAB reproduction confirmed BODY focus after host → inline on both platforms even after 400ms. [Pre-fix screenshots and follow-up status](../../../audits/evidence/portal-focus-2026-10-13/status.json) are kept separately.

Both modal-surface implementations now refocus the active top modal after same-document target/inline changes, without recapturing the original opener or stealing focus from a higher layer. Real Teleport regressions check activeElement containment after host/inline/body migration; 92 related tests pass. Post-fix native follow-up now passes all ten host/inline/body/host/body checks at default/dark with long content and a 320×640 CSS viewport; both platforms also pass Tab/Shift+Tab wrapping, Enter close and original-opener restoration with released body locks. [Separate after.json and ten native JPEGs](../../../audits/evidence/portal-focus-2026-10-13/after.json) preserve the new proof without rewriting the eight historical failures. The captured `color` is the dialog root's computed color, not Cedar's separately styled content foreground; this focused follow-up does not re-certify every color pair.

Recovery correction: browser IDs changed after runtime reset. The stale id 2 referred to MCP Apps, so its restricted get/list API was mistakenly described as an IAB regression. Fresh inventory identified IAB as id 3; its full supported tab API restored the fixture. Resolve current browser identity/type after resets instead of retaining old numeric IDs. This recovery does not verify native 200% zoom or remove the Safari/Firefox blockers.

## Next executable acceptance batches

**Update 2026-10-13: motion/contrast preparation is complete for the bounded modal scope, not OS/browser acceptance.** Source inventory: 165 files, 386 CSS declaration candidates, 118 runtime-call candidates; a nearby media query or timer is not proof of coverage or a defect. Run `pnpm check:motion-themes` for inventory drift plus 96 theme/preference cases, 88 duration overrides and 176 actual modal active-class consumers. The initial local Drawer reduced test failed before repair. Drawer and Popup now disable built-in transitions and starting movement under reduce from their component styles; Popup also disables its base content/overlay transitions. Normal timing is unchanged.

Run `pnpm check:modal-themes`: 10 contrast helper tests plus 16 combinations / 72 default + 80 explicit foreground/background pairs, minimum displayed 5.102:1. Composite alpha against an actual opaque backing and compare unrounded ratios. Poor custom pairs and unknown backings are rejected. Custom business slots/imagery/unstyled colors, arbitrary system alias overrides and real OS switching are not certified. Related portal tests remain 96 passes; Maple full lint passes. No new API/token. Source inventory/evidence: `audits/evidence/motion-contrast-2026-10-13/`.

Next bounded work: Popup duration/easing token specification and lifecycle regression. Its existing 250ms is deliberately retained by this API-neutral reduced-motion repair, not silently replaced by another component's token or system standard. Remaining inventory candidates require separate responsibility review. This preparation adds **zero native cases** and leaves 144 external-browser/zoom cases blocked.

**Update 2026-10-13: batch 2 is complete, 8/8 IAB nested cases.** Isolated source fixture: `/design-ui/refactors/token-validation/browser/nested.html`. Both platforms × four themes use real body Teleports, default retained mounting and native keyboard input. Every group runs child-first and parent-first closure, then a single-parent reopen: top-only Tab/Shift+Tab/Escape, skipped hidden/disabled parent controls, correct child/page opener restoration, actual stacking and overlay pointer suppression, stable panel bounds/colors, reference-counted body locks and one scrollbar reservation. The parent-first survivor remains operable until closed. A closed-layer Escape does not repeat state changes. Background suppression here is keyboard and pointer behavior, not screen-reader isolation.

Both modal-focus copies previously lost the original page opener when the parent closed first. Two native before screenshots are preserved. A new real Teleport regression failed before repair; opening now snapshots ancestor modal opener chains and closing chooses the first connected, visible, enabled candidate without stealing new outside focus. No public API/token changes. This follows the Vue Best Practices real-DOM route, not a Teleport stub.

[Nested per-step evidence](../../../audits/evidence/nested-2026-10-13/results.json) and an 18-JPEG hash/dimensions manifest preserve eight open views, eight final closed views and two original failures. All eight open views were visually inspected. Portal regressions: 48 per platform / 96 total; evidence gate: 88 tests; 75 independent foundation copies match. Both full type checks, Maple full lint:check and Cedar affected-file ESLint pass. This does not cover parent-first unmountOnClose removal, cross-library modal coordination, arbitrary slot contrast, other engines, native zoom or screen readers. Batch 3 remains next; completed recipes below are retained for reruns.

**Update 2026-10-13: batch 1 is complete, 8/8 IAB cases.** Run the independent real-frame fixture at `/design-ui/refactors/token-validation/browser/iframe.html`; it uses `iframe-target.html`, separate component CSS imports and StyleProvider calls in each document. Parent is default/light and frame is maple/dark. Native document snapshots confirm primary tuples 0,190,190 vs 251,146,60 and light vs dark for both libraries. No style elements or caller variables are copied across documents. The actual host for absolute-positioned Drawer must establish a positioned, bounded scrolling containing block; the first diagnostic fixture lacked this and is preserved separately as `probe.json` and eight `probe-*.jpg`, not final acceptance.

Found and fixed in both modal-focus copies: a modal initially placed in an iframe captured that document's BODY instead of its parent-document opener. Follow accessible same-origin ancestor focus chains when first capturing; keep the original opener through moves, and do not steal focus from a newly focused outside ancestor control. Pre-fix native screenshots on both platforms and the failing-before regression are preserved. The Vue Best Practices real-DOM testing route uses an actual iframe and no Teleport stub. No public API or token changes.

[Final eight-case data](../../../audits/evidence/iframe-2026-10-13/results.json) contains open/close, both move directions, reopening, settled rectangles/colors, native keyboard wrapping, original opener restoration and both documents' released locks. Two extra native checks confirm Escape in the other document does not close the modal, the target document does close it, and a closed modal does not react again. This last check is observable event behavior, not an inspection of browser listener internals. Permanent unit tests additionally cover listener rebinding/unmount cleanup. Eight final native JPEGs were individually inspected; a manifest validates final, pre-fix and diagnostic bytes. Evidence gate: 62 tests; portal-related regressions: 47 per platform / 94 total; 75 independent foundations match. Cross-origin frames, detached/frame-removal edge cases, installed other engines and native 200% remain excluded. The following scenario description is retained as the reproducible batch recipe; batch 2 is now complete as recorded above; batch 3 remains next.

Chrome native 200% and installed Safari/Firefox remain deferred: 144 planned cases are not replaced by the following IAB work. Do not repeatedly call unchanged hanging entry points. Existing passing groups need not be recollected unless their implementation or fixture changes.

1. **Real same-origin iframe — prepare, then execute eight IAB cases.** Both platforms × four scenarios: open/close in an iframe host; move top-document host → iframe host; move iframe host → top-document host; close/reopen after an iframe-host move. Each case uses real iframe `contentDocument` and separately loaded component styles/theme in that document, not a DOM lookalike. Record both documents' actual theme/computed content colors, root/host dimensions and locks; keyboard Tab/Shift+Tab/Escape; actual panel ownerDocument and activeElement in both documents; parent iframe focus chain; original trigger restoration; lock/listener cleanup after close. First confirm the supported browser API can inspect/interact with the real frame. If frame control is unavailable, record that blocker and keep cases pending. Detached hosts/frame removal and cross-origin frames are separate edge cases, not covered by these eight.
2. **Nested modal keyboard — eight IAB cases.** Both platforms × four themes. With parent and child open, only the top layer handles Escape/Tab; child close returns focus to its parent trigger; parent close returns to the original page trigger. Verify stacking, focus containment, background suppression and reference-counted lock release through both close orders. Save actual per-step state and native screenshots. This tests existing API behavior, not a new token contract.
3. **Motion and contrast preparation.** Audit existing reduced-motion rules and list actual animation consumers; distinguish rule/compiled-CSS tests from a real OS reduced-motion run. Check default/system and explicit component override foreground/background pairs, documenting responsibility for custom business slots instead of claiming arbitrary user palettes pass. Reuse existing token roles before adding any variable; API additions require the established specification workflow.

Hardware/external-environment work remains separate: physical iOS/Android touch/keyboard, real OS reduced-motion, screen readers, installed Safari/Firefox and verified native page zoom. Preparation and static regressions must never increment native acceptance totals. Update the closure record and all menu guides whenever scope or token responsibilities change.
# Popup motion lifecycle (2026-10-13)

## Ripple timing audit (2026-10-13)

`ripple-motion.html` runs real independent Cedar/Maple directives and CSS, with native Enter/Space activation. Both platforms × default 200ms/140ms, long 600ms/800ms and explicit zero: **6/6**. MutationObserver timestamps capture creation, activation, fade and removal; timing evidence uses a fixed 2ms observation tolerance, not a shortened implementation minimum or frame-perfect guarantee. Final native DOM contains no wave nodes. Unit tests separately verify exact fake-clock floors, timer/listener ownership, nested/foreign-document behavior and cleanup.

Evidence: `audits/evidence/ripple-motion-2026-10-13/results.json` plus original `native.jpg` SHA-256. `node --test bin/ripple-motion-evidence-check.test.mjs` has eight positive/negative checks; `node bin/ripple-motion-evidence-check.mjs` validates actual saved data and JPEG hash, both included in check:browser-evidence. No device-touch, OS preference, native 200%, Safari or Firefox acceptance is claimed. An unsuccessful private-state diagnostic is disclosed rather than treated as native timer proof.

At the Ripple batch boundary, the global source-candidate inventory drifted in Cedar Button CSS due to concurrent work (199 versus 198 Cedar declarations, total 387 versus 386). That failure remains historical evidence. The subsequent Button/BackTop batch reviewed stable Button hashes and introduced the live baseline at audits/motion-source-inventory.json; historical source-inventory.json is unchanged. Timeout scheduling is now included: 192 files / 387 CSS declaration hints / 186 runtime-call hints. Hints are not defects or browser acceptance.

## Notification native IAB service audit (2026-10-13 evening)

notification-motion.html imports the actual Cedar service/CSS. Default/light native clicks launch default, 600ms/linear leave, explicit zero, immediate clear/same-ID re-add and active-ID update; a sixth case uses the real notification close control. **6/6** with nodes zero and one public close callback each. Re-add uses two independent DOM items and no old close callback; active update keeps the same DOM node. Manual close occurs before its automatic deadline.

MutationObserver and actual active CSS record 400ms entry/300ms default leave/600ms override/zero; public capture-phase transition events preserve completed 0.3s interrupted transform and manual opacity transitions. DOM class timestamps are not compositor starts. Completion uses a full native elapsedTime event or the observed leave-to/removal chain, not a relaxed wall-clock minimum for interrupted entry. Empty TransitionGroup move-measurement clones are excluded by this fixture's explicit content identity; clone-inclusive and bubble-only preliminary runs are superseded, not accepted.

Evidence: audits/evidence/notification-native-2026-10-13/results.json and original native.jpg. Sixteen positive/negative checks are included in check:browser-evidence. No other themes/positions, real OS preference changes, native zoom, Safari/Firefox or touch-device acceptance is claimed.

## LoadingBar native IAB audit (2026-10-13 evening)

loading-bar-motion.html imports the real Maple service and CSS. Six native button clicks launch documented fixture business sequences: default, long 600ms/linear with width 100ms/opacity 200ms delays, explicit zero, repeated finish, restart during completion, and error. **6/6**, final nodes zero. DOM MutationObserver timestamps and resolved CSS are recorded without private timer inspection. Long hiding/removal waits measured 700.9ms/802.9ms; restart 702.7ms/802.9ms. Default/zero preserve 300ms/250ms cleanup floors. A fixed 2ms observation tolerance is not frame-perfect proof.

Evidence: audits/evidence/loading-bar-native-2026-10-13/results.json and original native.jpg. Ten positive/negative checks plus data/image hash validation are included in check:browser-evidence. First sandbox listen failed EPERM; approved loopback startup succeeded. The initial connection-refused tab was not accepted. No real OS reduced-motion, native 200%, Safari, Firefox or touch-device coverage is added; the 144 blocked groups remain.

## Button decision and historical LoadingBar preparation

User decision after the correction: retain white on-dark primary Button text and record default/light 2.305:1 as an intentional design exception, not AA acceptance. The measured dark-foreground alternative is not adopted; other text thresholds remain unchanged. Continued motion work no longer waits for this color choice.

Final coordination correction: the following Button repair numbers are intermediate only. Concurrent edits restored on-dark in both Button sources and shared contract; current primary solid text contrast is again 2.305:1. The primary foreground fix is pending owner coordination, not currently accepted. LoadingBar runtime/compiled checks remain independently valid.

Subsequent Button/LoadingBar batch: primary solid foreground repaired without changing the palette or system-role values; 192 compiled combinations/640 text pairs, minimum 6.277:1. Full variant gate still fails separately on primary icon-container text contrast 3.207:1. Maple LoadingBar has 12 runtime/SSR tests and 8 compiled theme/preference cases plus 4 paired overrides; duration/easing now come from 250ms/ease tokens and cleanup waits for resolved width/opacity timing. This adds **zero** native browser/OS passes. Current candidate baseline is 192 files/388 CSS/180 runtime; historical evidence is unchanged. See audits/evidence/button-loading-bar-2026-10-13/results.json and shared/menu guides.

## BackTop runtime audit (2026-10-13)

Both independent components passed 16 tests each, including three failing-before regressions: changing reduced-motion preference mid-scroll, an already-dequeued callback after target replacement, and a foreign iframe document preference. These are mocked RAF/jsdom and SSR tests, not native browser or OS acceptance. Duration 200ms/easing quartOut remain JS props, not CSS tokens. Preference is checked on each frame; old callbacks are generation-guarded. Shared and both menu guides document this boundary. Button unit tests passed Cedar 37 / Maple 65 and disabled-only compiled checks passed 4096 combinations; primary white text 2.305:1 is now an explicitly approved design exception, not an AA text pass. No global threshold was relaxed.

`popup-motion.html` uses the actual Maple Popup source with real Teleport and a common host carrying `--mp-popup-transition-duration` / `--mp-popup-transition-timing-function`. Native IAB checks cover default 250ms/ease, 600ms/linear across five placements, explicit 0ms, 60ms close/reopen and disposal: **9/9**, with probe mount counts, event timestamps, host locks and opener restoration. See `audits/evidence/popup-motion-2026-10-13/results.json`; validate with `node bin/popup-motion-evidence-check.mjs` from design-ui.

Stable wrapper CSS has no transition: duration assertions use real active fade classes during leaving. Completion unmounts slot instances; nested transition DOM can remain hidden briefly before final removal. Initial mounted/open notification is not a full appear-timing guarantee. Seven original JPEG screenshots preserve their hashes. Explicit 0ms is not an OS preference change; no Chrome native 200%, Safari, Firefox or real-device coverage is added.

## Trigger real IAB lifecycle (2026-10-13)

`trigger-lifecycle.html` covers actual Cedar/Maple Trigger delayed-unmount and KeepAlive/ResizeObserver in default/light:4/4, final panels0. Entry buttons are native-clicked; internal mouseenter is fixture-scripted, not native-hover evidence. A remount/open positive control proves the actual300ms path. Resize counts1→2 while active, stay2 inactive, then3 after reactivation. Initial negative-only probes were replaced by the complete positive-control run, not counted twice. Relative public/DOM phase evidence and original JPEG/hash live in `audits/evidence/trigger-native-lifecycle-2026-10-13`; `check:browser-evidence` verifies them. No OS/native zoom/external-browser or cross-window visuals are added.

## IndexBar consumer lifecycle (2026-10-14)

`index-bar-lifecycle.html` runs real Maple IndexBar/IndexAnchor/CSS, default/light with an element scroller. Four native entry clicks cover replacement, two-frame state protection, interpolation disposal/retained commands, and KeepAlive cancellation/reactivation. Internal commands and scroll events are fixture-scripted, not native gestures. No viewport/OS settings changed. Frozen service must restart and tab reload after source/fixture changes; read actual group offsets instead of fixed0/480. Initial geometry and activation-registration failures are retained in the audit, not overwritten as initial passes. Final evidence binds sources/fixture/original JPEG and records phase/count/position summaries, not full-frame pixels. Own timers/frames/scrollTo descriptors and app are cleaned up.

