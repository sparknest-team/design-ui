import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const themes = ['default/light', 'default/dark', 'maple/light', 'maple/dark']
const platforms = [
  ['Cedar', 'c'],
  ['Maple', 'mp'],
]
const modes = ['body', 'host', 'inline']
const savedImages = JSON.parse(
  readFileSync(new URL('../audits/evidence/portal-2026-10-13/screenshots.json', import.meta.url)),
)
const canonical = (value) => value.replace(/\s/g, '')
const keyOf = (row) => `${row.prefix}-${row.theme.replace('/', '-')}-${row.mode}-${row.long ? 'long' : 'normal'}`
const ownerOf = (prefix, mode) => (mode === 'body' ? 'body' : `${prefix}-${mode === 'host' ? 'host' : 'caller'}`)

function validateSurface(row, prefix, theme, mode, historicalFocusLoss = false) {
  const label = `${prefix}/${theme}/${mode}`
  assert.equal(row.selectedTheme, theme, `${label}: actual theme`)
  assert.equal(row.selectedMode, mode, `${label}: actual mode`)
  assert.equal(row.owner, ownerOf(prefix, mode), `${label}: stale DOM owner`)
  const dark = theme.endsWith('/dark')
  const colors =
    mode === 'host'
      ? ['rgb(24,34,48)', 'rgb(248,249,252)']
      : mode === 'inline'
        ? ['rgb(238,242,255)', 'rgb(24,34,48)']
        : dark
          ? ['rgb(42,42,43)', 'rgba(255,255,255,0.9)']
          : ['rgb(255,255,255)', 'rgb(29,33,41)']
  assert.equal(canonical(row.background), colors[0], `${label}: background`)
  assert.equal(canonical(row.foreground), colors[1], `${label}: foreground`)
  if (historicalFocusLoss) assert.equal(typeof row.focusInside, 'boolean', `${label}: recorded focus state`)
  else assert.equal(row.focusInside, true, `${label}: focus outside panel`)
  assert.equal(row.pageOverflow, false, `${label}: document overflow`)
  assert.equal(row.opacity, '1', `${label}: animation not settled`)
  assert.equal(row.bodyOverflow, mode === 'host' ? '' : 'hidden', `${label}: body lock`)
  assert.deepEqual(
    row.hostOverflows,
    mode === 'host' ? (prefix === 'c' ? ['hidden', ''] : ['', 'hidden']) : ['', ''],
    `${label}: host locks`,
  )
  for (const side of ['left', 'top', 'right', 'bottom', 'width', 'height']) {
    assert.ok(Number.isFinite(row.rect[side]), `${label}: finite ${side}`)
  }
  assert.ok(row.rect.width > 0 && row.rect.height > 0, `${label}: visible panel`)
  assert.ok(row.rect.left >= -0.5 && row.rect.top >= -0.5, `${label}: clipped start edge`)
  assert.ok(
    row.rect.right <= row.viewport[0] + 0.5 && row.rect.bottom <= row.viewport[1] + 0.5,
    `${label}: clipped end edge`,
  )
}

function validateClosed(row) {
  assert.deepEqual(row.errors, [], `${row.key}: recorded errors`)
  assert.equal(row.closeState.active, `${row.name} open themed modal`, `${row.key}: return focus`)
  assert.equal(row.closeState.bodyOverflow, '', `${row.key}: leaked body lock`)
  assert.deepEqual(row.closeState.hosts, ['', ''], `${row.key}: leaked host locks`)
}

