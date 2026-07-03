import type {
  PurchaseInvoice,
  PurchaseInvoiceListResult,
  CreatePurchaseInvoicePayload,
} from "@/domain/purchase-invoice/types";

export interface GetPurchaseInvoicesUseCase {
  call(params: {
    current: number;
    size: number;
    [key: string]: any;
  }): Promise<PurchaseInvoiceListResult>;
}

export interface GetPurchaseInvoiceDetailUseCase {
  call(id: number): Promise<PurchaseInvoice>;
}

export interface CreatePurchaseInvoiceUseCase {
  call(data: CreatePurchaseInvoicePayload): Promise<number>;
}

export class RealGetPurchaseInvoicesUseCase {
  constructor(private api: any) {}
  call(params: { current: number; size: number; [key: string]: any }) {
    return this.api.getList(params);
  }
}

export class RealGetPurchaseInvoiceDetailUseCase {
  constructor(private api: any) {}
  call(id: number) {
    return this.api.getDetail(id);
  }
}

export class RealCreatePurchaseInvoiceUseCase {
  constructor(private api: any) {}
  call(data: CreatePurchaseInvoicePayload) {
    return this.api.create(data);
  }
}
