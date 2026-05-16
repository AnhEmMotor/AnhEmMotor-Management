/**
 * Product Category Domain Model
 */
export interface ProductCategory {
  id: number
  name: string
  slug: string
  imageUrl: string
  isActive: boolean
  sortOrder: number
  parentId: number | null
  description: string
  productCount: number
  categoryGroup?: string
}

/**
 * Category List Response
 */
export interface ProductCategoryList {
  items: ProductCategory[]
  totalCount: number
}

/**
 * Tab Types
 */
export enum CategoryTab {
  PRODUCT = 'product',
  VEHICLE = 'vehicle'
}
