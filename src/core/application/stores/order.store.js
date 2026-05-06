import { defineStore } from 'pinia'
import { ref } from 'vue'
import orderService from '@application/services/order.service'
import orderMapper from '@infrastructure/mappers/order.mapper'

export const useOrderStore = defineStore('order', () => {
  const error = ref(null)

  const fetchOrders = async (query) => {
    error.value = null
    try {
      const data = await orderService.fetchOrders(query)
      return {
        data: orderMapper.toList(data),
        pagination: orderMapper.toPagination(data),
      }
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const getOrderById = async (id) => {
    error.value = null
    try {
      const data = await orderService.getOrderById(id)
      return orderMapper.toModel(data)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const saveOrder = async (id, model) => {
    error.value = null
    try {
      const dto = orderMapper.toDTO(model)
      let data
      if (id) {
        data = await orderService.updateOrder(id, dto)
      } else {
        data = await orderService.createOrder(dto)
      }
      return orderMapper.toModel(data)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const deleteOrder = async (id) => {
    error.value = null
    try {
      await orderService.deleteOrder(id)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const updateStatus = async (id, statusId) => {
    error.value = null
    try {
      const data = await orderService.updateStatus(id, statusId)
      return orderMapper.toModel(data)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const fetchStatuses = async () => {
    return await orderService.fetchStatuses()
  }

  const fetchStatusMap = async () => {
    return await orderService.fetchStatusMap()
  }

  const fetchTransitionMap = async () => {
    return await orderService.fetchTransitionMap()
  }

  const fetchLockedStatuses = async () => {
    return await orderService.fetchLockedStatuses()
  }

  return {
    error,
    fetchOrders,
    getOrderById,
    saveOrder,
    deleteOrder,
    updateStatus,
    fetchStatuses,
    fetchStatusMap,
    fetchTransitionMap,
    fetchLockedStatuses,
  }
})





