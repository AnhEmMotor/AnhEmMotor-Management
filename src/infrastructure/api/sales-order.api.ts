import request from "@/utils/http";
import type {
  CreateSalesOrderByManager,
  SalesOrder,
  SalesOrderList,
  UpdateSalesOrderForManager,
  VehicleAssignmentRequirement,
} from "@/domain/order/order.types";

function getPagedList(url: string, params: any) {
  const { current, size, ...rest } = params;
  return request.get<SalesOrderList>({
    url,
    params: {
      Page: current,
      PageSize: size,
      ...rest,
    },
  });
}

export const SalesOrderApi = {
  getConfirmedList(params: any) {
    return getPagedList("/api/v1/SalesOrders/confirmed", params);
  },

  getUnconfirmedList(params: any) {
    return getPagedList("/api/v1/SalesOrders/unconfirmed", params);
  },

  getById(id: number) {
    return request.get<SalesOrder>({
      url: `/api/v1/SalesOrders/${id}`,
    });
  },

  getStatuses() {
    return request.get<Record<string, string>>({
      url: "/api/v1/SalesOrders/status",
    });
  },

  getStatusMap() {
    return request.get<Array<{ id: string; name: string }>>({
      url: "/api/v1/SalesOrders/status-map",
    });
  },

  getTransitionMap() {
    return request.get<Record<string, string[]>>({
      url: "/api/v1/SalesOrders/transition-map",
    });
  },

  getLockedStatuses() {
    return request.get({
      url: "/api/v1/SalesOrders/locked-statuses",
    });
  },

  getVehicleAssignmentStatuses() {
    return request.get<string[]>({
      url: "/api/v1/SalesOrders/vehicle-assignment-statuses",
    });
  },

  getVehicleAssignmentRequirements(id: number, targetStatusId: string) {
    return request.get<VehicleAssignmentRequirement>({
      url: `/api/v1/SalesOrders/${id}/vehicle-assignment-requirements`,
      params: { targetStatusId },
    });
  },

  createByManager(data: CreateSalesOrderByManager) {
    return request.post<SalesOrder>({
      url: "/api/v1/SalesOrders/by-manager",
      data,
    });
  },

  updateForManager(id: number, data: UpdateSalesOrderForManager) {
    return request.put<SalesOrder>({
      url: `/api/v1/SalesOrders/for-manager/${id}`,
      data,
    });
  },

  updateStatus(id: number, statusId: string, selectedVehicleIds?: number[]) {
    return request.patch<SalesOrder>({
      url: `/api/v1/SalesOrders/${id}/status`,
      data: { statusId, selectedVehicleIds },
    });
  },

  delete(id: number) {
    return request.del({
      url: `/api/v1/SalesOrders/${id}`,
    });
  },
};
