// app/composables/useHaptics.ts
// SSR-safe, lazily-created singleton around web-haptics. Callers never guard.
// - Server: no-op (import.meta.client).
// - Mobile with Vibration API (Android Chrome): vibrates via navigator.vibrate.
// - No Vibration API (desktop, iOS Safari, DevTools emulation): in dev, plays
//   audio "click" feedback via the library's debug mode so haptics is observable;
//   in prod, no-op.
import { WebHaptics } from 'web-haptics'

type HapticInput = Parameters<WebHaptics['trigger']>[0]

let instance: WebHaptics | null = null

export function useHaptics() {
  function trigger(input?: HapticInput) {
    if (!import.meta.client) return
    if (!WebHaptics.isSupported && !import.meta.dev) return
    if (!instance) {
      instance = new WebHaptics({
        debug: import.meta.dev && !WebHaptics.isSupported,
      })
    }
    void instance.trigger(input)
  }
  return { trigger }
}
