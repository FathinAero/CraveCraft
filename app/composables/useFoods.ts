import type { Food, FoodType } from '~/types/scan'

export function useFoods() {
  const client = useSupabaseClient()

  const foods = useState<Food[]>('foods', () => [])
  const loading = useState<boolean>('foods_loading', () => false)
  const error = useState<string | null>('foods_error', () => null)

  const fetchFoods = async () => {
    loading.value = true
    error.value = null

    const { data, error: err } = await client
      .from('food')
      .select('id, name, type, image')
      .order('name', { ascending: true })

    if (err) {
      error.value = err.message
      foods.value = []
    } else {
      foods.value = (data ?? []) as Food[]
    }

    loading.value = false
    return foods.value
  }

  const byType = (type: FoodType) =>
    computed(() => foods.value.filter(f => f.type === type))

  return { foods, loading, error, fetchFoods, byType }
}
