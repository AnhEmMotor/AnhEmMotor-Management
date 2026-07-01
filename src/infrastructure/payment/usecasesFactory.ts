import {
  CreatePaymentUseCase,
  GetPaymentDetailUseCase,
  GetPaymentsUseCase,
  GetPaymentStatsUseCase,
  RealCreatePaymentUseCase,
  RealGetPaymentDetailUseCase,
  RealGetPaymentsUseCase,
  RealGetPaymentStatsUseCase,
} from "@/application/payment/usecases";
import type { WorkshopPaymentApiType } from "@/api/service/workshop-payment.api";

export interface PaymentUseCases {
  getList: GetPaymentsUseCase;
  getDetail: GetPaymentDetailUseCase;
  create: CreatePaymentUseCase;
  getStats: GetPaymentStatsUseCase;
}

export function createPaymentUseCases(
  api: WorkshopPaymentApiType,
): PaymentUseCases {
  return {
    getList: new RealGetPaymentsUseCase(api),
    getDetail: new RealGetPaymentDetailUseCase(api),
    create: new RealCreatePaymentUseCase(api),
    getStats: new RealGetPaymentStatsUseCase(api),
  };
}
