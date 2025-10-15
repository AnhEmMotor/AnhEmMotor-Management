<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import * as XLSX from 'xlsx'
import SupplierItem from '@/components/supplier/SupplierItem.vue'
import BaseButton from '@/components/ui/button/BaseButton.vue'
import BaseInput from '@/components/ui/input/BaseInput.vue'
import BasePagination from '@/components/ui/button/BasePagination.vue'
import SupplierFilterButtons from '@/components/supplier/SupplierFilterButtons.vue'
import SupplierAddEditModal from '@/components/supplier/SupplierAddEditModal.vue'
import SupplierDeleteModal from '@/components/supplier/SupplierDeleteModal.vue'

// Dữ liệu mẫu Nhà cung cấp (Sample Data)
const initialSuppliers = [
    {
        id: 'NCC000001',
        name: 'NCC ĐỒNG NAI',
        phone: '0898456123',
        email: 'Chưa có',
        totalPurchase: 3500000000,
        status: 'active',
        creator: 'Kim Ngân',
        creationDate: new Date('2025-10-10').getTime(),
        group: 'Vật liệu',
        notes: 'Nhà cung cấp chính về vật liệu xây dựng.',
        address: 'Đường X, Khu Y',
        cityDistrict: 'Biên Hòa, Đồng Nai',
        ward: 'Phường Z',
        transactions: [
            { code: 'PN000001', type: 'import', time: new Date('2025-10-10 10:20').getTime(), creator: 'Kim Ngân', total: 3500000000, status: 'Đã nhập hàng' },
            { code: 'PN000002', type: 'import', time: new Date('2025-09-05 15:45').getTime(), creator: 'Nguyễn B', total: 500000000, status: 'Đã nhập hàng' },
            { code: 'PN000003', type: 'return', time: new Date('2025-09-01 09:00').getTime(), creator: 'Kim Ngân', total: 10000000, status: 'Đã nhập hàng' },
        ]
    },
    {
        id: 'NCC000002',
        name: 'CÔNG TY ABC',
        phone: '0901234567',
        email: 'abc@email.com',
        totalPurchase: 50000000,
        status: 'active',
        creator: 'Nguyễn Văn A',
        creationDate: new Date('2025-05-01').getTime(),
        group: 'Điện tử',
        notes: 'Chuyên cung cấp thiết bị điện tử.',
        address: '123 Nguyễn Huệ',
        cityDistrict: 'Quận 1, TP.HCM',
        ward: 'Bến Nghé',
        transactions: [
            { code: 'PN000105', type: 'import', time: new Date('2025-08-10 12:00').getTime(), creator: 'Trần C', total: 50000000, status: 'Đã nhập hàng' },
        ]
    },
    {
        id: 'NCC000003',
        name: 'CỬA HÀNG MINH',
        phone: '0339876543',
        email: 'Chưa có',
        totalPurchase: 12500000,
        status: 'inactive',
        creator: 'Trần Thị B',
        creationDate: new Date('2024-09-20').getTime(),
        group: 'Khác',
        notes: 'Đã ngừng hợp tác từ tháng trước.',
        address: 'Chưa có',
        cityDistrict: 'Chưa có',
        ward: 'Chưa có',
        transactions: []
    },
    {
        id: 'NCC000004',
        name: 'SUPPLIER XYZ',
        phone: '0777111222',
        email: 'info@xyz.com',
        totalPurchase: 150000000,
        status: 'active',
        creator: 'Lê Văn C',
        creationDate: new Date('2025-01-05').getTime(),
        group: 'Điện tử',
        notes: 'Nhà cung cấp phụ tùng.',
        address: '456 Lê Lợi',
        cityDistrict: 'Hà Nội',
        ward: 'Hoàn Kiếm',
        transactions: [
            { code: 'PN000300', type: 'import', time: new Date('2025-07-20 17:30').getTime(), creator: 'Phạm D', total: 100000000, status: 'Đã nhập hàng' },
            { code: 'PN000301', type: 'import', time: new Date('2025-07-21 08:00').getTime(), creator: 'Lê Văn C', total: 50000000, status: 'Đã nhập hàng' },
        ]
    },
    {
        id: 'NCC000005',
        name: 'VẬT TƯ MIỀN NAM',
        phone: '0912345678',
        email: 'vtm@mail.vn',
        totalPurchase: 200000000,
        status: 'active',
        creator: 'Phạm Thị D',
        creationDate: new Date('2025-08-15').getTime(),
        group: 'Vật liệu',
        notes: '',
        address: '999 Hậu Giang',
        cityDistrict: 'Cần Thơ',
        ward: 'Ninh Kiều',
        transactions: [
            { code: 'PN000550', type: 'import', time: new Date('2025-09-01 10:30').getTime(), creator: 'Phạm D', total: 200000000, status: 'Đã nhập hàng' },
            { code: 'PN000551', type: 'return', time: new Date('2025-09-05 14:00').getTime(), creator: 'Phạm D', total: 5000000, status: 'Đã nhập hàng' },
        ]
    },
];

