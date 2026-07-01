<!-- app/pages/index.vue -->
<script setup lang="ts">
import vcsData from '~/data/vcs.json'
import type { Vc } from '~/lib/vcTypes'
import { STATUSES, TYPES, STAGES, SECTORS, REGIONS } from '~/lib/vcTypes'

const vcs = vcsData as Vc[]
const { criteria, filtered, highlighted, reset, surprise } = useVcFilters(vcs)
const loopWords = ['seed-stage AI', 'climate funds', 'crypto backers', 'fintech VCs', 'your next check']

useHead({ title: 'VC Finder' })
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-2xl flex-col items-center gap-8 px-4 py-16">
    <GradientLabel text="find your investor" />

    <h1 class="text-center text-3xl font-medium leading-tight">
      Funds for <LoopText :items="loopWords" class="text-primary" />
    </h1>

    <SmoothInput v-model="criteria.q" placeholder="search 244 venture funds…" aria-label="Search venture funds" />

    <div class="flex w-full flex-col gap-2">
      <FilterChips label="status" :options="STATUSES" v-model="criteria.status" />
      <FilterChips label="type" :options="TYPES" v-model="criteria.type" />
      <FilterChips label="stage" :options="STAGES" v-model="criteria.stage" />
      <FilterChips label="sector" :options="SECTORS" v-model="criteria.sector" />
      <FilterChips label="region" :options="REGIONS" v-model="criteria.region" />
    </div>

    <div class="flex w-full items-center justify-between text-xs text-foreground/40">
      <span>{{ filtered.length }} / {{ vcs.length }}</span>
      <div class="flex gap-4">
        <button type="button" class="hover:text-foreground" @click="surprise">surprise me</button>
        <button type="button" class="hover:text-foreground" @click="reset">reset</button>
      </div>
    </div>

    <FadeScrollArea class="h-96 w-full">
      <div class="space-y-1 p-1">
        <VcRow
          v-for="vc in filtered"
          :key="vc.name"
          :vc="vc"
          :class="highlighted === vc.name ? 'rounded-lg ring-1 ring-primary' : ''"
        />
        <div v-if="!filtered.length" class="flex flex-col items-center gap-10 py-16">
          <GradientLabel text="no matches" />
          <p class="text-sm text-foreground/40">Try loosening a filter.</p>
        </div>
      </div>
    </FadeScrollArea>
  </main>
</template>
