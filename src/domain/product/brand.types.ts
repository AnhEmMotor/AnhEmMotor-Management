export interface Brand {
  id: number
  name: string
  origin: string
  logoUrl: string
  description: string
}

export interface BrandList {
  items: Brand[]
  totalCount: number
}

export interface BrandFilters {
  name?: string
  origin?: string
}
