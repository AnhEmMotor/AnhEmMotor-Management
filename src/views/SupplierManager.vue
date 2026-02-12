<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import { useSuppliersStore } from '@/stores/useSuppliersStore';
import { useToast } from 'vue-toastification';
import { usePaginatedQuery } from '@/composables/usePaginatedQuery';
import { fetchSuppliers } from '@/api/supplier';
import { useRoute, useRouter } from 'vue-router';
import SupplierItem from '@/components/supplier/SupplierItem.vue';
import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';
import Pagination from '@/components/ui/button/Pagination.vue';
import SupplierFilterButtons from '@/components/supplier/SupplierFilterButtons.vue';
import DraggableModal from '@/components/ui/DraggableModal.vue';
import SupplierForm from '@/components/supplier/SupplierForm.vue';
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue';
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue';
import { showConfirmation } from '@/composables/useConfirmationState';
import IconPlus from '@/components/icons/IconPlus.vue';
import IconFileImport from '@/components/icons/IconFileImport.vue';
import IconFileExport from '@/components/icons/IconFileExport.vue';

const toast = useToast();
const queryClient = useQueryClient();
const suppliersStore = useSuppliersStore();
const route = useRoute();
const router = useRouter();

const rawSearch = ref('');
const debouncedSearch = ref('');
// Initialize from URL if present
const initializeStatus = () => {
  const statusQuery = route.query.status;
  if (!statusQuery) return [];
  if (Array.isArray(statusQuery)) return statusQuery;
  return statusQuery.includes(',') ? statusQuery.split(',') : [statusQuery];
};
const selectedStatuses = ref(initializeStatus());

const openStates = reactive({});
const showOverlay = ref(false);
const overlayMessage = ref('');

let searchTimeout;
watch(rawSearch, (val) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = val;
  }, 300);
});

const filters = computed(() => {
  const f = {};
  f.status = selectedStatuses.value.length ? selectedStatuses.value : undefined;
  return f;
});

const {
  data: suppliers,
  isLoading,
  isError,
  isFetching,
  pagination,
  searchTerm,
} = usePaginatedQuery({
  queryKey: ['suppliers'],
  queryFn: fetchSuppliers,
  itemsPerPage: 10,
  filters,
  queryOptions: {
    syncFiltersToUrl: true,
  },
});

const isMutating = computed(
  () =>
    suppliersStore.isAdding ||
    suppliersStore.isEditing ||
    suppliersStore.isDeleting ||
    suppliersStore.isToggling
);

watch(isMutating, (val) => {
  showOverlay.value = val;
});

const handleToggleDetail = (id) => {
  openStates[id] = !openStates[id];
};

const toggleActivation = async (supplier) => {
  const newStatus = supplier.statusId === 'active' ? 'inactive' : 'active';
  const actionName = newStatus === 'active' ? 'Kích hoạt' : 'Ngưng kích hoạt';

  const confirmed = await showConfirmation(
    `Xác nhận ${actionName}`,
    `Bạn có chắc chắn muốn ${actionName.toLowerCase()} nhà cung cấp ${supplier.name}?`,
  );

  if (confirmed) {
    overlayMessage.value = `Đang ${actionName.toLowerCase()}...`;
    try {
      await suppliersStore.updateSupplierStatus(supplier.id, newStatus);
      toast.success(`${actionName} thành công!`);
    } catch (error) {
      toast.error(`Lỗi: ${error.message || error}`);
    }
  }
};

const isFormModalVisible = ref(false);
const formModalKey = ref(0);
const isEditMode = ref(false);
const formModalTitle = computed(() =>
  isEditMode.value ? 'Cập nhật nhà cung cấp' : 'Thêm nhà cung cấp mới',
);
const editableSupplier = ref({});
const formErrors = ref({});

const openAddEditModal = async (supplier = null) => {
  isEditMode.value = !!supplier;
  editableSupplier.value = supplier ? { ...supplier } : {};
  formErrors.value = {};
  isFormModalVisible.value = true;
  formModalKey.value++;

  if (supplier) {
    await handleFormRefresh(false, false);
  }
};

const handleCloseFormModal = () => {
  isFormModalVisible.value = false;
};

