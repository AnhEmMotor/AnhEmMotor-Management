export interface Product {
  id: number
  name: string
  category_id: number
  category: string
  brand_id: number
  brand: string
  description: string
  weight: number
  dimensions: string
  origin: string
  unit: string
  cover_image_url: string
  stock: number
  inventory_status: string
  status_id: string
  engine_type?: string
  max_power?: string
  fuel_capacity?: number
  fuel_consumption?: string
  variants: any[]
  product_technologies?: any[]
}

export interface ProductList {
  items: Product[]
  totalCount: number
}
