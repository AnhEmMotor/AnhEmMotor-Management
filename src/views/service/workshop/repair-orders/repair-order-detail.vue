<template>
  <div
    class="repair-order-detail-page flex flex-col min-h-screen bg-[#F8FAFC] font-inter text-[#0F172A]"
  >
    <!-- Header -->
    <div class="bg-white border-b border-slate-200 px-8 py-5 shrink-0 shadow-sm relative z-20">
      <div class="flex justify-between items-center max-w-[1400px] mx-auto">
        <div class="flex items-center gap-5">
          <button
            @click="goBack"
            class="size-9 rounded-xl border border-slate-200 text-slate-600 flex-cc hover:bg-slate-50 transition-all active:scale-95"
          >
            <ArtSvgIcon icon="ri:arrow-left-line" />
          </button>

          <div>
            <div class="flex items-center gap-3">
              <h1 class="m-0 text-lg font-black tracking-tight text-slate-900 leading-none">
                Phiếu sửa chữa RO-{{ String(orderId).padStart(5, '0') }}
              </h1>

              <span :class="getStatusBadgeClass(order?.status || '')">
                {{ getStatusText(order?.status || '') }}
              </span>
            </div>

            <p
              class="m-0 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-1.5"
            >
              <ArtSvgIcon icon="ri:calendar-line" /> Ngày tạo:
              {{ formatDate(order?.createdAt || '') }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            v-if="order?.status === 'Completed'"
            @click="openPrintInvoice"
            class="h-9 px-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <ArtSvgIcon icon="ri:printer-line" /> In hóa đơn dịch vụ
          </button>
        </div>
      </div>
    </div>

    <!-- Main -->
    <div class="flex-1 max-w-[1400px] mx-auto w-full p-6" v-loading="loading">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6" v-if="order">
        <!-- Left side -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Workflow timeline -->
          <div class="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm space-y-6">
            <h3 class="text-[10px] font-black uppercase text-slate-400 tracking-wider m-0">
              Tiến độ quy trình
            </h3>

            <div class="relative pl-6 border-l-2 border-slate-100 space-y-6">
              <div v-for="step in steps" :key="step.status" class="relative">
                <div
                  class="absolute -left-[31px] top-0 size-4 rounded-full border-2 flex-cc transition-all"
                  :class="getStepDotClass(step.status)"
                >
                  <div
                    :class="getStepInnerDotClass(step.status)"
                    class="size-1.5 rounded-full"
                  ></div>
                </div>

                <div class="pl-2">
                  <h4
                    class="m-0 text-xs font-black uppercase"
                    :class="isStepActive(step.status) ? 'text-slate-800' : 'text-slate-400'"
                  >
                    {{ step.title }}
                  </h4>
                  <p class="m-0 text-[10px] text-slate-400 mt-1 leading-relaxed">
                    {{ step.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Customer & vehicle -->
          <div class="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm space-y-4">
            <h3 class="text-[10px] font-black uppercase text-slate-400 tracking-wider m-0">
              Thông tin khách hàng & Xe
            </h3>

            <div class="space-y-3 divide-y divide-slate-50 text-xs">
              <div class="pt-0 flex justify-between py-2">
                <span class="text-slate-400">Khách hàng:</span>
                <span class="font-bold text-slate-800">{{ order.customerName }}</span>
              </div>
              <div class="flex justify-between py-2">
                <span class="text-slate-400">Số điện thoại:</span>
                <span class="font-bold text-slate-800">{{ order.customerPhone }}</span>
              </div>
              <div class="flex justify-between py-2" v-if="order.vehicle">
                <span class="text-slate-400">Biển số xe:</span>
                <span class="font-bold text-slate-800 font-mono">{{
                  order.vehicle.licensePlate || 'Chưa đăng ký'
                }}</span>
              </div>
              <div class="flex justify-between py-2" v-if="order.vehicle">
                <span class="text-slate-400">Số khung:</span>
                <span class="font-mono text-slate-800 text-[10px]">{{
                  order.vehicle.vinNumber || '-'
                }}</span>
              </div>
              <div class="flex justify-between py-2">
                <span class="text-slate-400">Số KM lúc vào:</span>
                <span class="font-bold text-slate-800"
                  >{{ order.mileage.toLocaleString() }} km</span
                >
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm space-y-3">
            <h3 class="text-[10px] font-black uppercase text-slate-400 tracking-wider m-0">
              Triệu chứng & Lỗi ghi nhận
            </h3>
            <p
              class="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic m-0"
            >
              "{{ order.description }}"
            </p>
            <div v-if="order.notes" class="mt-3">
              <p class="text-[9px] font-black uppercase text-slate-400 tracking-wider m-0">
                Ghi chú ngoại quan:
              </p>
              <p class="text-xs text-slate-500 m-0 mt-1 pl-1 border-l border-slate-300">{{
                order.notes
              }}</p>
            </div>
          </div>
        </div>

        <!-- Right side: actions by phase -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Phase 1: Assign technician -->
          <div
            v-if="order.status === 'Pending'"
            class="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm space-y-5"
          >
            <h3
              class="text-sm font-black uppercase text-slate-800 tracking-wider m-0 flex items-center gap-2"
            >
              <span class="size-5 rounded bg-blue-50 text-blue-600 flex-cc text-xs">1</span>
              Phân công kỹ thuật viên phụ trách
            </h3>
            <p class="text-xs text-slate-500 m-0">
              Chọn kỹ thuật viên để tiếp nhận xe, kiểm tra chẩn đoán lỗi và bắt đầu sửa chữa.
            </p>

            <div class="flex gap-4 items-center pt-2">
              <ElSelect
                v-model="selectedTechId"
                placeholder="Chọn kỹ thuật viên"
                class="w-80 combat-select"
              >
                <ElOption
                  v-for="tech in technicians"
                  :key="tech.id"
                  :label="tech.fullName + ' (' + tech.jobTitle + ')"
                  :value="tech.id"
                />
              </ElSelect>

              <button
                @click="assignTechnician"
                :disabled="!selectedTechId || submitting"
                class="h-10 px-6 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-md"
              >
                <ArtSvgIcon icon="ri:user-shared-line" /> Xác nhận phân công
              </button>
            </div>
          </div>

          <!-- Phase 2: Issue parts/services (InProgress & QcPending) -->
          <div
            v-if="order.status === 'InProgress' || order.status === 'QcPending'"
            class="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm space-y-5"
          >
            <div class="flex justify-between items-center">
              <h3
                class="text-sm font-black uppercase text-slate-800 tracking-wider m-0 flex items-center gap-2"
              >
                <span class="size-5 rounded bg-blue-50 text-blue-600 flex-cc text-xs">2</span>
                Hạng mục sửa chữa & Vật tư thay thế
              </h3>

              <div class="flex gap-2">
                <button
                  @click="openServiceDialog"
                  :disabled="order.status === 'QcPending'"
                  class="h-8 px-4 bg-slate-900 text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-blue-900 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-60"
                >
                  + Thêm dịch vụ
                </button>
                <button
                  @click="openPartsDialog"
                  :disabled="order.status === 'QcPending'"
                  class="h-8 px-4 bg-slate-900 text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-blue-900 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-60"
                >
                  + Thêm phụ tùng
                </button>
              </div>
            </div>

            <div class="border border-slate-100 rounded-2xl overflow-hidden">
              <table class="w-full text-xs border-collapse">
                <thead>
                  <tr
                    class="bg-slate-50 border-b border-slate-100 text-slate-400 font-black uppercase text-[9px] tracking-wider"
                  >
                    <th class="py-3 px-4 text-left">Hạng mục</th>
                    <th class="py-3 px-4 text-center" width="80">Loại</th>
                    <th class="py-3 px-4 text-center" width="100">Số lượng</th>
                    <th class="py-3 px-4 text-right" width="140">Đơn giá</th>
                    <th class="py-3 px-4 text-right" width="140">Thành tiền</th>
                    <th class="py-3 px-4 text-center" width="60"></th>
                  </tr>
                </thead>

                <tbody class="divide-y divide-slate-100">
                  <tr
                    v-for="(srv, index) in localServices"
                    :key="'srv-' + index"
                    class="hover:bg-slate-50/50"
                  >
                    <td class="py-3.5 px-4">
                      <div class="font-bold text-slate-800">{{ srv.serviceName }}</div>
                      <input
                        v-model="srv.notes"
                        :disabled="order.status === 'QcPending'"
                        placeholder="Ghi chú dịch vụ..."
                        class="w-full mt-1 border-0 bg-transparent text-[10px] text-slate-400 p-0 focus:ring-0 focus:outline-none"
                      />
                    </td>
                    <td class="py-3.5 px-4 text-center">
                      <span
                        class="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-[9px] font-black uppercase"
                      >
                        Công việc
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-center text-slate-500">1</td>
                    <td class="py-3.5 px-4 text-right">
                      <ElInputNumber
                        v-model="srv.laborCost"
                        :min="0"
                        :controls="false"
                        :disabled="order.status === 'QcPending'"
                        class="slim-number-input inline-block text-right"
                      />
                    </td>
                    <td class="py-3.5 px-4 text-right font-bold text-slate-700">{{
                      formatCurrency(srv.laborCost)
                    }}</td>
                    <td class="py-3.5 px-4 text-center">
                      <button
                        v-if="order.status !== 'QcPending'"
                        @click="removeService(index)"
                        class="text-red-400 hover:text-red-600"
                      >
                        <ArtSvgIcon icon="ri:delete-bin-line" />
                      </button>
                    </td>
                  </tr>

                  <tr
                    v-for="(part, index) in localParts"
                    :key="'part-' + index"
                    class="hover:bg-slate-50/50"
                  >
                    <td class="py-3.5 px-4">
                      <div class="font-bold text-slate-800">{{ part.variantName }}</div>
                      <input
                        v-model="part.notes"
                        :disabled="order.status === 'QcPending'"
                        placeholder="Ghi chú phụ tùng..."
                        class="w-full mt-1 border-0 bg-transparent text-[10px] text-slate-400 p-0 focus:ring-0 focus:outline-none"
                      />
                    </td>
                    <td class="py-3.5 px-4 text-center">
                      <span
                        class="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase"
                      >
                        Phụ tùng
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-center">
                      <ElInputNumber
                        v-model="part.count"
                        :min="1"
                        :controls="false"
                        :disabled="order.status === 'QcPending'"
                        class="slim-number-input inline-block w-14 text-center"
                      />
                    </td>
                    <td class="py-3.5 px-4 text-right">
                      <ElInputNumber
                        v-model="part.price"
                        :min="0"
                        :controls="false"
                        :disabled="order.status === 'QcPending'"
                        class="slim-number-input inline-block text-right"
                      />
                    </td>
                    <td class="py-3.5 px-4 text-right font-bold text-slate-700">{{
                      formatCurrency(part.price * part.count)
                    }}</td>
                    <td class="py-3.5 px-4 text-center">
                      <button
                        v-if="order.status !== 'QcPending'"
                        @click="removePart(index)"
                        class="text-red-400 hover:text-red-600"
                      >
                        <ArtSvgIcon icon="ri:delete-bin-line" />
                      </button>
                    </td>
                  </tr>

                  <tr v-if="localServices.length === 0 && localParts.length === 0">
                    <td colspan="6" class="py-8 text-center text-slate-400 italic">
                      Chưa có dịch vụ hay phụ tùng nào được thêm.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Cost summary -->
            <div class="flex justify-end pt-2">
              <div class="w-72 space-y-2 text-xs">
                <div class="flex justify-between text-slate-500">
                  <span>Tiền công sửa chữa:</span>
                  <span class="font-bold text-slate-700">{{ formatCurrency(totalLaborCost) }}</span>
                </div>
                <div class="flex justify-between text-slate-500">
                  <span>Tiền phụ tùng vật tư:</span>
                  <span class="font-bold text-slate-700">{{ formatCurrency(totalPartsCost) }}</span>
                </div>
                <div class="flex justify-between text-base border-t border-slate-100 pt-3">
                  <span class="font-black text-slate-900 uppercase">Tổng cộng:</span>
                  <span class="font-black text-blue-600 text-lg">{{
                    formatCurrency(totalAmount)
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div
              class="flex justify-end gap-3 pt-4 border-t border-slate-100"
              v-if="order.status === 'InProgress'"
            >
              <button
                @click="saveIssueParts('InProgress')"
                :disabled="submitting"
                class="h-10 px-5 border border-slate-200 text-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                Lưu thay đổi
              </button>

              <button
                @click="saveIssueParts('QcPending')"
                :disabled="submitting"
                class="h-10 px-6 bg-amber-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-700 transition-all flex items-center gap-2 shadow-md"
              >
                <ArtSvgIcon icon="ri:shield-flash-line" /> Hoàn tất sửa & Chuyển QC
              </button>
            </div>
          </div>

          <!-- Phase 3: QC & Checkout -->
          <div
            v-if="order.status === 'QcPending'"
            class="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm space-y-5"
          >
            <h3
              class="text-sm font-black uppercase text-slate-800 tracking-wider m-0 flex items-center gap-2"
            >
              <span class="size-5 rounded bg-blue-50 text-blue-600 flex-cc text-xs">3</span>
              Nghiệm thu QC & Thanh toán hóa đơn dịch vụ
            </h3>
            <p class="text-xs text-slate-500 m-0">
              Xe đã hoàn thành sửa chữa kỹ thuật và đã vượt qua bài kiểm tra chất lượng (QC). Tiến
              hành lập hóa đơn để bàn giao.
            </p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              <div>
                <label
                  class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2"
                  >Phương thức thanh toán *</label
                >
                <ElSelect
                  v-model="paymentMethod"
                  placeholder="Phương thức"
                  class="w-full combat-select"
                >
                  <ElOption label="Tiền mặt (Cash)" value="Cash" />
                  <ElOption label="Chuyển khoản (Transfer)" value="BankTransfer" />
                </ElSelect>
              </div>

              <div>
                <label
                  class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2"
                  >Trạng thái thanh toán *</label
                >
                <ElSelect
                  v-model="paymentStatus"
                  placeholder="Trạng thái"
                  class="w-full combat-select"
                >
                  <ElOption label="Đã thanh toán (Paid)" value="Paid" />
                  <ElOption label="Chưa thanh toán (Unpaid)" value="Unpaid" />
                </ElSelect>
              </div>

              <div>
                <label
                  class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2"
                  >Ghi chú bàn giao</label
                >
                <ElInput
                  v-model="checkoutNotes"
                  placeholder="Nhập ghi chú (nếu có)"
                  class="combat-input"
                />
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                @click="completeRepairOrder"
                :disabled="submitting"
                class="h-10 px-8 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg"
              >
                <ArtSvgIcon icon="ri:checkbox-circle-fill" /> Xác nhận thanh toán & Bàn giao xe
              </button>
            </div>
          </div>

          <!-- Phase 4: Completed read-only -->
          <div
            v-if="order.status === 'Completed'"
            class="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm space-y-4"
          >
            <h3
              class="text-sm font-black uppercase text-slate-800 tracking-wider m-0 flex items-center gap-2"
            >
              <ArtSvgIcon icon="ri:checkbox-circle-fill" class="text-emerald-500" />
              Thông tin thanh toán & Bàn giao hóa đơn
            </h3>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-2">
              <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-wider m-0"
                  >Tổng tiền hóa đơn</p
                >
                <p class="text-sm font-black text-slate-800 mt-2 m-0">{{
                  formatCurrency(order.totalAmount)
                }}</p>
              </div>

              <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-wider m-0"
                  >Phương thức thanh toán</p
                >
                <p class="text-sm font-black text-slate-800 mt-2 m-0">{{
                  getPaymentMethodText(order.paymentMethod || '')
                }}</p>
              </div>

              <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-wider m-0"
                  >Trạng thái thanh toán</p
                >
                <p class="text-sm font-black text-emerald-600 mt-2 m-0">{{
                  order.paymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'
                }}</p>
              </div>

              <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-wider m-0"
                  >Thời điểm hoàn tất</p
                >
                <p class="text-[11px] font-bold text-slate-700 mt-2.5 m-0">{{
                  formatDate(order.completedDate || order.createdAt || '')
                }}</p>
              </div>
            </div>

            <div class="border border-slate-100 rounded-2xl overflow-hidden mt-5">
              <table class="w-full text-xs border-collapse">
                <thead>
                  <tr
                    class="bg-slate-50 border-b border-slate-100 text-slate-400 font-black uppercase text-[9px] tracking-wider"
                  >
                    <th class="py-3 px-4 text-left">Hạng mục</th>
                    <th class="py-3 px-4 text-center" width="80">Loại</th>
                    <th class="py-3 px-4 text-center" width="100">Số lượng</th>
                    <th class="py-3 px-4 text-right" width="140">Đơn giá</th>
                    <th class="py-3 px-4 text-right" width="140">Thành tiền</th>
                  </tr>
                </thead>

                <tbody class="divide-y divide-slate-100">
                  <tr v-for="detail in order.details" :key="detail.id" class="hover:bg-slate-50/50">
                    <td class="py-3 px-4">
                      <div class="font-bold text-slate-800">
                        {{ detail.type === 'Service' ? detail.serviceName : detail.variantName }}
                      </div>
                      <div class="text-[10px] text-slate-400 mt-0.5" v-if="detail.notes">{{
                        detail.notes
                      }}</div>
                    </td>
                    <td class="py-3 px-4 text-center">
                      <span
                        v-if="detail.type === 'Service'"
                        class="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-[9px] font-black uppercase"
                      >
                        Công việc
                      </span>
                      <span
                        v-else
                        class="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase"
                      >
                        Phụ tùng
                      </span>
                    </td>
                    <td class="py-3 px-4 text-center text-slate-600">{{ detail.count }}</td>
                    <td class="py-3 px-4 text-right text-slate-600">
                      {{
                        formatCurrency(detail.type === 'Service' ? detail.laborCost : detail.price)
                      }}
                    </td>
                    <td class="py-3 px-4 text-right font-bold text-slate-800">
                      {{
                        formatCurrency(
                          detail.type === 'Service'
                            ? detail.laborCost
                            : detail.price * detail.count,
                        )
                      }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
