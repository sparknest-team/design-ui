import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { copyFile, mkdir, readdir, readFile, realpath, stat, writeFile } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { componentPages, productionFingerprint, sourceFingerprint } from './inventory.mjs'
import { acceptanceCases, createNativeReport, targetCatalog, targetCatalogSha256 } from './native-acceptance.mjs'
import { copyProductionSnapshot } from './snapshot.mjs'

const workspace = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const templates = new URL('./native-kit/', import.meta.url)
const digest = (value) => createHash('sha256').update(value).digest('hex')
export const mobileChecks = {
  'tap-drag-swipe-longpress': ['drag', 'swipe-cell', 'pull-refresh', 'index-bar'],
  'input-ime-autofill': ['input', 'verification-code'],
  'native-keyboard-visibility': ['input', 'textarea', 'form'],
  'popup-position-scroll-lock': ['popup', 'select', 'date', 'time'],
  'nested-scroll': ['pull-refresh', 'index-bar', 'select'],
  'orientation-address-bar-viewport': ['safe-area', 'floating-panel'],
  'safe-area-teleport': ['safe-area', 'popup', 'tab-bar'],
  'upload-camera': ['upload'],
  'light-dark-layout': ['form', 'safe-area', 'button'],
}
const desktopChecks = {
  'input-ime-autofill': ['input', 'verification-code'],
  'keyboard-focus': ['input', 'tabs', 'select'],
  'popup-position-scroll-lock': ['dialog', 'select', 'date'],
  'date-selection': ['date', 'date-range', 'time'],
  upload: ['upload'],
  'light-dark-layout': ['form', 'button', 'table'],
}
const instructions = {
  'tap-drag-swipe-longpress':
    '用真实手指点击、拖拽、滑动和长按；检查滑动取消、页面滚动竞争、下拉刷新以及索引定位，保存操作视频。',
  'input-ime-autofill':
    '使用系统中文输入法完成组合输入、删除和提交；检查验证码自动填充提示。只用测试内容，不记录真实短信或个人资料。',
  'native-keyboard-visibility':
    '打开系统软键盘，滚动并切换输入框；确认输入和确认/关闭按钮不被遮挡，收起键盘后布局恢复。保存前后截图。',
  'popup-position-scroll-lock':
    '在滚动后、靠近屏幕边缘时打开选择器和日期/时间；检查定位、背景锁滚、确认/取消，以及关闭后滚动恢复。',
  'nested-scroll': '在选项长列表和嵌套滚动区反向滚动，检查不穿透背景、不错误触发刷新；关闭后页面可继续滚动。',
  'orientation-address-bar-viewport':
    '竖屏/横屏切换并展开、收起浏览器地址栏；带键盘重复检查，不应裁切确认按钮、出现遮挡或横向溢出。',
  'safe-area-teleport':
    '在真实刘海/手势区设备验证四边和横屏；将示例模拟值与实际 env 边距分开记录。检查 body 与局部挂载的 Popup、固定 TabBar；零值覆盖和嵌套保护正确。',
  'upload-camera':
    '经真实系统选择器选择测试图片/视频并拍摄测试画面；检查权限拒绝/取消、预览、重试、进度、限制和删除。不上传私有照片或文件内容到报告。',
  'light-dark-layout':
    '通过实际主题菜单切换亮暗及品牌主题，重载后检查持久化；检查文字、禁用/选中状态、焦点和完整表单，不应丢失值或横向溢出。',
  'keyboard-focus':
    '使用真实键盘 Tab/Shift+Tab、方向键、Enter/Escape；检查焦点顺序、弹层焦点及关闭后的恢复，补测中文 IME。',
  'date-selection': '选择并确认/取消日期、范围和时间；检查禁用值、时区、跨月、DST 和范围端点锁定。',
  upload: '用真实文件选择器选择测试图片/视频，覆盖取消、预览、限制、重试与删除。',
}

