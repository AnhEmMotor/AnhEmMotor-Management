export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  imageUrl: string;
  isActive: boolean;
  parentId: number | null;
  description: string;
  productCount: number;
  inventoryQty?: number;
  categoryGroup?: string;
  managementType?: string;
  maxPurchaseQuantity?: number | null;
}

export interface ProductCategoryList {
  items: ProductCategory[];
  totalCount: number;
}

export interface ProductManagementType {
  value: string;
  text: string;
}

export enum CategoryTab {
  PRODUCT = "product",
  VEHICLE = "vehicle",
}
