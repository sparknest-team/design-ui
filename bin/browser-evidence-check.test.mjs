import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  screenshotDimensions,
  validateBlockedRecheck,
  validateDocumentThemeEvidence,
  validateEnvironmentSnapshot,
  validateFocusFollowup,
  validateIframeEvidence,
  validateNestedEvidence,
  validatePortalEvidence,
  validateScreenshotManifest,
} from './browser-evidence-check.mjs'

const folder = new URL('../audits/evidence/portal-2026-10-13/', import.meta.url)
const portal = JSON.parse(readFileSync(new URL('results.json', folder)))
const environment = JSON.parse(
  readFileSync(new URL('../audits/evidence/browser-environment-2026-10-13/status.json', import.meta.url)),
)
const images = (name) => screenshotDimensions(new URL(name, folder))
const focusFolder = new URL('../audits/evidence/portal-focus-2026-10-13/', import.meta.url)
const followup = JSON.parse(readFileSync(new URL('after.json', focusFolder)))
const focusStatus = JSON.parse(readFileSync(new URL('status.json', focusFolder)))
const focusImages = (name) => screenshotDimensions(new URL(name, focusFolder))
const focusManifest = JSON.parse(readFileSync(new URL('screenshots.json', focusFolder)))
const focusNames = [...focusStatus.before, ...followup.cases].map((row) => row.screenshot)
const readFocusImage = (name) => readFileSync(new URL(name, focusFolder))
const recheck = JSON.parse(
  readFileSync(new URL('../audits/evidence/browser-environment-2026-10-13/recheck-1412.json', import.meta.url)),
)
const iframeRecord = JSON.parse(
  readFileSync(new URL('../audits/evidence/iframe-2026-10-13/results.json', import.meta.url)),
)
const nestedFolder = new URL('../audits/evidence/nested-2026-10-13/', import.meta.url)
const nestedRecord = JSON.parse(readFileSync(new URL('results.json', nestedFolder)))
const nestedManifest = JSON.parse(readFileSync(new URL('screenshots.json', nestedFolder)))
const nestedNames = [
  ...nestedRecord.before.map((row) => row.screenshot),
  ...nestedRecord.cases.flatMap((row) => [row.screenshot, row.closedScreenshot]),
]
test('validates eight nested native lifecycle records', () => validateNestedEvidence(nestedRecord))
test('validates all eighteen nested native image hashes and dimensions', () =>
  validateScreenshotManifest(
    nestedManifest,
    nestedNames,
    (name) => readFileSync(new URL(name, nestedFolder)),
    (name) => screenshotDimensions(new URL(name, nestedFolder)),
  ))
for (const [name, corrupt] of [
  [
    'missing group',
    (r) => {
      r.cases.pop()
    },
  ],
  [
    'duplicate group',
    (r) => {
      r.cases[1] = r.cases[0]
    },
  ],
  [
    'missing parent-first path',
    (r) => {
      delete r.cases[0].steps.parentClosed
    },
  ],
  [
    'body baseline already locked',
    (r) => {
      r.cases[0].steps.baseline.bodyOverflow = 'hidden'
    },
  ],
  [
    'child closes parent too',
    (r) => {
      r.cases[0].steps.childClosed.state.parent = false
    },
  ],
  [
    'focus escapes top layer',
    (r) => {
      r.cases[0].steps.bothOpen.focusDialog = 'Cedar nested parent'
    },
  ],
  [
    'Tab escapes child',
    (r) => {
      r.cases[0].steps.tabWrap.focus = 'Nested background neighbor'
    },
  ],
  [
    'hidden control takes focus',
    (r) => {
      r.cases[0].steps.parentShift.focus = 'Cedar hidden nested control'
    },
  ],
  [
    'child-first loses parent opener',
    (r) => {
      r.cases[0].steps.childClosed.focus = 'BODY'
    },
  ],
  [
    'parent-first loses page opener',
    (r) => {
      r.cases[0].steps.parentFirstFinished.focus = 'BODY'
    },
  ],
  [
    'lower layer stole focus',
    (r) => {
      r.cases[0].steps.parentClosed.focusDialog = null
    },
  ],
  [
    'last lock leaks',
    (r) => {
      r.cases[0].steps.parentFirstFinished.bodyOverflow = 'hidden'
    },
  ],
  [
    'lower close releases surviving lock',
    (r) => {
      r.cases[0].steps.parentClosed.bodyOverflow = ''
    },
  ],
  [
    'double scrollbar reservation',
    (r) => {
      r.cases[0].steps.bothOpen.bodyPadding = '30px'
    },
  ],
  [
    'wrong theme palette',
    (r) => {
      r.cases[0].steps.bothOpen.primary.cedar = 'red'
    },
  ],
  [
    'wrong content color',
    (r) => {
      r.cases[0].steps.bothOpen.dialogs[1].color = 'red'
    },
  ],
  [
    'child clipped',
    (r) => {
      r.cases[0].steps.bothOpen.dialogs[1].rect.right = 2000
    },
  ],
  [
    'child stacking reversed',
    (r) => {
      r.cases[0].steps.bothOpen.dialogs[1].z = '1'
    },
  ],
  [
    'background pointer not blocked',
    (r) => {
      r.cases[0].steps.bothOpen.neighborHit = ''
    },
  ],
  [
    'one Escape delivered twice',
    (r) => {
      r.cases[0].steps.childClosed.state.parentEscapes++
    },
  ],
  [
    'closed Escape reacts again',
    (r) => {
      r.cases[0].steps.closedEscape.state.childEscapes++
    },
  ],
  [
    'before failure relabeled passed',
    (r) => {
      r.before[0].restored = true
    },
  ],
  [
    'IAB relabeled native zoom',
    (r) => {
      r.nativeZoomVerified = true
    },
  ],
  [
    'external engines exclusion removed',
    (r) => {
      r.excluded = []
    },
  ],
])
  test(`rejects nested ${name}`, () => {
    const record = structuredClone(nestedRecord)
    corrupt(record)
    assert.throws(() => validateNestedEvidence(record))
  })
