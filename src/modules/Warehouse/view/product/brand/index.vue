<template>
  <div class="flex flex-col gap-4 pb-5">
    <div id="tour-stats" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ArtStatsCard
        title="Tổng số lượng thương hiệu"
        :count="statistics.totalBrands"
        icon="ri:medal-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        title="Xuất xứ phổ biến"
        :count="
          statistics.popularOrigin
            ? statistics.popularOrigin + ''
            : 'Chưa có dữ liệu'
        "
        :description="
          statistics.popularOriginCount
            ? `Số lượng: ${statistics.popularOriginCount}`
            : '0'
        "
        icon="ri:global-line"
        iconStyle="bg-success"
      />
      <ArtStatsCard
        title="Mới cập nhật"
        :count="statistics.latestUpdatedBrandName || 'Chưa có'"
        :description="
          statistics.latestUpdatedAt
            ? 'Thời gian cập nhật: ' +
              formatDateTime(statistics.latestUpdatedAt)
            : 'Chưa có cập nhật mới'
        "
        icon="ri:time-line"
        iconStyle="bg-info"
      />
    </div>

    <ArtSearchBar
      id="tour-search"
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
        layout="search,refresh,size,fullscreen,columns,settings,guide"
        @refresh="refreshData"
        @guide="startTour"
      >
        <template #left>
          <div class="flex items-center gap-3">
            <ElButton
              id="tour-add-btn"
              v-auth="'Permissions.Warehouse.ProductManagement.Create'"
              type="primary"
              v-ripple
              :disabled="importing"
              @click="handleAdd"
              style="margin-left: 0"
            >
              <ElIcon><Plus /></ElIcon> Thêm thương hiệu
            </ElButton>

            <ElButton
              v-auth="'Permissions.Warehouse.ProductManagement.View'"
              :loading="exporting"
              :disabled="importing"
              v-ripple
              @click="handleExport"
              style="margin-left: 0"
            >
              <ElIcon><Download /></ElIcon> Xuất Excel
            </ElButton>

            <ElDropdown
              v-auth="'Permissions.Warehouse.ProductManagement.Create'"
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
              v-if="selectedRows.length > 0"
              type="warning"
              v-ripple
              :disabled="importing"
              @click="handleCloneMany"
              style="margin-left: 0"
            >
              <ElIcon><DocumentCopy /></ElIcon> Nhân bản ({{
                selectedRows.length
              }})
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

            <ElButton
              v-if="statistics.deletedBrandsCount > 0"
              type="info"
              v-ripple
              :disabled="importing"
              @click="openRestoreDialog"
              style="margin-left: 0"
            >
              <ElIcon><RefreshLeft /></ElIcon> Khôi phục ({{
                statistics.deletedBrandsCount
              }})
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
        <template #logoUrl="{ row }">
          <div
            class="flex-c h-10 w-10 bg-gray-50 rounded shadow-inner border border-gray-100 overflow-hidden mx-auto"
          >
            <ElImage
              v-if="row.logoUrl"
              :src="row.logoUrl"
              class="w-full h-full"
              fit="contain"
              :preview-src-list="[row.logoUrl]"
              preview-teleported
            />
            <ElIcon v-else class="text-gray-300"><Picture /></ElIcon>
          </div>
        </template>

        <template #name="{ row }">
          <div class="flex flex-col">
            <span class="font-bold text-gray-800">{{ row.name }}</span>
          </div>
        </template>

        <template #origin="{ row }">
          <div class="flex items-center gap-1">
            <ElTag
              v-if="row.origin"
              size="small"
              effect="plain"
              type="info"
              round
            >
              {{ row.origin }}
            </ElTag>
            <span v-else class="text-gray-200">-</span>
          </div>
        </template>

        <template #operation="{ row }">
          <div class="flex gap-2 justify-center">
            <ArtButtonTable
              v-auth="'Permissions.Warehouse.ProductManagement.Edit'"
              type="edit"
              @click="handleEdit(row)"
            />
            <ArtButtonTable
              v-auth="'Permissions.Warehouse.ProductManagement.Delete'"
              type="delete"
              @click="handleDelete(row)"
            />
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <ElDialog
      v-model="dialogVisible"
      width="500px"
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
            v-auth="'Permissions.Warehouse.ProductManagement.Edit'"
          >
            <ElIcon><Help /></ElIcon>
          </button>
        </div>
      </template>
      <ElForm :model="formData" label-width="100px" class="mt-4">
        <ElFormItem label="Tên hiệu" required id="tour-form-name">
          <ElInput
            v-model="formData.name"
            placeholder="Nhập tên thương hiệu..."
          />
        </ElFormItem>
        <ElFormItem label="Xuất xứ" id="tour-form-origin">
          <ElInput
            v-model="formData.origin"
            placeholder="Ví dụ: Nhật Bản, Ý..."
          />
        </ElFormItem>
        <ElFormItem label="Logo" id="tour-form-logo">
          <ElUpload
            class="logo-uploader"
            action="#"
            :show-file-list="false"
            :auto-upload="true"
            :http-request="handleUpload"
          >
            <div v-if="formData.logoUrl" class="relative group">
              <img :src="formData.logoUrl" class="logo-preview" />
              <div
                class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex-c transition-opacity rounded-lg"
              >
                <ElIcon class="text-white text-xl"><Plus /></ElIcon>
              </div>
            </div>
            <div
              v-else
              class="logo-uploader-trigger flex flex-col items-center justify-center gap-2"
            >
              <ElIcon class="text-gray-400 text-2xl"><Plus /></ElIcon>
              <span class="text-xs text-gray-400">Tải ảnh lên</span>
            </div>
          </ElUpload>
          <div class="mt-1 text-[11px] text-gray-400">
            Định dạng JPG, PNG. Tối đa 2MB.
          </div>
        </ElFormItem>
        <ElFormItem label="Mô tả" id="tour-form-desc">
          <ElInput
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="Mô tả ngắn gọn về thương hiệu..."
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="flex justify-end gap-2" id="tour-form-actions">
          <ElButton @click="dialogVisible = false">Hủy</ElButton>
          <ElButton type="primary" :loading="submitting" @click="submitForm">
            Xác nhận
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
          <span class="text-lg font-medium">Khôi phục thương hiệu đã xóa</span>
          <button
            id="tour-restore-help"
            class="text-gray-400 hover:text-blue-500 transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center text-[20px]"
            @click.prevent="startRestoreTour"
            title="Hướng dẫn"
            v-auth="'Permissions.Warehouse.ProductManagement.Edit'"
          >
            <ElIcon><Help /></ElIcon>
          </button>
        </div>
      </template>
      <div class="mb-4 text-gray-500 text-sm" id="tour-restore-desc">
        Chọn các thương hiệu bạn muốn khôi phục từ danh sách bên dưới.
      </div>
      <ElTable
        id="tour-restore-table"
        v-loading="deletedBrandsLoading"
        :data="deletedBrandsData"
        border
        max-height="400"
        @selection-change="handleDeletedSelectionChange"
      >
        <ElTableColumn type="selection" width="50" align="center" />
        <ElTableColumn prop="name" label="Tên thương hiệu" width="200" />
        <ElTableColumn
          prop="description"
          label="Miêu tả"
          min-width="250"
          show-overflow-tooltip
        />
        <ElTableColumn prop="deletedAt" label="Thời gian xóa" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.deletedAt) }}
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
              :disabled="selectedDeletedBrands.length === 0"
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
  Picture,
  Download,
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
import { useBrandTable } from "@/modules/Warehouse/logic/product/brand/hooks/useBrandTable";
import { FileApi } from "@/api/operations";
import { ElMessage } from "element-plus";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const apiUrl = import.meta.env.VITE_PUBLIC_API_URL_FOR_BROWSER_CLIENT || "";

