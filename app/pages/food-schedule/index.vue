<script setup lang="ts">
const supabase = useSupabaseClient()

type FoodType = 'protein' | 'carbs' | 'veg' | 'fruit'
type FoodRow = { id: number; name: string; type: FoodType; image?: string | null }

const scheduleDate = ref<string>(new Date().toISOString().slice(0, 10))

const proteinId = ref<number | null>(null)
const carbsId = ref<number | null>(null)
const vegId = ref<number | null>(null)
const fruitId = ref<number | null>(null)

const { data: foods, pending: foodsPending } = await useAsyncData('foods', async () => {
  const { data, error } = await supabase
    .from('food')
    .select('id, name, type, image')
    .order('name')

  if (error) throw error
  return (data ?? []) as FoodRow[]
})

const makeItems = (type: FoodType) => computed(() =>
  (foods.value ?? [])
    .filter(f => f.type === type)
    .map(f => ({ label: f.name, value: f.id }))
)

const proteinItems = makeItems('protein')
const carbsItems = makeItems('carbs')
const vegItems = makeItems('veg')
const fruitItems = makeItems('fruit')

const saving = ref(false)
const saveError = ref<string | null>(null)

const handleSave = async () => {
  saving.value = true
  saveError.value = null

  try {
    // cek apakah schedule utk tanggal ini udah ada
    const { data: existing, error: checkErr } = await supabase
      .from('food_schedule')
      .select('id')
      .eq('schedule_date', scheduleDate.value)
      .maybeSingle()

    if (checkErr) throw checkErr

    const payload = {
      schedule_date: scheduleDate.value,
      protein_id: proteinId.value,
      carbs_id: carbsId.value,
      veg_id: vegId.value,
      fruit_id: fruitId.value,
    }

    const res = existing?.id
      ? await supabase.from('food_schedule').update(payload).eq('id', existing.id)
      : await supabase.from('food_schedule').insert(payload)

    if (res.error) throw res.error
  } catch (e: any) {
    saveError.value = e?.message ?? 'Gagal menyimpan jadwal'
  } finally {
    saving.value = false
  }
}


// Optional: biar gampang ngecek apakah fetch makanan beneran masuk
watchEffect(() => {
  if (!foodsPending.value) {
    // console.log('foods count:', foods.value?.length)
  }
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold">Food Schedule</h1>
      <p class="text-sm text-slate-500">
        Atur menu per tanggal untuk kebutuhan dashboard dan rekomendasi.
      </p>
    </div>

    <UCard class="max-w-5xl">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Tanggal -->
        <div class="lg:col-span-4">
          <label class="text-sm font-medium">Tanggal</label>
          <UInput
            v-model="scheduleDate"
            type="date"
            class="mt-2 w-full"
          />
        </div>

        <!-- Dropdowns -->
        <div class="lg:col-span-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-center gap-3">
              <span class="w-24 text-sm font-medium">Protein</span>
              <USelect
                v-model="proteinId"
                :items="proteinItems"
                :loading="foodsPending"
                placeholder="Pilih protein"
                size="lg"
                class="flex-1"
              />
            </div>

            <div class="flex items-center gap-3">
              <span class="w-24 text-sm font-medium">Karbo</span>
              <USelect
                v-model="carbsId"
                :items="carbsItems"
                :loading="foodsPending"
                placeholder="Pilih karbo"
                size="lg"
                class="flex-1"
              />
            </div>

            <div class="flex items-center gap-3">
              <span class="w-24 text-sm font-medium">Sayur</span>
              <USelect
                v-model="vegId"
                :items="vegItems"
                :loading="foodsPending"
                placeholder="Pilih sayur"
                size="lg"
                class="flex-1"
              />
            </div>

            <div class="flex items-center gap-3">
              <span class="w-24 text-sm font-medium">Buah</span>
              <USelect
                v-model="fruitId"
                :items="fruitItems"
                :loading="foodsPending"
                placeholder="Pilih buah"
                size="lg"
                class="flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 flex items-center justify-between">
        <p class="text-sm text-slate-500">
          Pilih 1 item tiap kategori untuk tanggal yang dipilih.
        </p>
        <UButton
          size="lg"
          :loading="saving"
          @click="handleSave"
        >
          Simpan Jadwal
        </UButton>

        <p v-if="saveError" class="mt-3 text-xs text-red-600">
          {{ saveError }}
        </p>

      </div>
    </UCard>
  </div>
</template>
