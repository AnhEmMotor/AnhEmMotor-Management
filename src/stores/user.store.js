import { defineStore } from 'pinia'
import userService from '@/services/user.service'
import userMapper from '@/mappers/user.mapper'

export const useUserStore = defineStore('user', () => {
  /**
   * Lấy danh sách người dùng cơ bản
   */
  const fetchBasicUsers = async (query) => {
    const params = userMapper.toParams(query)
    const data = await userService.fetchBasicUsers(params)
    return {
      data: userMapper.toList(data),
      pagination: userMapper.toPagination(data),
    }
  }

  /**
   * Lấy danh sách người dùng theo phân trang và bộ lọc
   */
  const fetchUsers = async (query) => {
    const params = userMapper.toParams(query)
    const data = await userService.fetchUsers(params)
    return {
      data: userMapper.toList(data),
      pagination: userMapper.toPagination(data),
    }
  }

  /**
   * Lấy chi tiết người dùng
   */
  const getUserById = async (id) => {
    const data = await userService.getUserById(id)
    return userMapper.toModel(data)
  }

  /**
   * Cập nhật thông tin người dùng (Admin)
   */
  const updateUser = async (id, model) => {
    const dto = userMapper.toDTO(model)
    const data = await userService.updateUser(id, dto)
    return userMapper.toModel(data)
  }

  /**
   * Đặt lại mật khẩu người dùng (Admin hành động)
   */
  const resetPassword = async (id, payload) => {
    const dto = userMapper.toResetPasswordPayload(payload)
    return await userService.resetPassword(id, dto)
  }

  /**
   * Gán vai trò cho người dùng
   */
  const assignRoles = async (id, roles) => {
    const dto = userMapper.toRolesPayload(roles)
    return await userService.assignRoles(id, dto)
  }

  /**
   * Cập nhật trạng thái người dùng
   */
  const changeStatus = async (id, status) => {
    const dto = userMapper.toStatusPayload(status)
    return await userService.changeStatus(id, dto)
  }

  /**
   * Tải lên ảnh đại diện cho người dùng khác
   */
  const uploadAvatar = async (id, file) => {
    const payload = userMapper.toAvatarPayload(file)
    const data = await userService.uploadAvatar(id, payload)
    return userMapper.toModel(data)
  }

  return {
    fetchBasicUsers,
    fetchUsers,
    getUserById,
    updateUser,
    resetPassword,
    assignRoles,
    changeStatus,
    uploadAvatar,
  }
})
