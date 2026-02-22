import { fetchProductsForPricing, updateProductPrice, updateVariantPrice } from '@/api/price';
import { defineStore } from 'pinia';

export const usePriceStore = defineStore('price', {
  actions: {
    async fetchProducts(params) {
      return await fetchProductsForPricing(params);
    },

    async updateProductPrice(id, price) {
      return await updateProductPrice(id, price);
    },

    async updateVariantPrice(variantId, price) {
      return await updateVariantPrice(variantId, price);
    },
  },
});
