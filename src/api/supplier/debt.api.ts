import request from "@/common/utils/http";

export const DebtApi = {
  getSuppliersWithDebt(params?: any) {
    return request.get<any>({
      url: "/api/v1/DebtPayments/suppliers",
      params,
    });
  },

  paySupplierDebt(
    supplierId: number,
    amount: number,
    proofImageUrls?: string[],
  ) {
    return request.post<any>({
      url: `/api/v1/DebtPayments/suppliers/${supplierId}/pay`,
      data: {
        amount,
        proofImageUrls,
      },
    });
  },

  getSupplierDebtLogs(supplierId: number) {
    return request.get<any[]>({
      url: `/api/v1/DebtPayments/suppliers/${supplierId}/debt-logs`,
    });
  },

  uploadProofImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return request.post<{ mediaFileId: number; url: string }>({
      url: "/api/v1/DebtPayments/proof-image",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getDebtLogProofImages(logId: number) {
    return request.get<string[]>({
      url: `/api/v1/DebtPayments/debt-logs/${logId}/proof-images`,
    });
  },

  updateProofImages(logId: number, proofImageUrls: string[]) {
    return request.put<any>({
      url: `/api/v1/DebtPayments/debt-logs/${logId}/proof-images`,
      data: {
        proofImageUrls,
      },
    });
  },

  getMissingProofs(params?: any) {
    return request.get<any>({
      url: "/api/v1/DebtPayments/missing-proofs",
      params,
    });
  },
};
