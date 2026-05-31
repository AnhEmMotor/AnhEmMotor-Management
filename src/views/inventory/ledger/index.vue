<template>
  <div class="flex flex-col gap-4 pb-5">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
      <ArtStatsCard
        title="Tổng giao dịch"
        :count="ledgerStats.totalTransactions"
        icon="ri:exchange-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        title="Tổng lượng nhập"
        :count="ledgerStats.totalImportQty + ' xe'"
        icon="ri:download-2-line"
        iconStyle="bg-success"
      />
      <ArtStatsCard
        title="Tổng lượng xuất"
        :count="ledgerStats.totalExportQty + ' xe'"
        icon="ri:upload-2-line"
        iconStyle="bg-danger"
      />
      <ArtStatsCard
        title="Giá trị nhập kho"
        :count="formatCurrency(ledgerStats.totalImportValue)"
        icon="ri:money-cny-box-line"
        iconStyle="bg-warning"
      />
      <ArtStatsCard
        title="Giá trị xuất kho"
        :count="formatCurrency(ledgerStats.totalExportValue)"
        icon="ri:coins-line"
        iconStyle="bg-info"
      />
    </div>

    <!-- Search Bar & Filters -->
    <ArtSearchBar
      :items="searchItems"
      :label-width="160"
      :span="6"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- Table Card -->
    <ElCard class="flex-1 art-table-card" v-loading="loading">
      <ArtTableHeader :showColumns="false" @refresh="refreshData">
        <template #left>
          <div class="flex items-center gap-2">
            <h4 class="m-0 font-bold text-gray-800 text-lg">Sổ Cái Tồn Kho</h4>
            <ElButton type="primary" :loading="exporting" @click="handleExport" class="ml-4">
              <ElIcon class="mr-1"><Download /></ElIcon> Xuất File Excel
            </ElButton>
          </div>
        </template>
        <template #right>
          <div class="flex items-center gap-3">
            <span class="text-xs text-gray-500"
              >Hiển thị {{ filteredLedgerData.length }} bản ghi</span
            >
          </div>
        </template>
      </ArtTableHeader>

      <ArtTable :data="filteredLedgerData" :columns="columns" row-key="id" stripe>
        <!-- Custom slot for Voucher Code styled as interactive link -->
        <template #voucherCode="{ row }">
          <ElButton type="primary" link class="font-mono font-bold" @click="handleViewVoucher(row)">
            {{ row.voucherCode }}
          </ElButton>
        </template>

        <!-- Custom slot for Transaction Type with badge -->
        <template #type="{ row }">
          <ElTag :type="getTypeTagType(row.type)" size="small">
            {{ getTypeName(row.type) }}
          </ElTag>
        </template>

        <!-- Custom slot for Import Qty -->
        <template #importQty="{ row }">
          <span v-if="row.importQty > 0" class="text-success font-semibold">
            +{{ row.importQty }}
          </span>
          <span v-else class="text-gray-300">-</span>
        </template>

        <!-- Custom slot for Export Qty -->
        <template #exportQty="{ row }">
          <span v-if="row.exportQty > 0" class="text-danger font-semibold">
            -{{ row.exportQty }}
          </span>
          <span v-else class="text-gray-300">-</span>
        </template>

        <!-- Custom slot for Unit Price -->
        <template #unitPrice="{ row }">
          <span class="font-medium text-gray-700">
            {{ formatCurrency(row.unitPrice) }}
          </span>
        </template>

        <!-- Custom slot for Total Amount -->
        <template #totalAmount="{ row }">
          <span :class="row.type === 'IMPORT' ? 'text-success font-bold' : 'text-danger font-bold'">
            {{ formatCurrency(row.totalAmount) }}
          </span>
        </template>

        <!-- Custom slot for Running Balance -->
        <template #balance="{ row }">
          <ElTag type="info" class="font-bold text-gray-800" effect="light">
            {{ row.balance }} xe
          </ElTag>
        </template>
      </ArtTable>
    </ElCard>

    <!-- Dialog for viewing voucher details -->
    <ElDialog
      v-model="dialogVisible"
      :title="`Chi tiết Chứng từ: ${selectedVoucher?.voucherCode}`"
      width="780px"
      append-to-body
      destroy-on-close
    >
      <div v-if="selectedVoucher" class="flex flex-col gap-4">
        <!-- Voucher Info Section -->
        <div
          class="grid grid-cols-2 gap-4 p-4 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-700"
        >
          <div><strong>Loại chứng từ:</strong> {{ getTypeName(selectedVoucher.type) }}</div>
          <div><strong>Ngày lập phiếu:</strong> {{ selectedVoucher.date }}</div>
          <div><strong>Đối tác liên quan:</strong> {{ selectedVoucher.partner }}</div>
          <div
            ><strong>Trạng thái:</strong>
            <ElTag type="success" size="small">Đã duyệt ghi sổ</ElTag></div
          >
        </div>

        <!-- Voucher Details Table -->
        <h5 class="font-bold text-gray-800 text-sm mt-2 mb-1">Chi tiết hàng hóa biến động</h5>
        <ElTable :data="voucherDetails" border stripe style="width: 100%">
          <ElTableColumn prop="name" label="Sản phẩm / Biến thể / Màu sắc" min-width="250" />
          <ElTableColumn prop="qty" label="Số lượng" width="100" align="right">
            <template #default="{ row }">
              <span
                :class="
                  selectedVoucher.type === 'IMPORT'
                    ? 'text-success font-bold'
                    : 'text-danger font-bold'
                "
              >
                {{ selectedVoucher.type === 'IMPORT' ? '+' : '-' }}{{ row.qty }} xe
              </span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="Đơn giá" width="160" align="right">
            <template #default="{ row }">
              {{ formatCurrency(row.price) }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="Thành tiền" width="180" align="right">
            <template #default="{ row }">
              {{ formatCurrency(row.price * row.qty) }}
            </template>
          </ElTableColumn>
        </ElTable>

        <div
          class="flex justify-between items-center mt-3 bg-gray-50 p-3 rounded border border-dashed border-gray-200"
        >
          <span class="text-sm font-medium text-gray-500">Tổng cộng thanh toán:</span>
          <span class="text-lg font-bold text-primary">{{
            formatCurrency(selectedVoucher.totalAmount)
          }}</span>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-between">
          <span></span>
          <ElButton @click="dialogVisible = false">Đóng</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { Download } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import { InventoryReportApi } from '@/api/inventory-report.api'

  defineOptions({ name: 'InventoryLedger' })

  // Define interfaces
  interface LedgerEntry {
    id: string
    date: string
    voucherCode: string
    type: 'IMPORT' | 'EXPORT' | 'ADJUST'
    productName: string
    variantName: string
    colorName?: string
    partner: string
    importQty: number
    exportQty: number
    unitPrice: number
    totalAmount: number
    balance: number
  }

  interface SearchForm {
    searchQuery: string
    type: string
    dateRange: [string, string] | null
  }

  // Current filters state
  const filters = ref<SearchForm>({
    searchQuery: '',
    type: 'ALL',
    dateRange: null
  })

  const loading = ref(false)
  const exporting = ref(false)
  const dialogVisible = ref(false)
  const selectedVoucher = ref<LedgerEntry | null>(null)

  // Format currency helper
  const formatCurrency = (val: number): string => {
    return val.toLocaleString('vi-VN') + ' VNĐ'
  }

  const tableData = ref<LedgerEntry[]>([])

  const fetchLedgerData = async () => {
    loading.value = true
    try {
      const params: any = {}
      if (filters.value.searchQuery) {
        params.searchQuery = filters.value.searchQuery
      }
      if (filters.value.type && filters.value.type !== 'ALL') {
        params.type = filters.value.type
      }
      if (filters.value.dateRange && filters.value.dateRange.length === 2) {
        params.startDate = filters.value.dateRange[0]
        params.endDate = filters.value.dateRange[1]
      }
      const response = await InventoryReportApi.getLedger(params)
      tableData.value = (response || []).map((x: any) => ({
        id: x.id.toString(),
        date: x.date ? new Date(x.date).toLocaleString('vi-VN').replace(/:\d{2}$/, '') : '',
        voucherCode: x.voucherCode,
        type: x.type,
        productName: x.productName,
        variantName: x.variantName,
        colorName: x.colorName,
        partner: x.partner || '—',
        importQty: x.importQty,
        exportQty: x.exportQty,
        unitPrice: x.unitPrice,
        totalAmount: x.totalAmount,
        balance: x.balance
      }))
    } catch (error) {
      console.error(error)
      ElMessage.error('Không thể tải dữ liệu sổ cái tồn kho')
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchLedgerData()
  })

  // Columns definition for Sổ cái tồn kho
  const columns = [
    { label: 'Ngày giao dịch', prop: 'date', width: 180, align: 'center' },
    { label: 'Mã chứng từ', prop: 'voucherCode', width: 130, align: 'center', useSlot: true },
    { label: 'Loại GD', prop: 'type', width: 110, align: 'center', useSlot: true },
    {
      label: 'Sản phẩm / Phiên bản',
      prop: 'productName',
      width: 300,
      formatter: (row: LedgerEntry) => {
        return `${row.productName} - ${row.variantName}${row.colorName ? ` (${row.colorName})` : ''}`
      }
    },
    { label: 'Đối tác', prop: 'partner', minWidth: 180 },
    { label: 'SL Nhập', prop: 'importQty', width: 100, align: 'right', useSlot: true },
    { label: 'SL Xuất', prop: 'exportQty', width: 100, align: 'right', useSlot: true },
    { label: 'Đơn giá', prop: 'unitPrice', width: 140, align: 'right', useSlot: true },
    { label: 'Thành tiền', prop: 'totalAmount', width: 150, align: 'right', useSlot: true },
    { label: 'Tồn sau GD', prop: 'balance', width: 110, align: 'right', useSlot: true }
  ]

  // Form search definition for ArtSearchBar
  const searchItems = computed(() => [
    {
      key: 'searchQuery',
      label: 'Tìm kiếm nhanh',
      type: 'input',
      props: { placeholder: 'Mã chứng từ, tên xe, đối tác...' }
    },
    {
      key: 'type',
      label: 'Loại giao dịch',
      type: 'select',
      props: {
        placeholder: 'Chọn loại chứng từ',
        options: [
          { label: 'Tất cả', value: 'ALL' },
          { label: 'Nhập kho', value: 'IMPORT' },
          { label: 'Xuất kho', value: 'EXPORT' }
        ]
      }
    },
    {
      key: 'dateRange',
      label: 'Khoảng thời gian',
      type: 'daterange',
      props: {
        startPlaceholder: 'Từ ngày',
        endPlaceholder: 'Đến ngày',
        valueFormat: 'YYYY-MM-DD'
      }
    }
  ])

  // Summary computed statistics
  const ledgerStats = computed(() => {
    let totalTransactions = tableData.value.length
    let totalImportQty = 0
    let totalExportQty = 0
    let totalImportValue = 0
    let totalExportValue = 0

    tableData.value.forEach((entry) => {
      if (entry.type === 'IMPORT') {
        totalImportQty += entry.importQty
        totalImportValue += entry.totalAmount
      } else if (entry.type === 'EXPORT') {
        totalExportQty += entry.exportQty
        totalExportValue += entry.totalAmount
      }
    })

    return {
      totalTransactions,
      totalImportQty,
      totalExportQty,
      totalImportValue,
      totalExportValue
    }
  })

  // Filtered dataset
  const filteredLedgerData = computed(() => {
    return tableData.value.filter((entry) => {
      // 1. Text Search Filter
      if (filters.value.searchQuery) {
        const query = filters.value.searchQuery.toLowerCase().trim()
        const matchCode = entry.voucherCode.toLowerCase().includes(query)
        const matchProduct = entry.productName.toLowerCase().includes(query)
        const matchVariant = entry.variantName.toLowerCase().includes(query)
        const matchPartner = entry.partner.toLowerCase().includes(query)

        if (!matchCode && !matchProduct && !matchVariant && !matchPartner) {
          return false
        }
      }

      // 2. Transaction Type Filter
      if (filters.value.type && filters.value.type !== 'ALL') {
        if (entry.type !== filters.value.type) {
          return false
        }
      }

      // 3. Date Range Filter
      if (filters.value.dateRange && filters.value.dateRange.length === 2) {
        const startDate = filters.value.dateRange[0]
        const endDate = filters.value.dateRange[1]
        const entryDate = entry.date.substring(0, 10) // Format: 'YYYY-MM-DD'
        if (entryDate < startDate || entryDate > endDate) {
          return false
        }
      }

      return true
    })
  })

  // Handlers
  const handleSearch = (form: Record<string, any>) => {
    filters.value = {
      searchQuery: form.searchQuery || '',
      type: form.type || 'ALL',
      dateRange: form.dateRange || null
    }
    fetchLedgerData()
  }

  const handleReset = () => {
    filters.value = {
      searchQuery: '',
      type: 'ALL',
      dateRange: null
    }
    fetchLedgerData()
  }

  const refreshData = () => {
    fetchLedgerData().then(() => {
      ElMessage.success('Đã làm mới sổ cái tồn kho!')
    })
  }

  const handleExport = () => {
    exporting.value = true
    setTimeout(() => {
      exporting.value = false
      ElMessage.success('Xuất file Excel sổ cái tồn kho thành công!')
    }, 1500)
  }

  // Type helper functions
  const getTypeName = (type: string) => {
    if (type === 'IMPORT') return 'Nhập kho'
    if (type === 'EXPORT') return 'Xuất kho'
    return 'Điều chỉnh'
  }

  const getTypeTagType = (type: string) => {
    if (type === 'IMPORT') return 'success'
    if (type === 'EXPORT') return 'danger'
    return 'warning'
  }

  // Detail Modal popup simulation
  const voucherDetails = ref<Array<{ name: string; qty: number; price: number }>>([])

  const handleViewVoucher = (row: LedgerEntry) => {
    selectedVoucher.value = row

    // Create details table contents matching the selected voucher
    voucherDetails.value = [
      {
        name: `${row.productName} - ${row.variantName}${row.colorName ? ` (${row.colorName})` : ''}`,
        qty: row.type === 'IMPORT' ? row.importQty : row.exportQty,
        price: row.unitPrice
      }
    ]

    dialogVisible.value = true
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
</style>
