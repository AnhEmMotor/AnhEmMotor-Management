<template>
  <div class="flex flex-col gap-4 pb-5">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ArtStatsCard
        title="Tổng số lượng thương hiệu"
        :count="statistics.totalBrands"
        icon="ri:medal-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        title="Xuất xứ phổ biến"
        :count="statistics.popularOrigin ? statistics.popularOrigin + '' : 'Chưa có dữ liệu'"
        :description="
          statistics.popularOriginCount ? `Số lượng: ${statistics.popularOriginCount}` : '0'
        "
        icon="ri:global-line"
        iconStyle="bg-success"
      />
      <ArtStatsCard
        title="Mới cập nhật"
        :count="statistics.latestUpdatedBrandName || 'Chưa có'"
        :description="
          statistics.latestUpdatedAt
            ? 'Thời gian cập nhật: ' + formatDateTime(statistics.latestUpdatedAt)
            : 'Chưa có cập nhật mới'
        "
        icon="ri:time-line"
        iconStyle="bg-info"
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
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <div class="flex items-center gap-3">
            <ElButton
              v-auth="'Permissions.Brands.Create'"
              type="primary"
              v-ripple
              :disabled="importing"
              @click="handleAdd"
              style="margin-left: 0"
            >
              <ElIcon><Plus /></ElIcon> Thêm thương hiệu
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

            <ElDropdown trigger="click" style="margin-left: 0" :disabled="importing">
              <ElButton v-ripple :loading="importing" :disabled="importing">
                <ElIcon><Upload /></ElIcon> {{ importing ? 'Đang nhập...' : 'Nhập Excel' }}
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
              <ElIcon><DocumentCopy /></ElIcon> Nhân bản ({{ selectedRows.length }})
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
              <ElIcon><RefreshLeft /></ElIcon> Khôi phục ({{ statistics.deletedBrandsCount }})
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
            <ElTag v-if="row.origin" size="small" effect="plain" type="info" round>
              {{ row.origin }}
            </ElTag>
            <span v-else class="text-gray-200">-</span>
          </div>
        </template>

        <template #operation="{ row }">
          <div class="flex gap-2 justify-center">
            <ArtButtonTable
              v-auth="'Permissions.Brands.Edit'"
              type="edit"
              @click="handleEdit(row)"
            />
            <ArtButtonTable
              v-auth="'Permissions.Brands.Delete'"
              type="delete"
              @click="handleDelete(row)"
            />
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      append-to-body
      destroy-on-close
    >
      <ElForm :model="formData" label-width="100px" class="mt-4">
        <ElFormItem label="Tên hiệu" required>
          <ElInput v-model="formData.name" placeholder="Nhập tên thương hiệu..." />
        </ElFormItem>
        <ElFormItem label="Xuất xứ">
          <ElInput v-model="formData.origin" placeholder="Ví dụ: Nhật Bản, Ý..." />
        </ElFormItem>
        <ElFormItem label="Logo">
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
          <div class="mt-1 text-[11px] text-gray-400">Định dạng JPG, PNG. Tối đa 2MB.</div>
        </ElFormItem>
        <ElFormItem label="Mô tả">
          <ElInput
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="Mô tả ngắn gọn về thương hiệu..."
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="dialogVisible = false">Hủy</ElButton>
          <ElButton type="primary" :loading="submitting" @click="submitForm"> Xác nhận </ElButton>
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
            >Đã nhập thành công <strong>{{ importResultData.successCount }}</strong> dòng.</span
          >
        </div>

        <div
          v-if="importResultData.failedCount > 0"
          class="flex items-center gap-2 text-lg text-danger"
        >
          <ElIcon class="text-2xl"><WarningFilled /></ElIcon>
          <span
            >Thất bại <strong>{{ importResultData.failedCount }}</strong> dòng.</span
          >
        </div>

        <div v-if="importResultData.failedCount > 0" class="mt-4 p-4 bg-gray-50 rounded-lg">
          <p class="mb-3 text-gray-600"
            >Bạn có thể tải xuống danh sách các dòng bị lỗi để kiểm tra và sửa lại:</p
          >
          <div class="flex gap-3">
            <ElButton type="primary" plain tag="a" :href="apiUrl + importResultData.errorFileUrl">
              <ElIcon class="mr-1"><Download /></ElIcon> Tải danh sách lỗi
            </ElButton>
            <ElButton
              type="danger"
              plain
              tag="a"
              :href="apiUrl + importResultData.errorFileWithReasonUrl"
            >
              <ElIcon class="mr-1"><Download /></ElIcon> Tải danh sách lỗi (kèm lý do)
            </ElButton>
          </div>
        </div>
      </div>
      <template #footer>
        <ElButton @click="importResultDialogVisible = false">Đóng</ElButton>
      </template>
    </ElDialog>
    <ElDialog
      v-model="restoreDialogVisible"
      title="Khôi phục thương hiệu đã xóa"
      width="800px"
      append-to-body
    >
      <div class="mb-4 text-gray-500 text-sm">
        Chọn các thương hiệu bạn muốn khôi phục từ danh sách bên dưới.
      </div>
      <ElTable
        v-loading="deletedBrandsLoading"
        :data="deletedBrandsData"
        border
        max-height="400"
        @selection-change="handleDeletedSelectionChange"
      >
        <ElTableColumn type="selection" width="50" align="center" />
        <ElTableColumn prop="name" label="Tên thương hiệu" width="200" />
        <ElTableColumn prop="description" label="Miêu tả" min-width="250" show-overflow-tooltip />
        <ElTableColumn prop="deletedAt" label="Thời gian xóa" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.deletedAt) }}
          </template>
        </ElTableColumn>
      </ElTable>
      <template #footer>
        <div class="flex justify-between items-center w-full">
          <span></span>
          <div class="flex gap-2">
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
  import { ref } from 'vue'
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
    WarningFilled
  } from '@element-plus/icons-vue'
  import { useBrandTable } from './hooks/useBrandTable'
  import { FileApi } from '@/api/file.api'
  import { ElMessage } from 'element-plus'

  const apiUrl = import.meta.env.VITE_PUBLIC_API_URL_FOR_BROWSER_CLIENT || ''

  defineOptions({ name: 'ProductBrand' })

  const searchForm = ref({})

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
    handleExport
  } = useBrandTable()

  const formatDateTime = (val: string | null | undefined) => {
    if (!val) return 'Chưa có cập nhật'
    return new Date(val).toLocaleString('vi-VN')
  }

  const handleUpload = async (options: any) => {
    try {
      const res = await FileApi.uploadProductImage(options.file)
      formData.value.logoUrl = res.publicUrl
      ElMessage.success('Tải ảnh lên thành công')
    } catch (err: any) {
      ElMessage.error(err.message || 'Tải ảnh thất bại')
    }
  }

  const searchItems = [
    {
      key: 'name',
      label: 'Tên thương hiệu',
      type: 'input',
      props: { placeholder: 'Ví dụ: Honda, Yamaha...' }
    },
    {
      key: 'origin',
      label: 'Xuất xứ',
      type: 'input',
      props: { placeholder: 'Ví dụ: Nhật Bản, Ý...' }
    }
  ]
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
