import request from "@/utils/http";

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
