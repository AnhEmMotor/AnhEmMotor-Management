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
          <ElButton v-auth="'Permissions.Brands.Create'" type="primary" v-ripple @click="handleAdd">
            <ElIcon><Plus /></ElIcon> Thêm thương hiệu
          </ElButton>
          <ElButton :loading="exporting" v-ripple @click="handleExport">
            <ElIcon><Download /></ElIcon> Xuất Excel
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
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
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { Plus, Picture, Download } from '@element-plus/icons-vue'
  import { useBrandTable } from './hooks/useBrandTable'
  import { FileApi } from '@/api/file.api'
  import { ElMessage } from 'element-plus'

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
