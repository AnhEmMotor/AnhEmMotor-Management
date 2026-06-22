import api from "@/utils/http";
import type {
  GetCarriersResponse,
  TestCarrierConnectionResponse,
  UpdateCarrierPartnerRequest,
} from "@/domain/logistics/carrier-settings.types";

type CarrierId = number;

const API_BASE = "/api/v1/logistics";

export const LogisticsCarrierSettingsService = {
  async getCarriers(): Promise<GetCarriersResponse> {
    return api.get<GetCarriersResponse>({ url: `${API_BASE}/carriers` });
  },

  async updateCarrier(
    id: CarrierId,
    payload: UpdateCarrierPartnerRequest,
  ): Promise<void> {
    await api.put({ url: `${API_BASE}/carriers/${id}`, data: payload });
  },

  async testConnection(
    id: CarrierId,
    payload: { note?: string },
  ): Promise<TestCarrierConnectionResponse> {
    return api.post<TestCarrierConnectionResponse>({
      url: `${API_BASE}/carriers/${id}/test-connection`,
      data: payload,
    });
  },
};
