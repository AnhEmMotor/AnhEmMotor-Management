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

    <!-- Main Container -->
    <div class="flex-1 max-w-[1400px] mx-auto w-full p-6" v-loading="loading">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6" v-if="order">
        <!-- Left Side: Basic Info & Steps Workflow -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Stepper Workflow -->
          <div class="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm space-y-6">
            <h3 class="text-[10px] font-black uppercase text-slate-400 tracking-wider m-0"
              >Tiến độ quy trình</h3
            >

            <div class="relative pl-6 border-l-2 border-slate-100 space-y-6">
              <div v-for="step in steps" :key="step.status" class="relative">
                <!-- Dot Indicator -->
                <div
                  class="absolute -left-[31px] top-0 size-4 rounded-full border-2 flex-cc transition-all"
                  :class="getStepDotClass(step.status)"
                >
                  <div
                    class="size-1.5 rounded-full"
                    :class="getStepInnerDotClass(step.status)"
                  ></div>
                </div>
                <div class="pl-2">
                  <h4
                    class="m-0 text-xs font-black uppercase"
                    :class="isStepActive(step.status) ? 'text-slate-800' : 'text-slate-400'"
                  >
                    {{ step.title }}
                  </h4>
                  <p class="m-0 text-[10px] text-slate-400 mt-1 leading-relaxed">{{
                    step.description
                  }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Customer & Vehicle Info -->
          <div class="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm space-y-4">
            <h3 class="text-[10px] font-black uppercase text-slate-400 tracking-wider m-0"
              >Thông tin khách hàng & Xe</h3
            >

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

          <!-- Description of failure -->
          <div class="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm space-y-3">
            <h3 class="text-[10px] font-black uppercase text-slate-400 tracking-wider m-0"
              >Triệu chứng & Lỗi ghi nhận</h3
            >
            <p
              class="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic m-0"
            >
              "{{ order.description }}"
            </p>
            <div v-if="order.notes" class="mt-3">
              <p class="text-[9px] font-black uppercase text-slate-400 tracking-wider m-0"
                >Ghi chú ngoại quan:</p
              >
              <p class="text-xs text-slate-500 m-0 mt-1 pl-1 border-l border-slate-300">{{
                order.notes
              }}</p>
            </div>
          </div>
        </div>

        <!-- Right Side: Workflow actions based on state -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Phase 1: Assign Technician -->
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
              Chọn một thợ kỹ thuật để tiếp nhận xe, kiểm tra chẩn đoán lỗi và bắt đầu sửa chữa.
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
                  :label="tech.fullName + ' (' + tech.jobTitle + ')'"
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

          <!-- Phase 2: Add Services & Parts / Sửa chữa -->
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
                  class="h-8 px-4 bg-slate-900 text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-blue-900 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  + Thêm dịch vụ
                </button>
                <button
                  @click="openPartsDialog"
                  class="h-8 px-4 bg-slate-900 text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-blue-900 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  + Thêm phụ tùng
                </button>
              </div>
            </div>

            <!-- Services & Parts Table -->
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
                  <!-- Services -->
                  <tr
                    v-for="(srv, index) in localServices"
                    :key="'srv-' + index"
                    class="hover:bg-slate-50/50"
                  >
                    <td class="py-3.5 px-4">
                      <div class="font-bold text-slate-800">{{ srv.serviceName }}</div>
                      <input
                        v-model="srv.notes"
                        placeholder="Ghi chú dịch vụ..."
                        class="w-full mt-1 border-0 bg-transparent text-[10px] text-slate-400 p-0 focus:ring-0 focus:outline-none"
                      />
                    </td>
                    <td class="py-3.5 px-4 text-center">
                      <span
                        class="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-[9px] font-black uppercase"
                        >Công việc</span
                      >
                    </td>
                    <td class="py-3.5 px-4 text-center text-slate-500">1</td>
                    <td class="py-3.5 px-4 text-right">
                      <ElInputNumber
                        v-model="srv.laborCost"
                        :min="0"
                        :controls="false"
                        class="slim-number-input inline-block text-right"
                      />
                    </td>
                    <td class="py-3.5 px-4 text-right font-bold text-slate-700">{{
                      formatCurrency(srv.laborCost)
                    }}</td>
                    <td class="py-3.5 px-4 text-center">
                      <button @click="removeService(index)" class="text-red-400 hover:text-red-600"
                        ><ArtSvgIcon icon="ri:delete-bin-line"
                      /></button>
                    </td>
                  </tr>

                  <!-- Parts -->
                  <tr
                    v-for="(part, index) in localParts"
                    :key="'part-' + index"
                    class="hover:bg-slate-50/50"
                  >
                    <td class="py-3.5 px-4">
                      <div class="font-bold text-slate-800">{{ part.variantName }}</div>
                      <input
                        v-model="part.notes"
                        placeholder="Ghi chú phụ tùng..."
                        class="w-full mt-1 border-0 bg-transparent text-[10px] text-slate-400 p-0 focus:ring-0 focus:outline-none"
                      />
                    </td>
                    <td class="py-3.5 px-4 text-center">
                      <span
                        class="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase"
                        >Phụ tùng</span
                      >
                    </td>
                    <td class="py-3.5 px-4 text-center">
                      <ElInputNumber
                        v-model="part.count"
                        :min="1"
                        :controls="false"
                        class="slim-number-input inline-block w-14 text-center"
                      />
                    </td>
                    <td class="py-3.5 px-4 text-right">
                      <ElInputNumber
                        v-model="part.price"
                        :min="0"
                        :controls="false"
                        class="slim-number-input inline-block text-right"
                      />
                    </td>
                    <td class="py-3.5 px-4 text-right font-bold text-slate-700">{{
                      formatCurrency(part.price * part.count)
                    }}</td>
                    <td class="py-3.5 px-4 text-center">
                      <button @click="removePart(index)" class="text-red-400 hover:text-red-600"
                        ><ArtSvgIcon icon="ri:delete-bin-line"
                      /></button>
                    </td>
                  </tr>

                  <tr v-if="localServices.length === 0 && localParts.length === 0">
                    <td colspan="6" class="py-8 text-center text-slate-400 italic">
                      Chưa có dịch vụ hay phụ tùng nào được thêm. Hãy chọn từ các nút phía trên.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Cost Summary -->
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
            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
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

          <!-- Phase 3: QC & Checkout / Bàn giao xe -->
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
              hành lập hóa đơn thanh toán cho khách hàng để bàn giao.
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
                  <ElOption label="Chuyển khoản (Transfer)" value="Transfer" />
                  <ElOption label="Quẹt thẻ (Card)" value="Card" />
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

          <!-- Phase 4: Completed details -->
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
                  formatDate(order.completedDate || '')
                }}</p>
              </div>
            </div>

            <!-- Items Table in Locked State -->
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
                      <div class="font-bold text-slate-800">{{
                        detail.type === 'Service' ? detail.serviceName : detail.variantName
                      }}</div>
                      <div class="text-[10px] text-slate-400 mt-0.5" v-if="detail.notes">{{
                        detail.notes
                      }}</div>
                    </td>
                    <td class="py-3 px-4 text-center">
                      <span
                        v-if="detail.type === 'Service'"
                        class="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-[9px] font-black uppercase"
                        >Công việc</span
                      >
                      <span
                        v-else
                        class="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase"
                        >Phụ tùng</span
                      >
                    </td>
                    <td class="py-3 px-4 text-center text-slate-600">{{ detail.count }}</td>
                    <td class="py-3 px-4 text-right text-slate-600">{{
                      formatCurrency(detail.type === 'Service' ? detail.laborCost : detail.price)
                    }}</td>
                    <td class="py-3 px-4 text-right font-bold text-slate-800">{{
                      formatCurrency(
                        detail.type === 'Service' ? detail.laborCost : detail.price * detail.count,
                      )
                    }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialogs -->
    <!-- Service Search Dialog -->
    <ElDialog
      v-model="serviceDialogVisible"
      title="Thêm dịch vụ bảo trì"
      width="600px"
      custom-class="combat-dialog"
    >
      <div class="space-y-4">
        <ElInput
          v-model="serviceSearch"
          placeholder="Tìm tên dịch vụ..."
          clearable
          class="combat-input"
        >
          <template #prefix><ArtSvgIcon icon="ri:search-line" /></template>
        </ElInput>

        <div
          class="max-h-96 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl custom-scrollbar bg-white"
        >
          <div
            v-for="srv in filteredServices"
            :key="srv.id"
            @click="addServiceItem(srv)"
            class="p-3.5 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-all"
          >
            <div>
              <div class="font-bold text-slate-800 text-xs">{{ srv.name }}</div>
              <div class="text-[10px] text-slate-400 mt-0.5" v-if="srv.description">{{
                srv.description
              }}</div>
            </div>
            <div class="text-right">
              <span class="font-black text-blue-600 text-xs">{{
                formatCurrency(srv.basePrice)
              }}</span>
            </div>
          </div>
          <div
            v-if="filteredServices.length === 0"
            class="p-8 text-center text-slate-400 italic text-xs"
          >
            Không tìm thấy dịch vụ nào phù hợp
          </div>
        </div>
      </div>
    </ElDialog>

    <!-- Parts Search Dialog -->
    <ElDialog
      v-model="partsDialogVisible"
      title="Thêm phụ tùng"
      width="700px"
      custom-class="combat-dialog"
    >
      <div class="space-y-4">
        <ElInput
          v-model="partsSearch"
          placeholder="Tìm tên phụ tùng/Biến thể..."
          clearable
          class="combat-input"
        >
          <template #prefix><ArtSvgIcon icon="ri:search-line" /></template>
        </ElInput>

        <div
          class="max-h-96 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl custom-scrollbar bg-white"
        >
          <div
            v-for="variant in filteredParts"
            :key="variant.id"
            @click="addPartItem(variant)"
            class="p-3.5 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-all"
          >
            <div class="flex items-center gap-3">
              <img
                :src="variant.coverImageUrl || 'https://placehold.co/50x50'"
                class="size-10 rounded-lg object-cover border border-slate-100"
              />
              <div>
                <div class="font-bold text-slate-800 text-xs">{{ variant.displayName }}</div>
                <div class="text-[10px] text-slate-400 mt-0.5">Mã SP: {{ variant.productId }}</div>
              </div>
            </div>
            <div class="text-right">
              <span class="font-black text-blue-600 text-xs">{{
                formatCurrency(variant.price)
              }}</span>
            </div>
          </div>
          <div
            v-if="filteredParts.length === 0"
            class="p-8 text-center text-slate-400 italic text-xs"
          >
            Không tìm thấy phụ tùng nào phù hợp
          </div>
        </div>
      </div>
    </ElDialog>

    <!-- Printable Invoice Template Dialog -->
    <ElDialog
      v-model="printInvoiceVisible"
      title="In Hóa Đơn Dịch Vụ"
      width="450px"
      custom-class="combat-print-dialog"
    >
      <div
        id="service-invoice-print-area"
        v-if="order"
        class="p-6 bg-white font-mono text-slate-900 text-xs space-y-4 shadow-sm border border-slate-100 rounded-xl"
      >
        <div class="text-center space-y-1">
          <h2 class="text-sm font-black uppercase m-0">HỆ THỐNG ANHEMMOTOR</h2>
          <p class="m-0 text-[10px]">Biên Hòa, Đồng Nai | Hotline: 0912.345.678</p>
          <p
            class="m-0 text-[9px] text-slate-500 uppercase tracking-widest pt-1 border-t border-dashed border-slate-300"
            >Hóa Đơn Sửa Chữa Xe</p
          >
        </div>

        <div class="space-y-1.5 text-[10px]">
          <div
            >Mã phiếu: <span class="font-bold">RO-{{ String(orderId).padStart(5, '0') }}</span></div
          >
          <div
            >Khách hàng: <span>{{ order.customerName }}</span></div
          >
          <div
            >Số điện thoại: <span>{{ order.customerPhone }}</span></div
          >
          <div v-if="order.vehicle"
            >Biển số xe:
            <span class="font-bold font-mono">{{ order.vehicle.licensePlate || '-' }}</span></div
          >
          <div v-if="order.completedDate"
            >Ngày thanh toán: <span>{{ formatDate(order.completedDate) }}</span></div
          >
        </div>

        <div class="border-t border-b border-dashed border-slate-300 py-3 space-y-2">
          <p class="font-black text-[9px] uppercase tracking-wider m-0"
            >Chi tiết dịch vụ & vật tư:</p
          >

          <div class="space-y-2 text-[10px]">
            <div v-for="detail in order.details" :key="detail.id" class="space-y-0.5">
              <div class="flex justify-between">
                <span class="font-bold">{{
                  detail.type === 'Service' ? detail.serviceName : detail.variantName
                }}</span>
                <span>{{
                  formatCurrency(
                    detail.type === 'Service' ? detail.laborCost : detail.price * detail.count,
                  )
                }}</span>
              </div>
              <div
                class="text-[9px] text-slate-500 flex justify-between"
                v-if="detail.type !== 'Service'"
              >
                <span>SL: {{ detail.count }} x {{ formatCurrency(detail.price) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-1 text-right text-[10px]">
          <div class="flex justify-between text-slate-500">
            <span>Tiền công sửa chữa:</span>
            <span>{{ formatCurrency(order.laborCost) }}</span>
          </div>
          <div class="flex justify-between text-slate-500">
            <span>Tiền phụ tùng:</span>
            <span>{{ formatCurrency(order.partsCost) }}</span>
          </div>
          <div
            class="flex justify-between text-xs font-black pt-2 border-t border-dashed border-slate-300 text-slate-900"
          >
            <span>TỔNG CỘNG:</span>
            <span>{{ formatCurrency(order.totalAmount) }}</span>
          </div>
        </div>

        <div class="text-center text-[9px] text-slate-500 pt-5 space-y-1">
          <p class="m-0 font-bold">Cảm ơn quý khách đã tin tưởng!</p>
          <p class="m-0">Hẹn gặp lại quý khách trên vạn dặm đường trường.</p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <button
            @click="printInvoiceVisible = false"
            class="h-8 px-4 text-slate-500 font-bold text-[10px] uppercase"
            >Đóng</button
          >
          <button
            @click="doPrint"
            class="h-8 px-5 bg-blue-600 text-white rounded-lg font-bold text-[10px] uppercase shadow-md hover:bg-blue-700"
            >In ngay</button
          >
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { RepairOrderApi, RepairOrder, RepairOrderDetail } from '@/infrastructure/api/repair-order'
  import { EmployeeApi, EmployeeResponse } from '@/infrastructure/api/employee'
  import { ServiceApi, ServiceResponse } from '@/infrastructure/api/service'
  import { ProductApi } from '@/infrastructure/api/product/product.api'

  defineOptions({ name: 'CustomerWorkshopDetail' })

  const route = useRoute()
  const router = useRouter()

  const orderId = Number(route.params.id)
  const loading = ref(false)
  const submitting = ref(false)
  const order = ref<RepairOrder | null>(null)

  // Selection options
  const technicians = ref<EmployeeResponse[]>([])
  const selectedTechId = ref<number | null>(null)

  // Dialogs visible
  const serviceDialogVisible = ref(false)
  const partsDialogVisible = ref(false)
  const printInvoiceVisible = ref(false)

  // Services & Parts lists
  const servicesCatalog = ref<ServiceResponse[]>([])
  const partsCatalog = ref<any[]>([])

  const serviceSearch = ref('')
  const partsSearch = ref('')

  const localServices = ref<any[]>([])
  const localParts = ref<any[]>([])

  // Checkout fields
  const paymentMethod = ref('Cash')
  const paymentStatus = ref('Paid')
  const checkoutNotes = ref('')

  const steps = [
    {
      status: 'Pending',
      title: 'Tiếp nhận xe',
      description: 'Đã lập phiếu check-in và chờ phân công kỹ thuật viên.',
    },
    {
      status: 'InProgress',
      title: 'Sửa chữa',
      description: 'Đang khảo sát, lập dự toán dịch vụ & lắp phụ tùng thay thế.',
    },
    {
      status: 'QcPending',
      title: 'Kiểm định QC',
      description: 'Khảo sát chất lượng kỹ thuật xe sau sửa chữa.',
    },
    {
      status: 'Completed',
      title: 'Hoàn tất & Bàn giao',
      description: 'Thanh toán hóa đơn và bàn giao xe cho khách hàng.',
    },
  ]

  // Computed totals
  const totalLaborCost = computed(() => {
    return localServices.value.reduce((acc, curr) => acc + (curr.laborCost || 0), 0)
  })

  const totalPartsCost = computed(() => {
    return localParts.value.reduce((acc, curr) => acc + (curr.price || 0) * (curr.count || 0), 0)
  })

  const totalAmount = computed(() => {
    return totalLaborCost.value + totalPartsCost.value
  })

  const loadOrderDetail = async () => {
    loading.value = true
    try {
      const res = await RepairOrderApi.getDetail(orderId)
      order.value = res

      if (order.value) {
        selectedTechId.value = order.value.technicianId || null

        // Load details into local working state
        localServices.value = (order.value.details || [])
          .filter((d) => d.type === 'Service')
          .map((d) => ({
            serviceId: d.serviceId,
            serviceName: d.serviceName,
            laborCost: d.laborCost,
            notes: d.notes || '',
          }))

        localParts.value = (order.value.details || [])
          .filter((d) => d.type === 'Part')
          .map((d) => ({
            productVariantId: d.productVariantId,
            variantName: d.variantName,
            price: d.price,
            count: d.count,
            notes: d.notes || '',
          }))

        checkoutNotes.value = order.value.notes || ''
      }
    } catch (err: any) {
      ElMessage.error(err.message || 'Lỗi khi tải thông tin phiếu sửa chữa')
    } finally {
      loading.value = false
    }
  }

  const loadCatalogs = async () => {
    try {
      // Load technicians
      const resTech = await EmployeeApi.getList()
      technicians.value = resTech || []

      // Load services
      const resSrv = await ServiceApi.getList({ size: 100 })
      servicesCatalog.value = resSrv.items || []

      // Load product variants (FIFO output)
      const resParts = await ProductApi.getVariantsForOutput({ size: 100 })
      partsCatalog.value = resParts.items || []
    } catch (e) {
      console.error('Failed to load catalog data', e)
    }
  }

  onMounted(() => {
    loadOrderDetail()
    loadCatalogs()
  })

  // Assign technician (Move to InProgress)
  const assignTechnician = async () => {
    if (!selectedTechId.value) return
    submitting.value = true
    try {
      await RepairOrderApi.assignTechnician({
        repairOrderId: orderId,
        technicianId: selectedTechId.value,
      })
      ElMessage.success('Đã phân công kỹ thuật viên phụ trách sửa chữa!')
      await loadOrderDetail()
    } catch (err: any) {
      ElMessage.error(err.message || 'Lỗi khi phân công thợ')
    } finally {
      submitting.value = false
    }
  }

  // Services Dialog
  const openServiceDialog = () => {
    serviceSearch.value = ''
    serviceDialogVisible.value = true
  }

  const filteredServices = computed(() => {
    const q = serviceSearch.value.trim().toLowerCase()
    if (!q) return servicesCatalog.value
    return servicesCatalog.value.filter((s) => s.name.toLowerCase().includes(q))
  })

  const addServiceItem = (srv: ServiceResponse) => {
    // Check duplicate
    if (localServices.value.some((s) => s.serviceId === srv.id)) {
      ElMessage.warning('Dịch vụ này đã có trong danh sách')
      return
    }
    localServices.value.push({
      serviceId: srv.id,
      serviceName: srv.name,
      laborCost: srv.basePrice,
      notes: '',
    })
    serviceDialogVisible.value = false
  }

  const removeService = (index: number) => {
    localServices.value.splice(index, 1)
  }

  // Parts Dialog
  const openPartsDialog = () => {
    partsSearch.value = ''
    partsDialogVisible.value = true
  }

  const filteredParts = computed(() => {
    const q = partsSearch.value.trim().toLowerCase()
    if (!q) return partsCatalog.value
    return partsCatalog.value.filter((p) => p.displayName.toLowerCase().includes(q))
  })

  const addPartItem = (part: any) => {
    // Check duplicate
    if (localParts.value.some((p) => p.productVariantId === part.id)) {
      ElMessage.warning('Phụ tùng này đã có trong danh sách')
      return
    }
    localParts.value.push({
      productVariantId: part.id,
      variantName: part.displayName,
      price: part.price,
      count: 1,
      notes: '',
    })
    partsDialogVisible.value = false
  }

  const removePart = (index: number) => {
    localParts.value.splice(index, 1)
  }

  // Save parts & services
  const saveIssueParts = async (targetStatus: 'InProgress' | 'QcPending') => {
    submitting.value = true
    try {
      const payload = {
        repairOrderId: orderId,
        parts: localParts.value.map((p) => ({
          productVariantId: p.productVariantId,
          count: p.count,
          price: p.price,
          notes: p.notes || undefined,
        })),
        services: localServices.value.map((s) => ({
          serviceId: s.serviceId,
          laborCost: s.laborCost,
          notes: s.notes || undefined,
        })),
        status: targetStatus,
      }

      await RepairOrderApi.issueParts(payload)
      ElMessage.success(
        targetStatus === 'QcPending'
          ? 'Hoàn tất sửa chữa, đã chuyển qua bộ phận QC!'
          : 'Cập nhật danh sách vật tư thành công!',
      )
      await loadOrderDetail()
    } catch (err: any) {
      ElMessage.error(err.message || 'Lỗi khi cập nhật danh sách sửa chữa')
    } finally {
      submitting.value = false
    }
  }

  // Complete checkout
  const completeRepairOrder = async () => {
    submitting.value = true
    try {
      await RepairOrderApi.complete({
        repairOrderId: orderId,
        paymentMethod: paymentMethod.value,
        paymentStatus: paymentStatus.value,
        notes: checkoutNotes.value,
      })
      ElMessage.success('Bàn giao xe và thanh toán thành công!')
      await loadOrderDetail()
    } catch (err: any) {
      ElMessage.error(err.message || 'Lỗi khi thanh toán')
    } finally {
      submitting.value = false
    }
  }

  // Invoices print
  const openPrintInvoice = () => {
    printInvoiceVisible.value = true
  }

  const doPrint = () => {
    const printContent = document.getElementById('service-invoice-print-area')
    if (!printContent) return

    const windowUrl = 'about:blank'
    const uniqueName = new Date().getTime().toString()
    const printWindow = window.open(windowUrl, uniqueName, 'left=50000,top=50000,width=0,height=0')

    if (printWindow) {
      printWindow.document.write(`
      <html>
        <head>
          <title>RO-${orderId}</title>
          <style>
            @media print {
              body { font-family: monospace; font-size: 11px; padding: 10px; width: 80mm; }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .flex { display: flex; }
              .justify-between { justify-content: space-between; }
              .border-t { border-top: 1px dashed #000; }
              .border-b { border-bottom: 1px dashed #000; }
              .py-3 { padding-top: 10px; padding-bottom: 10px; }
              .pt-2 { padding-top: 8px; }
              .pt-5 { padding-top: 20px; }
              .font-black { font-weight: bold; }
              .font-bold { font-weight: bold; }
              .space-y-1 > * { margin-bottom: 4px; }
              .space-y-2 > * { margin-bottom: 8px; }
              .space-y-1.5 > * { margin-bottom: 6px; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          <\/script>
        </body>
      </html>
    `)
      printWindow.document.close()
    }
  }

  const goBack = () => {
    router.push('/customer/workshop')
  }

  // Helper formatting functions
  const formatCurrency = (val: number) => {
    if (!val) return '0đ'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Stepper workflow helper classes
  const isStepActive = (status: string) => {
    if (!order.value) return false
    const statusOrder = ['Pending', 'InProgress', 'QcPending', 'Completed']
    const currentIdx = statusOrder.indexOf(order.value.status)
    const stepIdx = statusOrder.indexOf(status)
    return stepIdx <= currentIdx
  }

  const getStepDotClass = (status: string) => {
    if (!order.value) return 'border-slate-200 bg-white text-slate-300'
    const statusOrder = ['Pending', 'InProgress', 'QcPending', 'Completed']
    const currentIdx = statusOrder.indexOf(order.value.status)
    const stepIdx = statusOrder.indexOf(status)

    if (stepIdx < currentIdx) {
      return 'border-emerald-500 bg-emerald-500 text-white'
    } else if (stepIdx === currentIdx) {
      return 'border-blue-600 bg-white text-blue-600'
    } else {
      return 'border-slate-200 bg-white text-slate-300'
    }
  }

  const getStepInnerDotClass = (status: string) => {
    if (!order.value) return 'bg-slate-200'
    const statusOrder = ['Pending', 'InProgress', 'QcPending', 'Completed']
    const currentIdx = statusOrder.indexOf(order.value.status)
    const stepIdx = statusOrder.indexOf(status)

    if (stepIdx < currentIdx) {
      return 'bg-white'
    } else if (stepIdx === currentIdx) {
      return 'bg-blue-600'
    } else {
      return 'bg-slate-200'
    }
  }

  const getStatusBadgeClass = (status: string) => {
    const base =
      'px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider inline-block text-center w-28 '
    switch (status) {
      case 'Pending':
        return base + 'bg-purple-50 text-purple-600 border border-purple-200'
      case 'InProgress':
        return base + 'bg-blue-50 text-blue-600 border border-blue-200'
      case 'QcPending':
        return base + 'bg-amber-50 text-amber-600 border border-amber-200'
      case 'Completed':
        return base + 'bg-emerald-50 text-emerald-600 border border-emerald-200'
      case 'Cancelled':
        return base + 'bg-red-50 text-red-600 border border-red-200'
      default:
        return base + 'bg-slate-50 text-slate-600 border border-slate-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'Chờ tiếp nhận'
      case 'InProgress':
        return 'Đang sửa chữa'
      case 'QcPending':
        return 'Đang QC'
      case 'Completed':
        return 'Đã hoàn thành'
      case 'Cancelled':
        return 'Đã hủy'
      default:
        return status
    }
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'Cash':
        return 'Tiền mặt'
      case 'Transfer':
        return 'Chuyển khoản'
      case 'Card':
        return 'Thẻ ngân hàng'
      default:
        return method || 'Chưa thanh toán'
    }
  }
</script>

<style lang="scss" scoped>
  .repair-order-detail-page {
    .combat-select {
      :deep(.el-input__wrapper) {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        box-shadow: none;
        height: 40px;
      }
    }

    .combat-input {
      :deep(.el-input__wrapper) {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        box-shadow: none;
        height: 40px;
      }
    }

    .slim-number-input {
      width: 90px;
      :deep(.el-input__wrapper) {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        box-shadow: none;
        padding: 0 8px;
        height: 28px;
      }
    }

    table th {
      font-size: 9px;
      font-weight: 900;
    }
  }

  :deep(.combat-dialog) {
    border-radius: 24px;
    .el-dialog__header {
      padding: 20px 24px;
      margin-right: 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .el-dialog__footer {
      padding: 16px 24px;
      border-top: 1px solid #f1f5f9;
    }
  }

  :deep(.combat-print-dialog) {
    border-radius: 24px;
    .el-dialog__header {
      border-bottom: 1px solid #f1f5f9;
    }
  }
</style>