export function validatePortalEvidence(record, imageDimensions) {
  // Screenshot exports can differ from CSS viewport dimensions. Preserve and
  // validate observed file dimensions, not an assumed 1:1 viewport/pixel mapping.
  const image = (name) => {
    const expected = savedImages.find((item) => item.name === name)
    assert.ok(expected, `missing image manifest: ${name}`)
    assert.deepEqual(imageDimensions(name), expected.dimensions, `${name}: saved dimensions`)
  }
  assert.equal(record.browser, 'Codex In-app Browser (Chromium)', 'historical browser identity')
  assert.deepEqual(record.viewport, [1280, 720])
  assert.equal(record.cases.length, 48, 'desktop count')
  assert.equal(new Set(record.cases.map((row) => row.key)).size, 48, 'duplicate desktop group')
  for (const [name, prefix] of platforms)
    for (const theme of themes)
      for (const mode of modes)
        for (const long of [false, true]) {
          const key = keyOf({ prefix, theme, mode, long })
          const row = record.cases.find((item) => item.key === key)
          assert.ok(row, `missing ${key}`)
          assert.equal(row.name, name)
          assert.equal(row.prefix, prefix)
          assert.equal(row.theme, theme)
          assert.equal(row.mode, mode)
          assert.equal(row.long, long)
          assert.deepEqual(row.viewport, [1280, 720])
          validateSurface(row, prefix, theme, mode)
          validateClosed(row)
          image(`${key}.jpg`)
        }
  assert.equal(record.narrow.length, 12, 'narrow count')
  const narrowKeys = new Set()
  for (const [name, prefix] of platforms)
    for (const width of [320, 390])
      for (const mode of modes) {
        const row = record.narrow.find((item) => item.name === name && item.width === width && item.mode === mode)
        assert.ok(row, `missing narrow ${name}/${width}/${mode}`)
        const key = keyOf({ prefix, theme: 'default/dark', mode, long: true })
        assert.equal(row.key, key)
        assert.equal(row.long, true)
        assert.deepEqual(row.viewport, [width, 640])
        narrowKeys.add(`${width}/${key}`)
        validateSurface(row, prefix, 'default/dark', mode)
        validateClosed(row)
        image(`narrow-${width}-${key}.jpg`)
      }
  assert.equal(narrowKeys.size, 12)
  assert.equal(record.live.length, 10, 'live switch count')
  assert.deepEqual(
    record.knownIssues,
    [{ id: 'same-document-relocation-focus', failedSamples: 8, followup: '../portal-focus-2026-10-13/status.json' }],
    'historical focus failures must remain disclosed',
  )
  for (const [name, prefix] of platforms) {
    const rows = record.live.filter((row) => row.name === name)
    assert.deepEqual(
      rows.map((row) => row.mode),
      ['host', 'inline', 'body', 'host', 'body'],
    )
    // Preserve the measured pre-fix loss, never silently rewrite it into a pass.
    assert.deepEqual(
      rows.map((row) => row.focusInside),
      [true, false, false, false, false],
      `${name}: historical focus failures`,
    )
    for (const row of rows) validateSurface(row, prefix, 'default/dark', row.mode, true)
    image(`keyboard-320-${prefix}.jpg`)
    const neighbor = record.neighbors.find((row) => row.name === name)
    assert.ok(neighbor, `missing ${name} neighbor`)
    assert.equal(neighbor.pass, true)
    assert.deepEqual(neighbor.before, neighbor.during, `${name}: neighbor changed while open`)
    assert.deepEqual(neighbor.before, neighbor.after, `${name}: neighbor changed after close`)
  }
  assert.equal(record.neighbors.length, 2)
  for (const theme of themes) image(`contact-${theme.replace('/', '-')}.png`)
  for (const exclusion of ['200% native browser zoom', 'Safari/Firefox'])
    assert.ok(record.excluded.includes(exclusion), `missing scope exclusion: ${exclusion}`)
}

export function validateEnvironmentSnapshot(record) {
  assert.equal(record.newAcceptedCases, 0, 'environment checks are not accepted browser cases')
  assert.equal(record.casesPerSuite, 48)
  assert.equal(record.matrix.length, 48)
  const keys = new Set(record.matrix.map((row) => `${row.platform}/${row.theme}/${row.target}/${row.content}`))
  assert.equal(keys.size, 48, 'duplicate planned group')
  for (const name of ['Cedar Drawer', 'Maple Popup'])
    for (const theme of themes)
      for (const mode of modes)
        for (const content of ['normal', 'long']) {
          assert.ok(keys.has(`${name}/${theme}/${mode}/${content}`), 'missing planned combination')
        }
  assert.deepEqual(
    record.suites.map((row) => [row.id, row.browser, row.zoomPercent]),
    [
      ['native-zoom-200', 'Chrome', 200],
      ['safari-100', 'Safari', 100],
      ['firefox-100', 'Firefox', 100],
    ],
  )
  for (const suite of record.suites) {
    assert.equal(suite.status, 'blocked', 'historical blocked suite cannot silently become a pass')
    assert.ok(typeof suite.reason === 'string' && suite.reason.trim(), 'blocked reason required')
  }
}

