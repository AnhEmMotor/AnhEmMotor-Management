<script setup>
import { ref, computed, watch } from 'vue'
import { useQueryClient, useQuery } from '@tanstack/vue-query'
import { useContactStore } from '@/stores/contact.store'
import { useToast } from 'vue-toastification'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import IconEmptyBox from '@/assets/icons/empty-box.svg'
import ContactItem from '@/components/contact/ContactItem.vue'
import ContactReplyModal from '@/components/contact/ContactReplyModal.vue'
import ContactInternalNoteModal from '@/components/contact/ContactInternalNoteModal.vue'
import Pagination from '@/components/ui/button/BasePagination.vue'
import Input from '@/components/ui/input/BaseInput.vue'

const contactStore = useContactStore()
const toast = useToast()
const queryClient = useQueryClient()

const searchQuery = ref('')
const openStates = ref({})
const isSaving = ref(false)
const overlayMessage = ref('')

const isReplyModalVisible = ref(false)
const isNoteModalVisible = ref(false)
const selectedContact = ref(null)

const { data: contactsData, isLoading, isError, refetch } = useQuery({
  queryKey: ['contacts'],
  queryFn: () => contactStore.fetchContacts(),
})

const contacts = computed(() => contactsData.value || [])

const filteredContacts = computed(() => {
  if (!searchQuery.value) return contacts.value
  const q = searchQuery.value.toLowerCase()
  return contacts.value.filter(
    (c) =>
      c.fullName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q)
  )
})

const handleToggleDetail = (id) => {
  openStates.value = { ...openStates.value, [id]: !openStates.value[id] }
}

const openReplyModal = (contact) => {
  selectedContact.value = contact
  isReplyModalVisible.value = true
}

const openNoteModal = (contact) => {
  selectedContact.value = contact
  isNoteModalVisible.value = true
}

const handleReply = async ({ contactId, message, markAsProcessed }) => {
  isSaving.value = true
  overlayMessage.value = 'Đang gửi phản hồi...'
  try {
    await contactStore.replyToContact(contactId, message, markAsProcessed)
    await queryClient.invalidateQueries({ queryKey: ['contacts'] })
    toast.success('Đã gửi phản hồi thành công!')
    isReplyModalVisible.value = false
  } catch (err) {
    toast.error(`Lỗi: ${err.message || 'Không thể gửi phản hồi'}`)
  } finally {
    isSaving.value = false
  }
}

const handleSaveNote = async ({ contactId, internalNote }) => {
  isSaving.value = true
  overlayMessage.value = 'Đang lưu ghi chú...'
  try {
    await contactStore.updateInternalNote(contactId, internalNote)
    await queryClient.invalidateQueries({ queryKey: ['contacts'] })
    toast.success('Đã cập nhật ghi chú nội bộ!')
    isNoteModalVisible.value = false
  } catch (err) {
    toast.error(`Lỗi: ${err.message || 'Không thể lưu ghi chú'}`)
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="p-4 sm:p-6 rounded-xl shadow-lg bg-white min-h-screen">
    <LoadingOverlay :show="isSaving" :message="overlayMessage" />
    
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Chăm sóc khách hàng</h1>
      <p class="text-gray-500">Quản lý các lời nhắn và phản hồi từ khách hàng (CRM)</p>
    </div>

    <div class="flex flex-col md:flex-row gap-4 mb-6">
      <div class="flex-1">
        <Input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm kiếm theo tên, email hoặc chủ đề..."
          class="w-full"
        />
      </div>
      <button 
        @click="refetch" 
        class="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
      >
        <span>Làm mới</span>
      </button>
    </div>

    <div class="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div
        class="hidden md:grid md:grid-cols-16 items-center gap-2 py-3 px-5 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-200"
      >
        <div class="md:col-span-4">Khách hàng</div>
        <div class="md:col-span-4">Chủ đề</div>
        <div class="md:col-span-3">Số điện thoại</div>
        <div class="md:col-span-2">Thời gian</div>
        <div class="md:col-span-2">Trạng thái</div>
        <div class="md:col-span-1"></div>
      </div>

      <div class="bg-white">
        <div v-if="isError" class="text-center py-12 text-red-500 font-medium">
          Đã xảy ra lỗi khi lấy dữ liệu liên hệ
        </div>

        <template v-else-if="filteredContacts.length === 0">
          <div v-if="isLoading">
            <div v-for="i in 5" :key="i" class="py-4 px-5 border-b border-gray-50">
              <SkeletonLoader width="100%" height="24px" />
            </div>
          </div>
          <div v-else class="text-center py-12 flex flex-col items-center justify-center space-y-3">
            <div class="bg-gray-50 p-3 rounded-full">
              <IconEmptyBox class="h-8 w-8 text-gray-400" />
            </div>
            <p class="text-gray-500 font-medium">Không có lời nhắn nào được tìm thấy.</p>
          </div>
        </template>

        <div v-else class="divide-y divide-gray-50">
          <ContactItem
            v-for="item in filteredContacts"
            :key="item.id"
            :itemData="item"
            :is-open="openStates[item.id]"
            @toggle-detail="handleToggleDetail"
            @reply="openReplyModal"
            @edit-note="openNoteModal"
          />
        </div>
      </div>
    </div>

    <ContactReplyModal
      v-if="selectedContact"
      :show="isReplyModalVisible"
      :contact="selectedContact"
      :is-saving="isSaving"
      @close="isReplyModalVisible = false"
      @reply="handleReply"
    />

    <ContactInternalNoteModal
      v-if="selectedContact"
      :show="isNoteModalVisible"
      :contact="selectedContact"
      :is-saving="isSaving"
      @close="isNoteModalVisible = false"
      @save="handleSaveNote"
    />
  </div>
</template>


