<template>
  <div class="flex flex-col gap-4 pb-5">
    <div id="tour-stats" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ArtStatsCard
        title="Tổng đối tác"
        :count="stats.totalSuppliers"
        icon="ri:team-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        title="Đối tác Tài chính"
        :count="stats.financialSuppliers"
        icon="ri:bank-card-line"
        iconStyle="bg-success"
      />
      <ArtStatsCard
        title="Đối tác Công nợ"
        :count="stats.creditSuppliers"
        icon="ri:error-warning-line"
        iconStyle="bg-danger"
      />
    </div>

    <ArtSearchBar
      id="tour-search"
      v-model="searchForm"
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
        layout="search,refresh,size,fullscreen,columns,settings,guide"
        @refresh="refreshData"
        @guide="startTour"
      >
        <template #left>
          <div class="flex items-center gap-3">
            <ElButton
              id="tour-add-btn"
              type="primary"
              v-auth="Permissions.Warehouse.SupplierManagement.Create"
              v-ripple
              :disabled="importing"
              @click="handleAdd"
              style="margin-left: 0"
            >
              <ElIcon><Plus /></ElIcon> Thêm đối tác mới
            </ElButton>

            <ElButton
              :loading="exporting"
              :disabled="importing"
              v-ripple
              @click="handleExport"
              style="margin-left: 0"
            >
              <ElIcon><Download /></ElIcon> Xuất Excel
            </ElButton>

            <ElDropdown
              trigger="click"
              style="margin-left: 0"
              :disabled="importing"
            >
              <ElButton v-ripple :loading="importing" :disabled="importing">
                <ElIcon><Upload /></ElIcon>
                {{ importing ? "Đang nhập..." : "Nhập Excel" }}
                <ElIcon class="el-icon--right"><ArrowDown /></ElIcon>
              </ElButton>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem @click="handleDownloadTemplate">
                    <div class="flex items-center gap-2">
                      <ElIcon><Download /></ElIcon> Tải mẫu Excel
                    </div>
                  </ElDropdownItem>
                  <ElDropdownItem>
                    <ElUpload
                      action="#"
                      :show-file-list="false"
                      :auto-upload="false"
                      :on-change="(file) => file.raw && handleImport(file.raw)"
                      accept=".xlsx, .xls"
                    >
                      <div class="flex items-center gap-2 w-full">
                        <ElIcon><Upload /></ElIcon> Nhập dữ liệu vào
                      </div>
                    </ElUpload>
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>

            <ElButton
              v-if="selectedRows.length === 1"
              type="warning"
              v-ripple
              :disabled="importing"
              @click="handleCloneMany"
              style="margin-left: 0"
            >
              <ElIcon><DocumentCopy /></ElIcon> Nhân bản
            </ElButton>
            <ElButton
              v-if="selectedRows.length > 0"
              type="danger"
              v-ripple
              :disabled="importing"
              @click="handleDeleteMany"
              style="margin-left: 0"
            >
              <ElIcon><Delete /></ElIcon> Xóa ({{ selectedRows.length }})
            </ElButton>

            <!-- Assuming stats will return deletedSuppliersCount if needed, or we just show the button -->
            <ElButton
              type="info"
              v-ripple
              :disabled="importing"
              @click="openRestoreDialog"
              style="margin-left: 0"
            >
              <ElIcon><RefreshLeft /></ElIcon> Khôi phục
            </ElButton>
          </div>
        </template>
      </ArtTableHeader>

      <ArtTable
        id="tour-table"
        ref="tableRef"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <!-- Thêm cột checkbox thông qua config columns (type: 'selection') hoặc ArtTable sẽ tự xử lý nếu có type='selection' trong columns definition -->
        <template #partnerTypeId="{ row }">
          <ElTag :type="getPartnerTypeTag(row.partnerTypeId)" size="small">
            {{ getPartnerTypeName(row.partnerTypeId) }}
          </ElTag>
        </template>

        <template #contact="{ row }">
          <div class="flex flex-col text-xs">
            <span
              ><ElIcon class="mr-1"><Phone /></ElIcon
              >{{ row.phone || "-" }}</span
            >
            <span class="text-gray-400"
              ><ElIcon class="mr-1"><Message /></ElIcon
              >{{ row.email || "-" }}</span
            >
          </div>
        </template>

        <template #operation="{ row }">
          <div class="flex gap-2 justify-center">
            <ArtButtonTable
              type="edit"
              @click="handleEdit(row)"
              v-auth="Permissions.Warehouse.SupplierManagement.Edit"
            />
            <ArtButtonTable
              type="delete"
              @click="handleDelete(row)"
              v-auth="Permissions.Warehouse.SupplierManagement.Delete"
            />
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <ElDialog
      v-model="dialogVisible"
      width="600px"
      append-to-body
      destroy-on-close
    >
      <template #header>
        <div class="flex items-center justify-between pr-2">
          <span class="text-lg font-medium">{{ dialogTitle }}</span>
          <button
            id="tour-dialog-help"
            class="text-gray-400 hover:text-blue-500 transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center text-[20px]"
            @click.prevent="startDialogTour"
            title="Hướng dẫn"
            v-auth="Permissions.Warehouse.SupplierManagement.Edit"
          >
            <ElIcon><Help /></ElIcon>
          </button>
        </div>
      </template>
      <ElForm :model="formData" label-width="120px" class="mt-4">
        <ElFormItem label="Loại đối tác" required id="tour-form-type">
          <ElSelect
            v-model="formData.partnerTypeId"
            placeholder="Chọn loại đối tác..."
            class="w-full"
          >
            <ElOption label="Nhà cung cấp xe/phụ tùng" value="supplier" />
            <ElOption label="Đối tác tài chính (Trả góp)" value="financial" />
            <ElOption label="Đối tác bảo hiểm" value="insurance" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="Tên đối tác" required id="tour-form-name">
          <ElInput
            v-model="formData.name"
            placeholder="Ví dụ: Honda Việt Nam, FE Credit..."
          />
        </ElFormItem>
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="Điện thoại" id="tour-form-phone">
            <ElInput v-model="formData.phone" />
          </ElFormItem>
          <ElFormItem label="Mã số thuế" id="tour-form-tax">
            <ElInput v-model="formData.taxIdentificationNumber" />
          </ElFormItem>
        </div>
        <ElFormItem label="Email" id="tour-form-email">
          <ElInput v-model="formData.email" />
        </ElFormItem>
        <ElFormItem label="Địa chỉ" id="tour-form-address">
          <ElInput v-model="formData.address" type="textarea" :rows="2" />
        </ElFormItem>
        <ElFormItem label="Ghi chú" id="tour-form-notes">
          <ElInput v-model="formData.notes" type="textarea" :rows="2" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="flex justify-end gap-2" id="tour-form-actions">
          <ElButton @click="dialogVisible = false">Hủy</ElButton>
          <ElButton type="primary" :loading="submitting" @click="submitForm">
            Lưu thông tin
          </ElButton>
        </div>
      </template>
    </ElDialog>

    <ElDialog
      v-model="importResultDialogVisible"
      title="Kết quả nhập dữ liệu Excel"
      width="600px"
      append-to-body
    >
      <div v-if="importResultData" class="space-y-4">
        <div class="flex items-center gap-2 text-lg">
          <ElIcon class="text-success text-2xl"><SuccessFilled /></ElIcon>
          <span
            >Đã nhập thành công
            <strong>{{ importResultData.successCount }}</strong> dòng.</span
          >
        </div>

        <div
          v-if="importResultData.failedCount > 0"
          class="flex items-center gap-2 text-lg text-danger"
        >
          <ElIcon class="text-2xl"><WarningFilled /></ElIcon>
          <span
            >Thất bại
            <strong>{{ importResultData.failedCount }}</strong> dòng.</span
          >
        </div>

        <div
          v-if="importResultData.failedCount > 0"
          class="mt-4 p-4 bg-gray-50 rounded-lg"
        >
          <p class="mb-3 text-gray-600">
            Bạn có thể tải xuống danh sách các dòng bị lỗi để kiểm tra và sửa
            lại:
          </p>
          <div class="flex gap-3">
            <ElButton
              type="primary"
              plain
              tag="a"
              :href="apiUrl + importResultData.errorFileUrl"
            >
              <ElIcon class="mr-1"><Download /></ElIcon> Tải danh sách lỗi
            </ElButton>
            <ElButton
              type="danger"
              plain
              tag="a"
              :href="apiUrl + importResultData.errorFileWithReasonUrl"
            >
              <ElIcon class="mr-1"><Download /></ElIcon> Tải danh sách lỗi (kèm
              lý do)
            </ElButton>
          </div>
        </div>
      </div>
      <template #footer>
        <ElButton @click="importResultDialogVisible = false">Đóng</ElButton>
      </template>
    </ElDialog>

    <ElDialog v-model="restoreDialogVisible" width="800px" append-to-body>
      <template #header>
        <div class="flex items-center justify-between pr-2">
          <span class="text-lg font-medium">Khôi phục đối tác đã xóa</span>
          <button
            id="tour-restore-help"
            class="text-gray-400 hover:text-blue-500 transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center text-[20px]"
            @click.prevent="startRestoreTour"
            title="Hướng dẫn"
            v-auth="Permissions.Warehouse.SupplierManagement.Edit"
          >
            <ElIcon><Help /></ElIcon>
          </button>
        </div>
      </template>
      <div class="mb-4 text-gray-500 text-sm" id="tour-restore-desc">
        Chọn các đối tác bạn muốn khôi phục từ danh sách bên dưới.
      </div>
      <ElTable
        id="tour-restore-table"
        v-loading="deletedSuppliersLoading"
        :data="deletedSuppliersData"
        border
        max-height="400"
        @selection-change="handleDeletedSelectionChange"
      >
        <ElTableColumn type="selection" width="50" align="center" />
        <ElTableColumn prop="name" label="Tên đối tác" width="200" />
        <ElTableColumn prop="phone" label="Điện thoại" width="120" />
        <ElTableColumn
          prop="email"
          label="Email"
          min-width="150"
          show-overflow-tooltip
        />
        <ElTableColumn prop="deleted_at" label="Thời gian xóa" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.deleted_at) }}
          </template>
        </ElTableColumn>
      </ElTable>
      <template #footer>
        <div class="flex justify-between items-center w-full">
          <span></span>
          <div class="flex gap-2" id="tour-restore-actions">
            <ElButton @click="restoreDialogVisible = false">Đóng</ElButton>
            <ElButton
              type="success"
              :disabled="selectedDeletedSuppliers.length === 0"
              @click="handleRestoreMany"
            >
              <ElIcon class="mr-1"><RefreshRight /></ElIcon>
              Khôi phục đã chọn
            </ElButton>
          </div>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { Permissions } from "@/domain/constants/permissions";