const iframeThemes = JSON.parse(
  readFileSync(new URL('../audits/evidence/iframe-2026-10-13/document-themes.json', import.meta.url)),
)
test('validates actual independent document brand palettes', () => validateDocumentThemeEvidence(iframeThemes))
for (const field of ['cedarPrimary', 'mapleScheme'])
  test(`rejects copied parent ${field} in iframe`, () => {
    const record = structuredClone(iframeThemes)
    record.frame[field] = record.top[field]
    assert.throws(() => validateDocumentThemeEvidence(record))
  })
test('validates eight real same-origin iframe cases', () => validateIframeEvidence(iframeRecord))
for (const [name, corrupt] of [
  [
    'missing group',
    (r) => {
      r.cases.pop()
    },
  ],
  [
    'duplicate group',
    (r) => {
      r.cases[1] = r.cases[0]
    },
  ],
  [
    'fake frame document',
    (r) => {
      r.cases[0].steps[0].documentUrl = '/iframe.html'
    },
  ],
  [
    'escaped frame focus',
    (r) => {
      r.cases[0].steps[0].focusInside = false
    },
  ],
  [
    'broken ancestor focus chain',
    (r) => {
      r.cases[0].steps[0].documents.top.active = 'BODY'
    },
  ],
  [
    'wrong document palette',
    (r) => {
      r.cases[0].steps[0].background = 'white'
    },
  ],
  [
    'clipped after keyboard wrap',
    (r) => {
      r.cases[0].forward.rect.top = -158
    },
  ],
  [
    'lost parent opener',
    (r) => {
      r.cases[0].closed.restored = false
    },
  ],
  [
    'leaked old document lock',
    (r) => {
      r.cases[1].steps[1].documents.top.hostOverflow = 'hidden'
    },
  ],
  [
    'reopen lost focus',
    (r) => {
      r.cases[3].reopened.focusInside = false
    },
  ],
  [
    'inactive Escape listener reacted',
    (r) => {
      r.ownership[0].inactiveState.escapeCount++
    },
  ],
  [
    'pre-fix failure rewritten',
    (r) => {
      r.before[0].restored = true
    },
  ],
])
  test(`rejects iframe ${name}`, () => {
    const record = structuredClone(iframeRecord)
    corrupt(record)
    assert.throws(() => validateIframeEvidence(record))
  })

test('validates all twelve before/after native screenshot hashes', () =>
  validateScreenshotManifest(focusManifest, focusNames, readFocusImage, focusImages))
for (const [name, corrupt] of [
  [
    'missing image',
    (r) => {
      r.pop()
    },
  ],
  [
    'duplicate image',
    (r) => {
      r[1] = r[0]
    },
  ],
  [
    'changed hash',
    (r) => {
      r[0].sha256 = '0'.repeat(64)
    },
  ],
  [
    'changed dimensions',
    (r) => {
      r[0].dimensions = [1, 1]
    },
  ],
])
  test(`rejects focus manifest ${name}`, () => {
    const record = structuredClone(focusManifest)
    corrupt(record)
    assert.throws(() => validateScreenshotManifest(record, focusNames, readFocusImage, focusImages))
  })
test('rejects replaced screenshot bytes', () =>
  assert.throws(() =>
    validateScreenshotManifest(focusManifest, focusNames, () => Buffer.from('replacement'), focusImages),
  ))
test('rejects rewriting pre-fix native failure', () => {
  const record = structuredClone(focusStatus)
  record.before[0].focusInside = true
  assert.throws(() => validateFocusFollowup(followup, record, focusImages))
})
test('validates latest blocked recheck without adding browser passes', () => validateBlockedRecheck(recheck))
for (const [name, corrupt] of [
  [
    'fake acceptance',
    (r) => {
      r.newAcceptedCases = 48
    },
  ],
  [
    'fake recovery',
    (r) => {
      r.suites[0].status = 'passed'
    },
  ],
  [
    'missing suite',
    (r) => {
      r.suites.pop()
    },
  ],
  [
    'reduced pending count',
    (r) => {
      r.suites[0].remainingCases = 0
    },
  ],
  [
    'missing recovery condition',
    (r) => {
      r.suites[0].recovery = ''
    },
  ],
])
  test(`rejects blocked recheck ${name}`, () => {
    const record = structuredClone(recheck)
    corrupt(record)
    assert.throws(() => validateBlockedRecheck(record))
  })

