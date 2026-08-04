<template>
  <div class="resp-page flex flex-col gap-4 pb-5">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold flex items-center gap-2">
          <ElButton circle :icon="ArrowLeft" @click="goBack" class="mr-2" />
          Chi tiết phiếu sửa chữa RO-{{ String(orderId).padStart(5, "0") }}
          <ElTag
            :type="getStatusType(calculatedStatus)"
            class="ml-2 uppercase font-bold"
            size="large"
          >
            {{ getStatusText(calculatedStatus) }}
          </ElTag>
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          Ngày tạo: {{ formatDate(order?.createdAt || "") }}
        </p>
      </div>

      <div class="flex gap-2">
        <ElButton
          v-if="calculatedStatus !== 'Completed'"
          type="primary"
          plain
          :icon="Edit"
          @click="openEditDialog"
        >
          Chỉnh sửa thông tin
        </ElButton>
        <ElButton
          v-if="calculatedStatus === 'Completed'"
          type="primary"
          :icon="Printer"
          @click="openPrintInvoice"
          v-auth="Permissions.Factory.RepairOrderManagement.View"
        >
          In hóa đơn dịch vụ
        </ElButton>
      </div>
    </div>

    <!-- Main Content -->
    <div v-loading="loading">
      <ElRow :gutter="20" v-if="order">
        <!-- Left Column -->
        <ElCol :span="8">
          <div class="flex flex-col gap-4">
            <!-- Tiến độ -->
            <div class="bg-white rounded-xl border border-gray-100 p-5">
              <h3 class="text-sm font-bold m-0 mb-4 text-slate-800">
                Tiến độ quy trình
              </h3>
              <ElSteps
                :active="currentStepIndex"
                direction="vertical"
                class="mt-2"
              >
                <ElStep
                  v-for="(step, index) in steps"
                  :key="index"
                  :title="step.title"
                  :description="step.description"
                />
              </ElSteps>
            </div>

            <!-- ── Phân công kỹ thuật viên (inline) ── -->
            <div
              class="bg-white rounded-xl border border-gray-100 p-5"
              v-if="calculatedStatus !== 'Completed'"
            >
              <div class="flex items-center justify-between mb-4">
                <span class="font-bold flex items-center gap-2">
                  <ElIcon class="text-amber-500"><User /></ElIcon>
                  Kỹ thuật viên phụ trách
                </span>
                <ElTag
                  v-if="currentTechnicianName"
                  type="success"
                  effect="plain"
                  size="small"
                  round
                >
                  Đã phân công
                </ElTag>
                <ElTag v-else type="warning" effect="plain" size="small" round>
                  Chưa phân công
                </ElTag>
              </div>

              <!-- Người đang phụ trách -->
              <div
                v-if="currentTechnicianName"
                class="flex items-center gap-3 mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl"
              >
                <div
                  class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0"
                >
                  <ElIcon class="text-amber-600 text-lg"><User /></ElIcon>
                </div>
                <div>
                  <div class="font-bold text-slate-800">
                    {{ currentTechnicianName }}
                  </div>
                  <div class="text-xs text-slate-500">
                    Kỹ thuật viên được phân công
                  </div>
                </div>
              </div>
              <div v-else class="text-sm text-slate-400 italic mb-4">
                Chưa có kỹ thuật viên nào được giao phiếu này.
              </div>

              <!-- Quick-assign form -->
              <ElForm label-position="top" :disabled="submitting">
                <ElFormItem label="Chọn / Thay đổi kỹ thuật viên">
                  <ElSelect
                    v-model="assignForm.technicianId"
                    filterable
                    class="w-full"
                    placeholder="Tìm theo tên..."
                    :loading="loadingTechnicians"
                    @visible-change="onTechSelectOpen"
                  >
                    <ElOption
                      v-for="emp in technicians"
                      :key="emp.id"
                      :label="emp.fullName"
                      :value="emp.id"
                    />
                  </ElSelect>
                </ElFormItem>
                <ElButton
                  type="warning"
                  :loading="submitting"
                  :disabled="!assignForm.technicianId"
                  class="w-full"
                  v-auth="
                    Permissions.Factory.RepairOrderManagement.AssignTechnician
                  "
                  @click="submitAssign"
                >
                  <ElIcon class="mr-1"><User /></ElIcon>
                  Lưu phân công
                </ElButton>
              </ElForm>
            </div>

            <!-- KTV khi đã hoàn tất -->
            <div
              class="bg-white rounded-xl border border-gray-100 p-5"
              v-else-if="currentTechnicianName"
            >
              <h3 class="text-sm font-bold m-0 mb-4 text-slate-800">
                Kỹ thuật viên thực hiện
              </h3>
              <div class="flex items-center gap-3">
                <div
                  class="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0"
                >
                  <ElIcon class="text-emerald-600"><User /></ElIcon>
                </div>
                <div>
                  <div class="font-bold text-slate-800">
                    {{ currentTechnicianName }}
                  </div>
                  <div class="text-xs text-slate-400">Đã hoàn thành phiếu</div>
                </div>
              </div>
            </div>

            <!-- Thông tin xe & khách -->
            <div class="bg-white rounded-xl border border-gray-100 p-5">
              <h3 class="text-sm font-bold m-0 mb-4 text-slate-800">
                Thông tin Khách hàng & Xe
              </h3>
              <ElDescriptions :column="1" border size="small">
                <ElDescriptionsItem label="Thông tin xe">
                  <span class="font-bold text-slate-800">{{
                    order.vehicleInfo || "-"
                  }}</span>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="Mã bảo dưỡng">
                  <span class="font-mono">{{
                    order.maintenanceNumber || "-"
                  }}</span>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="Số KM lúc vào">
                  <span class="font-bold">{{
                    order.mileage ? order.mileage.toLocaleString() + " km" : "-"
                  }}</span>
                </ElDescriptionsItem>

                <ElDescriptionsItem label="Dự kiến lần tới">
                  <span
                    class="font-medium text-emerald-600"
                    v-if="order.nextMaintenanceDate"
                  >
                    {{ formatDate(order.nextMaintenanceDate) }} (Hoặc
                    {{ order.nextMaintenanceOdo?.toLocaleString() }} km)
                  </span>
                  <span v-else>-</span>
                </ElDescriptionsItem>
              </ElDescriptions>
            </div>

            <!-- Ghi chú -->
            <div class="bg-white rounded-xl border border-gray-100 p-5">
              <h3 class="text-sm font-bold m-0 mb-4 text-slate-800">
                Triệu chứng & Lỗi ghi nhận
              </h3>
              <div
                class="bg-slate-50 p-3 rounded text-sm italic text-slate-700 border border-slate-100"
              >
                "{{ order.description || "Không có mô tả" }}"
              </div>
            </div>
          </div>
        </ElCol>

        <!-- Right Column -->
        <ElCol :span="16">
          <div class="flex flex-col gap-4">
            <!-- Phase 2: Hạng mục & Vật tư -->
            <div
              class="bg-white rounded-xl border border-gray-100 p-5"
              v-if="
                calculatedStatus === 'InProgress' ||
                calculatedStatus === 'QcPending'
              "
            >
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-sm font-bold m-0 text-slate-800">
                  Hạng mục sửa chữa & Vật tư thay thế
                </h3>
                <div class="flex gap-2" v-if="calculatedStatus !== 'QcPending'">
                  <ElButton
                    size="small"
                    type="primary"
                    plain
                    @click="openServiceDialog"
                    >+ Thêm dịch vụ</ElButton
                  >
                  <ElButton
                    size="small"
                    type="primary"
                    plain
                    @click="openPartsDialog"
                    >+ Thêm phụ tùng</ElButton
                  >
                </div>
              </div>

              <ElTable
                :data="combinedDetails"
                border
                stripe
                size="small"
                class="w-full"
              >
                <ElTableColumn label="Hạng mục" min-width="200">
                  <template #default="{ row }">
                    <div class="font-bold text-slate-800">{{ row.name }}</div>
                    <ElInput
                      v-if="calculatedStatus !== 'QcPending'"
                      v-model="row.notes"
                      size="small"
                      placeholder="Ghi chú..."
                      class="mt-1"
                    />
                    <div v-else class="text-xs text-slate-400 mt-1">
                      {{ row.notes }}
                    </div>
                  </template>
                </ElTableColumn>
                <ElTableColumn label="Loại" width="100" align="center">
                  <template #default="{ row }">
                    <ElTag
                      size="small"
                      :type="row.type === 'Service' ? 'warning' : 'primary'"
                      >{{
                        row.type === "Service" ? "Công việc" : "Phụ tùng"
                      }}</ElTag
                    >
                  </template>
                </ElTableColumn>
                <ElTableColumn label="Số lượng" width="120" align="center">
                  <template #default="{ row }">
                    <ElInputNumber
                      v-if="
                        row.type === 'Part' && calculatedStatus !== 'QcPending'
                      "
                      v-model="row.count"
                      :min="1"
                      size="small"
                      class="w-full"
                      :controls="false"
                    />
                    <span v-else>{{ row.count }}</span>
                  </template>
                </ElTableColumn>
                <ElTableColumn label="Đơn giá" width="140" align="right">
                  <template #default="{ row }">
                    <ElInputNumber
                      v-if="calculatedStatus !== 'QcPending'"
                      v-model="row.price"
                      :min="0"
                      size="small"
                      class="w-full"
                      :controls="false"
                    />
                    <span v-else class="font-medium">{{
                      formatCurrency(row.price)
                    }}</span>
                  </template>
                </ElTableColumn>
                <ElTableColumn label="Thành tiền" width="140" align="right">
                  <template #default="{ row }">
                    <span class="font-bold text-slate-700">{{
                      formatCurrency(row.price * row.count)
                    }}</span>
                  </template>
                </ElTableColumn>
                <ElTableColumn
                  label="Thao tác"
                  width="60"
                  align="center"
                  v-if="calculatedStatus !== 'QcPending'"
                >
                  <template #default="{ $index, row }">
                    <ElButton
                      type="danger"
                      link
                      :icon="Delete"
                      @click="removeItem(row.type, $index)"
                    />
                  </template>
                </ElTableColumn>
              </ElTable>

              <div class="flex justify-end pt-4">
                <div class="w-72 space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-500">Tiền công sửa chữa:</span>
                    <span class="font-bold">{{
                      formatCurrency(totalLaborCost)
                    }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-slate-500">Tiền phụ tùng:</span>
                    <span class="font-bold">{{
                      formatCurrency(totalPartsCost)
                    }}</span>
                  </div>
                  <div
                    class="flex justify-between text-base border-t pt-2 mt-2"
                  >
                    <span class="font-bold uppercase text-slate-800"
                      >Tổng cộng:</span
                    >
                    <span class="font-bold text-red-600 text-lg">{{
                      formatCurrency(discountedTotal)
                    }}</span>
                  </div>
                </div>
              </div>

              <!-- Action buttons -->
              <div
                class="flex justify-end gap-3 mt-5 pt-4 border-t"
                v-if="calculatedStatus === 'InProgress'"
              >
                <ElButton
                  :disabled="submitting"
                  @click="saveIssueParts('InProgress')"
                  >Lưu thay đổi</ElButton
                >
                <ElButton
                  type="warning"
                  :disabled="submitting"
                  @click="saveIssueParts('QcPending')"
                >
                  Hoàn tất sửa & Chuyển QC
                </ElButton>
              </div>
            </div>

            <!-- Phase 3: QC & Checkout -->
            <div
              v-if="calculatedStatus === 'QcPending'"
              class="bg-white rounded-xl border border-gray-100 p-5"
            >
              <h3 class="text-sm font-bold m-0 mb-4 text-slate-800">
                Nghiệm thu QC & Thanh toán hóa đơn
              </h3>
              <p class="text-sm text-slate-500 mb-4">
                Xe đã hoàn thành sửa chữa kỹ thuật và đã vượt qua bài kiểm tra
                chất lượng (QC). Tiến hành lập hóa đơn để bàn giao.
              </p>

              <ElRow :gutter="20">
                <ElCol :span="24" class="mb-4">
                  <ElDivider content-position="left"
                    >🎫 Mã giảm giá (Voucher)</ElDivider
                  >
                  <div class="flex items-start gap-3">
                    <ElInput
                      v-model="voucherCode"
                      placeholder="Nhập mã voucher..."
                      class="flex-1"
                      @keyup.enter="applyVoucher"
                      :disabled="voucherApplying"
                    >
                      <template #append>
                        <ElButton
                          :loading="voucherApplying"
                          type="primary"
                          @click="applyVoucher"
                        >
                          Áp dụng
                        </ElButton>
                      </template>
                    </ElInput>
                  </div>
                  <div
                    v-if="appliedVoucher"
                    class="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg mt-2"
                  >
                    <span class="text-emerald-600">🎫</span>
                    <span class="text-sm font-bold text-emerald-700">{{
                      appliedVoucher.code
                    }}</span>
                    <span class="text-xs text-emerald-600"
                      >-{{
                        formatCurrency(appliedVoucher.discountAmount)
                      }}</span
                    >
                    <ElButton
                      link
                      type="danger"
                      size="small"
                      @click="removeVoucher"
                    >
                      Hủy
                    </ElButton>
                  </div>
                  <p v-if="voucherError" class="text-xs text-red-500 mt-1">
                    {{ voucherError }}
                  </p>
                </ElCol>

                <ElCol :span="8">
                  <ElFormItem
                    label="Phương thức thanh toán"
                    label-position="top"
                  >
                    <ElSelect v-model="paymentMethod" class="w-full">
                      <ElOption label="Tiền mặt" value="Cash" />
                      <ElOption label="Chuyển khoản" value="BankTransfer" />
                    </ElSelect>
                  </ElFormItem>
                </ElCol>
                <ElCol :span="8">
                  <ElFormItem
                    label="Trạng thái thanh toán"
                    label-position="top"
                  >
                    <ElSelect v-model="paymentStatus" class="w-full">
                      <ElOption label="Đã thanh toán" value="Paid" />
                      <ElOption label="Chưa thanh toán" value="Unpaid" />
                    </ElSelect>
                  </ElFormItem>
                </ElCol>
                <ElCol :span="8">
                  <ElFormItem label="Ghi chú bàn giao" label-position="top">
                    <ElInput
                      v-model="checkoutNotes"
                      placeholder="Nhập ghi chú"
                    />
                  </ElFormItem>
                </ElCol>
              </ElRow>

              <div class="flex justify-end mt-4 pt-4 border-t">
                <ElButton
                  type="success"
                  :disabled="submitting"
                  @click="completeRepairOrder"
                >
                  Thanh toán & Hoàn tất
                </ElButton>
              </div>
            </div>

            <div
              v-if="calculatedStatus === 'Completed'"
              class="bg-emerald-50 rounded-xl border border-emerald-200 p-6"
            >
              <div
                class="flex flex-col items-center justify-center text-center mb-6"
              >
                <h3 class="font-bold text-emerald-700 m-0">
                  Phiếu sửa chữa đã hoàn tất & Bàn giao thành công
                </h3>
              </div>
              <ElRow :gutter="20">
                <ElCol :span="6">
                  <div class="text-xs text-slate-500 uppercase">
                    Tổng tiền hóa đơn
                  </div>
                  <div class="font-bold text-lg mt-1 text-slate-800">
                    {{
                      formatCurrency(
                        Math.max(
                          0,
                          (order.totalCost || 0) -
                            (appliedVoucher?.discountAmount || 0),
                        ),
                      )
                    }}
                  </div>
                </ElCol>
                <ElCol :span="6">
                  <div class="text-xs text-slate-500 uppercase">
                    Thời điểm hoàn tất
                  </div>
                  <div class="font-bold mt-1 text-slate-800">
                    {{ formatDate(order.updatedAt || order.createdAt) }}
                  </div>
                </ElCol>
              </ElRow>

              <div class="mt-6 border-t pt-4 border-emerald-100">
                <p class="font-bold text-emerald-800 mb-2">
                  Chi tiết dịch vụ & phụ tùng:
                </p>
                <ElTable
                  :data="combinedDetails"
                  border
                  size="small"
                  class="w-full"
                >
                  <ElTableColumn label="Hạng mục" min-width="200">
                    <template #default="{ row }">
                      <div class="font-medium">{{ row.name }}</div>
                      <div class="text-xs text-slate-400 mt-0.5">
                        {{ row.notes }}
                      </div>
                    </template>
                  </ElTableColumn>
                  <ElTableColumn label="Loại" width="100" align="center">
                    <template #default="{ row }">
                      <ElTag
                        size="small"
                        :type="row.type === 'Service' ? 'warning' : 'primary'"
                        >{{
                          row.type === "Service" ? "Công việc" : "Phụ tùng"
                        }}</ElTag
                      >
                    </template>
                  </ElTableColumn>
                  <ElTableColumn
                    label="SL"
                    prop="count"
                    width="60"
                    align="center"
                  />
                  <ElTableColumn label="Đơn giá" width="120" align="right">
                    <template #default="{ row }">{{
                      formatCurrency(row.price)
                    }}</template>
                  </ElTableColumn>
                  <ElTableColumn label="Thành tiền" width="120" align="right">
                    <template #default="{ row }">
                      <span class="font-bold">{{
                        formatCurrency(row.price * row.count)
                      }}</span>
                    </template>
                  </ElTableColumn>
                </ElTable>
              </div>
            </div>
          </div>
        </ElCol>
      </ElRow>
    </div>

    <!-- Edit Dialog -->
    <ElDialog
      v-model="editDialogVisible"
      title="Chỉnh sửa phiếu sửa chữa"
      width="500px"
    >
      <ElForm
        :model="editForm"
        label-width="120px"
        class="space-y-4"
        :disabled="submitting"
      >
        <ElFormItem label="Số KM hiện tại">
          <ElInputNumber v-model="editForm.mileage" :min="0" class="w-full" />
        </ElFormItem>
        <ElFormItem label="Lỗi ghi nhận">
          <ElInput v-model="editForm.description" type="textarea" :rows="3" />
        </ElFormItem>
        <ElFormItem label="Ngày BD tới">
          <ElDatePicker
            v-model="editForm.nextMaintenanceDate"
            type="date"
            class="w-full"
            value-format="YYYY-MM-DD"
          />
        </ElFormItem>
        <ElFormItem label="Số KM BD tới">
          <ElInputNumber
            v-model="editForm.nextMaintenanceOdo"
            :min="0"
            class="w-full"
          />
        </ElFormItem>
        <ElFormItem label="Nhân viên phụ trách">
          <ElSelect
            v-model="editForm.technicianId"
            filterable
            class="w-full"
            placeholder="Chọn nhân viên..."
            :loading="loadingTechnicians"
            @visible-change="onTechSelectOpen"
          >
            <ElOption
              v-for="emp in technicians"
              :key="emp.id"
              :label="emp.fullName"
              :value="emp.id"
            />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="editDialogVisible = false" :disabled="submitting"
            >Hủy</ElButton
          >
          <ElButton type="primary" :loading="submitting" @click="submitEdit"
            >Lưu phiếu</ElButton
          >
        </div>
      </template>
    </ElDialog>

    <!-- Assign Dialog -->
    <ElDialog
      v-model="assignDialogVisible"
      title="Phân công Kỹ thuật viên"
      width="400px"
    >
      <ElForm :model="assignForm" label-position="top" :disabled="submitting">
        <ElFormItem label="Chọn kỹ thuật viên">
          <ElSelect v-model="assignForm.technicianId" filterable class="w-full">
            <ElOption
              v-for="emp in technicians"
              :key="emp.id"
              :label="emp.fullName"
              :value="emp.id"
            />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="assignDialogVisible = false" :disabled="submitting"
            >Hủy</ElButton
          >
          <ElButton type="primary" :loading="submitting" @click="submitAssign"
            >Phân công</ElButton
          >
        </div>
      </template>
    </ElDialog>

    <!-- Parts Dialog -->
    <ElDialog v-model="partsDialogVisible" title="Thêm phụ tùng" width="500px">
      <ElForm label-position="top">
        <ElFormItem label="Chọn phụ tùng">
          <ElSelect v-model="selectedPartId" filterable class="w-full">
            <ElOption
              v-for="part in availableParts"
              :key="part.id"
              :label="part.displayName || part.name"
              :value="part.id"
            />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="partsDialogVisible = false">Hủy</ElButton>
          <ElButton type="primary" @click="confirmAddPart">Thêm</ElButton>
        </div>
      </template>
    </ElDialog>

    <!-- Services Dialog -->
    <ElDialog
      v-model="servicesDialogVisible"
      title="Thêm dịch vụ"
      width="500px"
    >
      <ElForm label-position="top">
        <ElFormItem label="Chọn dịch vụ">
          <ElSelect v-model="selectedServiceId" filterable class="w-full">
            <ElOption
              v-for="srv in availableServices"
              :key="srv.id"
              :label="srv.name"
              :value="srv.id"
            />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="servicesDialogVisible = false">Hủy</ElButton>
          <ElButton type="primary" @click="confirmAddService">Thêm</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { Permissions } from "@/domain/constants/permissions";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  ArrowLeft,
  Printer,
  Delete,
  Edit,
  User,
} from "@element-plus/icons-vue";

