import { mount } from '@vue/test-utils'
import { afterEach, expect, test, vi } from 'vitest'
import DirectionToggle from '../src/DirectionToggle.vue'
import { docsDirectionStorageKey } from '../src/docs-direction'

const wrappers: ReturnType<typeof mount>[] = []
const frames: HTMLIFrameElement[] = []
const setup = () => {
  const wrapper = mount(DirectionToggle)
  wrappers.push(wrapper)
  return wrapper
}
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  frames.splice(0).forEach((frame) => frame.remove())
  localStorage.clear()
  document.documentElement.removeAttribute('dir')
  vi.restoreAllMocks()
})

test('button toggles the document, announces its state and restores saved direction', async () => {
  const first = setup()
  expect(first.attributes('aria-pressed')).toBe('false')
  await first.trigger('click')
  expect(document.documentElement.dir).toBe('rtl')
  expect(first.text()).toContain('RTL')
  expect(first.attributes('aria-label')).toContain('Switch to left-to-right')
  expect(localStorage.getItem(docsDirectionStorageKey)).toBe('rtl')
  first.unmount()
  wrappers.pop()
  const second = setup()
  await second.vm.$nextTick()
  expect(second.attributes('aria-pressed')).toBe('true')
  await second.trigger('click')
  expect(document.documentElement.dir).toBe('ltr')
})

test('iframe handshake only responds to the matching frame and origin', async () => {
  const frame = document.createElement('iframe')
  document.body.append(frame)
  frames.push(frame)
  const send = vi.spyOn(frame.contentWindow!, 'postMessage')
  const wrapper = setup()
  send.mockClear()
  window.dispatchEvent(
    new window.MessageEvent('message', {
      data: { type: 'sparknest-docs-direction-ready' },
      source: frame.contentWindow,
      origin: 'https://foreign.example',
    }),
  )
  expect(send).not.toHaveBeenCalled()
  await wrapper.trigger('click')
  expect(send).toHaveBeenLastCalledWith({ type: 'sparknest-docs-direction', direction: 'rtl' }, window.location.origin)
})

test('the control remains usable when persistent storage is unavailable', async () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('storage disabled')
  })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('storage disabled')
  })
  const wrapper = setup()
  await wrapper.trigger('click')
  expect(document.documentElement.dir).toBe('rtl')
})

test('storage events synchronize mounted controls and unmount removes their listeners', async () => {
  const wrapper = setup()
  window.dispatchEvent(new window.StorageEvent('storage', { key: docsDirectionStorageKey, newValue: 'rtl' }))
  await wrapper.vm.$nextTick()
  expect(wrapper.attributes('aria-pressed')).toBe('true')
  wrapper.unmount()
  wrappers.pop()
  window.dispatchEvent(new window.StorageEvent('storage', { key: docsDirectionStorageKey, newValue: 'ltr' }))
  expect(document.documentElement.dir).toBe('rtl')
})
