<!-- app/components/VcRow.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import type { Vc } from '~/lib/vcTypes'

const props = defineProps<{ vc: Vc }>()
const copied = ref(false)
const { trigger } = useHaptics() // auto-imported (Task B6)
const dot: Record<Vc['status'], string> = {
  verified: 'bg-emerald-500',
  ambiguous: 'bg-amber-500',
  none: 'bg-foreground/20',
}
async function copy() {
  if (!props.vc.website || !navigator.clipboard) return
  try {
    await navigator.clipboard.writeText(props.vc.website)
  } catch {
    return
  }
  copied.value = true
  trigger('success')
  setTimeout(() => (copied.value = false), 1200)
}
</script>

<template>
  <div class="group flex h-12 w-full items-center gap-3 rounded-lg bg-foreground/5 px-4 hover:bg-foreground/10">
    <span :class="['h-1.5 w-1.5 shrink-0 rounded-full', dot[vc.status]]" />
    <div class="min-w-0 flex-1">
      <div class="truncate text-sm text-foreground/80">{{ vc.name }}</div>
      <div class="truncate text-xs text-foreground/40">{{ vc.type }} · {{ vc.hq || vc.region }}</div>
    </div>
    <button
      v-if="vc.website"
      class="text-xs text-foreground/50 opacity-0 hover:text-foreground group-hover:opacity-100"
      :aria-label="`Copy ${vc.name} website`"
      @click="copy"
    >{{ copied ? 'copied' : 'copy' }}</button>
    <a
      v-if="vc.website"
      :href="vc.website" target="_blank" rel="noopener noreferrer"
      class="text-xs text-foreground/50 hover:text-foreground"
      :aria-label="`Open ${vc.name} website`"
    >open ↗</a>
    <span v-else class="text-xs text-foreground/20">no site</span>
  </div>
</template>
