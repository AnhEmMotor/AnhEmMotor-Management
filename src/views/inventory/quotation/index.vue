<template>
  <div class="flex flex-col gap-4 pb-5">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ArtStatsCard
        title="Tổng số báo giá"
        :count="stats.totalQuotations"
        icon="ri:file-list-3-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        title="Đã duyệt / Hoàn thành"
        :count="stats.approvedQuotations"
        icon="ri:checkbox-circle-line"
        iconStyle="bg-success"
      />
    </div>

    <!-- Search Bar -->
    <ArtSearchBar
      v-model="searchForm"
      :items="searchItems"
      :label-width="140"
      :span="8"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- Main Quotation List Table Card -->
    <ElCard class="flex-1 p-4 art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElButton type="primary" v-ripple @click="handleAdd">
            <ElIcon class="mr-1"><Plus /></ElIcon> Tạo báo giá mới
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="filteredData"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #createdAt="{ row }">
          <span>{{ formatDateTime(row.createdAt) }}</span>
        </template>

        <template #supplierName="{ row }">
          <span class="font-medium text-gray-800">{{ row.supplierName }}</span>
        </template>

        <template #totalAmount="{ row }">
          <span class="font-semibold text-primary">{{ formatCurrency(row.totalAmount) }}</span>
        </template>

        <template #productCount="{ row }">
          <span>{{ row.products?.length || 0 }} sản phẩm</span>
        </template>

        <template #status="{ row }">
          <ElTag :type="getStatusTagType(row.status)" size="small">
            {{ getStatusLabel(row.status) }}
          </ElTag>
        </template>

        <template #operation="{ row }">
          <div class="flex gap-2 justify-center">
            <ElTooltip content="Xem chi tiết" placement="top">
              <ElButton circle size="small" type="info" @click="handleViewDetail(row)">
                <ElIcon><View /></ElIcon>
              </ElButton>
            </ElTooltip>
            <ElTooltip content="Chỉnh sửa" placement="top">
              <ElButton circle size="small" type="primary" @click="handleEdit(row)">
                <ElIcon><Edit /></ElIcon>
              </ElButton>
            </ElTooltip>
            <ElTooltip content="Xóa" placement="top">
              <ElButton circle size="small" type="danger" @click="handleDelete(row)">
                <ElIcon><Delete /></ElIcon>
              </ElButton>
            </ElTooltip>
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <!-- Create/Edit Dialog -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="900px"
      append-to-body
      destroy-on-close
      class="rounded-xl overflow-hidden"
    >
      <ElForm :model="formData" label-width="120px" class="mt-4" ref="formRef">
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="Nhà cung cấp" required class="col-span-2">
            <div
              class="w-full border border-gray-300 rounded-md px-3 py-2 bg-white flex items-center justify-between cursor-pointer hover:border-primary transition duration-200"
              @click="openSupplierSelector"
            >
              <span v-if="formData.supplierId" class="text-gray-800 font-medium">
                {{ formData.supplierName || 'Nhà cung cấp đã chọn' }}
              </span>
              <span v-else class="text-gray-400">Chọn nhà cung cấp...</span>
              <ElIcon class="text-gray-400"><ArrowDown /></ElIcon>
            </div>
          </ElFormItem>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="Trạng thái">
            <ElSelect v-model="formData.status" class="w-full">
              <ElOption label="Nháp" value="draft" />
              <ElOption label="Đã gửi" value="sent" />
              <ElOption label="Đã duyệt" value="approved" />
              <ElOption label="Đã từ chối" value="rejected" />
            </ElSelect>
          </ElFormItem>
        </div>

        <ElFormItem label="Ghi chú">
          <ElInput
            v-model="formData.notes"
            type="textarea"
            :rows="2"
            placeholder="Nhập ghi chú hoặc điều khoản báo giá..."
          />
        </ElFormItem>

        <div class="border-t border-gray-100 pt-4 mt-4">
          <div class="flex justify-between items-center mb-3">
            <span class="text-sm font-semibold text-gray-700">Chi tiết sản phẩm báo giá</span>
            <ElButton
              type="success"
              size="small"
              plain
              :disabled="!formData.supplierId"
              @click="handleAddProductRow"
            >
              <ElIcon class="mr-1"><Plus /></ElIcon> Thêm sản phẩm
            </ElButton>
          </div>

          <ElTable :data="formData.products" border size="small" class="w-full">
            <ElTableColumn label="Sản phẩm" required>
              <template #default="{ row, $index }">
                <div
                  class="w-full border border-gray-300 rounded px-2 py-1 bg-white flex items-center justify-between cursor-pointer hover:border-primary transition duration-200 min-h-[32px]"
                  @click="openProductSelector($index)"
                >
                  <span v-if="row.productVariantId" class="text-gray-800 text-xs font-medium">
                    {{ row.displayName }}
                  </span>
                  <span v-else class="text-gray-400 text-xs">Chọn sản phẩm...</span>
                  <ElIcon class="text-gray-400 text-xs"><ArrowDown /></ElIcon>
                </div>
                <div v-if="row.colorName" class="mt-1">
                  <ElTag size="small" type="info">Màu: {{ row.colorName }}</ElTag>
                </div>
              </template>
            </ElTableColumn>

            <ElTableColumn label="Giá báo giá (VND)" width="180" align="center">
              <template #default="{ row }">
                <ElInputNumber
                  v-model="row.quotePrice"
                  :min="0"
                  :step="100000"
                  class="w-full"
                  controls-position="right"
                />
              </template>
            </ElTableColumn>

            <ElTableColumn label="Thao tác" width="80" align="center">
              <template #default="{ $index }">
                <ElButton
                  circle
                  type="danger"
                  size="small"
                  plain
                  @click="handleRemoveProductRow($index)"
                >
                  <ElIcon><Delete /></ElIcon>
                </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>

          <div class="flex justify-end items-center mt-4 gap-2 text-right">
            <span class="text-gray-500 text-sm">Tổng cộng tiền hàng:</span>
            <span class="text-lg font-bold text-primary">{{
              formatCurrency(formTotalAmount)
            }}</span>
          </div>
        </div>
      </ElForm>

      <template #footer>
        <div class="flex justify-end gap-2 border-t border-gray-50 pt-3">
          <ElButton @click="dialogVisible = false">Hủy</ElButton>
          <ElButton type="primary" :loading="submitting" @click="submitForm">
            Lưu báo giá
          </ElButton>
        </div>
      </template>
    </ElDialog>

    <!-- Detail View Dialog -->
    <ElDialog
      v-model="detailDialogVisible"
      title="Chi tiết báo giá"
      width="800px"
      append-to-body
      destroy-on-close
      class="rounded-xl overflow-hidden"
    >
      <div v-if="detailData" class="flex flex-col gap-4">
        <div class="bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-y-3 text-sm">
          <div>
            <span class="text-gray-500">Trạng thái:</span>
            <span class="ml-2">
              <ElTag :type="getStatusTagType(detailData.status)" size="small">
                {{ getStatusLabel(detailData.status) }}
              </ElTag>
            </span>
          </div>
          <div>
            <span class="text-gray-500">Nhà cung cấp:</span>
            <span class="ml-2 font-medium text-gray-800">{{ detailData.supplierName }}</span>
          </div>
          <div>
            <span class="text-gray-500">Thời gian tạo:</span>
            <span class="ml-2 text-gray-700">{{ formatDateTime(detailData.createdAt) }}</span>
          </div>
          <div class="col-span-2 border-t border-gray-200 pt-2 mt-1">
            <span class="text-gray-500 font-medium">Ghi chú / Điều khoản:</span>
            <div class="mt-1 text-gray-700 whitespace-pre-line">{{
              detailData.notes || 'Không có ghi chú'
            }}</div>
          </div>
        </div>

        <div class="mt-2">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Danh sách sản phẩm báo giá</h4>
          <ElTable :data="detailData.products" border size="small" class="w-full">
            <ElTableColumn type="index" label="STT" width="55" align="center" />
            <ElTableColumn label="Tên sản phẩm" minWidth="220">
              <template #default="{ row }">
                <div class="flex flex-col gap-1">
                  <span class="font-medium text-gray-800">{{ row.displayName }}</span>
                  <ElTag v-if="row.colorName" size="small" type="info" class="w-fit">
                    Màu: {{ row.colorName }}
                  </ElTag>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Đơn giá báo" width="160" align="right">
              <template #default="{ row }">
                <span>{{ formatCurrency(row.quotePrice) }}</span>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2 border-t border-gray-50 pt-3">
          <ElButton @click="detailDialogVisible = false">Đóng</ElButton>
        </div>
      </template>
    </ElDialog>

    <!-- Supplier Selector Dialog -->
    <ElDialog
      v-model="supplierSelectorVisible"
      title="Chọn nhà cung cấp"
      width="750px"
      append-to-body
      destroy-on-close
      class="rounded-xl overflow-hidden"
    >
      <div class="space-y-4">
        <ElInput
          v-model="supplierSearchQuery"
          placeholder="Tìm theo tên nhà cung cấp hoặc số điện thoại..."
          clearable
          prefix-icon="Search"
          @input="handleSupplierSelectorSearch"
        />

        <div
          v-loading="supplierSelectorLoading"
          class="grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[300px] max-h-[450px] overflow-y-auto pr-1"
        >
          <div
            v-for="sup in supplierSelectorItems"
            :key="sup.id"
            class="p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition duration-200 cursor-pointer flex flex-col justify-between"
            @click="selectSupplier(sup)"
          >
            <div class="font-semibold text-gray-800 text-sm mb-1">{{ sup.name }}</div>
            <div class="text-xs text-gray-500 space-y-0.5">
              <div v-if="sup.phone" class="flex items-center gap-1">
                <span class="font-medium text-gray-400">SĐT:</span> {{ sup.phone }}
              </div>
              <div v-if="sup.email" class="flex items-center gap-1">
                <span class="font-medium text-gray-400">Email:</span> {{ sup.email }}
              </div>
              <div v-if="sup.address" class="flex items-center gap-1 line-clamp-1">
                <span class="font-medium text-gray-400">Địa chỉ:</span> {{ sup.address }}
              </div>
            </div>
          </div>
          <div
            v-if="!supplierSelectorLoading && supplierSelectorItems.length === 0"
            class="col-span-full flex flex-col items-center justify-center py-10 text-gray-400"
          >
            <ElIcon size="32"><InfoFilled /></ElIcon>
            <span class="mt-2 text-sm">Không tìm thấy nhà cung cấp nào</span>
          </div>
        </div>

        <div class="flex justify-end pt-2 border-t">
          <ElPagination
            v-model:current-page="supplierSelectorPage"
            v-model:page-size="supplierSelectorPageSize"
            :total="supplierSelectorTotal"
            layout="prev, pager, next, total"
            background
            size="small"
            @current-change="fetchSelectorSuppliers"
          />
        </div>
      </div>
    </ElDialog>

    <!-- Product Selector Dialog -->
    <ElDialog
      v-model="productSelectorVisible"
      title="Chọn sản phẩm & biến thể"
      width="900px"
      append-to-body
      destroy-on-close
      class="rounded-xl overflow-hidden"
    >
      <div class="space-y-4">
        <ElInput
          v-model="productSearchQuery"
          placeholder="Tìm sản phẩm theo tên..."
          clearable
          prefix-icon="Search"
          @input="handleProductSelectorSearch"
        />

        <div
          v-loading="productSelectorLoading"
          class="space-y-3 min-h-[350px] max-h-[500px] overflow-y-auto pr-1"
        >
          <div
            v-for="variant in productSelectorItems"
            :key="variant.id"
            class="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-all duration-200"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <ElImage
                  :src="variant.coverImageUrl || ''"
                  class="w-12 h-12 rounded object-cover border border-gray-100 flex-shrink-0"
                  fit="cover"
                >
                  <template #error>
                    <div
                      class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400"
                    >
                      <ElIcon><InfoFilled /></ElIcon>
                    </div>
                  </template>
                </ElImage>

                <div class="flex flex-col min-w-0">
                  <span class="text-sm font-semibold text-gray-800 truncate">
                    {{ variant.displayName }}
                  </span>
                  <span class="text-[11px] text-gray-400 mt-0.5 font-mono">
                    Variant ID: #{{ variant.id }}
                  </span>
                  <span class="text-xs text-primary font-bold mt-0.5">
                    {{ formatCurrency(variant.price ?? undefined) }}
                  </span>
                </div>
              </div>

              <div class="flex flex-col gap-2 items-end">
                <!-- Color Selector inside Product Card -->
                <ElSelect
                  v-if="variant.colors?.length"
                  v-model="selectedVariantColors[variant.id]"
                  placeholder="Chọn màu"
                  size="small"
                  style="width: 150px"
                  @click.stop
                >
                  <template #prefix>
                    <span
                      v-if="getSelectedColorObj(variant)"
                      class="inline-block w-4 h-4 rounded border border-gray-200 flex-shrink-0"
                      :style="{
                        backgroundColor: getSelectedColorObj(variant)?.colorCode || '#ffffff'
                      }"
                    ></span>
                  </template>
                  <ElOption
                    v-for="color in variant.colors"
                    :key="color.id"
                    :label="color.colorName || `Màu #${color.id}`"
                    :value="color.id"
                  >
                    <div class="flex items-center gap-2">
                      <span
                        class="inline-block w-4 h-4 rounded border border-gray-200 flex-shrink-0"
                        :style="{ backgroundColor: color.colorCode || '#ffffff' }"
                      ></span>
                      <span>{{ color.colorName || `Màu #${color.id}` }}</span>
                    </div>
                  </ElOption>
                </ElSelect>

                <ElButton type="primary" size="small" plain @click="selectProductVariant(variant)">
                  Chọn
                </ElButton>
              </div>
            </div>
          </div>

          <div
            v-if="!productSelectorLoading && productSelectorItems.length === 0"
            class="flex flex-col items-center justify-center py-10 text-gray-400"
          >
            <ElIcon size="32"><InfoFilled /></ElIcon>
            <span class="mt-2 text-sm">Không tìm thấy sản phẩm nào</span>
          </div>
        </div>

        <div class="flex justify-end pt-2 border-t">
          <ElPagination
            v-model:current-page="productSelectorPage"
            v-model:page-size="productSelectorPageSize"
            :total="productSelectorTotal"
            layout="prev, pager, next, total"
            background
            size="small"
            @current-change="fetchSelectorProducts"
          />
        </div>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue'
  import { Plus, Edit, Delete, View, ArrowDown, InfoFilled } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useDebounceFn } from '@vueuse/core'
  import { SupplierApi } from '@/api/supplier.api'
  import { ProductApi } from '@/api/product/product.api'
  import type { Supplier } from '@/domain/supplier/supplier.types'
  import type { ProductVariantLiteForInput } from '@/domain/product/product.types'

  defineOptions({ name: 'InventoryQuotation' })

  interface QuotationProductRow {
    productVariantId: number
    displayName: string
    colorId?: number
    colorName?: string
    quotePrice: number
  }

  interface Quotation {
    id: string
    code: string
    supplierId: number
    supplierName: string
    status: 'draft' | 'sent' | 'approved' | 'rejected'
    notes?: string
    products: QuotationProductRow[]
    createdAt: string
  }

  const loading = ref(false)
  const dialogVisible = ref(false)
  const dialogTitle = ref('Tạo báo giá mới')
  const submitting = ref(false)
  const isEdit = ref(false)

  const detailDialogVisible = ref(false)
  const detailData = ref<Quotation | null>(null)

  // Local Storage Data State
  const data = ref<Quotation[]>([])

  const searchForm = ref({
    supplierName: '',
    status: [] as string[]
  })

  const searchItems = ref([
    { key: 'supplierName', label: 'Tên nhà cung cấp', type: 'input' },
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'select',
      props: {
        options: [
          { label: 'Nháp', value: 'draft' },
          { label: 'Đã gửi', value: 'sent' },
          { label: 'Đã duyệt', value: 'approved' },
          { label: 'Đã từ chối', value: 'rejected' }
        ],
        multiple: true,
        collapseTags: true,
        placeholder: 'Chọn trạng thái...'
      }
    }
  ])

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const columns = ref([
    { label: 'Nhà cung cấp', prop: 'supplierName', useSlot: true, minWidth: 200 },
    {
      label: 'Số lượng sản phẩm',
      prop: 'productCount',
      useSlot: true,
      width: 160,
      align: 'center'
    },
    { label: 'Ngày tạo', prop: 'createdAt', useSlot: true, width: 160, align: 'center' },
    { label: 'Trạng thái', prop: 'status', useSlot: true, width: 120, align: 'center' },
    {
      label: 'Thao tác',
      prop: 'operation',
      useSlot: true,
      width: 140,
      fixed: 'right' as const,
      align: 'center'
    }
  ])

  const columnChecks = columns

  // Form State
  const formData = ref<Partial<Quotation>>({
    supplierId: undefined,
    supplierName: '',
    status: 'draft',
    notes: '',
    products: []
  })

  const formTotalAmount = computed(() => {
    return (formData.value.products || []).reduce((sum, item) => {
      return sum + (item.quotePrice || 0)
    }, 0)
  })

  // Statistics
  const stats = computed(() => {
    const total = data.value.length
    const approved = data.value.filter((q) => q.status === 'approved').length
    return {
      totalQuotations: total,
      approvedQuotations: approved
    }
  })

  // Filtering Logic
  const filteredData = computed(() => {
    let result = [...data.value]
    if (searchForm.value.supplierName) {
      const query = searchForm.value.supplierName.toLowerCase()
      result = result.filter((item) => item.supplierName.toLowerCase().includes(query))
    }
    if (searchForm.value.status && searchForm.value.status.length > 0) {
      result = result.filter((item) => searchForm.value.status.includes(item.status))
    }
    return result
  })

  watch(
    () => filteredData.value.length,
    (newTotal) => {
      pagination.total = newTotal
    },
    { immediate: true }
  )

  // Supplier Selector State
  const supplierSelectorVisible = ref(false)
  const supplierSearchQuery = ref('')
  const supplierSelectorItems = ref<Supplier[]>([])
  const supplierSelectorLoading = ref(false)
  const supplierSelectorPage = ref(1)
  const supplierSelectorPageSize = ref(10)
  const supplierSelectorTotal = ref(0)

  // Product Selector State
  const productSelectorVisible = ref(false)
  const productSearchQuery = ref('')
  const productSelectorItems = ref<ProductVariantLiteForInput[]>([])
  const productSelectorLoading = ref(false)
  const productSelectorPage = ref(1)
  const productSelectorPageSize = ref(10)
  const productSelectorTotal = ref(0)
  const activeProductRowIndex = ref<number | null>(null)

  // Track selected color variant IDs by variant ID key
  const selectedVariantColors = reactive<Record<number, number>>({})

  // Format Helper functions
  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '0 đ'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
  }

  const formatDateTime = (val?: string) => {
    if (!val) return ''
    return new Date(val).toLocaleString('vi-VN')
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Nháp'
      case 'sent':
        return 'Đã gửi'
      case 'approved':
        return 'Đã duyệt'
      case 'rejected':
        return 'Từ chối'
      default:
        return status
    }
  }

  const getStatusTagType = (status: string) => {
    switch (status) {
      case 'draft':
        return 'info'
      case 'sent':
        return 'primary'
      case 'approved':
        return 'success'
      case 'rejected':
        return 'danger'
      default:
        return 'info'
    }
  }

  const getSelectedColorObj = (variant: ProductVariantLiteForInput) => {
    const colorId = selectedVariantColors[variant.id]
    return variant.colors?.find((c) => c.id === colorId) || null
  }

  // Lifecycle & Storage
  onMounted(() => {
    loadQuotations()
  })

  const loadQuotations = () => {
    const raw = localStorage.getItem('inventory_quotations')
    if (raw) {
      try {
        data.value = JSON.parse(raw)
      } catch (err) {
        console.error('Failed to parse quotations from localStorage', err)
        data.value = []
      }
    } else {
      // Mock data for beautiful UI look initially
      data.value = [
        {
          id: '1',
          code: 'BG-2026052601',
          supplierId: 1,
          supplierName: 'Honda Việt Nam',
          status: 'approved',
          notes: 'Đơn giá đã chiết khấu 2% cho đại lý cấp 1.',
          createdAt: new Date().toISOString(),
          products: [
            {
              productVariantId: 101,
              displayName: 'Honda SH 150i ABS 2026',
              colorId: 1,
              colorName: 'Đỏ Đen',
              quotePrice: 92250000
            }
          ]
        },
        {
          id: '2',
          code: 'BG-2026052602',
          supplierId: 2,
          supplierName: 'Yamaha Motor Vietnam',
          status: 'draft',
          notes: 'Đơn giá đề xuất tháng 5.',
          createdAt: new Date().toISOString(),
          products: [
            {
              productVariantId: 102,
              displayName: 'Yamaha Exciter 155 VVA',
              colorId: 2,
              colorName: 'Xanh GP',
              quotePrice: 48500000
            }
          ]
        }
      ]
      saveQuotations()
    }
  }

  const saveQuotations = () => {
    localStorage.setItem('inventory_quotations', JSON.stringify(data.value))
  }

  // Data Loading handlers
  const handleSearch = () => {
    pagination.current = 1
  }

  const handleReset = () => {
    searchForm.value = {
      supplierName: '',
      status: []
    }
    pagination.current = 1
  }

  const refreshData = () => {
    loading.value = true
    setTimeout(() => {
      loadQuotations()
      loading.value = false
    }, 300)
  }

  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
  }

  const handleCurrentChange = (page: number) => {
    pagination.current = page
  }

  // Add / Edit / Delete handlers
  const handleAdd = () => {
    isEdit.value = false
    dialogTitle.value = 'Tạo báo giá mới'
    formData.value = {
      supplierId: undefined,
      supplierName: '',
      status: 'draft',
      notes: '',
      products: []
    }
    dialogVisible.value = true
  }

  const handleEdit = (row: Quotation) => {
    isEdit.value = true
    dialogTitle.value = 'Chỉnh sửa báo giá'
    // Deep clone row data
    formData.value = JSON.parse(JSON.stringify(row))
    dialogVisible.value = true
  }

  const handleDelete = (row: Quotation) => {
    ElMessageBox.confirm(`Bạn có chắc chắn muốn xóa báo giá ${row.code}?`, 'Xác nhận xóa', {
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      type: 'warning'
    })
      .then(() => {
        data.value = data.value.filter((q) => q.id !== row.id)
        saveQuotations()
        ElMessage.success('Xóa báo giá thành công')
      })
      .catch(() => {})
  }

  const handleViewDetail = (row: Quotation) => {
    detailData.value = row
    detailDialogVisible.value = true
  }

  const submitForm = () => {
    if (!formData.value.supplierId) {
      ElMessage.warning('Vui lòng chọn nhà cung cấp')
      return
    }
    if (!formData.value.products || formData.value.products.length === 0) {
      ElMessage.warning('Vui lòng thêm ít nhất một sản phẩm')
      return
    }

    submitting.value = true

    setTimeout(() => {
      if (isEdit.value && formData.value.id) {
        const idx = data.value.findIndex((q) => q.id === formData.value.id)
        if (idx !== -1) {
          data.value[idx] = {
            ...data.value[idx],
            supplierId: formData.value.supplierId!,
            supplierName: formData.value.supplierName!,
            status: formData.value.status || 'draft',
            notes: formData.value.notes,
            products: formData.value.products || []
          }
        }
        ElMessage.success('Cập nhật báo giá thành công')
      } else {
        const codeNum = Date.now().toString().slice(-8)
        const newQuote: Quotation = {
          id: Date.now().toString(),
          code: `BG-${codeNum}`,
          supplierId: formData.value.supplierId!,
          supplierName: formData.value.supplierName!,
          status: formData.value.status || 'draft',
          notes: formData.value.notes,
          products: (formData.value.products || []) as QuotationProductRow[],
          createdAt: new Date().toISOString()
        }
        data.value.unshift(newQuote)
        ElMessage.success('Tạo báo giá thành công')
      }

      saveQuotations()
      dialogVisible.value = false
      submitting.value = false
    }, 500)
  }

  // Products List Manipulation inside Form
  const handleAddProductRow = () => {
    formData.value.products?.push({
      productVariantId: 0,
      displayName: '',
      quotePrice: 0
    })
  }

  const handleRemoveProductRow = (index: number) => {
    formData.value.products?.splice(index, 1)
  }

  // --- Supplier Selector Logic ---
  const openSupplierSelector = () => {
    supplierSearchQuery.value = ''
    supplierSelectorPage.value = 1
    supplierSelectorVisible.value = true
    fetchSelectorSuppliers()
  }

  const fetchSelectorSuppliers = async () => {
    supplierSelectorLoading.value = true
    try {
      const sieveFilters = []
      if (supplierSearchQuery.value) {
        sieveFilters.push(`Name@=${supplierSearchQuery.value}`)
      }
      const params = {
        current: supplierSelectorPage.value,
        size: supplierSelectorPageSize.value,
        Filters: sieveFilters.join(',') || undefined
      }
      const res = await SupplierApi.getList(params)
      supplierSelectorItems.value = res.items || []
      supplierSelectorTotal.value = res.totalCount || 0
    } catch (err) {
      console.error('Failed to load suppliers for selector', err)
      ElMessage.error('Không thể tải danh sách nhà cung cấp')
    } finally {
      supplierSelectorLoading.value = false
    }
  }

  const handleSupplierSelectorSearch = useDebounceFn(() => {
    supplierSelectorPage.value = 1
    fetchSelectorSuppliers()
  }, 300)

  const selectSupplier = (sup: Supplier) => {
    formData.value.supplierId = sup.id
    formData.value.supplierName = sup.name
    // Clear products list if supplier changes to avoid mixed quote items
    formData.value.products = []
    supplierSelectorVisible.value = false
  }

  // --- Product Selector Logic ---
  const openProductSelector = (index: number) => {
    activeProductRowIndex.value = index
    productSearchQuery.value = ''
    productSelectorPage.value = 1
    productSelectorVisible.value = true
    fetchSelectorProducts()
  }

  const fetchSelectorProducts = async () => {
    productSelectorLoading.value = true
    try {
      const sieveFilters = []
      if (productSearchQuery.value) {
        sieveFilters.push(`DisplayName@=${productSearchQuery.value}`)
      }
      const params = {
        current: productSelectorPage.value,
        size: productSelectorPageSize.value,
        Filters: sieveFilters.join(',') || undefined
      }
      const res = await ProductApi.getVariantsForInput(params)
      productSelectorItems.value = res.items || []
      productSelectorTotal.value = res.totalCount || 0

      // Auto pre-populate default colors in selector state
      res.items?.forEach((variant) => {
        if (variant.colors?.length && !selectedVariantColors[variant.id]) {
          selectedVariantColors[variant.id] = variant.colors[0].id
        }
      })
    } catch (err) {
      console.error('Failed to load products for selector', err)
      ElMessage.error('Không thể tải danh sách sản phẩm')
    } finally {
      productSelectorLoading.value = false
    }
  }

  const handleProductSelectorSearch = useDebounceFn(() => {
    productSelectorPage.value = 1
    fetchSelectorProducts()
  }, 300)

  const selectProductVariant = (variant: ProductVariantLiteForInput) => {
    if (activeProductRowIndex.value === null || !formData.value.products) return

    const targetRow = formData.value.products[activeProductRowIndex.value]
    if (targetRow) {
      const selectedColorId = selectedVariantColors[variant.id]
      const selectedColor = variant.colors?.find((c) => c.id === selectedColorId)

      targetRow.productVariantId = variant.id
      targetRow.displayName = variant.displayName || `Sản phẩm #${variant.id}`
      targetRow.quotePrice = variant.price || 0

      if (selectedColor) {
        targetRow.colorId = selectedColor.id
        targetRow.colorName = selectedColor.colorName || `Màu #${selectedColor.id}`
        targetRow.displayName += ` (${targetRow.colorName})`
      } else {
        targetRow.colorId = undefined
        targetRow.colorName = undefined
      }
    }

    productSelectorVisible.value = false
  }
</script>

<style scoped>
  .art-table-card :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0;
  }

  .variant-color-select :deep(.el-input__wrapper) {
    padding-left: 8px;
  }
</style>
