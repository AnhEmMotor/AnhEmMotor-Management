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
  addressDetail?: string;
  ward?: string;
  district?: string;
  province?: string;
  gender: string;
  birthday?: string;
  identificationNumber?: string;
  saleId?: number | null;
  assignedToId?: string | null;
  createdAt: string;
  activities?: LeadActivity[];
}

export interface LeadActivity {
  id: number;
  activityType: string;
  description: string;
  createdAt: string;
}

export interface LeadPipelineGroup {
  status: string;
  statusDisplayName: string;
  leads: Lead[];
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

export function fetchGetLeadPipeline() {
  return request.get<LeadPipelineGroup[]>({
    url: "/api/v1/Lead/pipeline",
  });
}

export function fetchAddLeadActivity(
  id: number,
  data: { activityType: string; description: string },
) {
  return request.post<number>({
    url: `/api/v1/Lead/${id}/activities`,
    data,
  });
}

export function fetchAssignLead(id: number, userId: string | null) {
  return request.post<number>({
    url: `/api/v1/Lead/${id}/assign`,
    data: userId,
  });
}
