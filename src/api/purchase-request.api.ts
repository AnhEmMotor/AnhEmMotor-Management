import request from "@/utils/http";
import type {
  PurchaseRequestDetailResponse,
  PurchaseRequestList,
  CreatePurchaseRequest,
  UpdatePurchaseRequest,
  ApprovedPurchaseRequestDetailResponse,
} from "@/domain/purchase-request/request.types";

export const PurchaseRequestApi = {
  getList(params: any) {
    const { current, size, ...rest } = params;
    return request.get<PurchaseRequestList>({
      url: "/api/v1/purchase-requests",
      params: {
        Page: current,
        PageSize: size,
        ...rest,
      },
    });
  },

  getApprovedList(params: any) {
    const { current, size, ...rest } = params;
    return request.get<PurchaseRequestList>({
      url: "/api/v1/purchase-requests/approved",
      params: {
        Page: current,
        PageSize: size,
        ...rest,
      },
    });
  },

  getById(id: number) {
    return request.get<PurchaseRequestDetailResponse>({
      url: `/api/v1/purchase-requests/${id}`,
    });
  },

  getApprovedById(id: number, excludePurchaseOrderId?: number) {
    return request.get<ApprovedPurchaseRequestDetailResponse>({
      url: `/api/v1/purchase-requests/approved/${id}`,
      params: { excludePurchaseOrderId },
    });
  },

  create(data: CreatePurchaseRequest) {
    return request.post<PurchaseRequestDetailResponse>({
      url: "/api/v1/purchase-requests",
      data,
    });
  },

  update(id: number, data: Omit<UpdatePurchaseRequest, "id">) {
    return request.put<PurchaseRequestDetailResponse>({
      url: `/api/v1/purchase-requests/${id}`,
      data,
    });
  },

  delete(id: number) {
    return request.del({
      url: `/api/v1/purchase-requests/${id}`,
    });
  },

  send(id: number) {
    return request.post<void>({
      url: `/api/v1/purchase-requests/${id}/send`,
    });
  },

  approveReject(id: number, status: string) {
    return request.patch<void>({
      url: `/api/v1/purchase-requests/${id}/status`,
      data: { status },
    });
  },

  getStatuses() {
    return request.get<Record<string, string>>({
      url: "/api/v1/purchase-requests/status",
    });
  },

  getAuditLogs(id: number) {
    return request.get<any[]>({
      url: `/api/v1/purchase-requests/${id}/audit-logs`,
    });
  },

  deleteMany(ids: number[]) {
    return request.del({
      url: "/api/v1/purchase-requests/delete-many",
      data: { ids },
    });
  },

  cloneMany(ids: number[]) {
    return request.post<number>({
      url: "/api/v1/purchase-requests/clone-many",
      data: { ids },
    });
  },

  restore(id: number) {
    return request.post<void>({
      url: `/api/v1/purchase-requests/restore/${id}`,
    });
  },

  restoreMany(ids: number[]) {
    return request.post<number>({
      url: "/api/v1/purchase-requests/restore-many",
      data: { ids },
    });
  },

  getDeletedList(params: any) {
    const { current, size, ...rest } = params;
    return request.get<PurchaseRequestList>({
      url: "/api/v1/purchase-requests/deleted",
      params: {
        Page: current,
        PageSize: size,
        ...rest,
      },
    });
  },

  exportExcel(params: any) {
    return request.get<Blob>({
      url: "/api/v1/purchase-requests/export",
      params,
      responseType: "blob",
    });
  },

  importExcel(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return request.post<Blob>({
      url: "/api/v1/purchase-requests/import",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      responseType: "blob", // To handle the error file if returned
    });
  },

  downloadImportTemplate() {
    return request.get<Blob>({
      url: "/api/v1/purchase-requests/import-template",
      responseType: "blob",
    });
  },
};