import {
  RepairOrderApi,
  type RepairOrder,
  type RepairOrderDetail,
} from "@/api/sales";
import { ProductApi } from "@/api/product";
import {
  ServiceCategoryApi,
  type ServiceCategoryResponse,
} from "@/api/product";
import { useVoucher } from "@/common/composables/useVoucher";
import { EmployeeApi, type EmployeeResponse } from "@/api/operations";

defineOptions({ name: "ServiceWorkshopRepairOrderDetail" });

const route = useRoute();
const router = useRouter();

const orderId = Number(
  Array.isArray(route.params.id) ? route.params.id[0] : route.params.id,
);

const loading = ref(false);
const submitting = ref(false);
const order = ref<RepairOrder | null>(null);

interface LocalItem {
  type: "Service" | "Part";
  id: number;
  name: string;
  count: number;
  price: number;
  notes: string;
}

const localItems = ref<LocalItem[]>([]);
const paymentMethod = ref("Cash");
const paymentStatus = ref("Paid");
const checkoutNotes = ref("");

const steps = [
  { title: "Sửa chữa", description: "Đang khảo sát, lắp phụ tùng" },
  { title: "Kiểm định QC", description: "Kiểm tra chất lượng xe" },
  { title: "Hoàn tất & Bàn giao", description: "Thanh toán hóa đơn" },
];

