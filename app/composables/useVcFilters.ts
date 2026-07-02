// app/composables/useVcFilters.ts
import { reactive, computed, ref, watch } from 'vue'
import { filterVcs } from '~/lib/filterVcs'
import type { Vc, FilterCriteria } from '~/lib/vcTypes'
// useRoute/useRouter/useHaptics are Nuxt auto-imports.

const FACETS = ['status', 'type', 'stage', 'sector', 'region'] as const

function fromQuery(query: Record<string, unknown>): FilterCriteria {
  const arr = (k: string) => (typeof query[k] === 'string' && query[k] ? String(query[k]).split(',') : [])
  return {
    q: typeof query.q === 'string' ? query.q : '',
    status: arr('status') as FilterCriteria['status'],
    type: arr('type') as FilterCriteria['type'],
    stage: arr('stage') as FilterCriteria['stage'],
    sector: arr('sector') as FilterCriteria['sector'],
    region: arr('region') as FilterCriteria['region'],
  }
}

export function useVcFilters(vcs: Vc[]) {
  const route = useRoute()
  const router = useRouter()
  const criteria = reactive<FilterCriteria>(fromQuery(route.query))
  const highlighted = ref<string | null>(null)
  const { trigger } = useHaptics() // auto-imported (Task B6)

  const filtered = computed(() => filterVcs(vcs, criteria))

  watch(criteria, (c) => {
    const query: Record<string, string> = {}
    if (c.q) query.q = c.q
    for (const f of FACETS) if (c[f].length) query[f] = c[f].join(',')
    router.replace({ query })
  }, { deep: true })

  function reset() {
    criteria.q = ''
    for (const f of FACETS) (criteria[f] as string[]).length = 0
    highlighted.value = null
    trigger('light')
  }
  function surprise() {
    const list = filtered.value
    if (!list.length) return
    highlighted.value = list[Math.floor(Math.random() * list.length)]!.name
    trigger('success')
  }

  return { criteria, filtered, highlighted, reset, surprise }
}
