<script setup>
import { ref } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import * as categoryApi from '@/api/productCategory';
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
const isOverlayVisible = ref(false);
const isFormModalVisible = ref(false);
const formModalKey = ref(0);
const editableCategory = ref({ id: null, name: '', description: '' });
const formErrors = ref({ name: '' });
const isEditMode = ref(false);
const formModalTitle = ref('');

const {
  data: categories,
  isLoading,
  isError,
  pagination,
  searchRefs,
} = usePaginatedQuery({
  queryKey: ['categories'],
  queryFn: categoryApi.fetchCategories,
  itemsPerPage: 10,
  searchFields: [{ key: 'search', debounce: 400 }],
});

const openAddModal = () => {
  editableCategory.value = { id: null, name: '', description: '' };
  formErrors.value = { name: '' };
  isEditMode.value = false;
  formModalTitle.value = 'Thêm thể loại mới';
  formModalKey.value++;
  isFormModalVisible.value = true;
};

const openEditModal = (category) => {
  editableCategory.value = { ...category };
  formErrors.value = { name: '' };
  isEditMode.value = true;
  formModalTitle.value = 'Chỉnh sửa thể loại';
  formModalKey.value++;
  isFormModalVisible.value = true;
};

const handleCloseModal = () => {
  isFormModalVisible.value = false;
};

const validate = () => {
  const errors = { name: '' };
  let valid = true;
  if (!editableCategory.value.name?.trim()) {
    errors.name = 'Vui lòng nhập tên thể loại.';
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
      await categoryApi.updateProductCategory(editableCategory.value.id, {
        id: editableCategory.value.id,
        name: editableCategory.value.name,
        description: editableCategory.value.description,
      });
      toast.success('Cập nhật thể loại thành công');
    } else {
      await categoryApi.createProductCategory({
        name: editableCategory.value.name,
        description: editableCategory.value.description,
      });
      toast.success('Thêm thể loại thành công');
    }
    isFormModalVisible.value = false;
    await queryClient.invalidateQueries({ queryKey: ['categories'] });
  } catch (err) {
    toast.error(err.message || 'Lỗi khi lưu thể loại');
  } finally {
    isSaving.value = false;
  }
};

const promptDelete = async (category) => {
  const confirmed = await showConfirmation(
    'Xác nhận xóa',
    `Bạn có chắc chắn muốn xoá thể loại "${category.name}"?`,
  );
  if (!confirmed) return;

  isOverlayVisible.value = true;
  try {
    await categoryApi.deleteProductCategory(category.id);
    await queryClient.invalidateQueries({ queryKey: ['categories'] });
    toast.success('Xoá thể loại thành công');
  } catch (err) {
    toast.error(err.message || 'Lỗi khi xoá thể loại');
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
</script>

<template>
  <LoadingOverlay :show="isOverlayVisible || isSaving" message="Đang xử lý..." />

  <div class="p-4 sm:p-6 rounded-xl shadow-lg bg-white">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0"
    >
      <h1 class="text-3xl font-bold text-gray-800">Quản lý thể loại sản phẩm</h1>
      <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto">
        <Button text="Thêm thể loại" :icon="IconPlus" color="primary" @click="openAddModal" />
        <label for="import-category-input" class="cursor-pointer">
          <Button text="Import" :icon="IconFileImport" color="secondary" as="span" />
          <input
            type="file"
            id="import-category-input"
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
      placeholder="Tìm kiếm theo tên thể loại..."
      class="mb-3"
    />

    <div v-if="isLoading" class="overflow-x-auto rounded-lg shadow-sm border border-gray-300">
      <table class="min-w-full bg-white border-collapse">
        <thead
          class="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs font-medium border-b border-gray-200"
        >
          <tr>
            <th class="py-3 px-6 text-left">#</th>
            <th class="py-3 px-6 text-left">Tên thể loại</th>
            <th class="py-3 px-6 text-left">Mô tả</th>
            <th class="py-3 px-6 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in 5" :key="i" class="border-b border-gray-200">
            <td class="py-3 px-6"><SkeletonLoader width="30px" height="20px" /></td>
            <td class="py-3 px-6"><SkeletonLoader width="140px" height="20px" /></td>
            <td class="py-3 px-6"><SkeletonLoader width="220px" height="20px" /></td>
            <td class="py-3 px-6 text-center flex justify-center gap-2">
              <SkeletonLoader width="40px" height="20px" />
              <SkeletonLoader width="40px" height="20px" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-else-if="isError"
      class="text-center py-12 text-red-500 font-medium bg-white rounded-lg shadow-sm border border-gray-200"
    >
      Đã xảy ra lỗi khi tải danh sách thể loại.
    </div>

    <div v-else class="overflow-x-auto rounded-lg shadow-sm border border-gray-300">
      <table class="min-w-full bg-white border-collapse">
        <thead
          class="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs font-medium border-b border-gray-200"
        >
          <tr>
            <th class="py-3 px-6 text-left">#</th>
            <th class="py-3 px-6 text-left">Tên thể loại</th>
            <th class="py-3 px-6 text-left">Mô tả</th>
            <th class="py-3 px-6 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody class="text-gray-600 text-sm font-light">
          <tr v-if="categories.length === 0">
            <td colspan="4" class="text-center py-6 text-gray-500">
              Không có thể loại nào để hiển thị.
            </td>
          </tr>
          <tr
            v-for="category in categories"
            :key="category.id"
            class="border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200"
          >
            <td class="py-3 px-6 text-gray-400">{{ category.id }}</td>
            <td class="py-3 px-6 font-medium text-gray-800">{{ category.name }}</td>
            <td class="py-3 px-6 text-gray-500">{{ category.description || '—' }}</td>
            <td class="py-3 px-6 text-center space-x-2">
              <SmallNoBgButton @click="openEditModal(category)" :icon="IconEdit">Sửa</SmallNoBgButton>
              <SmallNoBgButton color="red" @click="promptDelete(category)" :icon="IconTrash">Xóa</SmallNoBgButton>
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
    width="480px"
  >
    <template #header>
      <span class="font-bold text-lg">{{ formModalTitle }}</span>
    </template>
    <template #body>
      <div class="space-y-4 p-1">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Tên thể loại <span class="text-red-500">*</span>
          </label>
          <Input v-model="editableCategory.name" placeholder="Nhập tên thể loại..." />
          <p v-if="formErrors.name" class="text-red-500 text-xs mt-1">{{ formErrors.name }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea
            v-model="editableCategory.description"
            placeholder="Nhập mô tả (tùy chọn)..."
            rows="3"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
          />
        </div>
      </div>
    </template>
    <template #footer>
      <Button text="Lưu" color="purple" @click="handleSave" :loading="isSaving" />
    </template>
  </DraggableModal>
</template>
