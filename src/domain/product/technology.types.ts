/**
 * Technology Domain Model
 */
export interface Technology {
  id: number
  name: string
  defaultTitle?: string
  defaultDescription?: string
  defaultImageUrl?: string
  categoryId?: number
  brandId?: number
  categoryName?: string
}

export interface ProductTechnology {
  productId: number
  technologyId: number
  displayOrder: number
  customTitle?: string
  customDescription?: string
  customImageUrl?: string
  technology?: Technology
}
