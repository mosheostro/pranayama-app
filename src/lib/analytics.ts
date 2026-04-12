declare global {
  interface Window {
    __pranayamaAnalytics?: Array<{
      event: string
      timestamp: string
      detail: Record<string, unknown>
    }>
  }
}

export function trackEvent(
  event: string,
  detail: Record<string, unknown> = {},
) {
  if (typeof window === 'undefined') {
    return
  }

  const payload = {
    event,
    timestamp: new Date().toISOString(),
    detail,
  }

  window.__pranayamaAnalytics = window.__pranayamaAnalytics ?? []
  window.__pranayamaAnalytics.push(payload)
  window.dispatchEvent(
    new CustomEvent('pranayama:analytics', {
      detail: payload,
    }),
  )
}
