<template>
  <div class="warranty-category-page">
    <ReportPageHeader
      title="Danh mục bảo hành"
      description="Quản lý danh mục điều khoản bảo hành theo từng hãng xe. Mỗi hãng có bộ điều khoản riêng — dùng để xác định điều kiện bảo hành khi xử lý khiếu nại."
      icon="ri:shield-check-line"
    >
      <template #actions>
        <ElButton type="primary" v-ripple @click="handleAdd">
          <ElIcon><Plus /></ElIcon>
          Thêm điều khoản
        </ElButton>
      </template>
    </ReportPageHeader>

    <!-- KPI Cards -->
    <div class="warranty-kpi-grid">
      <ArtStatsCard
        title="Tổng điều khoản"
        :count="statistics.totalTerms"
        icon="ri:file-list-3-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        title="Đang áp dụng"
        :count="statistics.activeTerms"
        icon="ri:checkbox-circle-line"
        iconStyle="bg-success"
      />
      <ArtStatsCard
        title="Ngưng áp dụng"
        :count="statistics.inactiveTerms"
        icon="ri:time-line"
        iconStyle="bg-warning"
      />
      <ArtStatsCard
        title="Hãng xe có điều khoản"
        :count="statistics.brandsCovered"
        icon="ri:store-2-line"
        iconStyle="bg-info"
      />
    </div>

    <!-- Search Bar -->
    <ElCard class="warranty-filter-card">
      <ArtSearchBar
        v-model="searchForm"
        :items="searchItems"
        :label-width="140"
        :span="8"
        @search="handleSearch"
        @reset="handleReset"
      />
    </ElCard>

    <!-- Table -->
    <ElCard class="warranty-table-card">
      <ArtTableHeader
        v-model:columns="columnChecks"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <div class="table-heading">
            <span>Danh sách điều khoản bảo hành</span>
            <small>{{ pagination.total }} điều khoản</small>
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
        <template #brandName="{ row }">
          <ElTag type="primary" effect="light" round size="small">
            {{ row.brandName }}
          </ElTag>
        </template>
        <template #termName="{ row }">
          <span
            class="font-semibold text-primary cursor-pointer hover:underline"
            @click="handleView(row)"
          >
            {{ row.termName }}
          </span>
        </template>
        <template #duration="{ row }">
          <div class="flex items-center gap-1.5 justify-center">
            <i
              class="ri-time-line text-amber-500"
              v-if="row.durationMonths || row.durationKm"
            ></i>
            <span class="font-medium text-slate-700 whitespace-nowrap">{{
              formatDuration(row)
            }}</span>
          </div>
        </template>
        <template #coverage="{ row }">
          <ElTooltip
            :content="row.coverage"
            placement="top"
            :disabled="!row.coverage || row.coverage.length <= 40"
          >
            <span class="text-sm text-gray-600">
              {{
                row.coverage
                  ? row.coverage.length > 40
                    ? row.coverage.slice(0, 40) + "..."
                    : row.coverage
                  : "-"
              }}
            </span>
          </ElTooltip>
        </template>
        <template #status="{ row }">
          <ElTag :type="getStatusType(row.status)" size="small">
            {{ getStatusLabel(row.status) }}
          </ElTag>
        </template>
        <template #operation="{ row }">
          <div class="operation-cell">
            <ArtButtonTable type="edit" @click="handleEdit(row)" />
            <ArtButtonTable type="delete" @click="handleDelete(row)" />
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <!-- Create/Edit/View Dialog -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      class="warranty-dialog"
      append-to-body
      destroy-on-close
    >
      <ElForm
        :model="formData"
        label-width="150px"
        class="warranty-form"
        :disabled="isViewMode"
        :rules="formRules"
        ref="formRef"
      >
        <div class="form-grid">
          <ElFormItem label="Hãng xe" prop="brandId">
            <ElSelect
              v-model="formData.brandId"
              filterable
              placeholder="Chọn hãng xe..."
              class="w-full"
              :loading="brandsLoading"
            >
              <ElOption
                v-for="b in brandOptions"
                :key="b.id"
                :label="b.name"
                :value="b.id"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="Tên điều khoản" prop="termName">
            <ElInput
              v-model="formData.termName"
              placeholder="VD: Bảo hành động cơ"
            />
          </ElFormItem>
          <ElFormItem label="Loại xe áp dụng" prop="vehicleType">
            <ElInput
              v-model="formData.vehicleType"
              placeholder="VD: Xe tay ga, Xe số..."
            />
          </ElFormItem>
          <ElFormItem label="Loại lỗi" prop="errorCategory">
            <ElInput
              v-model="formData.errorCategory"
              placeholder="VD: Động cơ, Hệ thống điện..."
            />
          </ElFormItem>
          <ElFormItem label="Thời gian BH (tháng)">
            <ElInputNumber
              v-model="formData.durationMonths"
              :min="0"
              :step="1"
              class="w-full"
              placeholder="VD: 24"
            />
          </ElFormItem>
          <ElFormItem label="Số km BH">
            <ElInputNumber
              v-model="formData.durationKm"
              :min="0"
              :step="1000"
              :precision="0"
              class="w-full"
              placeholder="VD: 20000"
            />
          </ElFormItem>
          <ElFormItem label="Ngày hiệu lực">
            <ElDatePicker
              v-model="formData.effectiveDate"
              type="date"
              placeholder="Chọn ngày"
              class="w-full"
              value-format="YYYY-MM-DD"
            />
          </ElFormItem>
          <ElFormItem label="Ngày hết hạn">
            <ElDatePicker
              v-model="formData.expirationDate"
              type="date"
              placeholder="Chọn ngày (tùy chọn)"
              class="w-full"
              value-format="YYYY-MM-DD"
            />
          </ElFormItem>
          <ElFormItem label="Phạm vi bảo hành">
            <ElInput
              v-model="formData.coverage"
              type="textarea"
              :rows="3"
              placeholder="VD: Toàn bộ chi phí phụ tùng + nhân công..."
            />
          </ElFormItem>
          <ElFormItem label="Trạng thái">
            <ElSelect v-model="formData.status" class="w-full">
              <ElOption label="Đang áp dụng" value="Active" />
              <ElOption label="Ngưng áp dụng" value="Inactive" />
              <ElOption label="Đã hết hạn" value="Expired" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="Mô tả chi tiết" :span="2">
            <ElInput
              v-model="formData.description"
              type="textarea"
              :rows="4"
              placeholder="Mô tả chi tiết điều khoản bảo hành..."
            />
          </ElFormItem>
        </div>
      </ElForm>

      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="dialogVisible = false">Đóng</ElButton>
          <ElButton
            v-if="!isViewMode"
            type="primary"
            :loading="submitting"
            @click="submitForm"
          >
            {{ formData.id ? "Cập nhật" : "Tạo mới" }}
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus";
import ReportPageHeader from "@/views/analytics-reporting/components/ReportPageHeader.vue";
import { useWarrantyCategoryTable } from "@/modules/Factory/logic/service/warranty-category/hooks/useWarrantyCategoryTable";
import type { WarrantyTerm } from "@/domain/warranty/warranty-category.types";

