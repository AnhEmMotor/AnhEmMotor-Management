import request from '@/common/utils/http';

export const getVouchers = (params: any) => request.get({ url: '/api/v1/voucher', params });
export const getVoucherById = (id: number) => request.get({ url: `/api/v1/voucher/${id}` });
export const createVoucher = (data: any) => request.post({ url: '/api/v1/voucher', data });
export const updateVoucher = (id: number, data: any) =>
  request.put({ url: `/api/v1/voucher/${id}`, data });
export const deleteVoucher = (id: number) => request.del({ url: `/api/v1/voucher/${id}` });
