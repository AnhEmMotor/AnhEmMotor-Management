import request from '@/common/utils/http';

enum Api {
  GoogleAdsMetrics = '/api/v1/Marketing/google-ads/campaigns',
}

export const getGoogleAdsMetricsApi = () => {
  return request.get<any>({ url: Api.GoogleAdsMetrics });
};
