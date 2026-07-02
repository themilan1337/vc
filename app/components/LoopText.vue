<!-- app/components/LoopText.vue -->
<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ items: string[]; delay?: number }>(), { delay: 2200 })
const { key } = useLoop(props.delay)
const current = computed(() => props.items[key.value % props.items.length])
</script>

<template>
  <span class="relative inline-flex h-[1.2em] items-center overflow-hidden align-bottom">
    <!-- ponytail: native <Transition> — AnimatePresence (popLayout and wait modes both) jams on the SSR-rendered child and never cycles -->
    <Transition name="loop" mode="out-in">
      <span :key="key" class="whitespace-nowrap">{{ current }}</span>
    </Transition>
  </span>
</template>

<style scoped>
.loop-enter-active,
.loop-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.loop-enter-from {
  transform: translateY(100%);
  opacity: 0;
}
.loop-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
