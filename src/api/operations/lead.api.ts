import request from "@/common/utils/http";

export interface LeadActivityResponse {
  id: number;
  leadId: number;
  activityType: string;
  note: string;
  createdAt: string;
}

export interface LeadResponse {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  score: number;
  status: string;
  source: string;
  interestedVehicle: string;
  address: string;
  addressDetail: string;
  ward: string;
  district: string;
  province: string;
  gender: string;
  birthday?: string;
  identificationNumber: string;
  createdAt: string;
  isVerified: boolean;
  tier: string;
  points: number;
  assignedToId?: string;
  assignedToName?: string;
  activities: LeadActivityResponse[];
}

export interface LeadPipelineGroupResponse {
  status: string;
  statusDisplayName: string;
  leads: LeadResponse[];
}

export const leadApi = {
  getPipeline() {
    return request.get<LeadPipelineGroupResponse[]>({
      url: "/api/v1/lead/pipeline",
    });
  },
};
