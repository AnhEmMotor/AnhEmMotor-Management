import * as LogisticsApis from "@/api/logistics";
import type { LogisticsDashboardResponse } from "@/domain/logistics/dashboard.types";

export const LogisticsService = {
  ...LogisticsApis,
  async getDashboard(_range: any): Promise<LogisticsDashboardResponse> {
    // TODO: Implement when backend endpoint is available
    throw new Error("Logistics dashboard API not implemented yet");
  },
};
