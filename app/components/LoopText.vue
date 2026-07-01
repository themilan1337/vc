<!-- app/components/LoopText.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { motion, AnimatePresence } from 'motion-v'

const props = withDefaults(defineProps<{ items: string[]; delay?: number }>(), { delay: 2200 })
const { key } = useLoop(props.delay)
const current = computed(() => props.items[key.value % props.items.length])
</script>

<template>
  <span class="relative inline-flex h-[1.2em] items-center overflow-hidden align-bottom">
    <AnimatePresence mode="wait" :initial="false">
      <motion.span
        :key="key"
        :initial="{ opacity: 0, y: '100%' }"
        :animate="{ opacity: 1, y: 0 }"
        :exit="{ opacity: 0, y: '-100%' }"
        :transition="{ duration: 0.3 }"
        class="whitespace-nowrap"
      >{{ current }}</motion.span>
    </AnimatePresence>
  </span>
</template>
