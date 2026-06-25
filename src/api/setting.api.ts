import request from '@/utils/http'

export type SettingKey = 'Deposit_ratio' | 'Inventory_alert_level' | 'Order_value_exceeds'

export type SettingsMap = Partial<Record<SettingKey, string | null>>

export const SettingApi = {
  getAll() {
    return request.get<SettingsMap>({
      url: '/api/v1/Setting'
    })
  },

  update(data: SettingsMap) {
    return request.put<SettingsMap>({
      url: '/api/v1/Setting',
      data
    })
  }
}
