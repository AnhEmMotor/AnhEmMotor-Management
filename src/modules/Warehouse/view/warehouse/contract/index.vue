<template>
  <div class="resp-page flex flex-col gap-4 pb-5">
    <div class="resp-stats-4 grid grid-cols-1 md:grid-cols-4 gap-4">
      <ArtStatsCard
        title="Tổng hợp đồng"
        :count="stats.totalContracts"
        icon="ri:file-text-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        title="Đang hiệu lực"
        :count="stats.activeContracts"
        icon="ri:check-line"
        iconStyle="bg-success"
      />
      <ArtStatsCard
        title="Chờ duyệt"
        :count="stats.pendingApproval"
        icon="ri:time-line"
        iconStyle="bg-warning"
      />
      <ArtStatsCard
        title="Sắp/Đã hết hạn"
        :count="stats.expiredContracts + stats.expiringContracts"
        icon="ri:error-warning-line"
        iconStyle="bg-danger"
      />
    </div>

    <ArtSearchBar
      v-model="searchForm"
      :items="searchItems"
      :label-width="120"
      :span="8"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="flex-1 art-table-card">
      <ArtTableHeader
        v-model:columns="columnChecks"
        :loading="loading"
        layout="search,refresh,size,fullscreen,columns"
        @refresh="refreshData"
      >
        <template #left>
          <div class="flex items-center gap-3">
            <ElButton
              type="primary"
              v-ripple
              v-auth="'Permissions.Warehouse.SupplierManagement.Create'"
              @click="handleAdd"
              style="margin-left: 0"
            >
              <ElIcon><Plus /></ElIcon> Thêm mới
            </ElButton>
          </div>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #status="{ row }">
          <ElTag :type="getStatusTag(row.status)" size="small">
            {{ getStatusName(row.status) }}
          </ElTag>
        </template>

        <template #operation="{ row }">
          <div class="flex gap-2 justify-center">
            <ElTooltip content="Chỉnh sửa" placement="top">
              <ElButton
                circle
                size="small"
                type="primary"
                v-auth="'Permissions.Warehouse.SupplierManagement.Edit'"
                @click="handleEdit(row)"
              >
                <ElIcon><Edit /></ElIcon>
              </ElButton>
            </ElTooltip>
            <ElTooltip content="Xóa" placement="top">
              <ElButton
                circle
                size="small"
                type="danger"
                v-auth="'Permissions.Warehouse.SupplierManagement.Delete'"
                @click="handleDelete(row)"
              >
                <ElIcon><Delete /></ElIcon>
              </ElButton>
            </ElTooltip>
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      class="resp-dialog"
      append-to-body
      destroy-on-close
    >
      <ElForm ref="formRef" :model="formData" :rules="rules" label-width="140px" class="mt-4">
        <ElFormItem label="Nhà cung cấp" prop="supplierId">
          <ElSelect v-model="formData.supplierId" placeholder="Chọn nhà cung cấp" class="w-full">
            <ElOption v-for="sup in suppliers" :key="sup.id" :label="sup.name" :value="sup.id" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="Số hợp đồng" prop="contractNumber">
          <ElInput v-model="formData.contractNumber" placeholder="Nhập số hợp đồng" />
        </ElFormItem>
        <ElFormItem label="Ngày hiệu lực" prop="effectiveDate">
          <ElDatePicker
            v-model="formData.effectiveDate"
            type="date"
            placeholder="Chọn ngày hiệu lực"
            format="DD/MM/YYYY"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </ElFormItem>
        <ElFormItem label="Ngày hết hạn" prop="expirationDate">
          <ElDatePicker
            v-model="formData.expirationDate"
            type="date"
            placeholder="Chọn ngày hết hạn"
            format="DD/MM/YYYY"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </ElFormItem>
        <ElFormItem label="Giá trị hợp đồng" prop="contractValue">
          <ElInputNumber v-model="formData.contractValue" :min="0" class="w-full" />
        </ElFormItem>
        <ElFormItem label="Hạn mức tín dụng" prop="creditLimit">
          <ElInputNumber v-model="formData.creditLimit" :min="0" class="w-full" />
        </ElFormItem>
        <ElFormItem label="Số ngày nợ" prop="paymentWindowDays">
          <ElInputNumber v-model="formData.paymentWindowDays" :min="0" class="w-full" />
        </ElFormItem>
        <ElFormItem label="Ghi chú" prop="note">
          <ElInput v-model="formData.note" type="textarea" :rows="3" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="dialogVisible = false">Hủy</ElButton>
          <ElButton type="primary" :loading="submitting" @click="submit">Lưu</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus, Edit, Delete } from '@element-plus/icons-vue';
import ArtStatsCard from '@/components/core/cards/art-stats-card/index.vue';
import ArtSearchBar from '@/components/core/forms/art-search-bar/index.vue';
import ArtTableHeader from '@/components/core/tables/art-table-header/index.vue';
import ArtTable from '@/components/core/tables/art-table/index.vue';
import { useSupplierContractTable } from './hooks/useSupplierContractTable';
import { SupplierContractApi } from '@/api/supplier/supplier-contract.api';
import type { FormInstance, FormRules } from 'element-plus';

defineOptions({ name: 'WarehouseContract' });

const {
  data,
  loading,
  stats,
  pagination,
  searchForm,
  searchItems,
  columns,
  columnChecks,
  handleSelectionChange,
  handleSearch,
  handleReset,
  handleSizeChange,
  handleCurrentChange,
  refreshData,
  dialogVisible,
  dialogTitle,
  formData,
  submitting,
  handleAdd,
  handleEdit,
  handleDelete,
  submitForm,
} = useSupplierContractTable();

const suppliers = ref<any[]>([]);

const formRef = ref<FormInstance>();
const rules = ref<FormRules>({
  supplierId: [
    {
      required: true,
      message: 'Vui lòng chọn nhà cung cấp',
      trigger: 'change',
    },
  ],
  contractNumber: [{ required: true, message: 'Vui lòng nhập số hợp đồng', trigger: 'blur' }],
  effectiveDate: [
    {
      required: true,
      message: 'Vui lòng chọn ngày hiệu lực',
      trigger: 'change',
    },
  ],
});

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    Draft: 'Bản nháp',
    PendingApproval: 'Chờ duyệt',
    Active: 'Đang hiệu lực',
    Expired: 'Hết hạn',
    Terminated: 'Đã chấm dứt',
    Completed: 'Hoàn thành',
  };
  return map[status] || status;
};

const getStatusTag = (status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    Draft: 'info',
    PendingApproval: 'warning',
    Active: 'success',
    Expired: 'danger',
    Terminated: 'danger',
    Completed: 'success',
  };
  return map[status] || 'info';
};

const submit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate((valid) => {
    if (valid) {
      submitForm();
    }
  });
};

onMounted(async () => {
  try {
    const res = await SupplierContractApi.getSuppliersForSelect();
    suppliers.value = res || [];
  } catch (err) {
    console.error('Lỗi lấy danh sách nhà cung cấp:', err);
  }
});
</script>
