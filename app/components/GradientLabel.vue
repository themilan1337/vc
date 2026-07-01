<!-- app/components/GradientLabel.vue -->
<script setup lang="ts">
defineProps<{ text: string }>()
</script>

<template>
  <span
    class="relative max-w-[16ch] text-center text-xs uppercase leading-tight tracking-wide opacity-40
           after:absolute after:left-1/2 after:top-full after:h-16 after:w-px after:content-['']
           after:bg-gradient-to-b after:from-transparent after:to-foreground"
  >{{ text }}</span>
</template>
