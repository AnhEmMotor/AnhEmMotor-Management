import request from "@/common/utils/http";

export interface CommissionPolicyResponse {
  id: number;
  name: string;
  type: string;
  value: number;
  productId?: number;
  categoryId?: number;
  employeeId?: string;
  targetGroup?: string;
  effectiveDate: string;
  notes?: string;
  unit?: string;
  isActive: boolean;
}

export const commissionPolicyApi = {
  getAll() {
    return request.get<CommissionPolicyResponse[]>({
      url: "/api/v1/hr/commission-policies",
    });
  },
  getById(id: number) {
    return request.get<CommissionPolicyResponse>({
      url: `/api/v1/hr/commission-policies/${id}`,
    });
  },
  create(data: Partial<CommissionPolicyResponse>) {
    return request.post<CommissionPolicyResponse>({
      url: "/api/v1/hr/commission-policies",
      data,
    });
  },
  update(id: number, data: Partial<CommissionPolicyResponse>) {
    return request.put<CommissionPolicyResponse>({
      url: `/api/v1/hr/commission-policies/${id}`,
      data,
    });
  },
  delete(id: number) {
    return request.del({
      url: `/api/v1/hr/commission-policies/${id}`,
    });
  },
};
