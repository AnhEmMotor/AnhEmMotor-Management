import axiosInstance from '@infrastructure/api/axios'
import { SETTING_ENDPOINTS } from '@constants/endpoints/setting.endpoint'

const settingService = {
  async fetchSettings() {
    const { data } = await axiosInstance.get(SETTING_ENDPOINTS.BASE)
    return data
  },

  async updateSettings(payload) {
    const { data } = await axiosInstance.put(SETTING_ENDPOINTS.BASE, payload)
    return data
  },
}

export default settingService



