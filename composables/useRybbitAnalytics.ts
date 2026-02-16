/**
 * Composable for Rybbit Analytics custom event tracking.
 * Provides safe wrappers around window.rybbit that handle
 * SSR (no window) and async script loading (rybbit may not be ready yet).
 *
 * @see https://rybbit.com/docs/track-events
 */
export function useRybbitAnalytics() {
  /**
   * Safely get the rybbit instance (returns undefined during SSR or before script loads)
   */
  const getRybbit = (): Window['rybbit'] => {
    if (import.meta.server) return undefined
    return window.rybbit
  }

  /**
   * Track a custom event with optional properties.
   * Properties values must be strings or numbers (max 2KB total).
   */
  const trackEvent = (name: string, properties?: Record<string, string | number>) => {
    getRybbit()?.event(name, properties)
  }

  /**
   * Track an outbound link click.
   */
  const trackOutbound = (url: string, text?: string, target?: string) => {
    getRybbit()?.trackOutbound(url, text, target)
  }

  /**
   * Track scroll depth milestones on the current page.
   * Fires events at 25%, 50%, 75%, and 100% scroll depth.
   * Returns a cleanup function to remove the scroll listener.
   */
  const useScrollDepthTracking = (path: string) => {
    if (import.meta.server) return

    const milestones = [25, 50, 75, 100] as const
    const fired = new Set<number>()

    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight

      if (docHeight <= 0) return

      const scrollPercent = Math.round((scrollTop / docHeight) * 100)

      for (const milestone of milestones) {
        if (scrollPercent >= milestone && !fired.has(milestone)) {
          fired.add(milestone)
          trackEvent(`scroll_${milestone}`, { path })
        }
      }
    }

    // Throttle scroll events (~200ms)
    let ticking = false
    const throttledScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
      }
    }

    onMounted(() => {
      window.addEventListener('scroll', throttledScroll, { passive: true })
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', throttledScroll)
    })
  }

  return {
    trackEvent,
    trackOutbound,
    useScrollDepthTracking,
  }
}
