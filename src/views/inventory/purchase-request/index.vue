<template>
  <div class="flex flex-col gap-4 pb-5">
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
          <ElButton type="primary" v-ripple @click="handleAdd">
            <ElIcon class="mr-1"><Plus /></ElIcon> Tạo yêu cầu mua hàng
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #createdAt="{ row }">
          <span>{{ formatDateTime(row.createdAt) }}</span>
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
            <ElTooltip
              v-if="row.status?.toLowerCase() === 'draft'"
              content="Chỉnh sửa"
              placement="top"
            >
              <ElButton circle size="small" type="primary" @click="handleEdit(row)">
                <ElIcon><Edit /></ElIcon>
              </ElButton>
            </ElTooltip>
            <ElTooltip v-if="row.status?.toLowerCase() === 'draft'" content="Xóa" placement="top">
              <ElButton circle size="small" type="danger" @click="handleDelete(row)">
                <ElIcon><Delete /></ElIcon>
              </ElButton>
            </ElTooltip>
            <ElTooltip
              v-if="row.status?.toLowerCase() === 'draft'"
              content="Gửi phê duyệt"
              placement="top"
            >
              <ElButton circle size="small" type="success" @click="handleSendRequest(row)">
                <ElIcon><Promotion /></ElIcon>
              </ElButton>
            </ElTooltip>
            <ElTooltip
              v-if="row.status?.toLowerCase() === 'sent'"
              content="Duyệt yêu cầu"
              placement="top"
            >
              <ElButton
                circle
                size="small"
                type="success"
                @click="handleApproveRejectStatus(row.id, 'approve')"
              >
                <ElIcon><Check /></ElIcon>
              </ElButton>
            </ElTooltip>
            <ElTooltip
              v-if="row.status?.toLowerCase() === 'sent'"
              content="Từ chối duyệt"
              placement="top"
            >
              <ElButton
                circle
                size="small"
                type="danger"
                @click="handleApproveRejectStatus(row.id, 'reject')"
              >
                <ElIcon><Close /></ElIcon>
              </ElButton>
            </ElTooltip>
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="900px"
      append-to-body
      destroy-on-close
      class="rounded-xl overflow-hidden"
    >
      <ElForm :model="formData" label-width="120px" class="mt-4" ref="formRef">
        <ElFormItem label="Ghi chú">
          <ElInput
            v-model="formData.note"
            type="textarea"
            :rows="2"
            placeholder="Nhập lý do mua hàng, mục đích sử dụng..."
          />
        </ElFormItem>

        <div class="border-t border-gray-100 pt-4 mt-4">
          <div class="flex justify-between items-center mb-3">
            <span class="text-sm font-semibold text-gray-700">Danh sách biến thể yêu cầu</span>
            <ElButton type="success" size="small" plain @click="handleAddProductRow">
              <ElIcon class="mr-1"><Plus /></ElIcon> Thêm sản phẩm
            </ElButton>
          </div>

          <ElTable :data="formData.items" border size="small" class="w-full">
            <ElTableColumn label="Sản phẩm" required>
              <template #default="{ row, $index }">
                <div
                  class="w-full border border-gray-300 rounded px-2 py-1 bg-white flex items-center justify-between cursor-pointer hover:border-primary transition duration-200 min-h-[32px]"
                  @click="openProductSelector($index)"
                >
                  <span v-if="row.productVariantId" class="text-gray-800 text-xs font-medium">
                    {{ getProductNameById(row.productVariantId) }}
                  </span>
                  <span v-else class="text-gray-400 text-xs">Chọn biến thể sản phẩm...</span>
                  <ElIcon class="text-gray-400 text-xs"><ArrowDown /></ElIcon>
                </div>
                <ElTag v-if="getProductColorName(row)" size="small" type="info" class="mt-1 w-fit">
                  Màu: {{ getProductColorName(row) }}
                </ElTag>
              </template>
            </ElTableColumn>

            <ElTableColumn label="Số lượng yêu cầu" width="180" align="center">
              <template #default="{ row }">
                <ElInputNumber
                  v-model="row.quantity"
                  :min="1"
                  :precision="0"
                  class="w-full"
                  controls-position="right"
                />
              </template>
            </ElTableColumn>

            <ElTableColumn label="Nhà cung cấp" width="200" align="center">
              <template #default="{ row }">
                <ElSelect
                  v-model="row.supplierId"
                  placeholder="Chọn nhà cung cấp"
                  clearable
                  filterable
                  class="w-full"
                >
                  <ElOption
                    v-for="sup in suppliers"
                    :key="sup.id"
                    :label="sup.name"
                    :value="sup.id"
                  />
                </ElSelect>
              </template>
            </ElTableColumn>

            <ElTableColumn label="Thao tác" width="120" align="center">
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
        </div>
      </ElForm>

      <template #footer>
        <div class="flex justify-end gap-2 border-t border-gray-50 pt-3">
          <ElButton @click="dialogVisible = false">Hủy</ElButton>
          <ElButton type="primary" :loading="submitting" @click="submitForm">
            Lưu yêu cầu
          </ElButton>
        </div>
      </template>
    </ElDialog>

    <ElDialog
      v-model="detailDialogVisible"
      title="Chi tiết Yêu cầu mua hàng"
      width="850px"
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
            <span class="text-gray-500">Thời gian tạo:</span>
            <span class="ml-2 text-gray-700">{{ formatDateTime(detailData.createdAt) }}</span>
          </div>
          <div>
            <span class="text-gray-500">Người tạo:</span>
            <span class="ml-2 text-gray-800 font-medium">{{
              detailData.createdByName || 'N/A'
            }}</span>
          </div>
          <div v-if="detailData.sentByName">
            <span class="text-gray-500">Người gửi:</span>
            <span class="ml-2 text-gray-800 font-medium">{{ detailData.sentByName }}</span>
          </div>
          <div
            v-if="
              (detailData.status?.toLowerCase() === 'approve' ||
                detailData.status?.toLowerCase() === 'approved') &&
              detailData.approvedByName
            "
          >
            <span class="text-gray-500">Người duyệt:</span>
            <span class="ml-2 text-gray-800 font-medium">{{ detailData.approvedByName }}</span>
          </div>
          <div
            v-if="
              (detailData.status?.toLowerCase() === 'reject' ||
                detailData.status?.toLowerCase() === 'rejected') &&
              detailData.rejectedByName
            "
          >
            <span class="text-gray-500">Người từ chối:</span>
            <span class="ml-2 text-gray-800 font-medium">{{ detailData.rejectedByName }}</span>
          </div>
          <div class="col-span-2 border-t border-gray-200 pt-2 mt-1">
            <span class="text-gray-500 font-medium">Ghi chú:</span>
            <div class="mt-1 bg-white p-2.5 rounded border border-gray-100 text-gray-700">
              {{ detailData.note || 'Không có ghi chú' }}
            </div>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Danh sách mặt hàng</h4>
          <ElTable :data="detailData.items" border size="small" class="w-full">
            <ElTableColumn type="index" label="STT" width="55" align="center" />
            <ElTableColumn label="Tên sản phẩm" minWidth="200">
              <template #default="{ row }">
                <span class="font-medium text-gray-800">{{ row.productName }}</span>
                <div v-if="row.productVariantColorName" class="mt-1">
                  <ElTag size="small" type="info">Màu: {{ row.productVariantColorName }}</ElTag>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="quantity" label="S/L yêu cầu" width="95" align="center" />
            <ElTableColumn label="Nhà cung cấp" minWidth="150">
              <template #default="{ row }">
                <span v-if="row.supplierName" class="text-gray-800 font-medium">{{
                  row.supplierName
                }}</span>
                <span v-else class="text-gray-400 italic">Chưa chọn</span>
              </template>
            </ElTableColumn>

            <ElTableColumn
              v-if="
                detailData?.status?.toLowerCase() === 'approve' ||
                detailData?.status?.toLowerCase() === 'approved'
              "
              prop="importedQuantity"
              label="Đã nhập kho"
              width="105"
              align="center"
            >
              <template #default="{ row }">
                <span
                  :class="row.importedQuantity > 0 ? 'text-success font-bold' : 'text-gray-400'"
                >
                  {{ row.importedQuantity }}
                </span>
              </template>
            </ElTableColumn>
            <ElTableColumn
              v-if="
                detailData?.status?.toLowerCase() === 'approve' ||
                detailData?.status?.toLowerCase() === 'approved'
              "
              prop="pendingQuantity"
              label="Đang chờ"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <span class="text-warning font-medium">{{ row.pendingQuantity }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn
              v-if="
                detailData?.status?.toLowerCase() === 'approve' ||
                detailData?.status?.toLowerCase() === 'approved'
              "
              prop="unimportedQuantity"
              label="Còn lại chưa nhập"
              width="135"
              align="center"
            >
              <template #default="{ row }">
                <span class="text-danger font-medium">{{ row.unimportedQuantity }}</span>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between items-center border-t border-gray-50 pt-3">
          <div>
            <ElButton v-if="detailData?.id" type="primary" plain @click="auditTrailVisible = true">
              <ElIcon class="mr-1"><Clock /></ElIcon> Lịch sử chỉnh sửa
            </ElButton>
          </div>
          <div class="flex gap-2">
            <ElButton @click="detailDialogVisible = false">Đóng</ElButton>

            <template v-if="detailData">
              <template v-if="detailData.status?.toLowerCase() === 'sent'">
                <ElButton type="danger" @click="handleApproveRejectStatus(detailData.id, 'reject')">
                  Từ chối duyệt
                </ElButton>
                <ElButton
                  type="success"
                  @click="handleApproveRejectStatus(detailData.id, 'approve')"
                >
                  Duyệt yêu cầu
                </ElButton>
              </template>

              <template v-if="detailData.status?.toLowerCase() === 'draft'">
                <ElButton type="success" @click="handleSendRequest(detailData)">
                  Gửi phê duyệt
                </ElButton>
              </template>
            </template>
          </div>
        </div>
      </template>
    </ElDialog>

    <AuditTrailModal
      v-model:visible="auditTrailVisible"
      :record-id="detailData?.id"
      type="purchase-request"
    />

    <ElDialog
      v-model="productSelectorVisible"
      title="Chọn sản phẩm & màu sắc"
      width="900px"
      append-to-body
      destroy-on-close
      class="rounded-xl overflow-hidden"
    >
      <div class="space-y-4">
        <ElInput
          v-model="productSelectorQuery"
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
                </div>
              </div>

              <div class="flex flex-col gap-2 items-end">
                <ElSelect
                  v-if="variant.colors?.length"
                  v-model="selectedVariantColors[String(variant.id)]"
                  placeholder="Chọn màu"
                  size="small"
                  style="width: 150px"
                  @click.stop
                >
                  <template #prefix>
                    <span
                      v-if="getSelectedVariantColor(variant)"
                      class="inline-block w-4 h-4 rounded border border-gray-200 flex-shrink-0"
                      :style="{
                        backgroundColor: getSelectedVariantColor(variant)?.colorCode || '#ffffff'
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
  import {
    Plus,
    Edit,
    Delete,
    View,
    ArrowDown,
    InfoFilled,
    Promotion,
    Check,
    Close,
    Clock
  } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useDebounceFn } from '@vueuse/core'
  import { PurchaseRequestApi } from '@/api/purchase-request.api'
  import { ProductApi } from '@/api/product.api'
  import { SupplierApi } from '@/api/supplier.api'
  import type { Supplier } from '@/domain/supplier/supplier.types'
  import type {
    PurchaseRequestListResponse,
    PurchaseRequestDetailResponse
  } from '@/domain/purchase-request/request.types'
  import type { ProductVariantLiteForInput } from '@/domain/product/product.types'
  import AuditTrailModal from '@/components/business/audit-trail-modal/index.vue'

  defineOptions({ name: 'PurchaseRequest' })

  const auditTrailVisible = ref(false)

  const loading = ref(false)
  const dialogVisible = ref(false)
  const dialogTitle = ref('Tạo yêu cầu mua hàng mới')
  const submitting = ref(false)
  const isEdit = ref(false)

  const detailDialogVisible = ref(false)
  const detailData = ref<PurchaseRequestDetailResponse | null>(null)

  const productCache = reactive(new Map<number, { displayName: string; colorName?: string }>())

  const getProductNameById = (id?: number) => {
    if (!id) return ''
    return productCache.get(Number(id))?.displayName || `Sản phẩm #${id}`
  }

  const getProductColorName = (row: any) => {
    return (
      row.productVariantColorName || productCache.get(Number(row.productVariantId))?.colorName || ''
    )
  }

  const getVariantColorKey = (variant: ProductVariantLiteForInput) => String(variant.id)

  const getSelectedVariantColor = (variant: ProductVariantLiteForInput) => {
    const selectedColorId = selectedVariantColors[getVariantColorKey(variant)]
    return variant.colors?.find((color) => color.id === selectedColorId)
  }

  const getVariantColorLabel = (
    color: NonNullable<ProductVariantLiteForInput['colors']>[number]
  ) => {
    return color.colorName || `Màu #${color.id}`
  }

  const getVariantDisplayNameWithColor = (variant: ProductVariantLiteForInput) => {
    const displayName = variant.displayName || `Sản phẩm #${variant.id}`
    const selectedColor = getSelectedVariantColor(variant)
    if (!selectedColor) return displayName
    return `${displayName} - ${getVariantColorLabel(selectedColor)}`
  }

  const productSelectorVisible = ref(false)
  const productSelectorLoading = ref(false)
  const productSelectorQuery = ref('')
  const productSelectorPage = ref(1)
  const productSelectorPageSize = ref(10)
  const productSelectorTotal = ref(0)
  const productSelectorItems = ref<ProductVariantLiteForInput[]>([])
  const selectedVariantColors = reactive<Record<string, number | undefined>>({})
  const productSelectorActiveRowIndex = ref<number | null>(null)

  const initializeVariantColorSelection = (variants: ProductVariantLiteForInput[]) => {
    variants.forEach((variant) => {
      const key = getVariantColorKey(variant)
      if (selectedVariantColors[key] || !variant.colors?.length) return
      selectedVariantColors[key] = variant.colors[0].id
    })
  }

  const fetchSelectorProducts = async () => {
    productSelectorLoading.value = true
    try {
      const filters = []
      if (productSelectorQuery.value.trim()) {
        filters.push(`search@=${productSelectorQuery.value.trim()}`)
      }
      const res = await ProductApi.getVariantsForInput({
        current: productSelectorPage.value,
        size: productSelectorPageSize.value,
        Filters: filters.join(',')
      })
      productSelectorItems.value = res.items || []
      initializeVariantColorSelection(productSelectorItems.value)
      productSelectorTotal.value = res.totalCount || 0
    } catch (err) {
      console.error('Failed to fetch selector products:', err)
    } finally {
      productSelectorLoading.value = false
    }
  }

  const openProductSelector = (rowIndex?: number) => {
    productSelectorActiveRowIndex.value = rowIndex !== undefined ? rowIndex : null
    productSelectorQuery.value = ''
    productSelectorPage.value = 1
    productSelectorVisible.value = true
    fetchSelectorProducts()
  }

  const selectProductVariant = (variant: ProductVariantLiteForInput) => {
    if (!variant.id) return
    const productVariantColorId = selectedVariantColors[getVariantColorKey(variant)]
    if (variant.colors?.length && !productVariantColorId) {
      ElMessage.warning('Vui lòng chọn màu cho biến thể sản phẩm này')
      return
    }

    const displayName = getVariantDisplayNameWithColor(variant)
    const selectedColor = getSelectedVariantColor(variant)
    productCache.set(variant.id, {
      displayName,
      colorName: selectedColor?.colorName
    })

    if (productSelectorActiveRowIndex.value !== null) {
      const idx = productSelectorActiveRowIndex.value
      if (formData.value.items[idx]) {
        const row = formData.value.items[idx]

        const existsIdx = formData.value.items.findIndex(
          (item, i) =>
            i !== idx &&
            item.productVariantId === variant.id &&
            item.productVariantColorId === productVariantColorId
        )

        if (existsIdx > -1) {
          formData.value.items[existsIdx].quantity =
            (formData.value.items[existsIdx].quantity || 0) + (row.quantity || 1)
          formData.value.items.splice(idx, 1)
          ElMessage.success('Sản phẩm đã tồn tại trong yêu cầu. Đã gộp và cộng dồn số lượng.')
        } else {
          row.productVariantId = variant.id
          row.productVariantColorId = productVariantColorId
          row.productVariantColorName = selectedColor?.colorName
        }
      }
    } else {
      const items = formData.value.items
      const lastRow = items[items.length - 1]

      const existsIdx = items.findIndex(
        (item) =>
          item.productVariantId === variant.id &&
          item.productVariantColorId === productVariantColorId
      )

      if (existsIdx > -1) {
        items[existsIdx].quantity = (items[existsIdx].quantity || 0) + 1
        if (lastRow && lastRow.productVariantId === undefined) {
          items.splice(items.length - 1, 1)
        }
      } else {
        if (lastRow && lastRow.productVariantId === undefined) {
          lastRow.productVariantId = variant.id
          lastRow.productVariantColorId = productVariantColorId
          lastRow.productVariantColorName = selectedColor?.colorName
        } else {
          items.push({
            productVariantId: variant.id,
            productVariantColorId,
            productVariantColorName: selectedColor?.colorName,
            quantity: 1
          })
        }
      }
    }
    productSelectorVisible.value = false
  }

  const handleProductSelectorSearch = useDebounceFn(async (query: string) => {
    productSelectorQuery.value = query
    productSelectorPage.value = 1
    await fetchSelectorProducts()
  }, 300)

  const formData = ref<{
    id?: number
    note: string
    items: Array<{
      id?: number
      productVariantId: number | undefined
      productVariantColorId?: number
      productVariantColorName?: string
      quantity: number
      supplierId?: number
    }>
  }>({
    note: '',
    items: []
  })

  const data = ref<PurchaseRequestListResponse[]>([])
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const statusMap = ref<Record<string, string>>({})

  const fetchStatuses = async () => {
    try {
      const res = await PurchaseRequestApi.getStatuses()
      statusMap.value = res || {}
    } catch (e) {
      console.error('Failed to load purchase request statuses', e)
    }
  }

  const suppliers = ref<Supplier[]>([])
  const fetchSuppliers = async () => {
    try {
      const res = await SupplierApi.getList({ current: 1, size: 100, Filters: 'StatusId==active' })
      suppliers.value = res.items || []
    } catch (e) {
      console.error('Failed to load suppliers', e)
    }
  }

  const searchForm = ref({
    status: [] as string[]
  })

  const searchItems = computed(() => [
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'select',
      props: {
        placeholder: 'Tất cả trạng thái',
        clearable: true,
        multiple: true,
        collapseTags: true,
        options: Object.entries(statusMap.value).map(([key, label]) => ({
          label,
          value: key
        }))
      }
    }
  ])

  const columns = ref([
    { label: 'Thời gian tạo', prop: 'createdAt', useSlot: true, width: 170 },
    { label: 'Ghi chú', prop: 'note', minWidth: 200 },
    { label: 'Người tạo', prop: 'createdByName', minWidth: 150 },
    { label: 'Số mặt hàng', prop: 'totalItems', width: 120, align: 'center' },
    { label: 'Trạng thái', prop: 'status', useSlot: true, width: 130, align: 'center' },
    {
      label: 'Thao tác',
      prop: 'operation',
      useSlot: true,
      width: 170,
      fixed: 'right' as const,
      align: 'center'
    }
  ])

  const columnChecks = columns

  const getStatusLabel = (status?: string) => {
    if (!status) return '-'
    return statusMap.value[status.toLowerCase()] || status
  }

  const getStatusTagType = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'info'
      case 'sent':
        return 'warning'
      case 'approve':
      case 'approved':
        return 'success'
      case 'reject':
      case 'rejected':
        return 'danger'
      default:
        return 'info'
    }
  }

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('vi-VN')
  }

  const refreshData = () => {
    loadData()
  }

  const loadData = async () => {
    loading.value = true
    try {
      const sieveFilters = []
      if (searchForm.value.status && searchForm.value.status.length > 0) {
        sieveFilters.push(`Status==${searchForm.value.status.join('|')}`)
      }

      const res = await PurchaseRequestApi.getList({
        current: pagination.current,
        size: pagination.size,
        Filters: sieveFilters.join(',') || undefined,
        Sorts: '-createdAt'
      })

      data.value = res.items || []
      pagination.total = res.totalCount || 0
    } catch (error) {
      console.error(error)
      ElMessage.error('Không thể tải danh sách Yêu cầu mua hàng')
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    pagination.current = 1
    loadData()
  }

  const handleReset = () => {
    searchForm.value.status = []
    pagination.current = 1
    loadData()
  }

  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
    loadData()
  }

  const handleCurrentChange = (page: number) => {
    pagination.current = page
    loadData()
  }

  const handleAdd = () => {
    isEdit.value = false
    dialogTitle.value = 'Tạo yêu cầu mua hàng mới'
    formData.value = {
      note: '',
      items: []
    }
    dialogVisible.value = true
  }

  const handleEdit = async (row: PurchaseRequestListResponse) => {
    try {
      loading.value = true
      const detail = await PurchaseRequestApi.getById(row.id)
      isEdit.value = true
      dialogTitle.value = `Chỉnh sửa Yêu cầu mua hàng #${detail.id}`

      detail.items.forEach((item) => {
        productCache.set(item.productVariantId, {
          displayName: item.productName || `Biến thể #${item.productVariantId}`,
          colorName: item.productVariantColorName
        })
      })

      formData.value = {
        id: detail.id,
        note: detail.note || '',
        items: detail.items.map((item) => ({
          id: item.id,
          productVariantId: item.productVariantId,
          productVariantColorId: item.productVariantColorId,
          productVariantColorName: item.productVariantColorName,
          quantity: item.quantity,
          supplierId: item.supplierId
        }))
      }
      dialogVisible.value = true
    } catch (e) {
      console.error(e)
      ElMessage.error('Không thể tải chi tiết yêu cầu')
    } finally {
      loading.value = false
    }
  }

  const handleDelete = async (row: PurchaseRequestListResponse) => {
    try {
      await ElMessageBox.confirm(
        `Bạn có chắc muốn xóa yêu cầu mua hàng #${row.id}?`,
        'Xác nhận xóa',
        {
          confirmButtonText: 'Xóa',
          cancelButtonText: 'Hủy',
          type: 'warning'
        }
      )
      await PurchaseRequestApi.delete(row.id)
      ElMessage.success('Xóa yêu cầu thành công')
      loadData()
    } catch (e) {
      if (e !== 'cancel') {
        ElMessage.error('Xóa Có lỗi từ hệ thống')
      }
    }
  }

  const handleSendRequest = async (row: any) => {
    try {
      await ElMessageBox.confirm(
        `Gửi yêu cầu mua hàng #${row.id} lên cấp trên phê duyệt?`,
        'Gửi phê duyệt',
        {
          confirmButtonText: 'Gửi',
          cancelButtonText: 'Hủy',
          type: 'info'
        }
      )
      await PurchaseRequestApi.send(row.id)
      ElMessage.success('Gửi phê duyệt thành công')
      loadData()
      if (detailDialogVisible.value && detailData.value?.id === row.id) {
        detailDialogVisible.value = false
      }
    } catch (e) {
      if (e !== 'cancel') {
        ElMessage.error('Gửi duyệt thất bại')
      }
    }
  }

  const handleViewDetail = async (row: PurchaseRequestListResponse) => {
    try {
      loading.value = true
      detailData.value = await PurchaseRequestApi.getById(row.id)
      detailDialogVisible.value = true
    } catch (e) {
      console.error(e)
      ElMessage.error('Không thể lấy chi tiết yêu cầu')
    } finally {
      loading.value = false
    }
  }

  const handleApproveRejectStatus = async (id: number, status: 'approve' | 'reject') => {
    try {
      const verb = status === 'approve' ? 'phê duyệt' : 'từ chối'
      await ElMessageBox.confirm(
        `Bạn có chắc muốn ${verb} yêu cầu mua hàng #${id}?`,
        'Xác nhận hành động',
        {
          confirmButtonText: 'Xác nhận',
          cancelButtonText: 'Hủy',
          type: status === 'approve' ? 'success' : 'warning'
        }
      )
      await PurchaseRequestApi.approveReject(id, status)
      ElMessage.success(`Đã ${verb} yêu cầu mua hàng`)
      if (detailDialogVisible.value && detailData.value?.id === id) {
        detailDialogVisible.value = false
      }
      loadData()
    } catch (e) {
      if (e !== 'cancel') {
        ElMessage.error('Cập nhật trạng thái thất bại')
      }
    }
  }

  const handleAddProductRow = () => {
    openProductSelector()
  }

  const handleRemoveProductRow = (index: number) => {
    formData.value.items.splice(index, 1)
  }

  const submitForm = async () => {
    const validItems = formData.value.items.filter(
      (x) => x.productVariantId !== undefined && x.productVariantId !== null
    )

    if (validItems.length === 0) {
      ElMessage.warning('Vui lòng thêm ít nhất một sản phẩm yêu cầu')
      return
    }

    submitting.value = true
    try {
      if (isEdit.value && formData.value.id) {
        const payload = {
          note: formData.value.note,
          items: validItems.map((x) => ({
            id: x.id,
            productVariantId: x.productVariantId!,
            productVariantColorId: x.productVariantColorId,
            quantity: x.quantity,
            supplierId: x.supplierId
          }))
        }
        await PurchaseRequestApi.update(formData.value.id, payload)
        ElMessage.success('Cập nhật yêu cầu mua hàng thành công')
      } else {
        const payload = {
          note: formData.value.note,
          items: validItems.map((x) => ({
            productVariantId: x.productVariantId!,
            productVariantColorId: x.productVariantColorId,
            quantity: x.quantity,
            supplierId: x.supplierId
          }))
        }
        await PurchaseRequestApi.create(payload)
        ElMessage.success('Tạo yêu cầu mua hàng thành công')
      }
      dialogVisible.value = false
      loadData()
    } catch (e: any) {
      console.error(e)
      ElMessage.error(e.message || 'Lưu yêu cầu mua hàng thất bại')
    } finally {
      submitting.value = false
    }
  }

  onMounted(async () => {
    await fetchStatuses()
    await fetchSuppliers()
    await loadData()
  })
</script>

<style scoped>
  :deep(.el-table) {
    --el-table-header-bg-color: var(--el-fill-color-light);
  }
</style>
