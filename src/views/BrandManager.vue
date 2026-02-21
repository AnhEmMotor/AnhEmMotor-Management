<script setup>
import { ref } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import * as brandApi from '@/api/brand';
import { usePaginatedQuery } from '@/composables/usePaginatedQuery';
import { showConfirmation } from '@/composables/useConfirmationState';
import { useToast } from 'vue-toastification';
import Button from '@/components/ui/button/BaseButton.vue';
import Input from '@/components/ui/input/BaseInput.vue';
import Pagination from '@/components/ui/button/BasePagination.vue';
import SmallNoBgButton from '@/components/ui/button/SmallNoBgButton.vue';
import DraggableModal from '@/components/ui/DraggableModal.vue';
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue';
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue';
import IconPlus from '@/components/icons/IconPlus.vue';
import IconFileImport from '@/components/icons/IconFileImport.vue';
import IconFileExport from '@/components/icons/IconFileExport.vue';
import IconEdit from '@/components/icons/IconEdit.vue';
import IconTrash from '@/components/icons/IconTrash.vue';

const queryClient = useQueryClient();
const toast = useToast();

const isSaving = ref(false);
const isRefreshing = ref(false);
const isOverlayVisible = ref(false);
const isFormModalVisible = ref(false);
const formModalKey = ref(0);
const editableBrand = ref({ id: null, name: '', description: '' });
const formErrors = ref({ name: '' });

const isEditMode = ref(false);
const formModalTitle = ref('');

const {
  data: brands,
  isLoading,
  isError,
  pagination,
  searchRefs,
} = usePaginatedQuery({
  queryKey: ['brands'],
  queryFn: brandApi.fetchBrands,
  itemsPerPage: 10,
  searchFields: [{ key: 'search', debounce: 400 }],
});

const openAddModal = () => {
  editableBrand.value = { id: null, name: '', description: '' };
  formErrors.value = { name: '' };
  isEditMode.value = false;
  formModalTitle.value = 'Thêm thương hiệu mới';
  formModalKey.value++;
  isFormModalVisible.value = true;
};

const openEditModal = async (brand) => {
  editableBrand.value = { id: brand.id, name: '', description: '' };
  formErrors.value = { name: '' };
  isEditMode.value = true;
  formModalTitle.value = 'Chỉnh sửa thương hiệu';
  formModalKey.value++;
  isFormModalVisible.value = true;
  
  // Load from cache or fetch
  const cachedData = queryClient.getQueryData(['brands', brand.id]);
  
  if (!cachedData) {
    isRefreshing.value = true;
  } else {
    editableBrand.value = { ...cachedData };
  }

  try {
    const fetchedData = await queryClient.fetchQuery({
      queryKey: ['brands', brand.id],
      queryFn: () => brandApi.getBrandById(brand.id),
      staleTime: 0,
    });
    if (fetchedData) {
      editableBrand.value = { ...fetchedData };
    }
  } catch (e) {
    if (!cachedData) {
      toast.error('Lỗi khi tải chi tiết thương hiệu');
      editableBrand.value = { ...brand }; // Fallback to list data
    }
  } finally {
    isRefreshing.value = false;
  }
};

const handleCloseModal = () => {
  isFormModalVisible.value = false;
};

const validate = () => {
  const errors = { name: '' };
  let valid = true;
  if (!editableBrand.value.name?.trim()) {
    errors.name = 'Vui lòng nhập tên thương hiệu.';
    valid = false;
  }
  formErrors.value = errors;
  return valid;
};

const handleSave = async () => {
  if (!validate()) return;
  isSaving.value = true;
  try {
    if (isEditMode.value) {
      const updatedBrand = await brandApi.updateBrand(editableBrand.value.id, {
        id: editableBrand.value.id,
        name: editableBrand.value.name,
        description: editableBrand.value.description,
      });
      queryClient.setQueryData(['brands', updatedBrand.id], updatedBrand);
      toast.success('Cập nhật thương hiệu thành công');
    } else {
      const newBrand = await brandApi.createBrand({
        name: editableBrand.value.name,
        description: editableBrand.value.description,
      });
      queryClient.setQueryData(['brands', newBrand.id], newBrand);
      toast.success('Thêm thương hiệu thành công');
    }
    isFormModalVisible.value = false;
    await queryClient.invalidateQueries({ queryKey: ['brands'] });
  } catch (err) {
    toast.error(err.message || 'Lỗi khi lưu thương hiệu');
  } finally {
    isSaving.value = false;
  }
};

const promptDelete = async (brand) => {
  const confirmed = await showConfirmation(
    'Xác nhận xóa',
    `Bạn có chắc chắn muốn xoá thương hiệu "${brand.name}"?`,
  );
  if (!confirmed) return;

  isOverlayVisible.value = true;
  try {
    await brandApi.deleteBrand(brand.id);
    queryClient.removeQueries({ queryKey: ['brands', brand.id] });
    await queryClient.invalidateQueries({ queryKey: ['brands'] });
    toast.success('Xoá thương hiệu thành công');
  } catch (err) {
    toast.error(err.message || 'Lỗi khi xoá thương hiệu');
  } finally {
    isOverlayVisible.value = false;
  }
};

