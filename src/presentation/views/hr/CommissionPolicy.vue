<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useHRStore } from '@stores/hr.store'
import { useProductStore } from '@stores/product.store'
import { useCategoryStore } from '@stores/category.store'
import { useToast } from 'vue-toastification'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import BaseModal from '@components/ui/DraggableModal.vue'
import BaseInput from '@components/ui/input/BaseInput.vue'
import BaseDropdown from '@components/ui/input/BaseDropdown.vue'
import BaseButton from '@components/ui/button/BaseButton.vue'

const hrStore = useHRStore()
const productStore = useProductStore()
const categoryStore = useCategoryStore()
const toast = useToast()

const { policies, loading } = storeToRefs(hrStore)

// --- State ---
const showModal = ref(false)
const isEdit = ref(false)
const activeTab = ref('vehicle') // 'vehicle' | 'parts'
const searchQuery = ref('')
const showAuditModal = ref(false)
const auditLogs = ref([])
const selectedPolicyForAudit = ref(null)

const initialForm = {
  id: 0,
  name: '',
  type: 'FixedAmount',
  value: 0,
  unit: 'xe',
  productId: null,
  categoryId: null,
  targetGroup: '',
  effectiveDate: new Date().toISOString().split('T')[0],
  notes: '',
  isActive: true
}
const form = ref({ ...initialForm })

const variantsLite = ref([])

onMounted(async () => {
  await hrStore.fetchCommissionPolicies()
  const res = await productStore.searchVariantsLiteForOutput({ search: '' })
  variantsLite.value = res.data || []
  await categoryStore.fetchCategories()
})

// --- Options ---
const productOptions = computed(() =>
  variantsLite.value?.map(v => ({ value: v.productId, text: v.displayName })) || []
)
const categoryOptions = computed(() =>
  categoryStore.categories?.map(c => ({ value: c.id, text: c.name })) || []
)
const typeOptions = [
  { value: 'FixedAmount', text: 'Số tiền cố định (VNĐ / đơn vị)' },
  { value: 'Percentage', text: 'Phần trăm (%) trên doanh thu' }
]
const unitOptions = [
  { value: 'xe', text: 'xe' },
  { value: 'cái', text: 'cái' },
  { value: 'bộ', text: 'bộ' },
  { value: 'đơn hàng', text: 'đơn hàng' }
]
const targetGroupOptions = [
  { value: '', text: 'Tất cả nhân viên' },
  { value: 'Sale', text: 'Nhân viên kinh doanh (Sale)' },
  { value: 'Manager', text: 'Quản lý showroom' },
  { value: 'Technician', text: 'Kỹ thuật viên' }
]

// --- Computed: Tabs filter ---
const vehiclePolicies = computed(() =>
  (policies.value || []).filter(p => p.type === 'FixedAmount')
    .filter(p => !searchQuery.value || p.name?.toLowerCase().includes(searchQuery.value.toLowerCase()))
)
const partsPolicies = computed(() =>
  (policies.value || []).filter(p => p.type === 'Percentage')
    .filter(p => !searchQuery.value || p.name?.toLowerCase().includes(searchQuery.value.toLowerCase()))
)

// --- Modal actions ---
const openAddModal = () => {
  isEdit.value = false
  form.value = {
    ...initialForm,
    type: activeTab.value === 'vehicle' ? 'FixedAmount' : 'Percentage',
    unit: activeTab.value === 'vehicle' ? 'xe' : 'cái'
  }
  showModal.value = true
}
const openEditModal = (policy) => {
  isEdit.value = true
  form.value = {
    ...policy,
    effectiveDate: policy.effectiveDate ? policy.effectiveDate.split('T')[0] : new Date().toISOString().split('T')[0]
  }
  showModal.value = true
}

