import request from "@/common/utils/http";

export interface LogisticsDashboardResponse {
  totalShipments: number;
  inTransit: number;
  delivered: number;
  pending: number;
  carriers: Array<{ id: number; name: string; code: string }>;
}

export const logisticsDashboardApi = {
  getOverview() {
    return request.get<LogisticsDashboardResponse>({
      url: "/api/v1/logistics/dashboard",
    });
  },
  getCarriers() {
    return request.get<Array<{ id: number; name: string; code: string }>>({
      url: "/api/v1/logistics/carriers",
    });
  },
  updateCarrier(id: number, data: { name?: string; code?: string }) {
    return request.put({
      url: `/api/v1/logistics/carriers/${id}`,
      data,
    });
  },
  testCarrierConnection(id: number) {
    return request.post({
      url: `/api/v1/logistics/carriers/${id}/test-connection`,
    });
  },
};