async function filesUnder(directory) {
  const files = []
  async function walk(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const file = resolve(folder, entry.name)
      if (entry.isDirectory()) await walk(file)
      else {
        assert.ok(entry.isFile(), 'Only regular files are allowed in a handoff')
        files.push(file)
      }
    }
  }
  await walk(directory)
  return files.sort()
}
export async function sealReport(path) {
  path = resolve(path)
  const report = JSON.parse(await readFile(path, 'utf8'))
  for (const row of report.targets) {
    row.evidenceSha256 = {}
    for (const item of row.evidence) {
      assert.ok(typeof item === 'string' && !item.startsWith('/'))
      const candidate = resolve(dirname(path), item)
      assert.ok(candidate.startsWith(dirname(path) + '/'), 'Evidence must stay inside the report directory')
      const file = await realpath(candidate)
      assert.ok(
        file.startsWith((await realpath(dirname(path))) + '/'),
        'Evidence must stay inside the report directory',
      )
      assert.ok((await stat(file)).size > 0, 'Empty evidence is not accepted')
      row.evidenceSha256[item] = digest(await readFile(file))
    }
  }
  // Hashing is not a test pass. Operator statuses and case results are preserved.
  await writeFile(path, JSON.stringify(report, null, 2) + '\n')
  return { path, targets: report.targets.length, status: 'hashes-recorded; acceptance-not-granted' }
}
export async function createHandoff(destination, roots = {}, acceptedManifestPath) {
  destination = resolve(destination)
  assert.ok(
    acceptedManifestPath,
    'Specify the accepted quality manifest; do not infer acceptance from a mutable working directory',
  )
  const acceptedBytes = await readFile(acceptedManifestPath)
  const accepted = JSON.parse(acceptedBytes)
  await mkdir(destination, { recursive: false })
  const manifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    targetCatalogSha256,
    targetCatalog,
    nativeDeviceAcceptance: false,
    latestTwoVersionsAccepted: false,
    validationScope:
      'Previously quality-accepted release candidate artifact; subsequent unbuilt working-directory changes are excluded.',
    acceptedQualityManifestSha256: digest(acceptedBytes),
    acceptedQualityGeneratedAt: accepted.generatedAt,
    libraries: {},
  }
  await writeFile(resolve(destination, 'accepted-quality-manifest.json'), acceptedBytes)
  await mkdir(resolve(destination, 'reports/evidence'), { recursive: true })
  for (const library of ['cedar', 'maple']) {
    const root = roots[library] ?? resolve(workspace, library === 'cedar' ? 'cedar-design-web' : 'maple-design-mobile')
    const ui = resolve(root, `packages/ui`)
    const output = resolve(ui, library === 'cedar' ? 'dist' : 'site')
    const sourceBefore = sourceFingerprint(root, library),
      inputsBefore = productionFingerprint(root, library)
    const report = await createNativeReport(root, library)
    const provenance = accepted.repositories.find((row) => row.library === library)
    assert.ok(provenance && provenance.fullQualityExitCode === 0, 'A quality-accepted artifact is required')
    assert.equal(
      report.artifactSha256,
      provenance.publishedJsCssSha256,
      'Published artifact differs from the accepted release candidate',
    )
    assert.equal(
      digest(await readFile(resolve(output, 'index.html'))),
      provenance.buildIndexHash,
      'Documentation build differs from the accepted release candidate',
    )
    await copyProductionSnapshot(output, resolve(destination, library))
    assert.equal(sourceFingerprint(root, library), sourceBefore, 'Source changed while packaging')
    assert.equal(productionFingerprint(root, library), inputsBefore, 'Production inputs changed while packaging')
    await writeFile(
      resolve(destination, `reports/${library}-native-acceptance.json`),
      JSON.stringify(report, null, 2) + '\n',
    )
    const pages = componentPages(root, library)
    const checks = library === 'maple' ? mobileChecks : desktopChecks
    const checklist = acceptanceCases(library).map((id) => ({
      id,
      instruction: instructions[id],
      routes: checks[id].map((component) => {
        const page = pages.find((item) => item.component === component)
        assert.ok(page, `Missing handoff route ${library}/${component}`)
        return {
          component,
          url:
            library === 'maple' ? `/${library}/mobile.html#/${component}?language=zh-CN` : `/${library}${page.route}`,
        }
      }),
      expected: '实际交互正确、无异常/遮挡/值丢失；每项保留截图或视频，无法执行保持 pending。',
    }))
    manifest.libraries[library] = {
      artifactSha256: report.artifactSha256,
      sourceFingerprint: provenance.sourceFingerprint,
      productionFingerprint: provenance.productionFingerprint,
      testInventoryFingerprint: sourceBefore,
      testInventoryProductionFingerprint: inputsBefore,
      indexSha256: digest(await readFile(resolve(output, 'index.html'))),
      checklist,
    }
  }
  for (const file of ['index.html', 'probe.html', 'probe.js', 'serve.mjs', 'verify.mjs'])
    await copyFile(new URL(file, templates), resolve(destination, file))
  await writeFile(resolve(destination, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
  const readme = `# Cedar / Maple 原生兼容性验收交接包\n\n此包使用已通过完整 quality 的发布候选产物，随后尚未重建的工作区源码修改不在本包验收范围。manifest 的 sourceFingerprint/productionFingerprint 来自已验收产物的原始质量记录；testInventoryFingerprint 只标识本次冻结的浏览器测试输入，不表示产物由该源码副本构建。发布 JS/CSS、文档入口和版本目录均绑定哈希，所有原生结果保持 pending。\n\n## 启动\n\nNode 20+：\n\n\`\`\`sh\nnode verify.mjs\nnode serve.mjs --host 0.0.0.0 --port 4173\n\`\`\`\n\n手机与电脑接入同一测试网络，手动打开 http://电脑局域网IP:4173/ 。入口服务会同时启动 Cedar4174、Maple4175，使用独立根路径保留原始构建的绝对资源 URL，不重写产物。需要开放三个端口。仅用于受控测试网络，不要公开部署；服务器只提供包内文件。需要安全上下文的 API 应通过测试 HTTPS 入口验证。\n\n## 操作与证据\n\n1. 首页选择准确目标；Safari 27.1 仅适用于 iPhone Duo，不能用普通 iPhone 的 27.0 替代。Chrome 157 Early Stable 不计入正式稳定线。候选最低版本必须使用对应真实历史内核，不能只改 UA。\n2. 在同一浏览器/宿主内打开环境探针，导出原始 JSON；探针不会自动宣告真机通过。手机 UA、OS 版本、宿主版本和内核版本分别核对；模拟器和微信开发者工具仅为补充诊断。\n3. 按首页九项移动端检查逐项执行，包含真实软键盘、中文 IME、验证码提示、触摸、横竖屏、地址栏、四边安全区、上传与相机。微信 iOS/Android 和自有 App 双端分别测试，不假定微信 Android 恒为某种内核。案例链接在当前页面打开，避免离开待验收 WebView。\n4. 在 reports/evidence/目标ID/ 保存设备/浏览器/宿主/内核版本页截图、原始环境 JSON、操作视频和失败复现。填写 reports/*-native-acceptance.json：完整版本、物理设备、测试人、时间、capabilities 和各项 cases；environmentEvidence 指向原始探针 JSON，加入 evidence 列表。原始 JSON 的 targetId、产物和目录哈希必须匹配；capabilities 从 features 原样记录，设备、OS、浏览器完整版本和宿主版本须与原始探针元数据一致；移动端原始探针也须由操作员确认物理设备。证据不足保持 pending/failed，不采集真实短信、照片或文件内容。\n5. 填写 evidence 相对路径后，在原工作区执行哈希封装（不改通过状态）：\n\n\`\`\`sh\nnode design-ui/browser/native-handoff.mjs --seal /绝对路径/reports/maple-native-acceptance.json\n\`\`\`\n\n回到各仓库验证（Cedar 同理）：\n\n\`\`\`sh\nnode ../design-ui/browser/native-acceptance.mjs maple --report /绝对路径/reports/maple-native-acceptance.json\n\`\`\`\n\n报告通过严格校验后，将 reports 中对应报告重命名为 native-acceptance.json，并与 evidence 目录一并交回各仓库的 artifacts/compatibility/，再执行仓库默认 compatibility:release 检查；未通过的报告不得晋升。原始交接包的 files.sha256.json 用于核对交付文件，操作员新增证据和编辑报告后应另行保存新校验清单，保留原始包。\n\n重建改变发布 JS/CSS 后需重新核对或验收。版本目录超过30天或官方版本更新时应重新锁定，不能沿用 latest 标签。桌面 Chrome/CfT 手机模拟不替代 Android Chrome，桌面 Safari/WebKit 不替代 iOS Safari。\n\n## 版本来源\n\n准确发布版本、补丁下限、设备限制及官方链接在 manifest.json 的 targetCatalog；额外建议覆盖 iOS26.7.2 上一主版本设备，Safari 版本需从设备实际记录。\n`
  await writeFile(resolve(destination, 'README.md'), readme)
  const hashes = []
  for (const file of await filesUnder(destination))
    hashes.push({ path: relative(destination, file), sha256: digest(await readFile(file)) })
  await writeFile(resolve(destination, 'files.sha256.json'), JSON.stringify(hashes, null, 2) + '\n')
  return { destination, files: hashes.length, nativeDeviceAcceptance: false, targetCatalogSha256 }
}
if (process.argv[1] && import.meta.url === pathToFileURL(await realpath(resolve(process.argv[1]))).href) {
  const [argument, value, catalogPath] = process.argv.slice(2)
  if (argument === '--seal') console.log(JSON.stringify(await sealReport(value)))
  else {
    assert.ok(
      argument && value === '--accepted-manifest' && catalogPath,
      'Usage: native-handoff.mjs output-directory --accepted-manifest quality-manifest.json | --seal report.json',
    )
    console.log(JSON.stringify(await createHandoff(argument, {}, catalogPath)))
  }
}