defineOptions({ name: "ProductBrand" });

const searchForm = ref({});

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
            "Khu vực này hiển thị các thông tin thống kê chung về thương hiệu như tổng số lượng, xuất xứ phổ biến và thời gian cập nhật mới nhất.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-search",
        popover: {
          title: "Tìm kiếm",
          description:
            "Sử dụng thanh tìm kiếm để nhanh chóng lọc các thương hiệu theo tên hoặc xuất xứ.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-add-btn",
        popover: {
          title: "Thêm mới",
          description: "Nhấn vào đây để tạo một thương hiệu mới trên hệ thống.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-guide-btn",
        popover: {
          title: "Hướng dẫn sử dụng",
          description:
            "Bạn có thể xem lại hướng dẫn này bất cứ lúc nào bằng cách nhấn vào nút này.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-table",
        popover: {
          title: "Danh sách thương hiệu",
          description:
            "Bảng hiển thị chi tiết các thương hiệu. Bạn có thể xem logo, tên, xuất xứ và thực hiện các thao tác sửa/xóa tại đây.",
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
        element: "#tour-form-name",
        popover: {
          title: "Tên thương hiệu",
          description: "Nhập tên của thương hiệu (bắt buộc).",
          side: "right",
          align: "start",
        },
      },
      {
        element: "#tour-form-origin",
        popover: {
          title: "Xuất xứ",
          description: "Nhập nơi xuất xứ của thương hiệu.",
          side: "right",
          align: "start",
        },
      },
      {
        element: "#tour-form-logo",
        popover: {
          title: "Logo",
          description:
            "Tải lên hình ảnh logo của thương hiệu. Hỗ trợ định dạng JPG, PNG tối đa 2MB.",
          side: "right",
          align: "start",
        },
      },
      {
        element: "#tour-form-desc",
        popover: {
          title: "Mô tả",
          description: "Thêm mô tả ngắn gọn về thương hiệu.",
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
          description: "Danh sách các thương hiệu đã xóa sẽ hiển thị tại đây.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#tour-restore-table",
        popover: {
          title: "Chọn thương hiệu",
          description:
            "Tích chọn vào các thương hiệu mà bạn muốn khôi phục lại.",
          side: "top",
          align: "start",
        },
      },
      {
        element: "#tour-restore-actions",
        popover: {
          title: "Thực hiện khôi phục",
          description:
            'Sau khi chọn, nhấn nút "Khôi phục đã chọn" để hoàn tất.',
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
  columns,
  columnChecks,
  handleSizeChange,
  handleCurrentChange,
  handleSearch,
  handleReset,
  refreshData,
  statistics,

  selectedRows,
  handleSelectionChange,
  handleDeleteMany,
  handleCloneMany,

  restoreDialogVisible,
  deletedBrandsData,
  deletedBrandsLoading,
  selectedDeletedBrands,
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
} = useBrandTable();

const formatDateTime = (val: string | null | undefined) => {
  if (!val) return "Chưa có cập nhật";
  return new Date(val).toLocaleString("vi-VN");
};

const handleUpload = async (options: any) => {
  try {
    const res = await FileApi.uploadProductImage(options.file);
    formData.value.logoUrl = res.publicUrl;
    ElMessage.success("Tải ảnh lên thành công");
  } catch (err: any) {
    ElMessage.error(err.message || "Tải ảnh thất bại");
  }
};

const searchItems = [
  {
    key: "name",
    label: "Tên thương hiệu",
    type: "input",
    props: { placeholder: "Ví dụ: Honda, Yamaha..." },
  },
  {
    key: "origin",
    label: "Xuất xứ",
    type: "input",
    props: { placeholder: "Ví dụ: Nhật Bản, Ý..." },
  },
];
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

.logo-uploader :deep(.el-upload) {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  background-color: #fafafa;
  border: 1px dashed #d9d9d9;
  border-radius: 12px;
  transition: var(--el-transition-duration-fast);
}

.logo-uploader :deep(.el-upload:hover) {
  background-color: #fff;
  border-color: var(--main-color);
}

.logo-uploader-trigger {
  width: 100px;
  height: 100px;
}

.logo-preview {
  display: block;
  width: 100px;
  height: 100px;
  padding: 8px;
  object-fit: contain;
  border-radius: 12px;
}
</style>
