import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { componentPages } from '../inventory.mjs'

test('Cedar inventory counts runnable HTML demos with valid Markdown indentation', async () => {
  const root = await mkdtemp(join(tmpdir(), 'direction-inventory-'))
  try {
    const directory = join(root, 'packages/cedar-ui/src/example')
    await mkdir(directory, { recursive: true })
    await writeFile(join(directory, 'README.md'), '---\npermalink: /components/example/\n---\n<demo src="./one.vue"></demo>\n <demo src="./two.vue"></demo>\n')
    await writeFile(join(directory, 'one.vue'), '<template>One</template>')
    await writeFile(join(directory, 'two.vue'), '<template>Two</template>')
    const pages = componentPages(root, 'cedar')
    assert.equal(pages.length, 1)
    assert.deepEqual(pages[0].demos.map(demo => demo.name), ['one.vue', 'two.vue'])
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
