import request from '@/common/utils/http';
import type {
  VoucherItem,
  VoucherValidateResponse,
  OrderVoucherApplyResult,
  OrderVoucherRemoveResult,
} from '@/domain/voucher/voucher.types';

export const VoucherApi = {
  getList(params?: any) {
    return request.get<{ items: VoucherItem[]; totalCount: number }>({
      url: '/api/v1/voucher',
      params,
    });
  },
  getById(id: number) {
    return request.get<VoucherItem>({ url: `/api/v1/voucher/${id}` });
  },
  getByCode(code: string) {
    return request.get<VoucherItem>({ url: `/api/v1/voucher/code/${code}` });
  },
  validate(voucherId: number, outputId: number) {
    return request.post<VoucherValidateResponse>({
      url: '/api/v1/voucher/validate',
      data: { voucherId, outputId },
    });
  },
  apply(voucherId: number, outputId: number) {
    return request.post<OrderVoucherApplyResult>({
      url: '/api/v1/voucher/apply',
      data: { voucherId, outputId },
    });
  },
  remove(orderVoucherId: number) {
    return request.del<OrderVoucherRemoveResult>({
      url: `/api/v1/voucher/apply/${orderVoucherId}`,
    });
  },
};
