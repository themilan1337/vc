// app/composables/useHaptics.ts
// SSR-safe, lazily-created singleton around web-haptics. No-ops on the server
// and on devices without the Vibration API (desktop), so callers never guard.
import { WebHaptics } from 'web-haptics'

type HapticInput = Parameters<WebHaptics['trigger']>[0]

let instance: WebHaptics | null = null

export function useHaptics() {
  function trigger(input?: HapticInput) {
    if (!import.meta.client || !WebHaptics.isSupported) return
    if (!instance) instance = new WebHaptics()
    void instance.trigger(input)
  }
  return { trigger }
}
