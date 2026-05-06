<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Hồ sơ Nhân sự</h1>
          <p class="text-gray-500 mt-1">Quản lý thông tin chi tiết và hồ sơ năng lực của đội ngũ AnhEmMotor</p>
        </div>
        <button
          @click="handleAdd"
          class="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"
        >
          <font-awesome-icon icon="user-plus" />
          <span>Thêm nhân sự</span>
        </button>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 border-b border-gray-50 bg-gray-50/50 flex flex-wrap gap-4 items-center justify-between">
          <div class="relative w-full max-w-md">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <font-awesome-icon icon="magnifying-glass" />
            </span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Tìm kiếm nhân viên (Tên, Mã, SĐT...)"
              class="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all text-sm"
            />
          </div>
          <div class="flex gap-2">
            <select v-model="filterRole" class="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500/20">
              <option value="">Tất cả vị trí</option>
              <option value="Trưởng phòng">Trưởng phòng</option>
              <option value="Sale">Sale</option>
              <option value="Kế toán">Kế toán</option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nhân viên</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Chức danh</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày ký HĐ</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lương cơ bản</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="emp in filteredEmployees" :key="emp.id" class="hover:bg-gray-50 transition-colors group">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                      {{ emp.fullName?.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div class="font-medium text-gray-900">{{ emp.fullName }}</div>
                      <div class="text-xs text-gray-500">{{ emp.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm">
                  <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {{ emp.jobTitle }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">
                  {{ new Date(emp.contractDate).toLocaleDateString('vi-VN') }}
                </td>
                <td class="px-6 py-4 text-sm font-semibold text-gray-900">
                  {{ formatPrice(emp.baseSalary) }}
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex justify-end gap-2">
                    <button @click="handleView(emp)" class="flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-gray-100 hover:border-red-100 uppercase tracking-wider"><font-awesome-icon icon="eye" />
                      <span>Xem</span>
                    </button>
                    <button @click="handleEdit(emp)" class="flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-gray-100 hover:border-red-100 uppercase tracking-wider"><font-awesome-icon icon="pencil" />
                      <span>Sửa</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredEmployees.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-gray-500 italic">
                  Chưa có hồ sơ nhân sự nào phù hợp
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <EmployeeFormModal
      v-if="showFormModal"
      :employee="selectedEmployee"
      :isEditMode="isEditMode"
      :isSaving="isSaving"
      @close="showFormModal = false"
      @save="handleSaveEmployee"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useHRStore } from '@stores/hr.store'
import { useToast } from 'vue-toastification'
import EmployeeFormModal from '@components/hr/EmployeeFormModal.vue'

const hrStore = useHRStore()
const toast = useToast()

const searchQuery = ref('')
const filterRole = ref('')

const showFormModal = ref(false)
const selectedEmployee = ref(null)
const isEditMode = ref(false)
const isSaving = ref(false)

onMounted(() => {
  hrStore.fetchEmployees()
})

const employees = computed(() => hrStore.employees)

const handleAdd = () => {
  selectedEmployee.value = null
  isEditMode.value = true
  showFormModal.value = true
}

const handleView = (emp) => {
  selectedEmployee.value = { ...emp }
  isEditMode.value = false
  showFormModal.value = true
}

const handleEdit = (emp) => {
  selectedEmployee.value = { ...emp }
  isEditMode.value = true
  showFormModal.value = true
}

const handleSaveEmployee = async (payload) => {
  isSaving.value = true
  try {
    const isUpdate = !!payload.id
    await hrStore.saveEmployee(payload.id, payload)
    toast.success(isUpdate ? 'Cập nhật hồ sơ thành công' : 'Thêm nhân sự mới thành công')
    showFormModal.value = false
  } catch (err) {
    toast.error(err.message || 'Lỗi khi lưu hồ sơ')
  } finally {
    isSaving.value = false
  }
}

const filteredEmployees = computed(() => {
  return employees.value.filter(emp => {
    const fullName = emp.fullName || ''
    const email = emp.email || ''
    const matchesSearch = fullName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         email.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesRole = !filterRole.value || emp.jobTitle === filterRole.value
    return matchesSearch && matchesRole
  })
})

const formatPrice = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}
</script>