defineOptions({ name: "FactoryWarrantyCategory" });

const {
  data,
  loading,
  pagination,
  columns,
  columnChecks,
  handleSizeChange,
  handleCurrentChange,
  handleSearch,
  handleReset,
  refreshData,
  statistics,
  fetchStatistics,
  selectedRows,
  handleSelectionChange,
  handleDeleteMany,
  dialogVisible,
  dialogTitle,
  formData,
  submitting,
  handleAdd,
  handleEdit,
  handleView,
  handleDelete,
  submitForm,
  searchForm,
  searchItems,
  getStatusType,
  getStatusLabel,
  formatDuration,
  brandOptions,
  brandsLoading,
} = useWarrantyCategoryTable();

const isViewMode = computed(() => dialogTitle.value.startsWith("Chi tiết:"));

const formRef = ref<FormInstance>();
const tableRef = ref();

const formRules = {
  termName: [
    {
      required: true,
      message: "Vui lòng nhập tên điều khoản",
      trigger: "blur",
    },
  ],
  brandId: [
    {
      required: true,
      message: "Vui lòng chọn hãng xe",
      trigger: "change",
    },
  ],
  vehicleType: [
    { required: true, message: "Vui lòng nhập loại xe", trigger: "blur" },
  ],
  errorCategory: [
    { required: true, message: "Vui lòng nhập loại lỗi", trigger: "blur" },
  ],
};
</script>

<style scoped lang="scss">
.warranty-category-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.warranty-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (width <= 1024px) {
  .warranty-kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (width <= 640px) {
  .warranty-kpi-grid {
    grid-template-columns: 1fr;
  }
}

.warranty-filter-card {
  :deep(.el-card__body) {
    padding: 14px 18px;
  }
}

.warranty-filter-card :deep(.el-form-item) {
  margin-bottom: 0;
}

.table-heading {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.table-heading span {
  font-size: 16px;
  font-weight: 800;
}

.table-heading small {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.operation-cell {
  display: flex;
  gap: 6px;
  justify-content: center;
  align-items: center;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0 20px;
}

:global(html.dark) {
  .warranty-category-page {
    color: #f8fafc;
  }

  .warranty-filter-card :deep(.art-search-bar) {
    color: #f8fafc;
  }
}
</style>
