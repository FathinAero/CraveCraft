<script setup lang="ts">
import type { Scan } from '~/types/scan'
import type { TableColumn } from '@nuxt/ui'

type ScanRow = Scan & {
  school: string
  scanner: string
}

const totalScans = computed(() => scans.value.length)

const { scans, fetchScans, loading, error } = useScans()

await useAsyncData('dashboard-scans', () => fetchScans({ limit: 50 }))

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

const recent = computed<Scan[]>(() =>
  [...scans.value]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 5),
)

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

const rows = computed(() =>
  scans.value.map((s) => ({
    ...s,
    school: s.scanner?.school?.name ?? '-',
    scanner: s.scanner?.name ?? '-',
  }))
)

const columns: TableColumn<ScanRow>[] = [
  { accessorKey: 'createdAt', header: 'Waktu' },
  { accessorKey: 'school', header: 'Sekolah' },
  { accessorKey: 'scanner', header: 'Scanner' },
  { accessorKey: 'protein', header: 'Protein' },
  { accessorKey: 'carbs', header: 'Karbo' },
  { accessorKey: 'veg', header: 'Sayur' },
  { accessorKey: 'fruit', header: 'Buah' },
]

const { schedule, fetchByDate } = useFoodSchedule()

const today = new Date().toISOString().slice(0, 10)
await useAsyncData('today-schedule', () => fetchByDate(today))

const tableUi = {
  th: 'text-xs font-medium text-slate-500 bg-gray-50',
  tr: 'border-b border-gray-200 hover:bg-gray-50',
  td: 'text-xs text-slate-700',
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

    <UCard class="border border-gray-200 bg-white shadow-sm">
      <div class="flex items-center justify-between mb-4 gap-2">
        <h3 class="text-sm font-medium text-slate-900">
          Scan Terbaru
        </h3>
        <UButton
          variant="ghost"
          color="gray"
          size="xs"
          to="/scans"
        >
          Lihat semua
        </UButton>
      </div>

      <UTable
        :data="rows"
        :columns="columns"
        :ui="tableUi"
      >
        <template #createdAt-cell="{ getValue }">
          {{ new Date(getValue() as string).toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }) }}
        </template>

        <template #protein-cell="{ getValue }">
          {{ ((getValue() as number) * 100).toFixed(0) }}%
        </template>
        <template #carbs-cell="{ getValue }">
          {{ ((getValue() as number) * 100).toFixed(0) }}%
        </template>
        <template #veg-cell="{ getValue }">
          {{ ((getValue() as number) * 100).toFixed(0) }}%
        </template>
        <template #fruit-cell="{ getValue }">
          {{ ((getValue() as number) * 100).toFixed(0) }}%
        </template>
      </UTable>
    </UCard>
  </div>
</template>