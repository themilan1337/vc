<!-- app/components/ProgramModal.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Vc } from '~/lib/vcTypes'

const props = defineProps<{ vc: Vc | null }>()
const dialog = ref<HTMLDialogElement>()
const { trigger } = useHaptics() // auto-imported (Task B6)

// ponytail: imperative show() instead of watching prop transitions — no dependency on the dialog 'close' event to resync state
function show() {
  if (!dialog.value?.open) dialog.value?.showModal()
}
function close() {
  trigger('light')
  dialog.value?.close()
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
    class="m-auto w-full max-w-md rounded-2xl bg-background p-0 shadow-xl shadow-foreground/10
           backdrop:bg-foreground/25 backdrop:backdrop-blur-sm"
    @click="$event.target === dialog && dialog?.close()"
  >
    <div v-if="vc" class="p-6">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <h2 class="truncate text-lg font-semibold tracking-tight">{{ vc.name }}</h2>
          <p class="mt-0.5 text-xs text-foreground/40">{{ vc.type }} · {{ vc.hq || vc.region }}</p>
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

      <p class="mt-4 text-sm leading-relaxed text-foreground/70">{{ vc.program?.description }}</p>

      <dl v-if="details.length" class="mt-5 space-y-2.5 border-t border-foreground/10 pt-4">
        <div v-for="[label, value] in details" :key="label" class="flex gap-4 text-sm">
          <dt class="w-20 shrink-0 text-foreground/40">{{ label }}</dt>
          <dd class="min-w-0 text-foreground/80">{{ value }}</dd>
        </div>
      </dl>

      <a
        v-if="vc.website"
        :href="vc.website"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-6 flex h-9 w-full items-center justify-center rounded-lg bg-foreground text-sm text-background transition-colors hover:bg-foreground/85"
      >apply on website ↗</a>
    </div>
  </dialog>
</template>
