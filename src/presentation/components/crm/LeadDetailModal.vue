<script setup>
import { ref, computed, watch } from 'vue'
import DraggableModal from '@components/ui/DraggableModal.vue'
import BaseInput from '@components/ui/input/BaseInput.vue'
import { useLeadStore } from '@stores/lead.store'
import { useToast } from 'vue-toastification'

const props = defineProps({
  lead: {
    type: Object,
    default: null
  },
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'updated'])

const leadStore = useLeadStore()
const toast = useToast()
const isSaving = ref(false)
const newNote = ref('')
const isAddingNote = ref(false)
const activeTab = ref('Timeline')

const tabs = [
  { id: 'Timeline', label: 'Dòng thời gian', icon: 'history' },
  { id: 'AI', label: 'Trợ lý AI', icon: 'robot' },
  { id: 'Notes', label: 'Ghi chú nội bộ', icon: 'pencil' },
  { id: 'Assets', label: 'Tài sản & Hồ sơ', icon: 'file-invoice' },
]

const form = ref({
  id: 0,
  fullName: '',
  email: '',
  phoneNumber: '',
  gender: '',
  birthday: '',
  identificationNumber: '',
  addressDetail: '',
  ward: '',
  district: 'Biên Hòa',
  province: 'Đồng Nai',
  status: '',
  source: 'WebStore',
  interestedVehicle: '',
  score: 0
})

