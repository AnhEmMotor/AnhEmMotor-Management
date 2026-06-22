import request from "@/utils/http";

export const InventoryReportApi = {
  getSummary(params?: {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    month?: number;
    year?: number;
  }) {
    return request.get<any>({
      url: "/api/v1/InventoryReport",
      params,
    });
  },

  getDetail(variantId: number, colorId?: number | null) {
    const params: any = { variantId };
    if (colorId !== undefined && colorId !== null) {
      params.colorId = colorId;
    }
    return request.get<any>({
      url: "/api/v1/InventoryReport/details",
      params,
    });
  },

  export(params?: { searchTerm?: string; month?: number; year?: number }) {
    return request.get<Blob>({
      url: "/api/v1/InventoryReport/export",
      params,
      responseType: "blob",
    });
  },

  getLedger(params?: {
    searchQuery?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) {
    return request.get<any[]>({
      url: "/api/v1/InventoryLedgers",
      params,
    });
  },
};
