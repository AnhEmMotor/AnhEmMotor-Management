<template>
  <div class="flex flex-col gap-4 pb-5">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ArtStatsCard
        title="Tổng xe nhập tháng"
        :count="stats.totalVehicles"
        description="Số lượng xe máy đã định danh"
        icon="ri:motorbike-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        title="Đang xử lý"
        :count="stats.processingReceipts"
        description="Phiếu nhập ở trạng thái nháp/tạm"
        icon="ri:time-line"
        iconStyle="bg-warning"
      />
      <ArtStatsCard
        title="Giá trị nhập kho"
        :count="formatCurrency(stats.totalValue)"
        description="Tổng giá vốn nhập hàng"
        icon="ri:money-dollar-circle-line"
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
          <ElButton type="primary" v-ripple @click="handleAdd" v-auth="Permissions.InputsCreate">
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

        <template #totalPayable="{ row }">
          <span class="font-medium text-gray-700">{{ formatCurrency(row.totalPayable) }}</span>
        </template>

        <template #productSummary="{ row }">
          <div class="text-xs text-gray-500 max-w-[300px] truncate">
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
            <ElTooltip v-if="isEditable(row.statusId)" content="Chỉnh sửa" placement="top">
              <ElButton
                circle
                size="small"
                type="primary"
                @click="handleEdit(row)"
                v-auth="Permissions.InputsEdit"
              >
                <ElIcon><Edit /></ElIcon>
              </ElButton>
            </ElTooltip>
            <ElTooltip v-if="isEditable(row.statusId)" content="Xóa" placement="top">
              <ElButton
                circle
                size="small"
                type="danger"
                @click="handleDelete(row)"
                v-auth="Permissions.InputsDelete"
              >
                <ElIcon><Delete /></ElIcon>
              </ElButton>
            </ElTooltip>
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <!-- Dialog Thêm/Sửa Phiếu Nhập -->
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
            <ElSelect
              v-model="formData.supplierId"
              placeholder="Chọn nhà cung cấp..."
              class="w-full"
              filterable
            >
              <ElOption
                v-for="sup in suppliersList"
                :key="sup.id"
                :label="sup.name"
                :value="sup.id"
              />
            </ElSelect>
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
            <ElButton type="success" size="small" plain @click="handleAddProductRow">
              <ElIcon class="mr-1"><Plus /></ElIcon> Thêm dòng sản phẩm
            </ElButton>
          </div>

          <ElTable :data="formData.products" border size="small" class="w-full">
            <ElTableColumn label="Sản phẩm" required>
              <template #default="{ row }">
                <ElSelect
                  v-model="row.productId"
                  placeholder="Chọn sản phẩm..."
                  filterable
                  class="w-full"
                >
                  <ElOption
                    v-for="prod in productsList"
                    :key="prod.id"
                    :label="`${prod.name} (${prod.sku || 'N/A'})`"
                    :value="prod.id"
                  />
                </ElSelect>
              </template>
            </ElTableColumn>

            <ElTableColumn label="Số lượng" width="150" align="center">
              <template #default="{ row }">
                <ElInputNumber
                  v-model="row.count"
                  :min="1"
                  :precision="0"
                  class="w-full"
                  controls-position="right"
                />
              </template>
            </ElTableColumn>

            <ElTableColumn label="Đơn giá nhập" width="180" align="center">
              <template #default="{ row }">
                <ElInputNumber
                  v-model="row.inputPrice"
                  :min="0"
                  :step="100000"
                  class="w-full"
                  controls-position="right"
                />
              </template>
            </ElTableColumn>

            <ElTableColumn label="Thành tiền" width="160" align="right">
              <template #default="{ row }">
                <span class="font-medium text-gray-700">
                  {{ formatCurrency((row.count || 0) * (row.inputPrice || 0)) }}
                </span>
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
            <span class="text-lg font-bold text-primary">{{ formatCurrency(totalAmount) }}</span>
          </div>
        </div>
      </ElForm>

      <template #footer>
        <div class="flex justify-end gap-2 border-t border-gray-50 pt-3">
          <ElButton @click="dialogVisible = false">Hủy</ElButton>

          <template v-if="isEdit">
            <ElButton type="warning" :loading="submitting" @click="submitForm('working')">
              Lưu nháp
            </ElButton>
            <ElButton type="success" :loading="submitting" @click="submitForm('finished')">
              Hoàn thành
            </ElButton>
            <ElButton type="danger" :loading="submitting" @click="submitForm('cancelled')">
              Hủy phiếu
            </ElButton>
          </template>

          <template v-else>
            <ElButton type="primary" :loading="submitting" @click="submitForm('working')">
              Lưu phiếu
            </ElButton>
          </template>
        </div>
      </template>
    </ElDialog>

    <!-- Dialog Chi Tiết Phiếu Nhập -->
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
          <div class="col-span-2">
            <span class="text-gray-500">Nhà cung cấp:</span>
            <span class="ml-2 font-medium text-gray-800">{{
              detailData.supplierName || 'N/A'
            }}</span>
          </div>
          <div v-if="detailData.supplierPhone">
            <span class="text-gray-500">Điện thoại NCC:</span>
            <span class="ml-2 text-gray-700">{{ detailData.supplierPhone }}</span>
          </div>
          <div v-if="detailData.supplierEmail">
            <span class="text-gray-500">Email NCC:</span>
            <span class="ml-2 text-gray-700">{{ detailData.supplierEmail }}</span>
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
            <ElTableColumn prop="name" label="Tên sản phẩm" minWidth="200" />
            <ElTableColumn prop="quantity" label="Số lượng" width="100" align="center" />
            <ElTableColumn prop="importPrice" label="Đơn giá nhập" width="160" align="right">
              <template #default="{ row }">
                <span>{{ formatCurrency(row.importPrice) }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Thành tiền" width="180" align="right">
              <template #default="{ row }">
                <span class="font-medium text-gray-800">
                  {{ formatCurrency((row.quantity || 0) * (row.importPrice || 0)) }}
                </span>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>

        <div class="flex justify-end items-center gap-2 text-right mt-2">
          <span class="text-gray-500 text-sm">Tổng cộng tiền thanh toán:</span>
          <span class="text-xl font-bold text-primary">{{
            formatCurrency(detailData.totalPayable)
          }}</span>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2 border-t border-gray-50 pt-3">
          <ElButton @click="detailDialogVisible = false">Đóng</ElButton>

          <template v-if="detailData">
            <!-- If receipt is working, we can update notes and change status -->
            <template v-if="isEditable(detailData.statusId)">
              <ElButton
                type="warning"
                :loading="detailSubmitting"
                @click="handleUpdateDetailStatus('working')"
              >
                Lưu tạm
              </ElButton>
              <ElButton
                type="success"
                :loading="detailSubmitting"
                @click="handleUpdateDetailStatus('finished')"
              >
                Hoàn thành
              </ElButton>
              <ElButton
                type="danger"
                :loading="detailSubmitting"
                @click="handleUpdateDetailStatus('cancelled')"
              >
                Hủy phiếu
              </ElButton>
            </template>

            <!-- If receipt is finished or cancelled, status changes are blocked, only save notes -->
            <template v-else>
              <ElButton type="primary" :loading="detailSubmitting" @click="handleUpdateDetailNotes">
                Cập nhật ghi chú
              </ElButton>
            </template>
          </template>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue'
  import { Plus, Edit, Delete, View } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { InventoryReceiptApi } from '@/api/inventory-receipt.api'
  import { SupplierApi } from '@/api/supplier.api'
  import { ProductApi } from '@/api/product/product.api'
  import { Permissions } from '@/domain/constants/permissions'
  import type { InventoryReceipt, InputInfo } from '@/domain/inventory/receipt.types'
  import type { Supplier } from '@/domain/supplier/supplier.types'
  import type { Product } from '@/domain/product/product.types'

  defineOptions({ name: 'InventoryInput' })

  // States
  const loading = ref(false)
  const dialogVisible = ref(false)
  const dialogTitle = ref('Tạo phiếu nhập mới')
  const submitting = ref(false)
  const isEdit = ref(false)

  // Details dialog states
  const detailDialogVisible = ref(false)
  const detailData = ref<InventoryReceipt | null>(null)
  const detailNotes = ref('')
  const detailSubmitting = ref(false)

  // Static/Calculated dashboard metrics
  const stats = ref({
    totalVehicles: 0,
    processingReceipts: 0,
    totalValue: 0
  })

  // Dropdown Lists
  const suppliersList = ref<Supplier[]>([])
  const productsList = ref<Product[]>([])
  const statuses = ref<Record<string, string>>({})

  // Form Data
  const formData = ref<{
    id?: number
    supplierId: number | undefined
    notes: string
    statusId: string
    products: Array<{
      id?: number
      productId: number | undefined
      count: number
      inputPrice: number
    }>
  }>({
    supplierId: undefined,
    notes: '',
    statusId: 'working',
    products: []
  })

  // Table Data & Paging
  const data = ref<InventoryReceipt[]>([])
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // Search items definition (Removed Mã phiếu filter)
  const searchForm = ref({
    supplierName: ''
  })

  const searchItems = [
    {
      key: 'supplierName',
      label: 'Nhà cung cấp',
      type: 'input',
      props: { placeholder: 'Tìm theo tên nhà cung cấp...' }
    }
  ]

  // Columns definition (Removed Mã phiếu, added STT)
  const columns = ref([
    { label: 'STT', type: 'index' as const, width: 70, align: 'center' },
    { label: 'Thời gian tạo', prop: 'createdAt', useSlot: true, width: 170 },
    { label: 'Nhà cung cấp', prop: 'supplierName', minWidth: 180 },
    { label: 'Tóm tắt SP', prop: 'productSummary', useSlot: true, minWidth: 200 },
    { label: 'Tổng tiền', prop: 'totalPayable', useSlot: true, width: 150, align: 'right' },
    { label: 'Trạng thái', prop: 'statusId', useSlot: true, width: 130, align: 'center' },
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

  // Computed total payable for form
  const totalAmount = computed(() => {
    return formData.value.products.reduce(
      (sum, row) => sum + (row.count || 0) * (row.inputPrice || 0),
      0
    )
  })

  // Editable rule
  const isEditable = (statusId?: string) => {
    return statusId === 'working'
  }

  // Formatting helpers
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

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '0 đ'
    return val.toLocaleString('vi-VN') + ' đ'
  }

  const getStatusLabel = (statusId?: string) => {
    if (!statusId) return '-'
    return statuses.value[statusId] || statusId
  }

  const getStatusTagType = (statusId?: string) => {
    if (!statusId) return 'info'
    switch (statusId.toLowerCase()) {
      case 'working':
        return 'warning'
      case 'finished':
        return 'success'
      case 'cancelled':
        return 'danger'
      default:
        return 'info'
    }
  }

  const getProductSummaryText = (products?: InputInfo[]) => {
    if (!products || products.length === 0) return 'Không có sản phẩm'
    return products.map((p) => `${p.name} (SL: ${p.quantity})`).join(', ')
  }

  // Load backend configuration & list data
  const loadStatuses = async () => {
    try {
      statuses.value = await InventoryReceiptApi.getStatuses()
    } catch (error) {
      console.error('Failed to load statuses:', error)
      statuses.value = {
        working: 'Phiếu tạm',
        finished: 'Hoàn thành',
        cancelled: 'Đã hủy'
      }
    }
  }

  const loadSuppliers = async () => {
    try {
      const res = await SupplierApi.getList({ current: 1, size: 200 })
      suppliersList.value = res.items || []
    } catch (error) {
      console.error('Failed to load suppliers:', error)
    }
  }

  const loadProducts = async () => {
    try {
      const res = await ProductApi.getList({ current: 1, size: 1000 })
      productsList.value = res.items || []
    } catch (error) {
      console.error('Failed to load products:', error)
    }
  }

  const loadStats = () => {
    let totalVal = 0
    let workingCount = 0
    let vehicleQty = 0

    data.value.forEach((receipt) => {
      totalVal += receipt.totalPayable || 0
      if (receipt.statusId === 'working') {
        workingCount++
      }
      if (receipt.products) {
        receipt.products.forEach((p) => {
          vehicleQty += p.quantity || 0
        })
      }
    })

    stats.value = {
      totalVehicles: vehicleQty,
      processingReceipts: workingCount,
      totalValue: totalVal
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

      const params = {
        current: pagination.current,
        size: pagination.size,
        Filters: sieveFilters.join(',') || undefined,
        Sorts: '-createdAt'
      }

      const res = await InventoryReceiptApi.getList(params)
      data.value = res.items || []
      pagination.total = res.totalCount || 0
      loadStats()
    } catch (error) {
      console.error('Failed to load inventory receipts:', error)
      ElMessage.error('Không thể tải danh sách phiếu nhập kho')
    } finally {
      loading.value = false
    }
  }

  // Handlers
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

  // Row actions
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
      supplierId: undefined,
      notes: '',
      statusId: 'working',
      products: []
    }
    handleAddProductRow()
    dialogVisible.value = true
  }

  const handleEdit = async (row: InventoryReceipt) => {
    try {
      loading.value = true
      const receipt = await InventoryReceiptApi.getById(row.id)
      isEdit.value = true
      dialogTitle.value = 'Cập nhật phiếu nhập'
      formData.value = {
        id: receipt.id,
        supplierId: receipt.supplierId,
        notes: receipt.notes || '',
        statusId: receipt.statusId,
        products: (receipt.products || []).map((p) => ({
          id: p.id,
          productId: p.productId,
          count: p.quantity || 1,
          inputPrice: p.importPrice || 0
        }))
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
        `Bạn có chắc chắn muốn xóa phiếu nhập của nhà cung cấp "${row.supplierName}" tạo ngày ${formatDateTime(row.createdAt)}?`,
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

  // Details dialog actions
  const handleUpdateDetailStatus = async (statusId: string) => {
    if (!detailData.value) return
    detailSubmitting.value = true
    try {
      // 1. Update notes
      await InventoryReceiptApi.updateNotes(detailData.value.id, detailNotes.value)
      // 2. Update status
      await InventoryReceiptApi.updateStatus(detailData.value.id, statusId)
      ElMessage.success('Cập nhật phiếu nhập thành công')
      detailDialogVisible.value = false
      loadData()
    } catch (error: any) {
      console.error('Failed to update details status:', error)
      ElMessage.error(error.message || 'Cập nhật thất bại')
    } finally {
      detailSubmitting.value = false
    }
  }

  const handleUpdateDetailNotes = async () => {
    if (!detailData.value) return
    detailSubmitting.value = true
    try {
      await InventoryReceiptApi.updateNotes(detailData.value.id, detailNotes.value)
      ElMessage.success('Cập nhật ghi chú thành công')
      detailDialogVisible.value = false
      loadData()
    } catch (error: any) {
      console.error('Failed to update notes:', error)
      ElMessage.error(error.message || 'Cập nhật thất bại')
    } finally {
      detailSubmitting.value = false
    }
  }

  // Row products table handlers
  const handleAddProductRow = () => {
    formData.value.products.push({
      productId: undefined,
      count: 1,
      inputPrice: 0
    })
  }

  const handleRemoveProductRow = (index: number) => {
    if (formData.value.products.length <= 1) {
      ElMessage.warning('Phiếu nhập phải chứa ít nhất một sản phẩm')
      return
    }
    formData.value.products.splice(index, 1)
  }

  // Submit
  const submitForm = async (statusId: string) => {
    if (!formData.value.supplierId) {
      ElMessage.warning('Vui lòng chọn nhà cung cấp')
      return
    }

    const validProducts = formData.value.products.filter(
      (p) => p.productId !== undefined && p.productId !== null
    )

    if (validProducts.length === 0) {
      ElMessage.warning('Vui lòng thêm ít nhất một sản phẩm hợp lệ')
      return
    }

    submitting.value = true
    try {
      const payloadProducts = validProducts.map((p) => ({
        id: p.id,
        productId: p.productId!,
        count: p.count,
        inputPrice: p.inputPrice
      }))

      if (isEdit.value && formData.value.id) {
        const payload = {
          notes: formData.value.notes,
          statusId: statusId,
          supplierId: formData.value.supplierId,
          products: payloadProducts
        }
        await InventoryReceiptApi.update(formData.value.id, payload)
        ElMessage.success('Cập nhật phiếu nhập thành công')
      } else {
        const payload = {
          notes: formData.value.notes,
          statusId: 'working', // Initial creation status is always working
          supplierId: formData.value.supplierId,
          products: payloadProducts.map(({ productId, count, inputPrice }) => ({
            productId,
            count,
            inputPrice
          }))
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

  // Lifecycle
  onMounted(async () => {
    loading.value = true
    await Promise.all([loadStatuses(), loadSuppliers(), loadProducts()])
    await loadData()
  })
</script>

<style scoped>
  :deep(.el-table) {
    --el-table-header-bg-color: var(--el-fill-color-light);
  }
</style>
