<template>
  <div class="flex flex-col gap-4 pb-5">
    <!-- Header -->
    <div class="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold">
          {{ $t("menus.service.workshop.historyByVin") }}
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          Tra cứu hồ sơ xe: nhập VIN / biển số / SĐT để xem thông tin xe, cảnh
          báo bảo dưỡng và lịch sử sửa chữa.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <ElButton
          :icon="Refresh"
          type="primary"
          :loading="loading"
          @click="handleSearchClick"
        >
          Tìm kiếm
        </ElButton>
        <ElButton :icon="Close" :disabled="loading" @click="handleResetClick"
          >Đặt lại</ElButton
        >
      </div>
    </div>

    <!-- Smart Search Bar -->
    <ElCard>
      <template #header>
        <span class="font-semibold">Smart Search</span>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            class="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2"
          >
            Nhập VIN / Biển số / SĐT
            <span class="text-red-500">*</span>
          </label>
          <ElInput
            v-model="query"
            placeholder="Ví dụ: AEM6899XXXX / 51A-123.45 / 090xxxxxxx"
            clearable
            @keyup.enter="handleSearch"
          />
        </div>

        <div>
          <label
            class="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2"
          >
            Kiểu truy vấn
          </label>
          <ElSelect v-model="queryType" placeholder="Tự động" class="w-full">
            <ElOption label="Tự động" value="auto" />
            <ElOption label="VIN/Số khung" value="vin" />
            <ElOption label="Biển số" value="licensePlate" />
            <ElOption label="SĐT" value="phone" />
          </ElSelect>
        </div>

        <div class="flex flex-col justify-end">
          <div class="flex items-center gap-3">
            <ElTag type="info" effect="dark">Gợi ý: VIN / Biển số / SĐT</ElTag>
          </div>
        </div>
      </div>

      <div v-if="error" class="mt-3 text-sm text-red-600">
        {{ error }}
      </div>

      <div class="mt-4 flex items-center justify-end">
        <ElButton
          type="primary"
          :disabled="!query.trim() || loading"
          @click="handleSearchClick"
        >
          Tra cứu
        </ElButton>
      </div>
    </ElCard>

    <!-- Vehicle Meta Card + Alerts + Timeline -->
    <ElCard v-loading="loading">
      <div v-if="vehicle" class="space-y-5">
        <!-- Vehicle Meta Card -->
        <div class="rounded-2xl border border-slate-200 p-5 bg-white">
          <div class="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div class="flex items-center gap-3">
                <h2 class="text-lg font-black text-slate-900 m-0">
                  Hồ sơ xe (Vehicle Portfolio)
                </h2>
                <ElTag type="primary" effect="dark">{{
                  vehicle.fullName
                }}</ElTag>
              </div>
              <p class="mt-1 text-sm text-slate-500">
                <span class="font-medium">{{ vehicle.licensePlate }}</span> •
                VIN:
                <span class="font-mono">{{ vehicle.vinNumber || "-" }}</span>
              </p>
            </div>

            <div class="text-xs text-slate-500">
              <div>Ngày mua: {{ formatDate(vehicle.purchaseDate) }}</div>
              <div>SĐT: {{ vehicle.phoneNumber || "-" }}</div>
            </div>
          </div>

          <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div
                class="text-slate-400 text-[10px] font-black uppercase tracking-wider"
              >
                Biển số
              </div>
              <div class="font-black text-slate-900">
                {{ vehicle.licensePlate }}
              </div>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div
                class="text-slate-400 text-[10px] font-black uppercase tracking-wider"
              >
                Số khung (VIN)
              </div>
              <div class="font-mono font-black text-slate-900 text-[12px]">
                {{ vehicle.vinNumber || "-" }}
              </div>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div
                class="text-slate-400 text-[10px] font-black uppercase tracking-wider"
              >
                Số máy
              </div>
              <div class="font-mono font-black text-slate-900 text-[12px]">
                {{ vehicle.engineNumber || "-" }}
              </div>
            </div>
          </div>
        </div>

        <!-- Predictive Maintenance Alerts -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ElCard class="lg:col-span-2">
            <template #header>
              <div class="flex items-center gap-2">
                <ArtSvgIcon icon="ri:alert-triangle-line" />
                <span class="font-semibold">Cảnh báo bảo dưỡng dự đoán</span>
              </div>
            </template>

            <div v-if="alerts.length === 0" class="text-sm text-slate-500">
              Không có cảnh báo theo dữ liệu hiện tại.
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="a in alerts"
                :key="a.title"
                class="rounded-xl border border-slate-200 p-3"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="font-black text-slate-900">{{ a.title }}</div>
                  <ElTag :type="a.type" effect="dark">{{ a.severity }}</ElTag>
                </div>
                <div class="mt-1 text-sm text-slate-600">
                  {{ a.description }}
                </div>
              </div>
            </div>
          </ElCard>

          <ElCard>
            <template #header>
              <div class="flex items-center gap-2">
                <ArtSvgIcon icon="ri:history-line" />
                <span class="font-semibold">Tổng quan</span>
              </div>
            </template>

            <div class="space-y-3">
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Số lần sửa chữa</span>
                <span class="font-black text-slate-900">{{
                  timeline.length
                }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Trạng thái mới nhất</span>
                <span class="font-black text-slate-900">
                  {{ latestOrder?.status || "-" }}
                </span>
              </div>
            </div>
          </ElCard>
        </div>

        <!-- Timeline View -->
        <div>
          <div class="flex items-center justify-between gap-3 flex-wrap mb-3">
            <div>
              <h3
                class="text-sm font-black uppercase text-slate-800 tracking-wider m-0"
              >
                Timeline sửa chữa
              </h3>
              <p class="text-sm text-slate-500 mt-1">
                Sắp xếp giảm dần theo thời gian (mới nhất ở trên).
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <div
              v-for="item in timeline"
              :key="item.id"
              class="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <ElTag type="info" effect="dark">
                      {{ formatRepairOrderTicket(item) }}
                    </ElTag>
                    <ElTag :type="statusTagType(item.status)" effect="dark">
                      {{ item.status }}
                    </ElTag>
                  </div>
                  <div class="mt-2 text-sm text-slate-600">
                    Ngày vào xưởng:
                    <span class="font-black text-slate-900">
                      {{ formatDateTime(item.createdAt) }}
                    </span>
                    • ODO:
                    <span class="font-black text-slate-900">
                      {{ item.mileage?.toLocaleString("vi-VN") }} km
                    </span>
                  </div>
                </div>

                <div class="text-right">
                  <div
                    class="text-[11px] font-black text-slate-400 uppercase tracking-wider"
                  >
                    Tổng chi phí
                  </div>
                  <div class="text-lg font-black text-blue-600">
                    {{
                      formatCurrency(
                        item.totalAmount || item.laborCost + item.partsCost,
                      )
                    }}
                  </div>
                </div>
              </div>

              <div class="mt-4">
                <div
                  class="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2"
                >
                  Chi tiết hạng mục
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    class="rounded-xl border border-slate-100 p-3 bg-slate-50"
                  >
                    <div
                      class="text-[11px] font-black text-slate-400 uppercase tracking-wider"
                    >
                      Dịch vụ
                    </div>
                    <div
                      v-if="
                        item.details?.filter((d) => d.type === 'Service').length
                      "
                      class="mt-2 space-y-2"
                    >
                      <div
                        v-for="d in item.details.filter(
                          (d) => d.type === 'Service',
                        )"
                        :key="d.productVariantId || d.id || d.variantName"
                        class="text-sm text-slate-700"
                      >
                        • {{ d.serviceName || d.variantName || "-" }}
                        <span v-if="d.notes">({{ d.notes }})</span>
                      </div>
                    </div>
                    <div v-else class="mt-2 text-sm text-slate-500">-</div>
                  </div>

                  <div
                    class="rounded-xl border border-slate-100 p-3 bg-slate-50"
                  >
                    <div
                      class="text-[11px] font-black text-slate-400 uppercase tracking-wider"
                    >
                      Phụ tùng
                    </div>
                    <div
                      v-if="
                        item.details?.filter((d) => d.type === 'Part').length
                      "
                      class="mt-2 space-y-2"
                    >
                      <div
                        v-for="d in item.details.filter(
                          (d) => d.type === 'Part',
                        )"
                        :key="d.productVariantId || d.id || d.variantName"
                        class="text-sm text-slate-700"
                      >
                        • {{ d.variantName || d.productCode || "-" }}
                        <span v-if="d.count">x{{ d.count }}</span>
                      </div>
                    </div>
                    <div v-else class="mt-2 text-sm text-slate-500">-</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-5 flex items-center justify-end">
            <ElPagination
              background
              layout="prev, pager, next"
              :current-page="pagination.current"
              :page-size="pagination.size"
              :total="pagination.total"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>

      <div
        v-else-if="error"
        class="flex flex-col items-center justify-center py-12 text-center"
      >
        <ElEmpty />
        <div class="mt-4 text-slate-600 font-medium">{{ error }}</div>
        <div class="mt-2 text-sm text-slate-400">
          Vui lòng kiểm tra lại thông tin VIN, Biển số hoặc Số điện thoại.
        </div>
      </div>

      <div
        v-else
        class="flex flex-col items-center justify-center py-12 text-center"
      >
        <ElEmpty
          description="Chưa có dữ liệu. Nhập VIN / biển số / SĐT và bấm “Tra cứu”."
        />
      </div>
    </ElCard>

    <!-- Footer Actions -->
    <ElCard v-if="vehicle" class="mt-0">
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <div class="text-sm text-slate-600">
          <span class="font-black text-slate-900">{{
            vehicle.licensePlate
          }}</span>
          •
          <span>{{ vehicle.fullName }}</span>
        </div>

        <div class="flex items-center gap-3">
          <ElButton type="info" :icon="Printer" @click="handlePrint">
            🖨️ In hồ sơ bảo chứng
          </ElButton>
          <ElButton
            type="primary"
            :icon="DocumentAdd"
            @click="handleCreateRepairOrder"
          >
            📝 Tạo phiếu tiếp nhận nhanh
          </ElButton>
        </div>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Close, DocumentAdd, Printer, Refresh } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

