<template>
  <div class="box-style">
    <div class="content-box-style">
      <div>
        <h1 class="title-style">Quản lý sản phẩm</h1>
      </div>
      <div class="action-button-style">
        <BaseButton text="Thêm sản phẩm" color="purple" @click="openAddEditModal()" />
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
              <BaseSmallNoBgButton @click="openAddEditModal(product)">Sửa</BaseSmallNoBgButton>
              <BaseSmallNoBgButton color="red" @click="promptDelete(product.code)">
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

  <DraggableModal :key="formModalKey" v-if="isFormModalVisible" @close="handleCloseFormModal">
    <template #header>
      <h2 class="font-bold text-lg">{{ formModalTitle }}</h2>
    </template>
    <template #body>
      <ProductForm
        v-model="editableProduct"
        :is-edit-mode="isEditMode"
        :errors="formErrors"
        @update:dirty="isFormDirty = $event"
      />
    </template>
    <template #footer>
      <div class="flex justify-end space-x-2">
        <BaseButton text="Bỏ qua" color="gray" @click="handleCloseFormModal" />
        <BaseButton text="Lưu" color="purple" @click="handleSaveProduct" />
      </div>
    </template>
  </DraggableModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import ProductFilterButtons from '@/components/product/ProductFilterButtons.vue'
import ProductForm from '@/components/product/ProductForm.vue'
import BaseButton from '@/components/ui/button/BaseButton.vue'
import BaseInput from '@/components/ui/input/BaseInput.vue'
import BasePagination from '@/components/ui/button/BasePagination.vue'
import BaseSmallNoBgButton from '@/components/ui/button/BaseSmallNoBgButton.vue'
import RoundBadge from '@/components/ui/RoundBadge.vue'
import { showConfirmation } from '@/composables/confirmation'
import DraggableModal from '@/components/ui/DraggableModal.vue'

// Form Modal State
const isFormModalVisible = ref(false)
const isFormDirty = ref(false)
const editableProduct = ref({})
const formModalTitle = ref('')
const formModalKey = ref(0)

const isEditMode = computed(
  () =>
    !!editableProduct.value?.code &&
    products.value.some((p) => p.code === editableProduct.value.code),
)

const openAddEditModal = (product = null) => {
  const openForm = () => {
    // Reset form errors when opening a new form
    formErrors.value = { code: '', name: '', category: '', price: '' }
    if (product) {
      editableProduct.value = { ...product }
      formModalTitle.value = 'Chỉnh Sửa Sản Phẩm'
    } else {
      editableProduct.value = {
        code: '',
        name: '',
        category: '',
        price: null,
        cost: null,
        quantity: null,
        description: '',
      }
      formModalTitle.value = 'Thêm Sản Phẩm Mới'
    }
    isFormDirty.value = false
    formModalKey.value++
    isFormModalVisible.value = true
  }

  if (isFormModalVisible.value && isFormDirty.value) {
    showConfirmation(
      'Mở biểu mẫu mới?',
      'Bạn có các thay đổi chưa lưu. Bạn có chắc muốn hủy và mở một biểu mẫu mới không?',
      openForm,
    )
  } else {
    openForm()
  }
}

const handleCloseFormModal = () => {
  if (isFormDirty.value) {
    showConfirmation(
      'Đóng biểu mẫu?',
      'Bạn có các thay đổi chưa lưu. Bạn có chắc muốn đóng không?',
      () => {
        isFormModalVisible.value = false
      },
    )
  } else {
    isFormModalVisible.value = false
  }
}

// Form validation errors
const formErrors = ref({ code: '', name: '', category: '', price: '' })

const handleSaveProduct = () => {
  const productData = editableProduct.value
  // Reset errors

  formErrors.value = { code: '', name: '', category: '', price: '' }
  let hasError = false
  if (!productData.code) {
    formErrors.value.code = 'Vui lòng nhập mã sản phẩm.'
    hasError = true
  }
  if (!productData.name) {
    formErrors.value.name = 'Vui lòng nhập tên sản phẩm.'
    hasError = true
  }
  if (!productData.category) {
    formErrors.value.category = 'Vui lòng nhập danh mục.'
    hasError = true
  }
  if (
    productData.price === null ||
    productData.price === undefined ||
    productData.price === '' ||
    isNaN(productData.price)
  ) {
    formErrors.value.price = 'Vui lòng nhập giá bán.'
    hasError = true
  }
  if (hasError) return

  if (isEditMode.value) {
    // Update
    const index = products.value.findIndex((p) => p.code === productData.code)
    if (index !== -1) {
      products.value[index] = productData
    }
  } else {
    // Add new
    if (products.value.some((p) => p.code === productData.code)) {
      formErrors.value.code = `Mã sản phẩm "${productData.code}" đã tồn tại.`
      return
    }
    products.value.unshift(productData)
  }
  saveProducts()
  isFormModalVisible.value = false
}

// Delete confirmation uses global confirmation modal
const promptDelete = async (code) => {
  const title = 'Xác nhận xóa'
  const message = `Bạn có chắc chắn muốn xóa sản phẩm có mã ${code}? Hành động này không thể hoàn tác.`
  const confirmed = await showConfirmation(title, message)
  if (!confirmed) return
  const index = products.value.findIndex((p) => p.code === code)
  if (index !== -1) {
    products.value.splice(index, 1)
    saveProducts()
  }
}

// Confirmation handled via global confirmation modal

// Table and Data
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

// Pagination
const totalPages = ref(10)
const currentPage = ref(1)
const isLoading = ref(false)

const fetchDataForPage = () => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 1500)
}

watch(currentPage, (newPage, oldPage) => {
  if (newPage !== oldPage) {
    fetchDataForPage(newPage)
  }
})
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
</style>
