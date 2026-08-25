import request from '@/common/utils/http';

export interface ProductInventoryVariant {
  variantId: number;
  inventoryQty: number;
}

export interface ProductInventorySnapshot {
  productId: number;
  inventoryQty: number;
  variants: ProductInventoryVariant[];
}

export interface ProductInventorySnapshotResponse {
  items: ProductInventorySnapshot[];
  totalCount: number;
}

export const inventoryApi = {
  getProductSnapshot() {
    return request.get<ProductInventorySnapshotResponse>({
      url: '/api/v1/InventoryReport',
      params: {
        pageNumber: 1,
        pageSize: 10000,
      },
    });
  },
};
