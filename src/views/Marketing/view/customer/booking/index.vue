<template>
  <div
    class="customer-booking-page flex flex-col min-h-screen bg-[#F8FAFC] font-inter text-[#0F172A]"
  >
    <div
      class="bg-white border-b border-slate-200 px-8 py-5 shrink-0 shadow-sm relative z-20"
    >
      <div class="flex justify-between items-center max-w-[1600px] mx-auto">
        <div class="flex items-center gap-5">
          <div
            class="size-11 rounded-xl bg-[#001529] flex-cc text-white shadow-xl"
          >
            <ArtSvgIcon icon="ri:calendar-event-line" class="text-xl" />
          </div>
          <div>
            <h1
              class="m-0 text-xl font-black tracking-tight text-slate-900 leading-none"
            >
              Trung tâm Điều phối Đặt lịch
            </h1>
            <p
              class="m-0 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2"
            >
              <span
                class="size-1.5 rounded-full bg-emerald-500 animate-pulse"
              ></span>
              Workflow: ConfirmBookingCommand Integrated
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <div
              class="px-4 py-1.5 rounded-lg bg-white shadow-sm text-[10px] font-black uppercase text-slate-700"
            >
              Lịch tháng
            </div>
            <div
              class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase text-slate-400 opacity-50 cursor-not-allowed"
            >
              Lịch tuần
            </div>
          </div>
          <button
            @click="handleCreateNew"
            class="h-10 px-6 bg-[#001529] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all active:scale-95"
          >
            + Đặt lịch mới
          </button>
        </div>
      </div>
    </div>

    <div
      class="flex-1 flex overflow-hidden max-w-[1600px] mx-auto w-full p-6 gap-6"
    >
      <div
        class="flex-1 bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden flex flex-col"
      >
        <div
          class="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30"
        >
          <div class="flex gap-4">
            <div class="flex items-center gap-2">
              <span class="size-2 rounded-full bg-red-500"></span>
              <span class="text-[9px] font-black uppercase text-slate-400"
                >Chờ xác nhận</span
              >
            </div>
            <div class="flex items-center gap-2">
              <span class="size-2 rounded-full bg-blue-500"></span>
              <span class="text-[9px] font-black uppercase text-slate-400"
                >Đã xác nhận</span
              >
            </div>
          </div>
          <div
            class="text-[10px] font-black text-blue-600 uppercase tracking-widest"
          >
            Tháng 02 / 2025
          </div>
        </div>

        <div
          class="calendar-wrapper p-4 flex-1 overflow-y-auto custom-scrollbar"
        >
          <ElCalendar v-model="currentDate" class="combat-calendar">
            <template #date-cell="{ data }">
              <div
                class="relative flex flex-col h-full min-h-[110px] p-2 transition-all hover:bg-blue-50/30 group/cell"
                :class="{ 'is-selected': data.isSelected }"
                @click="handleCellClick(data.day)"
              >
                <span
                  class="absolute top-2 right-3 text-[11px] font-black"
                  :class="data.isSelected ? 'text-blue-600' : 'text-slate-300'"
                >
                  {{ data.day.split("-")[2] }}
                </span>

                <div class="flex flex-col gap-1 pr-1 mt-6 overflow-hidden">
                  <div
                    v-for="booking in getBookings(data.day)"
                    :key="booking.id"
                    @click.stop="handleBookingClick(booking)"
                    class="px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tight truncate border transition-all cursor-pointer shadow-sm flex items-center gap-1"
                    :class="getBookingClasses(booking)"
                  >
                    <ArtSvgIcon
                      v-if="booking.status === 'Confirmed'"
                      icon="ri:checkbox-circle-fill"
                      class="text-[10px]"
                    />
                    <span class="truncate"
                      >{{ booking.customerName.split(" ").pop() }}:
                      {{ booking.content }}</span
                    >
                  </div>
                </div>
              </div>
            </template>
          </ElCalendar>
        </div>
      </div>

      <div class="w-80 flex flex-col gap-5 shrink-0">
        <div
          class="flex-1 bg-white border border-slate-200 rounded-[32px] shadow-sm flex flex-col overflow-hidden border-t-4 border-t-red-500"
        >
          <div
            class="p-5 border-b border-slate-100 bg-red-50/30 flex justify-between items-center"
          >
            <h3
              class="m-0 text-xs font-black uppercase tracking-widest text-red-600 flex items-center gap-2"
            >
              <ArtSvgIcon icon="ri:notification-badge-line" /> Cần xác nhận
            </h3>
            <span
              class="bg-red-600 text-white size-5 rounded-full flex-cc text-[10px] font-black shadow-lg"
              >{{ pendingBookings.length }}</span
            >
          </div>

          <div
            class="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar"
          >
            <div
              v-for="booking in pendingBookings"
              :key="booking.id"
              class="p-4 rounded-2xl border border-red-100 bg-red-50/10 hover:bg-red-50 transition-all cursor-pointer group relative"
              @click="handleBookingClick(booking)"
            >
              <div class="flex justify-between items-start mb-2">
                <span
                  class="text-[8px] font-black px-2 py-0.5 rounded bg-white border border-red-100 text-red-500 uppercase"
                >
                  {{ booking.typeLabel }}
                </span>
                <span class="text-[9px] font-black text-slate-400">{{
                  booking.time
                }}</span>
              </div>
              <h4 class="m-0 text-sm font-black text-slate-800">
                {{ booking.customerName }}
              </h4>
              <p
                class="m-0 text-[11px] font-bold text-slate-500 mt-1 italic truncate"
              >
                "{{ booking.content }}"
              </p>

              <button
                @click.stop="confirmBooking(booking)"
                class="mt-3 w-full h-8 bg-red-500 text-white rounded-lg font-black text-[9px] uppercase tracking-widest shadow-md hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
              >
                Xác nhận & Gửi Mail/SMS
              </button>
            </div>

            <div
              v-if="pendingBookings.length === 0"
              class="flex-cc flex-col gap-3 py-10 opacity-20"
            >
              <ArtSvgIcon
                icon="ri:check-double-line"
                class="text-4xl text-emerald-500"
              />
              <span class="text-[9px] font-black uppercase tracking-widest"
                >Đã xử lý hết lịch chờ</span
              >
            </div>
          </div>
        </div>

        <div
          class="bg-[#001529] p-5 rounded-[32px] text-white shadow-2xl relative overflow-hidden group"
        >
          <ArtSvgIcon
            icon="ri:mail-send-line"
            class="absolute -right-4 -bottom-4 text-8xl opacity-10 group-hover:rotate-12 transition-all duration-700"
          />
          <span
            class="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 block mb-4"
            >Hiệu suất thông báo</span
          >
          <div class="flex items-end gap-2">
            <span class="text-3xl font-black"
              >98<span class="text-lg opacity-60">%</span></span
            >
            <span class="text-[9px] font-bold text-emerald-400 mb-2"
              >SMS/Mail thành công</span
            >
          </div>
        </div>
      </div>
    </div>

    <ElDialog
      v-model="dialogVisible"
      width="550px"
      custom-class="combat-booking-dialog"
      :show-close="false"
    >
      <template #header>
        <div class="flex items-center gap-4">
          <div
            class="size-11 rounded-xl bg-[#001529] flex-cc text-white shadow-xl"
          >
            <ArtSvgIcon
              :icon="isEditing ? 'ri:edit-box-line' : 'ri:calendar-check-line'"
              class="text-2xl"
            />
          </div>
          <div>
            <h3
              class="m-0 font-black uppercase text-xs tracking-[0.2em] text-slate-800"
            >
              {{ dialogTitle }}
            </h3>
            <div class="flex items-center gap-2 mt-1">
              <span
                class="px-2 py-0.5 rounded text-[8px] font-black uppercase"
                :class="
                  bookingForm.status === 'Confirmed'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-red-100 text-red-600'
                "
              >
                {{
                  bookingForm.status === "Confirmed"
                    ? "Đã xác nhận"
                    : "Chờ phê duyệt"
                }}
              </span>
            </div>
          </div>
        </div>
      </template>

      <div class="py-4 space-y-5">
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label
              class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1"
              >Tên khách hàng</label
            >
            <ElInput
              v-model="bookingForm.customerName"
              placeholder="Tên khách..."
              class="combat-input"
            />
          </div>
          <div>
            <label
              class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1"
              >SĐT</label
            >
            <ElInput
              v-model="bookingForm.phone"
              placeholder="09xx..."
              class="combat-input"
            />
          </div>
          <div>
            <label
              class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1"
              >Giờ hẹn</label
            >
            <ElTimeSelect
              v-model="bookingForm.time"
              start="08:00"
              step="00:30"
              end="18:00"
              placeholder="Chọn giờ"
              class="combat-time"
            />
          </div>
        </div>

        <div>
          <label
            class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1"
            >Loại yêu cầu</label
          >
          <div class="flex gap-2">
            <button
              v-for="t in ['TestDrive', 'Maintenance', 'Consult']"
              :key="t"
              @click="bookingForm.type = t"
              class="flex-1 h-9 rounded-xl text-[9px] font-black uppercase border-2 transition-all"
              :class="
                bookingForm.type === t
                  ? 'bg-[#001529] text-white border-[#001529]'
                  : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
              "
            >
              {{
                t === "TestDrive"
                  ? "Lái thử"
                  : t === "Maintenance"
                    ? "Bảo trì"
                    : "Tư vấn"
              }}
            </button>
          </div>
        </div>

        <div>
          <label
            class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1"
            >Nội dung cuộc hẹn</label
          >
          <ElInput
            v-model="bookingForm.content"
            type="textarea"
            :rows="3"
            placeholder="Ghi chú..."
            class="combat-textarea"
          />
        </div>

        <div
          v-if="bookingForm.status === 'Pending' && isEditing"
          class="p-3 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3"
        >
          <ArtSvgIcon icon="ri:mail-line" class="text-blue-500 mt-1" />
          <p
            class="m-0 text-[10px] font-bold text-blue-700 leading-normal italic"
          >
            Lưu ý: Sau khi xác nhận, ConfirmBookingCommand sẽ tự động gửi
            Mail/SMS thông báo lịch hẹn chính xác tới khách hàng.
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between items-center px-2">
          <button
            v-if="isEditing"
            @click="handleDeleteBooking"
            class="text-red-400 hover:text-red-600 font-black text-[9px] uppercase tracking-widest"
          >
            Hủy lịch
          </button>
          <div v-else></div>
          <div class="flex gap-3">
            <button
              @click="dialogVisible = false"
              class="h-10 px-6 text-slate-400 font-black text-[10px] uppercase tracking-widest"
            >
              Đóng
            </button>

            <button
              v-if="bookingForm.status === 'Pending' && isEditing"
              @click="confirmBooking(activeBooking)"
              class="h-10 px-8 bg-red-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-red-600 transition-all flex items-center gap-2"
            >
              <ArtSvgIcon icon="ri:check-double-line" /> Xác nhận & Gửi thông
              báo
            </button>

            <button
              @click="handleSaveBooking"
              class="h-10 px-8 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all"
            >
              {{ isEditing ? "Cập nhật" : "Tạo mới" }}
            </button>
          </div>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElLoading } from "element-plus";
