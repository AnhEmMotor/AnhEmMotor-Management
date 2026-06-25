import request from "@/common/utils/http";

export interface ServiceCategoryResponse {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  isActive: boolean;
  parentId?: number;
  serviceCount: number;
}

export interface ServiceCategoryList {
  items: ServiceCategoryResponse[];
  totalCount: number;
}

export const ServiceCategoryApi = {
  getList(params?: any) {
    const { current, size, ...rest } = params || {};
    return request.get<ServiceCategoryList>({
      url: "/ServiceCategories",
      params: {
        Page: current,
        PageSize: size,
        ...rest,
      },
    });
  },
  getById(id: number) {
    return request.get<ServiceCategoryResponse>({
      url: `/ServiceCategories/${id}`,
    });
  },
};
