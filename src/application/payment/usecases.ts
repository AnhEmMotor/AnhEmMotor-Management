import type {
  PaymentDetail,
  PaymentItem,
  PaymentListResult,
  CreatePaymentPayload,
} from "@/domain/payment/types";
import type { WorkshopPaymentApiType } from "@/api/service/workshop-payment.api";

export type GetPaymentsInput = {
  current: number;
  size: number;
  sourceType?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  search?: string;
};

export interface GetPaymentsUseCase {
  call(input: GetPaymentsInput): Promise<PaymentListResult | null>;
}

export interface GetPaymentDetailUseCase {
  call(id: number): Promise<PaymentDetail | null>;
}

export interface CreatePaymentUseCase {
  call(payload: CreatePaymentPayload): Promise<number | null>;
}

export class RealGetPaymentsUseCase implements GetPaymentsUseCase {
  constructor(private api: WorkshopPaymentApiType) {}

  async call(input: GetPaymentsInput): Promise<PaymentListResult | null> {
    const { current, size, sourceType, paymentStatus, paymentMethod, search } =
      input;

    const filters: string[] = [];
    if (sourceType) filters.push(`SourceType==${sourceType}`);
    if (paymentStatus) filters.push(`PaymentStatus==${paymentStatus}`);
    if (paymentMethod) filters.push(`PaymentMethod==${paymentMethod}`);
    if (search) filters.push(`PaymentNumber@=*${search}*`);

    const params: Record<string, unknown> = {
      current,
      size,
      Filters: filters.join(","),
      Sorts: "-CreatedAt",
    };

    const res = await this.api.getList(params);
    if (!res) return null;
    return {
      items: res.items as PaymentItem[],
      totalCount: res.totalCount,
    };
  }
}

export class RealGetPaymentDetailUseCase implements GetPaymentDetailUseCase {
  constructor(private api: WorkshopPaymentApiType) {}

  async call(id: number): Promise<PaymentDetail | null> {
    const item = await this.api.getDetail(id);
    if (!item) return null;
    return {
      ...item,
      sourceLabel: getSourceLabel(item.sourceType),
      canPrintInvoice: item.paymentStatus === "Paid",
    } as PaymentDetail;
  }
}

export class RealCreatePaymentUseCase implements CreatePaymentUseCase {
  constructor(private api: WorkshopPaymentApiType) {}

  async call(payload: CreatePaymentPayload): Promise<number | null> {
    return this.api.create(payload);
  }
}

export interface GetPaymentStatsUseCase {
  call(): Promise<any | null>;
}

export class RealGetPaymentStatsUseCase implements GetPaymentStatsUseCase {
  constructor(private api: WorkshopPaymentApiType) {}

  async call(): Promise<any | null> {
    return this.api.getStats();
  }
}

function getSourceLabel(sourceType: string): string {
  const map: Record<string, string> = {
    RepairOrder: "Phiếu sửa chữa",
    Maintenance: "Phiếu bảo trì",
    Warranty: "Phiếu bảo hành",
    ServiceBooking: "Đặt dịch vụ",
  };
  return map[sourceType] || sourceType;
}
