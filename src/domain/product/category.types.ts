export interface ProductCategory {
  id: number
  name: string
  slug: string
  imageUrl: string
  isActive: boolean
  parentId: number | null
  description: string
  productCount: number
  categoryGroup?: string
}

export interface ProductCategoryList {
  items: ProductCategory[]
  totalCount: number
}

export enum CategoryTab {
  PRODUCT = 'product',
  VEHICLE = 'vehicle'
}
