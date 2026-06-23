import request from "@/common/utils/http";
import type {
  ReturnOrderDto,
  ReturnDetailDto,
  InspectReturnCommand,
} from "@/domain/logistics/returns.types";

/**
 * Lấy danh sách các đơn hàng hoàn
 * @param status Lọc theo trạng thái ('pending', 'inspecting', 'completed', hoặc rỗng cho tất cả)
 */
export function getReturns(status?: string) {
  return request.get<ReturnOrderDto[]>({
    url: "/api/v1/logistics/returns",
    params: { status: status || undefined },
  });
}

/**
 * Lấy chi tiết đơn hàng hoàn
 * @param id ID của đơn hàng hoàn
 */
export function getReturnDetail(id: number) {
  return request.get<ReturnDetailDto>({
    url: `/api/v1/logistics/returns/${id}`,
  });
}

/**
 * Đóng hồ sơ, kiểm định hàng hoàn và chọn hướng giải quyết
 * @param id ID của đơn hàng hoàn
 * @param data Thông tin kiểm định và quyết định
 */
export function inspectReturn(id: number, data: InspectReturnCommand) {
  return request.post<void>({
    url: `/api/v1/logistics/returns/${id}/inspect`,
    data,
  });
}
