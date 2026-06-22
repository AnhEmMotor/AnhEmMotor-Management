import request from "@/utils/http";
import type {
  Supplier,
  SupplierList,
  PartnerType,
  SupplierStatistics,
} from "@/domain/supplier/supplier.types";

export const SupplierApi = {
  getList(params: any) {
    const { current, size, ...rest } = params;
    return request.get<SupplierList>({
      url: "/api/v1/Supplier",
      params: {
        Page: current,
        PageSize: size,
        ...rest,
      },
    });
  },

  getById(id: number) {
    return request.get<Supplier>({
      url: `/api/v1/Supplier/${id}`,
    });
  },

  create(data: Partial<Supplier>) {
    return request.post<Supplier>({
      url: "/api/v1/Supplier",
      data,
    });
  },

  update(id: number, data: Partial<Supplier>) {
    return request.put<Supplier>({
      url: `/api/v1/Supplier/${id}`,
      data,
    });
  },

  delete(id: number) {
    return request.del({
      url: `/api/v1/Supplier/${id}`,
    });
  },

  restore(id: number) {
    return request.post<Supplier>({
      url: `/api/v1/Supplier/restore/${id}`,
    });
  },

  deleteMany(ids: number[]) {
    return request.del({
      url: "/api/v1/Supplier/delete-many",
      data: { ids },
    });
  },

  restoreMany(ids: number[]) {
    return request.post({
      url: "/api/v1/Supplier/restore-many",
      data: { ids },
    });
  },

  updateStatus(id: number, status: boolean) {
    return request.patch<Supplier>({
      url: `/api/v1/Supplier/${id}/status`,
      data: { status },
    });
  },

  updateStatusMany(items: Array<{ id: number; status: boolean }>) {
    return request.patch({
      url: "/api/v1/Supplier/update-status-many",
      data: { items },
    });
  },

  getPartnerTypes() {
    return request.get<PartnerType[]>({
      url: "/api/v1/Supplier/partner-types",
    });
  },

  getPurchaseHistory(supplierId: number, params: any) {
    const { current, size, ...rest } = params;
    return request.get({
      url: `/api/v1/Supplier/${supplierId}/purchase-history`,
      params: {
        Page: current,
        PageSize: size,
        ...rest,
      },
    });
  },

  getStatistics() {
    return request.get<SupplierStatistics>({
      url: "/api/v1/Supplier/statistics",
    });
  },

  exportExcel(params: any) {
    return request.get<Blob>({
      url: "/api/v1/Supplier/export",
      params,
      responseType: "blob",
    });
  },
};
