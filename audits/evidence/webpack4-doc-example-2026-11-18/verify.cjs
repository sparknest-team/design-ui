const fs = require('fs')
const assert = require('node:assert/strict')
const { JSDOM, VirtualConsole } = require('jsdom')
const errors = []
const virtualConsole = new VirtualConsole()
virtualConsole.on('jsdomError', error => errors.push(error))
virtualConsole.on('error', (...args) => errors.push(new Error(args.join(' '))))
const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
  url: 'http://localhost/',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole,
})
dom.window.eval(fs.readFileSync('dist/bundle.js', 'utf8'))
setTimeout(() => {
  try {
    const doc = dom.window.document
    const button = doc.querySelector('button')
    assert.ok(button, 'Button mounted')
    assert.match(button.textContent, /Webpack 4 works/)
    assert.ok(button.querySelector('svg'), 'Icon rendered')
    assert.ok(doc.querySelector('style'), 'Styles injected')
    button.click()
    assert.equal(doc.body.dataset.clicked, 'yes', 'Click handler executed')
    // jsdom cannot parse all modern CSS used by the libraries; preserve those
    // diagnostics while treating JavaScript exceptions as failures.
    const cssDiagnostics = errors.filter(error => error.type === 'css parsing')
    const runtimeErrors = errors.filter(error => error.type !== 'css parsing')
    assert.equal(runtimeErrors.length, 0, runtimeErrors.map(error => error.stack).join('\n'))
    console.log(JSON.stringify({ mounted: true, icon: true, click: true, stylesInjected: true, cssParserDiagnostics: cssDiagnostics.length, javascriptErrors: runtimeErrors.length }, null, 2))
  } catch (error) {
    console.error(error)
    process.exitCode = 1
  } finally {
    dom.window.close()
  }
}, 100)
