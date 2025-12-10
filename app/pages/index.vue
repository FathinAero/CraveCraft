<script setup lang="ts">
import type { Food, FoodType, Scan } from '~/types/scan'

const { scans, fetchScans, loading, error } = useScans()

// Biar ranking lebih kebaca, boleh naikin limit
await useAsyncData('dashboard-scans', () => fetchScans({ limit: 200 }))

const totalScans = computed(() => scans.value.length)

const avg = computed(() => {
  if (!scans.value.length) {
    return { protein: 0, carbs: 0, veg: 0, fruit: 0 }
  }

  const sum = scans.value.reduce(
    (acc, s) => ({
      protein: acc.protein + s.protein,
      carbs: acc.carbs + s.carbs,
      veg: acc.veg + s.veg,
      fruit: acc.fruit + s.fruit,
    }),
    { protein: 0, carbs: 0, veg: 0, fruit: 0 },
  )

  const n = scans.value.length

  return {
    protein: sum.protein / n,
    carbs: sum.carbs / n,
    veg: sum.veg / n,
    fruit: sum.fruit / n,
  }
})

type LowestCategory = {
  key: 'protein' | 'carbs' | 'veg' | 'fruit'
  label: string
  value: number
}

const lowestCategory = computed<LowestCategory | null>(() => {
  if (!scans.value.length) return null

  const currentAvg = avg.value

  const list: LowestCategory[] = [
    { key: 'protein', label: 'protein', value: currentAvg.protein },
    { key: 'carbs', label: 'karbohidrat', value: currentAvg.carbs },
    { key: 'veg', label: 'sayur', value: currentAvg.veg },
    { key: 'fruit', label: 'buah', value: currentAvg.fruit },
  ]

  return list.reduce((min, item) => (item.value < min.value ? item : min), list[0])
})

const foodTypes = ['protein', 'carbs', 'veg', 'fruit'] as const

const typeLabels: Record<FoodType, string> = {
  protein: 'Protein',
  carbs: 'Karbohidrat',
  veg: 'Sayur',
  fruit: 'Buah',
}

const getScanValueForType = (scan: Scan, type: FoodType) => {
  switch (type) {
    case 'protein':
      return scan.protein
    case 'carbs':
      return scan.carbs
    case 'veg':
      return scan.veg
    case 'fruit':
      return scan.fruit
  }
}

type FoodScore = {
  food: Food
  count: number
  score: number
}

/**
 * Ranking per tipe:
 * - count = seberapa sering makanan itu muncul di scan
 * - score = akumulasi "persentase dimakan" dari scan sesuai tipe-nya
 *
 * Ini nyambung sama note BE "paling sering habis",
 * karena kalau persentase dimakan tinggi, score-nya naik.
 */
const rankingByType = computed<Record<FoodType, FoodScore[]>>(() => {
  const maps: Record<FoodType, Map<number, FoodScore>> = {
    protein: new Map(),
    carbs: new Map(),
    veg: new Map(),
    fruit: new Map(),
  }

  for (const s of scans.value) {
    for (const f of s.foods ?? []) {
      const map = maps[f.type]
      const existing = map.get(f.id) ?? { food: f, count: 0, score: 0 }

      existing.count += 1
      existing.score += getScanValueForType(s, f.type)

      map.set(f.id, existing)
    }
  }

  const out = {} as Record<FoodType, FoodScore[]>

  for (const t of foodTypes) {
    out[t] = Array
      .from(maps[t].values())
      .sort((a, b) => b.score - a.score || b.count - a.count)
  }

  return out
})

const topFoodByType = computed<Record<FoodType, FoodScore | null>>(() => {
  return {
    protein: rankingByType.value.protein[0] ?? null,
    carbs: rankingByType.value.carbs[0] ?? null,
    veg: rankingByType.value.veg[0] ?? null,
    fruit: rankingByType.value.fruit[0] ?? null,
  }
})

const foodTypeClass = (type: FoodType): string => {
  switch (type) {
    case 'protein':
      return 'bg-red-100 text-red-700 ring-1 ring-red-600/20'
    case 'carbs':
      return 'bg-sky-100 text-sky-700 ring-1 ring-sky-600/20'
    case 'veg':
      return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20'
    case 'fruit':
      return 'bg-amber-100 text-amber-700 ring-1 ring-amber-600/20'
    default:
      return 'bg-gray-100 text-gray-700 ring-1 ring-gray-600/20'
  }
}

const foodTypeSurfaceClass = (type: FoodType): string => {
  switch (type) {
    case 'protein':
      return 'border-red-100 bg-red-50/50'
    case 'carbs':
      return 'border-sky-100 bg-sky-50/50'
    case 'veg':
      return 'border-emerald-100 bg-emerald-50/50'
    case 'fruit':
      return 'border-amber-100 bg-amber-50/50'
    default:
      return 'border-gray-100 bg-gray-50/50'
  }
}