const calculatedStatus = computed(() => {
  if (!order.value) return "InProgress";
  const stored = sessionStorage.getItem(`ro_status_${orderId}`);
  if (stored) return stored;
  if (order.value.status) return order.value.status;
  if (!order.value.technicianId && !order.value.technicianName)
    return "Pending";
  if (order.value.totalCost > 0) return "Completed";
  return "InProgress";
});

const currentStepIndex = computed(() => {
  const statusMap: Record<string, number> = {
    QcPending: 1,
    Completed: 3,
  };
  return statusMap[calculatedStatus.value] || 0;
});

const combinedDetails = computed(() => localItems.value);

const totalLaborCost = computed(() =>
  localItems.value
    .filter((x) => x.type === "Service")
    .reduce((acc, item) => acc + item.price * item.count, 0),
);

const totalPartsCost = computed(() =>
  localItems.value
    .filter((x) => x.type === "Part")
    .reduce((acc, item) => acc + item.price * item.count, 0),
);

const voucherOrderTotal = computed(
  () => totalLaborCost.value + totalPartsCost.value,
);
const voucherOrderId = computed(() => orderId);

const discountedTotal = computed(() =>
  Math.max(0, voucherOrderTotal.value - voucherDiscount.value),
);

const {
  voucherCode,
  appliedVoucher,
  applying: voucherApplying,
  errorMsg: voucherError,
  discountAmount: voucherDiscount,
  handleApply: applyVoucher,
  handleRemove: removeVoucher,
  reset: resetVoucher,
} = useVoucher(
  () => voucherOrderTotal.value,
  () => voucherOrderId.value,
  true,
);

