const assert = require('node:assert/strict')
const fs = require('fs')
const path = require('path')
const workspace = path.resolve(__dirname, '../../..')
for (const [brand, repo, files] of [
  ['maple', 'maple-design-mobile', ['platform.zh-CN.md', 'platform.en-US.md']],
  ['cedar', 'cedar-design-web', ['guide/platform.md', 'guide/platform.en-US.md']],
]) {
  for (const file of files) {
    const doc = fs.readFileSync(path.join(workspace, repo, 'packages/ui/docs', file), 'utf8')
    const scripts = [...doc.matchAll(/```js\n([\s\S]*?)\n```/g)].map(match => match[1].trim())
    assert.equal(scripts.length, 2)
    assert.equal(scripts[0], fs.readFileSync(path.join(__dirname, brand, 'webpack.config.cjs'), 'utf8').trim())
    assert.equal(scripts[1], fs.readFileSync(path.join(__dirname, brand, 'src/index.js'), 'utf8').trim())
    assert.equal(doc.match(/```html\n([\s\S]*?)\n```/)[1].trim(), fs.readFileSync(path.join(__dirname, brand, 'index.html'), 'utf8').trim())
    console.log(`PASS ${repo}/${file}: config, entry and HTML match fixture`)
  }
}