import { BookingApi, Booking } from "@/infrastructure/api/booking";

defineOptions({ name: "BookingCalendar" });

const currentDate = ref(new Date());
const dialogVisible = ref(false);
const dialogTitle = ref("Đặt lịch mới");
const editingBookingId = ref<number | null>(null);
const activeBooking = ref<any>(null);

const bookingForm = ref({
  customerName: "",
  phone: "",
  time: "09:00",
  date: "",
  type: "TestDrive",
  content: "",
  status: "Pending",
});

const bookings = ref<any[]>([]);

const fetchBookings = async () => {
  try {
    const res = await BookingApi.getList();
    bookings.value = (res || []).map((b: Booking) => {
      const dt = new Date(b.preferredDate);
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, "0");
      const dd = String(dt.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const timeStr = `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;

      return {
        ...b,
        customerName: b.fullName,
        phone: b.phoneNumber,
        date: dateStr,
        time: timeStr,
        type: b.bookingType,
        typeLabel:
          b.bookingType === "TestDrive"
            ? "Lái thử"
            : b.bookingType === "Maintenance"
              ? "Bảo trì"
              : "Tư vấn",
        content: b.note || "",
      };
    });
  } catch (err: any) {
    ElMessage.error(err.message || "Lỗi khi tải danh sách đặt lịch");
  }
};

onMounted(() => {
  fetchBookings();
});

const pendingBookings = computed(() =>
  bookings.value
    .filter((b) => b.status === "Pending")
    .sort((a, b) => a.time.localeCompare(b.time)),
);
const isEditing = computed(() => !!editingBookingId.value);

const getBookings = (day: string) =>
  bookings.value.filter((b) => b.date === day);

const getBookingClasses = (booking: any) => {
  if (booking.status === "Pending")
    return "bg-white border-red-200 text-red-500 shadow-sm";

  if (booking.type === "TestDrive")
    return "bg-blue-600 text-white border-blue-500";
  if (booking.type === "Maintenance")
    return "bg-emerald-500 text-white border-emerald-400";
  return "bg-amber-500 text-white border-amber-400";
};

const handleCellClick = (day: string) => {
  dialogTitle.value = "Đặt lịch mới";
  editingBookingId.value = null;
  bookingForm.value = {
    customerName: "",
    phone: "",
    time: "09:00",
    date: day,
    type: "TestDrive",
    content: "",
    status: "Pending",
  };
  dialogVisible.value = true;
};

const handleCreateNew = () =>
  handleCellClick(new Date().toISOString().split("T")[0]);

const handleBookingClick = (booking: any) => {
  activeBooking.value = booking;
  dialogTitle.value = "Chi tiết lịch hẹn";
  editingBookingId.value = booking.id;
  bookingForm.value = { ...booking };
  dialogVisible.value = true;
};

const confirmBooking = async (booking: any) => {
  if (!booking) return;

  const loading = ElLoading.service({
    lock: true,
    text: "Đang thực thi ConfirmBookingCommand: Đang gửi Mail & SMS thông báo...",
    background: "rgba(0, 0, 0, 0.7)",
  });

  try {
    await BookingApi.confirm(booking.id);
    ElMessage({
      message: `Xác nhận thành công! Đã gửi thông báo tới ${booking.customerName}`,
      type: "success",
      duration: 4000,
    });
    await fetchBookings();
    dialogVisible.value = false;
  } catch (err: any) {
    ElMessage.error(err.message || "Lỗi khi xác nhận lịch hẹn");
  } finally {
    loading.close();
  }
};

const handleSaveBooking = async () => {
  if (!bookingForm.value.customerName) return;
  if (!bookingForm.value.phone) return;

  if (isEditing.value) {
    ElMessage.warning(
      "Hệ thống không hỗ trợ chỉnh sửa trực tiếp, vui lòng xác nhận hoặc liên hệ quản trị viên.",
    );
    return;
  }

  try {
    const dt = new Date(`${bookingForm.value.date}T${bookingForm.value.time}`);
    await BookingApi.create({
      fullName: bookingForm.value.customerName,
      phoneNumber: bookingForm.value.phone,
      email: "",
      preferredDate: dt.toISOString(),
      note: bookingForm.value.content,
      bookingType: bookingForm.value.type,
      location: "Showroom",
    });
    ElMessage.success("Đã tạo lịch mới");
    await fetchBookings();
    dialogVisible.value = false;
  } catch (err: any) {
    ElMessage.error(err.message || "Lỗi khi tạo lịch hẹn mới");
  }
};

const handleDeleteBooking = () => {
  ElMessage.warning("Hệ thống không hỗ trợ xóa trực tiếp lịch hẹn.");
};
</script>

<style lang="scss" scoped>
.customer-booking-page {
  .custom-scrollbar {
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
      width: 0;
    }
  }

  .combat-calendar {
    --el-calendar-border: none;
    --el-calendar-header-border-bottom: 1px solid #f1f5f9;

    :deep(.el-calendar-table) {
      thead th {
        padding: 12px 0;
        font-size: 9px;
        font-weight: 900;
        color: #94a3b8;
        text-transform: uppercase;
      }

      td {
        border: 1px solid #f1f5f9;

        .el-calendar-day {
          min-height: 110px;
          padding: 0;
        }
      }
    }
  }

  .combat-input {
    :deep(.el-input__wrapper) {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: none;
    }
  }

  .combat-time {
    width: 100%;

    :deep(.el-input__wrapper) {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: none;
    }
  }

  .combat-textarea {
    :deep(.el-textarea__inner) {
      padding: 12px;
      font-size: 12px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
    }
  }
}

:deep(.combat-booking-dialog) {
  border-radius: 32px;

  .el-dialog__header {
    padding: 24px 32px;
    margin-right: 0;
    border-bottom: 1px solid #f1f5f9;
  }

  .el-dialog__footer {
    padding: 20px 32px;
    border-top: 1px solid #f1f5f9;
  }
}
</style>