const validateForm = () => {
  const errors = {};
  if (!editableSupplier.value.name) errors.name = 'Tên nhà cung cấp là bắt buộc';
  if (!editableSupplier.value.phone) errors.phone = 'Số điện thoại là bắt buộc';
  formErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const handleSaveSupplier = async () => {
  if (!validateForm()) return;

  try {
    if (isEditMode.value) {
      overlayMessage.value = 'Đang cập nhật...';
      await suppliersStore.updateSupplier(editableSupplier.value.id, editableSupplier.value);
      toast.success('Cập nhật thành công!');
    } else {
      overlayMessage.value = 'Đang tạo mới...';
      await suppliersStore.addSupplier(editableSupplier.value);
      toast.success('Thêm mới thành công!');
    }
    handleCloseFormModal();
  } catch (error) {
    const data = error.response?.data;
    
    // Handle Validation Errors
    if (data?.type === 'Validation' && data?.errors?.length > 0) {
      const backendErrors = {};
      data.errors.forEach((e) => {
        if (e.field) {
          backendErrors[e.field.toLowerCase()] = e.message;
        }
      });
      formErrors.value = backendErrors;
      // No toast for validation errors as they are shown inline
    } else {
      // Handle other errors
      if (error.response?.status === 400) {
        toast.error('Có lỗi trong quá trình lưu nhà cung cấp');
      } else {
        toast.error(`Lỗi: ${error.message || error}`);
      }
    }
  }
};

const openDeleteModal = async (supplier) => {
  const confirmed = await showConfirmation(
    'Xóa nhà cung cấp',
    `Bạn có chắc chắn muốn xóa nhà cung cấp ${supplier.name}?`,
  );

  if (confirmed) {
    overlayMessage.value = 'Đang xóa...';
    try {
      await suppliersStore.deleteSupplier(supplier.id);
      toast.success('Xóa thành công!');
    } catch (error) {
      toast.error(`Lỗi: ${error.message || error}`);
    }
  }
};

const isRefreshing = ref(false);

const handleFormRefresh = async (showToast = true, showLoading = true) => {
  if (isEditMode.value && editableSupplier.value.id) {
    if (showLoading) isRefreshing.value = true;
    try {
      const freshData = await queryClient.fetchQuery({
        queryKey: ['suppliers', editableSupplier.value.id],
        queryFn: () => suppliersStore.getSupplierById(editableSupplier.value.id),
      });
      if (freshData) {
        editableSupplier.value = { ...freshData };
      }
      if (showToast) toast.info('Đã làm mới dữ liệu');
    } catch (e) {
      toast.error(`Lỗi làm mới: ${e.message}`);
    } finally {
      if (showLoading) isRefreshing.value = false;
    }
  } else {
    editableSupplier.value = {};
    formErrors.value = {};
    if (showToast) toast.info('Đã làm mới form');
  }
};

watch(isError, (hasError) => {
  if (hasError) {
    toast.error('Lỗi tải dữ liệu nhà cung cấp');
  }
});

const handleExport = () => {
  toast.info('Chức năng xuất Excel đang phát triển');
};

const handleImport = () => {
  toast.info('Chức năng nhập Excel đang phát triển');
};
</script>

<template>
  <div class="p-4 sm:p-6 rounded-xl shadow-lg bg-white">
    <LoadingOverlay :show="showOverlay" :message="overlayMessage" />
    <div
      class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0"
    >
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Quản lý nhà cung cấp</h1>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button text="Thêm nhà cung cấp" :icon="IconPlus" color="primary" @click="openAddEditModal()" />

        <label for="import-file-input" class="cursor-pointer">
          <Button text="Import" :icon="IconFileImport" color="secondary" as="span" />
          <input
            type="file"
            id="import-file-input"
            accept=".xlsx, .xls"
            class="hidden"
            @change="handleImport"
          />
        </label>

        <Button text="Export" :icon="IconFileExport" color="secondary" @click="handleExport" />

        <span class="text-gray-400 mx-4 hidden border-r-2 sm:block" />

        <SupplierFilterButtons v-model="selectedStatuses" />
      </div>
    </div>

    <Input
      v-model="searchTerm"
      type="text"
      placeholder="Tìm kiếm theo mã, tên, SĐT nhà cung cấp..."
      class="mb-3"
    />

    <div class="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div
        class="hidden md:grid md:grid-cols-16 items-center gap-2 py-3 px-5 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200"
      >
        <div class="md:col-span-8">Tên nhà cung cấp</div>
        <div class="md:col-start-9 md:col-span-2">Điện thoại</div>
        <div class="md:col-start-11 md:col-span-2">Email</div>
        <div class="md:col-start-13 md:col-span-2 md:justify-self-end">Tổng mua</div>
        <div class="md:col-start-15 md:col-span-2">Trạng thái</div>
      </div>

      <div class="bg-white">
        <div v-if="isLoading">
           <div v-for="i in 5" :key="i" class="grid md:grid-cols-16 gap-2 py-4 px-5 border-b border-gray-50 items-center last:border-0">
              <div class="md:col-span-8"><SkeletonLoader width="60%" height="16px" /></div>
              <div class="md:col-start-9 md:col-span-2"><SkeletonLoader width="80%" height="16px" /></div>
              <div class="md:col-start-11 md:col-span-2"><SkeletonLoader width="90%" height="16px" /></div>
              <div class="md:col-start-13 md:col-span-2 flex justify-end"><SkeletonLoader width="60%" height="16px" /></div>
              <div class="md:col-start-15 md:col-span-2"><SkeletonLoader width="70%" height="24px" class="rounded-full" /></div>
           </div>
        </div>

        <div v-else-if="isError" class="text-center py-12 text-red-500 font-medium">
          Đã xảy ra lỗi khi lấy dữ liệu nhà cung cấp
        </div>

        <div v-else-if="suppliers.length === 0" class="text-center py-12 flex flex-col items-center justify-center space-y-3">
          <div class="bg-gray-50 p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p class="text-gray-500 font-medium">Không có nhà cung cấp nào để hiển thị.</p>
        </div>

        <div v-else class="divide-y divide-gray-50">
          <SupplierItem
            v-for="item in suppliers"
            :key="item.id"
            :itemData="item"
            :is-open="openStates[item.id]"
            @toggle-detail="handleToggleDetail"
            @edit-supplier="openAddEditModal"
            @delete-supplier="openDeleteModal"
            @toggle-activation="toggleActivation"
          />
        </div>
      </div>
    </div>

    <Pagination
      :total-pages="pagination.totalPages.value"
      :currentPage="pagination.currentPage.value"
      @update:currentPage="pagination.changePage"
      :loading="isLoading"
    />

    <DraggableModal
      :key="formModalKey"
      v-if="isFormModalVisible"
      @close="handleCloseFormModal"
      :onRefresh="isEditMode ? handleFormRefresh : undefined"
      :isLoading="isRefreshing"
    >
      <template #header>
        <h2 class="font-bold text-lg">{{ formModalTitle }}</h2>
      </template>
      <template #body>
        <SupplierForm v-model="editableSupplier" :errors="formErrors" />
      </template>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <Button text="Bỏ qua" color="gray" @click="handleCloseFormModal" />
          <Button text="Lưu" color="purple" @click="handleSaveSupplier" />
        </div>
      </template>
    </DraggableModal>
  </div>
</template>
