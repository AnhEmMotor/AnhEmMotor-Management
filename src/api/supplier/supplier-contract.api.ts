import request from '@/common/utils/http';
import type { PagedResult } from '@/types/api';
import type {
  SupplierContractAuditLogDto,
  SupplierContractDto,
  SupplierContractListParams,
  SupplierContractMutation,
  SupplierContractStatisticsResponse,
  SupplierContractStatus,
} from '@/domain/supplier/contract.types';

export type {
  SupplierContractDto,
  SupplierContractListParams,
  SupplierContractStatisticsResponse,
} from '@/domain/supplier/contract.types';

export const SupplierContractApi = {
  getList(params: SupplierContractListParams) {
    const { current, size, filters, sorts, ...rest } = params;
    return request.get<PagedResult<SupplierContractDto>>({
      url: '/api/v1/SupplierContracts',
      params: {
        Page: current,
        PageSize: size,
        Filters: filters,
        Sorts: sorts,
        ...rest,
      },
    });
  },

  getById(id: string) {
    return request.get<SupplierContractDto>({
      url: `/api/v1/SupplierContracts/${id}`,
    });
  },

  getAuditLogs(id: string) {
    return request.get<SupplierContractAuditLogDto[]>({
      url: `/api/v1/SupplierContracts/${id}/audit-logs`,
    });
  },

  getDeletedList(params: SupplierContractListParams) {
    const { current, size, filters, sorts, ...rest } = params;
    return request.get<PagedResult<SupplierContractDto>>({
      url: '/api/v1/SupplierContracts/deleted',
      params: {
        Page: current,
        PageSize: size,
        Filters: filters,
        Sorts: sorts,
        ...rest,
      },
    });
  },

  create(data: SupplierContractMutation) {
    return request.post<SupplierContractDto>({
      url: '/api/v1/SupplierContracts',
      data,
    });
  },

  update(id: string, data: SupplierContractMutation) {
    return request.put<SupplierContractDto>({
      url: `/api/v1/SupplierContracts/${id}`,
      data,
    });
  },

  updateStatus(id: string, data: { status: SupplierContractStatus }) {
    return request.put<SupplierContractDto>({
      url: `/api/v1/SupplierContracts/${id}`,
      data,
    });
  },

  uploadFile(id: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return request.post<{ contractFilePath: string }>({
      url: `/api/v1/SupplierContracts/${id}/file`,
      data: formData,
    });
  },

  delete(id: string) {
    return request.del({
      url: `/api/v1/SupplierContracts/${id}`,
    });
  },

  restore(id: string) {
    return request.post<SupplierContractDto>({
      url: `/api/v1/SupplierContracts/restore/${id}`,
    });
  },

  getStatistics() {
    return request.get<SupplierContractStatisticsResponse>({
      url: '/api/v1/SupplierContracts/statistics',
    });
  },

  getSuppliersForSelect() {
    return request.get<{ id: number; name: string }[]>({
      url: '/api/v1/SupplierContracts/suppliers-for-select',
    });
  },
};
