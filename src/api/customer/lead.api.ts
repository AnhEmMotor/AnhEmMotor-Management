import request from "@/common/utils/http";

export interface Lead {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  score: number;
  status: string;
  source: string;
  interestedVehicle: string;
  address: string;
  gender: string;
  birthday?: string;
  saleId?: number | null;
  createdAt: string;
}

export function fetchGetLeadList(params?: any) {
  return request.get<Lead[]>({
    url: "/api/v1/Lead",
    params,
  });
}

export function fetchGetLeadDetail(id: number) {
  return request.get<Lead>({
    url: `/api/v1/Lead/${id}`,
  });
}

export function fetchCreateLead(data: any) {
  return request.post<number>({
    url: "/api/v1/Lead",
    data,
  });
}

export function fetchUpdateLead(id: number, data: any) {
  return request.put<number>({
    url: `/api/v1/Lead/${id}`,
    data,
  });
}
