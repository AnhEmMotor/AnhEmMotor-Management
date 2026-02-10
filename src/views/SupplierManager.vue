<template>
  <div class="bg-gray-100 p-4 sm:p-6 rounded-xl shadow-lg">
    <LoadingOverlay :show="showOverlay" :message="overlayMessage" />
    <div
      class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0"
    >
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Quản lý nhà cung cấp</h1>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <Button text="Thêm nhà cung cấp" color="purple" @click="openAddEditModal()" />

        <label for="import-file-input" class="cursor-pointer">
          <Button text="Import" color="blue" as="span" />
          <input
            type="file"
            id="import-file-input"
            accept=".xlsx, .xls"
            class="hidden"
            @change="handleImport"
          />
        </label>

        <Button text="Export" color="green" @click="handleExport" />
        <div class="h-8 border-r-2 border-black-300 mx-2"></div>
        <SupplierFilterButtons v-model="selectedStatuses" />
      </div>
    </div>

    <Input
      v-model="rawSearch"
      type="text"
      placeholder="Tìm kiếm theo mã, tên, SĐT nhà cung cấp..."
      class="mb-3"
    />

    <div
      class="hidden md:grid md:grid-cols-16 items-center gap-2 py-3 px-5 text-sm font-semibold text-gray-600 bg-gray-200 rounded-t-md"
    >
      <div class="md:col-span-8">Tên nhà cung cấp</div>
      <div class="md:col-start-9 md:col-span-2">Điện thoại</div>
      <div class="md:col-start-11 md:col-span-2">Email</div>
      <div class="md:col-start-13 md:col-span-2 md:justify-self-end">Tổng mua</div>
      <div class="md:col-start-15 md:col-span-2">Trạng thái</div>
    </div>

    <div class="bg-white rounded-b-md shadow-sm">
      <div v-if="isLoading">
        <Spinner />
      </div>
      <div v-else-if="isError">
        <p class="not-found-msg">Could not fetch suppliers. Please try again later. {{ error }}</p>
      </div>
      <div v-else-if="storeSuppliers.length === 0" class="text-center py-6 text-gray-500">
        Không có nhà cung cấp nào để hiển thị.
      </div>
      <SupplierItem
        v-for="item in storeSuppliers"
        :key="item.id"
        :itemData="item"
        :is-open="openStates[item.id]"
        @toggle-detail="handleToggleDetail"
        @edit-supplier="openAddEditModal"
        @delete-supplier="openDeleteModal"
        @toggle-activation="toggleActivation"
      />
    </div>

    <Pagination
      :total-pages="totalPages"
      :currentPage="page"
      @update:currentPage="onPageChange"
      :loading="isLoading"
    />

    <DraggableModal
      :key="formModalKey"
      v-if="isFormModalVisible"
      @close="handleCloseFormModal"
      :onRefresh="isEditMode ? handleFormRefresh : undefined"
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

<script setup>
import { ref, reactive, computed, watch, onUnmounted } from 'vue'
import { useSuppliersStore } from '@/stores/useSuppliersStore'
import * as XLSX from 'xlsx'
import SupplierItem from '@/components/supplier/SupplierItem.vue'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Pagination from '@/components/ui/button/Pagination.vue'
import SupplierFilterButtons from '@/components/supplier/SupplierFilterButtons.vue'
import DraggableModal from '@/components/ui/DraggableModal.vue'
import SupplierForm from '@/components/supplier/SupplierForm.vue'
import Spinner from '@/components/ui/Spinner.vue'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import { showConfirmation } from '@/composables/useConfirmationState'
</script>
