import request from "@/common/utils/http";

export interface DepositSettingItemDto {
  orderType: string;
  orderThreshold: number;
  depositRatio: number;
}

export interface DepositSettingHistoryResponse {
  id: string;
  orderType: string;
  orderThreshold: number;
  depositRatio: number;
  createdAt: string;
  createdBy: string;
}

export const DepositSettingApi = {
  getSettings() {
    return request.get<DepositSettingItemDto[]>({
      url: "/api/v1/DepositSetting",
    });
  },

  getHistory() {
    return request.get<DepositSettingHistoryResponse[]>({
      url: "/api/v1/DepositSetting/history",
    });
  },

  updateSettings(settings: DepositSettingItemDto[]) {
    return request.put<boolean>({
      url: "/api/v1/DepositSetting",
      data: { settings },
    });
  },
};
