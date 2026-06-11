import api from '@/utils/http'
import type { LogisticsDashboardResponse } from '@/domain/logistics/dashboard.types'
import type { ShipmentTrackingResponse } from '@/domain/logistics/tracking.types'

const API_BASE = '/api/logistics'

export const LogisticsService = {
  async getDashboard(range: string): Promise<LogisticsDashboardResponse> {
    return api.get<LogisticsDashboardResponse>({
      url: `${API_BASE}/dashboard`,
      params: { range },
    })
  },

  async getTracking(search: string): Promise<ShipmentTrackingResponse> {
    return api.get<ShipmentTrackingResponse>({
      url: `${API_BASE}/tracking`,
      params: { search },
    })
  },
}
