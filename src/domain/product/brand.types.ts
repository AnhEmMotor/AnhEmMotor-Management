/**
 * Brand Domain Model
 */
export interface Brand {
  id: number
  name: string
  origin: string
  logoUrl: string
  description: string
}

/**
 * Brand List Response (Paginated)
 */
export interface BrandList {
  items: Brand[]
  totalCount: number
}

/**
 * Brand Filter Parameters
 */
export interface BrandFilters {
  name?: string
  origin?: string
}
