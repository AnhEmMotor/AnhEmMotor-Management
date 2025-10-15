<template>
  <div class="box-style">
    <div class="content-box-style">
      <div>
        <h1 class="title-style">Danh Sách Sản Phẩm</h1>
      </div>
      <div class="action-button-style">
        <BaseButton text="Thêm sản phẩm" color="purple" />
        <BaseButton text="Import Excel" color="blue" @click="importExcel" />
        <BaseButton text="Export" color="green" @click="exportExcel" />
        <span class="text-gray-400 mx-4 hidden border-r-2 sm:block" />
        <ProductFilterButtons v-model="selectedStatuses" />
      </div>
    </div>

    <BaseInput v-model="searchTerm" type="text" placeholder="Tìm kiếm sản phẩm" class="mb-3" />

    <div class="overflow-x-auto">
      <table class="table-style">
        <thead class="table-header-style">
          <tr>
            <th class="normal-cell-style">Mã SP</th>
            <th class="normal-cell-style">Tên Sản Phẩm</th>
            <th class="normal-cell-style">Danh Mục</th>
            <th class="normal-cell-style">Số Lượng</th>
            <th class="normal-cell-style">Trạng Thái</th>
            <th class="center-cell-style">Thao Tác</th>
          </tr>
        </thead>
        <tbody class="table-body-style">
          <tr v-if="products.length === 0">
            <td colspan="6" class="not-found-text-style">Không có sản phẩm nào để hiển thị.</td>
          </tr>
          <tr v-for="product in products" :key="product.code" class="table-row-style">
            <td class="normal-cell-style whitespace-nowrap">{{ product.code }}</td>
            <td class="normal-cell-style">{{ product.name }}</td>
            <td class="normal-cell-style">{{ product.category }}</td>
            <td class="normal-cell-style">{{ product.quantity }}</td>
            <td class="normal-cell-style">
              <RoundBadge :color="getStatusColorClass(product.quantity)">{{
                getStockStatusText(product.quantity)
              }}</RoundBadge>
            </td>
            <td class="center-cell-style space-x-2">
              <BaseSmallNoBgButton @click="editProduct(product.code)">Sửa</BaseSmallNoBgButton>
              <BaseSmallNoBgButton color="red" @click="deleteProduct(product.code)">
                Xóa
              </BaseSmallNoBgButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <BasePagination
      :total-pages="totalPages"
      v-model:currentPage="currentPage"
      :loading="isLoading"
    />
  </div>
</template>

<script setup>
import ProductFilterButtons from '@/components/product/ProductFilterButtons.vue'
import BaseButton from '@/components/ui/button/BaseButton.vue'
import BaseInput from '@/components/ui/input/BaseInput.vue'
import BasePagination from '@/components/ui/button/BasePagination.vue'
import BaseSmallNoBgButton from '@/components/ui/button/BaseSmallNoBgButton.vue'
import RoundBadge from '@/components/ui/RoundBadge.vue'
import { ref, watch } from 'vue'
import * as XLSX from 'xlsx'

//Xử lý bảng
const LOW_STOCK_THRESHOLD = 10

const selectedStatuses = ref([])

const stockStatusColors = {
  'in-stock': 'green',
  'low-stock': 'yellow',
  'out-of-stock': 'red',
}

const stockStatusTextMap = {
  'in-stock': 'Còn Hàng',
  'low-stock': 'Sắp Hết',
  'out-of-stock': 'Hết Hàng',
}

const products = ref([
  {
    code: 'SP001',
    name: 'Honda Wave RSX',
    category: 'Xe Máy',
    price: 25000000,
    cost: 22000000,
    quantity: 15,
    description: 'Xe máy Honda Wave RSX 110cc',
  },
  {
    code: 'SP002',
    name: 'Yamaha Jupiter',
    category: 'Xe Máy',
    price: 27000000,
    cost: 24000000,
    quantity: 8,
    description: 'Xe máy Yamaha Jupiter Fi 115cc',
  },
  {
    code: 'SP003',
    name: 'Mũ Bảo Hiểm Royal',
    category: 'Phụ Kiện',
    price: 350000,
    cost: 250000,
    quantity: 45,
    description: 'Mũ bảo hiểm Royal M20',
  },
  {
    code: 'SP004',
    name: 'Lốp Michelin City Grip',
    category: 'Phụ Tùng',
    price: 1200000,
    cost: 950000,
    quantity: 2,
    description: 'Lốp Michelin City Grip 80/90-14',
  },
  {
    code: 'SP005',
    name: 'Dầu Nhớt Castrol',
    category: 'Phụ Tùng',
    price: 85000,
    cost: 65000,
    quantity: 0,
    description: 'Dầu nhớt Castrol 10W-30 1L',
  },
])
const searchTerm = ref('')

