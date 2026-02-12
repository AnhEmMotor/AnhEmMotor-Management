import { defineStore } from 'pinia';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import {
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierById,
  updateSupplierStatus as updateStatusApi,
} from '@/api/supplier';

export const useSuppliersStore = defineStore('suppliers', () => {
  const queryClient = useQueryClient();

  // Mutations
  const addMutation = useMutation({
    mutationFn: (supplier) => createSupplier(supplier),
    onSuccess: (newSupplier) => {
      // Optimistic update or manual cache update
      if (newSupplier?.id) {
        queryClient.setQueryData(['suppliers', newSupplier.id], newSupplier);
      }
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ id, supplier }) => updateSupplier(id, supplier),
    onSuccess: (updatedSupplier) => {
      if (updatedSupplier?.id) {
        queryClient.setQueryData(['suppliers', updatedSupplier.id], updatedSupplier);
      }
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteSupplier(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ['suppliers', id] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, statusId }) => updateStatusApi(id, statusId),
    onSuccess: (updatedSupplier) => {
      if (updatedSupplier?.id) {
        queryClient.setQueryData(['suppliers', updatedSupplier.id], updatedSupplier);
      }
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  // Actions wrapper to return promises for UI handling (toast, modal close)
  const addSupplier = (supplier) => {
    return addMutation.mutateAsync(supplier);
  };

  const updateSupplierAction = (id, supplier) => {
    return editMutation.mutateAsync({ id, supplier });
  };

  const removeSupplier = (id) => {
    return deleteMutation.mutateAsync(id);
  };

  const updateSupplierStatus = (id, statusId) => {
    return toggleStatusMutation.mutateAsync({ id, statusId });
  };

  const getSupplier = (id) => {
    return getSupplierById(id);
  }

  return {
    // State (exposed via mutations)
    isAdding: addMutation.isPending,
    isEditing: editMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleStatusMutation.isPending,
    addError: addMutation.error,
    editError: editMutation.error,
    deleteError: deleteMutation.error,
    toggleError: toggleStatusMutation.error,

    // Actions
    addSupplier,
    updateSupplier: updateSupplierAction,
    deleteSupplier: removeSupplier,
    updateSupplierStatus,
    getSupplierById: getSupplier,
  };
});
