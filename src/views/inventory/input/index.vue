<template>
  <div class="flex flex-col gap-4 pb-5">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ArtStatsCard
        title="Tổng xe nhập tháng"
        :count="stats.totalVehicles"
        icon="ri:motorbike-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        title="Đang xử lý"
        :count="stats.processingReceipts"
        icon="ri:time-line"
        iconStyle="bg-warning"
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
          <ElButton
            type="primary"
            v-ripple
            @click="handleAdd"
            v-auth="Permissions.InventoryReceiptsCreate"
          >
            <ElIcon class="mr-1"><Plus /></ElIcon> Tạo phiếu nhập
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

        <template #productSummary="{ row }">
          <div class="text-xs text-gray-500 max-w-[400px] truncate">
            {{ getProductSummaryText(row.products) }}
          </div>
        </template>

        <template #statusId="{ row }">
          <ElTag :type="getStatusTagType(row.statusId)" size="small">
            {{ getStatusLabel(row.statusId) }}
          </ElTag>
        </template>

        <template #operation="{ row }">
          <div class="flex gap-2 justify-center">
            <ElTooltip content="Xem chi tiết" placement="top">
              <ElButton circle size="small" type="info" @click="handleViewDetail(row)">
                <ElIcon><View /></ElIcon>
              </ElButton>
            </ElTooltip>
            <ElTooltip v-if="canEdit(row)" content="Chỉnh sửa" placement="top">
              <ElButton circle size="small" type="primary" @click="handleEdit(row)">
                <ElIcon><Edit /></ElIcon>
              </ElButton>
            </ElTooltip>
            <ElTooltip
              v-if="
                row.statusId?.toLowerCase() === 'draft' &&
                hasAuth(Permissions.InventoryReceiptsSend)
              "
              content="Gửi phiếu"
              placement="top"
            >
              <ElButton circle size="small" type="warning" @click="handleSendReceipt(row.id)">
                <ElIcon><Promotion /></ElIcon>
              </ElButton>
            </ElTooltip>
            <template
              v-if="
                row.statusId?.toLowerCase() === 'sent' &&
                hasAuth(Permissions.InventoryReceiptsApproveReject)
              "
            >
              <ElTooltip content="Phê duyệt" placement="top">
                <ElButton
                  circle
                  size="small"
                  type="success"
                  @click="handleApproveRejectReceipt(row.id, 'approve')"
                >
                  <ElIcon><Check /></ElIcon>
                </ElButton>
              </ElTooltip>
              <ElTooltip content="Từ chối" placement="top">
                <ElButton
                  circle
                  size="small"
                  type="danger"
                  @click="handleApproveRejectReceipt(row.id, 'reject')"
                >
                  <ElIcon><Close /></ElIcon>
                </ElButton>
              </ElTooltip>
            </template>
            <ElTooltip v-if="canDelete(row)" content="Xóa" placement="top">
              <ElButton circle size="small" type="danger" @click="handleDelete(row)">
                <ElIcon><Delete /></ElIcon>
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
      <ElForm :model="formData" label-width="150px" class="mt-4" ref="formRef">
        <div class="grid grid-cols-2 gap-4">
          <!-- Purchase Order Selector -->
          <ElFormItem label="Đơn đặt mua hàng" required class="col-span-2">
            <div class="flex gap-2 w-full">
              <div
                class="flex-1 border border-gray-300 rounded-md px-3 py-2 bg-white flex items-center justify-between cursor-pointer hover:border-primary transition duration-200"
                @click="openPoSelector"
              >
                <span v-if="formData.purchaseOrderId" class="text-gray-800 font-medium">
                  Đơn đặt mua #{{ formData.purchaseOrderId }} -
                  {{ supplierCache.get(formData.supplierId || 0) || 'Đang tải...' }}
                </span>
                <span v-else class="text-gray-400">Chọn Đơn đặt mua (PO)...</span>
                <ElIcon class="text-gray-400"><ArrowDown /></ElIcon>
              </div>
              <ElButton
                v-if="formData.purchaseOrderId"
                type="danger"
                plain
                @click="clearPoSelection"
              >
                Bỏ chọn PO
              </ElButton>
            </div>
          </ElFormItem>
        </div>

        <ElFormItem label="Ghi chú">
          <ElInput
            v-model="formData.notes"
            type="textarea"
            :rows="2"
            placeholder="Nhập ghi chú hoặc thông tin bổ sung cho phiếu nhập này..."
          />
        </ElFormItem>

        <div class="border-t border-gray-100 pt-4 mt-4">
          <div class="flex justify-between items-center mb-3">
            <span class="text-sm font-semibold text-gray-700">Chi tiết sản phẩm nhập kho</span>
          </div>

          <ElTable :data="formData.products" border size="small" class="w-full">
            <ElTableColumn label="Sản phẩm" min-width="360" required>
              <template #default="{ row, $index }">
                <div class="text-xs font-semibold text-gray-800 py-1">
                  {{ getProductNameById(row.productVariantId) }}
                </div>
                <ElTag v-if="getProductColorName(row)" size="small" type="info" class="mt-1 w-fit">
                  Màu: {{ getProductColorName(row) }}
                </ElTag>
                <div v-if="isVinManagedProduct(row)" class="flex items-center gap-2 mt-1">
                  <ElTag size="small" type="warning">
                    VIN {{ getVehicleIdentityProgress(row) }}
                  </ElTag>
                  <ElButton link type="primary" size="small" @click="openVinDialog($index)">
                    Nhập VIN
                  </ElButton>
                </div>
              </template>
            </ElTableColumn>

            <ElTableColumn label="Số lượng nhập" width="200" align="center">
              <template #default="{ row }">
                <ElInputNumber
                  v-model="row.count"
                  :min="0"
                  :max="row.maxUnimportedQuantity"
                  :precision="0"
                  class="w-full"
                  controls-position="right"
                  style="width: 150px"
                  @change="handleProductCountChange(row)"
                />
                <div class="text-[10px] text-gray-400 mt-1">
                  (Đặt hàng: {{ row.maxUnimportedQuantity || 0 }})
                </div>
              </template>
            </ElTableColumn>

            <ElTableColumn label="Thao tác" width="120" align="center">
              <template #default="{ row, $index }">
                <ElTooltip
                  v-if="isVinManagedProduct(row)"
                  content="Nhập số khung, số máy"
                  placement="top"
                >
                  <ElButton circle type="warning" size="small" plain @click="openVinDialog($index)">
                    VIN
                  </ElButton>
                </ElTooltip>
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
            {{ isEdit ? 'Cập nhật' : 'Lưu phiếu' }}
          </ElButton>
        </div>
      </template>
    </ElDialog>

    <ElDialog
      v-model="vinDialogVisible"
      title="Nhập định danh xe"
      width="860px"
      append-to-body
      destroy-on-close
      class="vin-identification-dialog"
      top="2vh"
    >
      <div v-if="activeVinRow" class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center justify-between gap-2 rounded-md bg-gray-50 p-3">
          <div class="min-w-0">
            <div class="text-sm font-semibold text-gray-800 truncate">
              {{ getProductNameById(activeVinRow.productVariantId) }}
            </div>
            <div class="text-xs text-gray-500">
              Số lượng: {{ activeVinRow.count || 0 }} xe · Đã nhập:
              {{ getCompletedVehicleIdentityCount(activeVinRow) }}/{{ activeVinRow.count || 0 }}
            </div>
          </div>
          <ElTag type="warning">Quản lý theo VIN</ElTag>
        </div>

        <div class="vin-dialog-table">
          <ElTable :data="activeVinRow.vehicles" border size="small" class="w-full">
            <ElTableColumn label="#" type="index" width="56" align="center" />
            <ElTableColumn label="Số khung (VIN)" min-width="210">
              <template #default="{ row: vehicle }">
                <ElInput v-model="vehicle.vinNumber" placeholder="Nhập số khung" clearable />
              </template>
            </ElTableColumn>
            <ElTableColumn label="Số máy" min-width="210">
              <template #default="{ row: vehicle }">
                <ElInput v-model="vehicle.engineNumber" placeholder="Nhập số máy" clearable />
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2 border-t border-gray-50 pt-3">
          <ElButton @click="vinDialogVisible = false">Đóng</ElButton>
          <ElButton type="primary" @click="vinDialogVisible = false">Xong</ElButton>
        </div>
      </template>
    </ElDialog>

    <ElDialog
      v-model="detailDialogVisible"
      title="Chi tiết phiếu nhập kho"
      width="800px"
      append-to-body
      destroy-on-close
      class="rounded-xl overflow-hidden"
    >
      <div v-if="detailData" class="flex flex-col gap-4">
        <div class="bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-y-3 text-sm">
          <div>
            <span class="text-gray-500">Mã phiếu nhập:</span>
            <span class="ml-2 text-gray-800 font-bold">#{{ detailData.id }}</span>
          </div>
          <div>
            <span class="text-gray-500">Mã đơn mua hàng (PO):</span>
            <span class="ml-2 text-gray-800 font-medium"
              >#{{ detailData.purchaseOrderId || '--' }}</span
            >
          </div>
          <div>
            <span class="text-gray-500">Nhà cung cấp:</span>
            <span class="ml-2 text-gray-800 font-semibold">{{
              detailData.supplierName || 'N/A'
            }}</span>
          </div>
          <div>
            <span class="text-gray-500">Trạng thái:</span>
            <span class="ml-2">
              <ElTag :type="getStatusTagType(detailData.statusId)" size="small">
                {{ getStatusLabel(detailData.statusId) }}
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
          <div v-if="detailData.statusId?.toLowerCase() === 'approve' && detailData.approvedByName">
            <span class="text-gray-500">Người duyệt:</span>
            <span class="ml-2 text-gray-800 font-medium">{{ detailData.approvedByName }}</span>
          </div>
          <div v-if="detailData.statusId?.toLowerCase() === 'reject' && detailData.rejectedByName">
            <span class="text-gray-500">Người từ chối:</span>
            <span class="ml-2 text-gray-800 font-medium">{{ detailData.rejectedByName }}</span>
          </div>
          <div class="col-span-2 border-t border-gray-200 pt-2 mt-1">
            <span class="text-gray-500 font-medium">Ghi chú (Có thể chỉnh sửa):</span>
            <ElInput
              v-model="detailNotes"
              type="textarea"
              :rows="2"
              placeholder="Nhập ghi chú cho phiếu nhập..."
              class="mt-1"
            />
          </div>
        </div>

        <div class="mt-2">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Danh sách sản phẩm nhập</h4>
          <ElTable :data="detailData.products" border size="small" class="w-full">
            <ElTableColumn type="index" label="STT" width="55" align="center" />
            <ElTableColumn label="Tên sản phẩm" minWidth="280">
              <template #default="{ row }">
                <div class="flex flex-col gap-1">
                  <span class="font-medium text-gray-800">{{ row.name }}</span>
                  <ElTag v-if="row.productVariantColorName" size="small" type="info" class="w-fit">
                    Màu: {{ row.productVariantColorName }}
                  </ElTag>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="quantity" label="Số lượng nhập" width="120" align="center" />
            <ElTableColumn label="Định danh xe" minWidth="320">
              <template #default="{ row }">
                <div v-if="row.vehicles?.length" class="flex flex-col gap-1 text-xs text-gray-600">
                  <div
                    v-for="vehicle in row.vehicles"
                    :key="vehicle.id || `${vehicle.vinNumber}-${vehicle.engineNumber}`"
                    class="rounded border border-gray-100 bg-gray-50 px-2 py-1"
                  >
                    <div><span class="text-gray-400">VIN:</span> {{ vehicle.vinNumber }}</div>
                    <div><span class="text-gray-400">Số máy:</span> {{ vehicle.engineNumber }}</div>
                  </div>
                </div>
                <span v-else class="text-gray-400">--</span>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2 border-t border-gray-50 pt-3">
          <ElButton @click="detailDialogVisible = false">Đóng</ElButton>

          <template v-if="detailData">
            <ElButton
              v-if="
                detailData.statusId?.toLowerCase() === 'draft' &&
                hasAuth(Permissions.InventoryReceiptsSend)
              "
              type="primary"
              :loading="detailSubmitting"
              @click="handleSendReceipt(detailData.id)"
            >
              Gửi phiếu
            </ElButton>
            <ElButton
              v-if="
                detailData.statusId?.toLowerCase() === 'sent' &&
                hasAuth(Permissions.InventoryReceiptsApproveReject)
              "
              type="success"
              :loading="detailSubmitting"
              @click="handleApproveRejectReceipt(detailData.id, 'approve')"
            >
              Phê duyệt
            </ElButton>
            <ElButton
              v-if="
                detailData.statusId?.toLowerCase() === 'sent' &&
                hasAuth(Permissions.InventoryReceiptsApproveReject)
              "
              type="danger"
              :loading="detailSubmitting"
              @click="handleApproveRejectReceipt(detailData.id, 'reject')"
            >
              Từ chối
            </ElButton>
          </template>
        </div>
      </template>
    </ElDialog>

    <!-- Purchase Order Selector Dialog -->
    <ElDialog
      v-model="poSelectorVisible"
      title="Chọn Đơn đặt mua hàng (PO)"
      width="680px"
      append-to-body
      destroy-on-close
      class="rounded-xl overflow-hidden"
    >
      <div class="space-y-4">
        <ElInput
          placeholder="Tìm kiếm theo mã đơn PO hoặc tên nhà cung cấp..."
          clearable
          prefix-icon="Search"
          v-model="poSelectorQuery"
          @input="handlePoSelectorSearch"
        />

        <div
          v-loading="poSelectorLoading"
          class="grid grid-cols-1 gap-3 min-h-[300px] max-h-[450px] overflow-y-auto pr-1"
        >
          <div
            v-for="po in poSelectorItems"
            :key="po.id"
            class="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition duration-200 cursor-pointer flex flex-col justify-between"
            @click="selectPurchaseOrder(po)"
          >
            <div class="text-xs text-gray-500 space-y-1">
              <div class="flex justify-between items-center mb-1">
                <span class="font-bold text-gray-800 text-sm">Mã PO: #{{ po.id }}</span>
                <ElTag size="small" type="success">Đã phê duyệt</ElTag>
              </div>
              <div
                ><span class="font-medium text-gray-400">Nhà cung cấp:</span>
                {{ po.supplierName }}</div
              >
              <div
                ><span class="font-medium text-gray-400">Ghi chú:</span>
                {{ po.note || 'Không có ghi chú' }}</div
              >
              <div
                ><span class="font-medium text-gray-400">Ngày đặt hàng:</span>
                {{ formatDateTime(po.orderDate) }}</div
              >
            </div>
          </div>
          <div
            v-if="!poSelectorLoading && poSelectorItems.length === 0"
            class="flex flex-col items-center justify-center py-10 text-gray-400"
          >
            <ElIcon size="32"><InfoFilled /></ElIcon>
            <span class="mt-2 text-sm">Không tìm thấy đơn mua hàng nào hợp lệ</span>
          </div>
        </div>

        <div class="flex justify-end pt-2 border-t">
          <ElPagination
            v-model:current-page="poSelectorPage"
            v-model:page-size="poSelectorPageSize"
            :total="poSelectorTotal"
            layout="prev, pager, next, total"
            background
            size="small"
            @current-change="fetchSelectorPos"
          />
        </div>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue'
  import { useAuth } from '@/hooks/core/useAuth'
  import { useUserStore } from '@/store/modules/user'
  import { useRouter } from 'vue-router'
  import {
    Plus,
    Edit,
    Delete,
    View,
    ArrowDown,
    Check,
    Close,
    Promotion,
    InfoFilled
  } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useDebounceFn } from '@vueuse/core'
  import { InventoryReceiptApi } from '@/api/inventory-receipt.api'
  import { PurchaseOrderApi } from '@/api/purchase-order.api'
  import { Permissions } from '@/domain/constants/permissions'
  import type { InventoryReceipt, InputInfo } from '@/domain/inventory/receipt.types'

  defineOptions({ name: 'InventoryInput' })

  type VehicleIdentification = {
    id?: number
    vinNumber: string
    engineNumber: string
  }

  type ReceiptProductRow = {
    id?: number
    productVariantId: number | undefined
    productVariantColorId?: number
    productVariantColorName?: string
    count: number
    managementType?: string
    vehicles?: VehicleIdentification[]
    purchaseOrderItemId?: number
    maxUnimportedQuantity?: number
    needVin?: boolean
  }

  const VIN_MANAGEMENT_TYPE = 'vin_number'

  const loading = ref(false)
  const dialogVisible = ref(false)
  const dialogTitle = ref('Tạo phiếu nhập mới')
  const submitting = ref(false)
  const isEdit = ref(false)
  const vinDialogVisible = ref(false)
  const vinDialogRowIndex = ref<number | null>(null)
  const activeVinRow = computed(() => {
    if (vinDialogRowIndex.value === null) return null
    return formData.value.products[vinDialogRowIndex.value] ?? null
  })

  const detailDialogVisible = ref(false)
  const detailData = ref<any>(null)
  const detailNotes = ref('')
  const detailSubmitting = ref(false)

  const router = useRouter()
  const userStore = useUserStore()
  const { hasAuth: standardHasAuth } = useAuth()

  const hasAuth = (auth: string): boolean => {
    const buttons = userStore.info?.buttons ?? []
    if (buttons.includes(auth)) return true

    const authList =
      (router.currentRoute.value?.meta?.authList as Array<{ authMark: string }>) || []
    if (authList.some((item) => item?.authMark === auth)) return true

    return standardHasAuth(auth)
  }

  const canEdit = (row?: InventoryReceipt | null) => {
    if (!row) return false
    const status = (row.statusId || '').toLowerCase()
    if (status === 'approve' || status === 'reject') return false
    if (status === 'sent') return hasAuth(Permissions.InventoryReceiptsApproveReject)
    return (
      hasAuth(Permissions.InventoryReceiptsEdit) ||
      hasAuth(Permissions.InventoryReceiptsApproveReject)
    )
  }

  const canDelete = (row?: InventoryReceipt | null) => {
    if (!row) return false
    const status = (row.statusId || '').toLowerCase()
    if (status === 'approve' || status === 'reject') return false
    if (status === 'sent') return hasAuth(Permissions.InventoryReceiptsApproveReject)
    return (
      hasAuth(Permissions.InventoryReceiptsDelete) ||
      hasAuth(Permissions.InventoryReceiptsApproveReject)
    )
  }

  const handleSendReceipt = async (id: number) => {
    try {
      await ElMessageBox.confirm(
        'Bạn có chắc chắn muốn gửi phiếu nhập này? Sau khi gửi, bạn sẽ không thể tự chỉnh sửa hoặc xóa nữa (trừ người có quyền phê duyệt).',
        'Xác nhận gửi',
        {
          confirmButtonText: 'Gửi',
          cancelButtonText: 'Hủy',
          type: 'info'
        }
      )
      detailSubmitting.value = true
      await InventoryReceiptApi.send(id)
      ElMessage.success('Gửi phiếu nhập thành công')
      detailDialogVisible.value = false
      loadData()
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('Failed to send receipt:', error)
        ElMessage.error(error.message || 'Gửi thất bại')
      }
    } finally {
      detailSubmitting.value = false
    }
  }

  const handleApproveRejectReceipt = async (id: number, action: 'approve' | 'reject') => {
    const isApprove = action === 'approve'
    const title = isApprove ? 'Xác nhận phê duyệt' : 'Xác nhận từ chối'
    const message = isApprove
      ? 'Bạn có chắc chắn muốn phê duyệt phiếu nhập này? Số lượng sản phẩm sẽ được cộng vào kho.'
      : 'Bạn có chắc chắn muốn từ chối phê duyệt phiếu nhập này?'

    try {
      await ElMessageBox.confirm(message, title, {
        confirmButtonText: isApprove ? 'Duyệt' : 'Từ chối',
        cancelButtonText: 'Hủy',
        type: isApprove ? 'success' : 'warning'
      })
      detailSubmitting.value = true
      await InventoryReceiptApi.updateStatus(id, action)
      ElMessage.success(
        isApprove ? 'Phê duyệt phiếu nhập thành công' : 'Từ chối phiếu nhập thành công'
      )
      detailDialogVisible.value = false
      loadData()
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error(`Failed to ${action} receipt:`, error)
        ElMessage.error(error.message || 'Thao tác thất bại')
      }
    } finally {
      detailSubmitting.value = false
    }
  }

  const stats = ref({
    totalVehicles: 0,
    processingReceipts: 0
  })

  const statuses = ref<Record<string, string>>({})
  const supplierCache = reactive(new Map<number, string>())
  const productCache = reactive(
    new Map<
      number,
      { displayName: string; price?: number; managementType?: string; colorName?: string }
    >()
  )

  const getProductNameById = (id?: number) => {
    if (!id) return ''
    return productCache.get(Number(id))?.displayName || `Sản phẩm #${id}`
  }

  const getProductColorName = (row: ReceiptProductRow) => {
    return (
      row.productVariantColorName || productCache.get(Number(row.productVariantId))?.colorName || ''
    )
  }

  const isVinManagedProduct = (row: ReceiptProductRow) => {
    return row.managementType?.toLowerCase() === VIN_MANAGEMENT_TYPE
  }

  const createEmptyVehicle = (): VehicleIdentification => ({
    vinNumber: '',
    engineNumber: ''
  })

  const syncVehicleRows = (row: ReceiptProductRow) => {
    if (!isVinManagedProduct(row)) {
      row.vehicles = undefined
      return
    }

    const targetCount = Math.max(Number(row.count) || 0, 0)
    const vehicles = row.vehicles ?? []
    while (vehicles.length < targetCount) {
      vehicles.push(createEmptyVehicle())
    }
    if (vehicles.length > targetCount) {
      vehicles.splice(targetCount)
    }
    row.vehicles = vehicles
  }

  const handleProductCountChange = (row: ReceiptProductRow) => {
    syncVehicleRows(row)
  }

  const getCompletedVehicleIdentityCount = (row: ReceiptProductRow) => {
    return (row.vehicles ?? []).filter(
      (vehicle) => vehicle.vinNumber?.trim() && vehicle.engineNumber?.trim()
    ).length
  }

  const getVehicleIdentityProgress = (row: ReceiptProductRow) => {
    return `${getCompletedVehicleIdentityCount(row)}/${row.count || 0}`
  }

  const openVinDialog = (rowIndex: number) => {
    const row = formData.value.products[rowIndex]
    if (!row || !isVinManagedProduct(row)) return
    syncVehicleRows(row)
    vinDialogRowIndex.value = rowIndex
    vinDialogVisible.value = true
  }

  const formData = ref<{
    id?: number
    purchaseOrderId: number | undefined
    supplierId: number | undefined
    notes: string
    statusId: string
    products: ReceiptProductRow[]
  }>({
    purchaseOrderId: undefined,
    supplierId: undefined,
    notes: '',
    statusId: 'working',
    products: []
  })

  // --- Purchase Order Selector Dialog ---
  const poSelectorVisible = ref(false)
  const poSelectorLoading = ref(false)
  const poSelectorItems = ref<any[]>([])
  const poSelectorPage = ref(1)
  const poSelectorPageSize = ref(10)
  const poSelectorTotal = ref(0)
  const poSelectorQuery = ref('')

  const fetchSelectorPos = async () => {
    poSelectorLoading.value = true
    try {
      const filters = ['Status==Approved']
      if (poSelectorQuery.value.trim()) {
        filters.push(`Id==${poSelectorQuery.value.trim()}`)
      }
      const res = await PurchaseOrderApi.getApprovedForInputList({
        current: poSelectorPage.value,
        size: poSelectorPageSize.value,
        Filters: filters.join(',')
      })
      poSelectorItems.value = res.items || []
      poSelectorTotal.value = res.totalCount || 0

      res.items?.forEach((poItem: any) => {
        if (poItem.supplierId) {
          supplierCache.set(poItem.supplierId, poItem.supplierName)
        }
      })
    } catch (err) {
      console.error('Failed to fetch selector POs:', err)
    } finally {
      poSelectorLoading.value = false
    }
  }

  const openPoSelector = () => {
    poSelectorQuery.value = ''
    poSelectorPage.value = 1
    poSelectorVisible.value = true
    fetchSelectorPos()
  }

  const handlePoSelectorSearch = useDebounceFn(async () => {
    poSelectorPage.value = 1
    await fetchSelectorPos()
  }, 300)

  const clearPoSelection = () => {
    formData.value.purchaseOrderId = undefined
    formData.value.supplierId = undefined
    formData.value.products = []
  }

  const selectPurchaseOrder = async (po: any) => {
    try {
      loading.value = true
      poSelectorVisible.value = false
      formData.value.purchaseOrderId = po.id
      formData.value.supplierId = po.supplierId
      formData.value.products = []
      const detail = await PurchaseOrderApi.getApprovedForInputById(po.id)

      detail.items.forEach((item: any) => {
        const remainingQty = item.remainingQuantity || 0
        if (remainingQty <= 0) return

        const isVin = item.needVin || false

        const newRow: ReceiptProductRow = {
          productVariantId: item.productVariantId,
          productVariantColorId: item.productVariantColorId,
          productVariantColorName: item.productVariantColorName,
          count: remainingQty,
          purchaseOrderItemId: item.id,
          maxUnimportedQuantity: remainingQty,
          needVin: isVin,
          managementType: isVin ? VIN_MANAGEMENT_TYPE : 'sku'
        }

        productCache.set(item.productVariantId, {
          displayName: item.productName || `Sản phẩm #${item.productVariantId}`,
          managementType: isVin ? VIN_MANAGEMENT_TYPE : 'sku',
          colorName: item.productVariantColorName
        })

        formData.value.products.push(newRow)
      })
    } catch (err) {
      console.error(err)
      ElMessage.error('Không thể nạp thông tin Đơn mua hàng')
    } finally {
      loading.value = false
    }
  }

  const data = ref<InventoryReceipt[]>([])
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const searchForm = ref({
    supplierName: '',
    statusId: [] as string[]
  })

  const searchItems = computed(() => [
    {
      key: 'supplierName',
      label: 'Nhà cung cấp',
      type: 'input',
      props: { placeholder: 'Tìm theo tên nhà cung cấp...' }
    },
    {
      key: 'statusId',
      label: 'Trạng thái',
      type: 'select',
      props: {
        placeholder: 'Tất cả trạng thái',
        clearable: true,
        multiple: true,
        collapseTags: true,
        options: Object.entries(statuses.value).map(([key, value]) => ({
          label: value,
          value: key
        }))
      }
    }
  ])

  const columns = ref([
    { label: 'Thời gian tạo', prop: 'createdAt', useSlot: true, width: 170 },
    { label: 'Tóm tắt SP', prop: 'productSummary', useSlot: true, minWidth: 320 },
    { label: 'Trạng thái', prop: 'statusId', useSlot: true, width: 150, align: 'center' },
    {
      label: 'Thao tác',
      prop: 'operation',
      useSlot: true,
      width: 200,
      fixed: 'right' as const,
      align: 'center'
    }
  ])

  const columnChecks = columns

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusLabel = (statusId?: string) => {
    if (!statusId) return '-'
    return statuses.value[statusId] || statusId
  }

  const getStatusTagType = (statusId?: string) => {
    if (!statusId) return 'info'
    switch (statusId.toLowerCase()) {
      case 'draft':
        return 'info'
      case 'sent':
        return 'warning'
      case 'approve':
        return 'success'
      case 'reject':
        return 'danger'
      default:
        return 'info'
    }
  }

  const getProductSummaryText = (products?: InputInfo[]) => {
    if (!products || products.length === 0) return 'Không có sản phẩm'
    return products.map((p) => `${p.name} (SL: ${p.quantity})`).join(', ')
  }

  const loadStatuses = async () => {
    try {
      statuses.value = await InventoryReceiptApi.getStatuses()
    } catch (error) {
      console.error('Failed to load statuses:', error)
      statuses.value = {
        draft: 'Phiếu tạm',
        sent: 'Đã gửi',
        approve: 'Đã duyệt',
        reject: 'Đã từ chối'
      }
    }
  }

  const loadStats = async () => {
    try {
      const res = await InventoryReceiptApi.getStats()
      stats.value = {
        totalVehicles: res.totalVehicles || 0,
        processingReceipts: res.processingReceipts || 0
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const loadData = async () => {
    await loadDataWithFilters(searchForm.value)
  }

  const loadDataWithFilters = async (filters?: any) => {
    loading.value = true
    try {
      const sieveFilters = []
      if (filters?.supplierName) {
        sieveFilters.push(`SupplierName@=${filters.supplierName}`)
      }
      if (filters?.statusId && filters.statusId.length > 0) {
        if (Array.isArray(filters.statusId)) {
          sieveFilters.push(`StatusId==${filters.statusId.join('|')}`)
        } else {
          sieveFilters.push(`StatusId==${filters.statusId}`)
        }
      }

      const params = {
        current: pagination.current,
        size: pagination.size,
        Filters: sieveFilters.join(',') || undefined,
        Sorts: '-createdAt'
      }

      const res = await InventoryReceiptApi.getList(params)
      data.value = res.items || []
      pagination.total = res.totalCount || 0
      await loadStats()
    } catch (error) {
      console.error('Failed to load inventory receipts:', error)
      ElMessage.error('Không thể tải danh sách phiếu nhập kho')
    } finally {
      loading.value = false
    }
  }

  const handleSearch = (filters: any) => {
    pagination.current = 1
    loadDataWithFilters(filters)
  }

  const handleReset = () => {
    pagination.current = 1
    loadDataWithFilters()
  }

  const refreshData = () => {
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

  const handleViewDetail = async (row: InventoryReceipt) => {
    try {
      loading.value = true
      const res = await InventoryReceiptApi.getById(row.id)
      detailData.value = res
      detailNotes.value = res.notes || ''
      detailDialogVisible.value = true
    } catch (error) {
      console.error('Failed to load receipt details:', error)
      ElMessage.error('Không thể tải chi tiết phiếu nhập')
    } finally {
      loading.value = false
    }
  }

  const handleAdd = () => {
    isEdit.value = false
    dialogTitle.value = 'Tạo phiếu nhập mới'
    formData.value = {
      purchaseOrderId: undefined,
      supplierId: undefined,
      notes: '',
      statusId: 'working',
      products: []
    }
    dialogVisible.value = true
  }

  const handleEdit = async (row: InventoryReceipt) => {
    try {
      loading.value = true
      const receipt = await InventoryReceiptApi.getById(row.id)
      isEdit.value = true
      dialogTitle.value = 'Cập nhật phiếu nhập'

      if (receipt.purchaseOrderId) {
        supplierCache.set(receipt.supplierId || 0, receipt.supplierName || '')
      }

      formData.value = {
        id: receipt.id,
        purchaseOrderId: receipt.purchaseOrderId,
        supplierId: receipt.supplierId,
        notes: receipt.notes || '',
        statusId: receipt.statusId || 'working',
        products: (receipt.products || []).map((p: any) => {
          const isVin = p.vehicles && p.vehicles.length > 0
          productCache.set(p.productVariantId, {
            displayName: p.name || `Sản phẩm #${p.productVariantId}`,
            colorName: p.productVariantColorName
          })

          return {
            id: p.id,
            productVariantId: p.productVariantId,
            productVariantColorId: p.productVariantColorId,
            productVariantColorName: p.productVariantColorName,
            count: p.quantity || 0,
            managementType: isVin ? VIN_MANAGEMENT_TYPE : undefined,
            needVin: isVin,
            purchaseOrderItemId: p.purchaseOrderItemId,
            maxUnimportedQuantity: p.maxAllowedQuantity ?? (p.quantity || 0),
            vehicles: (p.vehicles || []).map((vehicle: any) => ({
              id: vehicle.id,
              vinNumber: vehicle.vinNumber || '',
              engineNumber: vehicle.engineNumber || ''
            }))
          }
        })
      }
      dialogVisible.value = true
    } catch (error) {
      console.error('Failed to load receipt details for editing:', error)
      ElMessage.error('Không thể tải chi tiết phiếu nhập')
    } finally {
      loading.value = false
    }
  }

  const handleDelete = async (row: InventoryReceipt) => {
    try {
      await ElMessageBox.confirm(
        `Bạn có chắc chắn muốn xóa phiếu nhập số #${row.id}?`,
        'Xác nhận xóa',
        {
          confirmButtonText: 'Xóa',
          cancelButtonText: 'Hủy',
          type: 'warning'
        }
      )
      await InventoryReceiptApi.delete(row.id)
      ElMessage.success('Xóa phiếu nhập thành công')
      loadData()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('Failed to delete receipt:', error)
        ElMessage.error('Xóa phiếu nhập thất bại')
      }
    }
  }

  const handleRemoveProductRow = (index: number) => {
    if (formData.value.products.length <= 1) {
      ElMessage.warning('Phiếu nhập phải chứa ít nhất một sản phẩm')
      return
    }
    formData.value.products.splice(index, 1)
  }

  const submitForm = async () => {
    if (!formData.value.purchaseOrderId) {
      ElMessage.warning('Vui lòng chọn đơn mua hàng (PO)')
      return
    }

    const invalid = formData.value.products.filter((p) => (p.count || 0) <= 0)
    if (invalid.length > 0) {
      ElMessage.error('Số lượng nhập của tất cả sản phẩm phải lớn hơn 0!')
      return
    }

    for (const product of formData.value.products) {
      if (!isVinManagedProduct(product)) continue

      syncVehicleRows(product)
      const vehicles = product.vehicles ?? []
      if (vehicles.length !== product.count) {
        ElMessage.warning('Số dòng định danh xe phải đúng bằng số lượng nhập')
        return
      }

      const hasMissingRequiredCode = vehicles.some(
        (vehicle) => !vehicle.vinNumber?.trim() || !vehicle.engineNumber?.trim()
      )
      if (hasMissingRequiredCode) {
        ElMessage.warning('Vui lòng nhập đủ số khung (VIN) và số máy cho sản phẩm quản lý theo VIN')
        return
      }

      const normalizedVins = vehicles.map((vehicle) => vehicle.vinNumber.trim().toLowerCase())
      const normalizedEngines = vehicles.map((vehicle) => vehicle.engineNumber.trim().toLowerCase())
      if (new Set(normalizedVins).size !== normalizedVins.length) {
        ElMessage.warning('Số khung (VIN) bị trùng trong cùng dòng sản phẩm')
        return
      }
      if (new Set(normalizedEngines).size !== normalizedEngines.length) {
        ElMessage.warning('Số máy bị trùng trong cùng dòng sản phẩm')
        return
      }
    }

    submitting.value = true
    try {
      const payloadProducts = formData.value.products.map((p) => ({
        id: p.id,
        purchaseOrderItemId: p.purchaseOrderItemId,
        productVariantId: p.productVariantId!,
        productVariantColorId: p.productVariantColorId,
        count: p.count,
        vehicles: isVinManagedProduct(p)
          ? p.vehicles?.map((vehicle) => ({
              id: vehicle.id,
              vinNumber: vehicle.vinNumber.trim(),
              engineNumber: vehicle.engineNumber.trim()
            }))
          : undefined
      }))

      if (isEdit.value && formData.value.id) {
        const payload = {
          notes: formData.value.notes,
          purchaseOrderId: formData.value.purchaseOrderId,
          products: payloadProducts
        }
        await InventoryReceiptApi.update(formData.value.id, payload)
        ElMessage.success('Cập nhật phiếu nhập thành công')
      } else {
        const payload = {
          notes: formData.value.notes,
          purchaseOrderId: formData.value.purchaseOrderId,
          products: payloadProducts.map(
            ({
              purchaseOrderItemId,
              productVariantId,
              productVariantColorId,
              count,
              vehicles
            }) => ({
              purchaseOrderItemId,
              productVariantId,
              productVariantColorId,
              count,
              vehicles
            })
          )
        }
        await InventoryReceiptApi.create(payload)
        ElMessage.success('Tạo phiếu nhập thành công')
      }
      dialogVisible.value = false
      loadData()
    } catch (error: any) {
      console.error('Failed to save receipt:', error)
      ElMessage.error(error.message || 'Không thể lưu phiếu nhập')
    } finally {
      submitting.value = false
    }
  }

  onMounted(async () => {
    loading.value = true
    await Promise.all([loadStatuses()])
    await loadData()
  })
</script>

<style scoped>
  :deep(.el-table) {
    --el-table-header-bg-color: var(--el-fill-color-light);
  }

  :deep(.vin-identification-dialog) {
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 4vh);
    margin-bottom: 2vh;
    overflow: hidden;
  }

  :deep(.vin-identification-dialog .el-dialog__body) {
    flex: 1;
    min-height: 0;
    padding-top: 12px;
    padding-bottom: 12px;
    overflow: hidden;
  }

  :deep(.vin-identification-dialog .el-dialog__footer) {
    flex-shrink: 0;
  }

  .vin-dialog-table {
    max-height: calc(100vh - 250px);
    overflow: auto;
  }
</style>