const importExcel = (event) => {
  toast.info('Chức năng Import Excel đang phát triển');
  event.target.value = '';
};

const exportExcel = () => {
  toast.info('Chức năng Export Excel đang phát triển');
};

const handleRefreshForm = async () => {
  if (isEditMode.value && editableBrand.value.id) {
    isRefreshing.value = true;
    try {
      const freshData = await queryClient.fetchQuery({
        queryKey: ['brands', editableBrand.value.id],
        queryFn: () => brandApi.getBrandById(editableBrand.value.id),
        staleTime: 0,
      });
      if (freshData) {
        editableBrand.value = { ...freshData };
      }
      toast.info('Đã tải lại dữ liệu thương hiệu');
    } catch (e) {
      toast.error(`Lỗi tải lại: ${e.message}`);
    } finally {
      isRefreshing.value = false;
    }
  } else {
    editableBrand.value = { id: null, name: '', description: '' };
    formErrors.value = { name: '' };
    toast.info('Đã làm mới form');
  }
};
</script>

<template>
  <LoadingOverlay :show="isOverlayVisible || isSaving" message="Đang xử lý..." />

  <div class="p-4 sm:p-6 rounded-xl shadow-lg bg-white">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0"
    >
      <h1 class="text-3xl font-bold text-gray-800">Quản lý thương hiệu</h1>
      <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto">
        <Button text="Thêm thương hiệu" :icon="IconPlus" color="primary" @click="openAddModal" />
        <label for="import-brand-input" class="cursor-pointer">
          <Button text="Import" :icon="IconFileImport" color="secondary" as="span" />
          <input
            type="file"
            id="import-brand-input"
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
      placeholder="Tìm kiếm theo tên thương hiệu..."
      class="mb-3"
    />

    <div
      v-if="isError"
      class="text-center py-12 text-red-500 font-medium bg-white rounded-lg shadow-sm border border-gray-200"
    >
      Đã xảy ra lỗi khi tải danh sách thương hiệu.
    </div>

    <div v-else class="overflow-x-auto rounded-lg shadow-sm border border-gray-300">
      <table class="min-w-full bg-white border-collapse">
        <thead
          class="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs font-medium border-b border-gray-200"
        >
          <tr>
            <th class="py-3 px-6 text-left">Tên thương hiệu</th>
            <th class="py-3 px-6 text-left">Mô tả</th>
            <th class="py-3 px-6 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm font-light">
          <template v-if="brands.length === 0">
            <template v-if="isFetching || isLoading">
              <tr v-for="i in 5" :key="i" class="border-b border-gray-200">
                <td class="py-3 px-6"><SkeletonLoader width="140px" height="20px" /></td>
                <td class="py-3 px-6"><SkeletonLoader width="220px" height="20px" /></td>
                <td class="py-3 px-6 text-center flex justify-center gap-2">
                  <SkeletonLoader width="40px" height="20px" />
                  <SkeletonLoader width="40px" height="20px" />
                </td>
              </tr>
            </template>
            <tr v-else>
              <td colspan="3" class="text-center py-6 text-gray-500">
                Không có thương hiệu nào để hiển thị.
              </td>
            </tr>
          </template>
          <tr
            v-for="brand in brands"
            :key="brand.id"
            class="border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200"
          >
            <td class="py-3 px-6 font-medium text-gray-800">{{ brand.name }}</td>
            <td class="py-3 px-6 text-gray-500">{{ brand.description || '—' }}</td>
            <td class="py-3 px-6 text-center space-x-2">
              <SmallNoBgButton @click="openEditModal(brand)" :icon="IconEdit">Sửa</SmallNoBgButton>
              <SmallNoBgButton color="red" @click="promptDelete(brand)" :icon="IconTrash">Xóa</SmallNoBgButton>
            </td>
          </tr>
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
    @close="handleCloseModal"
    :onRefresh="isEditMode ? handleRefreshForm : undefined"
    :isLoading="isRefreshing"
    width="480px"
  >
    <template #header>
      <span class="font-bold text-lg">{{ formModalTitle }}</span>
    </template>
    <template #body>
      <div class="space-y-4 p-1">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Tên thương hiệu <span class="text-red-500">*</span>
          </label>
          <Input v-model="editableBrand.name" placeholder="Nhập tên thương hiệu..." />
          <p v-if="formErrors.name" class="text-red-500 text-xs mt-1">{{ formErrors.name }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea
            v-model="editableBrand.description"
            placeholder="Nhập mô tả (tùy chọn)..."
            rows="3"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
          />
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <Button text="Huỷ bỏ" color="gray" @click="handleCloseModal" :disabled="isSaving || isRefreshing" />
        <Button text="Lưu" color="purple" @click="handleSave" :loading="isSaving" :disabled="isRefreshing" />
      </div>
    </template>
  </DraggableModal>
</template>
