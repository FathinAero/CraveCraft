export interface School {
  id: number
  name: string
}

export interface Scanner {
  id: number
  name: string
  schoolId: number | null
  school?: School | null
}

export type FoodType = 'protein' | 'carbs' | 'veg' | 'fruit'

export interface Food {
  id: number
  name: string
  type: FoodType
  image?: string | null
}


export interface Scan {
  id: number
  scannerId: number | null
  protein: number
  carbs: number
  veg: number
  fruit: number
  createdAt: string
  scanner?: Scanner | null
  foods?: Food[]
}

/** Shape hasil select Supabase (dengan relasi) */
export type ScanDb = {
  id: number
  scanner_id: number | null
  protein: number | null
  carbs: number | null
  veg: number | null
  fruit: number | null
  created_at: string
  scanner?: {
    id: number
    name: string
    school_id: number | null
    school?: School | null
  } | null
  food_scans?: {
    food?: Food | null
  }[]
}

export function mapScanDbToScan(row: ScanDb): Scan {
  return {
    id: row.id,
    scannerId: row.scanner_id,
    protein: row.protein ?? 0,
    carbs: row.carbs ?? 0,
    veg: row.veg ?? 0,
    fruit: row.fruit ?? 0,
    createdAt: row.created_at,
    scanner: row.scanner
      ? {
          id: row.scanner.id,
          name: row.scanner.name,
          schoolId: row.scanner.school_id,
          school: row.scanner.school ?? null,
        }
      : null,
    foods: (row.food_scans ?? [])
      .map((fs) => fs.food)
      .filter(Boolean) as Food[],
  }
}
