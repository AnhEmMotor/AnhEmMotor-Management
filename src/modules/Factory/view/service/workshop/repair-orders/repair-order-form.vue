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

            <!-- Search Customer -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                />
              </div>

              <div class="md:col-span-1">
                <label
                  class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2"
                >
                  Dữ liệu xe (Autofill - demo)
                </label>
                <div
                  class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600"
                >
                  (Placeholder) Biển số / Màu / Đời xe / Số khung / Số máy /
                  Lịch sử bảo dưỡng
                </div>
              </div>

              <div class="md:col-span-1">
                <label
                  class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2"
                >
                  Ô ảnh hiện trạng (Gallery)
                </label>
                <div
                  class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600"
                >
                  (Placeholder) Upload hình: trầy xước, móp méo...
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                Danh sách hạng mục công việc (demo: sử dụng services/parts hiện
                có)
              </div>

              <div class="p-4 space-y-4">
                <div class="text-xs text-slate-500">
                  (Demo) Bạn có thể thêm bậc công việc theo services/parts bằng
                  cách mở các thao tác phía dưới “Execution”.
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
              <ElButton type="primary" @click="openIssuePartsDialog">
                <ArtSvgIcon icon="ri:shopping-cart-2-line" /> Xuất kho / Cấp
                phát
              </ElButton>
            </div>

            <div class="space-y-3">
              <div class="text-xs text-slate-500">
                Trạng thái từng hạng mục: (UI demo - dùng grouping theo
                services/parts trong order.details)
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
                    <tr v-if="order.details.length === 0">
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
                    <span class="font-bold text-slate-700">{{
                      formatCurrency(order.laborCost || 0)
                    }}</span>
                  </div>
                  <div class="flex justify-between text-slate-500">
                    <span>Tiền phụ tùng vật tư:</span>
                    <span class="font-bold text-slate-700">{{
                      formatCurrency(order.partsCost || 0)
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";

import {
  RepairOrderApi,
  type IssuePartsPayload,
  type RepairOrder,
} from "@/api/sales";
import { EmployeeApi, type EmployeeResponse } from "@/api/operations";

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

const form = reactive({
  customerPhone: "",
  mileage: 0,
  description: "",
});

const steps = [
  {
    status: "Pending",
    title: "Tiep nhan xe",
    description: "Ghi nhan thong tin xe va yeu cau sua chua ban dau.",
  },
  {
    status: "InProgress",
    title: "Sua chua",
    description: "Phan cong ky thuat vien va thuc hien sua chua.",
  },
  {
    status: "QcPending",
    title: "Kiem dinh QC",
    description: "Kiem tra chat luong sau sua chua.",
  },
  {
    status: "Completed",
    title: "Hoan tat",
    description: "Thanh toan va ban giao xe.",
  },
];

const statusOrder = ["Pending", "InProgress", "QcPending", "Completed"];

const syncForm = (value: RepairOrder) => {
  form.customerPhone = value.customerPhone || "";
  form.mileage = value.mileage || 0;
  form.description = value.description || "";
  selectedTechId.value = value.technicianId || null;
};

const loadOrder = async () => {
  if (!Number.isFinite(orderId)) {
    ElMessage.error("Ma phieu sua chua khong hop le");
    return;
  }

  loading.value = true;
  try {
    const res = await RepairOrderApi.getDetail(orderId);
    order.value = res;
    syncForm(res);
  } catch (err: any) {
    ElMessage.error(err?.message || "Khong the tai thong tin phieu sua chua");
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

const handleSubmitPending = () => {
  ElMessage.warning(
    "Backend chua co endpoint cap nhat thong tin tiep nhan cua phieu sua chua",
  );
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

    ElMessage.success("Da chuyen phieu sang trang thai dang sua chua");
    await loadOrder();
  } catch (err: any) {
    ElMessage.error(err?.message || "Khong the bat dau sua chua");
  } finally {
    submitting.value = false;
  }
};

const assignTechnician = async () => {
  if (!selectedTechId.value) {
    ElMessage.warning("Vui long chon ky thuat vien");
    return;
  }

  submitting.value = true;
  try {
    await RepairOrderApi.assignTechnician({
      repairOrderId: orderId,
      technicianId: selectedTechId.value,
    });
    ElMessage.success("Da phan cong ky thuat vien");
    await loadOrder();
  } catch (err: any) {
    ElMessage.error(err?.message || "Phan cong ky thuat vien that bai");
  } finally {
    submitting.value = false;
  }
};

const openIssuePartsDialog = () => {
  ElMessage.info(
    "Man hinh nay chua co dialog cap phat; hay dung man chi tiet de sua hang muc",
  );
};

const openPrintReceipt = () => {
  window.print();
};

const goBack = () => {
  router.push("/factory/service/workshop/repair-orders");
};

const formatCurrency = (value: number) => {
  if (!value) return "0 d";
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
      return "Cho tiep nhan";
    case "InProgress":
      return "Dang sua chua";
    case "QcPending":
      return "Dang QC";
    case "Completed":
      return "Da hoan thanh";
    case "Cancelled":
      return "Da huy";
    default:
      return status || "-";
  }
};

onMounted(() => {
  loadOrder();
  loadTechnicians();
});
</script>
