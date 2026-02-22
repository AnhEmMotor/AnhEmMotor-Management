<script setup>
import { ref, computed } from 'vue';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import * as productApi from '@/api/product';
import { getPredefinedOptions } from '@/api/options';
import { useProductsStore } from '@/stores/useProductsStore';
import { usePaginatedQuery } from '@/composables/usePaginatedQuery';
import { useToast } from 'vue-toastification';
import ProductForm from '@/components/product/ProductForm.vue';
import Button from '@/components/ui/button/BaseButton.vue';
import Input from '@/components/ui/input/BaseInput.vue';
import Pagination from '@/components/ui/button/BasePagination.vue';
import SmallNoBgButton from '@/components/ui/button/SmallNoBgButton.vue';
import RoundBadge from '@/components/ui/RoundBadge.vue';
import DraggableModal from '@/components/ui/DraggableModal.vue';
import IconLeftArrow from '@/components/icons/IconLeftArrow.vue';
import IconDownArrow from '@/components/icons/IconDownArrow.vue';
import IconPlus from '@/components/icons/IconPlus.vue';
import IconFileImport from '@/components/icons/IconFileImport.vue';
import IconFileExport from '@/components/icons/IconFileExport.vue';
import IconEdit from '@/components/icons/IconEdit.vue';
import IconTrash from '@/components/icons/IconTrash.vue';
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue';
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue';

const productsStore = useProductsStore();
const queryClient = useQueryClient();
const toast = useToast();

const { data: predefinedOptionsData } = useQuery({
  queryKey: ['predefinedOptions'],
  queryFn: getPredefinedOptions,
  staleTime: 5 * 60 * 1000,
});

const expandedProductIds = ref([]);
const activeTabs = ref({});
const getActiveTab = (productId) => activeTabs.value[productId] || 'variants';
const setActiveTab = (productId, tab) => { activeTabs.value[productId] = tab; };
const numberOfColumns = ref(8);
const isSaving = ref(false);
const isRefreshing = ref(false);

const fetchProductsFn = async ({ page, limit, search }) => {
  const params = { Page: page, PageSize: limit };
  if (search) params.Filters = `name@=*${search}`;
  const result = await productApi.getProductsForManager(params);
  return {
    data: result.items || [],
    pagination: {
      totalPages: result.totalPages || 1,
      totalCount: result.totalCount || 0,
    },
  };
};

const {
  data: products,
  isLoading,
  isError,
  error,
  pagination,
  searchRefs,
} = usePaginatedQuery({
  queryKey: ['products'],
  queryFn: fetchProductsFn,
  itemsPerPage: 10,
  searchFields: [{ key: 'search', debounce: 400 }],
});

const isStoreLoading = computed(() => productsStore.isLoading);

const isExpanded = (productId) => expandedProductIds.value.includes(productId);

