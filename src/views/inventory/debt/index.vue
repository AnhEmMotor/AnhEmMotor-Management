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
      <ArtStatsCard
        title="Hồ sơ treo Ngân hàng"
        :count="15"
        description="Đang chờ giải ngân trả góp (Giả lập)"
        icon="ri:timer-flash-line"
        iconStyle="bg-warning"
      />
      <ArtStatsCard
        title="Giá trị cam kết"
        count="450 triệu"
        description="Tiền đang kẹt tại Bank (Giả lập)"
        icon="ri:safe-2-line"
        iconStyle="bg-primary"
      />
    </div>

    <ElCard class="flex-1 art-table-card">
      <template #header>
        <div class="flex items-center gap-4 justify-between">
          <div class="flex items-center gap-4">
            <h4 class="m-0 font-bold text-gray-800 text-lg">Quản lý Công nợ</h4>
            <ElRadioGroup v-model="activeTab" size="small">
              <ElRadioButton label="suppliers">Công nợ NCC</ElRadioButton>
              <ElRadioButton label="banks">Đối tác Ngân hàng (Giả lập)</ElRadioButton>
            </ElRadioGroup>
          </div>
          <ElButton
            v-if="activeTab === 'suppliers'"
            type="primary"
            size="small"
            @click="fetchSupplierDebts"
          >
            <ElIcon class="mr-1"><Refresh /></ElIcon> Làm mới
          </ElButton>
        </div>
      </template>

      <div v-if="activeTab === 'suppliers'">
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
      </div>

      <div v-else>
        <ArtTable :data="bankInstallments" :columns="bankColumns">
          <template #daysPending="{ row }">
            <span :class="row.daysPending > 7 ? 'text-danger font-bold' : ''">
              {{ row.daysPending }} ngày
            </span>
          </template>
          <template #operation="{ row }">
            <ElButton type="primary" link size="small" @click="handleContact(row)">
              Liên hệ đầu mối (Mục 7.1)
            </ElButton>
          </template>
        </ArtTable>
        <div
          class="mt-4 p-4 bg-info/5 rounded border border-info/10 text-xs text-info flex items-center gap-2"
        >
          <ElIcon><InfoFilled /></ElIcon>
          <span
            >Nếu ngân hàng chậm giải ngân (> 7 ngày), Admin cần tra cứu đầu mối liên hệ tại mục 7.1
            để thúc đẩy hồ sơ.</span
          >
        </div>
      </div>
    </ElCard>

    <!-- Dialog xem danh sách phiếu nhập nợ của nhà cung cấp -->
    <ElDialog
      v-model="receiptsDialogVisible"
      :title="`Danh sách phiếu nhập còn nợ - ${selectedSupplier?.name}`"
      width="900px"
      append-to-body
      destroy-on-close
    >
      <div v-loading="receiptsLoading">
        <ElTable :data="receipts" border stripe style="width: 100%">
          <ElTableColumn label="Mã phiếu" width="120" align="center">
            <template #default="{ row }">
              <span class="font-mono font-bold text-primary">IR-{{ row.id }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="Ngày lập" width="160" align="center">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="notes" label="Ghi chú" min-width="180" show-overflow-tooltip />
          <ElTableColumn label="Tổng tiền" width="150" align="right">
            <template #default="{ row }">
              {{ formatCurrency(row.totalPayable) }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="Đã trả" width="140" align="right">
            <template #default="{ row }">
              <span class="text-success font-medium">{{
                formatCurrency(row.paidAmount || 0)
              }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="Còn nợ" width="150" align="right">
            <template #default="{ row }">
              <span class="text-danger font-bold">{{ formatCurrency(getRemainingDebt(row)) }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="Thao tác" width="120" align="center" fixed="right">
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

    <!-- Dialog thực hiện thanh toán nợ -->
    <ElDialog
      v-model="paymentFormVisible"
      :title="`Thanh toán nợ phiếu IR-${selectedReceipt?.id}`"
      width="450px"
      append-to-body
    >
      <div v-if="selectedReceipt" class="space-y-4">
        <div class="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-500">Mã đơn nhập:</span>
            <span class="font-bold">IR-{{ selectedReceipt.id }}</span>
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
  import { InfoFilled, Refresh } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import { DebtApi } from '@/api/debt.api'
  import dayjs from 'dayjs'

  defineOptions({ name: 'InventoryDebt' })

  const activeTab = ref('suppliers')
  const loading = ref(false)
  const supplierDebts = ref<any[]>([])

  // Calculate total debt of all suppliers
  const totalSuppliersDebt = computed(() => {
    return supplierDebts.value.reduce((sum, item) => sum + (item.totalDebt || 0), 0)
  })

  // Format currency helper
  const formatCurrency = (val: number): string => {
    return (val || 0).toLocaleString('vi-VN') + ' VNĐ'
  }

  // Format date helper
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '-'
    return dayjs(dateStr).format('DD/MM/YYYY HH:mm')
  }

  // Calculate remaining debt of a receipt
  const getRemainingDebt = (receipt: any): number => {
    const total = receipt.totalPayable || 0
    const paid = receipt.paidAmount || 0
    return Math.max(0, total - paid)
  }

  // Fetch supplier list with debt
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

  // Supplier columns
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

  // Mock data for bank installment
  const bankInstallments = [
    {
      customer: 'Nguyễn Văn A',
      bank: 'FE Credit',
      amount: 25000000,
      daysPending: 5,
      contact: 'Mr. Bình (0901234567)'
    },
    {
      customer: 'Trần Thị B',
      bank: 'Home Credit',
      amount: 18000000,
      daysPending: 2,
      contact: 'Ms. Lan (0987654321)'
    },
    {
      customer: 'Lê Văn C',
      bank: 'HD Saison',
      amount: 45000000,
      daysPending: 12,
      contact: 'Mr. Hùng (0912345678)'
    }
  ]

  const bankColumns = [
    { label: 'Khách hàng', prop: 'customer', width: 160 },
    { label: 'Ngân hàng', prop: 'bank', width: 130 },
    {
      label: 'Số tiền vay',
      prop: 'amount',
      width: 150,
      align: 'right',
      formatter: (row: any) => row.amount?.toLocaleString()
    },
    { label: 'Thời gian treo', prop: 'daysPending', width: 140, useSlot: true, align: 'center' },
    { label: 'Đầu mối liên hệ', prop: 'contact', minWidth: 200 },
    {
      label: 'Thao tác',
      prop: 'operation',
      useSlot: true,
      width: 180,
      fixed: 'right' as const
    }
  ]

  const handleContact = (row: any) => {
    console.log('Contact', row)
  }

  // --- Receipts Dialog Handling ---
  const receiptsDialogVisible = ref(false)
  const receiptsLoading = ref(false)
  const selectedSupplier = ref<any | null>(null)
  const receipts = ref<any[]>([])

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

  // --- Payment Form Handling ---
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

      // Reload receipts list
      if (selectedSupplier.value) {
        const res = await DebtApi.getReceiptsWithDebt(selectedSupplier.value.id)
        receipts.value = res || []
      }
      // Reload supplier list
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
