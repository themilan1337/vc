<!-- app/components/FilterDropdown.vue -->
<script setup lang="ts" generic="T extends string">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { motion, AnimatePresence } from 'motion-v'

const props = defineProps<{ label: string; options: readonly T[]; modelValue: T[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: T[]] }>()
const { trigger } = useHaptics() // auto-imported (Task B6)

const open = ref(false)
const alignRight = ref(false)
const root = ref<HTMLDivElement>()

function toggleOpen() {
  if (!open.value) {
    const r = root.value?.getBoundingClientRect()
    // ponytail: flip to right-aligned when a left-aligned panel would clip the viewport
    alignRight.value = !!r && r.left + 200 > window.innerWidth
  }
  open.value = !open.value
  trigger('light')
}

function toggle(opt: T) {
  const set = new Set(props.modelValue)
  if (set.has(opt)) set.delete(opt)
  else set.add(opt)
  trigger('nudge')
  emit('update:modelValue', [...set])
}

function clearAll() {
  trigger('light')
  emit('update:modelValue', [])
}

function onPointerDown(e: PointerEvent) {
  if (open.value && !root.value?.contains(e.target as Node)) open.value = false
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}
onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      :aria-expanded="open"
      :class="['flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors',
               modelValue.length || open
                 ? 'border-foreground/30 text-foreground'
                 : 'border-foreground/15 text-foreground/60 hover:border-foreground/30 hover:text-foreground']"
      @click="toggleOpen"
    >
      {{ label }}
      <span
        v-if="modelValue.length"
        class="flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium tabular-nums text-background"
      >{{ modelValue.length }}</span>
      <svg :class="['h-3 w-3 text-foreground/40 transition-transform duration-200', open ? 'rotate-180' : '']" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <AnimatePresence>
      <motion.div
        v-if="open"
        :initial="{ opacity: 0, y: -4, scale: 0.97 }"
        :animate="{ opacity: 1, y: 0, scale: 1 }"
        :exit="{ opacity: 0, y: -4, scale: 0.97 }"
        :transition="{ duration: 0.15, ease: 'easeOut' }"
        :class="['absolute top-full z-20 mt-1.5 max-h-72 min-w-44 origin-top overflow-y-auto rounded-xl border border-foreground/10 bg-background p-1.5 shadow-lg shadow-foreground/5',
                 alignRight ? 'right-0' : 'left-0']"
      >
        <button
          v-for="opt in options"
          :key="opt"
          type="button"
          :aria-pressed="modelValue.includes(opt)"
          class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
          @click="toggle(opt)"
        >
          <span
            :class="['flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors',
                     modelValue.includes(opt) ? 'border-foreground bg-foreground' : 'border-foreground/25']"
          >
            <svg v-if="modelValue.includes(opt)" class="h-2.5 w-2.5 text-background" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M2 5.2 4.2 7.4 8 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          {{ opt }}
        </button>
        <div v-if="modelValue.length" class="mt-1 border-t border-foreground/10 pt-1">
          <button
            type="button"
            class="w-full rounded-lg px-2.5 py-1.5 text-left text-xs text-foreground/40 transition-colors hover:bg-foreground/5 hover:text-foreground"
            @click="clearAll"
          >clear</button>
        </div>
      </motion.div>
    </AnimatePresence>
  </div>
</template>
