<template>
  <div class="resp-page contract-supplier-container">
    <div class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <el-card shadow="hover" class="kpi-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">Tổng hợp đồng</div>
            <div class="text-2xl font-bold text-blue-500">
              {{ stats.totalContracts }}
            </div>
            <div class="text-xs text-gray-400 mt-1">Tất cả trạng thái</div>
          </div>
          <el-icon class="text-4xl text-blue-200"><Document /></el-icon>
        </div>
      </el-card>
      <el-card shadow="hover" class="kpi-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">Đang hiệu lực</div>
            <div class="text-2xl font-bold text-success">
              {{ stats.activeContracts }}
            </div>
            <div class="text-xs text-gray-400 mt-1">Hợp đồng đang chạy</div>
          </div>
          <el-icon class="text-4xl text-green-200"><CircleCheck /></el-icon>
        </div>
      </el-card>
      <el-card shadow="hover" class="kpi-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">Chờ duyệt</div>
            <div class="text-2xl font-bold text-warning">
              {{ stats.pendingApproval }}
            </div>
            <div class="text-xs text-gray-400 mt-1">Cần xem xét</div>
          </div>
          <el-icon class="text-4xl text-yellow-200"><Timer /></el-icon>
        </div>
      </el-card>
      <el-card shadow="hover" class="kpi-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">Sắp/Đã hết hạn</div>
            <div class="text-2xl font-bold text-danger">
              {{ stats.expiredContracts + stats.expiringContracts }}
            </div>
            <div class="text-xs text-gray-400 mt-1">Cần gia hạn/kết thúc</div>
          </div>
          <el-icon class="text-4xl text-red-200"><Warning /></el-icon>
        </div>
      </el-card>
    </div>

    <el-card shadow="never">
      <template #header>
        <div class="card-header flex justify-between items-center">
          <span class="font-bold text-lg">Hợp đồng nhà cung cấp</span>
          <div class="flex gap-2">
            <el-button
              type="info"
              :icon="RefreshLeft"
              @click="openRestoreDialog"
            >
              Khôi phục
            </el-button>
            <el-button
              type="primary"
              :icon="Plus"
              @click="handleAdd"
              v-auth="'Permissions.Accountant.SupplierContractManagement.Create'"
            >
              Thêm hợp đồng
            </el-button>
          </div>
        </div>
      </template>
      <div>
        <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4 items-center">
          <el-input
            v-model="searchForm.contractNumber"
            placeholder="Nhập số hợp đồng..."
            clearable
            :prefix-icon="Search"
            class="w-full"
            @input="debouncedSearch"
          />
          <el-select
            v-model="searchForm.status"
            placeholder="Trạng thái"
            clearable
            multiple
            collapse-tags
            class="w-full"
            @change="handleSearch(searchForm)"
          >
            <el-option label="Bản nháp" value="Draft" />
            <el-option label="Chờ duyệt" value="PendingApproval" />
            <el-option label="Đang hiệu lực" value="Active" />
            <el-option label="Đã hết hạn" value="Expired" />
            <el-option label="Đã chấm dứt" value="Terminated" />
            <el-option label="Đã hoàn thành" value="Completed" />
          </el-select>
          <el-select
            v-model="searchForm.supplierId"
            placeholder="Chọn nhà cung cấp..."
            clearable
            filterable
            class="w-full"
            @change="handleSearch(searchForm)"
          >
            <el-option 
              v-for="sup in suppliers" 
              :key="sup.id" 
              :label="sup.name" 
              :value="sup.id" 
            />
          </el-select>
          <el-button type="primary" :icon="Search" class="w-full md:w-auto" @click="handleSearch(searchForm)"
            >Tìm kiếm</el-button
          >
        </div>

        <el-table :data="data" border style="width: 100%" v-loading="loading">
          <el-table-column label="Số Hợp Đồng" min-width="160">
            <template #default="{ row }">
              <el-link type="primary" :underline="false" @click="handlePreview(row)">
                <span class="font-medium">{{ row.contractNumber }}</span>
              </el-link>
            </template>
          </el-table-column>
          <el-table-column label="Nhà cung cấp" min-width="220">
            <template #default="{ row }">
              {{ row.supplierName || suppliers.find(s => s.id === row.supplierId)?.name || 'Chưa xác định' }}
            </template>
          </el-table-column>
          <el-table-column prop="contractValue" label="Giá trị (VNĐ)" min-width="150" align="right">
            <template #default="{ row }">
              <span class="font-medium">{{ row.contractValue?.toLocaleString('vi-VN') }}</span>
            </template>
          </el-table-column>

          <el-table-column label="Ngày hiệu lực" width="120" align="center">
            <template #default="scope">
              {{ formatDate(scope.row.effectiveDate) }}
            </template>
          </el-table-column>
          <el-table-column label="Ngày hết hạn" width="120" align="center">
            <template #default="scope">
              {{ formatDate(scope.row.expirationDate) }}
            </template>
          </el-table-column>

          <el-table-column prop="status" label="Trạng thái" width="130" align="center">
            <template #default="scope">
              <el-tag :type="getStatusTag(scope.row.status)" effect="dark">
                {{ getStatusName(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="Thao tác" width="120" align="center" fixed="right">
            <template #default="scope">
              <div class="flex gap-1 justify-center">
                <el-tooltip content="Xem chi tiết" placement="top">
                  <el-button
                    type="primary"
                    size="small"
                    circle
                    :icon="View"
                    @click="handlePreview(scope.row)"
                  />
                </el-tooltip>
                <el-tooltip content="Chỉnh sửa" placement="top">
                  <el-button
                    type="warning"
                    size="small"
                    circle
                    :icon="Edit"
                    @click="handleEdit(scope.row as any)"
                    v-auth="'Permissions.Accountant.SupplierContractManagement.Edit'"
                  />
                </el-tooltip>
                <el-tooltip content="Xóa" placement="top">
                  <el-button
                    type="danger"
                    size="small"
                    circle
                    :icon="Delete"
                    @click="handleDelete(scope.row as any)"
                    v-auth="'Permissions.Accountant.SupplierContractManagement.Delete'"
                  />
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div class="mt-4 flex justify-end">
          <el-pagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            :total="pagination.total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
          />
        </div>
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      append-to-body
      destroy-on-close
    >
      <el-form :model="formData" label-position="top">
        <el-form-item label="Nhà cung cấp" required>
          <el-select
            v-model="formData.supplierId"
            placeholder="Chọn nhà cung cấp..."
            class="w-full"
            filterable
          >
            <el-option 
              v-for="sup in suppliers" 
              :key="sup.id" 
              :label="sup.name" 
              :value="sup.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Số hợp đồng" required>
          <el-input v-model="formData.contractNumber" placeholder="Nhập số hợp đồng" />
        </el-form-item>

                <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Ngày hiệu lực" required>
              <el-date-picker
                v-model="formData.effectiveDate"
                type="date"
                placeholder="Chọn ngày"
                format="DD/MM/YYYY"
                value-format="YYYY-MM-DD"
                class="!w-full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Ngày hết hạn">
              <el-date-picker
                v-model="formData.expirationDate"
                type="date"
                placeholder="Chọn ngày"
                format="DD/MM/YYYY"
                value-format="YYYY-MM-DD"
                class="!w-full"
              />
            </el-form-item>
          </el-col>
        </el-row>

                <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Giá trị hợp đồng">
              <el-input-number 
                v-model="formData.contractValue" 
                :min="0" 
                :step="1000000"
                class="!w-full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Trạng thái" required>
              <el-select v-model="formData.status" class="w-full">
                <el-option label="Bản nháp" value="Draft" />
                <el-option label="Chờ duyệt" value="PendingApproval" />
                <el-option label="Đang hiệu lực" value="Active" />
                <el-option label="Đã hết hạn" value="Expired" />
                <el-option label="Đã chấm dứt" value="Terminated" />
                <el-option label="Đã hoàn thành" value="Completed" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

                <el-form-item label="Điều khoản">
          <el-input v-model="formData.terms" type="textarea" :rows="2" />
        </el-form-item>

                <el-form-item label="Ghi chú">
          <el-input v-model="formData.note" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="dialogVisible = false">Hủy</el-button>
          <el-button type="primary" :loading="submitting" @click="submitForm">
            Xác nhận
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="restoreDialogVisible" width="800px" append-to-body>
      <template #header>
        <div class="flex items-center justify-between pr-2">
          <span class="text-lg font-medium">Khôi phục hợp đồng đã xóa</span>
        </div>
      </template>
      <el-table
        v-loading="deletedContractsLoading"
        :data="deletedContractsData"
        border
        max-height="400"
        @selection-change="handleDeletedSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="contractNumber" label="Số hợp đồng" width="150" />
        <el-table-column prop="supplierName" label="Nhà cung cấp" min-width="150" show-overflow-tooltip />
        <el-table-column prop="deletedAt" label="Thời gian xóa" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.deletedAt) }}
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <div class="flex justify-between items-center w-full">
          <span></span>
          <div class="flex gap-2">
            <el-button @click="restoreDialogVisible = false">Đóng</el-button>
            <el-button
              type="success"
              :disabled="selectedDeletedContracts.length === 0"
              @click="handleRestoreMany"
            >
              <el-icon class="mr-1"><RefreshRight /></el-icon>
              Khôi phục đã chọn
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  Plus,
  RefreshRight,
  RefreshLeft,
  Search,
  Document,
  Timer,
  Warning,
  CircleCheck,
  Edit,
  Delete,
  View,
} from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { useSupplierContractTable } from '@/views/inventory/supplier-contract/hooks/useSupplierContractTable';
import type { SupplierContractStatus } from '@/domain/supplier/contract.types';

