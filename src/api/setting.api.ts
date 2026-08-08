import request from "@/common/utils/http";

export type SettingKey =
  | "Deposit_ratio"
  | "Inventory_alert_level"
  | "Order_value_exceeds"
  | "Deposit_type"
  | "Fixed_deposit_amount"
  | "VehicleDeposit_enabled"
  | "VehiclePartsDeposit_enabled"
  | "PartsDeposit_enabled"
  | "AccessoriesDeposit_enabled"
  | "VehicleOrder_value_exceeds"
  | "VehiclePartsOrder_value_exceeds"
  | "PartsOrder_value_exceeds"
  | "AccessoriesOrder_value_exceeds"
  | "VehicleDeposit_ratio"
  | "VehiclePartsDeposit_ratio"
  | "PartsDeposit_ratio"
  | "AccessoriesDeposit_ratio"
  | "VehicleDeposit_type"
  | "VehiclePartsDeposit_type"
  | "PartsDeposit_type"
  | "AccessoriesDeposit_type"
  | "VehicleFixed_deposit_amount"
  | "VehiclePartsFixed_deposit_amount"
  | "PartsFixed_deposit_amount"
  | "AccessoriesFixed_deposit_amount";

export type SettingsMap = Partial<Record<SettingKey, string | null>>;

export const SettingApi = {
  getAll() {
    return request.get<SettingsMap>({
      url: "/api/v1/Setting",
    });
  },

  update(data: SettingsMap) {
    return request.put<SettingsMap>({
      url: "/api/v1/Setting",
      data,
    });
  },
};
