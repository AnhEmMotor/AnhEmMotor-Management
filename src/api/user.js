import axiosInstance from './axios'

const BASE_URL = '/api/v1/UserManager'

export const fetchBasicUsers = async ({ page, limit, search }) => {
  const params = {
    Page: page,
    PageSize: limit,
  }

  const filters = []
  if (search) {
    filters.push(`FullName@=${search}|Email@=${search}|PhoneNumber@=${search}`)
  }

  if (filters.length > 0) {
    params.filters = filters.join(',')
  }

  const { data } = await axiosInstance.get(`${BASE_URL}/for-output`, { params })

  return {
    data: data.items,
    pagination: {
      totalPages: data.totalPages,
      totalCount: data.totalCount,
    },
  }
}
