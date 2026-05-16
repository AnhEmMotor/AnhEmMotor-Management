<template>
  <div class="flex flex-col gap-4 pb-5">
    <!-- Header Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <ArtStatsCard
        :title="$t('menus.product.list.stats.total')"
        :count="pagination.total"
        description="Tổng số sản phẩm trong hệ thống"
        icon="ri:box-3-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        :title="$t('menus.product.list.stats.stock')"
        :count="1250"
        description="Tổng số lượng hàng trong kho"
        icon="ri:database-2-line"
        iconStyle="bg-success"
      />
      <ArtStatsCard
        :title="$t('menus.product.list.stats.active')"
        :count="pagination.total - 2"
        description="Sản phẩm đang hiển thị trên web"
        icon="ri:eye-line"
        iconStyle="bg-info"
      />
      <ArtStatsCard
        :title="$t('menus.product.list.stats.outOfStock')"
        :count="2"
        description="Sản phẩm hiện đang hết hàng"
        icon="ri:error-warning-line"
        iconStyle="bg-warning"
      />
    </div>

    <!-- Category Tabs -->
    <div
      class="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
      v-loading="loadingCategories"
    >
      <ElTabs v-model="activeCategory" class="product-tabs">
        <ElTabPane name="all">
          <template #label>
            <span class="flex items-center gap-2">
              <ElIcon><Menu /></ElIcon>
              {{ $t('menus.product.list.tabs.all') }}
            </span>
          </template>
        </ElTabPane>
        <ElTabPane v-for="cat in categories" :key="cat.id" :name="cat.id">
          <template #label>
            <span class="flex items-center gap-2">
              <ElIcon><CollectionTag /></ElIcon>
              {{ cat.name }}
            </span>
          </template>
        </ElTabPane>
      </ElTabs>
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
            <h4 class="m-0">{{ $t('menus.product.list.table.title') }}</h4>
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
        <template #cover_image_url="{ row }">
          <div
            class="flex-c h-12 w-12 bg-gray-50 rounded shadow-inner border border-gray-100 overflow-hidden mx-auto"
          >
            <ElImage
              v-if="row.cover_image_url"
              :src="row.cover_image_url"
              class="w-full h-full"
              fit="cover"
              :preview-src-list="[row.cover_image_url]"
              preview-teleported
            />
            <ElIcon v-else class="text-gray-300"><Picture /></ElIcon>
          </div>
        </template>

        <!-- Name Column -->
        <template #name="{ row }">
          <div class="flex flex-col">
            <span class="font-bold text-gray-800 leading-tight">{{ row.name }}</span>
            <span class="text-[11px] text-gray-400 mt-1">ID: #{{ row.id }}</span>
          </div>
        </template>

        <!-- Status Column -->
        <template #inventory_status="{ row }">
          <ElTag :type="getStatusType(row.inventory_status)" size="small" effect="light" round>
            {{ getStatusLabel(row.inventory_status) }}
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

    <!-- Product Form Dialog -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      append-to-body
      destroy-on-close
    >
      <ElForm :model="formData" label-width="120px" class="mt-2 pr-4">
        <ElTabs type="border-card" class="form-tabs">
          <!-- General Info Tab -->
          <ElTabPane label="Thông tin chung">
            <div class="grid grid-cols-2 gap-x-6 gap-y-2 py-2">
              <ElFormItem label="Tên sản phẩm" required class="col-span-2">
                <ElInput v-model="formData.name" placeholder="Nhập tên sản phẩm..." />
              </ElFormItem>

              <ElFormItem label="Thương hiệu" required>
                <ElSelect v-model="formData.brand_id" placeholder="Chọn thương hiệu" class="w-full">
                  <ElOption
                    v-for="item in brands"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </ElSelect>
              </ElFormItem>

              <ElFormItem label="Thể loại" required>
                <ElSelect v-model="formData.category_id" placeholder="Chọn thể loại" class="w-full">
                  <ElOption
                    v-for="item in categories"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </ElSelect>
              </ElFormItem>

              <ElFormItem label="Xuất xứ">
                <ElInput v-model="formData.origin" placeholder="Nhật Bản, Việt Nam..." />
              </ElFormItem>

              <ElFormItem label="Đơn vị tính">
                <ElInput v-model="formData.unit" placeholder="Chiếc, Bộ..." />
              </ElFormItem>

              <ElFormItem label="Số lượng tồn">
                <ElInputNumber v-model="formData.stock" :min="0" class="w-full" />
              </ElFormItem>

              <ElFormItem label="Trạng thái kho">
                <ElSelect v-model="formData.inventory_status" class="w-full">
                  <ElOption label="Còn hàng" value="InStock" />
                  <ElOption label="Sắp hết" value="LowStock" />
                  <ElOption label="Hết hàng" value="OutOfStock" />
                </ElSelect>
              </ElFormItem>

              <ElFormItem label="Mô tả ngắn" class="col-span-2">
                <ElInput
                  v-model="formData.description"
                  type="textarea"
                  :rows="3"
                  placeholder="Mô tả sơ lược về sản phẩm..."
                />
              </ElFormItem>
            </div>
          </ElTabPane>

          <!-- Media Tab -->
          <ElTabPane label="Hình ảnh & Media">
            <div class="py-4 flex flex-col items-center">
              <span class="text-sm font-medium text-gray-600 mb-4 self-start"
                >Ảnh đại diện sản phẩm</span
              >
              <ElUpload
                class="product-uploader"
                action="#"
                :show-file-list="false"
                :auto-upload="true"
                :http-request="handleUpload"
              >
                <div v-if="formData.cover_image_url" class="relative group">
                  <img :src="formData.cover_image_url" class="product-preview" />
                  <div
                    class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg"
                  >
                    <ElIcon class="text-white text-2xl"><Plus /></ElIcon>
                  </div>
                </div>
                <div
                  v-else
                  class="product-uploader-trigger flex flex-col items-center justify-center gap-3"
                >
                  <ElIcon class="text-gray-400 text-3xl"><Plus /></ElIcon>
                  <span class="text-sm text-gray-400 font-medium">Tải ảnh sản phẩm</span>
                </div>
              </ElUpload>
              <p class="text-xs text-gray-400 mt-4 italic"
                >Khuyên dùng ảnh tỉ lệ 1:1, dung lượng không quá 5MB.</p
              >
            </div>
          </ElTabPane>

          <!-- Specs Tab -->
          <ElTabPane label="Thông số kỹ thuật">
            <div class="grid grid-cols-2 gap-x-6 gap-y-2 py-2">
              <ElFormItem label="Động cơ">
                <ElInput
                  v-model="(formData as any).engine_type"
                  placeholder="Ví dụ: PGM-FI, 125cc..."
                />
              </ElFormItem>
              <ElFormItem label="Công suất">
                <ElInput
                  v-model="(formData as any).max_power"
                  placeholder="Ví dụ: 8.2 kW/8500 rpm..."
                />
              </ElFormItem>
              <ElFormItem label="Kích thước">
                <ElInput v-model="(formData as any).dimensions" placeholder="D x R x C (mm)..." />
              </ElFormItem>
              <ElFormItem label="Trọng lượng">
                <ElInputNumber v-model="(formData as any).weight" :min="0" class="w-full" />
              </ElFormItem>
              <ElFormItem label="Bình xăng">
                <ElInputNumber v-model="(formData as any).fuel_capacity" :min="0" class="w-full" />
              </ElFormItem>
              <ElFormItem label="Tiêu thụ nhiên liệu">
                <ElInput v-model="(formData as any).fuel_consumption" placeholder="L/100km..." />
              </ElFormItem>
            </div>
          </ElTabPane>

          <ElTabPane label="Công nghệ">
            <div class="py-2" v-loading="loadingTechs">
              <ElCheckboxGroup v-model="selectedTechIds" v-if="availableTechnologies.length > 0">
                <div class="grid grid-cols-2 gap-4">
                  <div
                    v-for="tech in availableTechnologies"
                    :key="tech.id"
                    class="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:border-primary/30 transition-colors cursor-pointer"
                    @click="toggleTech(tech.id)"
                  >
                    <ElCheckbox :label="tech.id" @click.stop>
                      <template #default>
                        <div class="flex items-center gap-3">
                          <div
                            class="w-10 h-10 bg-gray-50 rounded flex-c overflow-hidden border border-gray-50"
                          >
                            <ElImage
                              v-if="tech.defaultImageUrl"
                              :src="tech.defaultImageUrl"
                              fit="cover"
                              class="w-full h-full"
                            />
                            <ElIcon v-else class="text-gray-300"><Cpu /></ElIcon>
                          </div>
                          <div class="flex flex-col">
                            <span class="font-medium text-gray-700 text-sm">{{ tech.name }}</span>
                            <span class="text-[10px] text-gray-400 line-clamp-1">{{
                              tech.defaultTitle || 'Công nghệ hệ thống'
                            }}</span>
                          </div>
                        </div>
                      </template>
                    </ElCheckbox>
                  </div>
                </div>
              </ElCheckboxGroup>
              <ElEmpty
                v-else
                description="Không có công nghệ gợi ý cho danh mục/thương hiệu này"
                :image-size="60"
              />
            </div>
          </ElTabPane>
        </ElTabs>
      </ElForm>
      <template #footer>
        <div class="flex justify-end gap-3 mt-2">
          <ElButton @click="dialogVisible = false">Đóng</ElButton>
          <ElButton type="primary" :loading="submitting" @click="submitForm" class="px-8">
            Lưu sản phẩm
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { Plus, Picture, Download, Menu, CollectionTag, Cpu } from '@element-plus/icons-vue'
  import { useProductTable } from './hooks/useProductTable'
  import { FileApi } from '@/api/file.api'
  import { ElMessage } from 'element-plus'

  defineOptions({ name: 'ProductList' })

  const {
    activeCategory,
    categories,
    brands,
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
    availableTechnologies,
    selectedTechIds,
    loadingTechs,
    // CRUD
    dialogVisible,
    dialogTitle,
    formData,
    submitting,
    handleAdd,
    handleEdit,
    handleDelete,
    submitForm
  } = useProductTable()

  const toggleTech = (id: number) => {
    const index = selectedTechIds.value.indexOf(id)
    if (index > -1) {
      selectedTechIds.value.splice(index, 1)
    } else {
      selectedTechIds.value.push(id)
    }
  }

  // Image Upload Logic
  const handleUpload = async (options: any) => {
    try {
      const res = await FileApi.uploadProductImage(options.file)
      formData.value.cover_image_url = res.publicUrl
      ElMessage.success('Tải ảnh lên thành công')
    } catch (err: any) {
      ElMessage.error(err.message || 'Tải ảnh thất bại')
    }
  }

  const searchItems = [
    {
      key: 'name',
      label: 'Tên sản phẩm',
      type: 'input',
      props: { placeholder: 'Tìm kiếm tên...' }
    },
    {
      key: 'brand',
      label: 'Thương hiệu',
      type: 'input',
      props: { placeholder: 'Nhập tên hãng...' }
    }
  ]

  const getStatusType = (status: string) => {
    switch (status) {
      case 'InStock':
        return 'success'
      case 'LowStock':
        return 'warning'
      case 'OutOfStock':
        return 'danger'
      default:
        return 'info'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'InStock':
        return 'Còn hàng'
      case 'LowStock':
        return 'Sắp hết'
      case 'OutOfStock':
        return 'Hết hàng'
      default:
        return status
    }
  }
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

  :deep(.product-tabs .el-tabs__item.is-active) {
    font-weight: bold;
    color: #ff4d4f !important;
  }

  :deep(.product-tabs .el-tabs__active-bar) {
    background-color: #ff4d4f !important;
  }

  .form-tabs {
    overflow: hidden;
    border: 1px solid #f0f0f0 !important;
    border-radius: 8px;
    box-shadow: none !important;
  }

  .product-uploader :deep(.el-upload) {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    background-color: #f9fafb;
    border: 2px dashed #e5e7eb;
    border-radius: 16px;
    transition: all 0.3s ease;
  }

  .product-uploader :deep(.el-upload:hover) {
    background-color: #fff;
    border-color: #ff4d4f;
  }

  .product-uploader-trigger {
    width: 200px;
    height: 200px;
  }

  .product-preview {
    display: block;
    width: 200px;
    height: 200px;
    object-fit: cover;
    border-radius: 16px;
  }
</style>
