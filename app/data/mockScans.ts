import type { Scan, School, Scanner, Food } from '~/types/scan'

const schools: School[] = [
  { id: 1, name: 'SDN 01 Contoh' },
  { id: 2, name: 'SMPN 02 Contoh' },
]

const scanners: Scanner[] = [
  { id: 1, name: 'Scanner Kantin Lantai 1', schoolId: 1, school: schools[0] },
  { id: 2, name: 'Scanner Kantin Lantai 2', schoolId: 1, school: schools[0] },
  { id: 3, name: 'Scanner Utama', schoolId: 2, school: schools[1] },
]

const foods: Food[] = [
  { id: 1, name: 'Nasi Putih', type: 'carbs' },
  { id: 2, name: 'Ayam Goreng', type: 'protein' },
  { id: 3, name: 'Tumis Kangkung', type: 'veg' },
  { id: 4, name: 'Semangka', type: 'fruit' },
]

export const mockScans: Scan[] = [
  {
    id: 101,
    scannerId: 1,
    protein: 0.8,
    carbs: 0.9,
    veg: 0.5,
    fruit: 0.3,
    createdAt: '2025-11-20T07:30:00Z',
    scanner: scanners[0],
    foods: [foods[0], foods[1], foods[2], foods[3]],
  },
  {
    id: 102,
    scannerId: 2,
    protein: 0.4,
    carbs: 0.6,
    veg: 0.2,
    fruit: 0.1,
    createdAt: '2025-11-20T08:15:00Z',
    scanner: scanners[1],
    foods: [foods[0], foods[1]],
  },
  {
    id: 103,
    scannerId: 3,
    protein: 0.7,
    carbs: 0.5,
    veg: 0.4,
    fruit: 0.9,
    createdAt: '2025-11-21T09:00:00Z',
    scanner: scanners[2],
    foods: [foods[0], foods[2], foods[3]],
  },
]