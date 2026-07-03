import request from "@/common/utils/http";
import * as LogisticsApis from "@/api/logistics";
import type { LogisticsDashboardResponse } from "@/domain/logistics/dashboard.types";

export const LogisticsService = {
  ...LogisticsApis,
  async getDashboard(range: string): Promise<LogisticsDashboardResponse> {
    const res = await request.get<LogisticsDashboardResponse>({
      url: "/api/v1/logistics/dashboard",
      params: { range },
    });
    return (res as any).data || res;
  },
};
