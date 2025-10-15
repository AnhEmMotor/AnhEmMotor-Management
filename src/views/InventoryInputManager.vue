<script setup>
import { ref, computed, watch } from 'vue'
import * as XLSX from 'xlsx'
import InventoryItem from '@/components/InventoryInput/InventoryItem.vue'
import BaseButton from '@/components/ui/button/BaseButton.vue'
import BaseInput from '@/components/ui/input/BaseInput.vue'
import BasePagination from '@/components/ui/button/BasePagination.vue'
import InventoryFilterButtons from '@/components/InventoryInput/InventoryFilterButtons.vue'

const searchTerm = ref('')
const selectedStatuses = ref([])
const expandedItemId = ref(null)

// Mock data
const allInventoryItems = ref([
  {
    id: 'PN000001',
    time: '10/10/2025 10:20',
    supplierCode: 'NCC00001',
    supplierName: 'NCC ĐỒNG NAI',
    payable: 3500000000,
    status: 'Đã nhập hàng',
    branch: 'Chi nhánh trung tâm',
    creator: 'Kim Ngân',
    importer: 'Kim Ngân',
    importDate: '2025-10-10',
    products: [
      {
        code: 'SP000002',
        name: 'VARIO',
        quantity: 100,
        unitPrice: 35000000,
        discount: 0,
        importPrice: 35000000,
        total: 3500000000
      }
    ],
    notes: '',
    paid: 3500000000
  },
  {
    id: 'PN000002',
    time: '10/10/2025 09:30',
    supplierCode: 'NCC00002',
    supplierName: 'NCC PHÚ THỌ',
    payable: 3440700000,
    status: 'Phiếu tạm',
    branch: 'Chi nhánh TP.HCM',
    creator: 'Trần Văn A',
    importer: 'Lê Thị B',
    importDate: '2025-10-10',
    products: [
      {
        code: 'SP001001',
        name: 'SH Mode 2024',
        quantity: 30,
        unitPrice: 65000000,
        discount: 300000,
        importPrice: 64700000,
        total: 1941000000
      },
      {
        code: 'SP001002',
        name: 'Vision 2023',
        quantity: 50,
        unitPrice: 30000000,
        discount: 0,
        importPrice: 30000000,
        total: 1500000000
      }
    ],
    notes: 'Nhập hàng đầu tháng, số lượng lớn.',
    paid: 1200000000
  },
  {
    id: 'PN000003',
    time: '09/10/2025 15:00',
    supplierCode: 'NCC00003',
    supplierName: 'NCC QUẢNG NAM',
    payable: 0,
    status: 'Đã hủy',
    branch: 'Chi nhánh Đà Nẵng',
    creator: 'Nguyễn Văn C',
    importer: 'Đã hủy',
    importDate: '2025-10-09',
    products: [
      {
        code: 'SP002001',
        name: 'Sirius 2024',
        quantity: 40,
        unitPrice: 12500000,
        discount: 0,
        importPrice: 12500000,
        total: 500000000
      }
    ],
    notes: 'Đã hủy do lỗi đặt hàng sai mẫu mã.',
    paid: 0
  }
])

const filteredItems = computed(() => {
  let items = allInventoryItems.value

  // Filter by status
  if (selectedStatuses.value.length > 0) {
    items = items.filter((item) => selectedStatuses.value.includes(item.status))
  }

  // Filter by search term
  if (searchTerm.value) {
    const lowerCaseSearchTerm = searchTerm.value.toLowerCase()
    items = items.filter(
      (item) =>
        item.id.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.supplierName.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.supplierCode.toLowerCase().includes(lowerCaseSearchTerm)
    )
  }

  return items
})

function handleToggleDetail(itemId) {
  expandedItemId.value = expandedItemId.value === itemId ? null : itemId
}

const totalPages = ref(5)
const currentPage = ref(1)
const isLoading = ref(false)

watch(currentPage, () => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})

// Excel export
const exportExcel = () => {
  if (filteredItems.value.length === 0) {
    return
  }
  const exportData = filteredItems.value.map((item) => ({
    'Mã Phiếu Nhập': item.id,
    'Thời Gian': item.time,
    'Mã NCC': item.supplierCode,
    'Tên NCC': item.supplierName,
    'Cần Trả NCC': item.payable,
    'Trạng Thái': item.status,
    'Chi Nhánh': item.branch,
    'Người Tạo': item.creator,
    'Người Nhập': item.importer,
    'Ngày Nhập': item.importDate,
    'Đã Trả NCC': item.paid,
    'Ghi Chú': item.notes
  }))
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(exportData)
  worksheet['!cols'] = [
    { wch: 12 },
    { wch: 20 },
    { wch: 12 },
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 30 }
  ]
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh Sách Phiếu Nhập')
  const currentDate = new Date().toISOString().split('T')[0]
  const filename = `DanhSachPhieuNhap_${currentDate}.xlsx`
  XLSX.writeFile(workbook, filename)
}
</script>

<template>
  <div class="box-style">
    <div class="content-box-style">
      <div>
        <h1 class="title-style">Quản lý phiếu nhập</h1>
      </div>
      <div class="action-button-style">
        <BaseButton text="Nhập hàng" color="purple" />
        <BaseButton text="Export" color="green" @click="exportExcel" />
        <div class="h-8 border-r-2 border-black-300 mx-2"></div>
        <InventoryFilterButtons v-model="selectedStatuses" />
      </div>
    </div>

    <BaseInput
      v-model="searchTerm"
      type="text"
      placeholder="Tìm kiếm theo mã phiếu, mã hoặc tên NCC..."
      class="mb-3"
    />

    <!-- Table Header -->
    <div
      class="hidden md:grid summary-row-grid items-center py-3 px-5 text-sm font-semibold text-gray-600 bg-gray-200 rounded-t-md"
    >
      <div class="px-3">Mã nhập hàng</div>
      <div class="px-3">Thời gian</div>
      <div class="px-4">Mã NCC</div>
      <div class="px-5">Nhà cung cấp</div>
      <div class="px-5 text-right">Cần trả NCC</div>
      <div class="px-5">Trạng thái</div>
    </div>

    <!-- Inventory List -->
    <div class="bg-white rounded-b-md shadow-sm">
      <div v-if="filteredItems.length === 0" class="text-center py-6 text-gray-500">
        Không có phiếu nhập nào để hiển thị.
      </div>
      <InventoryItem
        v-for="item in filteredItems"
        :key="item.id"
        :itemData="item"
                :is-open="item.id === expandedItemId"
        @toggle-detail="handleToggleDetail"
      />
    </div>

    <BasePagination
      :total-pages="totalPages"
      v-model:currentPage="currentPage"
      :loading="isLoading"
    />
  </div>
</template>

<style lang="css" scoped>
@reference '../assets/main.css';

.box-style {
  @apply bg-gray-100 p-4 sm:p-6 rounded-xl shadow-lg;
}
.title-style {
  @apply text-3xl font-bold text-gray-800;
}
.content-box-style {
  @apply flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0;
}
.action-button-style {
  @apply flex flex-wrap items-center gap-2;
}
.summary-row-grid {
  grid-template-columns: 1fr 1.5fr 1fr 2fr 1.5fr 1.2fr;
}
</style>