export function validateFocusFollowup(record, status, imageDimensions) {
  assert.equal(record.browser, 'Codex In-app Browser (Chromium)')
  assert.equal(record.nativeZoomVerified, false, 'narrow viewport is not native zoom')
  assert.equal(record.theme, 'default/dark')
  assert.equal(record.content, 'long')
  assert.equal(record.settleMs, 400)
  assert.equal(status.historicalFailedSamples, 8, 'preserve historical failures')
  assert.equal(status.nativeAfter.status, 'passed')
  assert.equal(status.nativeAfter.acceptedCases, 10)
  assert.equal(status.nativeAfter.evidence, 'after.json')
  assert.equal(status.before.length, 2)
  assert.deepEqual(
    status.before.map((row) => row.platform),
    ['Cedar Drawer', 'Maple Popup'],
  )
  for (const row of status.before) {
    assert.equal(row.focusInside, false, 'preserve native pre-fix focus loss')
    assert.equal(row.activeElement, 'BODY')
    assert.equal(row.from, 'host')
    assert.equal(row.to, 'inline')
    imageDimensions(row.screenshot)
  }
  assert.equal(record.cases.length, 10)
  assert.equal(new Set(record.cases.map((row) => row.screenshot)).size, 10)
  for (const [name, prefix] of platforms) {
    const platform = `${name} ${prefix === 'c' ? 'Drawer' : 'Popup'}`
    const rows = record.cases.filter((row) => row.platform === platform)
    assert.deepEqual(
      rows.map((row) => [row.step, row.mode]),
      ['host', 'inline', 'body', 'host', 'body'].map((mode, step) => [step, mode]),
    )
    for (const row of rows) {
      assert.equal(row.focusInside, true, `${platform}/${row.step}: escaped focus`)
      assert.equal(row.owner, row.mode === 'body' ? null : ownerOf(prefix, row.mode))
      assert.equal(row.bodyOverflow, row.mode === 'host' ? '' : 'hidden')
      assert.deepEqual(row.viewport, { height: 640, width: 320 })
      assert.ok(row.rect.left >= 0 && row.rect.width > 0 && row.rect.left + row.rect.width <= 320.5)
      assert.match(row.screenshot, /^[a-z0-9-]+\.jpg$/)
      const dimensions = imageDimensions(row.screenshot)
      assert.ok(dimensions[0] > 0 && dimensions[1] > 0)
    }
    const keyboard = record.keyboard.find((row) => row.platform === platform)
    assert.ok(keyboard, `${platform}: missing keyboard proof`)
    assert.equal(keyboard.forward.inside, true)
    assert.equal(keyboard.backward.inside, true)
    assert.equal(keyboard.close.restored, true)
    assert.equal(keyboard.close.bodyOverflow, '')
  }
  assert.equal(record.keyboard.length, 2)
}

export function validateScreenshotManifest(manifest, expectedNames, readImage, dimensions) {
  assert.equal(manifest.length, expectedNames.length, 'image manifest count')
  assert.deepEqual(
    manifest.map((row) => row.name).sort(),
    [...expectedNames].sort(),
    'manifest must cover exact evidence files',
  )
  assert.equal(new Set(manifest.map((row) => row.name)).size, manifest.length, 'duplicate image name')
  for (const row of manifest) {
    assert.match(row.name, /^[a-z0-9-]+\.(jpg|png)$/, 'safe evidence filename')
    assert.match(row.sha256, /^[a-f0-9]{64}$/, 'SHA-256 required')
    assert.equal(
      createHash('sha256').update(readImage(row.name)).digest('hex'),
      row.sha256,
      `${row.name}: image bytes changed`,
    )
    assert.deepEqual(dimensions(row.name), row.dimensions, `${row.name}: encoded dimensions changed`)
  }
}

export function validateBlockedRecheck(record) {
  assert.equal(record.historicalSnapshot, 'status.json')
  assert.equal(record.newAcceptedCases, 0, 'connection recheck is not browser acceptance')
  assert.ok(Number.isFinite(Date.parse(record.checkedAt)), 'recheck timestamp required')
  assert.deepEqual(
    record.suites.map((row) => row.id),
    ['native-zoom-200', 'safari-100', 'firefox-100'],
  )
  for (const row of record.suites) {
    assert.equal(row.status, 'blocked', 'preserve this blocked observation; save recovery separately')
    assert.equal(row.remainingCases, 48)
    assert.ok(typeof row.recovery === 'string' && row.recovery.trim(), 'recovery condition required')
  }
}

