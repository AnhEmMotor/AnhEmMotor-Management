<template>
  <div class="flex flex-col gap-4 pb-5">
    <!-- Header Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <ArtStatsCard
        :title="$t('menus.product.type.stats.total')"
        :count="pagination.total"
        description="Tổng số thể loại hiện có"
        icon="ri:folders-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        :title="$t('menus.product.type.stats.product')"
        :count="12"
        description="Số lượng danh mục sản phẩm"
        icon="ri:shopping-bag-3-line"
        iconStyle="bg-success"
      />
      <ArtStatsCard
        :title="$t('menus.product.type.stats.vehicle')"
        :count="8"
        description="Số lượng dòng xe"
        icon="ri:motorbike-line"
        iconStyle="bg-info"
      />
      <ArtStatsCard
        :title="$t('menus.product.type.stats.new')"
        description="Tay côn - Mới thêm"
        icon="ri:add-circle-line"
        iconStyle="bg-warning"
      />
    </div>

    <!-- Tabs Selection -->
    <div class="bg-white p-1 rounded-lg shadow-sm self-start flex gap-1 border border-gray-100">
      <div
        v-for="tab in tabs"
        :key="tab.value"
        class="px-6 py-2 rounded-md cursor-pointer transition-all text-sm font-medium flex items-center gap-2"
        :class="
          activeTab === tab.value
            ? 'bg-primary text-white shadow-md'
            : 'text-gray-500 hover:bg-gray-50'
        "
        @click="activeTab = tab.value"
      >
        <ElIcon><component :is="tab.icon" /></ElIcon>
        {{ $t('menus.' + tab.label) }}
      </div>
    </div>

    <!-- Search Bar -->
    <ArtSearchBar
      :items="searchItems"
      :label-width="100"
      :span="8"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- Table Card -->
    <ElCard class="flex-1 art-table-card">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-2">
            <h4 class="m-0">{{
              activeTab === 'product'
                ? $t('menus.product.type.table.titleProduct')
                : $t('menus.product.type.table.titleVehicle')
            }}</h4>
            <ElTag size="small" type="danger" v-if="!loading" effect="dark" round>
              {{ pagination.total }} {{ $t('menus.product.brand.records') }}
            </ElTag>
          </div>
        </div>
      </template>

      <!-- Table Header Tools -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElButton type="primary" v-ripple @click="handleAdd">
            <ElIcon><Plus /></ElIcon> Thêm mới
          </ElButton>
          <ElButton v-ripple>
            <ElIcon><Download /></ElIcon> Xuất file
          </ElButton>
        </template>
      </ArtTableHeader>

      <!-- Data Table -->
      <ArtTable
        ref="tableRef"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <!-- Image Column -->
        <template #imageUrl="{ row }">
          <div
            class="flex-c h-10 w-10 bg-gray-50 rounded shadow-inner border border-gray-100 overflow-hidden mx-auto"
          >
            <ElImage
              v-if="row.imageUrl"
              :src="row.imageUrl"
              class="w-full h-full"
              fit="cover"
              :preview-src-list="[row.imageUrl]"
              preview-teleported
            />
            <ElIcon v-else class="text-gray-300"><Picture /></ElIcon>
          </div>
        </template>

        <!-- Name Column -->
        <template #name="{ row }">
          <div class="flex flex-col">
            <span class="font-bold text-gray-800">{{ row.name }}</span>
            <span class="text-[11px] text-gray-400">ID: {{ row.id }}</span>
          </div>
        </template>

        <!-- Status Column -->
        <template #isActive="{ row }">
          <ElTag :type="row.isActive ? 'success' : 'info'" size="small" effect="light" round>
            {{ row.isActive ? 'Hoạt động' : 'Tạm dừng' }}
          </ElTag>
        </template>

        <!-- Operation Column -->
        <template #operation="{ row }">
          <div class="flex gap-2 justify-center">
            <ArtButtonTable type="edit" @click="handleEdit(row)" />
            <ArtButtonTable type="delete" @click="handleDelete(row)" />
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <!-- Add/Edit Dialog -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="550px"
      append-to-body
      destroy-on-close
    >
      <ElForm :model="formData" label-width="110px" class="mt-4 pr-4">
        <ElFormItem label="Tên thể loại" required>
          <ElInput v-model="formData.name" placeholder="Nhập tên thể loại..." />
        </ElFormItem>

        <ElFormItem label="Đường dẫn (Slug)">
          <ElInput v-model="formData.slug" placeholder="slug-ten-the-loai..." />
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
              <ElIcon class="text-gray-400 text-2xl"><Plus /></ElIcon>
              <span class="text-xs text-gray-400">Tải ảnh</span>
            </div>
          </ElUpload>
        </ElFormItem>

        <ElFormItem label="Thứ tự">
          <ElInputNumber v-model="formData.sortOrder" :min="0" />
        </ElFormItem>

        <ElFormItem label="Trạng thái">
          <ElSwitch v-model="formData.isActive" active-text="Hoạt động" inactive-text="Tạm dừng" />
        </ElFormItem>

        <ElFormItem label="Mô tả">
          <ElInput
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="Mô tả về thể loại này..."
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
  import { Plus, Picture, Download, Box, Bicycle } from '@element-plus/icons-vue'
  import { useCategoryTable } from './hooks/useCategoryTable'
  import { FileApi } from '@/api/file.api'
  import { ElMessage } from 'element-plus'

  defineOptions({ name: 'ProductType' })

  const {
    activeTab,
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
    // CRUD
    dialogVisible,
    dialogTitle,
    formData,
    submitting,
    handleAdd,
    handleEdit,
    handleDelete,
    submitForm
  } = useCategoryTable()

  // Handle Image Upload
  const handleUpload = async (options: any) => {
    try {
      const res = await FileApi.uploadProductImage(options.file)
      formData.value.imageUrl = res.publicUrl
      ElMessage.success('Tải ảnh lên thành công')
    } catch (err: any) {
      ElMessage.error(err.message || 'Tải ảnh thất bại')
    }
  }

  const tabs = [
    { label: 'product.type.tabs.product', value: 'product', icon: Box },
    { label: 'product.type.tabs.vehicle', value: 'vehicle', icon: Bicycle }
  ]

  const searchItems = [
    {
      key: 'name',
      label: 'Tên thể loại',
      type: 'input',
      props: { placeholder: 'Tìm kiếm tên...' }
    }
  ]
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
</style>