const loadOrderDetail = async () => {
  if (!orderId) {
    ElMessage.error("Mã phiếu sửa chữa không hợp lệ");
    return;
  }
  loading.value = true;
  try {
    const res = await RepairOrderApi.getDetail(orderId);
    order.value = res;
    // Attempt to parse partsJson
    const itemsList: LocalItem[] = [];
    if (res.partsJson) {
      try {
        const parsed = JSON.parse(res.partsJson);
        if (Array.isArray(parsed)) {
          parsed.forEach((p: any) => {
            itemsList.push({
              type: p.productVariantId ? "Part" : "Service",
              id: p.productVariantId || p.serviceId || 0,
              name: p.productVariantName || p.serviceName || "Hạng mục",
              count: p.count || 1,
              price: p.price || p.laborCost || 0,
              notes: p.notes || "",
            });
          });
        } else if (parsed && typeof parsed === "object") {
          if (Array.isArray(parsed.Parts)) {
            parsed.Parts.forEach((p: any) => {
              itemsList.push({
                type: "Part",
                id: p.ProductVariantId || p.productVariantId || 0,
                name:
                  p.ProductVariantName || p.productVariantName || "Phụ tùng",
                count: p.Count || p.count || 1,
                price: p.Price || p.price || 0,
                notes: p.Notes || p.notes || "",
              });
            });
          }
          if (Array.isArray(parsed.Services)) {
            parsed.Services.forEach((s: any) => {
              itemsList.push({
                type: "Service",
                id: s.ServiceId || s.serviceId || 0,
                name: s.ServiceName || s.serviceName || "Dịch vụ",
                count: s.Count || s.count || 1,
                price: s.Price || s.price || s.LaborCost || s.laborCost || 0,
                notes: s.Notes || s.notes || "",
              });
            });
          }
        }
      } catch (e) {
        console.warn("Failed to parse partsJson", e);
      }
    }
    localItems.value = itemsList;
    // Pre-populate assign form with current technician
    assignForm.value.technicianId = (res as any).technicianId || undefined;
  } catch (err: any) {
    ElMessage.error(err?.message || "Không thể tải thông tin phiếu");
  } finally {
    loading.value = false;
  }
};

