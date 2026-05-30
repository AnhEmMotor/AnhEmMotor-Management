import request from '@/utils/http'

export const DebtApi = {
  getSuppliersWithDebt() {
    return request.get<any[]>({
      url: '/api/v1/DebtPayments/suppliers'
    })
  },

  getReceiptsWithDebt(supplierId: number) {
    return request.get<any[]>({
      url: `/api/v1/DebtPayments/suppliers/${supplierId}/receipts`
    })
  },

  payDebt(receiptId: number, amount: number) {
    return request.post<any>({
      url: `/api/v1/DebtPayments/receipts/${receiptId}/pay`,
      data: { amount }
    })
  }
}
