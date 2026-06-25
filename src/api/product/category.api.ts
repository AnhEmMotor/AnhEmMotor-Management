import request from "@/common/utils/http";
import type {
  ProductCategory,
  ProductCategoryList,
  ProductManagementType,
} from "@/domain/product/category.types";

export const CategoryApi = {
  getList(params: any) {
    const { current, size, ...rest } = params;
    return request.get<ProductCategoryList>({
      url: "/api/v1/ProductCategory",
      params: {
        Page: current,
        PageSize: size,
        ...rest,
      },
    });
  },

  getById(id: number) {
    return request.get<ProductCategory>({
      url: `/api/v1/ProductCategory/${id}`,
    });
  },

  create(data: Partial<ProductCategory>) {
    return request.post<ProductCategory>({
      url: "/api/v1/ProductCategory",
      data,
    });
  },

  update(id: number, data: Partial<ProductCategory>) {
    return request.put<ProductCategory>({
      url: `/api/v1/ProductCategory/${id}`,
      data,
    });
  },

  delete(id: number) {
    return request.del({
      url: `/api/v1/ProductCategory/${id}`,
    });
  },

  getStats() {
    return request.get<any>({
      url: "/api/v1/ProductCategory/stats",
    });
  },

  getManagementTypes() {
    return request.get<ProductManagementType[]>({
      url: "/api/v1/ProductCategory/management-types",
    });
  },

  export(params: any) {
    return request.get<Blob>({
      url: "/api/v1/ProductCategory/export",
      params,
      responseType: "blob",
    });
  },
};
