// @vitest-environment jsdom
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, test, vi } from 'vitest'
import SourceCodeItem from '../src/client/components/SourceCodeItem.vue'

const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })

test('an open source panel updates on URL changes and ignores an older in-flight request', async () => {
  let finishOld: (value: any) => void
  globalThis.fetch = vi.fn()
    .mockImplementationOnce(() => new Promise(resolve => { finishOld = resolve }))
    .mockResolvedValueOnce({ ok: true, json: async () => ({ name: 'demo.vue', rawCode: 'new', highlightCode: '<pre>new</pre>' }) })
  const wrapper = mount(SourceCodeItem, { props: { sourceUrl: '/panel-old.json' } })
  try {
    await wrapper.setProps({ sourceUrl: '/panel-new.json' })
    await flushPromises()
    expect(wrapper.html()).toContain('<pre>new</pre>')
    finishOld!({ ok: true, json: async () => ({ highlightCode: '<pre>old</pre>' }) })
    await flushPromises()
    expect(wrapper.html()).toContain('<pre>new</pre>')
    expect(wrapper.html()).not.toContain('<pre>old</pre>')
  } finally { wrapper.unmount() }
})
