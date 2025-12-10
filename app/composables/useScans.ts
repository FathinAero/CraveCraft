import { computed } from 'vue'
import type { Scan, ScanDb } from '~/types/scan'
import { mapScanDbToScan } from '~/types/scan'

export function useScans() {
  const client = useSupabaseClient()

  const scans = useState<Scan[]>('scans', () => [])
  const loading = useState<boolean>('scans_loading', () => false)
  const error = useState<string | null>('scans_error', () => null)

  const fetchScans = async (opts?: { limit?: number }) => {
    loading.value = true
    error.value = null

    const limit = opts?.limit ?? 50

    const { data, error: err } = await client
      .from('scans')
      .select(`
        id,
        scanner_id,
        protein,
        carbs,
        veg,
        fruit,
        created_at,
        scanner:scanner_id (
          id,
          name,
          school_id,
          school:school_id (
            id,
            name
          )
        ),
        food_scans (
          food:food_id (
            id,
            name,
            type
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (err) {
      error.value = err.message
      scans.value = []
    } else {
      scans.value = ((data ?? []) as ScanDb[]).map(mapScanDbToScan)
    }

    loading.value = false
    return scans.value
  }

  const getById = (id: number) =>
    computed(() => scans.value.find((s) => s.id === id) ?? null)

  return {
    scans,
    loading,
    error,
    fetchScans,
    getById,
  }
}
