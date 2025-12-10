<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Scan } from '~/types/scan'

type ScanRow = Scan & {
  school: string
  scanner: string
}

const { scans } = useScans()

// daftar sekolah unik
const schools = computed(() => {
  const map = new Map<number, string>()
  for (const s of scans.value) {
    map.set(s.scanner.school.id, s.scanner.school.name)
  }
  return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
})

const selectedSchoolId = ref<number | 'all'>('all')
const search = ref('')

// rows yang sudah difilter + di-flatten
const rows = computed<ScanRow[]>(() =>
  scans.value
    .filter((s) => {
      // filter sekolah
      if (selectedSchoolId.value !== 'all' &&
          s.scanner.school.id !== selectedSchoolId.value) {
        return false
      }

      // filter search (id, sekolah, scanner)
      if (!search.value) return true
      const q = search.value.toLowerCase()

      return (
        String(s.id).includes(q) ||
        s.scanner.school.name.toLowerCase().includes(q) ||
        s.scanner.name.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .map((s) => ({
      ...s,
      school: s.scanner.school.name,
      scanner: s.scanner.name,
    })),
)

const columns: TableColumn<ScanRow>[] = [
  { accessorKey: 'createdAt', header: 'Waktu' },
  { accessorKey: 'school', header: 'Sekolah' },
  { accessorKey: 'scanner', header: 'Scanner' },
  { accessorKey: 'protein', header: 'Protein' },
  { accessorKey: 'carbs', header: 'Karbo' },
  { accessorKey: 'veg', header: 'Sayur' },
  { accessorKey: 'fruit', header: 'Buah' },
  { accessorKey: 'actions', header: '' },
]

// Styling Tabel untuk Light Mode
const tableUi = {
  th: 'text-xs font-medium text-slate-500 bg-gray-50',
  tr: 'border-b border-gray-200 hover:bg-gray-50',
  td: 'text-xs text-slate-700',
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="space-y-1">
        <h2 class="text-xl font-semibold text-slate-900">
          Semua Scan
        </h2>
        <p class="text-sm text-slate-500">
          Daftar lengkap hasil pemindaian tray dari semua sekolah dan scanner.
        </p>
        <p class="text-xs text-slate-400">
          {{ rows.length }} scan ditemukan.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <UInput
          v-model="search"
          size="xs"
          placeholder="Cari ID scan / sekolah / scanner"
          icon="i-heroicons-magnifying-glass"
          class="w-full sm:w-64"
          :ui="{ icon: { trailing: { pointer: '' } } }" 
          color="gray"
        />

        <USelect
          v-model="selectedSchoolId"
          :options="[
            { label: 'Semua sekolah', value: 'all' },
            ...schools.map((s) => ({ label: s.name, value: s.id })),
          ]"
          size="xs"
          color="gray"
        />
      </div>
    </div>

    <UCard class="border border-gray-200 bg-white shadow-sm">
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

        <template #actions-cell="{ row }">
          <div class="flex justify-end">
            <UButton
              size="xs"
              variant="ghost"
              color="gray"
              :to="`/scans/${row.original.id}`"
            >
              Detail
            </UButton>
          </div>
        </template>
      </UTable>
    </UCard>
  </div>
</template>