export function validateIframeEvidence(record) {
  assert.equal(record.browser, 'Codex In-app Browser (Chromium)')
  assert.equal(record.status, 'passed')
  assert.equal(record.acceptedCases, 8)
  assert.equal(record.nativeZoomVerified, false)
  assert.equal(record.cases.length, 8)
  assert.equal(new Set(record.cases.map((row) => `${row.platform}/${row.scenario}`)).size, 8)
  assert.equal(record.before.length, 2)
  for (const row of record.before) {
    assert.equal(row.restored, false, 'preserve pre-fix opener failure')
    assert.equal(row.parentActive, 'IFRAME')
  }
  const scenarios = ['frame-open-close', 'top-to-frame', 'frame-to-top', 'reopen-after-move']
  const panel = (row) => {
    const frame = row.target === 'frame'
    assert.equal(row.owner, row.target)
    assert.ok(row.documentUrl.endsWith(frame ? '/iframe-target.html' : '/iframe.html'), 'actual target document')
    assert.equal(row.focusInside, true)
    assert.equal(row.opacity, '1')
    assert.equal(canonical(row.background), frame ? 'rgb(42,42,43)' : 'rgb(255,255,255)')
    assert.equal(canonical(row.foreground), frame ? 'rgba(255,255,255,0.9)' : 'rgb(29,33,41)')
    assert.equal(row.documents.top.theme, null)
    assert.equal(row.documents.frame.theme, 'dark')
    assert.equal(row.documents.top.hostOverflow, frame ? '' : 'hidden')
    assert.equal(row.documents.frame.hostOverflow, frame ? 'hidden' : '')
    for (const doc of [row.documents.top, row.documents.frame]) {
      assert.equal(doc.bodyOverflow, '')
      assert.ok(doc.styles > 0, 'each document loads its own styles')
    }
    if (frame) assert.equal(row.documents.top.active, 'IFRAME', 'parent focus chain')
    for (const field of ['left', 'right', 'top', 'bottom', 'width', 'height'])
      assert.ok(Number.isFinite(row.rect[field]))
    assert.ok(row.rect.width > 0 && row.rect.height > 0)
    assert.ok(row.rect.left >= -0.5 && row.rect.top >= -0.5, 'clipped panel start')
    assert.ok(
      row.rect.right <= row.viewport.width + 0.5 && row.rect.bottom <= row.viewport.height + 0.5,
      'clipped panel end',
    )
  }
  const closed = (row, name) => {
    assert.equal(row.restored, true)
    assert.equal(row.state.open, false)
    assert.equal(row.documents.top.activeText, `${name} open iframe modal`)
    for (const doc of [row.documents.top, row.documents.frame]) {
      assert.equal(doc.bodyOverflow, '')
      assert.equal(doc.hostOverflow, '')
    }
  }
  for (const name of ['Cedar', 'Maple'])
    for (const scenario of scenarios) {
      const row = record.cases.find((row) => row.platform === name && row.scenario === scenario)
      assert.ok(row, `missing ${name}/${scenario}`)
      const targets =
        scenario === 'frame-open-close' ? ['frame'] : scenario === 'frame-to-top' ? ['frame', 'top'] : ['top', 'frame']
      assert.deepEqual(
        row.steps.map((step) => step.target),
        targets,
      )
      for (const step of [...row.steps, row.forward, row.backward]) panel(step)
      assert.equal(row.forward.activeText, name === 'Cedar' ? '' : `${name} move to top`)
      assert.equal(row.backward.activeText, `${name} close iframe modal`)
      closed(row.closed, name)
      assert.equal(row.screenshot, `${name.toLowerCase()}-${scenario}.jpg`)
      if (scenario === 'reopen-after-move') {
        panel(row.reopened)
        closed(row.reclosed, name)
      }
    }
  assert.equal(record.ownership.length, 2)
  for (const name of ['Cedar', 'Maple']) {
    const row = record.ownership.find((row) => row.platform === name)
    assert.ok(row)
    assert.equal(row.otherDocState.open, true, 'other document must not close the modal')
    assert.equal(row.closedState.open, false)
    assert.equal(row.restored, true)
    assert.equal(row.closedState.escapeCount, row.otherDocState.escapeCount + 1)
    assert.deepEqual(row.inactiveState, row.closedState, 'closed modal must not react again')
  }
  assert.ok(record.excluded.includes('Safari/Firefox'))
  assert.ok(record.excluded.includes('cross-origin iframe'))
}

