import type { useRouter } from 'vuepress/client'

export function installScrollHash(router: ReturnType<typeof useRouter>, contentSelector: string) {
  let timer: ReturnType<typeof setTimeout> | undefined
  const history = router.options.history
  const removeGuard = router.beforeEach(() => clearTimeout(timer))

  function onScroll() {
    clearTimeout(timer)
    timer = setTimeout(() => {
      const content = document.querySelector(contentSelector)
      if (!content) {
        return
      }

      let hash = ''
      if (window.scrollY > 0) {
        const scrollPadding = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
        const headings = content.querySelectorAll<HTMLElement>(
          'h2[id]:has(> .header-anchor), h3[id]:has(> .header-anchor)',
        )
        for (const heading of headings) {
          const scrollMargin = Number.parseFloat(getComputedStyle(heading).scrollMarginTop) || 0
          if (heading.getBoundingClientRect().top > Math.max(100, scrollMargin + scrollPadding + 5)) {
            break
          }
          hash = `#${heading.id}`
        }
      }

      const { path, query } = router.currentRoute.value
      const target = router.resolve({ path, query, hash }).fullPath
      if (history.location.split('#')[0] !== target.split('#')[0]) {
        return
      }
      if (history.location !== target) {
        history.replace(target)
      }
    }, 150)
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  return () => {
    removeGuard()
    clearTimeout(timer)
    window.removeEventListener('scroll', onScroll)
  }
}