const sortedActivities = computed(() => {
  if (!props.lead?.activities) return []
  return [...props.lead.activities].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const aiActivities = computed(() => {
  return sortedActivities.value.filter(a => a.activityType === 'AI_Query')
})

const internalNotes = computed(() => {
  return sortedActivities.value.filter(a => a.activityType === 'Note')
})

const aiSummary = computed(() => {
  if (aiActivities.value.length === 0) return 'Chưa có đủ dữ liệu để phân tích nhu cầu.'
  return `Khách hàng đang quan tâm đặc biệt đến dòng xe ${form.value.interestedVehicle || 'Honda'}. Đã hỏi AI về các thông số kỹ thuật và so sánh giá bán. Độ sẵn sàng mua xe được đánh giá ở mức cao dựa trên điểm tiềm năng ${form.value.score}%.`
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const initializeForm = () => {
  if (props.lead) {
    form.value = {
      ...props.lead,
      birthday: props.lead.birthday ? props.lead.birthday.split('T')[0] : ''
    }
  }
}

const handleSave = async () => {
  isSaving.value = true
  try {
    await leadStore.updateLead(form.value)
    toast.success('Cập nhật hồ sơ thành công!')
    emit('updated')
  } catch (error) {
    toast.error('Lỗi khi cập nhật hồ sơ.')
  } finally {
    isSaving.value = false
  }
}

const handleAddNote = async () => {
  if (!newNote.value.trim() || !props.lead?.id) return
  isAddingNote.value = true
  try {
    await leadStore.addActivity(props.lead.id, {
      leadId: props.lead.id,
      activityType: 'Note',
      description: newNote.value.trim()
    })
    toast.success('Đã thêm ghi chú')
    newNote.value = ''
    emit('updated')
  } catch (error) {
    toast.error('Lỗi khi thêm ghi chú.')
  } finally {
    isAddingNote.value = false
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'New': return 'Mới'
    case 'Consulting': return 'Đang tư vấn'
    case 'TestDriving': return 'Đang lái thử'
    case 'Negotiating': return 'Thương lượng'
    case 'Closed': return 'Đã chốt'
    default: return status
  }
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) initializeForm()
}, { immediate: true })
</script>

<template>
  <DraggableModal
    v-if="isOpen"
    title="Hồ sơ khách hàng 360°"
    width="1300px"
    @close="emit('close')"
  >
    <div class="flex h-[85vh] overflow-hidden bg-gray-50/50">
      <!-- CỘT TRÁI (25% - Thông tin định danh) - Sticky simulation -->
      <aside class="w-[350px] border-r border-gray-100 bg-white overflow-y-auto custom-scrollbar p-8 flex flex-col gap-8 shrink-0">
        <!-- Identity Card -->
        <div class="text-center">
          <div class="w-24 h-24 bg-gradient-to-br from-red-500 to-rose-700 rounded-[2rem] mx-auto flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-red-100 mb-4 border-4 border-white">
            {{ form.fullName?.charAt(0) || 'K' }}
          </div>
          <h2 class="text-xl font-black text-gray-900 uppercase italic tracking-tighter mb-1">{{ form.fullName }}</h2>
          <div class="inline-flex px-4 py-1 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-widest border border-purple-200">
            {{ getStatusLabel(form.status) }}
          </div>
        </div>

        <!-- Quick Contact -->
        <section class="space-y-4">
          <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
            <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            Liên hệ nhanh
          </h3>
          <div class="grid grid-cols-1 gap-2">
            <a :href="`tel:${form.phoneNumber}`" class="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-green-50 transition-colors group">
              <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 group-hover:text-green-600 shadow-sm transition-colors">
                <font-awesome-icon icon="phone" class="text-xs" />
              </div>
              <span class="text-sm font-bold text-gray-700">{{ form.phoneNumber }}</span>
            </a>
            <a :href="`https://zalo.me/${form.phoneNumber}`" target="_blank" class="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-colors group">
              <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 group-hover:text-blue-600 shadow-sm transition-colors">
                <font-awesome-icon icon="comment-dots" class="text-xs" />
              </div>
              <span class="text-sm font-bold text-gray-700">Nhắn tin Zalo</span>
            </a>
          </div>
        </section>

        <!-- Registration Data (Quan trọng nhất tại Biên Hòa) -->
        <section class="space-y-6">
          <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 flex items-center gap-2">
            <font-awesome-icon icon="id-card" />
            Dữ liệu làm biển số
          </h3>
          
          <div class="space-y-4">
            <BaseInput v-model="form.addressDetail" label="Địa chỉ chi tiết" placeholder="Số nhà, tên đường..." />
            <BaseInput v-model="form.ward" label="Phường/Xã" placeholder="Ví dụ: Trảng Dài" />
            <BaseInput v-model="form.identificationNumber" label="Số CCCD" placeholder="Nhập 12 số CCCD" />
            
            <div class="space-y-2">
              <label class="block text-[10px] font-black uppercase tracking-widest text-gray-400">Ảnh CCCD (Mặt trước/sau)</label>
              <div class="grid grid-cols-2 gap-2">
                <div class="aspect-[1.6/1] rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 hover:border-red-300 hover:text-red-400 transition-all cursor-pointer bg-gray-50">
                  <font-awesome-icon icon="plus" class="mb-1" />
                  <span class="text-[8px] font-bold">Mặt trước</span>
                </div>
                <div class="aspect-[1.6/1] rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 hover:border-red-300 hover:text-red-400 transition-all cursor-pointer bg-gray-50">
                  <font-awesome-icon icon="plus" class="mb-1" />
                  <span class="text-[8px] font-bold">Mặt sau</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Source -->
        <section class="mt-auto pt-8 border-t border-gray-100">
          <div class="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span>Nguồn khách</span>
            <span class="text-red-600">{{ form.source || 'Website' }}</span>
          </div>
        </section>
      </aside>

      <!-- CỘT PHẢI (75% - Lịch sử & Tư vấn) -->
      <main class="flex-1 flex flex-col overflow-hidden bg-white">
        <!-- Tabs Header -->
        <header class="p-8 border-b border-gray-100 shrink-0">
          <div class="flex bg-gray-50 p-1.5 rounded-[2rem] border border-gray-100 w-fit">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'px-6 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-3',
                activeTab === tab.id ? 'bg-white text-red-600 shadow-xl shadow-gray-200/50' : 'text-gray-400 hover:text-gray-600'
              ]"
            >
              <font-awesome-icon :icon="tab.icon" />
              {{ tab.label }}
            </button>
          </div>
        </header>

        <!-- Tab Content Container -->
        <div class="flex-1 overflow-y-auto custom-scrollbar p-10">
          
          <!-- TAB 1: TIMELINE -->
          <div v-if="activeTab === 'Timeline'" class="space-y-12">
            <div class="relative">
              <div class="absolute left-[15px] top-4 bottom-0 w-0.5 bg-gray-100"></div>
              <div class="space-y-12 relative">
                <div v-for="activity in sortedActivities" :key="activity.id" class="flex gap-8 group">
                  <div class="w-8 h-8 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center shrink-0 z-10 shadow-sm group-hover:border-red-200 transition-colors">
                    <div class="w-2 h-2 rounded-full" :class="activity.activityType === 'AI_Query' ? 'bg-blue-500' : 'bg-red-500'"></div>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <span class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        {{ formatDateTime(activity.createdAt) }}
                      </span>
                      <span :class="['px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest', activity.activityType === 'AI_Query' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600']">
                        {{ activity.activityType }}
                      </span>
                    </div>
                    <div class="bg-gray-50/50 p-5 rounded-3xl border border-gray-100 group-hover:bg-white group-hover:shadow-lg group-hover:border-red-50 transition-all">
                      <p class="text-sm font-bold text-gray-700 italic leading-relaxed">"{{ activity.description }}"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: AI INSIGHTS -->
          <div v-if="activeTab === 'AI'" class="space-y-8">
            <div class="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
              <div class="absolute top-0 right-0 p-10 opacity-10">
                <font-awesome-icon icon="robot" class="text-9xl" />
              </div>
              <h4 class="text-xs font-black uppercase tracking-[0.3em] text-red-500 mb-6 flex items-center gap-3">
                <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                AI Analysis Summary
              </h4>
              <p class="text-lg font-bold italic leading-relaxed relative z-10">{{ aiSummary }}</p>
            </div>

            <div class="space-y-4">
              <h3 class="text-xs font-black uppercase tracking-widest text-gray-400 px-4">Lịch sử chat bot gần nhất</h3>
              <div class="space-y-4">
                <div v-for="ai in aiActivities" :key="ai.id" class="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col gap-3">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-black text-gray-300 uppercase tracking-widest">Website Interaction</span>
                    <span class="text-[10px] text-gray-300">{{ formatDateTime(ai.createdAt) }}</span>
                  </div>
                  <p class="text-sm font-bold text-gray-700 italic">"{{ ai.description }}"</p>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 3: INTERNAL NOTES -->
          <div v-if="activeTab === 'Notes'" class="space-y-8">
            <div class="bg-red-50/50 p-8 rounded-[2.5rem] border border-red-100/50">
              <textarea
                v-model="newNote"
                placeholder="Để lại ghi chú bí mật để chốt deal nhanh hơn... (Sở thích, yêu cầu riêng của khách)"
                class="w-full h-32 px-5 py-4 text-sm bg-white border border-gray-200 rounded-2xl focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none resize-none font-bold italic"
              ></textarea>
              <div class="flex justify-end mt-4">
                <button
                  @click="handleAddNote"
                  :disabled="isAddingNote || !newNote.trim()"
                  class="px-8 py-3 bg-gray-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all shadow-lg hover:shadow-red-200 disabled:opacity-50"
                >
                  <font-awesome-icon icon="paper-plane" class="mr-2" />
                  Lưu ghi chú
                </button>
              </div>
            </div>

            <div class="space-y-4">
              <div v-for="note in internalNotes" :key="note.id" class="flex gap-4 p-5 rounded-3xl border border-gray-100 bg-white hover:shadow-md transition-all">
                <div class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <font-awesome-icon icon="user-circle" class="text-gray-300" />
                </div>
                <div>
                  <div class="flex items-center gap-3 mb-1">
                    <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">Sales Staff</span>
                    <span class="text-[10px] text-gray-300">{{ formatDateTime(note.createdAt) }}</span>
                  </div>
                  <p class="text-sm font-bold text-gray-600 italic">"{{ note.description }}"</p>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 4: ASSETS & RECORDS -->
          <div v-if="activeTab === 'Assets'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-8 rounded-[2rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center group hover:border-red-200 hover:bg-red-50/20 transition-all cursor-pointer">
              <div class="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-red-400 mb-4 transition-colors">
                <font-awesome-icon icon="plus" class="text-2xl" />
              </div>
              <h5 class="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-red-600">Thêm hồ sơ mới</h5>
              <p class="text-[10px] text-gray-300 mt-2">Hỗ trợ PDF, JPG, PNG (Hợp đồng, Đăng ký xe...)</p>
            </div>
            
            <div class="p-8 rounded-[2rem] border border-gray-100 bg-white shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all">
              <div class="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-400">
                <font-awesome-icon icon="file-invoice" class="text-2xl" />
              </div>
              <div>
                <h5 class="text-xs font-black uppercase tracking-widest text-gray-900">Mẫu hợp đồng thử nghiệm.pdf</h5>
                <p class="text-[10px] text-gray-400 mt-1">2.4 MB • Cập nhật 2 ngày trước</p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3 p-6 bg-white border-t border-gray-100">
        <button
          @click="emit('close')"
          class="px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all"
        >
          Thoát
        </button>
        <button
          @click="handleSave"
          :disabled="isSaving"
          class="px-10 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-red-100 hover:shadow-red-200 hover:-translate-y-0.5 transition-all disabled:opacity-50"
        >
          <span v-if="isSaving">Đang lưu...</span>
          <span v-else>Cập nhật hồ sơ</span>
        </button>
      </div>
    </template>
  </DraggableModal>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>


<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>

