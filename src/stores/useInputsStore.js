import {
  fetchInventoryReceipts,
  getInventoryReceiptById,
  createInventoryReceipt,
  updateInventoryReceipt,
  deleteInventoryReceipt,
  updateInventoryReceiptStatus,
  cloneInventoryReceipt,
  fetchReceiptsBySupplier,
  fetchInputStatuses,
} from '@/api/input';
import { defineStore } from 'pinia';

export const useInputsStore = defineStore('inputs', {
  actions: {
    async fetchInputs(params) {
      return await fetchInventoryReceipts(params);
    },

    async getInputById(id) {
      return await getInventoryReceiptById(id);
    },

    async createInput(payload) {
      return await createInventoryReceipt(payload);
    },

    async updateInput(id, payload) {
      return await updateInventoryReceipt(id, payload);
    },

    async deleteInput(id) {
      return await deleteInventoryReceipt(id);
    },

    async updateInputStatus(id, statusId) {
      return await updateInventoryReceiptStatus(id, statusId);
    },

    async cloneInput(id) {
      return await cloneInventoryReceipt(id);
    },

    async fetchInputsBySupplier(supplierId, params) {
      return await fetchReceiptsBySupplier(supplierId, params);
    },

    async fetchInputStatuses() {
      return await fetchInputStatuses();
    },
  },
});
