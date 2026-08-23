import request from '@/common/utils/http';

export interface InventoryIndexResponse {
  summary: {
    totalStock: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
}

export const inventoryApi = {
  getIndex() {
    return request.get<InventoryIndexResponse>({
      url: '/api/v1/statistics/warehouse-report',
    });
  },
};
