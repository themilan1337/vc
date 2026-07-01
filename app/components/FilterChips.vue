<!-- app/components/FilterChips.vue -->
<script setup lang="ts" generic="T extends string">
const props = defineProps<{ label: string; options: readonly T[]; modelValue: T[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: T[]] }>()
const { trigger } = useHaptics() // auto-imported (Task B6)

function toggle(opt: T) {
  const set = new Set(props.modelValue)
  if (set.has(opt)) set.delete(opt)
  else set.add(opt)
  trigger('nudge')
  emit('update:modelValue', [...set])
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-1.5">
    <span class="mr-1 w-14 shrink-0 text-[10px] uppercase tracking-wide text-foreground/30">{{ label }}</span>
    <button
      v-for="opt in options"
      :key="opt"
      type="button"
      :class="['rounded-full border px-2.5 py-1 text-xs transition-colors',
               modelValue.includes(opt)
                 ? 'border-foreground bg-foreground text-background'
                 : 'border-foreground/15 text-foreground/60 hover:border-foreground/40']"
      @click="toggle(opt)"
    >{{ opt }}</button>
  </div>
</template>
