<template>
  <div
    class="repair-order-form-page flex flex-col min-h-screen bg-[#F8FAFC] font-inter text-[#0F172A]"
  >
    <!-- Header Bar -->
    <div
      class="bg-white border-b border-slate-200 px-8 py-5 shrink-0 shadow-sm relative z-20"
    >
      <div
        class="flex justify-between items-center max-w-[1400px] mx-auto flex-wrap gap-3"
      >
        <div class="flex items-center gap-4">
          <button
            @click="goBack"
            class="size-9 rounded-xl border border-slate-200 text-slate-600 flex-cc hover:bg-slate-50 transition-all active:scale-95"
          >
            <ArtSvgIcon icon="ri:arrow-left-line" />
          </button>

          <div>
            <div class="flex items-center gap-3 flex-wrap">
              <h1
                class="m-0 text-lg font-black tracking-tight text-slate-900 leading-none"
              >
                Phiếu sửa chữa RO-{{ String(orderId).padStart(5, "0") }}
              </h1>

              <span :class="getStatusBadgeClass(order?.status || '')">
                {{ getStatusText(order?.status || "") }}
              </span>
            </div>

            <p
              class="m-0 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-1.5"
            >
              <ArtSvgIcon icon="ri:calendar-line" />
              Ngày tạo: {{ formatDate(order?.createdAt || "") }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <ElButton
            v-if="order?.status === 'Completed'"
            type="primary"
            @click="openPrintReceipt"
            class="font-black text-[10px] uppercase tracking-widest"
          >
            <ArtSvgIcon icon="ri:printer-line" /> In phiếu tiếp nhận
          </ElButton>

          <ElButton
            v-if="order?.status === 'Pending'"
            type="success"
            @click="handleStartRepair"
            class="font-black text-[10px] uppercase tracking-widest"
            :loading="submitting"
          >
            <ArtSvgIcon icon="ri:play-fill" /> Bắt đầu sửa chữa
          </ElButton>
        </div>
      </div>
    </div>

    <!-- Main -->
    <div class="flex-1 max-w-[1400px] mx-auto w-full p-6" v-loading="loading">
      <div v-if="order" class="space-y-6">
        <!-- Pipeline State Machine -->
        <div
          class="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm"
        >
          <h3
            class="text-[10px] font-black uppercase text-slate-400 tracking-wider m-0"
          >
            Pipeline (Tiến độ phiếu)
          </h3>

          <div class="mt-4 relative pl-6 border-l-2 border-slate-100 space-y-3">
            <div v-for="step in steps" :key="step.status" class="relative">
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
                  :class="
                    isStepActive(step.status)
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  "
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

        <!-- Phase blocks -->
        <!-- Phase 1: Vehicle check-in -->
        <div v-if="order.status === 'Pending'" class="space-y-4">
          <div
            class="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm space-y-4"
          >
            <h3
              class="text-sm font-black uppercase text-slate-800 tracking-wider m-0 flex items-center gap-2"
            >
              <span
                class="size-5 rounded bg-blue-50 text-blue-600 flex-cc text-xs"
                >1</span
              >
              Thông tin tiếp nhận xe
            </h3>

            <!-- Search Customer + Vehicle info + Gallery -->
            <div class="resp-stats-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="md:col-span-1">
                <label
                  class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2"
                >
                  Số điện thoại (tìm nhanh)
                </label>
                <ElInput
                  v-model="form.customerPhone"
                  placeholder="Nhập SĐT của khách"
                  class="combat-input"
                  @input="handlePhoneInput"
                />
              </div>

              <div class="md:col-span-1">
                <label
                  class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2"
                >
                  Biển số xe
                </label>
                <div
                  v-if="selectedVehicleId"
                  class="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-slate-700"
                >
                  <div class="font-bold text-primary">
                    {{ form.licensePlate }}
                  </div>
                  <div class="mt-0.5">
                    {{ form.vehicleBrand }} / {{ form.vehicleColor }}
                  </div>
                  <div class="mt-0.5 text-slate-500">
                    Năm: {{ form.vehicleYear || "-" }}
                  </div>
                </div>
                <ElInput
                  v-else
                  v-model="form.licensePlate"
                  placeholder="Nhập biển số xe"
                  class="combat-input"
                  @input="handlePlateInput"
                />
              </div>

              <div class="md:col-span-1">
                <label
                  class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2"
                >
                  Ảnh hiện trạng xe
                </label>
                <div v-if="vehicleGallery.length" class="flex gap-2 flex-wrap">
                  <img
                    v-for="(img, idx) in vehicleGallery"
                    :key="idx"
                    :src="img"
                    class="w-16 h-16 object-cover rounded-lg border border-slate-200 cursor-pointer"
                    @click="openImagePreview(img)"
                  />
                </div>
                <div
                  v-else
                  class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-400"
                >
                  Chưa có ảnh
                </div>
              </div>
            </div>

            <div class="resp-stats-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2"
                >
                  Mileage (km)
                </label>
                <ElInputNumber
                  v-model="form.mileage"
                  :min="0"
                  :controls="false"
                  class="w-full"
                />
              </div>

              <div>
                <label
                  class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2"
                >
                  Mô tả tình trạng lỗi
                </label>
                <ElInput
                  v-model="form.description"
                  placeholder="Ví dụ: thay nhớt, mòn phanh..."
                  class="combat-input"
                />
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <ElButton
                type="primary"
                @click="handleSubmitPending"
                :loading="submitting"
              >
                Lưu tiếp nhận & cập nhật phiếu
              </ElButton>
            </div>
          </div>
        </div>

        <!-- Phase 2: Diagnosis panel -->
        <div
          v-if="order.status === 'InProgress' || order.status === 'QcPending'"
          class="space-y-4"
        >
          <div
            class="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm space-y-4"
          >
            <h3
              class="text-sm font-black uppercase text-slate-800 tracking-wider m-0 flex items-center gap-2"
            >
              <span
                class="size-5 rounded bg-blue-50 text-blue-600 flex-cc text-xs"
                >2</span
              >
              Điều phối kỹ thuật & khảo sát
            </h3>

            <div class="resp-stats-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2"
                >
                  Chọn kỹ thuật viên phụ trách
                </label>
                <ElSelect
                  v-model="selectedTechId"
                  placeholder="Chọn kỹ thuật viên"
                  class="w-full combat-select"
                >
                  <ElOption
                    v-for="t in technicians"
                    :key="t.id"
                    :label="t.fullName + ' (' + t.jobTitle + ')'"
                    :value="t.id"
                  />
                </ElSelect>
              </div>

              <div class="flex items-end justify-end">
                <ElButton
                  :disabled="!selectedTechId || submitting"
                  type="primary"
                  @click="assignTechnician"
                >
                  <ArtSvgIcon icon="ri:user-shared-line" /> Xác nhận phân công
                </ElButton>
              </div>
            </div>

            <div class="rounded-2xl border border-slate-100 overflow-hidden">
              <div
                class="bg-slate-50 border-b border-slate-100 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-500"
              >
                Danh sách hạng mục công việc
              </div>

              <div class="p-4 space-y-4">
                <div
                  class="text-xs text-slate-500"
                  v-if="!order.details?.length"
                >
                  Chưa có hạng mục công việc nào.
                </div>
                <div v-else class="space-y-2">
                  <div
                    v-for="d in order.details"
                    :key="d.id"
                    class="flex items-center justify-between p-2 rounded-lg bg-slate-50"
                  >
                    <div>
                      <span class="font-bold text-slate-700">
                        {{
                          d.type === "Service" ? d.serviceName : d.variantName
                        }}
                      </span>
                      <span
                        :class="
                          d.type === 'Service'
                            ? 'ml-2 px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-[9px] font-black uppercase'
                            : 'ml-2 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase'
                        "
                      >
                        {{ d.type === "Service" ? "Công việc" : "Phụ tùng" }}
                      </span>
                    </div>
                    <div class="text-right">
                      <span class="font-bold text-slate-800">
                        {{
                          formatCurrency(
                            d.type === "Service"
                              ? d.laborCost
                              : d.price * d.count,
                          )
                        }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Phase 3: Execution (parts consumption status) -->
        <div
          v-if="order.status === 'InProgress' || order.status === 'QcPending'"
          class="space-y-4"
        >
          <div
            class="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm space-y-5"
          >
            <h3
              class="text-sm font-black uppercase text-slate-800 tracking-wider m-0 flex items-center gap-2"
            >
              <span
                class="size-5 rounded bg-blue-50 text-blue-600 flex-cc text-xs"
                >3</span
              >
              Theo dõi tiến độ & xuất kho
            </h3>

            <div class="flex justify-end gap-2 border-b border-slate-100 pb-3">
              <ElButton type="primary" @click="handleComplete">
                <ArtSvgIcon icon="ri:check-double-line" /> Hoàn tất sửa chữa
              </ElButton>
            </div>

            <div class="space-y-3">
              <div class="text-xs text-slate-500">
                Trạng thái từng hạng mục:
              </div>

              <div class="border border-slate-100 rounded-2xl overflow-hidden">
                <table class="w-full text-xs border-collapse">
                  <thead>
                    <tr
                      class="bg-slate-50 border-b border-slate-100 text-slate-400 font-black uppercase text-[9px] tracking-wider"
                    >
                      <th class="py-3 px-4 text-left">Hạng mục</th>
                      <th class="py-3 px-4 text-center" width="90">Loại</th>
                      <th class="py-3 px-4 text-right" width="110">SL</th>
                      <th class="py-3 px-4 text-right" width="160">
                        Thành tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr
                      v-for="d in order.details"
                      :key="d.id"
                      class="hover:bg-slate-50/50"
                    >
                      <td class="py-3 px-4">
                        <div class="font-bold text-slate-800">
                          {{
                            d.type === "Service" ? d.serviceName : d.variantName
                          }}
                        </div>
                        <div
                          v-if="d.notes"
                          class="text-[10px] text-slate-400 mt-0.5"
                        >
                          {{ d.notes }}
                        </div>
                      </td>
                      <td class="py-3 px-4 text-center">
                        <span
                          :class="
                            d.type === 'Service'
                              ? 'px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-[9px] font-black uppercase'
                              : 'px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase'
                          "
                        >
                          {{ d.type === "Service" ? "Công việc" : "Phụ tùng" }}
                        </span>
                      </td>
                      <td class="py-3 px-4 text-right text-slate-600">
                        {{ d.type === "Service" ? 1 : d.count }}
                      </td>
                      <td class="py-3 px-4 text-right font-bold text-slate-800">
                        {{
                          formatCurrency(
                            d.type === "Service"
                              ? d.laborCost
                              : d.price * d.count,
                          )
                        }}
                      </td>
                    </tr>
                    <tr v-if="!order?.details?.length">
                      <td
                        colspan="4"
                        class="py-8 text-center text-slate-400 italic"
                      >
                        Chưa có hạng mục nào
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="flex justify-end">
                <div class="w-80 space-y-2 text-xs">
                  <div class="flex justify-between text-slate-500">
                    <span>Tiền công sửa chữa:</span>
                    <span class="font-bold text-slate-700">
                      {{ formatCurrency(order.laborCost || 0) }}
                    </span>
                  </div>
                  <div class="flex justify-between text-slate-500">
                    <span>Tiền phụ tùng vật tư:</span>
                    <span class="font-bold text-slate-700">
                      {{ formatCurrency(order.partsCost || 0) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state when no order -->
      <div v-else class="text-center py-20 text-slate-400">
        <div class="text-4xl mb-4">🔧</div>
        <div>Đang tải thông tin phiếu sửa chữa...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";

import {
  RepairOrderApi,
  type IssuePartsPayload,
  type RepairOrder,
} from "@/api/sales";
import { EmployeeApi, type EmployeeResponse } from "@/api/operations";
import { VehicleApi } from "@/api/vehicle/vehicle.api";

defineOptions({ name: "ServiceWorkshopRepairOrderForm" });

const route = useRoute();
const router = useRouter();

const routeId = Array.isArray(route.params.id)
  ? route.params.id[0]
  : route.params.id;
const orderId = Number(routeId);

const loading = ref(false);
const submitting = ref(false);
const order = ref<RepairOrder | null>(null);
const technicians = ref<EmployeeResponse[]>([]);
const selectedTechId = ref<number | null>(null);
const selectedVehicleId = ref<number | null>(null);
const vehicleGallery = ref<string[]>([]);

const form = reactive({
  customerPhone: "",
  licensePlate: "",
  vehicleBrand: "",
  vehicleColor: "",
  vehicleYear: "",
  mileage: 0,
  description: "",
});

const steps = [
  {
    status: "Pending",
    title: "Tiếp nhận xe",
    description: "Ghi nhận thông tin xe và yêu cầu sửa chữa ban đầu.",
  },
  {
    status: "InProgress",
    title: "Sửa chữa",
    description: "Phân công kỹ thuật viên và thực hiện sửa chữa.",
  },
  {
    status: "QcPending",
    title: "Kiểm định QC",
    description: "Kiểm tra chất lượng sau sửa chữa.",
  },
  {
    status: "Completed",
    title: "Hoàn tất",
    description: "Thanh toán và bàn giao xe.",
  },
];

const statusOrder = ["Pending", "InProgress", "QcPending", "Completed"];

const syncForm = (value: RepairOrder) => {
  form.customerPhone = value.customerPhone || "";
  form.mileage = value.mileage || 0;
  form.description = value.description || "";
  selectedTechId.value = value.technicianId || null;
  selectedVehicleId.value = value.vehicleId || null;
};

const loadOrder = async () => {
  if (!Number.isFinite(orderId)) {
    ElMessage.error("Mã phiếu sửa chữa không hợp lệ");
    return;
  }

  loading.value = true;
  try {
    const res = await RepairOrderApi.getDetail(orderId);
    order.value = res;
    syncForm(res);
  } catch (err: any) {
    ElMessage.error(err?.message || "Không thể tải thông tin phiếu sửa chữa");
  } finally {
    loading.value = false;
  }
};

const loadTechnicians = async () => {
  try {
    technicians.value = await EmployeeApi.getList();
  } catch (err) {
    console.error("Failed to load technicians", err);
  }
};

const buildIssuePartsPayload = (
  status: "InProgress" | "QcPending",
): IssuePartsPayload => {
  const details = order.value?.details || [];

  return {
    repairOrderId: orderId,
    parts: details
      .filter((detail) => detail.type === "Part" && detail.productVariantId)
      .map((detail) => ({
        productVariantId: detail.productVariantId as number,
        count: detail.count,
        price: detail.price,
        notes: detail.notes || undefined,
      })),
    services: details
      .filter((detail) => detail.type === "Service" && detail.serviceId)
      .map((detail) => ({
        serviceId: detail.serviceId as number,
        laborCost: detail.laborCost,
        notes: detail.notes || undefined,
      })),
    status,
  };
};

const handleSubmitPending = async () => {
  if (!selectedVehicleId.value && !order.value?.vehicleId) {
    ElMessage.warning("Vui lòng tra cứu biển số xe trước khi lưu tiếp nhận");
    return;
  }

  submitting.value = true;
  try {
    const vehicleId = selectedVehicleId.value || order.value?.vehicleId || 0;
    await RepairOrderApi.update(orderId, {
      id: orderId,
      vehicleId,
      maintenanceDate: new Date().toISOString(),
      description: form.description,
      mileage: form.mileage,
      technicianId: selectedTechId.value,
      partsCost: order.value?.partsCost || 0,
      laborCost: order.value?.laborCost || 0,
    });
    ElMessage.success("Cập nhật thông tin tiếp nhận thành công!");
    await loadOrder();
  } catch (err: any) {
    ElMessage.error(err?.message || "Không thể cập nhật thông tin");
  } finally {
    submitting.value = false;
  }
};

const handleStartRepair = async () => {
  submitting.value = true;
  try {
    if (selectedTechId.value) {
      await RepairOrderApi.assignTechnician({
        repairOrderId: orderId,
        technicianId: selectedTechId.value,
      });
    } else {
      await RepairOrderApi.issueParts(buildIssuePartsPayload("InProgress"));
    }

    ElMessage.success("Đã chuyển phiếu sang trạng thái đang sửa chữa");
    await loadOrder();
  } catch (err: any) {
    ElMessage.error(err?.message || "Không thể bắt đầu sửa chữa");
  } finally {
    submitting.value = false;
  }
};

const assignTechnician = async () => {
  if (!selectedTechId.value) {
    ElMessage.warning("Vui lòng chọn kỹ thuật viên");
    return;
  }

  submitting.value = true;
  try {
    await RepairOrderApi.assignTechnician({
      repairOrderId: orderId,
      technicianId: selectedTechId.value,
    });
    ElMessage.success("Đã phân công kỹ thuật viên");
    await loadOrder();
  } catch (err: any) {
    ElMessage.error(err?.message || "Phân công kỹ thuật viên thất bại");
  } finally {
    submitting.value = false;
  }
};

const handleComplete = async () => {
  try {
    await ElMessageBox.confirm(
      "Xác nhận đóng phiếu sửa chữa? Phiếu sẽ chuyển sang trạng thái Hoàn tất.",
      "Xác nhận hoàn tất",
      {
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Hủy",
        type: "warning",
      },
    );

    submitting.value = true;
    await RepairOrderApi.complete({
      repairOrderId: orderId,
      paymentMethod: "Cash",
      paymentStatus: "Paid",
    });
    ElMessage.success("Đã hoàn tất phiếu sửa chữa!");
    await loadOrder();
  } catch (err: any) {
    if (err !== "cancel") {
      ElMessage.error(err?.message || "Không thể hoàn tất phiếu");
    }
  } finally {
    submitting.value = false;
  }
};

const openIssuePartsDialog = () => {
  ElMessage.info(
    "Vui lòng mở trang chi tiết phiếu để quản lý hạng mục phụ tùng / dịch vụ",
  );
};

const openPrintReceipt = () => {
  window.print();
};

const openImagePreview = (src: string) => {
  window.open(src, "_blank");
};

const goBack = () => {
  router.push("/factory/workshop/repair");
};

const formatCurrency = (value: number) => {
  if (!value) return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Tra cứu xe theo SĐT
let phoneTimeout: any = null;
function handlePhoneInput() {
  if (phoneTimeout) clearTimeout(phoneTimeout);

  const phone = form.customerPhone.trim();
  if (/^\d{9,10}$/.test(phone)) {
    phoneTimeout = setTimeout(async () => {
      try {
        const res = await VehicleApi.getPortfolio({
          query: phone,
          queryType: "phone",
          page: 1,
          pageSize: 5,
        });
        if (res?.vehicle) {
          applyVehicleData(res.vehicle);
        }
      } catch (err) {
        console.error("Lỗi tra cứu SĐT:", err);
      }
    }, 400);
  }
}

// Tra cứu xe theo biển số
let plateTimeout: any = null;
function handlePlateInput() {
  if (plateTimeout) clearTimeout(plateTimeout);

  const plate = form.licensePlate.trim();
  if (plate.length >= 6) {
    plateTimeout = setTimeout(async () => {
      try {
        const res = await VehicleApi.getPortfolio({
          query: plate,
          queryType: "licensePlate",
          page: 1,
          pageSize: 5,
        });
        if (res?.vehicle) {
          applyVehicleData(res.vehicle);
        }
      } catch (err) {
        console.error("Lỗi tra cứu biển số:", err);
      }
    }, 400);
  }
}

function applyVehicleData(vehicle: any) {
  form.licensePlate = vehicle.licensePlate || "";
  form.vehicleBrand =
    [vehicle.brandName, vehicle.variantName].filter(Boolean).join(" ") || "N/A";
  form.vehicleColor = vehicle.colorName || "N/A";
  form.vehicleYear = vehicle.productId ? String(vehicle.productId) : "";
  selectedVehicleId.value = vehicle.id;
  // Gallery: placeholder - backend chưa có endpoint gallery riêng
  vehicleGallery.value = [];
}

const isStepActive = (status: string) => {
  if (!order.value) return false;
  return statusOrder.indexOf(status) <= statusOrder.indexOf(order.value.status);
};

const getStepDotClass = (status: string) => {
  if (!order.value) return "border-slate-200 bg-white text-slate-300";

  const currentIndex = statusOrder.indexOf(order.value.status);
  const stepIndex = statusOrder.indexOf(status);

  if (stepIndex < currentIndex)
    return "border-emerald-500 bg-emerald-500 text-white";
  if (stepIndex === currentIndex)
    return "border-blue-600 bg-white text-blue-600";
  return "border-slate-200 bg-white text-slate-300";
};

const getStepInnerDotClass = (status: string) => {
  if (!order.value) return "bg-slate-200";

  const currentIndex = statusOrder.indexOf(order.value.status);
  const stepIndex = statusOrder.indexOf(status);

  if (stepIndex < currentIndex) return "bg-white";
  if (stepIndex === currentIndex) return "bg-blue-600";
  return "bg-slate-200";
};

const getStatusBadgeClass = (status: string) => {
  const base =
    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider inline-block text-center w-28 ";

  switch (status) {
    case "Pending":
      return `${base}bg-purple-50 text-purple-600 border border-purple-200`;
    case "InProgress":
      return `${base}bg-blue-50 text-blue-600 border border-blue-200`;
    case "QcPending":
      return `${base}bg-amber-50 text-amber-600 border border-amber-200`;
    case "Completed":
      return `${base}bg-emerald-50 text-emerald-600 border border-emerald-200`;
    case "Cancelled":
      return `${base}bg-red-50 text-red-600 border border-red-200`;
    default:
      return `${base}bg-slate-50 text-slate-600 border border-slate-200`;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "Pending":
      return "Chờ tiếp nhận";
    case "InProgress":
      return "Đang sửa chữa";
    case "QcPending":
      return "Đang QC";
    case "Completed":
      return "Đã hoàn thành";
    case "Cancelled":
      return "Đã hủy";
    default:
      return status || "-";
  }
};

onMounted(() => {
  loadOrder();
  loadTechnicians();
});
</script>

<style scoped>
.repair-order-form-page {
  font-family:
    Inter,
    system-ui,
    -apple-system,
    sans-serif;
}
</style>
