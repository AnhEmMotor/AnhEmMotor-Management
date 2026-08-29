import request from '@/common/utils/http';

export interface HourlyOrderData {
  hour: string;
  count: number;
  revenue: number;
}

export interface DailyOrderData {
  date: string;
  count: number;
  revenue: number;
}

export interface OrderStatusStatData {
  statusId: string;
  statusName: string;
  count: number;
  totalAmount: number;
}

export interface DeliveryMethodStatData {
  method: string;
  count: number;
  percentage: number;
}

export interface PaymentMethodStatData {
  method: string;
  count: number;
  totalAmount: number;
}

export interface ChannelStatData {
  channel: string;
  count: number;
  totalAmount: number;
}

export interface ExceptionOrder {
  id: number;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  paidAmount: number;
  statusId: string;
  statusName: string;
  paymentStatus: string;
  paymentMethod: string;
  issue: string;
  type: 'pending' | 'sla' | 'payment' | 'return' | string;
  waitTime: string;
  createdAt?: string;
  deliveryType?: string;
}

export interface OrderStatisticsResponse {
  pendingOrders: number;
  slaDelayed: number;
  paymentErrors: number;
  returnRequests: number;
  completedToday: number;
  targetToday: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  cancellationRate: number;
  hourlyData: HourlyOrderData[];
  dailyData: DailyOrderData[];
  statusData: OrderStatusStatData[];
  deliveryMethodData: DeliveryMethodStatData[];
  paymentMethodData: PaymentMethodStatData[];
  channelData: ChannelStatData[];
  exceptionOrders: ExceptionOrder[];
}

export interface OrderStatisticsFilterParams {
  startDate?: string;
  endDate?: string;
  channel?: string;
  paymentMethod?: string;
  statusId?: string;
}

export const orderStatisticsApi = {
  getStatistics(params?: OrderStatisticsFilterParams) {
    return request.get<OrderStatisticsResponse>({
      url: '/api/v1/statistics/order-statistics',
      params,
    });
  },
};

