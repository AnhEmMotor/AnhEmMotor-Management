import request from '@/common/utils/http';

enum Api {
  PublicConfig = '/api/v1/analytics/public-config',
  Overview = '/api/v1/analytics/overview',
  Daily = '/api/v1/analytics/daily',
  Sources = '/api/v1/analytics/sources',
  Pages = '/api/v1/analytics/pages',
  PageTitles = '/api/v1/analytics/pages/titles',
  OperatingSystems = '/api/v1/analytics/operating-systems',
  Browsers = '/api/v1/analytics/browsers',
  Devices = '/api/v1/analytics/devices',
  Realtime = '/api/v1/analytics/realtime',
}

export interface Ga4PublicConfig {
  enabled: boolean;
  storeMeasurementId: string;
  managementMeasurementId: string;
}

export interface Ga4Overview {
  startDate: string;
  endDate: string;
  sessions: number;
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  screenPageViews: number;
  engagementRate: number;
  averageSessionDuration: number;
  keyEvents: number;
}

export interface Ga4DimensionRow {
  label: string;
  sessions: number;
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  screenPageViews: number;
  engagementRate: number;
  averageSessionDuration: number;
  keyEvents: number;
}

export interface Ga4Report {
  propertyId: string;
  startDate: string;
  endDate: string;
  rows: Ga4DimensionRow[];
  rowCount: number;
}

export interface Ga4RealtimeRow {
  label: string;
  activeUsers: number;
  screenPageViews: number;
}

export interface Ga4Realtime {
  activeUsers: number;
  screenPageViews: number;
  byMinute: Ga4RealtimeRow[];
  bySource: Ga4RealtimeRow[];
  byDevice: Ga4RealtimeRow[];
  retrievedAt: string;
}

const format = (date?: Date) => (date ? date.toISOString().slice(0, 10) : undefined);

export const getGa4PublicConfigApi = () => request.get<any>({ url: Api.PublicConfig });

export const getGa4OverviewApi = (from?: Date, to?: Date) =>
  request.get<any>({ url: Api.Overview, params: { from: format(from), to: format(to) } });

export const getGa4DailyApi = (from?: Date, to?: Date) =>
  request.get<any>({ url: Api.Daily, params: { from: format(from), to: format(to) } });

export const getGa4SourcesApi = (from?: Date, to?: Date, limit = 10) =>
  request.get<any>({ url: Api.Sources, params: { from: format(from), to: format(to), limit } });

export const getGa4PagesApi = (from?: Date, to?: Date, limit = 10) =>
  request.get<any>({ url: Api.Pages, params: { from: format(from), to: format(to), limit } });

export const getGa4PageTitlesApi = (from?: Date, to?: Date, limit = 10) =>
  request.get<any>({ url: Api.PageTitles, params: { from: format(from), to: format(to), limit } });

export const getGa4OperatingSystemsApi = (from?: Date, to?: Date) =>
  request.get<any>({ url: Api.OperatingSystems, params: { from: format(from), to: format(to) } });

export const getGa4BrowsersApi = (from?: Date, to?: Date) =>
  request.get<any>({ url: Api.Browsers, params: { from: format(from), to: format(to) } });

export const getGa4DevicesApi = (from?: Date, to?: Date) =>
  request.get<any>({ url: Api.Devices, params: { from: format(from), to: format(to) } });

export const getGa4RealtimeApi = () => request.get<any>({ url: Api.Realtime });