// --- EDIT DIALOG ---
const editDialogVisible = ref(false);
const editForm = ref({
  mileage: 0,
  description: "",
  nextMaintenanceDate: "",
  nextMaintenanceOdo: 0,
  technicianId: undefined as number | undefined,
});

const openEditDialog = () => {
  if (!order.value) return;
  editForm.value = {
    mileage: order.value.mileage || 0,
    description: order.value.description || "",
    nextMaintenanceDate: order.value.nextMaintenanceDate || "",
    nextMaintenanceOdo: order.value.nextMaintenanceOdo || 0,
    technicianId: (order.value as any).technicianId || undefined,
  };
  editDialogVisible.value = true;
};

const submitEdit = async () => {
  if (!order.value) return;
  submitting.value = true;
  try {
    await RepairOrderApi.update(orderId, {
      id: orderId,
      vehicleId: order.value.vehicleId || 0,
      maintenanceDate:
        order.value.maintenanceDate ||
        order.value.createdAt ||
        new Date().toISOString(),
      description: editForm.value.description,
      mileage: editForm.value.mileage,
      technicianId: editForm.value.technicianId,
      partsCost: 0,
      laborCost: 0,
      nextMaintenanceDate: editForm.value.nextMaintenanceDate || undefined,
      nextMaintenanceOdo: editForm.value.nextMaintenanceOdo || undefined,
    });
    ElMessage.success("Cập nhật thông tin thành công");
    editDialogVisible.value = false;
    await loadOrderDetail();
  } catch (err: any) {
    ElMessage.error(err?.message || "Cập nhật thất bại");
  } finally {
    submitting.value = false;
  }
};