test('validates separate post-fix native focus evidence', () =>
  validateFocusFollowup(followup, focusStatus, focusImages))
for (const [name, corrupt] of [
  [
    'escaped relocation focus',
    (r) => {
      r.cases[1].focusInside = false
    },
  ],
  [
    'duplicate migration',
    (r) => {
      r.cases[1] = r.cases[0]
    },
  ],
  [
    'stale relocation owner',
    (r) => {
      r.cases[1].owner = 'c-host'
    },
  ],
  [
    'lost opener',
    (r) => {
      r.keyboard[0].close.restored = false
    },
  ],
  [
    'narrow viewport relabeled as native zoom',
    (r) => {
      r.nativeZoomVerified = true
    },
  ],
])
  test(`rejects post-fix ${name}`, () => {
    const record = structuredClone(followup)
    corrupt(record)
    assert.throws(() => validateFocusFollowup(record, focusStatus, focusImages))
  })

test('validates saved evidence without rerunning or relabeling browsers', () => {
  validatePortalEvidence(portal, images)
  validateEnvironmentSnapshot(environment)
})

for (const [name, corrupt] of [
  [
    'duplicate desktop case',
    (r) => {
      r.cases[1] = r.cases[0]
    },
  ],
  [
    'selected theme differs',
    (r) => {
      r.cases[0].selectedTheme = 'default/dark'
    },
  ],
  [
    'body descendant retained in host',
    (r) => {
      r.cases[0].owner = 'c-host'
    },
  ],
  [
    'actual palette differs despite empty errors',
    (r) => {
      r.cases[0].background = 'rgb(24,34,48)'
    },
  ],
  [
    'missing opacity settlement',
    (r) => {
      r.cases[0].opacity = '0.5'
    },
  ],
  [
    'focus escaped',
    (r) => {
      r.cases[0].focusInside = false
    },
  ],
  [
    'page widened',
    (r) => {
      r.cases[0].pageOverflow = true
    },
  ],
  [
    'wrong inline lock',
    (r) => {
      r.cases.find((x) => x.mode === 'inline').hostOverflows = ['hidden', '']
    },
  ],
  [
    'close leaked host lock',
    (r) => {
      r.cases[0].closeState.hosts = ['hidden', '']
    },
  ],
  [
    'wrong return focus',
    (r) => {
      r.cases[0].closeState.active = 'body'
    },
  ],
  [
    'narrow clipping regression',
    (r) => {
      r.narrow[0].rect.left = -15
    },
  ],
  [
    'duplicate narrow group',
    (r) => {
      r.narrow[1] = r.narrow[0]
    },
  ],
  [
    'stale live-switch owner',
    (r) => {
      r.live[2].owner = 'c-host'
    },
  ],
  [
    'silently rewriting historical focus failure',
    (r) => {
      r.live[2].focusInside = true
    },
  ],
  [
    'hiding disclosed historical focus issue',
    (r) => {
      r.knownIssues = []
    },
  ],
  [
    'neighbor pass label hides drift',
    (r) => {
      r.neighbors[0].during.color = 'red'
    },
  ],
  [
    'wrong historical browser label',
    (r) => {
      r.browser = 'Safari'
    },
  ],
  [
    'removed native zoom exclusion',
    (r) => {
      r.excluded = []
    },
  ],
])
  test(`rejects ${name}`, () => {
    const record = structuredClone(portal)
    corrupt(record)
    assert.throws(() => validatePortalEvidence(record, images))
  })

test('rejects missing screenshot evidence', () => {
  assert.throws(() =>
    validatePortalEvidence(portal, () => {
      throw new Error('missing screenshot')
    }),
  )
})
test('rejects screenshots from the wrong viewport', () => {
  assert.throws(() => validatePortalEvidence(portal, () => [320, 640]))
})
test('rejects non-image evidence files', () => {
  assert.throws(() => screenshotDimensions(new URL('results.json', folder)))
})
for (const [name, corrupt] of [
  [
    'environment check counted as accepted',
    (r) => {
      r.newAcceptedCases = 48
    },
  ],
  [
    'blocked suite relabeled passed',
    (r) => {
      r.suites[0].status = 'passed'
    },
  ],
  [
    'blocked suite missing reason',
    (r) => {
      r.suites[0].reason = ''
    },
  ],
  [
    'Safari evidence replaced by WebKit',
    (r) => {
      r.suites[1].browser = 'WebKit'
    },
  ],
  [
    'duplicate pending combination',
    (r) => {
      r.matrix[1] = r.matrix[0]
    },
  ],
])
  test(`rejects ${name}`, () => {
    const record = structuredClone(environment)
    corrupt(record)
    assert.throws(() => validateEnvironmentSnapshot(record))
  })
