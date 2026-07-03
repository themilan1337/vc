<!-- app/components/ProgramModal.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Vc } from '~/lib/vcTypes'

const props = defineProps<{ vc: Vc | null }>()
const dialog = ref<HTMLDialogElement>()
const { trigger } = useHaptics() // auto-imported (Task B6)

// ponytail: imperative show() instead of watching prop transitions — no dependency on the dialog 'close' event to resync state
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
let closing = false

function show() {
  if (!dialog.value?.open) dialog.value?.showModal()
}

async function close() {
  const el = dialog.value
  if (!el?.open || closing) return
  trigger('light')
  if (reduceMotion()) return el.close()
  closing = true
  const opts = { duration: 180, easing: 'ease-in', fill: 'forwards' as const }
  const anims = [
    el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(8px) scale(0.97)' }], opts),
    el.animate([{ opacity: 1 }, { opacity: 0 }], { ...opts, pseudoElement: '::backdrop' }),
  ]
  await Promise.allSettled(anims.map(a => a.finished))
  anims.forEach(a => a.cancel()) // release fill: forwards so the next open starts clean
  closing = false
  el.close()
}
defineExpose({ show })

const details = computed(() => {
  const vc = props.vc
  if (!vc?.program) return []
  const p = vc.program
  return [
    ['funding', p.funding],
    ['equity', p.equity],
    ['duration', p.duration],
    ['location', p.location],
    ['batches', p.cadence],
    ['focus', vc.sector.join(', ')],
    ['stage', vc.stage.join(', ')],
  ].filter((row): row is [string, string] => !!row[1])
})
</script>

<template>
  <!-- ponytail: native <dialog> — focus trap, Escape, and top layer for free -->
  <dialog
    ref="dialog"
    class="m-auto max-h-[85dvh] w-full max-w-md flex-col rounded-2xl bg-background p-0 shadow-xl shadow-foreground/10
           backdrop:bg-foreground/25 backdrop:backdrop-blur-sm open:flex"
    @click="$event.target === dialog && close()"
    @cancel.prevent="close()"
  >
    <template v-if="vc">
      <!-- fixed header -->
      <div class="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
        <div class="flex min-w-0 items-center gap-3">
          <VcLogo :vc="vc" class="!h-10 !w-10 rounded-lg text-base" />
          <div class="min-w-0">
          <h2 class="truncate text-lg font-semibold tracking-tight">{{ vc.name }}</h2>
          <p class="mt-0.5 text-xs text-foreground/40">{{ vc.type }} · {{ vc.hq || vc.region }}</p>
          </div>
        </div>
        <button
          type="button"
          class="-m-1.5 shrink-0 rounded-lg p-1.5 text-foreground/40 transition-colors hover:bg-foreground/5 hover:text-foreground"
          aria-label="Close"
          @click="close"
        >
          <svg class="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <!-- scrollable body -->
      <div class="min-h-0 flex-1 overflow-y-auto px-6">
        <p class="text-sm leading-relaxed text-foreground/70">{{ vc.program?.description }}</p>

        <dl v-if="details.length" class="mt-5 space-y-2.5 border-t border-foreground/10 pt-4">
          <div v-for="[label, value] in details" :key="label" class="flex gap-4 text-sm">
            <dt class="w-20 shrink-0 text-foreground/40">{{ label }}</dt>
            <dd class="min-w-0 text-foreground/80">{{ value }}</dd>
          </div>
        </dl>
      </div>

      <!-- pinned footer -->
      <div v-if="vc.website" class="px-6 pb-6 pt-4">
        <a
          :href="vc.website"
          target="_blank"
          rel="noopener noreferrer"
          class="flex h-9 w-full items-center justify-center rounded-lg bg-foreground text-sm text-background transition-colors hover:bg-foreground/85"
        >apply on website ↗</a>
      </div>
    </template>
  </dialog>
</template>

<style scoped>
@media (prefers-reduced-motion: no-preference) {
  dialog[open] {
    animation: modal-in 0.28s cubic-bezier(0.32, 0.72, 0, 1);
  }
  dialog[open]::backdrop {
    animation: backdrop-in 0.28s ease-out;
  }
}
@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.96);
  }
}
@keyframes backdrop-in {
  from {
    opacity: 0;
  }
}
</style>
