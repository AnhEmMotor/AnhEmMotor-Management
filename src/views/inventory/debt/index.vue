<template>
  <div class="flex flex-col gap-4 pb-5">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ArtStatsCard
        title="Tổng nợ NCC"
        :count="formatCurrency(totalSuppliersDebt)"
        description="Số tiền cần thanh toán cho các lô xe/phụ tùng"
        icon="ri:money-cny-box-line"
        iconStyle="bg-danger"
      />
    </div>

    <ElCard class="flex-1 art-table-card">
      <template #header>
        <div class="flex items-center gap-4 justify-between">
          <div class="flex items-center gap-4">
            <h4 class="m-0 font-bold text-gray-800 text-lg">Quản lý Công nợ nhà cung cấp</h4>
          </div>
          <ElButton type="primary" size="small" @click="fetchSupplierDebts">
            <ElIcon class="mr-1"><Refresh /></ElIcon> Làm mới
          </ElButton>
        </div>
      </template>

      <ArtTable :data="supplierDebts" :columns="supplierColumns" v-loading="loading">
        <template #totalDebt="{ row }">
          <span class="font-bold text-red-500">
            {{ formatCurrency(row.totalDebt) }}
          </span>
        </template>
        <template #operation="{ row }">
          <ElButton type="primary" size="small" link @click="handleViewReceipts(row)">
            Chi tiết đơn nợ
          </ElButton>
        </template>
      </ArtTable>
    </ElCard>

    <ElDialog
      v-model="receiptsDialogVisible"
      :title="`Danh sách phiếu nhập còn nợ - ${selectedSupplier?.name}`"
      width="950px"
      append-to-body
      destroy-on-close
    >
      <div v-loading="receiptsLoading">
        <ElTabs v-model="activeTab" class="mb-4">
          <ElTabPane name="unpaid" :label="`Chưa thanh toán hoàn tất (${unpaidDebts.length})`" />
          <ElTabPane name="fully_paid" :label="`Đã thanh toán (${fullyPaidDebts.length})`" />
        </ElTabs>

        <ElTable :data="filteredReceipts" border stripe style="width: 100%">
          <ElTableColumn label="Mã phiếu" width="120" align="center">
            <template #default="{ row }">
              <span class="font-mono font-bold text-primary">IR-{{ row.inventoryReceiptId }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="Sản phẩm" min-width="200">
            <template #default="{ row }">
              <div class="font-medium text-gray-900">{{ row.productVariantName }}</div>
              <div v-if="row.colorName" class="text-xs text-gray-500"
                >Phân loại: {{ row.colorName }}</div
              >
            </template>
          </ElTableColumn>
          <ElTableColumn label="Hạn thanh toán" width="140" align="center">
            <template #default="{ row }">
              <span
                :class="{ 'text-red-500 font-bold': isOverdue(row) && getRemainingDebt(row) > 0 }"
              >
                {{ row.dueDate ? new Date(row.dueDate).toLocaleDateString('vi-VN') : '-' }}
              </span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="Tổng tiền" width="140" align="right">
            <template #default="{ row }">
              {{ formatCurrency(row.totalAmount) }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="Đã trả" width="130" align="right">
            <template #default="{ row }">
              <span class="text-success font-medium">{{
                formatCurrency(row.paidAmount || 0)
              }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="Còn nợ" width="140" align="right">
            <template #default="{ row }">
              <span class="text-danger font-bold">{{ formatCurrency(getRemainingDebt(row)) }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="Thao tác" width="110" align="center" fixed="right">
            <template #default="{ row }">
              <ElButton
                type="success"
                size="small"
                :disabled="getRemainingDebt(row) <= 0"
                @click="openPaymentForm(row)"
              >
                Trả nợ
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </ElDialog>

    <ElDialog
      v-model="paymentFormVisible"
      :title="`Thanh toán nợ phiếu IR-${selectedReceipt?.inventoryReceiptId}`"
      width="450px"
      append-to-body
    >
      <div v-if="selectedReceipt" class="space-y-4">
        <div class="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-500">Mã đơn nhập:</span>
            <span class="font-bold">IR-{{ selectedReceipt.inventoryReceiptId }}</span>
          </div>
          <div class="flex flex-col gap-1 border-t border-b border-gray-100 py-2 my-2">
            <span class="text-gray-500 text-xs">Sản phẩm:</span>
            <span class="font-medium text-gray-800 text-xs">{{
              selectedReceipt.productVariantName
            }}</span>
            <span v-if="selectedReceipt.colorName" class="text-gray-500 text-xs"
              >Phân loại: {{ selectedReceipt.colorName }}</span
            >
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Tổng số tiền nợ:</span>
            <span class="font-bold text-red-500">{{
              formatCurrency(getRemainingDebt(selectedReceipt))
            }}</span>
          </div>
        </div>
        <ElForm label-position="top">
          <ElFormItem label="Số tiền thanh toán (VNĐ)">
            <ElInputNumber
              v-model="paymentAmount"
              :min="1"
              :max="getRemainingDebt(selectedReceipt)"
              class="w-full"
              :controls="false"
            />
          </ElFormItem>
        </ElForm>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="paymentFormVisible = false">Hủy</ElButton>
          <ElButton type="primary" :loading="paying" @click="submitPayment">Xác nhận</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { Refresh } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import { DebtApi } from '@/api/debt.api'

  defineOptions({ name: 'InventoryDebt' })

  const loading = ref(false)
  const supplierDebts = ref<any[]>([])

  const totalSuppliersDebt = computed(() => {
    return supplierDebts.value.reduce((sum, item) => sum + (item.totalDebt || 0), 0)
  })

  const formatCurrency = (val: number): string => {
    return (val || 0).toLocaleString('vi-VN') + ' VNĐ'
  }

  const getRemainingDebt = (receipt: any): number => {
    const total = receipt.totalAmount || 0
    const paid = receipt.paidAmount || 0
    return Math.max(0, total - paid)
  }

  const fetchSupplierDebts = async () => {
    loading.value = true
    try {
      const res = await DebtApi.getSuppliersWithDebt()
      supplierDebts.value = res || []
    } catch (err: any) {
      console.error(err)
      ElMessage.error('Không thể lấy danh sách công nợ nhà cung cấp')
    } finally {
      loading.value = false
    }
  }

  const supplierColumns = [
    { label: 'Nhà cung cấp', prop: 'name', minWidth: 200 },
    {
      label: 'Số điện thoại',
      prop: 'phone',
      width: 150,
      align: 'center',
      formatter: (r: any) => r.phone || '-'
    },
    { label: 'Còn nợ (VNĐ)', prop: 'totalDebt', width: 220, useSlot: true, align: 'right' },
    {
      label: 'Thao tác',
      prop: 'operation',
      useSlot: true,
      width: 180,
      align: 'center',
      fixed: 'right' as const
    }
  ]

  const receiptsDialogVisible = ref(false)
  const receiptsLoading = ref(false)
  const selectedSupplier = ref<any | null>(null)
  const receipts = ref<any[]>([])
  const activeTab = ref('unpaid')

  const isOverdue = (row: any): boolean => {
    if (!row.dueDate) return false
    return new Date(row.dueDate).getTime() < Date.now()
  }

  const unpaidDebts = computed(() => {
    return receipts.value.filter((row) => getRemainingDebt(row) > 0)
  })

  const fullyPaidDebts = computed(() => {
    return receipts.value.filter((row) => getRemainingDebt(row) === 0)
  })

  const filteredReceipts = computed(() => {
    if (activeTab.value === 'unpaid') {
      return unpaidDebts.value
    }
    if (activeTab.value === 'fully_paid') {
      return fullyPaidDebts.value
    }
    return []
  })

  const handleViewReceipts = async (supplier: any) => {
    selectedSupplier.value = supplier
    receiptsDialogVisible.value = true
    receiptsLoading.value = true
    try {
      const res = await DebtApi.getReceiptsWithDebt(supplier.id)
      receipts.value = res || []
    } catch (err: any) {
      console.error(err)
      ElMessage.error('Không thể lấy danh sách phiếu nợ')
    } finally {
      receiptsLoading.value = false
    }
  }

  const paymentFormVisible = ref(false)
  const paying = ref(false)
  const selectedReceipt = ref<any | null>(null)
  const paymentAmount = ref<number>(0)

  const openPaymentForm = (receipt: any) => {
    selectedReceipt.value = receipt
    paymentAmount.value = getRemainingDebt(receipt)
    paymentFormVisible.value = true
  }

  const submitPayment = async () => {
    if (!selectedReceipt.value) return
    paying.value = true
    try {
      await DebtApi.payDebt(selectedReceipt.value.id, paymentAmount.value)
      ElMessage.success('Thanh toán công nợ thành công!')
      paymentFormVisible.value = false

      if (selectedSupplier.value) {
        const res = await DebtApi.getReceiptsWithDebt(selectedSupplier.value.id)
        receipts.value = res || []
      }

      fetchSupplierDebts()
    } catch (err: any) {
      console.error(err)
      ElMessage.error(err.response?.data?.Message || 'Thanh toán thất bại')
    } finally {
      paying.value = false
    }
  }

  onMounted(() => {
    fetchSupplierDebts()
  })
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
</style>
