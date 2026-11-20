import path from 'node:path';

// Ignore headings inside fenced code: examples often contain Markdown snippets.
function headings(text) {
  const result = []; let offset = 0; let fence;
  for (const line of text.split(/(?<=\n)/)) {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    if (marker) {
      if (!fence) fence = marker[0];
      else if (fence === marker[0]) fence = undefined;
    } else if (!fence) {
      const match = /^(#{2,3}) (.+)\s*$/.exec(line);
      if (match) result.push({ index: offset, end: offset + line.length, level: match[1].length, title: match[2].trim() });
    }
    offset += line.length;
  }
  return result;
}
export const demoRefs = text => [...text.matchAll(/<demo\b[^>]*src="([^"]+)"|```demo\s*\n([^\n]+)/g)].map(match => (match[1] ?? match[2]).trim());
const basename = ref => path.basename(ref, '.vue');
export const isApiHeading = title => /^(?:API(?: Reference)?|属性|Props|Events|Slots|Methods)$/i.test(title.trim());
export function cedarDemoFamily(relative) {
  if (/\/README(?:\.en-US)?\.md$/.test(relative)) return path.dirname(relative);
  if (/\/PICKER(?:\.en-US)?\.md$/.test(relative)) return `${path.dirname(relative)}/picker`;
  return undefined;
}

export function readDemoSections(source) {
  // Several authored feature demos were appended after API tables. Bring whole
  // feature chapters (including their explanation) back to the examples area.
  const top = headings(source).filter(mark => mark.level === 2);
  const apiIndex = top.findIndex(mark => isApiHeading(mark.title));
  if (apiIndex >= 0) {
    const late = top.slice(apiIndex + 1).map((mark, index, rest) => ({ ...mark, stop: rest[index + 1]?.index ?? source.length }))
      .filter(mark => !isApiHeading(mark.title) && !/^FormItem\b/.test(mark.title) && demoRefs(source.slice(mark.index, mark.stop)).length);
    if (late.length) {
      let api = source.slice(top[apiIndex].index);
      for (const mark of [...late].reverse()) api = api.slice(0, mark.index - top[apiIndex].index) + api.slice(mark.stop - top[apiIndex].index);
      source = source.slice(0, top[apiIndex].index).trimEnd() + '\n\n' + late.map(mark => source.slice(mark.index, mark.stop).trim()).join('\n\n') + '\n\n' + api;
    }
  }
  const updatedMarks = headings(source);
  const apiStart = updatedMarks.find(mark => mark.level === 2 && isApiHeading(mark.title));
  if (apiStart) {
    const lateCases = updatedMarks.filter(mark => mark.index > apiStart.index).map((mark, index, rest) => ({ ...mark, stop: rest[index + 1]?.index ?? source.length }))
      .filter(mark => mark.level === 3 && demoRefs(source.slice(mark.index, mark.stop)).length);
    if (lateCases.length) {
      let api = source.slice(apiStart.index);
      for (const mark of [...lateCases].reverse()) api = api.slice(0, mark.index - apiStart.index) + api.slice(mark.stop - apiStart.index);
      source = source.slice(0, apiStart.index).trimEnd() + '\n\n## 案例\n\n' + lateCases.map(mark => source.slice(mark.index, mark.stop).trim()).join('\n\n') + '\n\n' + api;
    }
  }
  const marks = headings(source);
  const boundary = marks.find(mark => mark.level === 2 && isApiHeading(mark.title));
  const end = boundary?.index ?? source.length;
  const before = source.slice(0, end);
  const chapters = headings(before).filter(mark => mark.level === 2);
  const ranges = chapters.length ? chapters.map((mark, index) => ({ ...mark, content: before.slice(mark.end, chapters[index + 1]?.index ?? end) })) : [{ title: '', content: before, index: 0, end: 0 }];
  let prefix = chapters.length ? before.slice(0, chapters[0].index) : '';
  if (chapters.length && demoRefs(prefix).length) {
    ranges.unshift({ title: '', content: prefix, index: 0, end: 0 });
    prefix = '';
  }
  const cases = [], preserved = [], nestedApis = [];
  for (const chapter of ranges) {
    if (!chapter.content.trim()) continue;
    // FormItem documents a separate component; its chapter is an intentional boundary.
    if (/^FormItem\b/.test(chapter.title) || !demoRefs(chapter.content).length) {
      const generic = /^(案例|示例|Examples|Demos)$/.test(chapter.title);
      const text = (chapter.title && !generic ? `## ${chapter.title}\n\n` : '') + chapter.content.trim();
      if (cases.length) preserved.push(text); else prefix += text + '\n\n';
      continue;
    }
    const subheadings = headings(chapter.content).filter(mark => mark.level === 3);
    if (!subheadings.length) {
      if (!chapter.title) {
        const demos = [...chapter.content.matchAll(/<demo\b[^>]*src="[^"]+"[^>]*>\s*<\/demo>|```demo[^\n]*\n[^\n]+\n```/g)];
        let prose = chapter.content;
        for (const demo of [...demos].reverse()) prose = prose.slice(0, demo.index) + prose.slice(demo.index + demo[0].length);
        prefix += prose.trim() + '\n\n';
        for (const demo of demos) {
          const refs = demoRefs(demo[0]);
          const title = basename(refs[0]).replace(/-/g, ' ');
          cases.push({ title, text: `### ${title}\n\n${demo[0]}`, refs });
        }
        continue;
      }
      const title = /^(案例|示例|Examples|Demos)$/.test(chapter.title) ? '基础用法' : chapter.title;
      cases.push({ title, text: `### ${title}\n\n${chapter.content.trim()}`, refs: demoRefs(chapter.content) });
      continue;
    }
    const intro = chapter.content.slice(0, subheadings[0].index).trim();
    if (intro) {
      // A direct demo before the first case gets its own case, never a hidden preface.
      if (demoRefs(intro).length) cases.push({ title: chapter.title, text: `### ${chapter.title}\n\n${intro}`, refs: demoRefs(intro) });
      else prefix += intro + '\n\n';
    }
    for (let index = 0; index < subheadings.length; index++) {
      const heading = subheadings[index];
      // Older Date/Time pages include a second component's API at level three.
      // Keep those tables in an API chapter instead of attaching them to a demo.
      if (/^API$/i.test(heading.title)) {
        let stop = index + 1;
        while (stop < subheadings.length) {
          const candidate = chapter.content.slice(subheadings[stop].index, subheadings[stop + 1]?.index ?? chapter.content.length);
          if (demoRefs(candidate).length) break;
          stop++;
        }
        const owner = /^# (DateRange|Date|TimeRange|Time)\b/m.exec(source)?.[1];
        const title = owner ? `${owner}Picker API` : 'Additional API';
        const content = chapter.content.slice(heading.end, subheadings[stop]?.index ?? chapter.content.length).trim();
        nestedApis.push(`## ${title}\n\n${content}`);
        index = stop - 1;
        continue;
      }
      const text = chapter.content.slice(heading.index, subheadings[index + 1]?.index ?? chapter.content.length).trim();
      const refs = demoRefs(text);
      if (refs.length) cases.push({ title: heading.title, text, refs });
      else if (cases.length) cases[cases.length - 1].text += '\n\n' + text;
      else prefix += text + '\n\n';
    }
  }
  return { prefix, cases, preserved, api: [source.slice(end).trimEnd(), ...nestedApis].filter(Boolean).join('\n\n') + (end < source.length || nestedApis.length ? '\n' : '') };
}

export function groupDemoSections(source, groups, english = false) {
  if (!groups?.length) return source;
  const { prefix, cases, preserved, api } = readDemoSections(source);
  if (!cases.length) return source;
  const assigned = new Set();
  const configured = new Set(groups.flatMap(group => group.cases));
  const caseName = item => {
    const name = basename(item.refs[0]);
    return configured.has(name) ? name : name.replace(/\.en-US$/, '');
  };
  const chapters = groups.flatMap(group => {
    // A case may compare several demos; keep its prose and references together.
    const matches = cases.filter(item => group.cases.includes(caseName(item)));
    matches.sort((a, b) => group.cases.indexOf(caseName(a)) - group.cases.indexOf(caseName(b)));
    for (const item of matches) {
      if (assigned.has(item)) throw new Error(`Demo assigned to multiple groups: ${item.refs.join(', ')}`);
      assigned.add(item);
    }
    return matches.length ? [`## ${english ? group.en : group.title}\n\n${matches.map(item => item.text).join('\n\n')}`] : [];
  });
  const missing = cases.filter(item => !assigned.has(item));
  if (missing.length) throw new Error(`Ungrouped demos: ${missing.flatMap(item => item.refs).join(', ')}`);
  return [prefix.trimEnd(), ...chapters, ...preserved, api.trim()].filter(Boolean).join('\n\n') + '\n';
}