import ArtSvgIcon from "@/components/core/base/art-svg-icon/index.vue";

import { useRouter } from "vue-router";

import { useVehiclePortfolioHistory } from "./useVehiclePortfolioHistory";

defineOptions({ name: "ServiceWorkshopVehiclePortfolioHistory" });

const router = useRouter();

const query = ref("");

const {
  loading,
  error,
  queryType,
  vehicle,
  timeline,
  pagination,
  latestOrder,
  alerts,
  handleReset,
  handleSearch,
} = useVehiclePortfolioHistory();

function formatDate(date: string | undefined) {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString("vi-VN");
  } catch {
    return date;
  }
}

function formatDateTime(date: string | undefined) {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleString("vi-VN");
  } catch {
    return date;
  }
}

function statusTagType(status: (typeof timeline.value)[number]["status"]) {
  switch (status) {
    case "Completed":
      return "success";
    case "Cancelled":
      return "danger";
    case "InProgress":
      return "warning";
    case "QcPending":
      return "info";
    default:
      return "primary";
  }
}

function formatCurrency(value: number) {
  const v = Number(value || 0);
  try {
    return (
      new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(v) +
      "đ"
    );
  } catch {
    return `${Math.round(v)}đ`;
  }
}

function formatRepairOrderTicket(item: any) {
  return `RO-${String(item.id).padStart(4, "0")}`;
}

async function handleSearchClick() {
  await handleSearch({
    query: query.value,
    queryType: queryType.value,
    page: pagination.value.current,
    pageSize: pagination.value.size,
  }).catch((e) => {
    ElMessage.error(e?.message || "Tra cứu thất bại");
  });
}

function handleResetClick() {
  query.value = "";
  handleReset();
}

function handlePageChange(page: number) {
  pagination.value.current = page;
  handleSearchClick();
}

function handlePrint() {
  ElMessage.success("Đang chuẩn bị in hồ sơ (stub UI)");
}

function handleCreateRepairOrder() {
  const plate = vehicle.value?.licensePlate;
  const vin = vehicle.value?.vinNumber;
  const phone = vehicle.value?.phoneNumber;

  ElMessage.success(
    "Tạo phiếu tiếp nhận nhanh (stub): điều hướng tới Repair Orders",
  );

  router.push({
    name: "ServiceWorkshopRepairOrders",
    query: {
      source: "vehicle-portfolio",
      licensePlate: plate || "",
      vinNumber: vin || "",
      customerPhone: phone || "",
    },
  });
}

onMounted(() => {});
</script>