</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-slate-900">
        Dashboard
      </h2>
      <p class="text-sm text-slate-500">
        Ringkasan konsumsi makanan berdasarkan hasil pemindaian tray.
      </p>

      <p
        v-if="lowestCategory && lowestCategory.value < 0.5"
        class="mt-2 text-xs text-amber-600 font-medium"
      >
        Konsumsi {{ lowestCategory.label }} relatif rendah (rata-rata
        {{ (lowestCategory.value * 100).toFixed(0) }}%). Perlu perhatian khusus.
      </p>
    </div>

    <!-- Summary cards -->
    <div class="grid gap-4 md:grid-cols-4">
      <UCard class="border border-gray-200 bg-white shadow-sm">
        <div class="flex items-center justify-between mb-1">
          <p class="text-xs text-slate-500">
            Total Scan
          </p>
          <UIcon
            name="i-heroicons-camera"
            class="h-4 w-4 text-slate-400"
          />
        </div>
        <p class="text-2xl font-semibold text-slate-900">
          {{ totalScans }}
        </p>
      </UCard>

      <UCard class="border border-gray-200 bg-white shadow-sm">
        <div class="flex items-center justify-between mb-1">
          <p class="text-xs text-slate-500">
            Rata-rata Protein Dimakan
          </p>
          <UIcon
            name="i-heroicons-fire"
            class="h-4 w-4 text-slate-400"
          />
        </div>
        <p class="text-2xl font-semibold text-slate-900">
          {{ (avg.protein * 100).toFixed(0) }}%
        </p>
      </UCard>

      <UCard class="border border-gray-200 bg-white shadow-sm">
        <div class="flex items-center justify-between mb-1">
          <p class="text-xs text-slate-500">
            Rata-rata Karbo Dimakan
          </p>
          <UIcon
            name="i-heroicons-sparkles"
            class="h-4 w-4 text-slate-400"
          />
        </div>
        <p class="text-2xl font-semibold text-slate-900">
          {{ (avg.carbs * 100).toFixed(0) }}%
        </p>
      </UCard>

      <UCard class="border border-gray-200 bg-white shadow-sm">
        <div class="flex items-center justify-between mb-1">
          <p class="text-xs text-slate-500">
            Rata-rata Sayur Dimakan
          </p>
          <UIcon
            name="i-heroicons-leaf"
            class="h-4 w-4 text-slate-400"
          />
        </div>
        <p class="text-2xl font-semibold text-slate-900">
          {{ (avg.veg * 100).toFixed(0) }}%
        </p>
      </UCard>
    </div>

    <!-- Ranking card -->
    <UCard class="border border-gray-200 bg-white shadow-sm">
      <div class="flex items-center justify-between gap-3 mb-5">
        <div class="space-y-1">
          <h3 class="text-base font-semibold text-slate-900">
            Ranking makanan paling sering dimakan
          </h3>
          <p class="text-xs text-slate-500">
            Top 1 per kategori berdasarkan seluruh data scan yang tersedia.
          </p>
        </div>

        <div class="text-[11px] text-slate-500">
          Total scan
          <span class="ml-1 font-semibold text-slate-700">
            {{ totalScans }}
          </span>
        </div>
      </div>

      <div
        v-if="!totalScans"
        class="text-xs text-slate-500"
      >
        Belum ada data scan untuk menghitung ranking.
      </div>

      <ul
        v-else
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <li
          v-for="t in foodTypes"
          :key="t"
          :class="[
            'rounded-xl border p-4',
            'transition hover:shadow-sm',
            foodTypeSurfaceClass(t),
          ]"
        >
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {{ typeLabels[t] }}
            </span>

            <span
              :class="[
                'text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide',
                foodTypeClass(t),
              ]"
            >
              {{ t }}
            </span>
          </div>

          <div class="mt-4 flex items-center gap-3">
            <!-- thumbnail 1:1 -->
            <div
              class="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 ring-1 ring-slate-200 shrink-0"
            >
              <img
                v-if="topFoodByType[t]?.food.image"
                :src="topFoodByType[t]!.food.image!"
                :alt="topFoodByType[t]!.food.name"
                class="w-full h-full object-cover"
                loading="lazy"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-xs font-semibold text-slate-500"
              >
                {{ topFoodByType[t]?.food.name?.[0] ?? '-' }}
              </div>
            </div>

            <div class="min-w-0">
              <p class="text-sm font-semibold text-slate-900 truncate">
                {{ topFoodByType[t]?.food.name ?? '-' }}
              </p>
              <p class="text-[11px] text-slate-500">
                <span v-if="topFoodByType[t]">
                  {{ topFoodByType[t]!.count }}x
                </span>
                <span v-else>-</span>
              </p>
            </div>
          </div>
        </li>
      </ul>
    </UCard>

  </div>
</template>