const assignDialogVisible = ref(false);
const assignForm = ref({ technicianId: undefined as number | undefined });
const technicians = ref<EmployeeResponse[]>([]);
const loadingTechnicians = ref(false);

const currentTechnicianName = computed(() => {
  // Nếu có technicianName từ API (order) và user chưa đổi KTV khác
  if (order.value && (order.value as any).technicianName) {
    if (assignForm.value.technicianId !== (order.value as any).technicianId) {
      const foundLocally = technicians.value.find(
        (t) => t.id === assignForm.value.technicianId,
      );
      if (foundLocally) return foundLocally.fullName;
    }
    return (order.value as any).technicianName;
  }

  // Fallback tìm trong local (dùng khi form đang mở và user chọn)
  if (!assignForm.value.technicianId) return "";
  const found = technicians.value.find(
    (t) => t.id === assignForm.value.technicianId,
  );
  return found?.fullName || "";
});

const onTechSelectOpen = async (visible: boolean) => {
  if (visible && technicians.value.length === 0) {
    loadingTechnicians.value = true;
    try {
      const list = await EmployeeApi.getList();
      technicians.value = list.length ? list : [];
    } catch {
      ElMessage.error("Không thể tải danh sách kỹ thuật viên");
    } finally {
      loadingTechnicians.value = false;
    }
  }
};

