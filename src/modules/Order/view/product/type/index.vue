<template>
  <div class="flex flex-col gap-4 pb-5">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ArtStatsCard
        :title="$t('menus.product.type.stats.total')"
        :count="stats.totalCategories"
        icon="ri:folders-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        :title="$t('menus.product.type.stats.new')"
        :count="stats.latestUpdatedCategoryName || 'Chưa có'"
        :description="
          stats.latestUpdatedAt
            ? 'Thời gian cập nhật: ' + formatDateTime(stats.latestUpdatedAt)
            : 'Chưa có cập nhật mới'
        "
        icon="ri:time-line"
        iconStyle="bg-info"
      />
    </div>

    <ArtSearchBar
      :items="searchItems"
      :label-width="100"
      :span="8"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="flex-1 art-table-card">
      <ArtTableHeader
        v-model:columns="columnChecks"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <ElButton type="primary" v-ripple @click="handleAdd">
            <ElIcon><Plus /></ElIcon> Thêm mới
          </ElButton>
          <ElButton :loading="exporting" v-ripple @click="handleExport">
            <ElIcon><Download /></ElIcon> Xuất file
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        :loading="loading"
        :data="tableData"
        :columns="columns"
        row-key="id"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #imageUrl="{ row }">
          <span
            class="category-image-cell inline-flex items-center justify-center h-10 w-10 rounded shadow-inner overflow-hidden align-middle"
          >
            <ElImage
              v-if="row.imageUrl"
              :src="row.imageUrl"
              class="w-full h-full"
              fit="cover"
              :preview-src-list="[row.imageUrl]"
              preview-teleported
            />
            <ElIcon v-else class="category-image-placeholder"
              ><Picture
            /></ElIcon>
          </span>
        </template>

        <template #name="{ row }">
          <div class="flex flex-col text-left">
            <span
              :class="
                row.parentId ? 'category-name-child' : 'category-name-root'
              "
            >
              {{ row.name }}
            </span>
          </div>
        </template>

        <template #isActive="{ row }">
          <ElTag
            :type="row.isActive ? 'success' : 'info'"
            size="small"
            effect="light"
            round
          >
            {{ row.isActive ? "Hoạt động" : "Tạm dừng" }}
          </ElTag>
        </template>

        <template #managementType="{ row }">
          <ElTag size="small" effect="light">
            {{ getManagementTypeLabel(row.managementType) }}
          </ElTag>
        </template>

        <template #operation="{ row }">
          <div class="flex gap-2 justify-center">
            <ArtButtonTable
              type="edit"
              @click="handleEdit(row)"
              v-auth="Permissions.Order.ProductManagement.Edit"
            />
            <ArtButtonTable
              type="delete"
              @click="handleDelete(row)"
              v-auth="Permissions.Order.ProductManagement.Delete"
            />
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="650px"
      append-to-body
      destroy-on-close
    >
      <ElForm :model="formData" label-width="140px" class="mt-4 pr-4">
        <ElFormItem label="Tên danh mục" required>
          <ElInput v-model="formData.name" placeholder="Nhập tên danh mục..." />
        </ElFormItem>

        <ElFormItem label="Danh mục cha">
          <ElSelect
            v-model="formData.parentId"
            placeholder="Chọn danh mục cha (nếu có)..."
            clearable
            filterable
            class="w-full"
          >
            <ElOption
              v-for="cat in parentCategories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="Đường dẫn (Slug)">
          <ElInput v-model="formData.slug" placeholder="slug-ten-danh-muc..." />
        </ElFormItem>

        <ElFormItem label="Loại quản lý" required>
          <ElSelect
            v-model="formData.managementType"
            placeholder="Chọn loại quản lý..."
            filterable
            class="w-full"
          >
            <ElOption
              v-for="item in managementTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="Số lượng mua tối đa">
          <ElInputNumber
            v-model="formData.maxPurchaseQuantity"
            :min="1"
            :max="999"
            placeholder="Không giới hạn nếu để trống"
            class="w-full"
            controls-position="right"
          />
        </ElFormItem>

        <ElFormItem label="Hình ảnh">
          <ElUpload
            class="category-uploader"
            action="#"
            :show-file-list="false"
            :auto-upload="true"
            :http-request="handleUpload"
          >
            <div v-if="formData.imageUrl" class="relative group">
              <img :src="formData.imageUrl" class="category-preview" />
              <div
                class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg"
              >
                <ElIcon class="text-white text-xl"><Plus /></ElIcon>
              </div>
            </div>
            <div
              v-else
              class="category-uploader-trigger flex flex-col items-center justify-center gap-2"
            >
              <ElIcon class="category-uploader-icon text-2xl"><Plus /></ElIcon>
              <span class="category-uploader-text text-xs">Tải ảnh</span>
            </div>
          </ElUpload>
        </ElFormItem>

        <ElFormItem label="Trạng thái">
          <ElSwitch
            v-model="formData.isActive"
            active-text="Hoạt động"
            inactive-text="Tạm dừng"
          />
        </ElFormItem>

        <ElFormItem label="Mô tả">
          <ElInput
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="Mô tả về danh mục này..."
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="dialogVisible = false">Hủy</ElButton>
          <ElButton type="primary" :loading="submitting" @click="submitForm">
            Xác nhận
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { Permissions } from "@/common/constants/permissions";
import { computed, ref, watch, nextTick } from "vue";
import { Plus, Picture, Download } from "@element-plus/icons-vue";
import { useCategoryTable } from "@/modules/Order/logic/product/type/hooks/useCategoryTable";
import { FileApi } from "@/api/operations";
import { ElMessage } from "element-plus";