export function validateDocumentThemeEvidence(record) {
  for (const [target, primary, scheme, page] of [
    ['top', '0,190,190', 'light', '/iframe.html'],
    ['frame', '251,146,60', 'dark', '/iframe-target.html'],
  ]) {
    assert.ok(record[target].url.endsWith(page))
    for (const prefix of ['cedar', 'maple']) {
      assert.equal(canonical(record[target][`${prefix}Primary`]), primary, 'actual document brand palette')
      assert.equal(record[target][`${prefix}Scheme`], scheme, 'actual document scheme')
    }
  }
}

export function validateNestedEvidence(record) {
  assert.equal(record.browser, 'IAB Chromium')
  assert.equal(record.nativeZoomVerified, false)
  assert.ok(record.fixture.endsWith('/nested.html'))
  assert.ok(Number.isFinite(Date.parse(record.capturedAt)))
  assert.equal(record.cases.length, 8)
  assert.equal(new Set(record.cases.map((row) => row.platform + '/' + row.theme)).size, 8)
  const palettes = {
    'default/light': '0,190,190',
    'default/dark': '41,203,197',
    'maple/light': '194,65,12',
    'maple/dark': '251,146,60',
  }
  for (const name of ['Cedar', 'Maple'])
    for (const theme of Object.keys(palettes)) {
      const row = record.cases.find((row) => row.platform === name && row.theme === theme)
      assert.ok(row, 'missing nested combination')
      const steps = row.steps,
        prefix = name === 'Cedar' ? 'c' : 'mp'
      assert.equal(steps.baseline.bodyOverflow, '')
      assert.equal(steps.baseline.bodyPadding, '')
      const expected = {
        baseline: [false, false],
        parentOpen: [true, false],
        bothOpen: [true, true],
        tabWrap: [true, true],
        shiftWrap: [true, true],
        childClosed: [true, false],
        childFirstFinished: [false, false],
        parentReopen: [true, false],
        childReopen: [true, true],
        parentClosed: [false, true],
        survivorTab: [false, true],
        survivorShift: [false, true],
        parentFirstFinished: [false, false],
        closedEscape: [false, false],
        singleReopen: [true, false],
        parentTab: [true, false],
        parentShift: [true, false],
        parentEscapeFinished: [false, false],
      }
      assert.deepEqual(Object.keys(steps).sort(), Object.keys(expected).sort(), 'exact native lifecycle steps')
      for (const [label, [parent, child]] of Object.entries(expected)) {
        const step = steps[label]
        assert.equal(step.state.platform, name)
        assert.equal(step.state.theme, theme)
        assert.equal(step.state.parent, parent, label + ': parent state')
        assert.equal(step.state.child, child, label + ': child state')
        for (const value of Object.values(step.primary))
          assert.equal(canonical(value), palettes[theme], 'actual root palette')
        const open = parent || child
        assert.equal(step.bodyOverflow, open ? 'hidden' : steps.baseline.bodyOverflow, 'reference-counted body lock')
        assert.equal(
          step.bodyPadding,
          open ? steps.parentOpen.bodyPadding : steps.baseline.bodyPadding,
          'reserve scrollbar once',
        )
        assert.equal(step.dialogs.length, 2)
        for (const kind of ['parent', 'child']) {
          const panel = step.dialogs.find((el) => el.name === name + ' nested ' + kind)
          assert.ok(panel)
          assert.equal(panel.visible, kind === 'parent' ? parent : child, 'actual visibility')
          if (!panel.visible) continue
          assert.equal(panel.opacity, '1')
          assert.equal(canonical(panel.background), theme.endsWith('/dark') ? 'rgb(42,42,43)' : 'rgb(255,255,255)')
          assert.equal(canonical(panel.color), theme.endsWith('/dark') ? 'rgba(255,255,255,0.9)' : 'rgb(29,33,41)')
          assert.ok(
            panel.rect.left >= 0 &&
              panel.rect.top >= 0 &&
              panel.rect.right <= step.viewport.width &&
              panel.rect.bottom <= step.viewport.height,
            'settled panel bounds',
          )
          assert.ok(panel.rect.right > panel.rect.left && panel.rect.bottom > panel.rect.top)
        }
        assert.equal(
          step.focusDialog,
          open ? name + ' nested ' + (child ? 'child' : 'parent') : null,
          'top focus containment',
        )
        if (open)
          assert.equal(
            step.neighborHit,
            prefix + (name === 'Cedar' ? '-drawer-overlay' : '-popup__overlay'),
            'background pointer suppression',
          )
      }
      for (const label of ['bothOpen', 'childReopen', 'tabWrap', 'shiftWrap']) {
        const [parent, child] = steps[label].dialogs
        const z = (panel) => Number(name === 'Cedar' ? panel.z : panel.panelZ)
        assert.ok(z(child) > z(parent), 'actual child stacking')
        assert.equal(child.centerHit, name + ' nested child', 'child is pointer-top')
      }
      for (const label of ['tabWrap', 'survivorTab']) assert.equal(steps[label].focus, name + ' nested child first')
      for (const label of ['shiftWrap', 'survivorShift']) assert.equal(steps[label].focus, name + ' nested child last')
      assert.equal(steps.parentTab.focus, name + ' open nested child')
      assert.equal(steps.parentShift.focus, name + ' close nested parent', 'skip disabled and hidden controls')
      assert.equal(steps.childClosed.focus, name + ' open nested child', 'child-first parent trigger')
      for (const label of ['childFirstFinished', 'parentFirstFinished', 'closedEscape', 'parentEscapeFinished'])
        assert.equal(steps[label].focus, name + ' open nested parent', 'original page trigger')
      assert.equal(steps.childClosed.state.childEscapes, steps.bothOpen.state.childEscapes + 1)
      assert.equal(
        steps.childClosed.state.parentEscapes,
        steps.bothOpen.state.parentEscapes,
        'one Escape only closes top',
      )
      assert.equal(steps.parentFirstFinished.state.childEscapes, steps.parentClosed.state.childEscapes + 1)
      assert.equal(steps.parentFirstFinished.state.parentEscapes, steps.parentClosed.state.parentEscapes)
      assert.deepEqual(steps.closedEscape.state, steps.parentFirstFinished.state, 'closed listener must not react')
      assert.equal(steps.parentEscapeFinished.state.parentEscapes, steps.singleReopen.state.parentEscapes + 1)
      assert.equal(steps.parentEscapeFinished.state.childEscapes, steps.singleReopen.state.childEscapes)
      const file = name.toLowerCase() + '-' + theme.replace('/', '-')
      assert.equal(row.screenshot, file + '.jpg')
      assert.equal(row.closedScreenshot, file + '-closed.jpg')
    }
  assert.equal(record.before.length, 2)
  for (const name of ['Cedar', 'Maple']) {
    const before = record.before.find((row) => row.platform === name)
    assert.ok(before)
    assert.equal(before.restored, false, 'preserve pre-fix native failure')
    assert.notEqual(before.snapshot.focus, name + ' open nested parent')
    assert.equal(before.snapshot.state.parent, false)
    assert.equal(before.snapshot.state.child, false)
    assert.equal(before.screenshot, name.toLowerCase() + '-before.jpg')
  }
  for (const scope of [
    'Chrome native 200%',
    'Safari/Firefox',
    'screen readers',
    'cross-library nested modal coordination',
    'unmountOnClose parent-first removal',
  ])
    assert.ok(record.excluded.includes(scope))
}

