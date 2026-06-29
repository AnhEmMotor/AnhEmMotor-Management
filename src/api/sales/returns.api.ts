import request from "@/common/utils/http";
import type {
  ReturnRequestItem,
  ReturnRequestDetail,
  ReturnRequestListResponse,
  CreateReturnRequestCommand,
  CreateCancelRequestCommand,
} from "@/domain/sales/returns.types";

export function getReturnRequests(params?: {
  status?: string;
  keyword?: string;
  current?: number;
  size?: number;
}) {
  return request.get<ReturnRequestListResponse>({
    url: "/api/v1/sales/returns",
    params,
  });
}

export function getReturnRequestDetail(id: number) {
  return request.get<ReturnRequestDetail>({
    url: `/api/v1/sales/returns/${id}`,
  });
}

export function createReturnRequest(data: CreateReturnRequestCommand) {
  return request.post<ReturnRequestDetail>({
    url: "/api/v1/sales/returns",
    data,
  });
}

export function createCancelRequest(data: CreateCancelRequestCommand) {
  return request.post<ReturnRequestDetail>({
    url: "/api/v1/sales/returns/cancel",
    data,
  });
}

export function updateReturnRequestStatus(id: number, statusId: string) {
  return request.patch<ReturnRequestDetail>({
    url: `/api/v1/sales/returns/${id}/status`,
    data: { statusId },
  });
}
