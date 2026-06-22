<template>
  <div
    class="purchasing-pipeline-page flex flex-col h-screen bg-[#F8F9FA] overflow-hidden"
  >
    <div
      class="slim-header bg-[#001529] px-6 py-2.5 flex items-center justify-between shadow-lg z-10"
    >
      <div class="flex items-center gap-6">
        <div
          v-for="stat in pipelineStats"
          :key="stat.label"
          class="flex items-center gap-2 px-3 border-r border-white/10 last:border-none"
        >
          <div class="size-2 rounded-full" :class="stat.dotColor"></div>
          <span
            class="text-[10px] font-bold text-white/50 uppercase tracking-widest"
            >{{ stat.label }}</span
          >
          <span class="text-sm font-black text-white">{{ stat.count }}</span>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div class="h-4 w-px bg-white/10"></div>
        <div class="live-indicator flex items-center gap-2">
          <div class="size-1.5 rounded-full bg-red-500 animate-pulse"></div>
          <span
            class="text-[9px] font-black text-red-400 uppercase tracking-widest"
            >Live Updates</span
          >
        </div>
      </div>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <div class="main-kanban-area flex-1 flex flex-col overflow-hidden">
        <div
          class="p-4 px-6 flex items-center justify-between bg-white/40 border-b border-gray-100"
        >
          <div class="flex items-center gap-6">
            <div class="flex items-center gap-2">
              <ArtSvgIcon icon="ri:filter-line" class="text-navy text-sm" />
              <span class="text-[10px] font-black text-gray-400 uppercase"
                >Bộ lọc:</span
              >
            </div>
            <ElSelect
              v-model="filterSale"
              placeholder="Theo nhân viên"
              class="slim-select w-44"
              clearable
              size="small"
            >
              <ElOption
                v-for="sale in salesList"
                :key="sale.id"
                :label="sale.name"
                :value="sale.id"
              />
            </ElSelect>
            <ElButton
              type="primary"
              link
              size="small"
              class="font-bold text-[10px] uppercase"
            >
              <ArtSvgIcon icon="ri:flashlight-fill" class="mr-1" /> Kèo kẹt hồ
              sơ
            </ElButton>
          </div>
        </div>

        <div
          class="flex-1 overflow-x-auto p-6 kanban-board-wrapper custom-scrollbar"
        >
          <div class="flex gap-4 h-full min-w-max">
            <div
              v-for="column in boardColumns"
              :key="column.id"
              class="kanban-column transition-all duration-500"
              :class="[
                column.isCollapsed ? 'w-[60px]' : 'w-[320px]',
                { 'column-collapsed': column.isCollapsed },
              ]"
            >
              <div
                class="column-header flex items-center justify-between mb-4 px-3 py-2 rounded-xl bg-white border border-gray-100 shadow-sm cursor-pointer hover:bg-gray-50"
                @click="column.isCollapsed = !column.isCollapsed"
              >
                <div class="flex items-center gap-2 overflow-hidden">
                  <div
                    class="size-2 rounded-full shrink-0"
                    :style="{ backgroundColor: column.color }"
                  ></div>
                  <h4
                    v-if="!column.isCollapsed"
                    class="m-0 text-[11px] font-black text-gray-700 uppercase truncate"
                  >
                    {{ column.title }}
                  </h4>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <span class="text-[10px] font-black text-gray-300">{{
                    column.items.length
                  }}</span>
                  <ArtSvgIcon
                    :icon="
                      column.isCollapsed
                        ? 'ri:arrow-right-s-line'
                        : 'ri:arrow-left-s-line'
                    "
                    class="text-gray-300"
                  />
                </div>
              </div>

              <VueDraggable
                v-if="!column.isCollapsed"
                v-model="column.items"
                group="pipeline"
                ghost-class="ghost-card"
                class="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 custom-scrollbar"
                @change="(e) => handleDragChange(e, column.id)"
              >
                <div
                  v-for="deal in column.items"
                  :key="deal.id"
                  class="minimal-deal-card group relative bg-white rounded-2xl p-4 shadow-sm transition-all hover:shadow-md border-[1.5px]"
                  :style="{
                    borderColor:
                      deal.priority === 'Urgent'
                        ? '#ef4444'
                        : deal.priority === 'High'
                          ? '#eab308'
                          : '#f1f5f9',
                  }"
                >
                  <div class="flex justify-between items-start mb-2">
                    <div class="flex flex-col gap-0.5">
                      <span
                        class="text-sm font-black text-gray-800 tracking-tight leading-tight"
                        >{{ deal.customerName }}</span
                      >
                      <span
                        class="text-[9px] font-bold text-gray-400 uppercase tracking-widest"
                        >{{ deal.vehicle }}</span
                      >
                    </div>

                    <ElTooltip
                      :content="
                        deal.isVerified
                          ? 'Hồ sơ đã xác thực'
                          : 'Hồ sơ chưa chuẩn hóa'
                      "
                    >
                      <div
                        class="size-6 rounded-lg flex-cc"
                        :class="
                          deal.isVerified
                            ? 'bg-emerald-50 text-emerald-500'
                            : 'bg-gray-100 text-gray-300 blink-warning'
                        "
                      >
                        <ArtSvgIcon icon="ri:profile-line" class="text-xs" />
                      </div>
                    </ElTooltip>
                  </div>

                  <div class="flex flex-wrap gap-2 mt-3">
                    <div
                      class="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full"
                    >
                      <ArtSvgIcon
                        icon="ri:time-line"
                        class="text-[10px] text-gray-300"
                      />
                      <span
                        class="text-[9px] font-bold"
                        :class="
                          isStale(deal) ? 'text-red-500' : 'text-gray-400'
                        "
                        >{{ deal.timeInStage }}</span
                      >
                    </div>
                    <div
                      v-if="(deal as any).subStatus"
                      class="bg-blue-50 px-2 py-0.5 rounded-full"
                    >
                      <span
                        class="text-[9px] font-black text-blue-500 uppercase tracking-tighter"
                        >{{ (deal as any).subStatus }}</span
                      >
                    </div>
                  </div>

                  <div
                    class="absolute bottom-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div
                      class="size-7 bg-blue-600 text-white rounded-lg flex-cc shadow-lg cursor-pointer hover:scale-110"
                    >
                      <ArtSvgIcon icon="ri:chat-1-fill" class="text-xs" />
                    </div>
                    <div
                      class="size-7 bg-emerald-500 text-white rounded-lg flex-cc shadow-lg cursor-pointer hover:scale-110"
                    >
                      <ArtSvgIcon icon="ri:phone-fill" class="text-xs" />
                    </div>
                  </div>
                </div>
              </VueDraggable>

              <div v-else class="h-full flex flex-cc">
                <span
                  class="rotate-90 whitespace-nowrap text-[10px] font-black text-gray-300 uppercase tracking-widest"
                >
                  {{ column.title }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="action-sidebar w-[350px] bg-white border-l border-gray-100 flex flex-col"
      >
        <div
          class="p-6 border-b border-gray-50 flex items-center justify-between"
        >
          <h4
            class="m-0 text-xs font-black text-navy uppercase tracking-widest flex items-center gap-2"
          >
            <ArtSvgIcon
              icon="ri:notification-badge-line"
              class="text-red-500"
            />
            Hành động ngay
          </h4>
          <ElTag
            size="small"
            type="danger"
            effect="dark"
            round
            class="font-black border-none"
            >5</ElTag
          >
        </div>

        <div
          class="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar"
        >
          <div
            v-for="alert in criticalAlerts"
            :key="alert.id"
            class="alert-item group bg-red-50/50 p-4 rounded-2xl border border-red-100 hover:bg-red-50 transition-all cursor-pointer relative"
          >
            <div class="flex gap-3">
              <div
                class="size-8 bg-red-500 text-white rounded-xl flex-cc shrink-0 shadow-lg shadow-red-100"
              >
                <ArtSvgIcon :icon="alert.icon" />
              </div>
              <div class="flex-1 flex flex-col gap-1">
                <div class="flex justify-between items-start">
                  <span
                    class="text-[10px] font-black text-red-600 uppercase tracking-tighter"
                    >{{ alert.type }}</span
                  >

                  <ElTooltip :content="'Đôn đốc Sale: ' + alert.saleName">
                    <div
                      class="size-6 bg-white text-blue-600 rounded-lg flex-cc shadow-sm hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <ArtSvgIcon
                        icon="ri:messenger-line"
                        class="text-[10px]"
                      />
                    </div>
                  </ElTooltip>
                </div>
                <p class="m-0 text-[11px] font-bold text-gray-700 leading-snug">
                  {{ alert.content }}
                </p>
                <div class="flex items-center gap-2 mt-2">
                  <span class="text-[9px] font-black text-gray-400 uppercase">{{
                    alert.customer
                  }}</span>
                  <div class="size-1 rounded-full bg-gray-200"></div>
                  <span class="text-[9px] font-black text-gray-400 uppercase">{{
                    alert.time
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 bg-gray-50 border-t border-gray-100">
          <ElButton
            class="w-full rounded-xl font-black text-[10px] uppercase h-10 border-none shadow-sm"
          >
            Xem báo cáo chi tiết
          </ElButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  PlateDossierApi,
  PlateDossier,
} from "@/infrastructure/api/plate-dossier";

defineOptions({ name: "PurchasingProgress" });

const salesList = [
  { id: 1, name: "Sale Nguyễn Văn A" },
  { id: 2, name: "Sale Trần Thị B" },
];
const filterSale = ref("");

const boardColumns = ref([
  {
    id: "Prepare",
    title: "Chuẩn bị hồ sơ",
    color: "#64748b",
    isCollapsed: false,
    items: [] as any[],
  },
  {
    id: "TaxPaid",
    title: "Đã nộp thuế",
    color: "#eab308",
    isCollapsed: false,
    items: [] as any[],
  },
  {
    id: "PlateAssigned",
    title: "Đã bấm biển",
    color: "#3b82f6",
    isCollapsed: false,
    items: [] as any[],
  },
  {
    id: "WaitingCard",
    title: "Chờ cà-vẹt",
    color: "#a855f7",
    isCollapsed: false,
    items: [] as any[],
  },
  {
    id: "Completed",
    title: "Hoàn thành",
    color: "#10b981",
    isCollapsed: false,
    items: [] as any[],
  },
]);

const pipelineStats = computed(() => {
  let total = 0;
  const stats = boardColumns.value.map((col) => {
    total += col.items.length;
    return {
      label: col.title,
      count: col.items.length,
      dotColor:
        col.id === "Prepare"
          ? "bg-slate-400"
          : col.id === "TaxPaid"
            ? "bg-amber-500"
            : col.id === "PlateAssigned"
              ? "bg-blue-500"
              : col.id === "WaitingCard"
                ? "bg-purple-500"
                : "bg-emerald-500",
    };
  });
  return [
    { label: "Tổng Hồ Sơ", count: total, dotColor: "bg-[#001529]" },
    ...stats,
  ];
});

const criticalAlerts = ref<any[]>([]);

const fetchDossiers = async () => {
  try {
    const res = await PlateDossierApi.getList({ current: 1, size: 100 });
    const dossiers: PlateDossier[] = res.items || [];

    // reset columns
    boardColumns.value.forEach((col) => {
      col.items = [];
    });

    // fill columns
    dossiers.forEach((d: PlateDossier) => {
      const item = {
        id: d.id,
        customerName: d.customerName || "Khách hàng ẩn danh",
        vehicle: d.vehicleName || "Xe máy",
        priority: d.status === "Prepare" ? "High" : "Normal",
        timeInStage: getFormattedTime(d.createdAt),
        isVerified: d.status !== "Prepare",
        subStatus: d.licensePlate || undefined,
        licensePlate: d.licensePlate,
        registrationFee: d.registrationFee,
        actualCost: d.actualCost,
        serviceFee: d.serviceFee,
        notes: d.notes,
        rawCreatedAt: d.createdAt,
      };

      const col = boardColumns.value.find((c) => c.id === d.status);
      if (col) {
        col.items.push(item);
      }
    });

    // Generate critical alerts from Prepare status dossiers that are older than 1 day
    criticalAlerts.value = dossiers
      .filter((d: PlateDossier) => d.status === "Prepare")
      .map((d: PlateDossier) => ({
        id: d.id,
        type: "HỒ SƠ MỚI",
        content: `Đơn xuất hàng #${d.outputId} đang chờ nộp thuế trước bạ & bấm biển.`,
        customer: d.customerName || "N/A",
        saleName: "Admin",
        time: getFormattedTime(d.createdAt),
        icon: "ri:alert-fill",
      }));
  } catch (err: any) {
    ElMessage.error(err.message || "Lỗi khi tải hồ sơ biển số");
  }
};

const getFormattedTime = (dateStr: string) => {
  const created = new Date(dateStr);
  const diffMs = new Date().getTime() - created.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Vừa tạo";
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngày trước`;
};

onMounted(() => {
  fetchDossiers();
});

const isStale = (deal: any) => {
  return deal.timeInStage.includes("ngày") && parseInt(deal.timeInStage) >= 3;
};

const handleDragChange = async (event: any, columnId: string) => {
  if (event.added) {
    const deal = event.added.element;
    const payload: any = {
      id: deal.id,
      status: columnId,
    };

    if (columnId === "PlateAssigned" && !deal.licensePlate) {
      try {
        const { value: plate } = await ElMessageBox.prompt(
          "Vui lòng nhập biển số xe đã được cấp:",
          "Cấp biển số xe",
          {
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Hủy bỏ",
            inputPattern: /^[0-9]{2}-[A-Z0-9]{1,2}\s?[0-9]{3,5}(\.[0-9]{2})?$/,
            inputErrorMessage:
              "Định dạng biển số không đúng (VD: 60-B1 123.45)",
          },
        );
        payload.licensePlate = plate;
      } catch {
        // user cancelled, revert
        await fetchDossiers();
        return;
      }
    }

    try {
      await PlateDossierApi.updateStatus(payload);
      ElMessage.success(`Cập nhật trạng thái thành công`);
      await fetchDossiers();
    } catch (err: any) {
      ElMessage.error(err.message || "Lỗi khi cập nhật trạng thái");
      await fetchDossiers();
    }
  }
};
</script>

<style lang="scss" scoped>
.purchasing-pipeline-page {
  .text-navy {
    color: #001529;
  }

  .slim-select {
    :deep(.el-input__wrapper) {
      background-color: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      box-shadow: none;
    }
  }

  .kanban-column {
    &.column-collapsed {
      background-color: #f8fafc;
    }
  }

  .minimal-deal-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      box-shadow: 0 10px 20px rgb(0 0 0 / 5%);
      transform: translateY(-4px);
    }
  }

  .blink-warning {
    animation: blink 1.5s infinite;
  }

  @keyframes blink {
    0% {
      opacity: 1;
      transform: scale(1);
    }

    50% {
      opacity: 0.5;
      transform: scale(0.9);
    }

    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  .custom-scrollbar {
    &::-webkit-scrollbar {
      width: 4px;
      height: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 10px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }
}
</style>