// Hàm định dạng tiền tệ (hiển thị)
const currencyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    minimumFractionDigits: 0
});

function formatCurrency(number) {
    if (typeof number !== 'number') return '0';
    return currencyFormatter.format(number) + '';
}

// Hàm chuyển timestamp sang định dạng ngày tháng
function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Hàm chuyển timestamp sang định dạng ngày tháng và giờ (dd/mm/yyyy hh:mm)
function formatDateTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Hàm chuyển chuỗi đã format thành số nguyên (dùng cho logic lọc)
function parseNumber(string) {
    if (!string) return 0;
    return parseFloat(String(string).replace(/[^0-9]/g, '')) || 0;
}

// Hàm định dạng input tự động khi gõ (masking)
function formatNumberInput(event) {
    let value = event.target.value.replace(/[^0-9]/g, '');
    if (value === '') {
        event.target.value = '';
        return;
    }
    const formattedValue = new Intl.NumberFormat('vi-VN').format(value);
    event.target.value = formattedValue;
}
// --- STATE ---
const suppliers = ref(JSON.parse(JSON.stringify(initialSuppliers)))
const searchTerm = ref('')
const selectedStatuses = ref([])
const selectedSupplierId = ref(null)

// Modal Visibility
const isAddEditModalVisible = ref(false)
const isDeleteModalVisible = ref(false)

// Data for Modals
const editableSupplier = ref(null)
const supplierToDelete = ref(null)

// Message Box State
const message = reactive({ text: '', type: 'success', visible: false })

const filteredItems = computed(() => {
  let items = suppliers.value

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
        item.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.phone.toLowerCase().includes(lowerCaseSearchTerm),
    )
  }

  return items.sort((a, b) => b.creationDate - a.creationDate)
})

function handleToggleDetail(supplierId) {
  const clickedItem = suppliers.value.find((i) => i.id === supplierId)
  if (clickedItem) {
    const wasOpen = clickedItem.isOpen
    suppliers.value.forEach((item) => {
      item.isOpen = false
    })
    if (!wasOpen) {
      clickedItem.isOpen = true
    }
  }
}

// --- MODAL & CRUD ---
function showMessage(text, type = 'success', duration = 3000) {
  message.text = text
  message.type = type
  message.visible = true
  setTimeout(() => {
    message.visible = false
  }, duration)
}

function openAddEditModal(supplier = null) {
  if (supplier) {
    editableSupplier.value = { ...supplier }
  } else {
    editableSupplier.value = {
      name: '', phone: '', email: '', address: '', cityDistrict: '', ward: '', group: '', notes: '',
    }
  }
  isAddEditModalVisible.value = true
}