const fetchTechnicians = async () => {
  try {
    const list = await EmployeeApi.getList();
    technicians.value = list.length ? list : [];
  } catch (err) {
    ElMessage.error("Không thể tải danh sách kỹ thuật viên");
  }
};

const openAssignDialog = async () => {
  if (!order.value) return;
  assignForm.value.technicianId = (order.value as any).technicianId;
  assignDialogVisible.value = true;
  await fetchTechnicians();
};

const submitAssign = async () => {
  if (!order.value) return;
  submitting.value = true;
  try {
    await RepairOrderApi.update(orderId, {
      id: orderId,
      vehicleId: order.value.vehicleId || 0,
      maintenanceDate:
        order.value.maintenanceDate ||
        order.value.createdAt ||
        new Date().toISOString(),
      description: order.value.description || "",
      mileage: order.value.mileage || 0,
      technicianId: assignForm.value.technicianId,
      partsCost: 0,
      laborCost: 0,
      nextMaintenanceDate: order.value.nextMaintenanceDate || undefined,
      nextMaintenanceOdo: order.value.nextMaintenanceOdo || undefined,
    });
    ElMessage.success("Phân công kỹ thuật viên thành công");
    sessionStorage.setItem(`ro_status_${orderId}`, "InProgress");
    assignDialogVisible.value = false;
    await loadOrderDetail();
  } catch (err: any) {
    ElMessage.error(err?.message || "Phân công thất bại");
  } finally {
    submitting.value = false;
  }
};

// --- PARTS & SERVICES DIALOGS ---
const partsDialogVisible = ref(false);
const selectedPartId = ref<number | undefined>(undefined);
const availableParts = ref<any[]>([]);

