import request from '@/common/utils/http';
import type {
  ReturnOrderDto,
  ReturnDetailDto,
  InspectReturnCommand,
} from '@/domain/logistics/returns.types';

export function getReturns(status?: string) {
  return request.get<ReturnOrderDto[]>({
    url: '/api/v1/logistics/returns',
    params: { status: status || undefined },
  });
}

export function getReturnDetail(id: number) {
  return request.get<ReturnDetailDto>({
    url: `/api/v1/logistics/returns/${id}`,
  });
}

export function inspectReturn(id: number, data: InspectReturnCommand) {
  return request.post<void>({
    url: `/api/v1/logistics/returns/${id}/inspect`,
    data,
  });
}

export function rejectReturn(id: number, rejectionReason: string) {
  return request.post<void>({
    url: `/api/v1/logistics/returns/${id}/reject`,
    data: { rejectionReason },
  });
}
