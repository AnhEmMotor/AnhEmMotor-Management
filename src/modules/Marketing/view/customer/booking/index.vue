<template>
  <div
    class="resp-page customer-booking-page flex flex-col h-screen bg-[#F8FAFC] dark:bg-[#020617] text-[#0F172A] dark:text-[#E2E8F0]"
  >
    <div
      class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 shrink-0 shadow-sm relative z-20"
    >
      <div class="flex justify-between items-center max-w-[1600px] mx-auto">
        <div class="flex items-center gap-3">
          <div
            class="size-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-cc text-slate-800 dark:text-white shadow-sm shrink-0"
          >
            <ArtSvgIcon
              icon="ri:calendar-event-line"
              class="text-lg text-blue-500 dark:text-blue-400"
            />
          </div>
          <div>
            <h1
              class="m-0 text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-none"
            >
              Trung tâm Điều phối Đặt lịch
            </h1>
            <p
              class="m-0 text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mt-0.5"
            >
              Marketing · Sửa chữa · Bảo hành · Tư vấn
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div
            class="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-750"
          >
            <div
              class="px-3 max-md:px-1.5 py-1 rounded bg-white dark:bg-slate-900 shadow-sm text-[9px] font-bold uppercase text-slate-700 dark:text-slate-200"
            >
              Tháng
            </div>
            <div
              class="px-3 max-md:px-1.5 py-1 rounded text-[9px] font-bold uppercase text-slate-400 opacity-50 cursor-not-allowed"
            >
              Tuần
            </div>
          </div>
          <button
            @click="handleCreateNew"
            class="h-8 px-4 bg-[#001529] text-white rounded-lg font-bold text-[9px] uppercase tracking-widest shadow-sm hover:bg-[#001f3f] transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <ArtSvgIcon icon="ri:add-line" class="text-sm" />
            Đặt lịch mới
          </button>
        </div>
      </div>
    </div>

    <div
      class="flex-1 flex overflow-hidden max-w-[1600px] mx-auto w-full p-4 gap-4"
    >
      <div
        class="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col"
      >
        <div
          class="px-4 py-2.5 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/30"
        >
          <div class="flex items-center gap-3">
            <button
              @click="prevMonth"
              class="size-7 flex-cc rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArtSvgIcon icon="ri:arrow-left-s-line" class="text-sm" />
            </button>
            <span
              class="text-xs font-bold text-slate-700 dark:text-slate-200 min-w-[120px] text-center"
            >
              {{ calendarMonthLabel }}
            </span>
            <button
              @click="nextMonth"
              class="size-7 flex-cc rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArtSvgIcon icon="ri:arrow-right-s-line" class="text-sm" />
            </button>
          </div>

          <div class="flex gap-3">
            <div class="flex items-center gap-1.5">
              <span class="size-2 rounded-full bg-red-400"></span>
              <span class="text-[9px] font-bold text-slate-400">Chờ</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="size-2 rounded-full bg-blue-500"></span>
              <span class="text-[9px] font-bold text-slate-400"
                >Đã xác nhận</span
              >
            </div>
            <div class="flex items-center gap-1.5">
              <span class="size-2 rounded-full bg-orange-400"></span>
              <span class="text-[9px] font-bold text-slate-400">Sửa chữa</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="size-2 rounded-full bg-purple-400"></span>
              <span class="text-[9px] font-bold text-slate-400">Bảo hành</span>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-auto custom-scrollbar p-2">
          <ElCalendar v-model="currentDate" class="compact-calendar">
            <template #date-cell="{ data }">
              <div
                class="cell-inner"
                :class="data.isSelected ? 'is-selected' : ''"
                @click="handleCellClick(data.day)"
              >
                <span
                  class="day-num"
                  :class="
                    data.isSelected
                      ? 'is-active'
                      : isToday(data.day)
                        ? 'is-today'
                        : ''
                  "
                >
                  {{ data.day.split("-")[2] }}
                </span>

                <div class="cell-bookings">
                  <div
                    v-for="booking in getBookings(data.day).slice(0, 2)"
                    :key="booking.id"
                    @click.stop="handleBookingClick(booking)"
                    class="booking-pill"
                    :class="getBookingPillClass(booking)"
                  >
                    <span class="pill-time">{{ booking.time }}</span>
                    <span class="pill-name">{{ booking.customerName }}</span>
                  </div>
                  <div
                    v-if="getBookings(data.day).length > 2"
                    class="more-bookings-badge"
                  >
                    +{{ getBookings(data.day).length - 2 }} lịch hẹn
                  </div>
                </div>
              </div>
            </template>
          </ElCalendar>
        </div>
      </div>

      <div class="w-[280px] flex flex-col gap-3 shrink-0">
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col overflow-hidden"
        >
          <div
            class="px-4 py-2.5 border-b border-red-100 dark:border-red-900/40 bg-red-50/60 dark:bg-red-950/20 flex justify-between items-center"
          >
            <h3
              class="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 flex items-center gap-1.5"
            >
              <ArtSvgIcon icon="ri:alarm-warning-line" class="text-xs" />
              Cần xác nhận
            </h3>
            <span
              class="bg-red-500 text-white size-4 flex-cc text-[8px] font-bold shadow"
              >{{ pendingBookings.length }}</span
            >
          </div>

          <div
            class="flex-1 overflow-y-auto p-2.5 flex flex-col gap-1.5 custom-scrollbar max-h-[calc(100vh-250px)]"
          >
            <div
              v-for="booking in pendingBookingsPaged"
              :key="booking.id"
              class="p-2.5 rounded-xl border border-red-100 dark:border-red-900/40 bg-red-50/40 dark:bg-red-950/10 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer group"
              @click="handleBookingClick(booking)"
            >
              <div class="flex justify-between items-center mb-1">
                <span
                  class="text-[7px] font-bold px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-red-100 dark:border-red-900/40 text-red-500 uppercase"
                >
                  {{ booking.typeLabel }}
                </span>
                <span class="text-[8px] font-bold text-slate-400">{{
                  booking.time
                }}</span>
              </div>
              <div
                class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate"
              >
                {{ booking.customerName }}
              </div>
              <div class="text-[9px] text-slate-400 truncate mt-0.5">
                {{ booking.content || "—" }}
              </div>
              <button
                @click.stop="confirmBooking(booking)"
                class="mt-1.5 w-full h-6 bg-red-500 hover:bg-red-600 text-white rounded-md font-bold text-[8px] uppercase tracking-wider transition-all"
              >
                Xác nhận
              </button>
            </div>

            <div
              v-if="pendingBookings.length === 0"
              class="flex-cc flex-col gap-2 py-8 opacity-30"
            >
              <ArtSvgIcon
                icon="ri:checkbox-circle-line"
                class="text-2xl text-emerald-500"
              />
              <span class="text-[8px] font-bold uppercase tracking-wider">
                Hết lịch chờ
              </span>
            </div>

            <div
              v-if="pendingTotalPages > 1"
              class="flex justify-center items-center gap-1.5 pt-1 pb-0.5"
            >
              <button
                :disabled="pendingPage === 1"
                @click="pendingPage--"
                class="h-6 px-2 rounded-md text-[9px] font-bold border border-slate-200 dark:border-slate-700 disabled:opacity-25 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                ‹
              </button>
              <span
                class="text-[9px] font-bold text-slate-500 min-w-[40px] text-center"
                >{{ pendingPage }}/{{ pendingTotalPages }}</span
              >
              <button
                :disabled="pendingPage === pendingTotalPages"
                @click="pendingPage++"
                class="h-6 px-2 rounded-md text-[9px] font-bold border border-slate-200 dark:border-slate-700 disabled:opacity-25 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        <div
          class="bg-gradient-to-br from-[#001529] to-[#0a2540] p-4 rounded-2xl text-white relative overflow-hidden shrink-0"
        >
          <div class="relative z-10">
            <span
              class="text-[8px] font-bold uppercase tracking-[0.15em] text-blue-300/80 block mb-2"
            >
              Thông báo
            </span>
            <div class="flex items-baseline gap-1">
              <span class="text-2xl font-bold">98%</span>
              <span class="text-[9px] text-blue-200/70 mb-1"
                >tỷ lệ gửi thành công</span
              >
            </div>
            <div class="flex gap-3 mt-2">
              <span class="text-[8px] text-blue-200/50 flex items-center gap-1">
                <span class="size-1 rounded-full bg-emerald-400"></span>
                SMS 99%
              </span>
              <span class="text-[8px] text-blue-200/50 flex items-center gap-1">
                <span class="size-1 rounded-full bg-emerald-400"></span>
                Email 97%
              </span>
            </div>
          </div>
          <ArtSvgIcon
            icon="ri:mail-send-line"
            class="absolute -right-2 -bottom-2 text-6xl opacity-10"
          />
        </div>
      </div>
    </div>

    <ElDialog
      v-model="dialogVisible"
      width="650px"
      custom-class="compact-booking-dialog"
      :show-close="false"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div class="size-9 rounded-lg bg-[#001529] flex-cc text-white shadow">
            <ArtSvgIcon
              :icon="isEditing ? 'ri:edit-box-line' : 'ri:calendar-check-line'"
              class="text-lg"
            />
          </div>
          <div>
            <h3
              class="m-0 text-base font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100"
            >
              {{ dialogTitle }}
            </h3>
            <span
              class="inline-block mt-1 px-2 py-1 rounded text-[10px] font-bold uppercase"
              :class="
                bookingForm.status === 'Confirmed'
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-red-100 text-red-600'
              "
            >
              {{
                bookingForm.status === "Confirmed"
                  ? "Đã xác nhận"
                  : "Chờ xác nhận"
              }}
            </span>
          </div>
        </div>
      </template>

      <div class="py-3 space-y-3">
        <div>
          <label
            class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block px-1"
            >Tên khách hàng</label
          >
          <ElInput
            v-model="bookingForm.customerName"
            placeholder="Tên khách..."
            class="compact-input"
          />
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label
              class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block px-1"
              >SĐT</label
            >
            <ElInput
              v-model="bookingForm.phone"
              placeholder="09xx..."
              class="compact-input"
            />
          </div>
          <div>
            <label
              class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block px-1"
              >Ngày hẹn</label
            >
            <ElDatePicker
              v-model="bookingForm.date"
              type="date"
              placeholder="Ngày"
              value-format="YYYY-MM-DD"
              class="compact-input"
            />
          </div>
          <div>
            <label
              class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block px-1"
              >Giờ hẹn</label
            >
            <ElTimeSelect
              v-model="bookingForm.time"
              start="08:00"
              step="00:30"
              end="18:00"
              placeholder="Giờ"
              class="compact-input"
            />
          </div>
        </div>

        <div>
          <label
            class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block px-1"
            >Loại yêu cầu</label
          >
          <div class="grid grid-cols-4 gap-1.5">
            <button
              v-for="t in typeOptions"
              :key="t.value"
              @click="bookingForm.type = t.value"
              class="h-9 rounded-lg text-xs font-bold uppercase border transition-all"
              :class="
                bookingForm.type === t.value
                  ? 'bg-[#001529] text-white border-[#001529]'
                  : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700 hover:border-slate-300'
              "
            >
              {{ t.label }}
            </button>
          </div>
        </div>

        <div>
          <label
            class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block px-1"
            >Nội dung</label
          >
          <ElInput
            v-model="bookingForm.content"
            type="textarea"
            :rows="2"
            placeholder="Ghi chú..."
            class="compact-input"
          />
        </div>

        <!-- Phân luồng & Phân công vai trò / Điều phối xưởng -->
        <div
          class="p-2.5 rounded-xl border transition-all"
          :class="
            isWorkshopType
              ? 'bg-orange-50/50 border-orange-100 dark:bg-orange-950/10 dark:border-orange-900/30'
              : 'bg-blue-50/50 border-blue-100 dark:bg-blue-950/10 dark:border-blue-900/30'
          "
        >
          <div class="flex items-center justify-between mb-2.5">
            <span
              class="text-xs font-bold uppercase tracking-wider text-slate-500"
              >Phân luồng xử lý</span
            >
            <span
              class="text-[10px] font-extrabold uppercase px-2 py-1 rounded"
              :class="
                isWorkshopType
                  ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300'
                  : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
              "
            >
              {{
                isWorkshopType
                  ? "Xưởng dịch vụ kỹ thuật"
                  : "Marketing & Kinh doanh"
              }}
            </span>
          </div>

          <div v-if="!isWorkshopType" class="space-y-2.5">
            <label
              class="text-[11px] font-bold text-slate-600 uppercase tracking-wider block"
              >Nhân viên kinh doanh phụ trách</label
            >
            <ElSelect
              v-model="linkedLead.assignedToId"
              placeholder="Chọn nhân viên kinh doanh..."
              clearable
              @change="handleAssignSalesperson"
              class="w-full compact-select"
              :disabled="!linkedLead.id"
            >
              <ElOption
                v-for="user in salesList"
                :key="user.id"
                :label="user.name"
                :value="user.id"
              />
            </ElSelect>
            <p
              v-if="!linkedLead.id"
              class="m-0 text-[11px] italic text-slate-500"
            >
              Khách hàng chưa đăng ký hồ sơ tiềm năng trong CRM để phân công.
            </p>
          </div>

          <div v-else class="space-y-3">
            <label
              class="text-[11px] font-bold text-orange-600 uppercase tracking-wider block"
              >Nhân viên kỹ thuật phụ trách</label
            >

            <ElSelect
              v-model="linkedTechnician.id"
              placeholder="Chọn nhân viên kỹ thuật..."
              clearable
              class="w-full compact-select"
            >
              <ElOption
                v-for="emp in technicianList"
                :key="emp.id"
                :label="emp.name"
                :value="emp.id"
              />
            </ElSelect>

            <p class="m-0 text-[11px] italic text-slate-500">
              Sau khi tạo lịch, hẹn sẽ xuất hiện trong màn Lịch sửa chữa của
              xưởng.
            </p>

            <p
              class="m-0 text-xs text-orange-700 dark:text-orange-300 leading-relaxed font-bold mt-2"
            >
              Lịch hẹn này thuộc phân hệ kỹ thuật. Đã được chuyển về Quản lý
              xưởng để tiếp nhận và điều phối kỹ thuật viên.
            </p>
            <button
              type="button"
              @click="goToWorkshopCalendar"
              class="h-9 w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <ArtSvgIcon icon="ri:tools-line" class="text-sm" />
              Đi tới Lịch sửa chữa xưởng
            </button>
          </div>
        </div>

        <div
          v-if="bookingForm.status === 'Pending' && isEditing"
          class="p-3 mt-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900/40 flex items-start gap-3"
        >
          <ArtSvgIcon
            icon="ri:mail-line"
            class="text-blue-500 text-base mt-0.5 shrink-0"
          />
          <p
            class="m-0 text-xs font-bold text-blue-700 dark:text-blue-300 leading-snug"
          >
            Xác nhận sẽ tự động gửi Mail/SMS thông báo tới khách hàng.
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between items-center">
          <button
            v-if="isEditing"
            @click="handleDeleteBooking"
            class="text-red-500 hover:text-red-700 font-bold text-xs uppercase tracking-wider"
          >
            Hủy lịch
          </button>
          <div v-else></div>
          <div class="flex gap-2">
            <button
              @click="dialogVisible = false"
              class="h-10 px-5 text-slate-500 font-bold text-[11px] uppercase"
            >
              Đóng
            </button>
            <button
              v-if="bookingForm.status === 'Pending' && isEditing"
              @click="confirmBooking(activeBooking)"
              class="h-10 px-6 bg-red-500 text-white rounded-lg font-bold text-[11px] uppercase shadow hover:bg-red-600 transition-all"
            >
              Xác nhận
            </button>
            <button
              @click="handleSaveBooking"
              class="h-10 px-6 bg-blue-600 text-white rounded-lg font-bold text-[11px] uppercase shadow hover:bg-blue-700 transition-all"
            >
              {{ isEditing ? "Cập nhật" : "Tạo mới" }}
            </button>
          </div>
        </div>
      </template>
    </ElDialog>

    <!-- Dialog hiển thị danh sách lịch hẹn trong ngày -->
    <ElDialog
      v-model="dayListDialogVisible"
      width="440px"
      custom-class="compact-booking-dialog"
      :show-close="true"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div class="size-9 rounded-lg bg-[#001529] flex-cc text-white shadow">
            <ArtSvgIcon icon="ri:calendar-todo-line" class="text-lg" />
          </div>
          <div>
            <h3
              class="m-0 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100"
            >
              Lịch hẹn ngày {{ selectedDayFormatted }}
            </h3>
            <span class="text-[8px] font-bold text-slate-400">
              Tổng số: {{ selectedDayBookings.length }} lịch hẹn
            </span>
          </div>
        </div>
      </template>

      <div class="py-2 space-y-3">
        <div
          class="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/40"
        >
          <span
            class="text-[8px] font-bold text-slate-400 uppercase tracking-wider"
            >Danh sách lịch hẹn trong ngày</span
          >
          <button
            @click="openNewBookingFormForSelectedDay"
            class="h-6 px-3 bg-[#001529] hover:bg-slate-800 text-white rounded-lg font-bold text-[8px] uppercase tracking-wider flex items-center gap-1 shadow"
          >
            + Đặt lịch mới
          </button>
        </div>

        <div
          class="max-h-[300px] overflow-y-auto space-y-2 custom-scrollbar pr-1"
        >
          <div
            v-for="b in selectedDayBookings"
            :key="b.id"
            @click="viewBookingFromDayList(b)"
            class="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-blue-200 dark:hover:border-blue-900/60 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <span
                  class="text-[9px] font-extrabold text-blue-600 dark:text-blue-400"
                  >{{ b.time }}</span
                >
                <span
                  class="text-[7px] font-extrabold px-1.5 py-0.2 rounded uppercase"
                  :class="getBookingBadgeClass(b)"
                >
                  {{ b.typeLabel }}
                </span>
              </div>
              <div class="text-xs font-bold text-slate-800 dark:text-slate-100">
                {{ b.customerName }}
              </div>
              <p class="m-0 text-[9px] text-slate-400 truncate max-w-[280px]">
                {{ b.content || "Không có ghi chú" }}
              </p>
            </div>

            <div class="flex items-center gap-2">
              <span
                class="text-[7px] font-bold uppercase px-1.5 py-0.5 rounded"
                :class="
                  b.status === 'Confirmed'
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                    : b.status === 'Cancelled'
                      ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400'
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                "
              >
                {{
                  b.status === "Confirmed"
                    ? "Đã xác nhận"
                    : b.status === "Cancelled"
                      ? "Đã hủy"
                      : "Chờ xác nhận"
                }}
              </span>
              <ArtSvgIcon
                icon="ri:arrow-right-s-line"
                class="text-slate-400 group-hover:translate-x-0.5 transition-transform text-sm"
              />
            </div>
          </div>

          <div
            v-if="selectedDayBookings.length === 0"
            class="py-12 flex flex-col items-center justify-center gap-2 text-slate-400"
          >
            <ArtSvgIcon icon="ri:calendar-line" class="text-3xl opacity-20" />
            <span class="text-xs font-bold"
              >Không có lịch hẹn nào trong ngày này.</span
            >
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <button
            @click="dayListDialogVisible = false"
            class="h-8 px-4 text-slate-400 font-bold text-[9px] uppercase tracking-wider hover:text-slate-600"
          >
            Đóng
          </button>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElLoading, ElMessageBox } from "element-plus";
