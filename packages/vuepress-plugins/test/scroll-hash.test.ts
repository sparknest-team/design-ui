// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import { installScrollHash } from '../src/client/scroll-hash'

it('updates the section on scroll and clears it at the top while preserving the query', async () => {
  vi.useFakeTimers()
  const scrollBehavior = vi.fn(() => false as const)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/button', component: {} }],
    scrollBehavior,
  })
  await router.push('/button?example=1')
  scrollBehavior.mockClear()
  const stop = installScrollHash(router, '.theme-hope-content')
  document.body.innerHTML = '<article class="theme-hope-content"><h2 id="sizes"><a class="header-anchor"></a></h2></article>'
  const scrollY = vi.spyOn(window, 'scrollY', 'get').mockReturnValue(300)
  vi.spyOn(document.querySelector('h2')!, 'getBoundingClientRect').mockReturnValue({ top: 90 } as DOMRect)

  try {
    window.dispatchEvent(new Event('click'))
    await vi.advanceTimersByTimeAsync(150)
    expect(router.currentRoute.value.hash).toBe('')

    window.dispatchEvent(new Event('scroll'))
    await vi.advanceTimersByTimeAsync(150)
    expect(router.options.history.location).toBe('/button?example=1#sizes')

    scrollY.mockReturnValue(0)
    window.dispatchEvent(new Event('scroll'))
    await vi.advanceTimersByTimeAsync(150)
    expect(router.options.history.location).toBe('/button?example=1')
    expect(scrollBehavior).not.toHaveBeenCalled()
  } finally {
    stop()
    document.body.innerHTML = ''
    vi.restoreAllMocks()
    vi.useRealTimers()
  }
})
