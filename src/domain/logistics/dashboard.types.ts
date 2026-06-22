export type LogisticsDashboardSummary = {
  fulfillmentWorkload: number;
  pendingUnreconciledCod: number;
  otifRate: number;
  returnsClaimsRate: number;
  fulfillmentWorkloadIsOverload: boolean;
};

export type LogisticsTrendPoint = {
  dayLabel: string;
  deliveredCount: number;
  shippingCost: number;
};

export type CarrierScoreRow = {
  carrier: string;
  deliveredCount: number;
  avgDeliveryDays: number;
  avgShippingCostPerOrder: number;
  returnsRatio: number;
};

export type LogisticsExceptionRow = {
  type: string;
  trackingNumber: string;
  message: string;
  createdAt: string;
};

export type LogisticsDashboardResponse = {
  summary: LogisticsDashboardSummary;
  fulfillmentFunnel: Record<string, number>;
  trends: LogisticsTrendPoint[];
  carrierScorecard: CarrierScoreRow[];
  exceptions: LogisticsExceptionRow[];
};