const handleSave = async () => {
  const finalName = form.value.name || autoName.value
  if (!finalName) return toast.error('Vui lòng chọn đối tượng áp dụng để hệ thống tạo tên tự động')
  if (!form.value.value || form.value.value <= 0) return toast.error('Giá trị định mức phải lớn hơn 0')
  if (!form.value.productId && !form.value.categoryId && !form.value.targetGroup) {
    return toast.error('Vui lòng chọn ít nhất một đối tượng áp dụng')
  }
  const authStore = JSON.parse(localStorage.getItem('auth_store') || '{}')
  const payload = {
    ...form.value,
    name: finalName,
    type: detectedType.value,
    unit: detectedType.value === 'FixedAmount' ? 'xe' : 'cái',
    currentUserId: authStore.user?.id,
    currentUserName: authStore.user?.fullName || 'Admin'
  }
  try {
    await hrStore.saveCommissionPolicy(isEdit.value ? form.value.id : null, payload)
    toast.success(isEdit.value ? 'Cập nhật thành công' : 'Thêm định mức thành công')
    showModal.value = false
  } catch (err) {
    toast.error('Có lỗi xảy ra: ' + err.message)
  }
}

const handleDelete = async (id) => {
  if (!confirm('Bạn có chắc chắn muốn xóa chính sách này? Thao tác này không thể hoàn tác.')) return
  try {
    await hrStore.deleteCommissionPolicy(id)
    toast.success('Đã xóa chính sách')
  } catch (err) {
    toast.error('Lỗi khi xóa: ' + err.message)
  }
}

const handleToggleActive = async (policy) => {
  try {
    await hrStore.saveCommissionPolicy(policy.id, { ...policy, isActive: !policy.isActive })
    toast.success(policy.isActive ? 'Đã lưu trữ chính sách' : 'Đã kích hoạt lại chính sách')
  } catch (err) {
    toast.error('Lỗi: ' + err.message)
  }
}

const openAuditModal = async (policy) => {
  selectedPolicyForAudit.value = policy
  showAuditModal.value = true
  try {
    auditLogs.value = await hrStore.fetchPolicyAuditLogs(policy.id)
  } catch (err) {
    toast.error('Không thể tải lịch sử thay đổi')
  }
}

// --- Smart auto-detection khi chọn đối tượng ---
// Mở rộng từ khóa để nhận diện xe (bao gồm cả các hãng xe phổ biến)
const MOTORCYCLE_CATEGORY_KEYWORDS = ['xe máy', 'xe', 'motor', 'motorcycle', 'scooter', 'honda', 'yamaha', 'suzuki']

const selectedProduct = computed(() =>
  variantsLite.value?.find(v => v.productId === form.value.productId) || null
)
const selectedCategory = computed(() =>
  categoryStore.categories?.find(c => c.id === form.value.categoryId) || null
)

// Tự nhận diện loại thưởng dựa trên đối tượng được chọn
const detectedType = computed(() => {
  // 1. Kiểm tra theo Sản phẩm
  if (form.value.productId) {
    const p = variantsLite.value?.find(v => v.productId === form.value.productId)
    if (p) {
      // Ưu tiên kiểm tra qua Category của sản phẩm
      const catId = p.categoryId || p.category_id
      const cat = categoryStore.categories?.find(c => c.id === catId)
      
      if (cat) {
        const isVehicle = MOTORCYCLE_CATEGORY_KEYWORDS.some(k => cat.name?.toLowerCase().includes(k))
        if (isVehicle) return 'FixedAmount'
      }
      
      // Fallback: Kiểm tra ngay trong tên sản phẩm nếu category không khớp
      const isVehicleByName = MOTORCYCLE_CATEGORY_KEYWORDS.some(k => p.displayName?.toLowerCase().includes(k))
      if (isVehicleByName) return 'FixedAmount'
    }
    return 'Percentage' // Mặc định cho phụ tùng nếu không phải xe
  }

  // 2. Kiểm tra theo Danh mục
  if (form.value.categoryId) {
    const cat = categoryStore.categories?.find(c => c.id === form.value.categoryId)
    if (cat) {
      const isVehicle = MOTORCYCLE_CATEGORY_KEYWORDS.some(k => cat.name?.toLowerCase().includes(k))
      return isVehicle ? 'FixedAmount' : 'Percentage'
    }
  }

  return form.value.type || 'FixedAmount'
})

