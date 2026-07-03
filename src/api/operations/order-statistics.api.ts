import request from "@/common/utils/http";

export interface HourlyOrderData {
  hour: string;
  count: number;
}

export interface ExceptionOrder {
  id: number;
  customerName: string;
  issue: string;
  type: string;
}

export interface OrderStatisticsResponse {
  pendingOrders: number;
  slaDelayed: number;
  paymentErrors: number;
  returnRequests: number;
  completedToday: number;
  targetToday: number;
  hourlyData: HourlyOrderData[];
  exceptionOrders: ExceptionOrder[];
}

export const orderStatisticsApi = {
  getStatistics() {
    return request.get<OrderStatisticsResponse>({
      url: "/api/v1/statistics/order-statistics",
    });
  },
};
