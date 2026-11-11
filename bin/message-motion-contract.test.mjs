import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { test } from "node:test";

for (const [repo, pkg] of [["cedar-design-web", "ui"], ["maple-design-mobile", "ui"]]) {
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
    assert.match(service, /!this\.instances\.has\(item\.id\)/);
    assert.match(service, /!item\.open \|\| !this\.items\.includes\(item\)/);
    assert.match(service, /const index = this\.items\.indexOf\(item\)/);
    assert.match(service, /if \(item\.open\)/);
    assert.match(service, /\[\.\.\.this\.items\]/);
  });
}
