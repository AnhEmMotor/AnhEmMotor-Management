import { defineStore } from 'pinia';
import * as productApi from '@/api/product';
import { showConfirmation } from '@/composables/useConfirmationState';

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    isLoading: false,
    error: null,
    pagination: {
      page: 1,
      itemsPerPage: 20,
      totalCount: 0,
      totalPages: 1,
    },
    filters: {
      search: '',
      statusIds: [],
    },
  }),

  getters: {
    allProducts: (state) => state.products,
    productById: (state) => (id) => state.products.find((p) => p.id === id),
  },

  actions: {
    async fetchProducts() {
      this.isLoading = true;
      this.error = null;
      try {
        const { filters, pagination } = this;
        const params = {
          Page: pagination.page,
          PageSize: pagination.itemsPerPage,
        };
        if (filters.search) {
          params.Filters = `name@=*${filters.search}`;
        }
        const result = await productApi.getProductsForManager(params);
        this.products = result.items || [];
        if (result.totalCount !== undefined) {
          this.pagination.totalCount = result.totalCount;
          this.pagination.totalPages = result.totalPages || Math.ceil(result.totalCount / pagination.itemsPerPage);
        }
      } catch (error) {
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },

    async createProduct(product) {
      this.isLoading = true;
      this.error = null;
      try {
        const result = await productApi.createProduct(product);
        await this.fetchProducts();
        return result;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateProduct(id, product) {
      this.isLoading = true;
      this.error = null;
      try {
        const result = await productApi.updateProduct(id, product);
        await this.fetchProducts();
        return result;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteProduct(product) {
      const confirmed = await showConfirmation(
        'Xác nhận xóa',
        `Bạn có chắc chắn muốn xóa dòng sản phẩm "${product.name}"? Hành động này không thể hoàn tác.`,
      );
      if (!confirmed) return;

      this.isLoading = true;
      this.error = null;
      try {
        await productApi.deleteProduct(product.id);
        await this.fetchProducts();
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateFilters(filters) {
      Object.assign(this.filters, filters);
      await this.fetchProducts();
    },

    async changePage(page) {
      if (page) this.pagination.page = page;
      await this.fetchProducts();
    },
  },
});