import { BookingApi, Booking } from "@/api/sales";
import { BookingAppointmentApi } from "@/api/booking-appointment.api";
import { fetchGetUserList } from "@/api/auth/system-manage.api";
import { fetchGetLeadList, fetchAssignLead } from "@/api/customer";
import { EmployeeApi } from "@/api/operations/employee.api";

defineOptions({ name: "BookingCalendar" });

const router = useRouter();
const currentDate = ref(new Date());
const dialogVisible = ref(false);
const dialogTitle = ref("Đặt lịch mới");
const editingBookingId = ref<number | null>(null);
const activeBooking = ref<any>(null);

const dayListDialogVisible = ref(false);
const selectedDay = ref("");
const selectedDayFormatted = computed(() => {
  if (!selectedDay.value) return "";
  const parts = selectedDay.value.split("-");
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
});
const selectedDayBookings = computed(() => {
  if (!selectedDay.value) return [];
  return bookings.value.filter((b) => b.date === selectedDay.value);
});

const isAdmin = computed(() => true);

const linkedLead = ref<{ id: number | null; assignedToId: string | null }>({
  id: null,
  assignedToId: null,
});
const linkedTechnician = ref<{ id: number | null; name: string | null }>({
  id: null,
  name: null,
});

const isWorkshopType = computed(() => {
  return (
    bookingForm.value.type === "RepairService" ||
    bookingForm.value.type === "WarrantyService"
  );
});

