<!-- app/pages/index.vue -->
<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import vcsData from '~/data/vcs.json'
import type { Vc } from '~/lib/vcTypes'
import { STATUSES, TYPES, STAGES, SECTORS, REGIONS } from '~/lib/vcTypes'

const vcs = vcsData as Vc[]
const totalPrograms = vcs.filter(v => v.program).length
const { criteria, filtered, highlighted, reset, surprise } = useVcFilters(vcs)
const { trigger } = useHaptics()
const selected = ref<Vc | null>(null)
const modal = ref<{ show: () => void }>()

// The household-name programs float to the very top, in this order; then the rest
// of tier-1 alphabetically, then tier-2. Keeps "apply to Antler / YC" front and centre.
const FLAGSHIP = ['Y Combinator', 'Techstars', 'a16z speedrun', 'Antler', 'Entrepreneurs First',
  '500 Global', 'Sequoia Arc', 'PearX (Pear VC)', 'Neo Accelerator (Neo Residency)', 'HF0 Residency',
  'South Park Commons Founder Fellowship', 'MassChallenge']
const flagRank = (v: Vc) => {
  const i = FLAGSHIP.indexOf(v.name)
  return i === -1 ? FLAGSHIP.length : i
}
const programs = computed(() =>
  filtered.value
    .filter(v => v.program)
    .sort((a, b) =>
      (flagRank(a) - flagRank(b)) || (a.program!.tier - b.program!.tier) || a.name.localeCompare(b.name)),
)
const funds = computed(() => filtered.value.filter(v => !v.program))

async function openProgram(vc: Vc) {
  trigger('medium')
  selected.value = vc
  await nextTick()
  modal.value?.show()
}
const loopWords = ['seed-stage AI', 'climate funds', 'crypto backers', 'fintech VCs', 'your next check']

useHead({ title: 'VC Finder' })
</script>

<template>
  <main class="mx-auto flex h-dvh w-full max-w-3xl flex-col px-6 py-12">
    <header>
      <h1 class="text-2xl font-semibold leading-tight tracking-tight">
        Funds for <LoopText :items="loopWords" class="text-primary" />
      </h1>
      <p class="mt-1.5 text-sm text-foreground/40">
        {{ totalPrograms }} accelerator &amp; incubator programs to apply to, then {{ vcs.length - totalPrograms }} venture funds &amp; angels.
      </p>
    </header>

    <div class="mt-8 flex flex-wrap items-center gap-2">
      <SmoothInput v-model="criteria.q" class="min-w-40 flex-1 basis-40" placeholder="search by name…" aria-label="Search venture funds by name" />
      <FilterDropdown v-model="criteria.status" label="status" :options="STATUSES" />
      <FilterDropdown v-model="criteria.type" label="type" :options="TYPES" />
      <FilterDropdown v-model="criteria.stage" label="stage" :options="STAGES" />
      <FilterDropdown v-model="criteria.sector" label="sector" :options="SECTORS" />
      <FilterDropdown v-model="criteria.region" label="region" :options="REGIONS" />
    </div>

    <div class="mt-4 flex items-center justify-between text-xs text-foreground/40">
      <span class="tabular-nums">{{ filtered.length }} / {{ vcs.length }} funds</span>
      <div class="flex gap-4">
        <button type="button" class="transition-colors hover:text-foreground" @click="surprise">surprise me</button>
        <button type="button" class="transition-colors hover:text-foreground" @click="reset">reset</button>
      </div>
    </div>

    <FadeScrollArea class="mt-2 min-h-48 flex-1">
      <div class="space-y-1 p-1">
        <template v-if="programs.length">
          <div class="px-1 pb-1 pt-1 text-[10px] uppercase tracking-wide text-foreground/30">programs — apply & join</div>
          <VcRow
            v-for="vc in programs"
            :key="vc.name"
            :vc="vc"
            :class="highlighted === vc.name ? 'rounded-lg ring-1 ring-primary' : ''"
            @open="openProgram(vc)"
          />
          <div v-if="funds.length" class="px-1 pb-1 pt-4 text-[10px] uppercase tracking-wide text-foreground/30">venture funds &amp; investors</div>
        </template>
        <VcRow
          v-for="vc in funds"
          :key="vc.name"
          :vc="vc"
          :class="highlighted === vc.name ? 'rounded-lg ring-1 ring-primary' : ''"
        />
        <div v-if="!filtered.length" class="flex flex-col items-center gap-3 py-20">
          <p class="text-sm text-foreground/50">no funds match these filters</p>
          <button
            type="button"
            class="text-xs text-foreground/40 underline underline-offset-4 transition-colors hover:text-foreground"
            @click="reset"
          >reset filters</button>
        </div>
      </div>
    </FadeScrollArea>

    <ProgramModal ref="modal" :vc="selected" />
  </main>
</template>
