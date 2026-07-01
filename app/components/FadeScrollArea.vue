<!-- app/components/FadeScrollArea.vue -->
<script setup lang="ts">
// ponytail: static top+bottom fade via CSS mask; no reka-ui/Radix ScrollArea dependency.
const fade = 'linear-gradient(to bottom, transparent, #000 2rem, #000 calc(100% - 2rem), transparent)'
</script>

<template>
  <div
    class="overflow-y-auto rounded-xl"
    :style="{ maskImage: fade, WebkitMaskImage: fade }"
  >
    <slot />
  </div>
</template>
