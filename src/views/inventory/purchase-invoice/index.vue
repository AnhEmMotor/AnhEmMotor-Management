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
            <ElIcon class="mr-1"><Plus /></ElIcon> Tạo hóa đơn mua hàng
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
        <template #invoiceDate="{ row }">
          <span class="font-medium text-gray-700">{{ formatDate(row.invoiceDate) }}</span>
        </template>

        <template #invoiceNumber="{ row }">
          <span class="font-bold text-gray-900 font-mono">{{ row.invoiceNumber || 'N/A' }}</span>
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

            <!-- Edit Action Button -->
            <ElTooltip
              v-if="row.status?.toLowerCase() === 'draft'"
              content="Chỉnh sửa hóa đơn"
              placement="top"
            >
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

            <!-- Delete Action Button -->
            <ElTooltip
              v-if="row.status?.toLowerCase() === 'draft'"
              content="Xóa hóa đơn"
              placement="top"
            >
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

            <!-- Approve/Reject Actions directly from row -->
            <ElTooltip
              v-if="
                row.status?.toLowerCase() === 'draft' &&
                hasPermission('Permissions.InventoryReceipts.ApproveReject')
              "
              content="Duyệt hóa đơn"
              placement="top"
            >
              <ElButton
                circle
                size="small"
                type="success"
                class="hover:scale-110 transition-transform duration-200"
                @click="handleApproveReject(row.id, true)"
              >
                <ElIcon><Check /></ElIcon>
              </ElButton>
            </ElTooltip>

            <ElTooltip
              v-if="
                row.status?.toLowerCase() === 'draft' &&
                hasPermission('Permissions.InventoryReceipts.ApproveReject')
              "
              content="Từ chối hóa đơn"
              placement="top"
            >
              <ElButton
                circle
                size="small"
                type="danger"
                class="hover:scale-110 transition-transform duration-200"
                @click="handleApproveReject(row.id, false)"
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
      <ElForm :model="formData" label-width="160px" class="mt-4 space-y-4" ref="formRef">
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="Đơn mua hàng (PO)" required>
            <ElSelect
              v-model="formData.purchaseOrderId"
              placeholder="Liên kết với Đơn mua hàng (PO)"
              filterable
              class="w-full"
              :disabled="isEdit"
              @change="handlePurchaseOrderChange"
            >
              <ElOption
                v-for="po in approvedPOs"
                :key="po.id"
                :label="`Đơn mua #${po.id} - ${po.supplierName || 'N/A'} (${formatDate(po.orderDate)})`"
                :value="po.id"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="Số hóa đơn" required>
            <ElInput
              v-model="formData.invoiceNumber"
              placeholder="Nhập số hóa đơn (ví dụ: VAT-00123)"
            />
          </ElFormItem>

          <ElFormItem label="Ngày hóa đơn">
            <ElDatePicker
              v-model="formData.invoiceDate"
              type="date"
              placeholder="Chọn ngày hóa đơn"
              class="!w-full"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </ElFormItem>

          <ElFormItem label="Hạn thanh toán">
            <ElDatePicker
              v-model="formData.dueDate"
              type="date"
              placeholder="Chọn ngày hạn thanh toán (Không bắt buộc)"
              class="!w-full"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </ElFormItem>

          <ElFormItem label="Ghi chú hóa đơn" class="col-span-2">
            <ElInput
              v-model="formData.note"
              type="textarea"
              :rows="3"
              placeholder="Nhập ghi chú hoặc thông tin bổ sung hóa đơn..."
            />
          </ElFormItem>
        </div>

        <div class="border-t border-gray-100 pt-4">
          <div class="flex justify-between items-center mb-3">
            <span class="text-sm font-bold text-gray-800">Danh sách sản phẩm trên hóa đơn</span>
          </div>

          <ElTable
            :data="formData.items"
            border
            size="small"
            class="w-full rounded-xl overflow-hidden"
          >
            <ElTableColumn label="Sản phẩm" minWidth="200">
              <template #default="{ row, $index }">
                <span class="text-gray-800 text-xs font-semibold block">
                  {{ getProductName(row) }}
                </span>
                <ElTag v-if="row.colorName" size="small" type="info" class="mt-1">
                  Màu: {{ row.colorName }}
                </ElTag>
                <div v-if="row.needVin" class="flex items-center gap-2 mt-1">
                  <ElTag size="small" type="warning">
                    VIN {{ getVehicleIdentityProgress(row) }}
                  </ElTag>
                  <ElButton link type="primary" size="small" @click="openVinDialog($index)">
                    Nhập VIN
                  </ElButton>
                </div>
              </template>
            </ElTableColumn>

            <ElTableColumn label="Số lượng hóa đơn" width="140" align="center">
              <template #default="{ row }">
                <ElInputNumber
                  v-model="row.invoicedQuantity"
                  :min="1"
                  :max="row.remainingQuantity"
                  :precision="0"
                  class="w-full"
                  controls-position="right"
                  style="width: 100px"
                  @change="handleInvoicedQuantityChange(row)"
                />
                <span
                  v-if="row.remainingQuantity !== undefined"
                  class="text-[10px] text-gray-500 block mt-1"
                >
                  Còn lại: {{ row.remainingQuantity || 0 }} / {{ row.orderedQuantity || 0 }}
                </span>
              </template>
            </ElTableColumn>

            <ElTableColumn label="Đơn giá" width="180" align="center">
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

            <ElTableColumn label="Thuế suất (%)" width="120" align="center">
              <template #default="{ row }">
                <ElInputNumber
                  v-model="row.taxRate"
                  :min="0"
                  :max="100"
                  :precision="0"
                  class="w-full"
                  style="width: 100px"
                  controls-position="right"
                />
              </template>
            </ElTableColumn>

            <ElTableColumn label="Tổng tiền sau thuế" width="160" align="right">
              <template #default="{ row }">
                <span class="font-bold text-gray-800">
                  {{
                    formatCurrency(
                      (row.invoicedQuantity || 0) *
                        (row.unitPrice || 0) *
                        (1 + (row.taxRate || 0) / 100)
                    )
                  }}
                </span>
              </template>
            </ElTableColumn>

            <ElTableColumn label="Thao tác" width="80" align="center">
              <template #default="{ $index }">
                <ElTooltip content="Xóa dòng sản phẩm" placement="top">
                  <ElButton
                    circle
                    size="small"
                    type="danger"
                    :disabled="formData.items.length <= 1"
                    @click="handleRemoveItem($index)"
                  >
                    <ElIcon><Delete /></ElIcon>
                  </ElButton>
                </ElTooltip>
              </template>
            </ElTableColumn>
          </ElTable>

          <!-- Financial summary inside form -->
          <div
            class="mt-4 bg-gray-50 p-4 rounded-xl flex flex-col items-end gap-2 text-sm text-gray-600"
          >
            <div
              >Tổng tiền trước thuế:
              <span class="font-semibold text-gray-900">{{
                formatCurrency(formTotalBeforeTax)
              }}</span></div
            >
            <div
              >Tổng tiền thuế:
              <span class="font-semibold text-gray-900">{{
                formatCurrency(formTotalTax)
              }}</span></div
            >
            <div class="text-base border-t border-gray-200 pt-2 w-full text-right">
              Tổng cộng thanh toán:
              <span class="text-xl font-bold text-primary">{{ formatCurrency(formTotal) }}</span>
            </div>
          </div>
        </div>
      </ElForm>

      <template #footer>
        <div class="flex justify-end gap-2 border-t border-gray-50 pt-3">
          <ElButton class="!rounded-lg" @click="dialogVisible = false">Hủy bỏ</ElButton>
          <ElButton type="primary" class="!rounded-lg" :loading="submitting" @click="submitForm">
            Lưu hóa đơn
          </ElButton>
        </div>
      </template>
    </ElDialog>

    <!-- VIN Input Dialog for Invoice Items -->
    <ElDialog
      v-model="vinDialogVisible"
      title="Nhập định danh xe trên Hóa đơn"
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
              {{ getProductName(activeVinRow) }}
            </div>
            <div class="text-xs text-gray-500">
              Số lượng: {{ activeVinRow.invoicedQuantity || 0 }} xe · Đã nhập:
              {{ getCompletedVehicleIdentityCount(activeVinRow) }}/{{
                activeVinRow.invoicedQuantity || 0
              }}
            </div>
          </div>
          <ElTag type="warning">Quản lý theo VIN</ElTag>
        </div>

        <div class="vin-dialog-table">
          <ElTable :data="activeVinRow.vehicles" border size="small" class="w-full">
            <ElTableColumn label="#" type="index" width="56" align="center" />
            <ElTableColumn label="Số khung (VIN)" min-width="210">
              <template #default="{ row: vehicle }">
                <ElInput
                  v-model="vehicle.vinNumber"
                  placeholder="Nhập số khung"
                  :disabled="
                    vehicle.isLocked ||
                    !!(vehicle.inventoryReceiptInfoId || vehicle.inventoryReceiptItemId)
                  "
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="Số máy" min-width="210">
              <template #default="{ row: vehicle }">
                <ElInput
                  v-model="vehicle.engineNumber"
                  placeholder="Nhập số máy"
                  :disabled="
                    vehicle.isLocked ||
                    !!(vehicle.inventoryReceiptInfoId || vehicle.inventoryReceiptItemId)
                  "
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="Giá nhập (VNĐ)" min-width="180">
              <template #default="{ row: vehicle }">
                <ElInputNumber
                  v-model="vehicle.importPrice"
                  :min="0"
                  :controls="false"
                  placeholder="Nhập giá nhập..."
                  class="w-full"
                />
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

    <!-- Detail Dialog -->
    <ElDialog
      v-model="detailDialogVisible"
      title="Chi tiết Hóa đơn mua hàng"
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
            INV #{{ detailData.id }}
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
            <span class="text-gray-500 font-medium">Số hóa đơn:</span>
            <span class="ml-2 text-gray-900 font-bold font-mono">{{
              detailData.invoiceNumber || 'N/A'
            }}</span>
          </div>
          <div>
            <span class="text-gray-500 font-medium">Nhà cung cấp:</span>
            <span class="ml-2 text-gray-900 font-bold">{{ detailData.supplierName || 'N/A' }}</span>
          </div>
          <div>
            <span class="text-gray-500 font-medium">Liên kết Đơn mua hàng (PO):</span>
            <span class="ml-2 text-gray-800 font-semibold">
              {{ detailData.purchaseOrderId ? `Đơn mua #${detailData.purchaseOrderId}` : 'N/A' }}
            </span>
          </div>
          <div>
            <span class="text-gray-500 font-medium">Ngày hóa đơn:</span>
            <span class="ml-2 text-gray-800 font-medium">{{
              formatDate(detailData.invoiceDate)
            }}</span>
          </div>
          <div>
            <span class="text-gray-500 font-medium">Hạn thanh toán:</span>
            <span class="ml-2 text-gray-800 font-medium">{{ formatDate(detailData.dueDate) }}</span>
          </div>
          <div class="col-span-2 border-t border-gray-200/60 pt-3 grid grid-cols-2 gap-y-3">
            <div>
              <span class="text-gray-500 font-medium">Người lập hóa đơn:</span>
              <span class="ml-2 text-gray-800 font-medium">{{
                detailData.createdByName || 'N/A'
              }}</span>
            </div>
            <div v-if="detailData.approvedByName">
              <span class="text-gray-500 font-medium">Người phê duyệt:</span>
              <span class="ml-2 text-gray-800 font-semibold text-success">{{
                detailData.approvedByName
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
            Danh sách mặt hàng hóa đơn
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
                <span class="font-bold text-gray-800 block">{{
                  row.productVariantName || 'Sản phẩm không rõ'
                }}</span>
                <span class="text-[10px] text-gray-400 font-mono">{{ row.sku }}</span>
                <div v-if="row.colorName" class="mt-1">
                  <ElTag size="small" type="info" class="!rounded-md"
                    >Màu: {{ row.colorName }}</ElTag
                  >
                </div>
                <div
                  v-if="row.vehicles?.length"
                  class="flex flex-col gap-1 text-xs text-gray-600 mt-2"
                >
                  <div
                    v-for="vehicle in row.vehicles"
                    :key="vehicle.id || `${vehicle.vinNumber}-${vehicle.engineNumber}`"
                    class="rounded border border-gray-100 bg-gray-50 px-2.5 py-1"
                  >
                    <div
                      ><span class="text-gray-400">VIN:</span>
                      <span class="font-mono font-medium">{{ vehicle.vinNumber }}</span></div
                    >
                    <div
                      ><span class="text-gray-400">Số máy:</span>
                      <span class="font-mono font-medium">{{ vehicle.engineNumber }}</span></div
                    >
                    <div
                      ><span class="text-gray-400">Giá nhập:</span>
                      <span class="font-semibold text-gray-800">{{
                        formatCurrency(vehicle.importPrice)
                      }}</span></div
                    >
                  </div>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="invoicedQuantity" label="Số lượng" width="100" align="center" />
            <ElTableColumn label="Đơn giá" width="140" align="right">
              <template #default="{ row }">
                <span class="font-medium text-gray-700">{{ formatCurrency(row.unitPrice) }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Thuế (%)" width="100" align="center">
              <template #default="{ row }">
                <span>{{ row.taxRate }}%</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Thành tiền sau thuế" width="160" align="right">
              <template #default="{ row }">
                <span class="font-bold text-gray-900">{{
                  formatCurrency(
                    row.totalAmount ||
                      row.invoicedQuantity * row.unitPrice * (1 + row.taxRate / 100)
                  )
                }}</span>
              </template>
            </ElTableColumn>
          </ElTable>

          <!-- Total price in Detail -->
          <div
            class="mt-4 bg-gray-50 p-4 rounded-xl flex flex-col items-end gap-2 text-sm text-gray-600"
          >
            <div
              >Tổng tiền trước thuế:
              <span class="font-semibold text-gray-900">{{
                formatCurrency(detailData.totalAmountBeforeTax)
              }}</span></div
            >
            <div
              >Tổng tiền thuế:
              <span class="font-semibold text-gray-900">{{
                formatCurrency(detailData.totalTaxAmount)
              }}</span></div
            >
            <div class="text-base border-t border-gray-200 pt-2 w-full text-right">
              Tổng cộng thanh toán:
              <span class="text-2xl font-black text-primary">{{
                formatCurrency(detailData.totalAmount)
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2 border-t border-gray-50 pt-3">
          <ElButton class="!rounded-lg" @click="detailDialogVisible = false">Đóng</ElButton>

          <template
            v-if="
              detailData &&
              detailData.status?.toLowerCase() === 'draft' &&
              hasPermission('Permissions.InventoryReceipts.ApproveReject')
            "
          >
            <ElButton
              type="danger"
              class="!rounded-lg"
              @click="handleApproveReject(detailData.id, false)"
            >
              Từ chối duyệt
            </ElButton>
            <ElButton
              type="success"
              class="!rounded-lg"
              @click="handleApproveReject(detailData.id, true)"
            >
              Phê duyệt hóa đơn
            </ElButton>
          </template>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue'
  import { Plus, Edit, Delete, View, Check, Close } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { usePermission } from '@/hooks/core/usePermission'
  import { PurchaseInvoiceApi } from '@/api/purchase-invoice.api'
  import { PurchaseOrderApi } from '@/api/purchase-order.api'
  import type {
    PurchaseInvoice,
    PurchaseInvoiceItem
  } from '@/domain/inventory/purchase-invoice.types'

  defineOptions({ name: 'PurchaseInvoice' })

  const { hasPermission } = usePermission()

  const loading = ref(false)
  const dialogVisible = ref(false)
  const dialogTitle = ref('Tạo hóa đơn mua hàng')
  const submitting = ref(false)
  const isEdit = ref(false)

  const detailDialogVisible = ref(false)
  const detailData = ref<PurchaseInvoice | null>(null)

  const approvedPOs = ref<any[]>([])

  const data = ref<PurchaseInvoice[]>([])
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const statusMap = ref<Record<string, string>>({
    draft: 'Bản nháp',
    approved: 'Đã duyệt',
    rejected: 'Đã từ chối'
  })

  const searchForm = ref({
    status: [] as string[],
    invoiceNumber: ''
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
      key: 'invoiceNumber',
      label: 'Số hóa đơn',
      type: 'input',
      props: {
        placeholder: 'Nhập số hóa đơn...',
        clearable: true
      }
    }
  ])

  const columns = ref([
    { label: 'Ngày hóa đơn', prop: 'invoiceDate', useSlot: true, width: 140 },
    { label: 'Số hóa đơn', prop: 'invoiceNumber', useSlot: true, minWidth: 150 },
    { label: 'Nhà cung cấp', prop: 'supplierName', useSlot: true, minWidth: 200 },
    { label: 'Ghi chú', prop: 'note', minWidth: 180 },
    { label: 'Người lập', prop: 'createdByName', minWidth: 140 },
    {
      label: 'Tổng tiền sau thuế',
      prop: 'totalAmount',
      useSlot: true,
      width: 160,
      align: 'right' as const
    },
    { label: 'Trạng thái', prop: 'status', useSlot: true, width: 130, align: 'center' as const },
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

  const getProductName = (row: any) => {
    return row.productVariantName || row.productName || `Biến thể #${row.productVariantId}`
  }

  type VehicleIdentification = {
    id?: number
    vinNumber: string
    engineNumber: string
    importPrice?: number
    inventoryReceiptInfoId?: number
    inventoryReceiptItemId?: number
  }

  const vinDialogVisible = ref(false)
  const vinDialogRowIndex = ref<number | null>(null)
  const activeVinRow = computed(() => {
    if (vinDialogRowIndex.value === null) return null
    return formData.value.items[vinDialogRowIndex.value] ?? null
  })

  const createEmptyVehicle = (defaultPrice = 0): VehicleIdentification => ({
    vinNumber: '',
    engineNumber: '',
    importPrice: defaultPrice
  })

  const syncVehicleRows = (row: any) => {
    if (!row.needVin) {
      row.vehicles = undefined
      return
    }

    const targetCount = Math.max(Number(row.invoicedQuantity) || 0, 0)
    const currentVehicles = row.vehicles ?? []

    // Separate imported vs invoice-only
    const currentImported = currentVehicles.filter(
      (v: any) => v.inventoryReceiptInfoId != null || v.inventoryReceiptItemId != null
    )
    const currentInvoiceOnly = currentVehicles.filter(
      (v: any) => v.inventoryReceiptInfoId == null && v.inventoryReceiptItemId == null
    )

    const importedList = row.importedVehicles || []

    const newVehicles: any[] = []

    // 1. First populate from importedList up to targetCount
    for (let i = 0; i < importedList.length && newVehicles.length < targetCount; i++) {
      const imp = importedList[i]
      // Check if we already have this vehicle in currentImported to preserve its state/price
      const existing = currentImported.find(
        (v: any) =>
          v.inventoryReceiptInfoId === imp.inventoryReceiptInfoId || v.vinNumber === imp.vinNumber
      )
      newVehicles.push({
        id: existing?.id || imp.id || undefined,
        vinNumber: imp.vinNumber,
        engineNumber: imp.engineNumber,
        importPrice:
          existing !== undefined ? existing.importPrice : imp.importPrice || row.unitPrice || 0,
        inventoryReceiptInfoId: imp.inventoryReceiptInfoId || imp.id,
        inventoryReceiptItemId: imp.inventoryReceiptInfoId || imp.id,
        isLocked: imp.isLocked || existing?.isLocked || false
      })
    }

    // 2. If targetCount is not reached, populate with existing invoice-only vehicles
    for (let i = 0; i < currentInvoiceOnly.length && newVehicles.length < targetCount; i++) {
      newVehicles.push(currentInvoiceOnly[i])
    }

    // 3. If targetCount is still not reached, populate with new empty vehicles
    while (newVehicles.length < targetCount) {
      newVehicles.push(createEmptyVehicle(row.unitPrice || 0))
    }

    // 4. Trim if we have too many
    if (newVehicles.length > targetCount) {
      newVehicles.splice(targetCount)
    }

    row.vehicles = newVehicles
  }

  const handleInvoicedQuantityChange = (row: any) => {
    syncVehicleRows(row)
  }

  const getCompletedVehicleIdentityCount = (row: any) => {
    return (row.vehicles ?? []).filter(
      (vehicle: any) => vehicle.vinNumber?.trim() && vehicle.engineNumber?.trim()
    ).length
  }

  const getVehicleIdentityProgress = (row: any) => {
    return `${getCompletedVehicleIdentityCount(row)}/${row.invoicedQuantity || 0}`
  }

  const openVinDialog = (rowIndex: number) => {
    const row = formData.value.items[rowIndex]
    if (!row || !row.needVin) return
    syncVehicleRows(row)
    vinDialogRowIndex.value = rowIndex
    vinDialogVisible.value = true
  }

  const handleRemoveItem = (index: number) => {
    if (formData.value.items.length <= 1) {
      ElMessage.warning('Hóa đơn phải có ít nhất một sản phẩm')
      return
    }
    formData.value.items.splice(index, 1)
  }

  const formData = ref<{
    id?: number
    purchaseOrderId: number | undefined
    invoiceNumber: string
    invoiceDate: string
    dueDate?: string
    note: string
    items: PurchaseInvoiceItem[]
  }>({
    purchaseOrderId: undefined,
    invoiceNumber: '',
    invoiceDate: '',
    dueDate: undefined,
    note: '',
    items: []
  })

  // Computed properties for form aggregates
  const formTotalBeforeTax = computed(() => {
    return formData.value.items.reduce(
      (sum, item) => sum + (item.invoicedQuantity || 0) * (item.unitPrice || 0),
      0
    )
  })

  const formTotalTax = computed(() => {
    return formData.value.items.reduce(
      (sum, item) =>
        sum + (item.invoicedQuantity || 0) * (item.unitPrice || 0) * ((item.taxRate || 0) / 100),
      0
    )
  })

  const formTotal = computed(() => {
    return formTotalBeforeTax.value + formTotalTax.value
  })

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
      if (searchForm.value.invoiceNumber) {
        sieveFilters.push(`InvoiceNumber@=${searchForm.value.invoiceNumber}`)
      }

      const res = await PurchaseInvoiceApi.getList({
        current: pagination.current,
        size: pagination.size,
        Filters: sieveFilters.join(',') || undefined,
        Sorts: '-createdAt'
      })

      data.value = res.items || []
      pagination.total = res.totalCount || 0
    } catch (error) {
      console.error(error)
      ElMessage.error('Không thể tải danh sách hóa đơn mua hàng')
    } finally {
      loading.value = false
    }
  }

  const loadApprovedPOs = async () => {
    try {
      const res = await PurchaseOrderApi.getApprovedForInvoiceList({
        current: 1,
        size: 100
      })
      approvedPOs.value = res.items || []
    } catch (e) {
      console.error(e)
    }
  }

  const handlePurchaseOrderChange = async (poId?: number) => {
    if (!poId) return
    try {
      loading.value = true
      const poDetail = await PurchaseOrderApi.getApprovedForInvoiceById(poId, formData.value.id)
      formData.value.items = poDetail.items.map((item) => {
        const row = {
          purchaseOrderItemId: item.id,
          productVariantId: item.productVariantId,
          productVariantName: item.productName || `Biến thể sản phẩm #${item.productVariantId}`,
          colorName: item.productVariantColorName || '',
          productVariantColorId: item.productVariantColorId,
          invoicedQuantity: item.remainingQuantity || 0,
          unitPrice: item.unitPrice || 0,
          taxRate: 0, // Default tax rate
          needVin: item.needVin || false,
          remainingQuantity: item.remainingQuantity || 0,
          orderedQuantity: item.orderedQuantity || 0,
          importedVehicles: item.importedVehicles || [],
          vehicles: [] as any[]
        }
        syncVehicleRows(row)
        return row
      })
    } catch {
      ElMessage.error('Không thể tải sản phẩm từ Đơn mua hàng (PO)')
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
    searchForm.value.invoiceNumber = ''
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
    dialogTitle.value = 'Lập hóa đơn mua hàng mới'
    formData.value = {
      purchaseOrderId: undefined,
      invoiceNumber: '',
      invoiceDate: new Date().toISOString().substring(0, 10),
      dueDate: undefined,
      note: '',
      items: []
    }
    dialogVisible.value = true
  }

  const handleEdit = async (row: PurchaseInvoice) => {
    try {
      loading.value = true
      const detail = await PurchaseInvoiceApi.getById(row.id)
      isEdit.value = true
      dialogTitle.value = 'Chỉnh sửa hóa đơn mua hàng'

      let poDetail: any = null
      if (detail.purchaseOrderId) {
        try {
          poDetail = await PurchaseOrderApi.getApprovedForInvoiceById(
            detail.purchaseOrderId,
            detail.id
          )
        } catch (e) {
          console.error('Cannot load PO details for editing', e)
        }
      }
      const poItemsMap = poDetail ? new Map(poDetail.items.map((i: any) => [i.id, i])) : new Map()

      formData.value = {
        id: detail.id,
        purchaseOrderId: detail.purchaseOrderId,
        invoiceNumber: detail.invoiceNumber || '',
        invoiceDate: new Date(detail.invoiceDate).toISOString().substring(0, 10),
        dueDate: detail.dueDate
          ? new Date(detail.dueDate).toISOString().substring(0, 10)
          : undefined,
        note: detail.note || '',
        items: detail.items.map((i) => {
          const poItem: any = poItemsMap.get(i.purchaseOrderItemId)
          return {
            id: i.id,
            purchaseOrderItemId: i.purchaseOrderItemId,
            inventoryReceiptItemId: i.inventoryReceiptItemId,
            productVariantId: i.productVariantId,
            productVariantName: i.productVariantName,
            colorName: i.colorName,
            productVariantColorId: i.productVariantColorId,
            invoicedQuantity: i.invoicedQuantity,
            unitPrice: i.unitPrice,
            taxRate: i.taxRate,
            needVin: i.needVin || false,
            remainingQuantity: poItem ? poItem.remainingQuantity : i.invoicedQuantity,
            orderedQuantity: poItem ? poItem.orderedQuantity : i.invoicedQuantity,
            importedVehicles: poItem ? poItem.importedVehicles || [] : [],
            vehicles: i.vehicles
              ? i.vehicles.map((v: any) => ({
                  id: v.id,
                  vinNumber: v.vinNumber || '',
                  engineNumber: v.engineNumber || '',
                  importPrice: v.importPrice || 0,
                  inventoryReceiptInfoId: v.inventoryReceiptInfoId || v.inventoryReceiptItemId,
                  isLocked: v.isLocked || false
                }))
              : []
          }
        })
      }
      dialogVisible.value = true
    } catch {
      ElMessage.error('Không thể tải chi tiết hóa đơn chỉnh sửa')
    } finally {
      loading.value = false
    }
  }

  const handleDelete = async (row: PurchaseInvoice) => {
    try {
      await ElMessageBox.confirm(
        'Bạn có chắc chắn muốn xóa hóa đơn mua hàng này?',
        'Xác nhận xóa',
        {
          confirmButtonText: 'Xác nhận',
          cancelButtonText: 'Hủy bỏ',
          type: 'warning'
        }
      )
      await PurchaseInvoiceApi.delete(row.id)
      ElMessage.success('Xóa hóa đơn mua hàng thành công')
      loadData()
    } catch (e) {
      if (e !== 'cancel') {
        console.error(e)
        ElMessage.error('Xóa thất bại')
      }
    }
  }

  const handleViewDetail = async (row: PurchaseInvoice) => {
    try {
      loading.value = true
      const detail = await PurchaseInvoiceApi.getById(row.id)
      detailData.value = detail
      detailDialogVisible.value = true
    } catch {
      ElMessage.error('Không thể tải chi tiết hóa đơn')
    } finally {
      loading.value = false
    }
  }

  const handleApproveReject = async (id: number, isApproved: boolean) => {
    const actionText = isApproved ? 'phê duyệt' : 'từ chối'
    try {
      let note = ''
      if (!isApproved) {
        const promptRes = await ElMessageBox.prompt(
          'Vui lòng nhập lý do từ chối:',
          'Lý do từ chối',
          {
            confirmButtonText: 'Gửi từ chối',
            cancelButtonText: 'Hủy',
            inputPattern: /\S+/,
            inputErrorMessage: 'Lý do từ chối không được trống'
          }
        )
        note = promptRes.value
      } else {
        await ElMessageBox.confirm(
          `Bạn có chắc muốn phê duyệt hóa đơn mua hàng này? Thao tác này sẽ tự động lập công nợ nhà cung cấp.`,
          'Xác nhận phê duyệt',
          {
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Quay lại',
            type: 'success'
          }
        )
      }

      loading.value = true
      await PurchaseInvoiceApi.approveReject(id, isApproved, note)
      ElMessage.success(`Hóa đơn đã được ${actionText} thành công`)
      detailDialogVisible.value = false
      loadData()
    } catch (e) {
      if (e !== 'cancel') {
        console.error(e)
        ElMessage.error(`Thao tác ${actionText} thất bại`)
      }
    } finally {
      loading.value = false
    }
  }

  const submitForm = async () => {
    if (!formData.value.purchaseOrderId) {
      ElMessage.warning('Vui lòng chọn Đơn mua hàng (PO)')
      return
    }
    if (!formData.value.invoiceNumber.trim()) {
      ElMessage.warning('Vui lòng nhập Số hóa đơn')
      return
    }
    if (formData.value.items.length === 0) {
      ElMessage.warning('Danh sách sản phẩm không được rỗng')
      return
    }

    for (const item of formData.value.items) {
      if (!item.needVin) continue

      syncVehicleRows(item)
      const vehicles = item.vehicles ?? []
      if (vehicles.length !== item.invoicedQuantity) {
        ElMessage.warning('Số dòng định danh xe phải đúng bằng số lượng hóa đơn')
        return
      }

      const hasMissingRequiredCode = vehicles.some(
        (vehicle: any) => !vehicle.vinNumber?.trim() || !vehicle.engineNumber?.trim()
      )
      if (hasMissingRequiredCode) {
        ElMessage.warning('Vui lòng nhập đủ số khung (VIN) và số máy cho sản phẩm quản lý theo VIN')
        return
      }
    }

    submitting.value = true
    try {
      if (isEdit.value && formData.value.id) {
        await PurchaseInvoiceApi.update(formData.value.id, {
          invoiceNumber: formData.value.invoiceNumber,
          invoiceDate: formData.value.invoiceDate,
          dueDate: formData.value.dueDate,
          note: formData.value.note,
          items: formData.value.items.map((i) => ({
            id: i.id,
            purchaseOrderItemId: i.purchaseOrderItemId,
            inventoryReceiptItemId: i.inventoryReceiptItemId,
            productVariantId: i.productVariantId,
            productVariantColorId: i.productVariantColorId,
            invoicedQuantity: i.invoicedQuantity,
            unitPrice: i.unitPrice,
            taxRate: i.taxRate,
            vehicles: i.needVin
              ? i.vehicles?.map((v: any) => ({
                  id: v.id,
                  vinNumber: v.vinNumber.trim(),
                  engineNumber: v.engineNumber.trim(),
                  importPrice: v.importPrice || 0
                }))
              : undefined
          }))
        })
        ElMessage.success('Cập nhật hóa đơn mua hàng thành công')
      } else {
        await PurchaseInvoiceApi.create({
          purchaseOrderId: formData.value.purchaseOrderId,
          invoiceNumber: formData.value.invoiceNumber,
          invoiceDate: formData.value.invoiceDate,
          dueDate: formData.value.dueDate,
          note: formData.value.note,
          items: formData.value.items.map((i) => ({
            purchaseOrderItemId: i.purchaseOrderItemId,
            inventoryReceiptItemId: i.inventoryReceiptItemId,
            productVariantId: i.productVariantId,
            productVariantColorId: i.productVariantColorId,
            invoicedQuantity: i.invoicedQuantity,
            unitPrice: i.unitPrice,
            taxRate: i.taxRate,
            vehicles: i.needVin
              ? i.vehicles?.map((v: any) => ({
                  vinNumber: v.vinNumber.trim(),
                  engineNumber: v.engineNumber.trim(),
                  importPrice: v.importPrice || 0
                }))
              : undefined
          }))
        })
        ElMessage.success('Lập hóa đơn mua hàng thành công')
      }
      dialogVisible.value = false
      loadData()
    } catch (e) {
      console.error(e)
      ElMessage.error('Lưu hóa đơn thất bại')
    } finally {
      submitting.value = false
    }
  }

  onMounted(() => {
    loadData()
    loadApprovedPOs()
  })
</script>

<style scoped></style>