const salesList = ref<{ id: string; name: string }[]>([]);

const fetchSalesList = async () => {
  try {
    const res = await fetchGetUserList({ Page: 1, PageSize: 100 });
    const users = ((res as any).items ?? (res as any).records ?? []) as any[];
    salesList.value = users.map((user: any) => ({
      id: String(user.id),
      name: user.fullName || user.username || user.email || String(user.id),
    }));
  } catch {
    salesList.value = [];
  }
};

const handleAssignSalesperson = async (val: string | null) => {
  if (!linkedLead.value.id) return;
  const loading = ElLoading.service({
    lock: true,
    text: "Đang phân công nhân viên phụ trách...",
    background: "rgba(0,0,0,0.7)",
  });
  try {
    await fetchAssignLead(linkedLead.value.id, val || "");
    ElMessage.success("Phân công nhân viên kinh doanh thành công");
  } catch (err: any) {
    ElMessage.error(err.message || "Lỗi khi phân công nhân viên");
  } finally {
    loading.close();
  }
};

const goToWorkshopCalendar = () => {
  dialogVisible.value = false;
  router.push("/factory/workshop/appointments");
};

const bookingForm = ref({
  customerName: "",
  phone: "",
  email: "",
  time: "09:00",
  date: "",
  type: "TestDrive",
  content: "",
  status: "Pending",
  location: "",
});

