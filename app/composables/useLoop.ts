import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useLoop(delay = 2200) {
  const key = ref(0)
  let id: ReturnType<typeof setInterval> | undefined
  onMounted(() => { id = setInterval(() => { key.value++ }, delay) })
  onBeforeUnmount(() => { if (id) clearInterval(id) })
  return { key }
}
