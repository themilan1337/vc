<!-- app/components/VcRow.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import type { Vc } from '~/lib/vcTypes'

const props = defineProps<{ vc: Vc }>()
const emit = defineEmits<{ open: [] }>()
function open() {
  if (props.vc.program) emit('open')
}
const copied = ref(false)
const { trigger } = useHaptics() // auto-imported (Task B6)
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
  <div
    class="group flex h-12 w-full items-center gap-3 rounded-lg bg-foreground/5 px-4 hover:bg-foreground/10"
    :role="vc.program ? 'button' : undefined"
    :tabindex="vc.program ? 0 : undefined"
    @click="open"
    @keydown.enter.self.prevent="open"
    @keydown.space.self.prevent="open"
  >
    <VcLogo :vc="vc" />
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <span class="truncate text-sm text-foreground/80">{{ vc.name }}</span>
        <span
          v-if="vc.program"
          class="shrink-0 rounded bg-foreground/10 px-1.5 py-0.5 text-[10px] leading-none text-foreground/50"
        >program</span>
      </div>
      <div class="truncate text-xs text-foreground/40">{{ vc.type }} · {{ vc.hq || vc.region }}</div>
    </div>
    <button
      v-if="vc.website"
      class="text-xs text-foreground/50 opacity-0 hover:text-foreground group-hover:opacity-100"
      :aria-label="`Copy ${vc.name} website`"
      @click.stop="copy"
    >{{ copied ? 'copied' : 'copy' }}</button>
    <a
      v-if="vc.website"
      :href="vc.website" target="_blank" rel="noopener noreferrer"
      class="text-xs text-foreground/50 hover:text-foreground"
      :aria-label="`Open ${vc.name} website`"
      @click.stop
    >open ↗</a>
    <span v-else class="text-xs text-foreground/20">no site</span>
  </div>
</template>
