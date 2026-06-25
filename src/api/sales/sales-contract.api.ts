import request from "@/common/utils/http";
import type {
  SalesContractListDto,
  SalesContractDetailDto,
  CreateSalesContractRequest,
  UpdateSalesContractRequest,
  UpdateContractStatusRequest,
} from "@/domain/sales/contract.types";

export const SalesContractApi = {
  getList(params: {
    current: number;
    size: number;
    keyword?: string;
    status?: string;
    vehicleModel?: string;
  }) {
    const { current, size, ...rest } = params;
    return request.get<{ items: SalesContractListDto[]; total: number }>({
      url: "/api/contracts/sales",
      params: { Page: current, PageSize: size, ...rest },
    });
  },

  getById(id: string) {
    return request.get<SalesContractDetailDto>({
      url: `/api/contracts/sales/${id}`,
    });
  },

  create(data: CreateSalesContractRequest) {
    return request.post<SalesContractDetailDto>({
      url: "/api/contracts/sales",
      data,
    });
  },

  update(id: string, data: UpdateSalesContractRequest) {
    return request.put<SalesContractDetailDto>({
      url: `/api/contracts/sales/${id}`,
      data,
    });
  },

  delete(id: string) {
    return request.del({
      url: `/api/contracts/sales/${id}`,
    });
  },

  uploadScannedFile(contractId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return request.post<{ scannedFileUrl: string }>({
      url: `/api/contracts/sales/${contractId}/scanned-file`,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updateStatus(contractId: string, status: UpdateContractStatusRequest) {
    return request.patch<SalesContractDetailDto>({
      url: `/api/contracts/sales/${contractId}/status`,
      data: status,
    });
  },

  getStatistics() {
    return request.get<{
      draftCount: number;
      overdueCount: number;
      signedCount: number;
    }>({
      url: "/api/contracts/sales/statistics",
    });
  },
};
