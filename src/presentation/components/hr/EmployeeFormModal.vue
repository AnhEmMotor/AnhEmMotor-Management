<template>
  <DraggableModal
    :title="isNewEmployee ? 'Thêm nhân sự mới' : (isEditMode ? 'Chỉnh sửa hồ sơ nhân sự' : 'Chi tiết hồ sơ nhân sự')"
    :width="'800px'"
    @close="$emit('close')"
  >
    <template #body>
      <div class="space-y-6">
        <!-- Header Profile -->
        <div class="flex items-center gap-5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div class="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-3xl font-bold shadow-inner">
            {{ localEmployee.fullName?.charAt(0).toUpperCase() || '?' }}
          </div>
          <div class="flex-1">
            <template v-if="isNewEmployee">
              <div class="grid grid-cols-2 gap-4">
                <Input
                  label="Họ và tên"
                  v-model="localEmployee.fullName"
                  placeholder="Nhập họ tên..."
                />
                <Input
                  label="Email"
                  v-model="localEmployee.email"
                  placeholder="Nhập email..."
                />
              </div>
            </template>
            <template v-else>
              <h3 class="text-xl font-bold text-gray-900">{{ localEmployee.fullName }}</h3>
              <p class="text-gray-500">{{ localEmployee.email }}</p>
              <div class="mt-2">
                <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">
                  {{ localEmployee.jobTitle }}
                </span>
              </div>
            </template>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Personal Info Section -->
          <div class="space-y-4">
            <h4 class="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-2">Thông tin cá nhân</h4>
            
            <Input
              label="Số CCCD / CMND"
              v-model="localEmployee.identityNumber"
              placeholder="Nhập số định danh..."
              :disabled="!isEditMode && !isNewEmployee"
            />
            
            <Textarea
              label="Địa chỉ thường trú"
              v-model="localEmployee.address"
              placeholder="Nhập địa chỉ..."
              :rows="2"
              :disabled="!isEditMode && !isNewEmployee"
            />

            <Input
              label="Ngày ký hợp đồng"
              type="date"
              v-model="formattedContractDate"
              :disabled="!isEditMode && !isNewEmployee"
            />
          </div>

          <!-- Professional Info Section -->
          <div class="space-y-4">
            <h4 class="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-2">Thông tin công việc</h4>
            
            <div class="flex flex-col">
              <label class="text-sm font-bold text-gray-700 mb-1">Vị trí / Chức danh</label>
              <select 
                v-model="localEmployee.jobTitle" 
                :disabled="!isEditMode && !isNewEmployee"
                class="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="Trưởng phòng">Trưởng phòng</option>
                <option value="Sale">Sale</option>
                <option value="Kế toán">Kế toán</option>
                <option value="Kỹ thuật viên">Kỹ thuật viên</option>
                <option value="Chuyên viên tư vấn">Chuyên viên tư vấn</option>
              </select>
            </div>

            <Input
              label="Lương cơ bản (VNĐ)"
              type="number"
              v-model.number="localEmployee.baseSalary"
              placeholder="0"
              :disabled="!isEditMode && !isNewEmployee"
            />

            <div class="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
              <div class="flex items-center gap-2 text-yellow-800 font-bold text-sm mb-2">
                <i class="fas fa-university"></i>
                <span>Thông tin tài khoản lương</span>
              </div>
              <div class="space-y-3">
                <Input
                  label="Ngân hàng"
                  v-model="localEmployee.bankName"
                  placeholder="Tên ngân hàng..."
                  class="bg-white"
                  :disabled="!isEditMode && !isNewEmployee"
                />
                <Input
                  label="Số tài khoản"
                  v-model="localEmployee.bankAccountNumber"
                  placeholder="Số tài khoản..."
                  class="bg-white"
                  :disabled="!isEditMode && !isNewEmployee"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <Button
          text="Đóng"
          color="gray"
          @click="$emit('close')"
        />
        <Button
          v-if="isEditMode || isNewEmployee"
          :text="isNewEmployee ? 'Tạo nhân sự' : 'Cập nhật hồ sơ'"
          color="primary"
          :loading="isSaving"
          @click="handleSave"
        />
      </div>
    </template>
  </DraggableModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import DraggableModal from '@components/ui/DraggableModal.vue'
import Input from '@components/ui/input/BaseInput.vue'
import Textarea from '@components/ui/input/BaseTextarea.vue'
import Button from '@components/ui/button/BaseButton.vue'

const props = defineProps({
  employee: {
    type: Object,
    default: () => ({})
  },
  isEditMode: {
    type: Boolean,
    default: false
  },
  isSaving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save'])

const createDefaultEmployee = () => ({
  fullName: '',
  email: '',
  jobTitle: 'Sale',
  identityNumber: '',
  address: '',
  contractDate: new Date().toISOString().split('T')[0],
  baseSalary: 0,
  bankName: '',
  bankAccountNumber: ''
})

const localEmployee = ref(props.employee?.id ? { ...props.employee } : createDefaultEmployee())

const isNewEmployee = computed(() => !localEmployee.value.id)

const formattedContractDate = computed({
  get: () => {
    if (!localEmployee.value.contractDate) return ''
    try {
      const date = new Date(localEmployee.value.contractDate)
      return date.toISOString().split('T')[0]
    } catch (e) {
      return ''
    }
  },
  set: (val) => {
    localEmployee.value.contractDate = val
  }
})

const handleSave = () => {
  emit('save', localEmployee.value)
}

watch(() => props.employee, (newVal) => {
  localEmployee.value = newVal?.id ? { ...newVal } : createDefaultEmployee()
}, { deep: true })
</script>
