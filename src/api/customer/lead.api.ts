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
  addressDetail: string;
  ward: string;
  district: string;
  province: string;
  gender: string;
  birthday?: string;
  identificationNumber: string;
  isVerified: boolean;
  tier: string;
  points: number;
  assignedToId?: string | null;
  assignedToName?: string | null;
  createdAt: string;
  activities?: {
    id: number;
    activityType: string;
    description: string;
    createdAt: string;
  }[];
}

export interface LeadListParams {
  Page?: number;
  PageSize?: number;
  Filters?: string;
  Sorts?: string;
}

export interface LeadPaginatedResponse<T = Lead> {
  items?: T[];
  totalCount?: number;
  records?: T[];
  total?: number;
}

export function fetchGetLeadList(params?: LeadListParams) {
  return request.get<Lead[] | LeadPaginatedResponse<Lead>>({
    url: "/api/v1/Lead",
    params,
  });
}

export function fetchGetLeadDetail(id: number) {
  return request.get<Lead>({
    url: `/api/v1/Lead/${id}`,
  });
}

export function fetchUpdateLead(id: number, data: Partial<Lead>) {
  return request.put<number>({
    url: `/api/v1/Lead/${id}`,
    data,
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

export function fetchCreateLead(data: Partial<Lead>) {
  return request.post<number>({
    url: "/api/v1/Lead",
    data,
  });
}

export function fetchGetProfile360(id: number) {
  return request.get<Profile360Data>({
    url: `/api/v1/Lead/${id}/360`,
  });
}

// Profile 360 types
export interface Profile360Data {
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
  assignedToId?: string | null;
  assignedToName?: string | null;
  activities: LeadActivity[];
  outputs: OutputSummary[];
  vehicles: VehicleSummary[];
  careReminders: CareReminder[];
  timelineEvents: TimelineEvent[];
  summary: Profile360Summary;
}

export interface LeadActivity {
  id: number;
  activityType: string;
  description: string;
  createdAt: string;
}

export interface OutputSummary {
  id: number;
  statusId?: string;
  statusDisplayName?: string;
  createdAt: string;
  lastStatusChangedAt?: string;
  total?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  items: OutputItemSummary[];
}

export interface OutputItemSummary {
  id?: number;
  productName?: string;
  count?: number;
  price?: number;
  coverImageUrl?: string;
}

export interface VehicleSummary {
  id: number;
  licensePlate?: string;
  vinNumber: string;
  engineNumber: string;
  purchaseDate: string;
  status: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  nextMaintenanceOdo?: number;
  currentOdo: number;
}

export interface CareReminder {
  type: string;
  title: string;
  description: string;
  dueDate?: string;
  priority: string;
}

export interface TimelineEvent {
  date: string;
  type: string;
  title: string;
  description?: string;
  status?: string;
  relatedId?: number;
}

export interface Profile360Summary {
  activeOutputsCount: number;
  ownedVehiclesCount: number;
  overdueRemindersCount: number;
  lastInteractionDate?: string;
}
