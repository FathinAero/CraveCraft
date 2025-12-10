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

  const fetchByDate = async (date: string) => {
    loading.value = true

    const { data, error } = await client
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

    if (!error && data) {
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
    }

    loading.value = false
    return schedule.value
  }

  return { schedule, loading, fetchByDate }
}