const typeOptions = [
  { value: "TestDrive", label: "Lái thử" },
  { value: "Consulting", label: "Tư vấn" },
  { value: "RepairService", label: "Sửa chữa" },
  { value: "WarrantyService", label: "Bảo hành" },
];

const bookings = ref<any[]>([]);

const calendarMonthLabel = computed(() => {
  const d = currentDate.value;
  return `Tháng ${String(d.getMonth() + 1).padStart(2, "0")} / ${d.getFullYear()}`;
});

const prevMonth = () => {
  const d = new Date(currentDate.value);
  d.setMonth(d.getMonth() - 1);
  currentDate.value = d;
};

const nextMonth = () => {
  const d = new Date(currentDate.value);
  d.setMonth(d.getMonth() + 1);
  currentDate.value = d;
};

const isToday = (day: string) => day === new Date().toISOString().split("T")[0];

const fetchBookings = async () => {
  try {
    const res = await BookingApi.getList();
    bookings.value = (res || []).map((b: Booking) => {
      const dt = new Date(b.preferredDate);
      const dateStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
      const timeStr = `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
      return {
        ...b,
        customerName: b.fullName,
        phone: b.phoneNumber,
        email: b.email,
        time: timeStr,
        date: dateStr,
        type: b.bookingType,
        typeLabel:
          b.bookingType === "TestDrive"
            ? "Lái thử"
            : b.bookingType === "Consulting"
              ? "Tư vấn"
              : b.bookingType === "RepairService"
                ? "Sửa chữa"
                : b.bookingType === "WarrantyService"
                  ? "Bảo hành"
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

// Load technician list for workshop type assignments
const technicianList = ref<{ id: number; name: string }[]>([]);

const loadTechnicianList = async () => {
  try {
    const res = await EmployeeApi.getList();
    const items = (res as any).items || (res as any).records || [];
    technicianList.value = items
      .filter((e: any) => {
        const pos = (e.positionName || e.position || "").toLowerCase();
        return (
          pos.includes("kỹ thuật") ||
          pos.includes("thợ") ||
          pos.includes("technician")
        );
      })
      .map((e: any) => ({
        id: e.id,
        name: e.fullName || e.name || String(e.id),
      }));
  } catch {
    technicianList.value = [];
  }
};

onMounted(() => {
  fetchBookings();
  fetchSalesList();
  loadTechnicianList();
});

const PENDING_PAGE_SIZE = 10;
const pendingPage = ref(1);

const pendingBookings = computed(() =>
  bookings.value
    .filter((b) => b.status === "Pending")
    .sort((a, b) => a.time.localeCompare(b.time)),
);
const pendingBookingsPaged = computed(() => {
  const start = (pendingPage.value - 1) * PENDING_PAGE_SIZE;
  return pendingBookings.value.slice(start, start + PENDING_PAGE_SIZE);
});
const pendingTotalPages = computed(() =>
  Math.max(1, Math.ceil(pendingBookings.value.length / PENDING_PAGE_SIZE)),
);
const isEditing = computed(() => !!editingBookingId.value);

const getBookings = (day: string) =>
  bookings.value.filter((b) => b.date === day);

const getBookingPillClass = (booking: any) => {
  if (booking.status === "Pending") return "pill-pending";
  if (booking.type === "TestDrive") return "pill-testdrive";
  if (booking.type === "RepairService") return "pill-repair";
  if (booking.type === "WarrantyService") return "pill-warranty";
  return "pill-default";
};

const getBookingClasses = (booking: any) => {
  if (booking.status === "Pending")
    return "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-300";
  if (booking.type === "TestDrive")
    return "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-300";
  if (booking.type === "RepairService")
    return "bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-950/20 dark:border-orange-800 dark:text-orange-300";
  if (booking.type === "WarrantyService")
    return "bg-purple-50 border-purple-200 text-purple-600 dark:bg-purple-950/20 dark:border-purple-800 dark:text-purple-300";
  return "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300";
};

const handleCellClick = (day: string) => {
  selectedDay.value = day;
  dayListDialogVisible.value = true;
};

const openNewBookingFormForSelectedDay = () => {
  dayListDialogVisible.value = false;
  dialogTitle.value = "Đặt lịch mới";
  editingBookingId.value = null;
  bookingForm.value = {
    customerName: "",
    phone: "",
    email: "",
    time: "09:00",
    date: selectedDay.value,
    type: "TestDrive",
    content: "",
    status: "Pending",
    location: "",
  };
  dialogVisible.value = true;
};

const viewBookingFromDayList = (booking: any) => {
  dayListDialogVisible.value = false;
  handleBookingClick(booking);
};

const getBookingBadgeClass = (booking: any) => {
  if (booking.type === "TestDrive")
    return "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400";
  if (booking.type === "RepairService")
    return "bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400";
  if (booking.type === "WarrantyService")
    return "bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400";
  return "bg-slate-50 text-slate-600 dark:bg-slate-950/20 dark:text-slate-400";
};

const handleCreateNew = () =>
  handleCellClick(new Date().toISOString().split("T")[0]);

const handleBookingClick = async (booking: any) => {
  activeBooking.value = booking;
  dialogTitle.value = "Chi tiết lịch hẹn";
  editingBookingId.value = booking.id;
  bookingForm.value = { ...booking };
  dialogVisible.value = true;

  // Reset linkedLead
  linkedLead.value = { id: null, assignedToId: null };

  const bookingPhone = booking.phone || booking.phoneNumber;
  if (bookingPhone) {
    try {
      const res = await fetchGetLeadList();
      const leads = (
        Array.isArray(res)
          ? res
          : ((res as any).items ?? (res as any).records ?? [])
      ) as any[];
      const exactLead = leads.find((l: any) => l.phoneNumber === bookingPhone);
      if (exactLead) {
        linkedLead.value = {
          id: exactLead.id,
          assignedToId: exactLead.assignedToId || null,
        };
      }
    } catch (err) {
      console.error("Lỗi khi truy vấn Lead liên kết:", err);
    }
  }
};

const confirmBooking = async (booking: any) => {
  if (!booking) return;
  const loading = ElLoading.service({
    lock: true,
    text: "Đang xác nhận & gửi thông báo...",
    background: "rgba(0,0,0,0.7)",
  });
  try {
    await BookingApi.confirm(booking.id);
    ElMessage.success(
      `Đã xác nhận và gửi thông báo tới ${booking.customerName}`,
    );
    await fetchBookings();
    dialogVisible.value = false;
  } catch (err: any) {
    ElMessage.error(err.message || "Lỗi khi xác nhận");
  } finally {
    loading.close();
  }
};

const handleSaveBooking = async () => {
  if (!bookingForm.value.customerName)
    return ElMessage.warning("Vui lòng nhập tên khách hàng.");
  if (!bookingForm.value.phone)
    return ElMessage.warning("Vui lòng nhập số điện thoại.");
  if (!bookingForm.value.date)
    return ElMessage.warning("Vui lòng chọn ngày hẹn.");

  // Check overlap on frontend
  const hasOverlap = bookings.value.some(
    (b) =>
      b.date === bookingForm.value.date &&
      b.time === bookingForm.value.time &&
      b.status !== "Cancelled" &&
      b.id !== editingBookingId.value,
  );
  if (hasOverlap) {
    return ElMessage.error(
      "Thời gian đặt lịch này đã bị trùng với lịch hẹn khác.",
    );
  }

  if (isEditing.value) {
    if (!isAdmin.value)
      return ElMessage.warning("Chỉ Admin mới được chỉnh sửa.");
    try {
      const dt = new Date(
        `${bookingForm.value.date}T${bookingForm.value.time}`,
      );
      await BookingApi.update(editingBookingId.value!, {
        id: editingBookingId.value!,
        fullName: bookingForm.value.customerName,
        phoneNumber: bookingForm.value.phone,
        email: bookingForm.value.email || "",
        preferredDate: dt.toISOString(),
        note: bookingForm.value.content,
        bookingType: bookingForm.value.type,
        location: "Showroom",
        status: bookingForm.value.status,
      });
      ElMessage.success("Cập nhật thành công");
      await fetchBookings();
      dialogVisible.value = false;
    } catch (err: any) {
      ElMessage.error(err.message || "Lỗi cập nhật");
    }
    return;
  }

  const workshopTypes = ["RepairService", "WarrantyService"];
  const typeLabel =
    typeOptions.find((t) => t.value === bookingForm.value.type)?.label ?? "mới";

  try {
    await BookingApi.create({
      fullName: bookingForm.value.customerName,
      phoneNumber: bookingForm.value.phone,
      email: bookingForm.value.email || "",
      preferredDate: new Date(
        `${bookingForm.value.date}T${bookingForm.value.time}`,
      ).toISOString(),
      note: bookingForm.value.content,
      bookingType: bookingForm.value.type,
      location: "Showroom",
    });

    if (workshopTypes.includes(bookingForm.value.type)) {
      try {
        await BookingAppointmentApi.create({
          fullName: bookingForm.value.customerName,
          phone: bookingForm.value.phone,
          email: bookingForm.value.email || undefined,
          serviceType: bookingForm.value.type,
          preferredDate: new Date(
            `${bookingForm.value.date}T${bookingForm.value.time}`,
          ).toISOString(),
          notes: bookingForm.value.content,
        });
      } catch {
        /* best-effort */
      }
    }

    ElMessage.success(`Đã tạo lịch ${typeLabel}`);
    await fetchBookings();
    dialogVisible.value = false;
  } catch (err: any) {
    ElMessage.error(err.message || "Lỗi tạo lịch hẹn");
  }
};

const handleDeleteBooking = async () => {
  if (!isAdmin.value) return ElMessage.warning("Chỉ Admin mới được hủy lịch.");
  try {
    await ElMessageBox.confirm("Hủy lịch hẹn này?", "Xác nhận", {
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Bỏ",
      type: "warning",
    });
    await BookingApi.delete(editingBookingId.value!);
    ElMessage.success("Đã hủy lịch");
    await fetchBookings();
    dialogVisible.value = false;
  } catch (err: any) {
    if (err !== "cancel") ElMessage.error(err.message || "Lỗi hủy lịch");
  }
};
</script>

<style lang="scss" scoped>
.customer-booking-page {
  .custom-scrollbar {
    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }

    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 transparent;
  }

  .compact-calendar {
    :deep(.el-calendar) {
      height: 100%;
    }

    :deep(.el-calendar__body) {
      padding: 0;
    }

    .cell-inner {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 3px 4px;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.15s;

      &:hover {
        background-color: #f1f5f9;
      }

      &.is-selected {
        background-color: #eff6ff;
      }
    }

    .day-num {
      font-size: 10px;
      font-weight: 700;
      color: #94a3b8;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      margin-left: auto;
      flex-shrink: 0;

      &.is-active {
        background: #2563eb;
        color: #fff;
      }

      &.is-today {
        background: #dbeafe;
        color: #2563eb;
      }
    }

    .cell-bookings {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1px;
      margin-top: 2px;
      overflow: hidden;
    }

    .booking-pill {
      display: flex;
      align-items: center;
      gap: 3px;
      padding: 1px 5px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      line-height: 1.5;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      color: #fff;

      &.pill-pending {
        background: #94a3b8;
      }

      &.pill-testdrive {
        background: #2563eb;
      }

      &.pill-repair {
        background: #ea580c;
      }

      &.pill-warranty {
        background: #9333ea;
      }

      &.pill-default {
        background: #64748b;
      }

      .pill-time {
        font-size: 9px;
        opacity: 0.85;
        flex-shrink: 0;
      }

      .pill-name {
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .more-bookings-badge {
      margin-top: 2px;
      padding: 1.5px 5px;
      background-color: #f1f5f9;
      border: 1px dashed #cbd5e1;
      border-radius: 4px;
      color: #475569;
      font-size: 8px;
      font-weight: 700;
      text-transform: uppercase;
      text-align: center;
      transition: all 0.15s;

      &:hover {
        background-color: #e2e8f0;
        border-color: #94a3b8;
        color: #1e293b;
      }
    }

    :deep(.el-calendar-table) {
      thead th {
        padding: 8px 0;
        font-size: 10px;
        font-weight: 700;
        color: #94a3b8;
        text-transform: uppercase;
        border-bottom: 1px solid #f1f5f9;
      }

      td {
        border: 1px solid #f1f5f9;
        padding: 1px;
        height: 90px;

        .el-calendar-day {
          min-height: 88px;
          height: 90px;
          padding: 0;
        }
      }
    }
  }

  .compact-input {
    :deep(.el-input__wrapper) {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: none;
      padding: 0 10px;
      min-height: 36px;
    }

    :deep(.el-input__inner) {
      font-size: 13px;
    }
  }

  .compact-select {
    :deep(.el-select__wrapper) {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: none;
      padding: 0 10px;
      min-height: 38px;
      height: 38px;
    }

    :deep(.el-select__placeholder) {
      font-size: 13px;
    }

    :deep(.el-select__selected-item) {
      font-size: 13px;
    }
  }
}

:deep(.compact-booking-dialog) {
  border-radius: 16px;

  .el-dialog__header {
    padding: 16px 20px;
    margin-right: 0;
    border-bottom: 1px solid #f1f5f9;
  }

  .el-dialog__body {
    padding: 12px 20px 0;
  }

  .el-dialog__footer {
    padding: 12px 20px;
    border-top: 1px solid #f1f5f9;
  }
}

:global(html.dark .customer-booking-page) {
  background-color: #05070b !important;
  color: #f8fafc !important;
}

:global(html.dark .customer-booking-page .compact-calendar .el-calendar-table) {
  thead th {
    border-bottom-color: rgb(255 255 255 / 6%) !important;
  }

  td {
    border-color: rgb(255 255 255 / 6%) !important;
  }
}

:global(html.dark .customer-booking-page .compact-input .el-input__wrapper) {
  background-color: #111827 !important;
  border-color: rgb(255 255 255 / 10%) !important;
  box-shadow: none !important;
}

:global(html.dark .customer-booking-page .compact-input .el-input__inner) {
  color: #f8fafc !important;
}

:global(html.dark .customer-booking-page .compact-select .el-select__wrapper) {
  background-color: #111827 !important;
  border-color: rgb(255 255 255 / 10%) !important;
  box-shadow: none !important;
}

:global(
  html.dark .customer-booking-page .compact-select .el-select__placeholder
) {
  color: #64748b !important;
}

:global(
  html.dark .customer-booking-page .compact-select .el-select__selected-item
) {
  color: #f8fafc !important;
}

:global(html.dark .customer-booking-page .more-bookings-badge) {
  background-color: #1e293b !important;
  border-color: #334155 !important;
  color: #94a3b8 !important;
}

:global(html.dark .customer-booking-page .more-bookings-badge:hover) {
  background-color: #334155 !important;
  color: #f1f5f9 !important;
}

:global(html.dark .customer-booking-page .cell-inner:hover) {
  background-color: rgb(255 255 255 / 4%) !important;
}

:global(html.dark .customer-booking-page .cell-inner.is-selected) {
  background-color: rgb(30 58 138 / 20%) !important;
}

:global(html.dark .customer-booking-page .day-num) {
  color: #64748b !important;
}

:global(html.dark .customer-booking-page .day-num.is-today) {
  background: rgb(30 58 138 / 40%) !important;
  color: #93c5fd !important;
}

:global(html.dark .compact-booking-dialog) {
  background-color: #10141c !important;
}

:global(html.dark .compact-booking-dialog .el-dialog__header) {
  border-bottom-color: rgb(255 255 255 / 6%) !important;
}

:global(html.dark .compact-booking-dialog .el-dialog__footer) {
  border-top-color: rgb(255 255 255 / 6%) !important;
}

:global(html.dark .compact-booking-dialog label) {
  color: #94a3b8 !important;
}
</style>
