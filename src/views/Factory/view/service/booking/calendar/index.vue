<template>
  <div class="page-content mb-5">
    <ElCalendar v-model="currentDate">
      <template #date-cell="{ data }">
        <div
          class="relative flex flex-col h-full min-h-30 max-h-30 p-1 overflow-hidden c-p"
          :class="{ 'is-selected': data.isSelected }"
          @click="handleCellClick(data.day)"
        >
          <p class="absolute top-1 right-1 text-sm">{{ formatDate(data.day) }}</p>

          <div class="flex flex-col gap-1 w-full max-h-21 pr-1 mt-6 overflow-y-auto">
            <div
              v-for="event in getEvents(data.day)"
              :key="`${event.date}-${event.content}-${event.id}`"
              @click.stop="handleEventClick(event)"
            >
              <div
                class="min-w-25 px-3 py-1.5 overflow-hidden text-xs/6 font-medium text-ellipsis whitespace-nowrap rounded hover:opacity-80"
                :class="[event.bgClass, event.textClass]"
              >
                {{ event.content }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </ElCalendar>

    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="600px" @closed="resetForm">
      <ElForm :model="bookingForm" label-width="100px">
        <ElFormItem label="Tên khách" required>
          <ElInput v-model="bookingForm.customerName" placeholder="Tên khách..." />
        </ElFormItem>

        <ElFormItem label="SĐT" required>
          <ElInput v-model="bookingForm.phone" placeholder="09xx..." />
        </ElFormItem>

        <ElFormItem label="Loại yêu cầu">
          <ElRadioGroup v-model="bookingForm.type">
            <ElRadio value="TestDrive">Lái thử</ElRadio>
            <ElRadio value="Maintenance">Bảo trì</ElRadio>
            <ElRadio value="Consult">Tư vấn</ElRadio>
          </ElRadioGroup>
        </ElFormItem>

        <ElFormItem label="Ngày hẹn" required>
          <ElDatePicker
            style="width: 100%"
            v-model="bookingForm.date"
            type="date"
            placeholder="Chọn ngày"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </ElFormItem>

        <ElFormItem label="Giờ hẹn" required>
          <ElTimeSelect
            v-model="bookingForm.time"
            start="08:00"
            step="00:30"
            end="18:00"
            placeholder="Chọn giờ"
          />
        </ElFormItem>

        <ElFormItem label="Xe lái thử" v-if="bookingForm.type === 'TestDrive'">
          <ElSelect v-model="bookingForm.productVariantId" placeholder="Chọn xe demo..." clearable>
            <ElOption label="Winner X 2024 - Demo" :value="1" />
            <ElOption label="Exciter 155 - Demo" :value="2" />
            <ElOption label="Air Blade 160 - Demo" :value="3" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem :label="bookingForm.type === 'TestDrive' ? 'Ghi chú nội bộ' : 'Nội dung'">
          <ElInput
            v-model="bookingForm.content"
            type="textarea"
            :rows="3"
            :placeholder="
              bookingForm.type === 'TestDrive'
                ? 'VD: Khách muốn thử khả năng tăng tốc Winner X, đi cùng vợ...'
                : 'Ghi chú...'
            "
          />
        </ElFormItem>

        <div v-if="bookingForm.status === 'Pending' && isEditing" class="mt-2">
          <div class="p-3 bg-blue-50 rounded-2xl border border-blue-100">
            <p class="m-0 text-[12px] font-bold text-blue-700 leading-normal mb-1">
              Trạng thái Pipeline hiện tại: <ElTag size="small" type="warning">Đang tư vấn</ElTag>
            </p>
            <p class="m-0 text-[10px] text-blue-700 leading-normal italic">
              Lưu ý: Sau khi xác nhận lịch hẹn, Pipeline sẽ tự động chuyển sang
              <strong>Đang lái thử</strong> và hệ thống gửi Email/SMS xác nhận cho khách.
            </p>
          </div>
        </div>
        <div v-else-if="bookingForm.status === 'Confirmed' && isEditing" class="mt-2">
          <div class="p-3 bg-success-50 rounded-2xl border border-success-100">
            <p class="m-0 text-[12px] font-bold text-success-700 leading-normal">
              Trạng thái Pipeline: <ElTag size="small" type="success">Đang lái thử</ElTag>
            </p>
          </div>
        </div>
      </ElForm>

      <template #footer>
        <span class="dialog-footer">
          <ElButton v-if="isEditing" type="danger" :disabled="true">Xóa (chưa hỗ trợ)</ElButton>

          <ElButton
            v-if="isEditing && bookingForm.status === 'Pending'"
            type="primary"
            @click="handleConfirm"
          >
            Xác nhận & Gửi
          </ElButton>

          <ElButton v-if="!isEditing" type="primary" @click="handleSaveEvent">Tạo mới</ElButton>

          <ElButton
            type="primary"
            v-if="isEditing && bookingForm.status !== 'Pending'"
            @click="dialogVisible = false"
          >
            Đóng
          </ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { ElMessage, ElLoading } from 'element-plus'
  import { createBookingUseCases } from '@/infrastructure/bookings/usecasesFactory'
  import { BookingEventVM, BookingFormVM } from '@/domain/bookings/types'

  defineOptions({ name: 'ServiceBookingCalendar' })

  const { getBookingEvents, confirmBooking, createBooking } = createBookingUseCases()

  const currentDate = ref(new Date())

  const dialogVisible = ref(false)

  const dialogTitle = ref('Đặt lịch mới')

  const editingBookingId = ref<number | null>(null)

  const events = ref<BookingEventVM[]>([])

  const bookingForm = ref<BookingFormVM>({
    customerName: '',
    phone: '',
    time: '09:00',
    date: '',
    type: 'TestDrive',
    content: '',
    status: 'Pending',
    productVariantId: undefined,
  })

  const isEditing = computed(() => editingBookingId.value !== null)

  const formatDate = (date: string) => date.split('-')[2]

  const getEvents = (day: string) => {
    return events.value
      .filter((event) => {
        const eventDate = new Date(event.date)
        const current = new Date(day)
        const endDate = event.endDate ? new Date(event.endDate) : eventDate
        return current >= eventDate && current <= endDate
      })
      .map((event) => ({
        ...event,
        // fallback classes
        bgClass: event.bgClass ?? 'bg-slate-500',
        textClass: event.textClass ?? 'text-white',
      }))
  }

  const resetForm = () => {
    bookingForm.value = {
      customerName: '',
      phone: '',
      time: '09:00',
      date: '',
      type: 'TestDrive',
      content: '',
      status: 'Pending',
      productVariantId: undefined,
    }
    editingBookingId.value = null
    dialogTitle.value = 'Đặt lịch mới'
  }

  const handleCellClick = (day: string) => {
    dialogTitle.value = 'Đặt lịch mới'
    editingBookingId.value = null
    bookingForm.value = {
      customerName: '',
      phone: '',
      time: '09:00',
      date: day,
      type: 'TestDrive',
      content: '',
      status: 'Pending',
      productVariantId: undefined,
    }
    dialogVisible.value = true
  }

  const handleEventClick = (event: BookingEventVM) => {
    dialogTitle.value = 'Chi tiết lịch hẹn'
    editingBookingId.value = event.id

    bookingForm.value = {
      customerName: event.content?.split(':')[0] ?? event.content,
      phone: '09xx...',

      time: event.time ?? '09:00',
      date: event.date,
      type: (event.type as any) ?? 'TestDrive',
      content: event.content,
      status: (event.status as any) ?? 'Pending',
      productVariantId: undefined, // Would come from event if we had it, but we mock for now
    }

    dialogVisible.value = true
  }

  const handleSaveEvent = async () => {
    // UI first: chỉ validate tối thiểu
    if (!bookingForm.value.customerName) return
    if (!bookingForm.value.phone) return
    if (!bookingForm.value.date) return

    const loading = ElLoading.service({
      lock: true,
      text: 'Đang tạo lịch mới...',
      background: 'rgba(0, 0, 0, 0.7)',
    })

    try {
      await createBooking.execute(bookingForm.value)
      ElMessage.success('Đã tạo lịch mới')
      events.value = await getBookingEvents.execute()
      dialogVisible.value = false
    } catch (e: any) {
      ElMessage.error(e?.message || 'Lỗi khi tạo lịch mới')
    } finally {
      loading.close()
    }
  }

  const handleConfirm = async () => {
    if (!editingBookingId.value) return

    const loading = ElLoading.service({
      lock: true,
      text: 'Đang xác nhận... (ConfirmBookingCommand)',
      background: 'rgba(0, 0, 0, 0.7)',
    })

    try {
      await confirmBooking.execute(editingBookingId.value)
      ElMessage.success('Xác nhận thành công')
      // Theo workflow: trạng thái Pending -> Confirmed, refresh lại lịch
      events.value = await getBookingEvents.execute()
      dialogVisible.value = false
    } catch (e: any) {
      ElMessage.error(e?.message || 'Lỗi khi xác nhận lịch hẹn')
    } finally {
      loading.close()
    }
  }

  onMounted(async () => {
    events.value = await getBookingEvents.execute()
  })
</script>

<style scoped>
  :deep(.el-calendar) {
    height: 100%;
  }

  :deep(.el-calendar__body) {
    height: calc(100% - 70px);
  }

  :deep(.el-calendar-table) {
    height: 100%;
  }

  :deep(.is-selected) {
    background-color: var(--el-color-warning-light-9) !important;
  }

  :deep(.el-calendar-day) {
    height: 100%;
  }

  :deep(.el-calendar-day:hover) {
    background-color: transparent !important;
  }

  :deep(.el-dialog__body) {
    padding-top: 20px;
  }
</style>