const servicesDialogVisible = ref(false);
const selectedServiceId = ref<number | undefined>(undefined);
const availableServices = ref<ServiceCategoryResponse[]>([]);

const openServiceDialog = async () => {
  try {
    const res = await ServiceCategoryApi.getList({ current: 1, size: 100 });
    availableServices.value = res.items || [];
  } catch (err) {
    ElMessage.error("Không thể tải danh sách dịch vụ");
  }
  selectedServiceId.value = undefined;
  servicesDialogVisible.value = true;
};

const confirmAddService = () => {
  if (!selectedServiceId.value) return;
  const srv = availableServices.value.find(
    (s) => s.id === selectedServiceId.value,
  );
  if (srv) {
    localItems.value.push({
      type: "Service",
      id: srv.id,
      name: srv.name,
      count: 1,
      price: 0, // Nhập giá thủ công hoặc lấy mặc định nếu có
      notes: "",
    });
  }
  servicesDialogVisible.value = false;
};

const openPartsDialog = async () => {
  try {
    const res = await ProductApi.getVariantsForInput({ current: 1, size: 100 });
    availableParts.value = res.items || [];
  } catch (err) {
    ElMessage.error("Không thể tải danh sách phụ tùng");
  }
  selectedPartId.value = undefined;
  partsDialogVisible.value = true;
};

const confirmAddPart = () => {
  if (!selectedPartId.value) return;
  const part = availableParts.value.find((p) => p.id === selectedPartId.value);
  if (part) {
    localItems.value.push({
      type: "Part",
      id: part.id,
      name: part.displayName || part.name,
      count: 1,
      price: part.price || 0,
      notes: "",
    });
  }
  partsDialogVisible.value = false;
};

const removeItem = (type: string, index: number) => {
  localItems.value.splice(index, 1);
};

const saveIssueParts = async (targetStatus: "InProgress" | "QcPending") => {
  submitting.value = true;
  try {
    await RepairOrderApi.issueParts({
      repairOrderId: orderId,
      parts: localItems.value
        .filter((x) => x.type === "Part")
        .map((part) => ({
          productVariantId: part.id,
          count: part.count,
          price: part.price,
          notes: part.notes || undefined,
        })),
      services: localItems.value
        .filter((x) => x.type === "Service")
        .map((service) => ({
          serviceId: service.id,
          laborCost: service.price,
          notes: service.notes || undefined,
        })),
      status: targetStatus,
    });
    ElMessage.success("Đã cập nhật hạng mục");
    sessionStorage.setItem(`ro_status_${orderId}`, targetStatus);
    await loadOrderDetail();
  } catch (err: any) {
    ElMessage.error(err?.message || "Cập nhật thất bại");
  } finally {
    submitting.value = false;
  }
};

const completeRepairOrder = async () => {
  submitting.value = true;
  try {
    await RepairOrderApi.complete({
      repairOrderId: orderId,
      paymentMethod: paymentMethod.value,
      paymentStatus: paymentStatus.value,
      notes: checkoutNotes.value || undefined,
      voucherId: appliedVoucher.value?.voucherId,
      discountAmount: appliedVoucher.value?.discountAmount || 0,
    } as any);
    ElMessage.success("Đã hoàn tất phiếu sửa chữa");
    sessionStorage.setItem(`ro_status_${orderId}`, "Completed");
    await loadOrderDetail();
  } catch (err: any) {
    ElMessage.error(err?.message || "Hoàn tất thất bại");
  } finally {
    submitting.value = false;
  }
};

const openPrintInvoice = () => {
  window.print();
};

const goBack = () => {
  router.push("/factory/workshop/repair");
};

const formatCurrency = (value: number) => {
  if (!value) return "0 ₫";
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
};

const formatDate = (dateStr: string | Date) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusType = (
  status: string,
): "primary" | "success" | "warning" | "info" | "danger" | undefined => {
  const map: Record<
    string,
    "primary" | "success" | "warning" | "info" | "danger"
  > = {
    Pending: "warning",
    InProgress: "primary",
    QcPending: "primary",
    Completed: "success",
  };
  return map[status] || "info";
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    Pending: "Chờ tiếp nhận",
    InProgress: "Đang sửa chữa",
    QcPending: "Đang QC",
    Completed: "Hoàn tất",
  };
  return map[status] || status;
};

onMounted(() => {
  loadOrderDetail();
});
</script>

<style scoped>
.font-mono {
  font-family: monospace;
}
</style>
