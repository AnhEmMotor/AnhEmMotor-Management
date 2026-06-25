import request from "@/common/utils/http";

export interface ServiceResponse {
  id: number;
  name: string;
  description?: string;
  basePrice: number;
  estimatedDurationMinutes?: number;
  categoryId: number;
  isActive: boolean;
}

export interface ServiceList {
  items: ServiceResponse[];
  totalCount: number;
}

export const ServiceApi = {
  getList(params?: any) {
    const { current, size, ...rest } = params || {};
    return request.get<ServiceList>({
      url: "/Services",
      params: {
        Page: current,
        PageSize: size,
        ...rest,
      },
    });
  },
  create(data: Omit<ServiceResponse, "id" | "isActive">) {
    return request.post<ServiceResponse>({
      url: "/Services",
      data,
    });
  },
  update(id: number, data: Partial<ServiceResponse>) {
    return request.put<ServiceResponse>({
      url: `/Services/${id}`,
      data,
    });
  },
};