defineOptions({ name: "ProductType" });

const tableRef = ref();

const {
  tableData,
  stats,
  managementTypes,
  parentCategories,
  loading,
  columns,
  columnChecks,
  handleSizeChange,
  handleCurrentChange,
  handleSearch,
  handleReset,
  refreshData,
  isSearching,

  dialogVisible,
  dialogTitle,
  formData,
  submitting,
  handleAdd,
  handleEdit,
  handleDelete,
  submitForm,
  exporting,
  handleExport,
} = useCategoryTable();

watch(
  () => tableData.value,
  (newData) => {
    if (isSearching.value && newData?.length) {
      nextTick(() => {
        if (tableRef.value?.elTableRef) {
          const expandRows = (rows: any[]) => {
            rows.forEach((row) => {
              if (row.children?.length) {
                tableRef.value.elTableRef.toggleRowExpansion(row, true);
                expandRows(row.children);
              }
            });
          };
          expandRows(newData);
        }
      });
    }
  },
  { deep: true },
);

const formatDateTime = (val: string | null | undefined) => {
  if (!val) return "Chưa có cập nhật";
  return new Date(val).toLocaleString("vi-VN");
};

const handleUpload = async (options: any) => {
  try {
    const res = await FileApi.uploadProductImage(options.file);
    formData.value.imageUrl = res.publicUrl;
    ElMessage.success("Tải ảnh lên thành công");
  } catch (err: any) {
    ElMessage.error(err.message || "Tải ảnh thất bại");
  }
};

const getManagementTypeLabel = (value?: string) => {
  return (
    managementTypes.value.find((item) => item.value === value)?.label ||
    value ||
    "Chưa chọn"
  );
};

const searchItems = computed(() => [
  {
    key: "name",
    label: "Tên danh mục",
    type: "input",
    props: { placeholder: "Tìm kiếm tên..." },
  },
  {
    key: "managementType",
    label: "Loại quản lý",
    type: "select",
    props: {
      placeholder: "Chọn loại quản lý...",
      clearable: true,
      filterable: true,
      options: managementTypes.value,
    },
  },
]);
</script>

<style scoped>
.art-table-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 3%);
}

.bg-primary {
  background-color: var(--main-color);
}

.category-uploader :deep(.el-upload) {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  background-color: #fafafa;
  border: 1px dashed #d9d9d9;
  border-radius: 12px;
  transition: var(--el-transition-duration-fast);
}

.category-uploader :deep(.el-upload:hover) {
  background-color: #fff;
  border-color: var(--main-color);
}

.category-uploader-trigger {
  width: 80px;
  height: 80px;
}

.category-preview {
  display: block;
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
}

:deep(.el-table__row--level-1) {
  background-color: var(--el-fill-color-lighter) !important;
}

:deep(.el-table__expand-icon) {
  margin-right: 8px !important;
  font-weight: bold;
  color: var(--main-color) !important;
}
</style>
