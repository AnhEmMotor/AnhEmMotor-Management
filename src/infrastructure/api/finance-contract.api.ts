import request from '@/utils/http'

export type FinanceContractStatus =
  | 'Draft'
  | 'Submitted'
  | 'Approved'
  | 'PendingDisbursement'
  | 'Disbursed'
  | 'Settled'

export interface FinanceContractDisbursementEvidenceUploadRequest {
  financeContractId: string
  file: File
}

export interface FinanceContractDetailDto {
  id: string
  salesOrderId: string

  contractNumber: string
  status: FinanceContractStatus

  customer360?: {
    fullName: string
    cccd: string
    address: string
    occupation?: string
    estimatedIncome?: number
    phone?: string
  }

  financialPartner?: {
    name: string
    contactPhone?: string
    bankStaffName?: string
  }

  creditPackage?: {
    contractNo?: string
    principalAmount?: number
    termMonths?: number
    interestRateRange?: string
    monthlyPaymentAmount?: number
  }

  disbursement?: {
    expectedDate?: string
    actualDate?: string
    expectedAmount?: number
    actualAmount?: number
  }

  cavet?: {
    state: 'FinancialCompanyHolds' | 'StoreHoldsOnBehalf' | 'DeliveredToCustomer'
    receivedDate?: string
    receiverName?: string
    storageLocation?: string
  }

  evidence?: {
    disbursementTransferProofUrl?: string
  }
}

export const FinanceContractApi = {
  getFinanceContractDetail(financeContractId: string) {
    return request.get<FinanceContractDetailDto>({
      url: `/api/FinanceContracts/${financeContractId}`,
    })
  },

  uploadDisbursementEvidence(payload: FinanceContractDisbursementEvidenceUploadRequest) {
    const formData = new FormData()
    formData.append('file', payload.file)

    return request.post<any>({
      url: `/api/FinanceContracts/${payload.financeContractId}/disbursement/evidence/upload`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  updateDisbursementPayment(financeContractId: string, actualAmount: number, actualDate?: string) {
    return request.post<any>({
      url: `/api/FinanceContracts/${financeContractId}/disbursement/payment`,
      data: {
        actualAmount,
        actualDate: actualDate || null,
      },
    })
  },

  updateCavetState(financeContractId: string, cavet: FinanceContractDetailDto['cavet']) {
    return request.post<any>({
      url: `/api/FinanceContracts/${financeContractId}/cavet/state`,
      data: {
        state: cavet?.state,
        receivedDate: cavet?.receivedDate || null,
        receiverName: cavet?.receiverName || null,
        storageLocation: cavet?.storageLocation || null,
      },
    })
  },
}
