export interface Brand {
  id: number
  name: string
  origin: string
  logoUrl: string
  description: string
  deletedAt?: string
}

export interface BrandList {
  items: Brand[]
  totalCount: number
}

export interface BrandFilters {
  name?: string
  origin?: string
}

export interface BrandStatisticsResponse {
  totalBrands: number
  activeBrandsCount: number
  inactiveBrandsCount: number
  deletedBrandsCount: number
}

export interface ImportBrandResult {
  successCount: number
  failedCount: number
  errorFileUrl?: string
  errorFileWithReasonUrl?: string
}
