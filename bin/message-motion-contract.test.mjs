import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { test } from "node:test";

for (const [repo, pkg] of [["cedar-design-web", "cedar-ui"], ["maple-design-mobile", "maple-ui"]]) {
  const source = new URL(`../../${repo}/packages/${pkg}/src/message/`, import.meta.url);
  test(`${repo}: CSS completion is not forced to 150ms`, () => {
    const sfc = readFileSync(new URL("Message.vue", source), "utf8");
    assert.doesNotMatch(sfc, /:duration\s*=/);
    assert.match(sfc, /@after-leave="emit\('closed'\)"/);
  });
  test(`${repo}: service disposal follows component completion`, () => {
    const service = readFileSync(new URL("index.ts", source), "utf8");
    assert.doesNotMatch(service, /closeTimers|setTimeout\(/);
    assert.match(service, /onClosed:\s*\(\) => this\.finishClose\(item\)/);
    assert.match(service, /!this\.instances\.has\(id\)/);
    assert.match(service, /\[\.\.\.this\.items\]/);
  });
}