import { ref } from "vue";
import {
  Plus,
  Download,
  Phone,
  Message,
  Upload,
  DocumentCopy,
  Delete,
  RefreshRight,
  RefreshLeft,
  ArrowDown,
  SuccessFilled,
  WarningFilled,
  Help,
} from "@element-plus/icons-vue";
import { useSupplierTable } from "./hooks/useSupplierTable";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

defineOptions({ name: "InventorySupplier" });

const apiUrl = import.meta.env.VITE_PUBLIC_API_URL_FOR_BROWSER_CLIENT || "";

const searchForm = ref({
  name: "",
  type: [] as string[],
});

const searchItems = ref([
  {
    key: "name",
    label: "Từ khóa",
    type: "input",
    placeholder: "Tìm theo tên, SĐT, CCCD, địa chỉ...",
  },
  {
    key: "type",
    label: "Đối tác",
    type: "select",
    props: {
      options: [] as { label: string; value: string }[],
      multiple: true,
      collapseTags: true,
      filterable: true,
      clearable: true,
      placeholder: "Chọn loại đối tác...",
    },
  },
]);

const formatDateTime = (val: string | null | undefined) => {
  if (!val) return "Chưa có cập nhật";
  return new Date(val).toLocaleString("vi-VN");
};

const startTour = () => {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    nextBtnText: "Tiếp theo",
    prevBtnText: "Quay lại",
    doneBtnText: "Hoàn thành",
    steps: [
      {
        element: "#tour-stats",
        popover: {
          title: "Thống kê tổng quan",
          description:
            "Khu vực này hiển thị các thông tin thống kê chung về các loại đối tác.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-search",
        popover: {
          title: "Tìm kiếm",
          description:
            "Sử dụng thanh tìm kiếm để nhanh chóng lọc các đối tác theo từ khóa hoặc phân loại.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-add-btn",
        popover: {
          title: "Thêm mới",
          description: "Nhấn vào đây để tạo một đối tác mới trên hệ thống.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-table",
        popover: {
          title: "Danh sách đối tác",
          description:
            "Bảng hiển thị chi tiết các đối tác. Bạn có thể chọn nhiều dòng để thao tác nhanh.",
          side: "top",
          align: "start",
        },
      },
    ],
  });
  driverObj.drive();
};

const startDialogTour = () => {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    nextBtnText: "Tiếp theo",
    prevBtnText: "Quay lại",
    doneBtnText: "Hoàn thành",
    steps: [
      {
        element: "#tour-form-type",
        popover: {
          title: "Loại đối tác",
          description: "Bắt buộc chọn loại đối tác.",
          side: "right",
          align: "start",
        },
      },
      {
        element: "#tour-form-name",
        popover: {
          title: "Tên đối tác",
          description: "Nhập tên của đối tác (bắt buộc).",
          side: "right",
          align: "start",
        },
      },
      {
        element: "#tour-form-phone",
        popover: {
          title: "Điện thoại",
          description: "Số điện thoại liên hệ.",
          side: "right",
          align: "start",
        },
      },
      {
        element: "#tour-form-email",
        popover: {
          title: "Email",
          description: "Địa chỉ email liên hệ.",
          side: "right",
          align: "start",
        },
      },
      {
        element: "#tour-form-actions",
        popover: {
          title: "Thao tác",
          description: "Nhấn Xác nhận để lưu thay đổi hoặc Hủy để đóng.",
          side: "top",
          align: "end",
        },
      },
    ],
  });
  driverObj.drive();
};

