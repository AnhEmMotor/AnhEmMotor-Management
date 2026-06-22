<template>
  <div class="flex flex-col gap-4 pb-5">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ArtStatsCard
        :title="$t('menus.service.list.stats.total')"
        :count="pagination?.total || 0"
        description="Tổng số dịch vụ trong hệ thống"
        icon="ri:tool-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        :title="$t('menus.service.list.stats.active')"
        :count="activeCount"
        description="Dịch vụ đang hoạt động"
        icon="ri:checkbox-circle-line"
        iconStyle="bg-success"
      />
      <ArtStatsCard
        :title="$t('menus.service.list.stats.inactive')"
        :count="inactiveCount"
        description="Dịch vụ tạm ngừng"
        icon="ri:close-circle-line"
        iconStyle="bg-warning"
      />
    </div>

    <ArtSearchBar
      :items="searchItems"
      :label-width="120"
      :span="6"
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
            <ElIcon><Plus /></ElIcon> Thêm dịch vụ
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        row-key="id"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #isActive="{ row }">
          <ElSwitch v-model="row.isActive" @change="toggleActive(row)" />
        </template>

        <template #operation="{ row }">
          <div class="flex gap-2 justify-center">
            <ArtButtonTable type="edit" @click="handleEdit(row)" />
            <ArtButtonTable type="delete" @click="handleDelete(row)" />
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <!-- Create/Edit Dialog -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="650px"
      class="premium-dialog"
      align-center
      append-to-body
      destroy-on-close
    >
      <ElForm :model="formData" label-width="120px" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              class="el-form-item__label !text-xs !font-semibold !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
            >
              Tên dịch vụ <span class="text-red-500">*</span>
            </label>
            <ElInput
              v-model="formData.name"
              placeholder="Nhập tên dịch vụ..."
            />
          </div>

          <div>
            <label
              class="el-form-item__label !text-xs !font-semibold !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
            >
              Danh mục <span class="text-red-500">*</span>
            </label>
            <ElSelect
              v-model="formData.categoryId"
              placeholder="Chọn danh mục"
              class="w-full"
              :loading="loadingCategories"
            >
              <ElOption
                v-for="cat in categories"
                :key="cat.id"
                :label="cat.name"
                :value="cat.id"
              />
            </ElSelect>
          </div>
        </div>

        <div>
          <label
            class="el-form-item__label !text-xs !font-semibold !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
          >
            Mô tả
          </label>
          <ElInput
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="Nhập mô tả dịch vụ..."
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              class="el-form-item__label !text-xs !font-semibold !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
            >
              Giá cơ bản (VNĐ) <span class="text-red-500">*</span>
            </label>
            <ElInputNumber
              v-model="formData.basePrice"
              :min="0"
              :step="1000"
              class="w-full"
              placeholder="0"
            />
          </div>

          <div>
            <label
              class="el-form-item__label !text-xs !font-semibold !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
            >
              Thời gian thực hiện (phút)
            </label>
            <ElInputNumber
              v-model="formData.estimatedDurationMinutes"
              :min="0"
              class="w-full"
              placeholder="0"
            />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <ElCheckbox v-model="formData.isActive" />
          <span class="text-sm text-gray-700">Kích hoạt dịch vụ</span>
        </div>
      </ElForm>
      <template #footer>
        <div class="flex justify-end gap-3 mt-2">
          <ElButton @click="dialogVisible = false">Đóng</ElButton>
          <ElButton
            type="primary"
            :loading="submitting"
            @click="submitForm"
            class="px-8"
          >
            Lưu dịch vụ
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useServiceTable } from "@/views/Factory/logic/service/list/hooks/useServiceTable";
import { ServiceApi } from "@/infrastructure/api/service";

defineOptions({ name: "ServiceList" });

const {
  categories,
  loadingCategories,
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
  dialogVisible,
  dialogTitle,
  formData,
  submitting,
  handleAdd,
  handleEdit,
  handleDelete,
  submitForm,
} = useServiceTable();

const searchItems = [
  {
    label: "Tên dịch vụ",
    key: "name",
    prop: "name",
    type: "text",
    placeholder: "Nhập tên dịch vụ...",
  },
  {
    label: "Danh mục",
    key: "categoryId",
    prop: "categoryId",
    type: "select",
    options: categories.value.map((c) => ({ label: c.name, value: c.id })),
  },
  {
    label: "Trạng thái",
    key: "isActive",
    prop: "isActive",
    type: "select",
    options: [
      { label: "Tất cả", value: "" },
      { label: "Kích hoạt", value: true },
      { label: "Vô hiệu hóa", value: false },
    ],
  },
];

const activeCount = computed(() => {
  return (data.value || []).filter((item: any) => item.isActive).length;
});

const inactiveCount = computed(() => {
  return (data.value || []).filter((item: any) => !item.isActive).length;
});

const toggleActive = async (row: any) => {
  try {
    await ServiceApi.update(row.id, { isActive: row.isActive });
    ElMessage.success("Cập nhật trạng thái thành công");
  } catch (err: any) {
    row.isActive = !row.isActive; // revert
    ElMessage.error(err.message || "Cập nhật trạng thái thất bại");
  }
};
</script>

<style scoped>
/* Optional: custom styles */
</style>
