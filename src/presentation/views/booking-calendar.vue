<script setup>
import { ref, computed } from 'vue'
import { useQueryClient, useQuery } from '@tanstack/vue-query'
import { useBookingStore } from '@stores/booking.store'
import { useToast } from 'vue-toastification'
import LoadingOverlay from '@components/ui/LoadingOverlay.vue'
import SkeletonLoader from '@components/ui/SkeletonLoader.vue'
import IconEmptyBox from '@/assets/icons/empty-box.svg'
import BookingItem from '@components/booking/BookingItem.vue'

const bookingStore = useBookingStore()
const toast = useToast()
const queryClient = useQueryClient()

const isSaving = ref(false)
const overlayMessage = ref('')

const { data: bookingsData, isLoading, isError, refetch } = useQuery({
  queryKey: ['bookings'],
  queryFn: () => bookingStore.fetchBookings(),
})

const bookings = computed(() => bookingsData.value || [])

// Phân loại lịch hẹn
const pendingBookings = computed(() => bookings.value.filter(b => b.status === 'Pending'))
const confirmedBookings = computed(() => bookings.value.filter(b => b.status === 'Confirmed'))
const otherBookings = computed(() => bookings.value.filter(b => b.status !== 'Pending' && b.status !== 'Confirmed'))

const handleConfirm = async (bookingId) => {
  isSaving.value = true
  overlayMessage.value = 'Đang xác nhận lịch hẹn và gửi thông báo...'
  try {
    await bookingStore.confirmBooking(bookingId)
    await queryClient.invalidateQueries({ queryKey: ['bookings'] })
    toast.success('Xác nhận lịch hẹn thành công! Khách hàng đã nhận được thông báo.')
  } catch (err) {
    toast.error(`Lỗi: ${err.message || 'Không thể xác nhận lịch hẹn'}`)
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="p-4 sm:p-6 rounded-xl shadow-lg bg-white min-h-screen">
    <LoadingOverlay :show="isSaving" :message="overlayMessage" />
    
    <div class="mb-8 flex justify-between items-end">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Quản lý đặt lịch</h1>
        <p class="text-gray-500">Theo dõi và xác nhận lịch hẹn lái thử của khách hàng</p>
      </div>
      <button 
        @click="refetch" 
        class="px-4 py-2 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors"
      >
        Làm mới
      </button>
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="p-4 border border-gray-100 rounded-xl">
        <SkeletonLoader width="100%" height="150px" />
      </div>
    </div>

    <div v-else-if="isError" class="text-center py-20 text-red-500">
      <p class="text-xl font-bold">Đã có lỗi xảy ra khi tải danh sách lịch hẹn.</p>
    </div>

    <div v-else class="space-y-10">
      <!-- Section: Chờ xác nhận -->
      <section v-if="pendingBookings.length > 0">
        <div class="flex items-center gap-3 mb-4">
          <h2 class="text-xl font-bold text-gray-800">Chờ xác nhận</h2>
          <span class="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">{{ pendingBookings.length }}</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BookingItem 
            v-for="booking in pendingBookings" 
            :key="booking.id" 
            :itemData="booking"
            @confirm="handleConfirm"
          />
        </div>
      </section>

      <!-- Section: Đã xác nhận -->
      <section v-if="confirmedBookings.length > 0">
        <div class="flex items-center gap-3 mb-4">
          <h2 class="text-xl font-bold text-gray-800">Đã xác nhận</h2>
          <span class="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">{{ confirmedBookings.length }}</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BookingItem 
            v-for="booking in confirmedBookings" 
            :key="booking.id" 
            :itemData="booking"
          />
        </div>
      </section>

      <!-- Section: Khác -->
      <section v-if="otherBookings.length > 0">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Lịch sử khác</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
          <BookingItem 
            v-for="booking in otherBookings" 
            :key="booking.id" 
            :itemData="booking"
          />
        </div>
      </section>

      <div v-if="bookings.length === 0" class="text-center py-20 flex flex-col items-center">
        <IconEmptyBox class="h-20 w-20 text-gray-200 mb-4" />
        <p class="text-gray-400 text-lg">Hiện tại không có lịch hẹn nào.</p>
      </div>
    </div>
  </div>
</template>



