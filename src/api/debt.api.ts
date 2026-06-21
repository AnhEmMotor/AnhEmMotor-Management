import request from '@/utils/http'

export const DebtApi = {
  getSuppliersWithDebt(params?: any) {
    return request.get<any>({
      url: '/api/v1/DebtPayments/suppliers',
      params
    })
  },

  paySupplierDebt(supplierId: number, amount: number) {
    return request.post<boolean>({
      url: `/api/v1/DebtPayments/suppliers/${supplierId}/pay`,
      data: { amount }
    })
  },

  getSupplierDebtLogs(supplierId: number) {
    return request.get<any[]>({
      url: `/api/v1/DebtPayments/suppliers/${supplierId}/debt-logs`
    })
  }
}
