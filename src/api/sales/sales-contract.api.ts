import request from '@/common/utils/http';
import type {
  SalesContractListDto,
  SalesContractDetailDto,
  CreateSalesContractRequest,
  UpdateSalesContractRequest,
  UpdateContractStatusRequest,
} from '@/domain/sales/contract.types';

export const SalesContractApi = {
  getList(params: {
    current: number;
    size: number;
    keyword?: string;
    status?: string;
    vehicleModel?: string;
  }) {
    const { current, size, ...rest } = params;
    const filters = [
      rest.status ? `Status==${rest.status}` : '',
      rest.vehicleModel ? `VehicleModel@=*${rest.vehicleModel}` : '',
    ].filter(Boolean);
    return request.get<{ items: SalesContractListDto[]; totalCount: number }>({
      url: '/api/v1/contracts/sales',
      params: {
        Page: current,
        PageSize: size,
        keyword: rest.keyword,
        Filters: filters.length > 0 ? filters.join(',') : undefined,
      },
    });
  },

  getById(id: string) {
    return request.get<SalesContractDetailDto>({
      url: `/api/v1/contracts/sales/${id}`,
    });
  },

  create(data: CreateSalesContractRequest) {
    return request.post<SalesContractDetailDto>({
      url: '/api/v1/contracts/sales',
      data,
    });
  },

  update(id: string, data: UpdateSalesContractRequest) {
    return request.put<SalesContractDetailDto>({
      url: `/api/v1/contracts/sales/${id}`,
      data,
    });
  },

  delete(id: string) {
    return request.del({
      url: `/api/v1/contracts/sales/${id}`,
    });
  },

  uploadScannedFile(contractId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return request.post<{ scannedFileUrl: string }>({
      url: `/api/v1/contracts/sales/${contractId}/scanned-file`,
      data: formData,
    });
  },

  updateStatus(contractId: string, status: UpdateContractStatusRequest) {
    return request.patch<SalesContractDetailDto>({
      url: `/api/v1/contracts/sales/${contractId}/status`,
      data: status,
    });
  },

  submitForApproval(contractId: string) {
    return request.post<SalesContractDetailDto>({
      url: `/api/v1/contracts/sales/${contractId}/submit-for-approval`,
    });
  },

  approve(contractId: string) {
    return request.post<SalesContractDetailDto>({
      url: `/api/v1/contracts/sales/${contractId}/approve`,
    });
  },

  getStatistics() {
    return request.get<{
      draftCount: number;
      pendingApprovalCount: number;
      overdueCount: number;
      signedCount: number;
    }>({
      url: '/api/v1/contracts/sales/statistics',
    });
  },
};
