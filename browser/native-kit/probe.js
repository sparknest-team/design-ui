(async function () {
  'use strict'
  var manifest
  var state = document.getElementById('state')
  try {
    var response = await fetch('manifest.json', { cache: 'no-store' })
    if (!response.ok) throw new Error('manifest request failed')
    manifest = await response.json()
  } catch (error) { state.textContent = '无法绑定验收产物：' + error.message; return }
  var catalog = manifest.targetCatalog
  state.textContent = '本包质量基线时间：' + manifest.acceptedQualityGeneratedAt + '；不包含其后尚未重建的源码修改。版本目录核对时间：' + catalog.checkedAt + '。所有原生目标待验收。'
  function node(tag, text, parent) { var item = document.createElement(tag); if (text) item.textContent = text; if (parent) parent.appendChild(item); return item }
  if (document.body.dataset.page === 'index') {
    var serverResponse = await fetch('server.json', { cache: 'no-store' })
    if (!serverResponse.ok) throw new Error('请用附带的 serve.mjs 启动三个独立服务，保留原始产物的根路径')
    var ports = await serverResponse.json()
    var root = document.getElementById('targets')
    for (var library of ['maple', 'cedar']) {
      var section = node('section', '', root)
      node('h2', library === 'maple' ? 'Maple：移动端优先' : 'Cedar：桌面浏览器', section)
      for (var entry of Object.entries(catalog[library])) {
        var id = entry[0], target = entry[1], article = node('article', '', section)
        node('h3', id + ' · ' + (target.releaseLine || '实际宿主/内核单独记录'), article)
        node('p', '平台：' + target.platform + '；最低补丁记录：' + (target.minimumVerifiedVersion || '现场核验') + (target.candidateMinimum ? '（候选最低版本）' : ''), article)
        if (target.deviceRequirement) node('p', target.deviceRequirement, article)
        var link = node('a', '打开此目标的环境采集页', article); link.href = '/probe.html?library=' + library + '&target=' + encodeURIComponent(id)
        if (target.versionSource) { var source = node('a', ' 官方版本来源', article); source.href = target.versionSource; source.rel = 'noreferrer'; source.target = '_blank' }
      }
      node('h3', '逐项验收清单', section)
      for (var check of manifest.libraries[library].checklist) {
        var block = node('article', '', section)
        node('h4', check.id, block); node('p', check.instruction, block)
        var links = node('div', '', block); links.className = 'links'
        for (var route of check.routes) { var anchor = node('a', route.component, links); anchor.href = location.protocol + '//' + location.hostname + ':' + ports[library] + route.url.slice(library.length + 1) }
        node('small', check.expected, block)
      }
    }
    return
  }
  var select = document.getElementById('target'), query = new URLSearchParams(location.search)
  for (var lib of ['maple', 'cedar']) for (var key of Object.keys(catalog[lib])) { var option = node('option', lib + ' / ' + key, select); option.value = lib + ':' + key }
  if (query.get('library') && query.get('target')) select.value = query.get('library') + ':' + query.get('target')
  var eventLog = [], files = [], latest
  function event(type, data) { eventLog.push(Object.assign({ type: type, timeMs: Math.round(performance.now()) }, data)); if (eventLog.length > 100) eventLog.shift(); document.getElementById('events').textContent = '已记录 ' + eventLog.length + ' 个事件；末项：' + type }
  for (var name of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'touchstart', 'touchmove', 'touchend', 'touchcancel', 'contextmenu']) document.getElementById('gesture').addEventListener(name, function (e) { event(e.type, { trusted: e.isTrusted, pointerType: e.pointerType || null, touches: e.touches ? e.touches.length : null }) }, { passive: true })
  for (var inputId of ['ime', 'otp', 'text']) for (var type of ['compositionstart', 'compositionend', 'input', 'focus', 'blur']) document.getElementById(inputId).addEventListener(type, function (e) { event(e.type, { field: e.target.id, valueLength: e.target.value.length, inputType: e.inputType || null, trusted: e.isTrusted }) })
  for (var fileId of ['file', 'camera']) document.getElementById(fileId).addEventListener('change', function (e) { files.push({ field: e.target.id, files: Array.from(e.target.files || []).map(function (file) { return { type: file.type, bytes: file.size } }) }) })
  document.getElementById('clear-files').onclick = function () { document.getElementById('file').value = ''; document.getElementById('camera').value = ''; files = [] }
  var viewportEvents = []
  function viewportEvent() { viewportEvents.push({ at: Date.now(), width: innerWidth, height: innerHeight, visualHeight: window.visualViewport ? visualViewport.height : null }); if (viewportEvents.length > 50) viewportEvents.shift() }
  window.addEventListener('resize', viewportEvent)
  if (window.visualViewport) visualViewport.addEventListener('resize', viewportEvent)
  async function collect() {
    var parts = select.value.split(':'), library = parts[0], id = parts[1]
    if (!manifest.libraries[library] || !catalog[library][id]) throw new Error('请选择目录中的目标')
    var insets = getComputedStyle(document.getElementById('insets'))
    latest = { schemaVersion: 1, evidenceType: 'environment-probe', status: 'pending', nativeDeviceAcceptance: false,
      collectedAt: new Date().toISOString(), library: library, targetId: id, artifactSha256: manifest.libraries[library].artifactSha256, targetCatalogSha256: manifest.targetCatalogSha256,
      userAgent: navigator.userAgent, navigatorPlatform: navigator.platform, maxTouchPoints: navigator.maxTouchPoints || 0,
      secureContext: window.isSecureContext, claimedMetadata: { osVersion: document.getElementById('os').value, device: document.getElementById('device').value, browserVersion: document.getElementById('browser').value, hostVersion: document.getElementById('host').value, engine: document.getElementById('engine').value, physicalDeviceAttestation: document.getElementById('physical').checked },
      features: { colorMix: CSS.supports('color', 'color-mix(in srgb, red 50%, blue)'), has: CSS.supports('selector(:has(*))'), dvh: CSS.supports('height', '100dvh'), resizeObserver: typeof ResizeObserver === 'function', intersectionObserver: typeof IntersectionObserver === 'function', visualViewport: !!window.visualViewport },
      viewport: { width: innerWidth, height: innerHeight, dvhHeight: document.getElementById('dvh').getBoundingClientRect().height, visual: window.visualViewport ? { width: visualViewport.width, height: visualViewport.height, scale: visualViewport.scale, offsetTop: visualViewport.offsetTop } : null, safeArea: { top: insets.paddingTop, right: insets.paddingRight, bottom: insets.paddingBottom, left: insets.paddingLeft } },
      events: eventLog.slice(), viewportEvents: viewportEvents.slice(), files: files.slice(), cases: Object.fromEntries(manifest.libraries[library].checklist.map(function (check) { return [check.id, 'pending'] })) }
    if (navigator.userAgentData) { try { latest.userAgentData = await navigator.userAgentData.getHighEntropyValues(['fullVersionList', 'platformVersion']) } catch (e) { latest.userAgentDataError = e.name } }
    document.getElementById('output').textContent = JSON.stringify(latest, null, 2)
    return latest
  }
  document.getElementById('collect').onclick = function () { collect().catch(function (e) { state.textContent = e.message }) }
  document.getElementById('download').onclick = async function () { var value = await collect(); var url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' })); var link = node('a'); link.href = url; link.download = value.targetId + '-environment.json'; link.click(); setTimeout(function () { URL.revokeObjectURL(url) }, 1000) }
  document.getElementById('copy').onclick = async function () { var value = JSON.stringify(await collect(), null, 2); try { await navigator.clipboard.writeText(value); state.textContent = '环境 JSON 已复制，验收状态仍为 pending。' } catch (e) { state.textContent = '当前宿主不允许复制；请从下方 JSON 手动复制或通过远程调试导出。' } }
  await collect()
}()).catch(function (error) { document.getElementById('state').textContent = '采集失败：' + error.message })