function handleSaveSupplier(supplierData) {
  if (!supplierData.name) {
    showMessage('Tên nhà cung cấp là bắt buộc!', 'error')
    return
  }
  if (supplierData.id) {
    const index = suppliers.value.findIndex((s) => s.id === supplierData.id)
    if (index !== -1) {
      suppliers.value[index] = { ...suppliers.value[index], ...supplierData }
    }
    showMessage(`Đã cập nhật nhà cung cấp: ${supplierData.name}.`)
  } else {
    const newIdNumber =
      suppliers.value.length > 0
        ? Math.max(...suppliers.value.map((s) => parseInt(s.id.substring(3)))) + 1
        : 1
    const newId = 'NCC' + newIdNumber.toString().padStart(6, '0')
    const newSupplier = {
      ...supplierData,
      id: newId,
      totalPurchase: 0,
      status: 'active',
      creator: 'Current User', // Replace with actual user
      creationDate: Date.now(),
      transactions: [],
      isOpen: false,
    }
    suppliers.value.unshift(newSupplier)
    showMessage(`Đã tạo nhà cung cấp mới: ${newSupplier.name}.`)
  }
  isAddEditModalVisible.value = false
}

function openDeleteModal(supplier) {
  supplierToDelete.value = supplier
  isDeleteModalVisible.value = true
}

function handleDeleteSupplier() {
  if (!supplierToDelete.value) return
  suppliers.value = suppliers.value.filter((s) => s.id !== supplierToDelete.value.id)
  showMessage(`Đã xóa nhà cung cấp: ${supplierToDelete.value.name}.`)
  if (selectedSupplierId.value === supplierToDelete.value.id) {
    selectedSupplierId.value = null
  }
  isDeleteModalVisible.value = false
}

function toggleActivation(supplierId) {
  const supplier = suppliers.value.find((s) => s.id === supplierId)
  if (supplier) {
    supplier.status = supplier.status === 'active' ? 'inactive' : 'active'
    showMessage(
      `Đã ${supplier.status === 'active' ? 'kích hoạt' : 'ngừng hoạt động'} nhà cung cấp ${supplier.name}.`,
    )
  }
}


// Pagination
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
const handleExport = () => {
  if (filteredItems.value.length === 0) {
    return
  }
  const exportData = filteredItems.value.map((s) => ({
    'Mã nhà cung cấp': s.id,
    'Tên nhà cung cấp': s.name,
    'Số điện thoại': s.phone || '',
    'Email': s.email || '',
    'Nhóm NCC': s.group || 'Chưa có nhóm',
    'Tổng mua (VND)': s.totalPurchase,
    'Trạng thái': s.status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động',
    'Địa chỉ': [s.address, s.ward, s.cityDistrict].filter(Boolean).join(', '),
    'Ghi chú': s.notes || '',
  }))
  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'DanhSachNhaCungCap')
  const fileName = `Danh_sach_NCC_${formatDate(Date.now()).replace(/\//g, '-')}.xlsx`
  XLSX.writeFile(wb, fileName)
  showMessage(`Đã xuất ${exportData.length} nhà cung cấp ra file Excel.`)
}

// Excel import
const handleImport = (event) => {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonArr = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      if (jsonArr.length < 2) {
        showMessage('File Excel không có dữ liệu.', 'error')
        return
      }
      const headers = jsonArr[0].map((h) => String(h).trim())
      const importedSuppliers = jsonArr
        .slice(1)
        .map((row, index) => {
          const newSupplierData = {}
          headers.forEach((h, i) => {
            if (h === 'Tên nhà cung cấp') newSupplierData.name = row[i]
            if (h === 'Số điện thoại') newSupplierData.phone = row[i]
            if (h === 'Email') newSupplierData.email = row[i]
            if (h === 'Nhóm NCC') newSupplierData.group = row[i]
            if (h === 'Địa chỉ') newSupplierData.address = row[i]
            if (h === 'Ghi chú') newSupplierData.notes = row[i]
          })
          if (!newSupplierData.name || !String(newSupplierData.name).trim()) return null
          const currentMaxId =
            suppliers.value.length > 0
              ? Math.max(...suppliers.value.map((s) => parseInt(s.id.substring(3))))
              : 0
          const newId = 'NCC' + (currentMaxId + index + 1).toString().padStart(6, '0')
          return {
            ...newSupplierData,
            id: newId,
            totalPurchase: 0,
            status: 'active',
            creator: 'Import User',
            creationDate: Date.now(),
            transactions: [],
            isOpen: false,
          }
        })
        .filter(Boolean)
      suppliers.value.unshift(...importedSuppliers)
      showMessage(`Đã nhập thành công ${importedSuppliers.length} nhà cung cấp.`)
    } catch (error) {
      console.error('Lỗi import:', error)
      showMessage('Lỗi xử lý file Excel.', 'error')
    }
  }
  reader.readAsArrayBuffer(file)
  event.target.value = null
}

