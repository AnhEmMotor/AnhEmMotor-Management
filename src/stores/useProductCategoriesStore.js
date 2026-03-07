import { defineStore } from 'pinia';
import * as productCategoryApi from '@/api/productCategory';

export const useProductCategoriesStore = defineStore('productCategories', {
  state: () => ({
    categories: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    allCategories: (state) => state.categories,
    categoryById: (state) => (id) => state.categories.find((c) => c.id === id),
  },

  actions: {
    async fetchCategories() {
      this.isLoading = true;
      this.error = null;
      try {
        const result = await productCategoryApi.getCategoriesForManager({ PageSize: 10 });
        this.categories = result.items || [];
      } catch (error) {
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },

    async addCategory(category) {
      this.isLoading = true
      this.error = null
      try {
        const newCategory = await productCategoryApi.createProductCategory(category)
        this.categories.push(newCategory)
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async updateCategory({ id, category }) {
      this.isLoading = true
      this.error = null
      try {
        const updatedCategory = await productCategoryApi.updateProductCategory(id, category)
        const index = this.categories.findIndex((c) => c.id === updatedCategory.id)
        if (index !== -1) {
          this.categories.splice(index, 1, updatedCategory)
        }
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async deleteCategory(id) {
      this.isLoading = true
      this.error = null
      try {
        await productCategoryApi.deleteProductCategory(id)
        this.categories = this.categories.filter((c) => c.id !== id)
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },
  },
})