const toggleDetails = (productId) => {
  const index = expandedProductIds.value.indexOf(productId);
  if (index > -1) {
    expandedProductIds.value.splice(index, 1);
  } else {
    expandedProductIds.value.push(productId);
  }
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const getVariantOptionsText = (variant) => {
  if (!variant.optionValues) return 'Mặc định';
  const values = Object.entries(variant.optionValues);
  if (values.length === 0) return 'Mặc định';
  const dict = predefinedOptionsData.value || {};
  return values.map(([key, value]) => `${dict[key] || key}: ${value}`).join(', ');
};

const stockStatusColors = {
  'in-stock': 'green',
  'almost-out-of-stock': 'yellow',
  'out-of-stock': 'red',
};
const stockStatusTextMap = {
  'in-stock': 'Còn Hàng',
  'almost-out-of-stock': 'Sắp Hết',
  'out-of-stock': 'Hết Hàng',
};
const getStockStatusColor = (statusId) => stockStatusColors[statusId] || 'gray';
const getStockStatusText = (statusId) => stockStatusTextMap[statusId] || 'Không rõ';

const isFormModalVisible = ref(false);
const formModalTitle = ref('');
const formModalKey = ref(0);

const getNewEmptyProduct = () => ({
  id: null,
  name: '',
  category_id: null,
  brand_id: null,
  description: '',
  weight: null,
  dimensions: '',
  wheelbase: null,
  seat_height: null,
  ground_clearance: null,
  fuel_capacity: null,
  tire_size: '',
  front_suspension: '',
  rear_suspension: '',
  engine_type: '',
  max_power: '',
  oil_capacity: null,
  fuel_consumption: '',
  transmission_type: '',
  starter_system: '',
  max_torque: '',
  displacement: null,
  bore_stroke: '',
  compression_ratio: '',
  status_id: 'out-of-stock',
  variants: [
    {
      id: null,
      price: null,
      optionValues: {},
      cover_image_url: '',
      photo_collection: [],
      url: '',
    },
  ],
});

const editableProduct = ref(getNewEmptyProduct());
const isEditMode = computed(() => !!editableProduct.value?.id);

const formErrors = ref({ name: '', category_id: '', variants: [], _backend: {} });


const openAddEditModal = async (product = null) => {
  formErrors.value = { name: '', category_id: '', variants: [], _backend: {} };
  if (product) {
    formModalTitle.value = 'Chỉnh Sửa Sản Phẩm';
    formModalKey.value++;
    isFormModalVisible.value = true;

    const cachedData = queryClient.getQueryData(['products', product.id]);
    if (cachedData) {
      editableProduct.value = JSON.parse(JSON.stringify(cachedData));
      queryClient.fetchQuery({
        queryKey: ['products', product.id],
        queryFn: () => productApi.getProductById(product.id),
      }).then((freshData) => {
        if (freshData) {
          editableProduct.value = JSON.parse(JSON.stringify(freshData));
        }
      }).catch(() => {});
    } else {
      isRefreshing.value = true;
      try {
        const freshData = await queryClient.fetchQuery({
          queryKey: ['products', product.id],
          queryFn: () => productApi.getProductById(product.id),
        });
        if (freshData) {
          editableProduct.value = JSON.parse(JSON.stringify(freshData));
        }
      } catch (e) {
        toast.error(`Lỗi tải dữ liệu: ${e.message}`);
      } finally {
        isRefreshing.value = false;
      }
    }
  } else {
    editableProduct.value = getNewEmptyProduct();
    formModalTitle.value = 'Thêm Sản Phẩm Mới';
    formModalKey.value++;
    isFormModalVisible.value = true;
  }
};

const handleCloseFormModal = () => {
  isFormModalVisible.value = false;
};

const handleRefreshForm = async () => {
  if (isEditMode.value && editableProduct.value.id) {
    isRefreshing.value = true;
    try {
      const freshData = await queryClient.fetchQuery({
        queryKey: ['products', editableProduct.value.id],
        queryFn: () => productApi.getProductById(editableProduct.value.id),
        staleTime: 0,
      });
      if (freshData) {
        editableProduct.value = JSON.parse(JSON.stringify(freshData));
      }
      toast.info('Đã làm mới dữ liệu sản phẩm');
    } catch (e) {
      toast.error(`Lỗi làm mới: ${e.message}`);
    } finally {
      isRefreshing.value = false;
    }
  }
};

const validateProduct = (productData) => {
  const errors = { name: '', category_id: '', variants: [] };
  let hasError = false;

  if (!productData.name) {
    errors.name = 'Vui lòng nhập tên dòng sản phẩm.';
    hasError = true;
  }
  if (!productData.category_id) {
    errors.category_id = 'Vui lòng chọn danh mục.';
    hasError = true;
  }
  if (!productData.variants || productData.variants.length === 0) {
    hasError = true;
  }

  const variantErrors = [];
  const seenCombinations = new Set();
  const seenSlugs = new Set();

  (productData.variants || []).forEach((variant, index) => {
    const vErrors = {};
    if (variant.price === null || variant.price === '' || isNaN(variant.price) || variant.price < 0) {
      vErrors.price = 'Vui lòng nhập Giá Bán hợp lệ (lớn hơn 0).';
      hasError = true;
    }
    if (!variant.url) {
      vErrors.url = 'Vui lòng nhập URL Slug.';
      hasError = true;
    }
    const optionEntries = Object.entries(variant.optionValues || {});
    if (optionEntries.length > 0) {
      const hasEmptyValues = optionEntries.some(([, val]) => !val || !val.trim());
      if (hasEmptyValues) {
        vErrors.combination = 'Vui lòng nhập đầy đủ giá trị cho tất cả thuộc tính.';
        hasError = true;
      } else {
        const sig = JSON.stringify(
          Object.keys(variant.optionValues)
            .sort()
            .reduce((o, k) => { o[k] = variant.optionValues[k]; return o; }, {}),
        );
        if (seenCombinations.has(sig)) {
          vErrors.combination = 'Tổ hợp thuộc tính này bị trùng lặp.';
          hasError = true;
        } else {
          seenCombinations.add(sig);
        }
      }
    }
    
    // Check for duplicate URLs (slugs)
    if (variant.url) {
      if (seenSlugs.has(variant.url)) {
        vErrors.url = 'URL Slug này bị trùng lặp với biến thể khác.';
        hasError = true;
      } else {
        seenSlugs.add(variant.url);
      }
    }

    variantErrors[index] = vErrors;
  });

  errors.variants = variantErrors;
  return { hasError, errors };
};

const handleSaveProduct = async () => {
  const productData = editableProduct.value;
  const { hasError, errors } = validateProduct(productData);
  formErrors.value = errors;
  if (hasError) return;

  isSaving.value = true;
  try {
    const isEditing = isEditMode.value;
    let result;
    if (isEditing) {
      result = await productsStore.updateProduct(productData.id, productData);
    } else {
      result = await productsStore.createProduct(productData);
    }
    if (result?.id) {
      queryClient.setQueryData(['products', result.id], result);
    }
    isFormModalVisible.value = false;
    await queryClient.invalidateQueries({ queryKey: ['products'] });
    toast.success(isEditing ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công');
  } catch (err) {
    const backendErrors = err?.response?.data?.errors || err?.response?.data?.Errors || null;
    if (backendErrors && err?.response?.status === 400) {
      const normalized = {};
      const variantErrorsFromBackend = [];
      Object.entries(backendErrors).forEach(([key, messages]) => {
        const msg = Array.isArray(messages) ? messages[0] : messages;
        const normalizedKey = key.toLowerCase();
        normalized[normalizedKey] = msg;
        
        // Parse "$.variants[0].price" or "variants[0].price"
        const variantMatch = key.match(/(?:\$\.)?variants\[(\d+)\]\.(.+)/i);
        if (variantMatch) {
          const index = parseInt(variantMatch[1], 10);
          const field = variantMatch[2].toLowerCase();
          if (!variantErrorsFromBackend[index]) {
            variantErrorsFromBackend[index] = {};
          }
          variantErrorsFromBackend[index][field] = msg;
        }
      });

      const mergedVariantErrors = [];
      const maxLen = Math.max(
        formErrors.value.variants?.length || 0,
        variantErrorsFromBackend.length
      );
      for (let i = 0; i < maxLen; i++) {
        mergedVariantErrors[i] = {
          ...(formErrors.value.variants?.[i] || {}),
          ...(variantErrorsFromBackend[i] || {})
        };
      }

      formErrors.value = {
        ...formErrors.value,
        _backend: normalized,
        name: normalized['name'] || formErrors.value.name,
        category_id: normalized['category_id'] || normalized['categoryid'] || formErrors.value.category_id,
        variants: mergedVariantErrors,
      };
      
      // Inject global variant array errors like "duplicate slugs" into the top-level formError
      if (normalized['varients']) {
        formErrors.value._backend = formErrors.value._backend || {};
        formErrors.value._backend.varients = normalized['varients'];
      }
      if (normalized['variants']) {
        formErrors.value._backend = formErrors.value._backend || {};
        formErrors.value._backend.variants = normalized['variants'];
      }
      toast.warning('Vui lòng kiểm tra lại các trường có lỗi.');
    } else {
      toast.error(err.message || 'Lỗi khi lưu sản phẩm');
    }
  } finally {
    isSaving.value = false;
  }
};

const promptDelete = async (product) => {
  try {
    await productsStore.deleteProduct(product);
    queryClient.removeQueries({ queryKey: ['products', product.id] });
    await queryClient.invalidateQueries({ queryKey: ['products'] });
    toast.success('Xoá sản phẩm thành công');
  } catch (err) {
    toast.error(err.message || 'Lỗi khi xoá sản phẩm');
  }
};

const importExcel = (event) => {
  toast.info('Chức năng Import Excel đang phát triển');
  event.target.value = '';
};

const exportExcel = () => {
  toast.info('Chức năng Export Excel đang phát triển');
};
</script>

<template>
  <LoadingOverlay :show="isStoreLoading" message="Đang xử lý..." />

  <div class="p-4 sm:p-6 rounded-xl shadow-lg bg-white">
    <div
      class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0"
    >
      <h1 class="text-3xl font-bold text-gray-800">Quản lý sản phẩm</h1>
      <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto">
        <Button text="Thêm sản phẩm" :icon="IconPlus" color="primary" @click="openAddEditModal()" />
        <label for="import-product-input" class="cursor-pointer">
          <Button text="Import" :icon="IconFileImport" color="secondary" as="span" />
          <input
            type="file"
            id="import-product-input"
            accept=".xlsx, .xls"
            class="hidden"
            @change="importExcel"
          />
        </label>
        <Button text="Export" :icon="IconFileExport" color="secondary" @click="exportExcel" />
      </div>
    </div>

    <Input
      v-model="searchRefs.search"
      type="text"
      placeholder="Tìm kiếm theo tên sản phẩm..."
      class="mb-3"
    />

    <div
      v-if="isError"
      class="text-center py-12 text-red-500 font-medium bg-white rounded-lg shadow-sm border border-gray-200"
    >
      Đã xảy ra lỗi khi lấy dữ liệu: {{ error?.message }}
    </div>

    <div v-else class="overflow-x-auto rounded-lg shadow-sm border border-gray-300">
      <table class="min-w-full bg-white border-collapse">
        <thead
          class="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs font-medium border-b border-gray-200"
        >
          <tr>
            <th class="py-3 px-6 text-left w-12"></th>
            <th class="py-3 px-6 text-left w-20">Ảnh Bìa</th>
            <th class="py-3 px-6 text-left">Tên Dòng Sản Phẩm</th>
            <th class="py-3 px-6 text-left">Danh Mục</th>
            <th class="py-3 px-6 text-left">Thương Hiệu</th>
            <th class="py-3 px-6 text-left">Số Biến Thể</th>
            <th class="py-3 px-6 text-left">Trạng Thái Kho</th>
            <th class="py-3 px-6 text-center">Thao Tác</th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm font-light">
          <template v-if="products.length === 0">
            <template v-if="isLoading">
              <tr v-for="i in 5" :key="i" class="border-b border-gray-200">
                <td class="py-3 px-6 text-center"><SkeletonLoader width="16px" height="16px" /></td>
                <td class="py-3 px-6"><SkeletonLoader width="64px" height="64px" class="rounded-md" /></td>
                <td class="py-3 px-6"><SkeletonLoader width="150px" height="20px" /></td>
                <td class="py-3 px-6"><SkeletonLoader width="100px" height="20px" /></td>
                <td class="py-3 px-6"><SkeletonLoader width="80px" height="20px" /></td>
                <td class="py-3 px-6"><SkeletonLoader width="40px" height="20px" /></td>
                <td class="py-3 px-6"><SkeletonLoader width="90px" height="24px" class="rounded-full" /></td>
                <td class="py-3 px-6 text-center flex justify-center gap-2 mt-4">
                  <SkeletonLoader width="40px" height="20px" />
                  <SkeletonLoader width="40px" height="20px" />
                </td>
              </tr>
            </template>
            <tr v-else>
              <td :colspan="numberOfColumns" class="text-center py-6 text-gray-500">
                Không có sản phẩm nào để hiển thị.
              </td>
            </tr>
          </template>

          <template v-for="product in products" :key="product.id">
            <tr class="border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200">
              <td class="py-3 px-6 w-12 text-center border-r border-gray-200">
                <button
                  v-if="product.variants && product.variants.length > 0"
                  @click="toggleDetails(product.id)"
                  class="text-gray-500 hover:text-gray-800"
                >
                  <IconLeftArrow v-if="!isExpanded(product.id)" />
                  <IconDownArrow v-else />
                </button>
              </td>
              <td class="py-3 px-6 text-left w-20">
                <img
                  :src="product.cover_image_url || 'https://placehold.co/100x100/gray/white?text=N/A'"
                  alt="Ảnh bìa"
                  class="w-16 h-16 object-cover rounded-md border border-gray-200"
                  @error="(e) => (e.target.src = 'https://placehold.co/100x100/gray/white?text=Error')"
                />
              </td>
              <td class="py-3 px-6 whitespace-nowrap font-medium text-gray-800">{{ product.name }}</td>
              <td class="py-3 px-6">{{ product.category }}</td>
              <td class="py-3 px-6">{{ product.brand }}</td>
              <td class="py-3 px-6">{{ product.variants ? product.variants.length : 0 }}</td>
              <td class="py-3 px-6">
                <RoundBadge :color="getStockStatusColor(product.status_stock_id)">
                  {{ getStockStatusText(product.status_stock_id) }}
                </RoundBadge>
              </td>
              <td class="py-3 px-6 text-center space-x-2">
                <SmallNoBgButton @click="openAddEditModal(product)" :icon="IconEdit">Sửa</SmallNoBgButton>
                <SmallNoBgButton color="red" @click="promptDelete(product)" :icon="IconTrash">Xóa</SmallNoBgButton>
              </td>
            </tr>

            <tr v-if="isExpanded(product.id)" class="bg-gray-50 border-b border-gray-200">
              <td :colspan="numberOfColumns" class="p-0">
                <div class="p-3 px-10 border-t border-gray-200 bg-white">
                  <div class="flex border-b border-gray-200 mb-3 space-x-5">
                    <button
                      class="py-1.5 text-sm"
                      :class="
                        getActiveTab(product.id) === 'variants'
                          ? 'font-semibold border-b-2 border-red-500 text-red-600'
                          : 'text-gray-600 hover:text-gray-800'
                      "
                      @click="setActiveTab(product.id, 'variants')"
                    >
                      Biến thể sản phẩm
                    </button>
                    <button
                      class="py-1.5 text-sm"
                      :class="
                        getActiveTab(product.id) === 'specs'
                          ? 'font-semibold border-b-2 border-red-500 text-red-600'
                          : 'text-gray-600 hover:text-gray-800'
                      "
                      @click="setActiveTab(product.id, 'specs')"
                    >
                      Thông số kỹ thuật
                    </button>
                  </div>

                  <div v-show="getActiveTab(product.id) === 'variants'">
                    <table class="min-w-full bg-white rounded shadow-sm text-sm border border-gray-200 overflow-hidden">
                      <thead class="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th class="py-2 px-4 text-left w-20 text-gray-700 font-semibold tracking-wider">Ảnh</th>
                          <th class="py-2 px-4 text-left text-gray-700 font-semibold tracking-wider">Thuộc tính</th>
                          <th class="py-2 px-4 text-left text-gray-700 font-semibold tracking-wider">Giá Bán</th>
                          <th class="py-2 px-4 text-left text-gray-700 font-semibold tracking-wider">Tồn Kho</th>
                          <th class="py-2 px-4 text-left text-gray-700 font-semibold tracking-wider">Đã Đặt</th>
                          <th class="py-2 px-4 text-left text-gray-700 font-semibold tracking-wider">Hiện Có</th>
                          <th class="py-2 px-4 text-left text-gray-700 font-semibold tracking-wider">Trạng Thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="variant in product.variants" :key="variant.id" class="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-150">
                          <td class="py-2 px-4 w-20">
                            <img
                              :src="variant.cover_image_url || 'https://placehold.co/100x100/gray/white?text=N/A'"
                              class="w-12 h-12 object-cover rounded-md border border-gray-200"
                              @error="(e) => (e.target.src = 'https://placehold.co/100x100/gray/white?text=Error')"
                            />
                          </td>
                          <td class="py-2 px-4 text-gray-800 font-medium">{{ getVariantOptionsText(variant) }}</td>
                          <td class="py-2 px-4 font-semibold text-gray-900">{{ formatCurrency(variant.price) }}</td>
                          <td class="py-2 px-4 text-gray-600">{{ variant.stock }}</td>
                          <td class="py-2 px-4 text-gray-600">{{ variant.has_been_booked }}</td>
                          <td class="py-2 px-4 font-medium" :class="(variant.stock - variant.has_been_booked) > 0 ? 'text-green-600' : 'text-red-500'">{{ variant.stock - variant.has_been_booked }}</td>
                          <td class="py-2 px-4">
                            <RoundBadge :color="getStockStatusColor(variant.status_stock_id)">
                              {{ getStockStatusText(variant.status_stock_id) }}
                            </RoundBadge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div v-show="getActiveTab(product.id) === 'specs'" class="pt-2">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                      <div class="text-sm">
                        <span class="text-gray-500 block">Khối lượng</span>
                        <span class="font-medium text-gray-800">{{ product.weight ? product.weight + ' kg' : '---' }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Kích thước</span>
                        <span class="font-medium text-gray-800">{{ product.dimensions || '---' }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Dung tích</span>
                        <span class="font-medium text-gray-800">{{ product.displacement ? product.displacement + ' cc' : '---' }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Tỷ số nén</span>
                        <span class="font-medium text-gray-800">{{ product.compression_ratio || '---' }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Đường kính x Hành trình piston</span>
                        <span class="font-medium text-gray-800">{{ product.bore_stroke || '---' }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Loại động cơ</span>
                        <span class="font-medium text-gray-800">{{ product.engine_type || '---' }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Công suất tối đa</span>
                        <span class="font-medium text-gray-800">{{ product.max_power || '---' }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Mô-men xoắn cực đại</span>
                        <span class="font-medium text-gray-800">{{ product.max_torque || '---' }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Tiêu hao nhiên liệu</span>
                        <span class="font-medium text-gray-800">{{ product.fuel_consumption || '---' }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Dung tích bình xăng</span>
                        <span class="font-medium text-gray-800">{{ product.fuel_capacity ? product.fuel_capacity + ' L' : '---' }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Dung tích nhớt máy</span>
                        <span class="font-medium text-gray-800">{{ product.oil_capacity ? product.oil_capacity + ' L' : '---' }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Loại truyền động</span>
                        <span class="font-medium text-gray-800">{{ product.transmission_type || '---' }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Hệ thống khởi động</span>
                        <span class="font-medium text-gray-800">{{ product.starter_system || '---' }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Phuộc trước</span>
                        <span class="font-medium text-gray-800">{{ product.front_suspension || '---' }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Phuộc sau</span>
                        <span class="font-medium text-gray-800">{{ product.rear_suspension || '---' }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Kích cỡ lốp</span>
                        <span class="font-medium text-gray-800">{{ product.tire_size || '---' }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Khoảng cách trục bánh xe</span>
                        <span class="font-medium text-gray-800">{{ product.wheelbase ? product.wheelbase + ' mm' : '---' }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Độ cao yên</span>
                        <span class="font-medium text-gray-800">{{ product.seat_height ? product.seat_height + ' mm' : '---' }}</span>
                      </div>
                      <div class="text-sm">
                        <span class="text-gray-500 block">Khoảng sáng gầm xe</span>
                        <span class="font-medium text-gray-800">{{ product.ground_clearance ? product.ground_clearance + ' mm' : '---' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <Pagination
      :total-pages="pagination.totalPages.value"
      :currentPage="pagination.currentPage.value"
      @update:currentPage="pagination.changePage"
      :loading="isLoading"
    />
  </div>

  <DraggableModal
    :key="formModalKey"
    v-if="isFormModalVisible"
    @close="handleCloseFormModal"
    :onRefresh="isEditMode ? handleRefreshForm : undefined"
    :isLoading="isRefreshing"
    width="72vw"
  >
    <template #header>
      <span class="font-bold text-lg">{{ formModalTitle }}</span>
    </template>
    <template #body>
      <ProductForm
        v-model="editableProduct"
        :is-edit-mode="isEditMode"
        :errors="formErrors"
        :is-saving="isSaving"
      />
    </template>
    <template #footer>
      <div class="flex justify-end gap-3 w-full">
        <Button text="Huỷ bỏ" color="gray" @click="handleCloseFormModal" />
        <Button text="Lưu" color="purple" @click="handleSaveProduct" :loading="isSaving" />
      </div>
    </template>
  </DraggableModal>
</template>
