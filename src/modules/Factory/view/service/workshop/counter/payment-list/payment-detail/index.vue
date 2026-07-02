<template>
  <div v-loading="loading" class="flex flex-col gap-4 pb-5">
    <div class="flex items-center gap-4">
      <button
        @click="goBack"
        class="size-9 rounded-xl border border-slate-200 text-slate-600 flex-cc hover:bg-slate-50 transition-all active:scale-95"
      >
        <ArtSvgIcon icon="ri:arrow-left-line" />
      </button>
      <div>
        <h1 class="text-lg font-black tracking-tight text-slate-900">
          {{ detail?.paymentNumber || "-" }}
        </h1>
        <p
          class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1"
        >
          Phiếu thu dịch vụ xưởng
        </p>
      </div>
      <ElTag
        :type="statusTagType(detail?.paymentStatus || '')"
        effect="dark"
        class="ml-2"
      >
        {{ getPaymentStatusLabel(detail?.paymentStatus || "") }}
      </ElTag>
    </div>

    <div v-if="detail" class="space-y-6 max-w-[800px]">
      <!-- Customer & Service Info -->
      <ElCard>
        <template #header>
          <div class="flex items-center gap-2">
            <ArtSvgIcon icon="ri:user-line" />
            <span class="font-semibold">Thông tin khách hàng & dịch vụ</span>
          </div>
        </template>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-slate-500">Khách hàng:</span>
            <b class="text-slate-900 ml-2">{{ detail.customerName }}</b>
          </div>
          <div>
            <span class="text-slate-500">SĐT:</span>
            <b class="text-slate-900 ml-2">{{ detail.customerPhone }}</b>
          </div>
          <div v-if="detail.vehicleInfo">
            <span class="text-slate-500">Xe:</span>
            <b class="text-slate-900 ml-2">{{ detail.vehicleInfo }}</b>
          </div>
          <div>
            <span class="text-slate-500">Loại phiếu:</span>
            <b class="text-slate-900 ml-2">{{
              getSourceTypeLabel(detail.sourceType)
            }}</b>
          </div>
          <div v-if="detail.serviceDescription" class="md:col-span-2">
            <span class="text-slate-500">Dịch vụ:</span>
            <b class="text-slate-900 ml-2">{{ detail.serviceDescription }}</b>
          </div>
        </div>
      </ElCard>

      <!-- Financial -->
      <ElCard class="bg-red-50/30 border-red-100">
        <template #header>
          <div class="flex items-center gap-2 text-red-900">
            <ArtSvgIcon icon="ri-money-dollar-circle-line" />
            <span class="font-bold">Thông tin thanh toán</span>
          </div>
        </template>
        <div class="space-y-3">
          <div class="flex justify-between text-sm">
            <span class="text-slate-500">Tạm tính:</span>
            <b>{{ formatCurrency(detail.subTotal) }} đ</b>
          </div>
          <div class="flex justify-between text-sm text-red-600">
            <span>Giảm giá:</span>
            <b>- {{ formatCurrency(detail.discountAmount) }} đ</b>
          </div>
          <div
            class="flex justify-between text-xl font-black border-t border-red-100 pt-3"
          >
            <span>Thành tiền:</span>
            <span class="text-red-600"
              >{{ formatCurrency(detail.totalAmount) }} đ</span
            >
          </div>
          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-red-100"
          >
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Hình thức:</span>
              <b>{{ getPaymentMethodLabel(detail.paymentMethod) }}</b>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Ngày thu:</span>
              <b>{{ detail.paidAt ? formatDate(detail.paidAt) : "—" }}</b>
            </div>
          </div>
          <div v-if="detail.notes" class="pt-3 border-t border-red-100 text-sm">
            <span class="text-slate-500">Ghi chú:</span>
            <p class="mt-1 text-slate-700">{{ detail.notes }}</p>
          </div>
        </div>
      </ElCard>

      <!-- Meta -->
      <div class="text-xs text-slate-400 text-center">
        Mã phiếu: {{ detail.paymentNumber }} | Tạo lúc:
        {{ detail.createdAt ? formatDateTime(detail.createdAt) : "-" }}
      </div>
    </div>

    <div v-else class="text-sm text-slate-500">
      Không tìm thấy phiếu thanh toán.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import dayjs from "dayjs";

import ArtSvgIcon from "@/components/core/base/art-svg-icon/index.vue";
import {
  WorkshopPaymentApi,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  SOURCE_TYPES,
} from "@/api/service/workshop-payment.api";
import { createPaymentUseCases } from "@/infrastructure/payment/usecasesFactory";

defineOptions({ name: "ServiceWorkshopPaymentDetail" });

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const detail = ref<any>(null);
const useCases = createPaymentUseCases(WorkshopPaymentApi);

const statusTagType = (
  status: string,
): "primary" | "success" | "warning" | "info" | "danger" => {
  const map: Record<
    string,
    "primary" | "success" | "warning" | "info" | "danger"
  > = {
    Paid: "success",
    Unpaid: "danger",
    Partial: "warning",
    Refunded: "info",
  };
  return map[status] || "primary";
};

const getPaymentStatusLabel = (val: string) => {
  const found = PAYMENT_STATUSES.find((s) => s.value === val);
  return found?.label || val;
};

const getPaymentMethodLabel = (val: string) => {
  const found = PAYMENT_METHODS.find((m) => m.value === val);
  return found?.label || val;
};

const getSourceTypeLabel = (val: string) => {
  const found = SOURCE_TYPES.find((s) => s.value === val);
  return found?.label || val;
};

const formatCurrency = (val: number) => {
  if (!val) return "0";
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(
    val,
  );
};

const formatDate = (d?: string) => {
  if (!d) return "-";
  return dayjs(d).format("DD/MM/YYYY");
};

const formatDateTime = (d?: string) => {
  if (!d) return "-";
  return dayjs(d).format("DD/MM/YYYY HH:mm");
};

const goBack = () => {
  router.push({ name: "ServiceWorkshopCounterPaymentList" });
};

const fetchDetail = async () => {
  loading.value = true;
  try {
    const id = Number(route.params.id);
    const item = await useCases.getDetail.call(id);
    if (item) {
      detail.value = item;
    } else {
      detail.value = null;
      ElMessage.error("Không tìm thấy phiếu thanh toán");
    }
  } catch (e: any) {
    ElMessage.error(e?.message || "Không thể tải chi tiết phiếu thanh toán");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDetail();
});
</script>