const getStockStatus = (quantity) => {
  if (quantity === 0) return 'out-of-stock'
  if (quantity <= LOW_STOCK_THRESHOLD) return 'low-stock'
  return 'in-stock'
}

const getStatusColorClass = (quantity) => {
  return stockStatusColors[getStockStatus(quantity)]
}

const getStockStatusText = (quantity) => {
  return stockStatusTextMap[getStockStatus(quantity)]
}

const saveProducts = () => {
  localStorage.setItem('products', JSON.stringify(products.value))
}

//Phân trang - gỉa lập
const totalPages = ref(10)
const currentPage = ref(1)
const isLoading = ref(false)

const fetchDataForPage = (page) => {
  console.log(`Bắt đầu tải dữ liệu cho trang ${page}...`)
  isLoading.value = true
  setTimeout(() => {
    console.log(`Tải xong dữ liệu cho trang ${page}!`)
    isLoading.value = false
  }, 1500)
}

watch(currentPage, (newPage, oldPage) => {
  if (newPage !== oldPage) {
    fetchDataForPage(newPage)
  }
})

watch(totalPages, (newTotal) => {
  if (currentPage.value > newTotal) {
    currentPage.value = newTotal > 0 ? newTotal : 1
  }
})

//Excel
const importExcel = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const workbook = XLSX.read(e.target.result, { type: 'binary' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const data = XLSX.utils.sheet_to_json(worksheet)

      const importedProducts = data.map((row) => ({
        code: (row['Mã SP'] || row['Code'] || '').toString().trim(),
        name: (row['Tên Sản Phẩm'] || row['Name'] || '').toString().trim(),
        category: (row['Danh Mục'] || row['Category'] || '').toString().trim(),
        price: parseFloat(row['Giá Bán'] || row['Price'] || 0),
        cost: parseFloat(row['Giá Vốn'] || row['Cost'] || 0),
        quantity: parseInt(row['Số Lượng'] || row['Quantity'] || 0),
        description: (row['Mô Tả'] || row['Description'] || '').toString().trim(),
      }))

      const newValidProducts = []
      const existingCodes = new Set(products.value.map((p) => p.code))

      for (const product of importedProducts) {
        if (product.code && product.name && !existingCodes.has(product.code)) {
          newValidProducts.push(product)
          existingCodes.add(product.code)
        } else {
          console.warn(
            `Sản phẩm với mã ${product.code} không hợp lệ hoặc đã tồn tại và sẽ bị bỏ qua.`,
          )
        }
      }
      if (newValidProducts.length > 0) {
        products.value.push(...newValidProducts)
        saveProducts()
      }
    } catch (error) {
      console.error('Error importing Excel:', error)
    }
  }
  reader.readAsBinaryString(file)
  event.target.value = '' // Reset file input
}

const exportExcel = () => {
  if (products.value.length === 0) {
    return
  }
  const exportData = products.value.map((product) => ({
    'Mã SP': product.code,
    'Tên Sản Phẩm': product.name,
    'Danh Mục': product.category,
    'Giá Bán': product.price,
    'Giá Vốn': product.cost,
    'Số Lượng': product.quantity,
    'Trạng Thái': getStockStatusText(product.quantity),
    'Mô Tả': product.description,
  }))
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(exportData)
  worksheet['!cols'] = [
    { wch: 10 },
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 10 },
    { wch: 15 },
    { wch: 30 },
  ]
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh Sách Sản Phẩm')
  const currentDate = new Date().toISOString().split('T')[0]
  const filename = `DanhSachSanPham_${currentDate}.xlsx`
  XLSX.writeFile(workbook, filename)
}
</script>

<style scoped>
@reference "../assets/main.css";
.box-style {
  @apply bg-gray-100 p-4 sm:p-6 rounded-xl shadow-lg;
}
.title-style {
  @apply text-3xl font-bold text-center text-gray-800;
}
.content-box-style {
  @apply flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0;
}
.sub-title-style {
  @apply text-2xl font-semibold text-gray-800;
}
.text-style {
  @apply text-sm text-gray-500;
}
.text-bold-style {
  @apply font-medium text-gray-700;
}
.action-button-style {
  @apply flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto;
}
.normal-cell-style {
  @apply py-3 px-6 text-left;
}
.center-cell-style {
  @apply py-3 px-6 text-center;
}
.table-style {
  @apply min-w-full bg-white rounded-lg overflow-hidden shadow-sm;
}
.table-header-style {
  @apply bg-gray-200 text-gray-600 uppercase text-sm leading-normal;
}
.table-body-style {
  @apply text-gray-600 text-sm font-light;
}
.not-found-text-style {
  @apply text-center py-6 text-gray-500;
}
.table-row-style {
  @apply border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200;
}
.file-input {
  @apply opacity-0 absolute -z-10;
}
</style>
