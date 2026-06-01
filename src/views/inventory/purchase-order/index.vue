<template>
  <div class="flex flex-col gap-4 pb-5">
    <!-- Search/Filters -->
    <ArtSearchBar
      v-model="searchForm"
      :items="searchItems"
      :label-width="120"
      :span="8"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- Main Table Card -->
    <ElCard
      class="flex-1 art-table-card shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-md"
    >
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElButton
            v-if="hasPermission('Permissions.InventoryReceipts.Create')"
            type="primary"
            class="!rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            v-ripple
            @click="handleAdd"
          >
            <ElIcon class="mr-1"><Plus /></ElIcon> Tạo đơn mua hàng (PO)
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
        <template #orderDate="{ row }">
          <span class="font-medium text-gray-700">{{ formatDate(row.orderDate) }}</span>
        </template>

        <template #supplierName="{ row }">
          <span class="font-semibold text-primary truncate block max-w-[200px]">{{
            row.supplierName || 'N/A'
          }}</span>
        </template>

        <template #totalAmount="{ row }">
          <span class="font-semibold text-gray-900">{{ formatCurrency(row.totalAmount) }}</span>
        </template>

        <template #status="{ row }">
          <ElTag
            :type="getStatusTagType(row.status)"
            size="small"
            effect="light"
            class="!rounded-md font-medium uppercase px-2.5 py-1"
          >
            {{ getStatusLabel(row.status) }}
          </ElTag>
        </template>

        <template #operation="{ row }">
          <div class="flex gap-2 justify-center">
            <ElTooltip content="Xem chi tiết" placement="top">
              <ElButton
                circle
                size="small"
                type="info"
                class="hover:scale-110 transition-transform duration-200"
                @click="handleViewDetail(row)"
              >
                <ElIcon><View /></ElIcon>
              </ElButton>
            </ElTooltip>

            <!-- Edit Action Button with Permissions Logic -->
            <ElTooltip v-if="canEditPO(row)" content="Chỉnh sửa đơn" placement="top">
              <ElButton
                circle
                size="small"
                type="primary"
                class="hover:scale-110 transition-transform duration-200"
                @click="handleEdit(row)"
              >
                <ElIcon><Edit /></ElIcon>
              </ElButton>
            </ElTooltip>

            <!-- Delete Action Button with Permissions Logic -->
            <ElTooltip v-if="canDeletePO(row)" content="Xóa đơn" placement="top">
              <ElButton
                circle
                size="small"
                type="danger"
                class="hover:scale-110 transition-transform duration-200"
                @click="handleDelete(row)"
              >
                <ElIcon><Delete /></ElIcon>
              </ElButton>
            </ElTooltip>

            <!-- Send Action Button -->
            <ElTooltip
              v-if="
                row.status?.toLowerCase() === 'draft' &&
                hasPermission('Permissions.InventoryReceipts.Send')
              "
              content="Gửi nhà cung cấp"
              placement="top"
            >
              <ElButton
                circle
                size="small"
                type="success"
                class="hover:scale-110 transition-transform duration-200"
                @click="handleSendPO(row)"
              >
                <ElIcon><Promotion /></ElIcon>
              </ElButton>
            </ElTooltip>

            <!-- Approve/Reject Actions directly from row -->
            <ElTooltip
              v-if="
                row.status?.toLowerCase() === 'sent' &&
                hasPermission('Permissions.InventoryReceipts.ApproveReject')
              "
              content="Duyệt đơn hàng"
              placement="top"
            >
              <ElButton
                circle
                size="small"
                type="success"
                class="hover:scale-110 transition-transform duration-200"
                @click="handleApproveReject(row.id, 'approved')"
              >
                <ElIcon><Check /></ElIcon>
              </ElButton>
            </ElTooltip>

            <ElTooltip
              v-if="
                row.status?.toLowerCase() === 'sent' &&
                hasPermission('Permissions.InventoryReceipts.ApproveReject')
              "
              content="Từ chối đơn"
              placement="top"
            >
              <ElButton
                circle
                size="small"
                type="danger"
                class="hover:scale-110 transition-transform duration-200"
                @click="handleApproveReject(row.id, 'rejected')"
              >
                <ElIcon><Close /></ElIcon>
              </ElButton>
            </ElTooltip>
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <!-- Create/Edit Form Dialog -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="950px"
      append-to-body
      destroy-on-close
      class="!rounded-2xl overflow-hidden shadow-2xl border border-gray-100"
    >
      <ElForm :model="formData" label-width="120px" class="mt-4 space-y-4" ref="formRef">
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="Nhà cung cấp" required>
            <ElSelect
              v-model="formData.supplierId"
              placeholder="Chọn nhà cung cấp"
              filterable
              class="w-full"
            >
              <ElOption v-for="sup in suppliers" :key="sup.id" :label="sup.name" :value="sup.id" />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="Ngày đặt hàng">
            <ElDatePicker
              v-model="formData.orderDate"
              type="date"
              placeholder="Chọn ngày đặt hàng"
              class="!w-full"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </ElFormItem>

          <ElFormItem label="Nguồn Yêu cầu" class="col-span-2">
            <ElSelect
              v-model="formData.purchaseRequestId"
              placeholder="Liên kết với phiếu Yêu cầu mua hàng (Không bắt buộc)"
              clearable
              filterable
              class="w-full"
              @change="handlePurchaseRequestChange"
            >
              <ElOption
                v-for="pr in approvedPRs"
                :key="pr.id"
                :label="`Yêu cầu #${pr.id} - Tạo bởi: ${pr.createdByName || 'N/A'} (${formatDate(pr.createdAt)})`"
                :value="pr.id"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="Ghi chú đơn" class="col-span-2">
            <ElInput
              v-model="formData.note"
              type="textarea"
              :rows="3"
              placeholder="Nhập ghi chú hoặc yêu cầu mua hàng..."
            />
          </ElFormItem>
        </div>

        <div class="border-t border-gray-100 pt-4">
          <div class="flex justify-between items-center mb-3">
            <span class="text-sm font-bold text-gray-800">Danh sách sản phẩm mua hàng</span>
            <ElButton
              type="success"
              size="small"
              plain
              class="!rounded-lg"
              @click="openProductSelector()"
            >
              <ElIcon class="mr-1"><Plus /></ElIcon> Thêm sản phẩm
            </ElButton>
          </div>

          <ElTable
            :data="formData.items"
            border
            size="small"
            class="w-full rounded-xl overflow-hidden"
          >
            <ElTableColumn label="Sản phẩm" required minWidth="200">
              <template #default="{ row, $index }">
                <div
                  class="w-full border border-gray-300 rounded-lg px-3 py-1.5 bg-white flex items-center justify-between cursor-pointer hover:border-primary transition duration-200 min-h-[36px]"
                  @click="openProductSelector($index)"
                >
                  <span v-if="row.productVariantId" class="text-gray-800 text-xs font-semibold">
                    {{ getProductNameById(row.productVariantId) }}
                  </span>
                  <span v-else class="text-gray-400 text-xs">Bấm để chọn sản phẩm...</span>
                  <ElIcon class="text-gray-400 text-xs"><ArrowDown /></ElIcon>
                </div>
                <ElTag v-if="getProductColorName(row)" size="small" type="info" class="mt-1">
                  Màu: {{ getProductColorName(row) }}
                </ElTag>
              </template>
            </ElTableColumn>

            <ElTableColumn label="Số lượng đặt" width="140" align="center">
              <template #default="{ row }">
                <ElInputNumber
                  v-model="row.orderedQuantity"
                  :min="1"
                  :precision="0"
                  class="w-full"
                  controls-position="right"
                />
              </template>
            </ElTableColumn>

            <ElTableColumn label="Đơn giá mua" width="180" align="center">
              <template #default="{ row }">
                <ElInputNumber
                  v-model="row.unitPrice"
                  :min="0"
                  :precision="2"
                  class="w-full"
                  controls-position="right"
                  placeholder="Nhập giá"
                />
              </template>
            </ElTableColumn>

            <ElTableColumn label="Thành tiền" width="160" align="right">
              <template #default="{ row }">
                <span class="font-bold text-gray-800">
                  {{ formatCurrency((row.orderedQuantity || 0) * (row.unitPrice || 0)) }}
                </span>
              </template>
            </ElTableColumn>

            <ElTableColumn label="Thao tác" width="90" align="center">
              <template #default="{ $index }">
                <ElButton
                  circle
                  type="danger"
                  size="small"
                  plain
                  class="hover:scale-110 transition-transform duration-200"
                  @click="handleRemoveProductRow($index)"
                >
                  <ElIcon><Delete /></ElIcon>
                </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>

          <!-- Total summary inside form -->
          <div class="flex justify-end items-center gap-4 mt-4 bg-gray-50 p-4 rounded-xl">
            <span class="text-gray-600 text-sm">Tổng cộng đơn mua:</span>
            <span class="text-xl font-bold text-primary">{{
              formatCurrency(totalFormAmount)
            }}</span>
          </div>
        </div>
      </ElForm>

      <template #footer>
        <div class="flex justify-end gap-2 border-t border-gray-50 pt-3">
          <ElButton class="!rounded-lg" @click="dialogVisible = false">Hủy bỏ</ElButton>
          <ElButton type="primary" class="!rounded-lg" :loading="submitting" @click="submitForm">
            Lưu đơn mua (PO)
          </ElButton>
        </div>
      </template>
    </ElDialog>

    <!-- Detail Dialog -->
    <ElDialog
      v-model="detailDialogVisible"
      title="Chi tiết Đơn mua hàng (PO)"
      width="900px"
      append-to-body
      destroy-on-close
      class="!rounded-2xl overflow-hidden shadow-2xl border border-gray-100"
    >
      <div v-if="detailData" class="flex flex-col gap-4">
        <!-- Info Grid -->
        <div
          class="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 grid grid-cols-2 gap-y-4 text-sm relative overflow-hidden"
        >
          <div
            class="absolute right-4 top-4 transform scale-150 opacity-10 font-bold text-gray-500 font-mono select-none"
          >
            PO #{{ detailData.id }}
          </div>

          <div>
            <span class="text-gray-500 font-medium">Trạng thái:</span>
            <span class="ml-2">
              <ElTag
                :type="getStatusTagType(detailData.status)"
                size="small"
                class="!rounded-md uppercase"
              >
                {{ getStatusLabel(detailData.status) }}
              </ElTag>
            </span>
          </div>
          <div>
            <span class="text-gray-500 font-medium">Nhà cung cấp:</span>
            <span class="ml-2 text-gray-900 font-bold">{{ detailData.supplierName || 'N/A' }}</span>
          </div>
          <div>
            <span class="text-gray-500 font-medium">Ngày đặt hàng:</span>
            <span class="ml-2 text-gray-800 font-medium">{{
              formatDate(detailData.orderDate)
            }}</span>
          </div>
          <div>
            <span class="text-gray-500 font-medium">Nguồn Yêu cầu:</span>
            <span class="ml-2 text-gray-800 font-medium">
              {{
                detailData.purchaseRequestId
                  ? `Phiếu Yêu cầu #${detailData.purchaseRequestId}`
                  : 'Tạo trực tiếp'
              }}
            </span>
          </div>
          <div class="col-span-2 border-t border-gray-200/60 pt-3 grid grid-cols-2 gap-y-3">
            <div>
              <span class="text-gray-500 font-medium">Người lập đơn:</span>
              <span class="ml-2 text-gray-800 font-medium">{{
                detailData.createdByName || 'N/A'
              }}</span>
            </div>
            <div v-if="detailData.sentByName">
              <span class="text-gray-500 font-medium">Người gửi:</span>
              <span class="ml-2 text-gray-800 font-medium">{{ detailData.sentByName }}</span>
            </div>
            <div v-if="detailData.approvedByName">
              <span class="text-gray-500 font-medium">Người phê duyệt:</span>
              <span class="ml-2 text-gray-800 font-semibold text-success">{{
                detailData.approvedByName
              }}</span>
            </div>
            <div v-if="detailData.rejectedByName">
              <span class="text-gray-500 font-medium">Người từ chối:</span>
              <span class="ml-2 text-gray-800 font-semibold text-danger">{{
                detailData.rejectedByName
              }}</span>
            </div>
          </div>

          <div class="col-span-2 border-t border-gray-200/60 pt-3">
            <span class="text-gray-500 font-semibold">Ghi chú:</span>
            <div
              class="mt-1.5 bg-white p-3 rounded-xl border border-gray-100 text-gray-700 min-h-[50px]"
            >
              {{ detailData.note || 'Không có ghi chú nào.' }}
            </div>
          </div>
        </div>

        <!-- Product list -->
        <div>
          <h4 class="text-sm font-bold text-gray-800 mb-3 flex items-center">
            Danh sách mặt hàng nhập mua
          </h4>
          <ElTable
            :data="detailData.items"
            border
            size="small"
            class="w-full rounded-xl overflow-hidden"
          >
            <ElTableColumn type="index" label="STT" width="55" align="center" />
            <ElTableColumn label="Tên sản phẩm" minWidth="220">
              <template #default="{ row }">
                <span class="font-bold text-gray-800">{{
                  row.productName || `Biến thể #${row.productVariantId}`
                }}</span>
                <div v-if="row.productVariantColorName" class="mt-1">
                  <ElTag size="small" type="info" class="!rounded-md"
                    >Màu: {{ row.productVariantColorName }}</ElTag
                  >
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="orderedQuantity" label="S/L đặt mua" width="110" align="center" />
            <ElTableColumn prop="unitPrice" label="Đơn giá" width="140" align="right">
              <template #default="{ row }">
                <span class="font-medium text-gray-700">{{ formatCurrency(row.unitPrice) }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Thành tiền" width="160" align="right">
              <template #default="{ row }">
                <span class="font-bold text-gray-900">{{
                  formatCurrency(row.orderedQuantity * row.unitPrice)
                }}</span>
              </template>
            </ElTableColumn>
          </ElTable>

          <!-- Total price in Detail -->
          <div class="flex justify-end items-center gap-4 mt-4 bg-gray-50 p-4 rounded-xl">
            <span class="text-gray-600 font-medium text-sm">Tổng cộng đơn mua (PO):</span>
            <span class="text-2xl font-black text-primary">{{
              formatCurrency(totalDetailAmount)
            }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2 border-t border-gray-50 pt-3">
          <ElButton class="!rounded-lg" @click="detailDialogVisible = false">Đóng</ElButton>

          <template v-if="detailData">
            <!-- Send button for Draft status -->
            <ElButton
              v-if="
                detailData.status?.toLowerCase() === 'draft' &&
                hasPermission('Permissions.InventoryReceipts.Send')
              "
              type="success"
              class="!rounded-lg"
              @click="handleSendPO(detailData)"
            >
              Gửi nhà cung cấp
            </ElButton>

            <!-- Approve/Reject buttons for Sent status -->
            <template
              v-if="
                detailData.status?.toLowerCase() === 'sent' &&
                hasPermission('Permissions.InventoryReceipts.ApproveReject')
              "
            >
              <ElButton
                type="danger"
                class="!rounded-lg"
                @click="handleApproveReject(detailData.id, 'rejected')"
              >
                Từ chối duyệt
              </ElButton>
              <ElButton
                type="success"
                class="!rounded-lg"
                @click="handleApproveReject(detailData.id, 'approved')"
              >
                Phê duyệt đơn hàng
              </ElButton>
            </template>
          </template>
        </div>
      </template>
    </ElDialog>

    <!-- Product & Variant Selector Dialog -->
    <ElDialog
      v-model="productSelectorVisible"
      title="Chọn sản phẩm & màu sắc"
      width="900px"
      append-to-body
      destroy-on-close
      class="!rounded-2xl overflow-hidden shadow-2xl border border-gray-100"
    >
      <div class="space-y-4">
        <ElInput
          v-model="productSelectorQuery"
          placeholder="Tìm sản phẩm theo tên..."
          clearable
          prefix-icon="Search"
          class="!rounded-xl"
          @input="handleProductSelectorSearch"
        />

        <div
          v-loading="productSelectorLoading"
          class="space-y-3 min-h-[350px] max-h-[500px] overflow-y-auto pr-1"
        >
          <div
            v-for="variant in productSelectorItems"
            :key="variant.id"
            class="border border-gray-200/80 rounded-xl p-4 bg-white hover:shadow-md hover:border-primary/40 transition-all duration-200"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <ElImage
                  :src="variant.coverImageUrl || ''"
                  class="w-14 h-14 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                  fit="cover"
                >
                  <template #error>
                    <div
                      class="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300"
                    >
                      <ElIcon size="20"><InfoFilled /></ElIcon>
                    </div>
                  </template>
                </ElImage>

                <div class="flex flex-col min-w-0">
                  <span class="text-sm font-bold text-gray-800 truncate">
                    {{ variant.displayName }}
                  </span>
                  <span class="text-[11px] text-gray-400 mt-0.5 font-mono">
                    Mã sản phẩm: #{{ variant.id }}
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
                      class="inline-block w-4 h-4 rounded-full border border-gray-200 flex-shrink-0"
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
                        class="inline-block w-4 h-4 rounded-full border border-gray-200 flex-shrink-0"
                        :style="{ backgroundColor: color.colorCode || '#ffffff' }"
                      ></span>
                      <span>{{ color.colorName || `Màu #${color.id}` }}</span>
                    </div>
                  </ElOption>
                </ElSelect>
                <ElButton
                  type="primary"
                  size="small"
                  plain
                  class="!rounded-lg"
                  @click="selectProductVariant(variant)"
                >
                  Chọn sản phẩm
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
    Close
  } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useDebounceFn } from '@vueuse/core'
  import { usePermission } from '@/hooks/core/usePermission'
  import { PurchaseOrderApi } from '@/api/purchase-order.api'
  import { PurchaseRequestApi } from '@/api/purchase-request.api'
  import { SupplierApi } from '@/api/supplier.api'
  import { ProductApi } from '@/api/product.api'
  import type {
    PurchaseOrderListResponse,
    PurchaseOrderDetailResponse
  } from '@/domain/purchase-order/order.types'
  import type { ProductVariantLiteForInput } from '@/domain/product/product.types'
  import type { Supplier } from '@/domain/supplier/supplier.types'

  defineOptions({ name: 'PurchaseOrder' })

  const { hasPermission } = usePermission()

  const loading = ref(false)
  const dialogVisible = ref(false)
  const dialogTitle = ref('Tạo đơn mua hàng (PO) mới')
  const submitting = ref(false)
  const isEdit = ref(false)

  const detailDialogVisible = ref(false)
  const detailData = ref<PurchaseOrderDetailResponse | null>(null)

  const suppliers = ref<Supplier[]>([])
  const approvedPRs = ref<any[]>([])

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
        row.productVariantId = variant.id
        row.productVariantColorId = productVariantColorId
        row.productVariantColorName = selectedColor?.colorName
      }
    } else {
      const items = formData.value.items
      const lastRow = items[items.length - 1]
      if (lastRow && lastRow.productVariantId === undefined) {
        lastRow.productVariantId = variant.id
        lastRow.productVariantColorId = productVariantColorId
        lastRow.productVariantColorName = selectedColor?.colorName
      } else {
        items.push({
          productVariantId: variant.id,
          productVariantColorId,
          productVariantColorName: selectedColor?.colorName,
          orderedQuantity: 1,
          unitPrice: 0
        })
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
    supplierId: number | undefined
    purchaseRequestId?: number
    orderDate?: string
    note: string
    items: Array<{
      id?: number
      productVariantId: number | undefined
      productVariantColorId?: number
      productVariantColorName?: string
      orderedQuantity: number
      unitPrice: number
      purchaseRequestItemId?: number
    }>
  }>({
    supplierId: undefined,
    note: '',
    items: []
  })

  const totalFormAmount = computed(() => {
    return formData.value.items.reduce(
      (sum, item) => sum + (item.orderedQuantity || 0) * (item.unitPrice || 0),
      0
    )
  })

  const totalDetailAmount = computed(() => {
    if (!detailData.value) return 0
    return detailData.value.items.reduce(
      (sum, item) => sum + (item.orderedQuantity || 0) * (item.unitPrice || 0),
      0
    )
  })

  const data = ref<PurchaseOrderListResponse[]>([])
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const statusMap = ref<Record<string, string>>({
    draft: 'Bản nháp',
    sent: 'Đã gửi Supplier',
    approved: 'Đã duyệt mua',
    rejected: 'Đã từ chối'
  })

  const searchForm = ref({
    status: [] as string[],
    supplierId: undefined
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
    },
    {
      key: 'supplierId',
      label: 'Nhà cung cấp',
      type: 'select',
      props: {
        placeholder: 'Chọn nhà cung cấp',
        clearable: true,
        options: suppliers.value.map((sup) => ({
          label: sup.name,
          value: sup.id
        }))
      }
    }
  ])

  const columns = ref([
    { label: 'Ngày đặt hàng', prop: 'orderDate', useSlot: true, width: 150 },
    { label: 'Nhà cung cấp', prop: 'supplierName', useSlot: true, minWidth: 200 },
    { label: 'Ghi chú', prop: 'note', minWidth: 180 },
    { label: 'Người lập', prop: 'createdByName', minWidth: 140 },
    { label: 'Tổng tiền', prop: 'totalAmount', useSlot: true, width: 150, align: 'right' as const },
    { label: 'Trạng thái', prop: 'status', useSlot: true, width: 150, align: 'center' as const },
    {
      label: 'Thao tác',
      prop: 'operation',
      useSlot: true,
      width: 220,
      fixed: 'right' as const,
      align: 'center' as const
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
      case 'approved':
        return 'success'
      case 'rejected':
        return 'danger'
      default:
        return 'info'
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('vi-VN')
  }

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '0 ₫'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
  }

  // Frontend Matrix Permissions Validators
  const canEditPO = (row: PurchaseOrderListResponse) => {
    const status = row.status?.toLowerCase()
    if (status === 'draft') {
      return hasPermission('Permissions.InventoryReceipts.Edit')
    }
    if (status === 'sent') {
      return (
        hasPermission('Permissions.InventoryReceipts.Edit') &&
        hasPermission('Permissions.InventoryReceipts.ApproveReject')
      )
    }
    return false
  }

  const canDeletePO = (row: PurchaseOrderListResponse) => {
    const status = row.status?.toLowerCase()
    if (status === 'draft') {
      return hasPermission('Permissions.InventoryReceipts.Delete')
    }
    if (status === 'sent') {
      return (
        hasPermission('Permissions.InventoryReceipts.Delete') &&
        hasPermission('Permissions.InventoryReceipts.ApproveReject')
      )
    }
    if (status === 'rejected') {
      return hasPermission('Permissions.InventoryReceipts.Delete')
    }
    return false
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
      if (searchForm.value.supplierId) {
        sieveFilters.push(`SupplierId==${searchForm.value.supplierId}`)
      }

      const res = await PurchaseOrderApi.getList({
        current: pagination.current,
        size: pagination.size,
        Filters: sieveFilters.join(',') || undefined,
        Sorts: '-createdAt'
      })

      data.value = res.items || []
      pagination.total = res.totalCount || 0
    } catch (error) {
      console.error(error)
      ElMessage.error('Không thể tải danh sách Đơn mua hàng (PO)')
    } finally {
      loading.value = false
    }
  }

  const loadSuppliers = async () => {
    try {
      const res = await SupplierApi.getList({ current: 1, size: 100 })
      suppliers.value = res.items || []
    } catch (e) {
      console.error(e)
    }
  }

  const loadApprovedPRs = async () => {
    try {
      const res = await PurchaseRequestApi.getList({
        current: 1,
        size: 100,
        Filters: 'Status==approve'
      })
      approvedPRs.value = res.items || []
    } catch (e) {
      console.error(e)
    }
  }

  const handlePurchaseRequestChange = async (prId?: number) => {
    if (!prId) return
    try {
      loading.value = true
      const prDetail = await PurchaseRequestApi.getApprovedById(prId)
      // Map PR items to PO items
      formData.value.items = prDetail.items.map((item) => {
        productCache.set(item.productVariantId, {
          displayName: item.productName || `Biến thể #${item.productVariantId}`,
          colorName: item.productVariantColorName
        })
        return {
          productVariantId: item.productVariantId,
          productVariantColorId: item.productVariantColorId,
          productVariantColorName: item.productVariantColorName,
          orderedQuantity: item.unimportedQuantity || 1,
          unitPrice: 0,
          purchaseRequestItemId: item.id
        }
      })
    } catch {
      ElMessage.error('Không thể tải sản phẩm từ yêu cầu mua hàng')
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
    searchForm.value.supplierId = undefined
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
    dialogTitle.value = 'Tạo đơn mua hàng (PO) mới'
    formData.value = {
      supplierId: undefined,
      purchaseRequestId: undefined,
      orderDate: new Date().toISOString().substring(0, 10),
      note: '',
      items: []
    }
    dialogVisible.value = true
  }

  const handleEdit = async (row: PurchaseOrderListResponse) => {
    try {
      loading.value = true
      const detail = await PurchaseOrderApi.getById(row.id)
      isEdit.value = true
      dialogTitle.value = `Chỉnh sửa Đơn mua hàng PO #${detail.id}`

      detail.items.forEach((item) => {
        productCache.set(item.productVariantId, {
          displayName: item.productName || `Biến thể #${item.productVariantId}`,
          colorName: item.productVariantColorName
        })
      })

      formData.value = {
        id: detail.id,
        supplierId: detail.supplierId,
        purchaseRequestId: detail.purchaseRequestId,
        orderDate: detail.orderDate?.substring(0, 10),
        note: detail.note || '',
        items: detail.items.map((item) => ({
          id: item.id,
          productVariantId: item.productVariantId,
          productVariantColorId: item.productVariantColorId,
          productVariantColorName: item.productVariantColorName,
          orderedQuantity: item.orderedQuantity,
          unitPrice: item.unitPrice,
          purchaseRequestItemId: item.purchaseRequestItemId
        }))
      }
      dialogVisible.value = true
    } catch (e) {
      console.error(e)
      ElMessage.error('Không thể tải chi tiết đơn hàng')
    } finally {
      loading.value = false
    }
  }

  const handleDelete = async (row: PurchaseOrderListResponse) => {
    try {
      await ElMessageBox.confirm(
        `Bạn có chắc chắn muốn xóa đơn mua hàng PO #${row.id}?`,
        'Xác nhận xóa đơn hàng',
        {
          confirmButtonText: 'Xóa đơn',
          cancelButtonText: 'Hủy bỏ',
          confirmButtonClass: 'el-button--danger',
          type: 'warning'
        }
      )
      await PurchaseOrderApi.delete(row.id)
      ElMessage.success('Xóa đơn hàng thành công')
      loadData()
    } catch (e) {
      if (e !== 'cancel') {
        console.error(e)
        ElMessage.error('Không thể xóa đơn hàng')
      }
    }
  }

  const handleSendPO = async (row: any) => {
    try {
      await ElMessageBox.confirm(
        `Bạn có muốn chuyển đơn PO #${row.id} sang trạng thái gửi Supplier?`,
        'Xác nhận gửi đơn hàng',
        {
          confirmButtonText: 'Gửi ngay',
          cancelButtonText: 'Hủy',
          type: 'info'
        }
      )
      await PurchaseOrderApi.send(row.id)
      ElMessage.success('Gửi đơn hàng thành công')
      loadData()
      if (detailDialogVisible.value && detailData.value?.id === row.id) {
        detailDialogVisible.value = false
      }
    } catch (e) {
      if (e !== 'cancel') {
        ElMessage.error('Lỗi khi gửi đơn hàng')
      }
    }
  }

  const handleApproveReject = async (id: number, status: string) => {
    const isApprove = status === 'approved'
    const statusText = isApprove ? 'duyệt đơn' : 'từ chối duyệt đơn'
    try {
      await ElMessageBox.confirm(
        `Bạn có chắc chắn muốn ${statusText} PO #${id}?`,
        'Xác nhận phê duyệt',
        {
          confirmButtonText: isApprove ? 'Đồng ý duyệt' : 'Từ chối',
          confirmButtonClass: isApprove ? 'el-button--success' : 'el-button--danger',
          cancelButtonText: 'Hủy',
          type: 'warning'
        }
      )
      await PurchaseOrderApi.approveReject(id, status)
      ElMessage.success(`${isApprove ? 'Duyệt' : 'Từ chối'} đơn hàng thành công`)
      loadData()
      if (detailDialogVisible.value && detailData.value?.id === id) {
        detailDialogVisible.value = false
      }
    } catch (e) {
      if (e !== 'cancel') {
        ElMessage.error('Xử lý phê duyệt gặp lỗi')
      }
    }
  }

  const handleViewDetail = async (row: PurchaseOrderListResponse) => {
    try {
      loading.value = true
      const detail = await PurchaseOrderApi.getById(row.id)
      detailData.value = detail
      detailDialogVisible.value = true
    } catch {
      ElMessage.error('Không thể tải chi tiết đơn hàng')
    } finally {
      loading.value = false
    }
  }

  const handleRemoveProductRow = (index: number) => {
    formData.value.items.splice(index, 1)
  }

  const submitForm = async () => {
    if (!formData.value.supplierId) {
      ElMessage.warning('Vui lòng chọn nhà cung cấp')
      return
    }
    if (formData.value.items.length === 0) {
      ElMessage.warning('Vui lòng thêm ít nhất một mặt hàng cần đặt mua')
      return
    }

    const invalidItem = formData.value.items.find(
      (item) => !item.productVariantId || item.orderedQuantity <= 0
    )
    if (invalidItem) {
      ElMessage.warning('Vui lòng kiểm tra đầy đủ sản phẩm và số lượng mua')
      return
    }

    submitting.value = true
    try {
      const dataPayload = {
        supplierId: formData.value.supplierId,
        purchaseRequestId: formData.value.purchaseRequestId || undefined,
        note: formData.value.note,
        orderDate: formData.value.orderDate
          ? new Date(formData.value.orderDate).toISOString()
          : undefined,
        items: formData.value.items.map((item) => ({
          productVariantId: item.productVariantId,
          productVariantColorId: item.productVariantColorId,
          orderedQuantity: item.orderedQuantity,
          unitPrice: item.unitPrice,
          purchaseRequestItemId: item.purchaseRequestItemId
        }))
      }

      if (isEdit.value && formData.value.id) {
        await PurchaseOrderApi.update(formData.value.id, dataPayload)
        ElMessage.success('Cập nhật đơn hàng thành công')
      } else {
        await PurchaseOrderApi.create(dataPayload)
        ElMessage.success('Tạo đơn hàng thành công')
      }
      dialogVisible.value = false
      loadData()
    } catch (e) {
      console.error(e)
      ElMessage.error('Không thể lưu thông tin đơn hàng')
    } finally {
      submitting.value = false
    }
  }

  onMounted(() => {
    loadData()
    loadSuppliers()
    loadApprovedPRs()
  })
</script>

<style scoped>
  .art-table-card :deep(.el-card__body) {
    padding: 0;
  }
</style>
