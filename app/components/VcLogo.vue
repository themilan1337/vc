<!-- app/components/VcLogo.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Vc } from '~/lib/vcTypes'

const props = defineProps<{ vc: Vc }>()
const failed = ref(false)
watch(() => props.vc.name, () => (failed.value = false))
const token = useRuntimeConfig().public.logoDevToken

const src = computed(() => {
  if (failed.value || !token || !props.vc.website) return null
  try {
    return `https://img.logo.dev/${new URL(props.vc.website).hostname}?token=${token}&size=64&retina=true`
  } catch {
    return null
  }
})
</script>

<template>
  <img
    v-if="src"
    :src="src"
    :alt="`${vc.name} logo`"
    class="h-7 w-7 shrink-0 rounded-md bg-foreground/5 object-contain"
    loading="lazy"
    @error="failed = true"
  >
  <span
    v-else
    aria-hidden="true"
    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-foreground/10 text-xs font-medium text-foreground/50"
  >{{ vc.name.charAt(0).toUpperCase() }}</span>
</template>
