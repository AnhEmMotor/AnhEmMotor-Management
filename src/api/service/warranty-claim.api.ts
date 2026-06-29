import request from "@/common/utils/http";

export interface WarrantyClaimPart {
  id?: number;
  partName: string;
  partCode: string;
  unitPrice: number;
  statusText?: string;
}

export interface WarrantyClaimListItem {
  id: number;
  claimNumber: string;
  vehiclePlate: string;
  customerName: string;
  customerPhone: string;
  statusText: string;
  createdAt: string;
}

export interface WarrantyClaimDetail {
  id: number;
  claimNumber: string;
  status: string;
  issueDescription: string;
  mediaUrls: string[];
  serviceCenterName?: string;
  manufacturerClaimNumber?: string;
  manufacturerDecision?: string;
  isRecall: boolean;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  vehicleVin?: string;
  vehiclePlate?: string;
  vehicleColor?: string;
  vehicleYear?: string;
  warrantyRemaining?: string;
  parts: WarrantyClaimPart[];
}

export interface WarrantyClaimListResponse {
  items: WarrantyClaimListItem[];
  totalCount: number;
}

export const WarrantyClaimApi = {
  getList(params?: any) {
    const { current, size, ...rest } = params || {};
    return request.get<WarrantyClaimListResponse>({
      url: "/api/v1/WarrantyClaims",
      params: {
        page: current,
        pageSize: size,
        ...rest,
      },
    });
  },

  getDetail(id: number) {
    return request.get<WarrantyClaimDetail>({
      url: `/api/v1/WarrantyClaims/${id}`,
    });
  },

  create(data: {
    licensePlate: string;
    issueDescription: string;
    serviceCenterName?: string;
    manufacturerClaimNumber?: string;
    mediaUrls?: string;
    parts?: WarrantyClaimPart[];
  }) {
    return request.post<number>({
      url: "/api/v1/WarrantyClaims",
      data,
    });
  },

  updateStatus(
    id: number,
    data: {
      status: number;
      isRecall?: boolean;
      manufacturerDecision?: string;
    },
  ) {
    return request.patch<boolean>({
      url: `/api/v1/WarrantyClaims/${id}/status`,
      data,
    });
  },
};