const detectedUnit = computed(() => detectedType.value === 'FixedAmount' ? 'xe' : '% doanh thu')
const detectedTypeLabel = computed(() => detectedType.value === 'FixedAmount' ? '💰 Số tiền cố định (VNĐ / xe)' : '📊 Phần trăm (%) trên doanh thu')

// Tự sinh tên nếu chưa nhập
const autoName = computed(() => {
  const target = selectedProduct.value?.displayName || selectedCategory.value?.name || form.value.targetGroup || ''
  if (!target || !form.value.effectiveDate) return ''
  const d = new Date(form.value.effectiveDate)
  const dateStr = d.toLocaleDateString('vi-VN')
  return `${target} - ${dateStr}`
})

// Sync type/unit vào form khi đối tượng thay đổi
watch([() => form.value.productId, () => form.value.categoryId], () => {
  form.value.type = detectedType.value
  form.value.unit = detectedType.value === 'FixedAmount' ? 'xe' : 'cái'
  if (!form.value._nameManuallySet) form.value.name = ''
})

// --- Computed preview formula ---
const previewFormula = computed(() => {
  if (!form.value.value) return ''
  if (detectedType.value === 'FixedAmount') {
    return `1 xe × ${Number(form.value.value).toLocaleString('vi-VN')}đ = ${Number(form.value.value).toLocaleString('vi-VN')}đ hoa hồng`
  } else {
    const result = 10_000_000 * (form.value.value / 100)
    return `10.000.000đ doanh thu × ${form.value.value}% = ${result.toLocaleString('vi-VN')}đ hoa hồng`
  }
})
</script>