defineOptions({ name: 'InventorySupplierContract' });

const router = useRouter();

const {
  data,
  loading,
  pagination,
  handleSizeChange,
  handleCurrentChange,
  handleSearch,
  stats,
  suppliers,
  searchForm,

    restoreDialogVisible,
  deletedContractsData,
  deletedContractsLoading,
  selectedDeletedContracts,
  handleDeletedSelectionChange,
  openRestoreDialog,
  handleRestoreMany,

  dialogVisible,
  dialogTitle,
  formData,
  submitting,
  handleAdd,
  handleEdit,
  handleDelete,
  submitForm,
} = useSupplierContractTable();

let searchTimer: ReturnType<typeof setTimeout> | null = null;
const debouncedSearch = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    handleSearch(searchForm.value);
  }, 400);
};

const handlePreview = (row: any) => {
  router.push({ name: 'WarehouseSupplierContractPreview', params: { id: row.id } });
};

const formatDate = (val: string | null | undefined) => {
  if (!val) return '-';
  return new Date(val).toLocaleDateString('vi-VN');
};

const formatDateTime = (val: string | null | undefined) => {
  if (!val) return '-';
  return new Date(val).toLocaleString('vi-VN');
};

const getStatusTag = (status: SupplierContractStatus) => {
  const map: Record<SupplierContractStatus, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    Draft: 'info',
    PendingApproval: 'warning',
    Active: 'success',
    Expired: 'danger',
    Terminated: 'danger',
    Completed: 'primary',
  };
  return map[status] || 'info';
};

const getStatusName = (status: SupplierContractStatus) => {
  const map: Record<SupplierContractStatus, string> = {
    Draft: 'Bản nháp',
    PendingApproval: 'Chờ duyệt',
    Active: 'Đang hiệu lực',
    Expired: 'Đã hết hạn',
    Terminated: 'Đã chấm dứt',
    Completed: 'Đã hoàn thành',
  };
  return map[status] || status;
};
</script>

<style scoped lang="scss">
.contract-supplier-container {
  padding: 16px;
}

.kpi-card {
  border-radius: 8px;
}

@media (width <= 640px) {
  .contract-supplier-container {
    padding: 8px;
  }
}
</style>
