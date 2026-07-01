<!-- app/components/SmoothInput.vue -->
<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion-v'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  ariaLabel?: string
}>(), { modelValue: '', placeholder: 'search…', ariaLabel: 'Search' })
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const containerRef = ref<HTMLDivElement>()
const inputRef = ref<HTMLInputElement>()
const measureRef = ref<HTMLSpanElement>()

const caretX = useMotionValue(0)
const caretOpacity = useMotionValue(0)
const reduced = useReducedMotion()
const springCaretX = useSpring(
  caretX,
  reduced.value ? { stiffness: 10000, damping: 100, mass: 0.1 } : { stiffness: 500, damping: 30, mass: 0.5 },
)

function syncMeasureSpan() {
  const input = inputRef.value, span = measureRef.value
  if (!input || !span) return
  const s = getComputedStyle(input)
  span.style.font = `${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`
  span.style.letterSpacing = s.letterSpacing
}

function measurePrefixWidth(text: string): number | null {
  const input = inputRef.value, span = measureRef.value
  if (!input || !span) return null
  syncMeasureSpan()
  span.textContent = text
  const pl = parseFloat(getComputedStyle(input).paddingLeft) || 0
  return text.length > 0 ? span.offsetWidth + pl : pl - 1
}

function scrollCaretIntoView(input: HTMLInputElement, abs: number) {
  const s = getComputedStyle(input)
  const pl = parseFloat(s.paddingLeft) || 0, pr = parseFloat(s.paddingRight) || 0
  const maxScroll = Math.max(0, input.scrollWidth - input.clientWidth)
  const right = input.scrollLeft + input.clientWidth - pr
  const left = input.scrollLeft + pl
  if (abs > right) { input.scrollLeft = Math.min(abs - input.clientWidth + pr, maxScroll); return }
  if (abs < left) { input.scrollLeft = Math.max(0, abs - pl) }
}

function updateCaret() {
  const input = inputRef.value
  if (!input || document.activeElement !== input) return
  const start = input.selectionStart ?? 0, end = input.selectionEnd ?? 0
  const hasSel = start !== end
  const idx = start === end ? start : (input.selectionDirection === 'backward' ? start : end)
  const abs = measurePrefixWidth(input.value.slice(0, idx))
  if (abs === null) return
  scrollCaretIntoView(input, abs)
  const s = getComputedStyle(input)
  const pl = parseFloat(s.paddingLeft) || 0, pr = parseFloat(s.paddingRight) || 0
  const pos = abs - input.scrollLeft
  const minX = pl - 1, maxX = input.clientWidth - pr
  const visible = pos >= minX && pos <= maxX + 1
  caretX.set(Math.min(pos, maxX))
  caretOpacity.set(!visible || hasSel ? 0 : 1)
}

function onInput(e: Event) {
  const t = e.target as HTMLInputElement
  emit('update:modelValue', t.value)
  requestAnimationFrame(updateCaret)
}
function onBlur() { caretOpacity.set(0) }
function onSelectionChange() {
  if (document.activeElement === inputRef.value) requestAnimationFrame(updateCaret)
}

watch(() => props.modelValue, () => requestAnimationFrame(updateCaret))

let ro: ResizeObserver | undefined
onMounted(() => {
  document.addEventListener('selectionchange', onSelectionChange)
  inputRef.value?.addEventListener('scroll', updateCaret)
  ro = new ResizeObserver(updateCaret)
  if (containerRef.value) ro.observe(containerRef.value)
  void document.fonts?.ready.then(updateCaret)
})
onBeforeUnmount(() => {
  document.removeEventListener('selectionchange', onSelectionChange)
  inputRef.value?.removeEventListener('scroll', updateCaret)
  ro?.disconnect()
})
</script>

<template>
  <div
    class="relative w-full max-w-[420px] rounded-2xl bg-muted2 p-4
           has-[:focus-visible]:outline has-[:focus-visible]:outline-2
           has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-muted3"
  >
    <div ref="containerRef" class="relative grid grid-cols-1 text-2xl" style="caret-color: transparent">
      <input
        ref="inputRef"
        :value="modelValue"
        :placeholder="placeholder"
        :aria-label="ariaLabel"
        class="col-start-1 row-start-1 w-full bg-transparent text-inherit outline-none placeholder:text-foreground/40"
        @input="onInput"
        @blur="onBlur"
      >
      <span ref="measureRef" aria-hidden="true" class="pointer-events-none invisible absolute left-0 top-0 whitespace-pre" />
      <motion.div
        class="pointer-events-none col-start-1 row-start-1 h-[0.9em] w-0.5 self-center bg-primary"
        :style="{ x: springCaretX, opacity: caretOpacity }"
      />
    </div>
  </div>
</template>
