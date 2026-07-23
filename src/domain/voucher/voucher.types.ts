export type VoucherDiscountType = "PERCENT" | "AMOUNT";

export interface VoucherItem {
  id: number;
  code: string;
  name: string;
  applyFor: string;
  channel: string;
  type: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderValue: number;
  totalUsageLimit: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  assignedCustomerIds?: number[];
  createdAt?: string;
}

export interface VoucherValidateResponse {
  isValid: boolean;
  message: string;
  discountAmount: number;
}

export interface OrderVoucherApplyResult {
  orderVoucherId: number;
  voucherCode: string;
  voucherName: string;
  discountAmount: number;
  appliedAt: string;
}

export interface OrderVoucherRemoveResult {
  orderVoucherId: number;
  refundedAmount: number;
}

export interface AppliedVoucherInfo {
  orderVoucherId: number;
  voucherId: number;
  code: string;
  name: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  discountAmount: number;
  minOrderValue: number;
}
