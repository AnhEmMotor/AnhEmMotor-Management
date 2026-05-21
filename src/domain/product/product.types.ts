export interface VariantColor {
  id?: number
  name?: string
  code?: string
  image?: string
  color_name?: string
  color_code?: string
  cover_image_url?: string
}

export interface ProductVariant {
  id: number | null
  price: number | null
  variant_name: string
  cover_image_url?: string
  color_name: string
  color_code: string
  colors: VariantColor[]
  sku: string
  photo_collection: string[]
  optionValues?: Record<string, string>
  option_rows?: Array<{ key: string; value: string }>
  url_slug?: string
  stock_quantity?: number

  // --- Spec Overrides for Vehicle Variants ---
  weight?: number | null
  dimensions?: string
  wheelbase?: number | null
  seat_height?: number | null
  ground_clearance?: number | null
  fuel_capacity?: number | null
  tire_size?: string
  showSpecs?: boolean
}

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
  variants: ProductVariant[]
  product_technologies?: any[]
  children?: any[]
  isVariant?: boolean
  sku?: string

  // --- SEO Fields ---
  meta_title?: string
  meta_description?: string
  short_description?: string

  // --- Spare Parts Technical Specifications ---
  material?: string
  warranty_period?: string
  compatible_vehicle_model_ids?: number[]
  tire_size?: string

  // --- Quality Standards ---
  std_dot?: boolean
  std_ece?: boolean
  std_snell?: boolean
  std_jis?: boolean
  other_standards?: string

  // --- Vehicle Specific Specifications ---
  engine_type?: string
  max_power?: string
  fuel_capacity?: number
  fuel_consumption?: string
  wheelbase?: number
  seat_height?: number
  ground_clearance?: number
  oil_capacity?: number
  transmission_type?: string
  starter_system?: string
  max_torque?: string
  displacement?: number
  bore_stroke?: string
  compression_ratio?: string
  fuel_system?: string
  frame_type?: string
  front_suspension?: string
  rear_suspension?: string
  front_tire_size?: string
  rear_tire_size?: string
  front_brake?: string
  rear_brake?: string
  battery_type?: string
  lighting_system?: string
  dashboard_type?: string
  highlights?: string
  highlights_list?: any[]
}

export interface ProductList {
  items: Product[]
  totalCount: number
}

export interface ProductVariantLiteForInput {
  id: number
  productId: number
  displayName: string
  coverImageUrl: string
  price: number
  categoryId: number
}

export interface ProductVariantLiteForInputList {
  items: ProductVariantLiteForInput[]
  totalCount: number
}
