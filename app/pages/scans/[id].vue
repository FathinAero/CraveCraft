<script setup lang="ts">
import type { Scan, FoodType } from '~/types/scan'

const route = useRoute()
const id = Number(route.params.id)

const { getById } = useScans()

// hasilnya computed<Scan | null>
const scan = getById(id)

const categories = computed(() => {
  if (!scan.value) return []

  return [
    { key: 'protein', label: 'Protein', value: scan.value.protein },
    { key: 'carbs', label: 'Karbohidrat', value: scan.value.carbs },
    { key: 'veg', label: 'Sayur', value: scan.value.veg },
    { key: 'fruit', label: 'Buah', value: scan.value.fruit },
  ]
})

const formattedDate = computed(() => {
  if (!scan.value) return ''
  return new Date(scan.value.createdAt).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
})

const lowestForScan = computed(() => {
  if (!scan.value) return null

  const list = [
    { key: 'protein', label: 'protein', value: scan.value.protein },
    { key: 'carbs', label: 'karbohidrat', value: scan.value.carbs },
    { key: 'veg', label: 'sayur', value: scan.value.veg },
    { key: 'fruit', label: 'buah', value: scan.value.fruit },
  ]

  return list.reduce((min, item) => (item.value < min.value ? item : min), list[0])
})

// Sedikit penyesuaian warna badge agar tetap kontras di mode terang
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
</script>

<template>
  <div class="space-y-6">
    <div
      v-if="!scan"
      class="space-y-3"
    >
      <h2 class="text-xl font-semibold text-slate-900">
        Scan tidak ditemukan
      </h2>
      <p class="text-sm text-slate-500">
        Data scan dengan ID tersebut tidak ada di dummy data.
      </p>
      <UButton
        to="/scans"
        size="xs"
        variant="ghost"
        color="gray"
      >
        Kembali ke daftar scan
      </UButton>
    </div>

    <div
      v-else
      class="space-y-6"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="space-y-1">
          <h2 class="text-xl font-semibold text-slate-900">
            Detail Scan #{{ scan.id }}
          </h2>
          <p class="text-sm text-slate-500">
            {{ formattedDate }} •
            {{ scan.scanner.school.name }} •
            {{ scan.scanner.name }}
          </p>

          <div
            v-if="lowestForScan && lowestForScan.value < 0.5"
            class="flex items-center gap-2 mt-2"
          >
            <UBadge
              color="warning"
              variant="subtle"
              size="sm"
              class="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
            >
              Konsumsi {{ lowestForScan.label }} rendah
            </UBadge>
            <span class="text-[11px] text-slate-500">
              Rata-rata sekitar
              {{ (lowestForScan.value * 100).toFixed(0) }}% untuk scan ini.
            </span>
          </div>
        </div>

        <UButton
          to="/scans"
          size="xs"
          variant="ghost"
          color="gray"
        >
          Kembali
        </UButton>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <UCard class="border border-gray-200 bg-white shadow-sm">
          <h3 class="text-sm font-medium mb-4 text-slate-900">
            Persentase dimakan per komponen
          </h3>

          <div class="space-y-4">
            <div
              v-for="cat in categories"
              :key="cat.key"
              class="space-y-1.5"
            >
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-600 font-medium capitalize">{{ cat.label }}</span>
                <span class="text-slate-900 font-semibold">{{ (cat.value * 100).toFixed(0) }}%</span>
              </div>
              <div class="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  class="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                  :style="{ width: `${cat.value * 100}%` }"
                />
              </div>
            </div>
          </div>
        </UCard>

        <UCard class="border border-gray-200 bg-white shadow-sm">
          <h3 class="text-sm font-medium mb-4 text-slate-900">
            Makanan dalam tray
          </h3>

          <ul class="space-y-3">
            <li
              v-for="food in scan.foods"
              :key="food.id"
              class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors -mx-2 px-3"
            >
              <span class="text-sm text-slate-700">{{ food.name }}</span>
              <span
                :class="[
                  'text-[10px] font-semibold px-2.5 py-0.5 rounded-md uppercase tracking-wide border border-transparent',
                  foodTypeClass(food.type),
                ]"
              >
                {{ food.type }}
              </span>
            </li>
          </ul>
        </UCard>
      </div>
    </div>
  </div>
</template>