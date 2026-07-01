import {
  CreatePaymentUseCase,
  GetPaymentDetailUseCase,
  GetPaymentsUseCase,
  RealCreatePaymentUseCase,
  RealGetPaymentDetailUseCase,
  RealGetPaymentsUseCase,
} from "@/application/payment/usecases";
import type { WorkshopPaymentApiType } from "@/api/service/workshop-payment.api";

export interface PaymentUseCases {
  getList: GetPaymentsUseCase;
  getDetail: GetPaymentDetailUseCase;
  create: CreatePaymentUseCase;
}

export function createPaymentUseCases(
  api: WorkshopPaymentApiType,
): PaymentUseCases {
  return {
    getList: new RealGetPaymentsUseCase(api),
    getDetail: new RealGetPaymentDetailUseCase(api),
    create: new RealCreatePaymentUseCase(api),
  };
}