<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto space-y-6">

      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Bảng Định mức Hoa hồng</h1>
          <p class="text-gray-500 mt-1 text-sm">Thiết lập quy tắc thưởng — hệ thống tự động tra cứu & tính toán khi đơn hàng hoàn thành</p>
        </div>
        <BaseButton @click="openAddModal" color="primary" text="+ Thêm định mức" />
      </div>

      <!-- Quy trình 3 trạng thái -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center text-lg font-bold">1</div>
            <div>
              <div class="font-bold text-gray-800 text-sm">Tạm tính (Pending)</div>
              <div class="text-xs text-amber-600 font-medium">Processing / Confirmed</div>
            </div>
          </div>
          <p class="text-xs text-gray-500 leading-relaxed">Sale nhìn thấy con số dự kiến để có động lực chăm sóc khách. Chưa chốt vào ví.</p>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-green-100 shadow-sm">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-lg font-bold">2</div>
            <div>
              <div class="font-bold text-gray-800 text-sm">Ghi nhận (Confirmed)</div>
              <div class="text-xs text-green-600 font-medium">Khi đơn Completed</div>
            </div>
          </div>
          <p class="text-xs text-gray-500 leading-relaxed">Hệ thống chốt số tiền, lưu ảnh chụp chính sách (Snapshot) — không thay đổi dù định mức cập nhật sau.</p>
        </div>
        <div class="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-lg font-bold">3</div>
            <div>
              <div class="font-bold text-gray-800 text-sm">Đã chi trả (Paid)</div>
              <div class="text-xs text-blue-600 font-medium">Admin duyệt cuối tháng</div>
            </div>
          </div>
          <p class="text-xs text-gray-500 leading-relaxed">Admin nhấn "Duyệt chi" — tiền được chuyển vào lịch sử lương của nhân viên.</p>
        </div>
      </div>

      <!-- Công thức tính -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-2xl p-5">
          <div class="font-bold text-red-700 mb-2 flex items-center gap-2">
            <font-awesome-icon icon="motorcycle" />
            Xe máy — Số tiền cố định
          </div>
          <div class="text-sm text-gray-700 font-mono bg-white/60 rounded-lg p-3">
            Hoa hồng = <span class="text-red-600 font-bold">Số lượng</span> × <span class="text-red-600 font-bold">Mức thưởng / xe</span>
          </div>
          <p class="text-xs text-gray-500 mt-2">Ví dụ: 1 Winner X × 500.000đ = <strong>500.000đ</strong></p>
        </div>
        <div class="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-5">
          <div class="font-bold text-blue-700 mb-2 flex items-center gap-2">
            <font-awesome-icon icon="gears" />
            Phụ tùng / Phụ kiện — Phần trăm %
          </div>
          <div class="text-sm text-gray-700 font-mono bg-white/60 rounded-lg p-3">
            Hoa hồng = <span class="text-blue-600 font-bold">Doanh thu</span> × <span class="text-blue-600 font-bold">% Thưởng</span>
          </div>
          <p class="text-xs text-gray-500 mt-2">Ví dụ: 10.000.000đ × 5% = <strong>500.000đ</strong></p>
        </div>
      </div>

      <!-- Tabs + Search -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="flex items-center justify-between p-4 border-b border-gray-50 gap-4">
          <div class="flex gap-1 bg-gray-100 rounded-xl p-1">
            <button
              @click="activeTab = 'vehicle'"
              :class="activeTab === 'vehicle' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
              class="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            >
              🏍️ Xe máy (Cố định)
              <span class="ml-1 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">{{ vehiclePolicies.length }}</span>
            </button>
            <button
              @click="activeTab = 'parts'"
              :class="activeTab === 'parts' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
              class="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            >
              🔧 Phụ tùng / Phụ kiện (%)
              <span class="ml-1 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">{{ partsPolicies.length }}</span>
            </button>
          </div>
          <input
            v-model="searchQuery"
            placeholder="Tìm kiếm định mức..."
            class="border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-300 w-56"
          />
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="bg-gray-50/80">
              <tr>
                <th class="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Tên định mức / Đối tượng</th>
                <th class="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Ngày hiệu lực</th>
                <th class="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Giá trị thưởng</th>
                <th class="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                <th class="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Ghi chú</th>
                <th class="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <template v-if="loading && !policies.length">
                <tr><td colspan="6" class="px-5 py-10 text-center text-gray-400 italic">Đang tải dữ liệu...</td></tr>
              </template>
              <template v-else-if="(activeTab === 'vehicle' ? vehiclePolicies : partsPolicies).length === 0">
                <tr><td colspan="6" class="px-5 py-10 text-center text-gray-400">Chưa có định mức nào. Nhấn "Thêm định mức" để thiết lập.</td></tr>
              </template>
              <tr
                v-else
                v-for="policy in (activeTab === 'vehicle' ? vehiclePolicies : partsPolicies)"
                :key="policy.id"
                class="hover:bg-gray-50 transition-colors group"
              >
                <td class="px-5 py-4">
                  <div class="font-semibold text-gray-900">{{ policy.name }}</div>
                  <div class="text-xs text-gray-400 mt-0.5">
                    {{ policy.product?.name || policy.category?.name || policy.targetGroup || 'Áp dụng chung' }}
                  </div>
                </td>
                <td class="px-5 py-4 text-gray-600">
                  {{ policy.effectiveDate && !policy.effectiveDate.startsWith('0001') ? formatDate(policy.effectiveDate) : '—' }}
                </td>
                <td class="px-5 py-4 font-bold text-gray-900">
                  <span :class="policy.type === 'FixedAmount' ? 'text-red-600' : 'text-blue-600'">
                    {{ policy.type === 'FixedAmount' ? formatCurrency(policy.value) : policy.value + '%' }}
                  </span>
                  <span class="text-xs text-gray-400 font-normal ml-1">
                    {{ policy.type === 'FixedAmount' ? '/ ' + (policy.unit || 'xe') : '% doanh thu' }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  <span
                    :class="policy.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
                    class="px-2.5 py-1 rounded-full text-xs font-semibold"
                  >
                    {{ policy.isActive ? 'Đang áp dụng' : 'Đã lưu trữ' }}
                  </span>
                </td>
                <td class="px-5 py-4 text-gray-500 italic max-w-xs truncate text-xs">{{ policy.notes || '—' }}</td>
                <td class="px-5 py-4 text-right">
                  <div class="flex justify-end gap-1">
                    <button
                      @click="openEditModal(policy)"
                      class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Chỉnh sửa định mức"
                    >
                      <font-awesome-icon icon="pen-to-square" />
                    </button>
                    <button
                      @click="openAuditModal(policy)"
                      class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Xem lịch sử thay đổi (Audit Log)"
                    >
                      <font-awesome-icon icon="history" />
                    </button>
                    <button
                      @click="handleToggleActive(policy)"
                      :class="policy.isActive ? 'text-amber-500 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'"
                      class="p-2 rounded-lg transition-colors"
                      :title="policy.isActive ? 'Lưu trữ (Archive)' : 'Kích hoạt lại'"
                    >
                      <font-awesome-icon :icon="policy.isActive ? 'box-archive' : 'rotate-left'" />
                    </button>
                    <button
                      @click="handleDelete(policy.id)"
                      class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa vĩnh viễn"
                    >
                      <font-awesome-icon icon="trash" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="px-5 py-3 bg-gray-50/50 border-t border-gray-50 text-xs text-gray-400 italic">
          * Hệ thống ưu tiên: Định mức theo <strong>Sản phẩm</strong> > <strong>Danh mục</strong> > <strong>Nhóm nhân viên</strong>. Tra cứu theo <strong>Ngày hiệu lực</strong>.
        </div>
      </div>
    </div>

    <!-- ===================== MODAL THÊM / SỬA ===================== -->
    <BaseModal v-if="showModal" :show="showModal" @close="showModal = false" width="560px">
      <template #header>
        <h3 class="text-lg font-bold text-gray-900">
          {{ isEdit ? '✏️ Cập nhật định mức' : '➕ Thêm định mức mới' }}
        </h3>
      </template>

      <template #body>
        <div class="space-y-5">

          <!-- BƯỚC 1: Chọn đối tượng -->
          <div class="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50">
            <p class="text-xs font-bold text-gray-600 uppercase tracking-wider">① Chọn đối tượng áp dụng</p>
            <BaseDropdown
              label="Theo sản phẩm cụ thể (Ưu tiên cao nhất)"
              v-model="form.productId"
              :options="[{ value: null, text: '-- Không chọn --' }, ...productOptions]"
            />
            <BaseDropdown
              label="Hoặc theo danh mục hàng"
              v-model="form.categoryId"
              :options="[{ value: null, text: '-- Không chọn --' }, ...categoryOptions]"
            />
            <BaseDropdown
              label="Hoặc theo nhóm nhân viên"
              v-model="form.targetGroup"
              :options="targetGroupOptions"
            />
          </div>

          <!-- BƯỚC 2: Hệ thống tự nhận diện -->
          <div
            v-if="form.productId || form.categoryId"
            :class="detectedType === 'FixedAmount' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-blue-50 border-blue-100 text-blue-700'"
            class="rounded-xl px-4 py-3 border text-sm font-medium flex items-center gap-2"
          >
            <font-awesome-icon :icon="detectedType === 'FixedAmount' ? 'motorcycle' : 'gears'" />
            <span>Hệ thống nhận diện: <strong>{{ detectedTypeLabel }}</strong></span>
            <span class="ml-auto text-xs opacity-70 font-normal">Tự động — không thể thay đổi</span>
          </div>

          <!-- BƯỚC 3: Chỉ nhập giá trị -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              ② Giá trị định mức
              <span v-if="detectedType === 'FixedAmount'" class="text-gray-400 font-normal ml-1">(VNĐ / xe)</span>
              <span v-else class="text-gray-400 font-normal ml-1">(% trên doanh thu)</span>
            </label>
            <div class="flex items-center gap-2">
              <input
                v-model.number="form.value"
                type="number"
                min="0"
                :placeholder="detectedType === 'FixedAmount' ? '500000' : '5'"
                class="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              />
              <span class="text-sm font-semibold text-gray-500 whitespace-nowrap">
                {{ detectedType === 'FixedAmount' ? 'VNĐ / xe' : '% doanh thu' }}
              </span>
            </div>
          </div>

          <!-- Preview công thức -->
          <div v-if="form.value > 0" class="bg-indigo-50 rounded-xl px-4 py-3 text-sm text-indigo-700 border border-indigo-100">
            <span class="font-semibold">Xem trước: </span>{{ previewFormula }}
          </div>

          <!-- BƯỚC 4: Ngày hiệu lực -->
          <BaseInput label="③ Ngày hiệu lực" v-model="form.effectiveDate" type="date" required />

          <!-- Tên tự sinh -->
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700">
              Tên chính sách
              <span class="text-xs text-gray-400 font-normal ml-1">(tùy chọn — bỏ trống để tự sinh)</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              :placeholder="autoName || 'Chọn đối tượng & ngày để tự sinh tên...' "
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-300"
            />
            <p v-if="autoName && !form.name" class="text-xs text-green-600">
              ✅ Hệ thống sẽ dùng: <strong>{{ autoName }}</strong>
            </p>
          </div>

          <!-- Ghi chú + Trạng thái -->
          <div class="grid grid-cols-2 gap-3">
            <BaseInput label="Ghi chú" v-model="form.notes" placeholder="Lý do, chiến dịch..." />
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-gray-700">Trạng thái</label>
              <label class="flex items-center gap-2 mt-2 cursor-pointer">
                <input type="checkbox" v-model="form.isActive" class="w-4 h-4 rounded" />
                <span class="text-sm" :class="form.isActive ? 'text-green-600 font-semibold' : 'text-gray-500'">
                  {{ form.isActive ? 'Đang áp dụng' : 'Lưu trữ' }}
                </span>
              </label>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3 w-full">
          <BaseButton text="Hủy" color="gray" @click="showModal = false" />
          <BaseButton :text="isEdit ? 'Lưu thay đổi' : 'Tạo định mức'" color="primary" @click="handleSave" :loading="loading" />
        </div>
      </template>
    </BaseModal>

    <!-- ===================== MODAL AUDIT LOG ===================== -->
    <BaseModal v-if="showAuditModal" :show="showAuditModal" @close="showAuditModal = false" width="700px">
      <template #header>
        <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <font-awesome-icon icon="history" class="text-indigo-600" />
          Lịch sử thay đổi: {{ selectedPolicyForAudit?.name }}
        </h3>
      </template>

      <template #body>
        <div class="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          <div v-if="!auditLogs.length" class="py-10 text-center text-gray-400 italic">
            Chưa có lịch sử thay đổi nào được ghi nhận.
          </div>
          <div 
            v-for="log in auditLogs" 
            :key="log.id" 
            class="border-l-2 border-indigo-200 pl-4 py-2 space-y-1 relative"
          >
            <div class="absolute -left-[5px] top-3 w-2 h-2 rounded-full bg-indigo-500"></div>
            <div class="flex justify-between items-start">
              <span class="text-xs font-bold text-indigo-600 uppercase">{{ log.action }}</span>
              <span class="text-[10px] text-gray-400 font-medium">{{ formatDate(log.changedAt) }}</span>
            </div>
            <p class="text-sm text-gray-800 font-medium">{{ log.description }}</p>
            <div class="flex items-center gap-2 text-[10px] text-gray-500">
              <font-awesome-icon icon="user-circle" class="opacity-50" />
              <span>Thực hiện bởi: <strong>{{ log.changedByName }}</strong></span>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end w-full">
          <BaseButton text="Đóng" color="gray" @click="showAuditModal = false" />
        </div>
      </template>
    </BaseModal>
  </div>
</template>
