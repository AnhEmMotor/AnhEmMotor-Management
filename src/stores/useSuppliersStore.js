import { defineStore } from 'pinia'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { ref } from 'vue'
import {
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierById,
  updateSupplierStatus as updateStatusApi,
} from '@/api/supplier'

export const useSuppliersStore = defineStore('suppliers', () => {
  const queryClient = useQueryClient()

  const isFormModalVisible = ref(false)
  const isEditMode = ref(false)
  const editableSupplier = ref({})
  const formErrors = ref({})

  const addMutation = useMutation({
    mutationFn: (supplier) => createSupplier(supplier),
    onSuccess: (newSupplier) => {
      if (newSupplier?.id) {
        queryClient.setQueryData(['suppliers', newSupplier.id], newSupplier)
      }
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })

  const editMutation = useMutation({
    mutationFn: ({ id, supplier }) => updateSupplier(id, supplier),
    onSuccess: (updatedSupplier) => {
      if (updatedSupplier?.id) {
        queryClient.setQueryData(['suppliers', updatedSupplier.id], updatedSupplier)
      }
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteSupplier(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ['suppliers', id] })
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, statusId }) => updateStatusApi(id, statusId),
    onSuccess: (updatedSupplier) => {
      if (updatedSupplier?.id) {
        queryClient.setQueryData(['suppliers', updatedSupplier.id], updatedSupplier)
      }
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })

  const validateSupplier = (data) => {
    const errors = {}
    if (!data.name) errors.name = 'Tên nhà cung cấp là bắt buộc'
    if (!data.phone) errors.phone = 'Số điện thoại là bắt buộc'
    return errors
  }

  const saveSupplier = async () => {
    const errors = validateSupplier(editableSupplier.value)
    formErrors.value = errors
    if (Object.keys(errors).length > 0) {
      return { success: false, error: { type: 'Validation', errors } }
    }

    try {
      let result
      if (isEditMode.value) {
        const id = editableSupplier.value.id
        result = await editMutation.mutateAsync({ id, supplier: editableSupplier.value })
      } else {
        result = await addMutation.mutateAsync(editableSupplier.value)
      }
      return { success: true, data: result }
    } catch (error) {
      const data = error.response?.data
      if (data?.type === 'Validation' && data?.errors?.length > 0) {
        const backendErrors = {}
        data.errors.forEach((e) => {
          if (e.field) {
            backendErrors[e.field.toLowerCase()] = e.message
          }
        })
        formErrors.value = backendErrors
        return { success: false, error: { type: 'Validation', errors: backendErrors } }
      }
      return { success: false, error }
    }
  }

  const toggleStatus = async (id, currentStatusId) => {
    const newStatus = currentStatusId === 'active' ? 'inactive' : 'active'
    try {
      await toggleStatusMutation.mutateAsync({ id, statusId: newStatus })
      return { success: true, newStatus }
    } catch (error) {
      return { success: false, error }
    }
  }

  const removeSupplier = async (id) => {
    try {
      await deleteMutation.mutateAsync(id)
      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }

  const openFormModal = (supplier = null) => {
    isEditMode.value = !!supplier
    editableSupplier.value = supplier ? { ...supplier } : {}
    formErrors.value = {}
    isFormModalVisible.value = true
  }

  const closeFormModal = () => {
    isFormModalVisible.value = false
    editableSupplier.value = {}
    formErrors.value = {}
  }

  return {
    isAdding: addMutation.isPending,
    isEditing: editMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleStatusMutation.isPending,
    addError: addMutation.error,
    editError: editMutation.error,
    deleteError: deleteMutation.error,
    toggleError: toggleStatusMutation.error,
    isFormModalVisible,
    isEditMode,
    editableSupplier,
    formErrors,
    validateSupplier,
    saveSupplier,
    toggleStatus,
    deleteSupplier: removeSupplier,
    getSupplierById,
    openFormModal,
    closeFormModal,
  }
})