const startRestoreTour = () => {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    nextBtnText: "Tiếp theo",
    prevBtnText: "Quay lại",
    doneBtnText: "Hoàn thành",
    steps: [
      {
        element: "#tour-restore-desc",
        popover: {
          title: "Hướng dẫn khôi phục",
          description: "Danh sách các đối tác đã xóa sẽ hiển thị tại đây.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-restore-table",
        popover: {
          title: "Chọn đối tác",
          description: "Tích chọn vào các đối tác mà bạn muốn khôi phục lại.",
          side: "top",
          align: "start",
        },
      },
      {
        element: "#tour-restore-actions",
        popover: {
          title: "Thực hiện khôi phục",
          description:
            "Sau khi chọn, nhấn nút 'Khôi phục đã chọn' để hoàn tất.",
          side: "top",
          align: "end",
        },
      },
    ],
  });
  driverObj.drive();
};

const {
  data,
  loading,
  pagination,
  columns: baseColumns,
  columnChecks,
  handleSizeChange,
  handleCurrentChange,
  handleSearch,
  handleReset,
  refreshData,
  stats,
  partnerTypes,

  selectedRows,
  handleSelectionChange,
  handleDeleteMany,
  handleCloneMany,

  restoreDialogVisible,
  deletedSuppliersData,
  deletedSuppliersLoading,
  selectedDeletedSuppliers,
  handleDeletedSelectionChange,
  openRestoreDialog,
  handleRestoreMany,

  importing,
  importResultData,
  importResultDialogVisible,
  handleImport,
  handleDownloadTemplate,

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
} = useSupplierTable();

// Update search items dropdown options
import { watchEffect } from "vue";
watchEffect(() => {
  if (partnerTypes.value && searchItems.value[1].props) {
    searchItems.value[1].props.options = partnerTypes.value.map((pt) => ({
      label: pt.name,
      value: pt.key,
    }));
  }
});

const getPartnerTypeTag = (type: string) => {
  const partnerType = partnerTypes.value.find((pt) => pt.key === type);
  if (!partnerType) return "info";
  return type === "supplier"
    ? "primary"
    : type === "financial"
      ? "success"
      : "warning";
};

const getPartnerTypeName = (type: string) => {
  const partnerType = partnerTypes.value.find((pt) => pt.key === type);
  return partnerType?.name || type;
};

// Define columns inside index to allow selection
const columns = ref([
  { type: "selection" as const, width: 50, align: "center" },
  ...baseColumns.value,
]);
</script>

<style scoped>
.art-table-card :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.art-table-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 3%);
}
</style>
