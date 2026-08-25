import request from '@/common/utils/http';

export interface BasicFetchResult<T> {
  items: T[];
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  totalCount?: number;
}

enum Api {
  ProductViews = '/api/v1/Marketing/product-views',
}

export interface VisitorTrackingParams {
  pageNumber?: number;
  pageSize?: number;
  searchKeyword?: string;
  from?: string;
  to?: string;
}

export const getVisitorTrackingApi = (params?: VisitorTrackingParams) => {
  return request.get<BasicFetchResult<any>>({ url: Api.ProductViews, params });
};
