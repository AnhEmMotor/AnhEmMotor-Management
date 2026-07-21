import request from "@/common/utils/http";
import type { PagedResult } from "@/types/api/paged";
import type {
  WarrantyTerm,
  WarrantyTermList,
  WarrantyTermStatisticsResponse,
  WarrantyTermStatus,
} from "@/domain/warranty/warranty-category.types";

export const WarrantyTermApi = {
  getList(params: any) {
    const { current, size, ...rest } = params;
    return request.get<PagedResult<WarrantyTerm>>({
      url: "/api/v1/WarrantyTerms",
      params: {
        Page: current,
        PageSize: size,
        ...rest,
      },
    });
  },
  getById(id: number) {
    return request.get<WarrantyTerm>({
      url: `/api/v1/WarrantyTerms/${id}`,
    });
  },
  getStatistics() {
    return request.get<WarrantyTermStatisticsResponse>({
      url: "/api/v1/WarrantyTerms/statistics",
    });
  },
  create(data: Partial<WarrantyTerm>) {
    return request.post<number>({
      url: "/api/v1/WarrantyTerms",
      data,
    });
  },
  update(id: number, data: Partial<WarrantyTerm>) {
    return request.put<boolean>({
      url: `/api/v1/WarrantyTerms/${id}`,
      data,
    });
  },
  delete(id: number) {
    return request.del({
      url: `/api/v1/WarrantyTerms/${id}`,
    });
  },
  async getBrandsForSelect(): Promise<{ id: number; name: string }[]> {
    // Fallback to BrandApi-style endpoint or reuse existing BrandApi
    // For now return stub — will be connected when backend is ready
    return [];
  },
};