onMounted(() => {
  suppliers.value.forEach(s => s.isOpen = false);
});

</script>

<template>
  <div class="box-style">
    <div class="content-box-style">
      <div>
        <h1 class="title-style">Quản lý nhà cung cấp</h1>
      </div>
      <div class="action-button-style">
        <BaseButton text="Thêm NCC" color="purple" @click="openAddEditModal()" />
        
        <label for="import-file-input" class="cursor-pointer">
            <BaseButton text="Import" color="blue" as="span" />
            <input
              type="file"
              id="import-file-input"
              accept=".xlsx, .xls"
              class="hidden"
              @change="handleImport"
            />
        </label>

        <BaseButton text="Export" color="green" @click="handleExport" />
        <div class="h-8 border-r-2 border-black-300 mx-2"></div>
        <SupplierFilterButtons v-model="selectedStatuses" />
      </div>
    </div>

    <BaseInput
      v-model="searchTerm"
      type="text"
      placeholder="Tìm kiếm theo mã, tên, SĐT nhà cung cấp..."
      class="mb-3"
    />

    <!-- Table Header -->
    <div
      class="hidden md:grid summary-row-grid items-center py-3 px-5 text-sm font-semibold text-gray-600 bg-gray-200 rounded-t-md"
    >
      <div class="px-3">Mã NCC</div>
      <div class="px-3">Tên nhà cung cấp</div>
      <div class="px-4">Điện thoại</div>
      <div class="px-5">Email</div>
      <div class="px-5 text-right">Tổng mua</div>
      <div class="px-5">Trạng thái</div>
    </div>

    <!-- Inventory List -->
    <div class="bg-white rounded-b-md shadow-sm">
      <div v-if="filteredItems.length === 0" class="text-center py-6 text-gray-500">
        Không có nhà cung cấp nào để hiển thị.
      </div>
      <SupplierItem
        v-for="item in filteredItems"
        :key="item.id"
        :itemData="item"
        @toggle-detail="handleToggleDetail"
        @edit-supplier="openAddEditModal"
        @delete-supplier="openDeleteModal"
        @toggle-activation="toggleActivation"
      />
    </div>

    <BasePagination
      :total-pages="totalPages"
      v-model:currentPage="currentPage"
      :loading="isLoading"
    />

    <!-- Modals -->
    <SupplierAddEditModal 
        v-if="isAddEditModalVisible"
        :is-open="isAddEditModalVisible"
        :supplier="editableSupplier"
        @close="isAddEditModalVisible = false"
        @save="handleSaveSupplier"
    />
    <SupplierDeleteModal
        v-if="isDeleteModalVisible"
        :is-open="isDeleteModalVisible"
        :supplier="supplierToDelete"
        @close="isDeleteModalVisible = false"
        @confirm="handleDeleteSupplier"
    />

     <!-- Message Box -->
    <div
      v-if="message.visible"
      class="fixed bottom-4 right-4 z-50 w-72 p-4 text-white rounded-lg shadow-lg transition-opacity duration-300"
      :class="{ 'bg-green-600': message.type === 'success', 'bg-red-600': message.type === 'error' }"
    >
      {{ message.text }}
    </div>
  </div>
</template>

<style lang="css" scoped>
@reference "../assets/main.css";

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
  grid-template-columns: 1fr 2fr 1fr 1.5fr 1.5fr 1.2fr;
}
</style>