export function screenshotDimensions(file) {
  const data = readFileSync(file)
  const extension = new URL(file).pathname.split('.').at(-1)
  if (data.length > 24 && data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    assert.equal(extension, 'png', 'PNG extension')
    assert.equal(data.toString('ascii', 12, 16), 'IHDR', `missing PNG header: ${file}`)
    return [data.readUInt32BE(16), data.readUInt32BE(20)]
  }
  assert.ok(data.length > 4 && data[0] === 255 && data[1] === 216, `not a supported screenshot: ${file}`)
  assert.equal(extension, 'jpg', 'JPEG extension')
  for (let offset = 2; offset + 4 < data.length;) {
    assert.equal(data[offset++], 255, 'JPEG marker prefix')
    while (data[offset] === 255) offset++
    const marker = data[offset++]
    if (marker === 217 || marker === 218) break
    const length = data.readUInt16BE(offset)
    assert.ok(length >= 2 && offset + length <= data.length, 'JPEG segment bounds')
    if ([192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207].includes(marker)) {
      assert.ok(length >= 8, 'JPEG frame length')
      return [data.readUInt16BE(offset + 5), data.readUInt16BE(offset + 3)]
    }
    offset += length
  }
  assert.fail(`missing JPEG dimensions: ${file}`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const portal = new URL('../audits/evidence/portal-2026-10-13/', import.meta.url)
  assert.equal(savedImages.length, 66, 'image manifest count')
  assert.equal(new Set(savedImages.map((item) => item.name)).size, 66, 'duplicate image manifest name')
  for (const entry of savedImages) {
    assert.match(entry.name, /^[a-z0-9-]+\.(jpg|png)$/, 'safe image filename')
    assert.equal(
      createHash('sha256')
        .update(readFileSync(new URL(entry.name, portal)))
        .digest('hex'),
      entry.sha256,
      `${entry.name}: image bytes changed`,
    )
  }
  validatePortalEvidence(JSON.parse(readFileSync(new URL('results.json', portal))), (name) =>
    screenshotDimensions(new URL(name, portal)),
  )
  validateEnvironmentSnapshot(
    JSON.parse(readFileSync(new URL('../audits/evidence/browser-environment-2026-10-13/status.json', import.meta.url))),
  )
  const focus = new URL('../audits/evidence/portal-focus-2026-10-13/', import.meta.url)
  const after = JSON.parse(readFileSync(new URL('after.json', focus)))
  const focusStatus = JSON.parse(readFileSync(new URL('status.json', focus)))
  validateFocusFollowup(after, focusStatus, (name) => screenshotDimensions(new URL(name, focus)))
  validateScreenshotManifest(
    JSON.parse(readFileSync(new URL('screenshots.json', focus))),
    [...focusStatus.before, ...after.cases].map((row) => row.screenshot),
    (name) => readFileSync(new URL(name, focus)),
    (name) => screenshotDimensions(new URL(name, focus)),
  )
  validateBlockedRecheck(
    JSON.parse(
      readFileSync(new URL('../audits/evidence/browser-environment-2026-10-13/recheck-1412.json', import.meta.url)),
    ),
  )
  const iframe = new URL('../audits/evidence/iframe-2026-10-13/', import.meta.url)
  const iframeRecord = JSON.parse(readFileSync(new URL('results.json', iframe)))
  const probe = JSON.parse(readFileSync(new URL('probe.json', iframe)))
  validateIframeEvidence(iframeRecord)
  validateDocumentThemeEvidence(JSON.parse(readFileSync(new URL('document-themes.json', iframe))))
  validateScreenshotManifest(
    JSON.parse(readFileSync(new URL('screenshots.json', iframe))),
    [...iframeRecord.before, ...iframeRecord.cases, ...probe.cases].map((row) => row.screenshot),
    (name) => readFileSync(new URL(name, iframe)),
    (name) => screenshotDimensions(new URL(name, iframe)),
  )
  console.log(
    'Real same-origin iframe evidence consistent: 8 cases, 2 Escape ownership checks, preserved pre-fix failures and superseded fixture probe; not other-engine/zoom proof.',
  )
  const nested = new URL('../audits/evidence/nested-2026-10-13/', import.meta.url)
  const nestedRecord = JSON.parse(readFileSync(new URL('results.json', nested)))
  validateNestedEvidence(nestedRecord)
  validateScreenshotManifest(
    JSON.parse(readFileSync(new URL('screenshots.json', nested))),
    [
      ...nestedRecord.before.map((row) => row.screenshot),
      ...nestedRecord.cases.flatMap((row) => [row.screenshot, row.closedScreenshot]),
    ],
    (name) => readFileSync(new URL(name, nested)),
    (name) => screenshotDimensions(new URL(name, nested)),
  )
  console.log(
    'Nested modal evidence consistent: 8 cases / both close orders / 18 native JPEGs; saved-data validation is not a new browser run.',
  )
  console.log(
    'Follow-up integrity verified: 12 before/after JPEG hashes and dimensions; latest blocked recheck retains 144 pending cases.',
  )
  console.log(
    'Separate native focus follow-up consistent: 10 migrations and keyboard/close restoration on both platforms; not native zoom or Safari/Firefox proof.',
  )
  console.log(
    'Historical evidence consistent: 48 desktop, 12 narrow, 10 live target/color/lock checks (8 recorded focus failures), 2 neighbors, 62 JPEGs and 4 PNGs; 3 environment-blocked suites remain pending. This is not a new browser acceptance run.',
  )
}
