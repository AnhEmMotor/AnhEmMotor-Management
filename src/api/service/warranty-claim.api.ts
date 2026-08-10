import request from '@/common/utils/http';

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
  vehicleVin?: string;
  customerName: string;
  customerPhone: string;
  statusText: string;
  createdAt: string;
}

export interface WarrantyClaimDetail {
  id: number;
  claimNumber: string;
  status: number;
  issueDescription: string;
  mediaUrls: string[];
  serviceCenterName?: string;
  manufacturerClaimNumber?: string;
  manufacturerDecision?: string;
  isRecall: boolean;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  vehicleId?: number;
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

export interface WarrantyHistoryItem {
  id: number;
  claimNumber: string;
  status: number;
  statusText: string;
  issueDescription: string;
  manufacturerDecision?: string;
  isRecall: boolean;
  totalPartsCost: number;
  totalLaborCost: number;
  createdAt: string;
  parts: WarrantyClaimPart[];
}

export const WarrantyClaimApi = {
  getList(params?: any) {
    const { current, size, ...rest } = params || {};
    return request.get<WarrantyClaimListResponse>({
      url: '/api/v1/WarrantyClaims',
      params: { page: current, pageSize: size, ...rest },
    });
  },

  getDetail(id: number) {
    return request.get<WarrantyClaimDetail>({
      url: `/api/v1/WarrantyClaims/${id}`,
    });
  },

  getHistory(vehicleId: number) {
    return request.get<WarrantyHistoryItem[]>({
      url: `/api/v1/WarrantyClaims/vehicle/${vehicleId}/history`,
    });
  },

  create(data: {
    vehicleId: number;
    issueDescription: string;
    isRecall?: boolean;
    totalPartsCost?: number;
    totalLaborCost?: number;
    serviceCenterName?: string;
    manufacturerClaimNumber?: string;
    mediaUrls?: string;
    parts?: WarrantyClaimPart[];
  }) {
    return request.post<number>({
      url: '/api/v1/WarrantyClaims',
      data,
    });
  },

  updateStatus(
    id: number,
    data: {
      status: number;
      isRecall?: boolean;
      manufacturerDecision?: string;
    }
  ) {
    return request.patch<boolean>({
      url: `/api/v1/WarrantyClaims/${id}/status`,
      data,
    });
  },

  delete(id: number) {
    return request.del<boolean>({
      url: `/api/v1/WarrantyClaims/${id}`,
    });
  },
};
