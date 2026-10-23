import assert from "node:assert/strict";
import test from "node:test";
import {
  scanMotionSource,
  collectMotionInventory,
} from "./motion-source-inventory.mjs";

test("includes delayed lifecycle scheduling as candidates without declaring it motion", () => {
  const result = scanMotionSource(
    "loading-bar/index.ts",
    "window.setTimeout(tick, 200)\nrequestAnimationFrame(step)\nsetInterval(poll, 1000)",
  );
  assert.deepEqual(result.runtime, [1, 2, 3]);
  assert.deepEqual(result.css, []);
});
test("separates CSS declarations and preference presence from runtime calls", () => {
  const result = scanMotionSource(
    "button/style/button.less",
    ".c-button {\n  transition: none;\n}\n@media (prefers-reduced-motion: reduce) {}",
  );
  assert.deepEqual(result.css, [2]);
  assert.deepEqual(result.runtime, []);
  assert.equal(result.hasLocalReducedQuery, true);
});
test("keeps per-line evidence rather than counting multiple calls as defects", () => {
  assert.deepEqual(
    scanMotionSource("index.ts", "setTimeout(() => setTimeout(done, 5), 10)")
      .runtime,
    [1],
  );
});
test("excludes demos, tests and docs from the current inventory", () => {
  for (const platform of collectMotionInventory().platforms) {
    assert.ok(
      platform.candidates.every(
        (row) =>
          !/(?:^|\/)(?:__tests__|__demos__|example|docs)(?:\/|$)/.test(
            row.file,
          ),
      ),
    );
    assert.equal(
      platform.runtimeCallCandidates,
      platform.candidates.reduce((sum, row) => sum + row.runtime.length, 0),
    );
  }
});
