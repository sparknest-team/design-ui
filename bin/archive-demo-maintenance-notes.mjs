import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
const write = process.argv.includes('--write');
const archive = path.join(root, 'design-ui/audits/evidence/demo-reorganization-2026-10-23/maintenance-notes.json');
const previous = fs.existsSync(archive) ? JSON.parse(fs.readFileSync(archive, 'utf8')) : [];
const changed = [];
// Archive engineering history throughout the page, not only its introduction.
// API tables, code, headings and authored usage instructions are not candidates.
const internal = /JSDOM|非原生|证据[：:]|audits\/|本轮.*(?:验证|专项|最终|源码)|本批.*(?:专项|验收|接管)|限域授权|受控(?:回归|队列|时钟|测试|证据)|目录漂移|早期.*待|本端.*未接管|运行时审计待办|阶段[一二三].*(?:授权|专项|验证)|后续授权|最终分层结果|lint 补验|专项.*(?:通过|为受控)|回归.*通过|代次|旧续体|真实IAB.*通过|最终完整.*通过|当前源码重验|原生布局验收|native-layout acceptance|搜索.*退休|FieldPresentation searches|scoped style\/inventory review|Audit boundary|Completion-wait update|controlled tests|Evidence:/i;
for (const library of ['cedar-design-web/packages/cedar-ui', 'maple-design-mobile/packages/maple-ui']) {
  const base = path.join(root, library, 'src');
  for (const file of fs.readdirSync(base, { recursive: true }).filter(file => /\/README\.md$|\/docs\/(?:zh-CN|en-US)\.md$/.test(file))) {
    const full = path.join(base, file), source = fs.readFileSync(full, 'utf8');
    const notes = [];
    let fence = false;
    const cleaned = source.split(/(\n\n+)/).map(paragraph => {
      if (/^\n+$/.test(paragraph)) return paragraph;
      const wasFenced = fence;
      for (const line of paragraph.split('\n')) if (/^\s*(```|~~~)/.test(line)) fence = !fence;
      if (wasFenced || fence || /^(?:#|---|\||\s*[-*]\s|\s*\d+\.\s|```|~~~|<)/.test(paragraph.trim())) return paragraph;
      if (!internal.test(paragraph)) return paragraph;
      notes.push(paragraph);
      return '';
    }).join('').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
    if (!notes.length) continue;
    const relative = path.relative(root, full);
    const record = previous.find(item => item.file === relative);
    if (record) record.paragraphs = [...new Set([...record.paragraphs, ...notes])];
    else previous.push({ file: relative, paragraphs: notes });
    changed.push(relative);
    if (write) fs.writeFileSync(full, cleaned);
  }
}
if (write) {
  fs.mkdirSync(path.dirname(archive), { recursive: true });
  fs.writeFileSync(archive, JSON.stringify(previous, null, 2) + '\n');
}
console.log(JSON.stringify({ changed: changed.length, archivedPages: previous.length }, null, 2));
if (!write && changed.length) process.exitCode = 1;
