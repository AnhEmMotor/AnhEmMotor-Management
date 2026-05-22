<template>
  <div class="flex flex-col gap-4 pb-5">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <ArtStatsCard
        title="Tổng phiếu"
        :count="pagination.total"
        icon="ri:file-list-3-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        title="Chờ xử lý"
        :count="pendingCount"
        icon="ri:time-line"
        iconStyle="bg-warning"
      />
      <ArtStatsCard
        title="Hoàn tất"
        :count="completedCount"
        icon="ri:checkbox-circle-line"
        iconStyle="bg-success"
      />
      <ArtStatsCard
        title="Doanh thu trang"
        :count="formatCurrency(pageRevenue)"
        icon="ri:money-dollar-circle-line"
        iconStyle="bg-info"
      />
    </div>

    <ArtSearchBar
      v-model="searchForm"
      :items="searchItems"
      :label-width="110"
      :span="8"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="flex-1 art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="fetchOrders">
        <template #left>
          <ElButton type="primary" v-ripple @click="handleAdd" v-auth="Permissions.OutputsCreate">
            <ElIcon class="mr-1"><Plus /></ElIcon> Tạo phiếu bán
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="orders"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #createdAt="{ row }">
          {{ formatDateTime(row.createdAt) }}
        </template>
        <template #customer="{ row }">
          <div class="flex flex-col">
            <span class="font-medium text-gray-800">{{
              row.customerName || row.buyerName || '---'
            }}</span>
            <span class="text-xs text-gray-500">{{
              row.customerPhone || row.buyerEmail || '---'
            }}</span>
          </div>
        </template>
        <template #statusId="{ row }">
          <ElTag :type="getStatusTagType(row.statusId)" size="small">
            {{ getStatusLabel(row.statusId) }}
          </ElTag>
        </template>
        <template #total="{ row }">
          <span class="font-semibold text-gray-800">{{ formatCurrency(row.total || 0) }}</span>
        </template>
        <template #operation="{ row }">
          <div class="flex gap-2 justify-center">
            <ElTooltip content="Xem / chỉnh sửa" placement="top">
              <ElButton
                circle
                size="small"
                type="primary"
                @click="handleEdit(row)"
                v-auth="Permissions.OutputsEdit"
              >
                <ElIcon><Edit /></ElIcon>
              </ElButton>
            </ElTooltip>
            <ElTooltip content="Xóa phiếu" placement="top">
              <ElButton
                circle
                size="small"
                type="danger"
                @click="handleDelete(row)"
                v-auth="Permissions.OutputsDelete"
              >
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
      width="980px"
      append-to-body
      destroy-on-close
      class="rounded-xl overflow-hidden"
    >
      <ElForm ref="formRef" :model="formData" label-width="130px" class="mt-3">
        <ElAlert
          v-if="lockedHint"
          :title="lockedHint"
          type="warning"
          show-icon
          :closable="false"
          class="mb-4"
        />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <ElFormItem label="Khách hàng" required class="md:col-span-2">
            <ElSelect
              v-model="formData.buyerId"
              filterable
              remote
              clearable
              :remote-method="searchCustomers"
              :loading="customerLoading"
              placeholder="Tìm theo tên, email hoặc số điện thoại"
              class="w-full"
              :disabled="isBuyerProductLocked"
              @change="handleCustomerChange"
            >
              <ElOption
                v-for="item in customerOptions"
                :key="item.id"
                :label="getCustomerLabel(item)"
                :value="item.id"
              />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="Người nhận" required>
            <ElInput v-model="formData.customerName" :disabled="isDeliveryInfoLocked" />
          </ElFormItem>
          <ElFormItem label="Số điện thoại" required>
            <ElInput v-model="formData.customerPhone" :disabled="isDeliveryInfoLocked" />
          </ElFormItem>
          <ElFormItem label="Địa chỉ giao hàng" required class="md:col-span-2">
            <ElInput v-model="formData.customerAddress" :disabled="isDeliveryInfoLocked" />
          </ElFormItem>

          <ElFormItem v-if="editingOrder" label="Trạng thái">
            <ElSelect v-model="formData.statusId" class="w-full">
              <ElOption
                v-for="status in allowedStatusOptions"
                :key="status.id"
                :label="status.name"
                :value="status.id"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="Tỷ lệ đặt cọc">
            <ElInputNumber
              v-model="formData.depositRatio"
              :min="0"
              :max="100"
              :precision="0"
              class="w-full"
              :disabled="isDepositRatioLocked"
            />
          </ElFormItem>
        </div>

        <div class="border-t border-gray-100 pt-4 mt-2">
          <div class="flex justify-between items-center mb-3">
            <span class="text-sm font-semibold text-gray-700">Sản phẩm bán ra</span>
            <ElButton
              type="success"
              size="small"
              plain
              @click="addProductRow"
              :disabled="isBuyerProductLocked"
            >
              <ElIcon class="mr-1"><Plus /></ElIcon> Thêm sản phẩm
            </ElButton>
          </div>

          <ElTable :data="formData.products" border size="small" class="w-full">
            <ElTableColumn label="Sản phẩm">
              <template #default="{ row }">
                <ElSelect
                  v-model="row.productVarientId"
                  filterable
                  remote
                  :remote-method="searchProducts"
                  :loading="productLoading"
                  placeholder="Tìm sản phẩm"
                  class="w-full"
                  :disabled="isBuyerProductLocked"
                  @change="(id: number) => handleProductChange(row, id)"
                >
                  <ElOption
                    v-for="item in productOptions"
                    :key="item.id"
                    :label="item.displayName"
                    :value="item.id"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <span class="truncate">{{ item.displayName }}</span>
                      <span class="text-xs text-gray-500">{{
                        formatCurrency(item.price || 0)
                      }}</span>
                    </div>
                  </ElOption>
                </ElSelect>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Màu" width="180">
              <template #default="{ row }">
                <ElSelect
                  v-model="row.productVarientColorId"
                  clearable
                  placeholder="Không chọn"
                  class="w-full"
                  :disabled="isBuyerProductLocked || !getProductColors(row).length"
                >
                  <ElOption
                    v-for="color in getProductColors(row)"
                    :key="color.id"
                    :label="color.colorName || color.colorCode || `Màu #${color.id}`"
                    :value="color.id"
                  />
                </ElSelect>
              </template>
            </ElTableColumn>
            <ElTableColumn label="SL" width="130" align="center">
              <template #default="{ row }">
                <ElInputNumber
                  v-model="row.count"
                  :min="1"
                  :precision="0"
                  controls-position="right"
                  class="w-full"
                  :disabled="isBuyerProductLocked"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn label="Đơn giá" width="150" align="right">
              <template #default="{ row }">
                {{ formatCurrency(row.price || 0) }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="Thành tiền" width="160" align="right">
              <template #default="{ row }">
                <span class="font-medium">{{
                  formatCurrency((row.count || 0) * (row.price || 0))
                }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Thao tác" width="100" align="center">
              <template #default="{ $index }">
                <ElButton
                  circle
                  type="danger"
                  size="small"
                  plain
                  :disabled="isBuyerProductLocked"
                  @click="removeProductRow($index)"
                >
                  <ElIcon><Delete /></ElIcon>
                </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>

        <ElFormItem label="Ghi chú" class="mt-4">
          <ElInput
            v-model="formData.notes"
            type="textarea"
            :rows="3"
            placeholder="Ghi chú nội bộ hoặc yêu cầu giao hàng"
            :disabled="isNotesLocked"
          />
        </ElFormItem>

        <div class="bg-gray-50 rounded-lg p-4 flex flex-col gap-2 text-sm">
          <div class="flex justify-between">
            <span>Tạm tính</span>
            <span class="font-semibold">{{ formatCurrency(formTotal) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Tiền đặt cọc</span>
            <span>{{ formatCurrency(depositAmount) }}</span>
          </div>
          <div
            class="flex justify-between text-base text-primary font-bold border-t border-gray-200 pt-2"
          >
            <span>Còn lại</span>
            <span>{{ formatCurrency(remainingAmount) }}</span>
          </div>
        </div>
      </ElForm>

      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="dialogVisible = false">Hủy</ElButton>
          <ElButton type="primary" :loading="saving" @click="handleSubmit">
            {{ editingOrder ? 'Lưu phiếu' : 'Tạo phiếu' }}
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref } from 'vue'
  import { Delete, Edit, Plus } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { SalesOrderApi } from '@/api/sales-order.api'
  import { ProductApi } from '@/api/product/product.api'
  import { fetchGetUserList } from '@/api/system-manage'
  import { Permissions } from '@/domain/constants/permissions'
  import type { SalesOrder } from '@/domain/order/order.types'
  import type { ProductVariantLiteForInput } from '@/domain/product/product.types'
  import type { ColumnOption } from '@/types/component'

  type StatusOption = { id: string; name: string }
  type CustomerOption = {
    id: string
    fullName?: string
    name?: string
    email?: string
    phoneNumber?: string
    address?: string
  }
  type OrderFormProduct = {
    id?: number
    productVarientId?: number
    productVarientColorId?: number
    productName?: string
    count: number
    price?: number
    coverImageUrl?: string
  }

  const loading = ref(false)
  const saving = ref(false)
  const orders = ref<SalesOrder[]>([])
  const statuses = ref<Record<string, string>>({})
  const statusMap = ref<StatusOption[]>([])
  const transitionMap = ref<Record<string, string[]>>({})
  const lockedStatuses = ref<any>({})
  const customerOptions = ref<CustomerOption[]>([])
  const productOptions = ref<ProductVariantLiteForInput[]>([])
  const customerLoading = ref(false)
  const productLoading = ref(false)
  const dialogVisible = ref(false)
  const editingOrder = ref<SalesOrder | null>(null)
  const originalStatusId = ref<string>('')

  const searchForm = reactive({
    search: '',
    statusId: ''
  })

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const formData = reactive({
    buyerId: '',
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    statusId: 'pending',
    depositRatio: 0,
    notes: '',
    products: [] as OrderFormProduct[]
  })

  const searchItems = computed(() => [
    {
      label: 'Từ khóa',
      key: 'search',
      type: 'input',
      props: { clearable: true, placeholder: 'Tên, email, SĐT hoặc ghi chú' }
    },
    {
      label: 'Trạng thái',
      key: 'statusId',
      type: 'select',
      props: {
        clearable: true,
        placeholder: 'Tất cả',
        options: statusMap.value.map((item) => ({ label: item.name, value: item.id }))
      }
    }
  ])

  const columnChecks = ref<ColumnOption[]>([
    { prop: 'id', label: 'Mã phiếu', width: 90, checked: true },
    { prop: 'createdAt', label: 'Thời gian', width: 170, checked: true },
    { prop: 'customer', label: 'Khách hàng', minWidth: 220, checked: true },
    { prop: 'notes', label: 'Ghi chú', minWidth: 220, checked: true },
    { prop: 'statusId', label: 'Trạng thái', width: 170, checked: true },
    { prop: 'total', label: 'Tổng tiền', width: 160, checked: true },
    { prop: 'operation', label: 'Thao tác', width: 130, fixed: 'right' as const, checked: true }
  ])

  const columns = computed(() => columnChecks.value.filter((item) => item.checked))
  const dialogTitle = computed(() =>
    editingOrder.value ? 'Sửa phiếu bán hàng' : 'Tạo phiếu bán hàng'
  )
  const pendingCount = computed(
    () => orders.value.filter((item) => item.statusId === 'pending').length
  )
  const completedCount = computed(
    () => orders.value.filter((item) => item.statusId === 'completed').length
  )
  const pageRevenue = computed(() =>
    orders.value.reduce((sum, item) => sum + Number(item.total || 0), 0)
  )
  const formTotal = computed(() =>
    formData.products.reduce(
      (sum, item) => sum + Number(item.count || 0) * Number(item.price || 0),
      0
    )
  )
  const depositAmount = computed(() =>
    Math.round(formTotal.value * (Number(formData.depositRatio || 0) / 100))
  )
  const remainingAmount = computed(() => formTotal.value - depositAmount.value)

  const isBuyerProductLocked = computed(() =>
    getLockedList('buyerAndProducts').includes(originalStatusId.value)
  )
  const isDeliveryInfoLocked = computed(() =>
    getLockedList('deliveryInfo').includes(originalStatusId.value)
  )
  const isNotesLocked = computed(() => getLockedList('notes').includes(originalStatusId.value))
  const isDepositRatioLocked = computed(() =>
    getLockedList('depositRatio').includes(originalStatusId.value)
  )
  const lockedHint = computed(() => {
    if (!editingOrder.value) return ''
    if (!isBuyerProductLocked.value && !isDeliveryInfoLocked.value && !isNotesLocked.value)
      return ''
    return `Phiếu đang ở trạng thái ${getStatusLabel(originalStatusId.value)}, một số trường đã bị khóa theo backend.`
  })
  const allowedStatusOptions = computed(() => {
    if (!editingOrder.value) return statusMap.value
    const current = originalStatusId.value
    const allowed = transitionMap.value[current] || []
    return statusMap.value.filter((item) => item.id === current || allowed.includes(item.id))
  })

  onMounted(async () => {
    await Promise.all([fetchStatuses(), fetchOrders(), searchCustomers(''), searchProducts('')])
  })

  async function fetchStatuses() {
    const [statusRes, statusMapRes, transitionRes, lockedRes] = await Promise.all([
      SalesOrderApi.getStatuses(),
      SalesOrderApi.getStatusMap(),
      SalesOrderApi.getTransitionMap(),
      SalesOrderApi.getLockedStatuses()
    ])
    statuses.value = statusRes || {}
    statusMap.value = statusMapRes || []
    transitionMap.value = transitionRes || {}
    lockedStatuses.value = lockedRes || {}
  }

  async function fetchOrders() {
    loading.value = true
    try {
      const filters: string[] = []
      if (searchForm.statusId) filters.push(`StatusId==${searchForm.statusId}`)
      const res = await SalesOrderApi.getList({
        current: pagination.current,
        size: pagination.size,
        Filters: filters.join('|') || undefined,
        Search: searchForm.search || undefined,
        Sorts: '-CreatedAt'
      })
      orders.value = res.items || []
      pagination.total = res.totalCount || 0
    } finally {
      loading.value = false
    }
  }

  function handleSearch() {
    pagination.current = 1
    fetchOrders()
  }

  function handleReset() {
    searchForm.search = ''
    searchForm.statusId = ''
    handleSearch()
  }

  function handleSizeChange(size: number) {
    pagination.size = size
    fetchOrders()
  }

  function handleCurrentChange(current: number) {
    pagination.current = current
    fetchOrders()
  }

  function handleAdd() {
    editingOrder.value = null
    originalStatusId.value = ''
    resetForm()
    dialogVisible.value = true
  }

  async function handleEdit(row: SalesOrder) {
    loading.value = true
    try {
      const detail = await SalesOrderApi.getById(row.id)
      editingOrder.value = detail
      originalStatusId.value = detail.statusId || 'pending'
      fillForm(detail)
      dialogVisible.value = true
    } finally {
      loading.value = false
    }
  }

  async function handleDelete(row: SalesOrder) {
    await ElMessageBox.confirm(`Xóa phiếu bán #${row.id}?`, 'Xác nhận', { type: 'warning' })
    await SalesOrderApi.delete(row.id)
    ElMessage.success('Đã xóa phiếu bán')
    fetchOrders()
  }

  async function handleSubmit() {
    if (!formData.buyerId) return ElMessage.warning('Vui lòng chọn khách hàng')
    if (!formData.customerName || !formData.customerPhone || !formData.customerAddress) {
      return ElMessage.warning('Vui lòng nhập đủ thông tin giao hàng')
    }
    if (!formData.products.length)
      return ElMessage.warning('Phiếu bán phải có ít nhất một sản phẩm')
    if (formData.products.some((item) => !item.productVarientId || !item.count)) {
      return ElMessage.warning('Vui lòng chọn sản phẩm và số lượng hợp lệ')
    }

    const payload = {
      buyerId: formData.buyerId,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerAddress: formData.customerAddress,
      notes: formData.notes,
      statusId: formData.statusId,
      depositRatio: formData.depositRatio,
      products: formData.products.map((item) => ({
        id: editingOrder.value ? item.id : undefined,
        productVarientId: item.productVarientId!,
        productVarientColorId: item.productVarientColorId || undefined,
        count: item.count
      }))
    }

    saving.value = true
    try {
      if (editingOrder.value) {
        await SalesOrderApi.updateForManager(editingOrder.value.id, payload)
        ElMessage.success('Đã cập nhật phiếu bán')
      } else {
        await SalesOrderApi.createByManager(payload)
        ElMessage.success('Đã tạo phiếu bán')
      }
      dialogVisible.value = false
      fetchOrders()
    } finally {
      saving.value = false
    }
  }

  async function searchCustomers(keyword: string) {
    customerLoading.value = true
    try {
      const res: any = await fetchGetUserList({
        Page: 1,
        PageSize: 20,
        Filters: keyword ? undefined : undefined,
        Sorts: 'FullName'
      } as any)
      const items = (res.items || res.records || res.data || []) as CustomerOption[]
      customerOptions.value = keyword
        ? items.filter((item) =>
            getCustomerLabel(item).toLowerCase().includes(keyword.toLowerCase())
          )
        : items
    } finally {
      customerLoading.value = false
    }
  }

  async function searchProducts(keyword: string) {
    productLoading.value = true
    try {
      const res = await ProductApi.getVariantsForOutput({
        current: 1,
        size: 20,
        Search: keyword || undefined
      })
      productOptions.value = res.items || []
    } finally {
      productLoading.value = false
    }
  }

  function handleCustomerChange(id: string) {
    const customer = customerOptions.value.find((item) => item.id === id)
    if (!customer) return
    formData.customerName = customer.fullName || customer.name || formData.customerName
    formData.customerPhone = customer.phoneNumber || formData.customerPhone
    formData.customerAddress = customer.address || formData.customerAddress
  }

  function handleProductChange(row: OrderFormProduct, id: number) {
    const product = productOptions.value.find((item) => item.id === id)
    if (!product) return
    row.productName = product.displayName
    row.price = product.price || 0
    row.coverImageUrl = product.coverImageUrl
    row.productVarientColorId = undefined
  }

  function addProductRow() {
    formData.products.push({ productVarientId: undefined, count: 1, price: 0 })
  }

  function removeProductRow(index: number) {
    formData.products.splice(index, 1)
  }

  function resetForm() {
    formData.buyerId = ''
    formData.customerName = ''
    formData.customerPhone = ''
    formData.customerAddress = ''
    formData.statusId = 'pending'
    formData.depositRatio = 0
    formData.notes = ''
    formData.products = []
  }

  function fillForm(order: SalesOrder) {
    const products = order.products || []
    formData.buyerId = order.buyerId || ''
    formData.customerName = order.customerName || order.buyerName || ''
    formData.customerPhone = order.customerPhone || order.buyerPhone || ''
    formData.customerAddress = order.customerAddress || ''
    formData.statusId = order.statusId || 'pending'
    formData.depositRatio = order.depositRatio || 0
    formData.notes = order.notes || ''
    formData.products = products.map((item) => ({
      id: item.id,
      productVarientId: item.productVarientId,
      productVarientColorId: item.productVarientColorId,
      productName: item.productName,
      count: item.count || 1,
      price: item.price || 0,
      coverImageUrl: item.coverImageUrl
    }))
    if (order.buyerId && !customerOptions.value.some((item) => item.id === order.buyerId)) {
      customerOptions.value.push({
        id: order.buyerId,
        fullName: order.buyerName,
        email: order.buyerEmail,
        phoneNumber: order.buyerPhone
      })
    }
    for (const product of formData.products) {
      if (
        product.productVarientId &&
        !productOptions.value.some((item) => item.id === product.productVarientId)
      ) {
        productOptions.value.push({
          id: product.productVarientId,
          productId: product.productVarientId,
          displayName: product.productName || `Sản phẩm #${product.productVarientId}`,
          coverImageUrl: product.coverImageUrl || '',
          price: product.price || 0,
          categoryId: 0,
          colors: []
        })
      }
    }
  }

  function getProductColors(row: OrderFormProduct) {
    return productOptions.value.find((item) => item.id === row.productVarientId)?.colors || []
  }

  function getLockedList(key: string): string[] {
    const data = lockedStatuses.value || {}
    return Array.isArray(data) ? [] : data[key] || []
  }

  function getStatusLabel(statusId?: string) {
    if (!statusId) return '---'
    return (
      statuses.value[statusId] ||
      statusMap.value.find((item) => item.id === statusId)?.name ||
      statusId
    )
  }

  function getStatusTagType(statusId?: string) {
    const map: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'primary'> = {
      pending: 'info',
      waiting_deposit: 'warning',
      waiting_installment: 'warning',
      confirmed_cod: 'warning',
      paid_processing: 'primary',
      deposit_paid: 'primary',
      installment_approved: 'primary',
      delivering: 'primary',
      waiting_pickup: 'success',
      completed: 'success',
      refunding: 'warning',
      refunded: 'info',
      cancelled: 'danger'
    }
    return map[statusId || ''] || 'info'
  }

  function getCustomerLabel(customer: CustomerOption) {
    return [
      customer.fullName || customer.name || customer.email || customer.id,
      customer.phoneNumber
    ]
      .filter(Boolean)
      .join(' - ')
  }

  function formatCurrency(val?: number) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(Number(val || 0))
  }

  function formatDateTime(value?: string) {
    if (!value) return '---'
    return new Date(value).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
</script>
