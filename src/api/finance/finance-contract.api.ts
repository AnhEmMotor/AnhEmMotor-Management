import request from "@/common/utils/http";
import type { PagedResult } from "@/types/api";

export type FinanceContractStatus = "Pending" | "Disbursed";

export interface FinanceContractDisbursementEvidenceUploadRequest {
  financeContractId: string;
  file: File;
}

export interface FinanceContractDetailDto {
  id: string;
  salesOrderId: string;

  contractNumber: string;
  status: FinanceContractStatus;

  customer360?: {
    fullName: string;
    cccd: string;
    address: string;
    occupation?: string;
    estimatedIncome?: number;
    phone?: string;
  };

  financialPartner?: {
    name: string;
    contactPhone?: string;
    bankStaffName?: string;
  };

  creditPackage?: {
    contractNo?: string;
    principalAmount?: number;
    termMonths?: number;
    interestRateRange?: string;
    monthlyPaymentAmount?: number;
  };

  disbursement?: {
    expectedDate?: string;
    actualDate?: string;
    expectedAmount?: number;
    actualAmount?: number;
  };

  cavet?: {
    state:
      | "FinancialCompanyHolds"
      | "StoreHoldsOnBehalf"
      | "DeliveredToCustomer";
    receivedDate?: string;
    receiverName?: string;
    storageLocation?: string;
  };

  evidence?: {
    disbursementTransferProofUrl?: string;
  };
}

export interface FinanceContractListParams {
  current: number;
  size: number;
  keyword?: string;
  disbursementStatus?: string;
  partner?: string;
  cavetLocation?: string;
}

export const FinanceContractApi = {
  getFinanceContractDetail(financeContractId: string) {
    return request.get<FinanceContractDetailDto>({
      url: `/api/v1/FinanceContracts/${financeContractId}`,
    });
  },
  getFinanceContractList(params: FinanceContractListParams) {
    const {
      current,
      size,
      keyword,
      disbursementStatus,
      partner,
      cavetLocation,
    } = params;
    const filters: string[] = [];

    if (keyword) filters.push(`Keyword@=${keyword}`);
    if (disbursementStatus)
      filters.push(`DisbursementStatus==${disbursementStatus}`);
    if (partner) filters.push(`BankName@=${partner}`);
    if (cavetLocation) {
      const entityValue =
        cavetLocation === "FinancialCompanyHolds"
          ? "Bank"
          : cavetLocation === "StoreHoldsOnBehalf"
            ? "Store"
            : cavetLocation === "DeliveredToCustomer"
              ? "Customer"
              : cavetLocation;
      filters.push(`CavetLocation==${entityValue}`);
    }

    const query: Record<string, string | number> = {
      Page: current,
      PageSize: size,
    };
    if (filters.length > 0) query.Filters = filters.join(",");

    return request.get<PagedResult<FinanceContractDetailDto>>({
      url: `/api/v1/FinanceContracts`,
      params: query,
    });
  },
  uploadDisbursementEvidence(
    payload: FinanceContractDisbursementEvidenceUploadRequest,
  ) {
    const formData = new FormData();
    formData.append("file", payload.file);

    return request.post<any>({
      url: `/api/v1/FinanceContracts/${payload.financeContractId}/disbursement/evidence/upload`,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateDisbursementPayment(
    financeContractId: string,
    actualAmount: number,
    actualDate?: string,
  ) {
    return request.post<any>({
      url: `/api/v1/FinanceContracts/${financeContractId}/disbursement/payment`,
      data: {
        actualAmount,
        actualDate: actualDate || null,
      },
    });
  },

  updateCavetState(
    financeContractId: string,
    cavet: FinanceContractDetailDto["cavet"],
  ) {
    return request.post<any>({
      url: `/api/v1/FinanceContracts/${financeContractId}/cavet/state`,
      data: {
        state: cavet?.state,
        receivedDate: cavet?.receivedDate || null,
        receiverName: cavet?.receiverName || null,
        storageLocation: cavet?.storageLocation || null,
      },
    });
  },
};
