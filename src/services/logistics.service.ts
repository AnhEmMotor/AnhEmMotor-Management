import api from "@/common/utils/http";
import type { LogisticsDashboardResponse } from "@/domain/logistics/dashboard.types";

const API_BASE = "/api/logistics";

export const LogisticsService = {
  async getDashboard(range: string): Promise<LogisticsDashboardResponse> {
    return api.get<LogisticsDashboardResponse>({
      url: `${API_BASE}/dashboard`,
      params: { range },
    });
  },
};
