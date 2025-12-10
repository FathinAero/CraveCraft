import type { Food } from '~/types/scan'

export type FoodSchedule = {
  id: number
  scheduleDate: string
  protein?: Food | null
  carbs?: Food | null
  veg?: Food | null
  fruit?: Food | null
}

type FoodScheduleDb = {
  id: number
  schedule_date: string
  protein?: Food | null
  carbs?: Food | null
  veg?: Food | null
  fruit?: Food | null
}

export function useFoodSchedule() {
  const client = useSupabaseClient()

  const schedule = useState<FoodSchedule | null>('food_schedule', () => null)
  const loading = useState<boolean>('food_schedule_loading', () => false)
  const error = useState<string | null>('food_schedule_error', () => null)

  const fetchByDate = async (date: string) => {
    loading.value = true
    error.value = null

    const { data, error: err } = await client
      .from('food_schedule')
      .select(`
        id,
        schedule_date,
        protein:protein_id ( id, name, type ),
        carbs:carbs_id ( id, name, type ),
        veg:veg_id ( id, name, type ),
        fruit:fruit_id ( id, name, type )
      `)
      .eq('schedule_date', date)
      .maybeSingle()

    if (!err && data) {
      const row = data as FoodScheduleDb
      schedule.value = {
        id: row.id,
        scheduleDate: row.schedule_date,
        protein: row.protein ?? null,
        carbs: row.carbs ?? null,
        veg: row.veg ?? null,
        fruit: row.fruit ?? null,
      }
    } else {
      schedule.value = null
      if (err) error.value = err.message
    }

    loading.value = false
    return schedule.value
  }

  const saveByDate = async (payload: {
    scheduleDate: string
    proteinId?: number | null
    carbsId?: number | null
    vegId?: number | null
    fruitId?: number | null
  }) => {
    loading.value = true
    error.value = null

    const body = {
      schedule_date: payload.scheduleDate,
      protein_id: payload.proteinId ?? null,
      carbs_id: payload.carbsId ?? null,
      veg_id: payload.vegId ?? null,
      fruit_id: payload.fruitId ?? null,
    }

    // lebih aman dari upsert: update kalau ada id, insert kalau belum
    const hasExisting = !!schedule.value?.id

    const res = hasExisting
      ? await client.from('food_schedule').update(body).eq('id', schedule.value!.id)
      : await client.from('food_schedule').insert(body)

    if (res.error) {
      error.value = res.error.message
      loading.value = false
      throw res.error
    }

    const fresh = await fetchByDate(payload.scheduleDate)
    loading.value = false
    return fresh
  }

  return { schedule, loading, error, fetchByDate, saveByDate }
}
