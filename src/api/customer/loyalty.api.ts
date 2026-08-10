import request from '@/common/utils/http';

export interface LoyaltyMember {
  id: number;
  fullName: string;
  phoneNumber: string;
  tier: string;
  points: number;
}

export interface LoyaltyMemberListParams {
  Page?: number;
  PageSize?: number;
  Filters?: string;
  Sorts?: string;
}

export interface LoyaltyMemberPaginatedResponse {
  items?: LoyaltyMember[];
  totalCount?: number;
  records?: LoyaltyMember[];
  total?: number;
}

export function fetchGetLoyaltyMembers(params?: LoyaltyMemberListParams) {
  return request.get<LoyaltyMember[] | LoyaltyMemberPaginatedResponse>({
    url: '/api/v1/Loyalty/members',
    params,
  });
}
