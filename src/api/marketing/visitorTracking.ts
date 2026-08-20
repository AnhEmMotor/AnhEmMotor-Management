import request from '@/common/utils/http';

export interface BasicFetchResult<T> {
  items: T[];
  total: number;
}

enum Api {
  ProductViews = '/api/v1/Marketing/product-views',
}

export const getVisitorTrackingApi = (params?: any) => {
  return request.get<BasicFetchResult<any>>({ url: Api.ProductViews, params });
};
