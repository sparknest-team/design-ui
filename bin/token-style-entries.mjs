import { dirname, relative, resolve } from 'node:path';

// Follow only executable static imports from the real public style entry modules.
// Private style modules are not roots: an orphan must not gain consumption proof.
export function collectStyleGraph(root, files, read, exists, ts) {
  const modules = new Set();
  const less = new Set();
  const visit = file => {
    if (file.endsWith('.less')) { less.add(file); return; }
    if (modules.has(file)) return;
    modules.add(file);
    const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true);
    for (const statement of source.statements) {
      if (!ts.isImportDeclaration(statement) || statement.importClause?.isTypeOnly ||
          !ts.isStringLiteral(statement.moduleSpecifier)) continue;
      const specifier = statement.moduleSpecifier.text;
      if (!specifier.startsWith('.')) continue;
      const base = resolve(dirname(file), specifier);
      if (!base.startsWith(root + '/')) continue;
      const target = /\.(less|ts)$/.test(base) ? (exists(base) ? base : undefined)
        : [base + '.ts', resolve(base, 'index.ts')].find(exists);
      if (target) visit(target);
    }
  };
  files.filter(file => file.endsWith('/style/index.ts') && !relative(root, file).startsWith('_components/')).forEach(visit);
  return { modules, less };
}

export function tokenStyleLayout(root, file, graph, exists) {
  const directory = dirname(file);
  const owner = relative(root, directory);
  if (owner.startsWith('_components/') && !file.endsWith('/style/token.less')) {
    const entry = resolve(directory, 'style.less');
    const modules = [resolve(directory, 'style.ts'), resolve(directory, 'style/index.ts')];
    return { component: owner, declarationSource: relative(root, file), entry, internal: true,
      ...(!(exists(entry) && modules.some(module => graph.modules.has(module)) && graph.less.has(entry))
        ? { error: 'Private token requires a reachable style module -> style.less entry' } : {}),
    };
  }
  const entry = resolve(dirname(file), 'index.less');
  return {
    component: relative(root, dirname(dirname(file))),
    declarationSource: relative(root, file),
    entry,
    internal: owner.startsWith('_components/'),
    ...(!exists(entry) ? { error: 'No sibling style/index.less' } : {}),
  };
}
