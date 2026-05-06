import { defineStore } from 'pinia'
import userService from '@application/services/user.service'
import userMapper from '@infrastructure/mappers/user.mapper'

export const useUserStore = defineStore('user', () => {
  const fetchBasicUsers = async (query) => {
    const params = userMapper.toParams(query)
    const data = await userService.fetchBasicUsers(params)
    return {
      data: userMapper.toList(data),
      pagination: userMapper.toPagination(data),
    }
  }

  const fetchUsers = async (query) => {
    const params = userMapper.toParams(query)
    const data = await userService.fetchUsers(params)
    return {
      data: userMapper.toList(data),
      pagination: userMapper.toPagination(data),
    }
  }

  const getUserById = async (id) => {
    const data = await userService.getUserById(id)
    return userMapper.toModel(data)
  }

  const updateUser = async (id, model) => {
    const dto = userMapper.toDTO(model)
    const data = await userService.updateUser(id, dto)
    return userMapper.toModel(data)
  }

  const createUser = async (model) => {
    const dto = userMapper.toDTO(model)
    // We might need to add password to DTO or model
    dto.password = model.password
    const data = await userService.createUser(dto)
    return userMapper.toModel(data)
  }

  const resetPassword = async (id, payload) => {
    const dto = userMapper.toResetPasswordPayload(payload)
    return await userService.resetPassword(id, dto)
  }

  const assignRoles = async (id, roles) => {
    const dto = userMapper.toRolesPayload(roles)
    return await userService.assignRoles(id, dto)
  }

  const changeStatus = async (id, status) => {
    const dto = userMapper.toStatusPayload(status)
    return await userService.changeStatus(id, dto)
  }

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
    createUser,
    resetPassword,
    assignRoles,
    changeStatus,
    uploadAvatar,
  }
})





