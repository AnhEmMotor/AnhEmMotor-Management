import type { purchaseInvoiceApiType } from "@/api/purchase-invoice/purchase-invoice.api";
import {
  CreatePurchaseInvoiceUseCase,
  GetPurchaseInvoiceDetailUseCase,
  GetPurchaseInvoicesUseCase,
  RealCreatePurchaseInvoiceUseCase,
  RealGetPurchaseInvoiceDetailUseCase,
  RealGetPurchaseInvoicesUseCase,
} from "@/application/purchase-invoice/usecases";

export interface PurchaseInvoiceUseCases {
  getList: GetPurchaseInvoicesUseCase;
  getDetail: GetPurchaseInvoiceDetailUseCase;
  create: CreatePurchaseInvoiceUseCase;
}

export function createPurchaseInvoiceUseCases(
  api: purchaseInvoiceApiType,
): PurchaseInvoiceUseCases {
  return {
    getList: new RealGetPurchaseInvoicesUseCase(api),
    getDetail: new RealGetPurchaseInvoiceDetailUseCase(api),
    create: new RealCreatePurchaseInvoiceUseCase(api),
  };
}
