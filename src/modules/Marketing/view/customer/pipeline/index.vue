<template>
  <div class="purchasing-pipeline-page flex flex-col gap-6 pb-10 h-screen">
    <div class="grid grid-cols-5 gap-4 px-4 pt-4">
      <div
        v-for="stat in pipelineStats"
        :key="stat.label"
        class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
      >
        <div class="size-10 rounded-xl flex-cc" :class="stat.bg">
          <ArtSvgIcon :icon="stat.icon" class="text-white text-lg" />
        </div>
        <div class="flex flex-col">
          <span
            class="text-[10px] font-bold text-gray-400 uppercase tracking-widest"
            >{{ stat.label }}</span
          >
          <div class="flex items-baseline gap-2">
            <span class="text-xl font-black text-gray-800">{{
              stat.count
            }}</span>
            <span
              v-if="stat.value"
              class="text-[10px] text-emerald-500 font-bold"
              >{{ stat.value }}</span
            >
          </div>
        </div>
      </div>
    </div>

    <div class="px-4 flex items-center justify-between">
      <div class="flex gap-3">
        <ElSelect
          v-model="filterSale"
          placeholder="Lọc theo Sale"
          class="w-48 premium-select"
          clearable
        >
          <ElOption
            v-for="sale in salesList"
            :key="sale.id"
            :label="sale.name"
            :value="sale.id"
          />
        </ElSelect>
        <ElSelect
          v-model="filterVehicle"
          placeholder="Dòng xe"
          class="w-40 premium-select"
          clearable
        >
          <ElOption label="Winner X" value="Winner X" />
          <ElOption label="SH 125i" value="SH 125i" />
          <ElOption label="Air Blade" value="Air Blade" />
        </ElSelect>
      </div>
      <div
        class="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase"
      >
        <div class="size-2 rounded-full bg-red-500 animate-pulse"></div>
        Trực tiếp: Mega Sale 2024
      </div>
    </div>

    <div class="flex-1 overflow-x-auto px-4 pb-4">
      <div class="flex gap-5 h-full min-w-max">
        <div
          v-for="column in boardColumns"
          :key="column.id"
          class="kanban-column flex flex-col w-[320px] bg-gray-100/50 rounded-3xl border border-gray-100 p-3"
        >
          <div class="flex items-center justify-between px-3 py-4">
            <div class="flex items-center gap-2">
              <div
                class="size-2 rounded-full"
                :style="{ backgroundColor: column.color }"
              ></div>
              <h4
                class="m-0 text-xs font-black text-gray-700 uppercase tracking-wider"
              >
                {{ column.title }}
              </h4>
            </div>
            <ElTag size="small" effect="plain" round class="font-bold">{{
              column.items.length
            }}</ElTag>
          </div>

          <VueDraggable
            v-model="column.items"
            group="pipeline"
            ghost-class="ghost-card"
            drag-class="dragging-card"
            class="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 custom-scrollbar"
            @change="(e) => handleDragChange(e, column.id)"
          >
            <div
              v-for="deal in column.items"
              :key="deal.id"
              class="deal-card bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-400 transition-all cursor-grab active:cursor-grabbing relative group"
              :class="{ 'is-stale': isStale(deal) }"
            >
              <div
                class="absolute top-0 left-4 w-6 h-1 rounded-b-full"
                :class="
                  deal.priority === 'Urgent' ? 'bg-red-500' : 'bg-orange-400'
                "
              ></div>

              <div class="flex justify-between items-start mb-3 mt-1">
                <div class="flex flex-col">
                  <span class="text-sm font-black text-gray-800 line-clamp-1">{{
                    deal.customerName
                  }}</span>
                  <span class="text-[10px] font-bold text-blue-500 uppercase">{{
                    deal.vehicle
                  }}</span>
                </div>
                <div class="flex gap-1">
                  <div
                    class="size-7 bg-blue-50 text-blue-500 rounded-lg flex-cc hover:bg-blue-500 hover:text-white transition-all cursor-pointer"
                  >
                    <ArtSvgIcon icon="ri:chat-1-fill" class="text-xs" />
                  </div>
                  <div
                    class="size-7 bg-green-50 text-green-500 rounded-lg flex-cc hover:bg-green-500 hover:text-white transition-all cursor-pointer"
                  >
                    <ArtSvgIcon icon="ri:phone-fill" class="text-xs" />
                  </div>
                </div>
              </div>

              <div
                class="flex justify-between items-end mt-4 pt-3 border-t border-gray-50"
              >
                <div class="flex items-center gap-1.5">
                  <ArtSvgIcon icon="ri:history-line" class="text-gray-300" />
                  <span
                    class="text-[10px] font-bold text-gray-400"
                    :class="{ 'text-red-500': isStale(deal) }"
                  >
                    {{ deal.timeInStage }}
                  </span>
                </div>
                <div class="flex -space-x-2">
                  <ElTooltip :content="deal.saleName">
                    <ElAvatar
                      :size="20"
                      class="border border-white bg-gray-200 text-[8px] font-black"
                    >
                      {{ deal.saleName.charAt(0) }}
                    </ElAvatar>
                  </ElTooltip>
                </div>
              </div>
            </div>
          </VueDraggable>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import { leadApi } from "@/api/operations/lead.api";
import { ElMessage } from "element-plus";

defineOptions({ name: "PurchasingPipeline" });

interface PipelineItem {
  id: number;
  customerName: string;
  vehicle: string;
  priority: string;
  timeInStage: string;
  saleName: string;
}

const STATUS_MAP: Record<string, { id: string; title: string; color: string }> =
  {
    Consulting: { id: "Consulting", title: "Đang tư vấn", color: "#3b82f6" },
    TestDrive: { id: "TestDrive", title: "Đang lái thử", color: "#6366f1" },
    Deposit: { id: "Deposit", title: "Đã đặt cọc", color: "#f97316" },
    Processing: { id: "Processing", title: "Chờ giấy tờ", color: "#a855f7" },
    Delivered: { id: "Delivered", title: "Đã giao xe", color: "#10b981" },
  };

const boardColumns = ref<
  { id: string; title: string; color: string; items: PipelineItem[] }[]
>([]);
const pipelineStats = ref([
  {
    label: "Tổng Deal",
    count: 0,
    icon: "ri:exchange-funds-line",
    bg: "bg-blue-600",
    value: "",
  },
  {
    label: "Đang tư vấn",
    count: 0,
    icon: "ri:customer-service-2-line",
    bg: "bg-indigo-500",
  },
  {
    label: "Đã đặt cọc",
    count: 0,
    icon: "ri:money-dollar-circle-line",
    bg: "bg-orange-500",
  },
  {
    label: "Chờ biển số",
    count: 0,
    icon: "ri:government-line",
    bg: "bg-purple-500",
  },
  {
    label: "Đã giao xe",
    count: 0,
    icon: "ri:checkbox-circle-line",
    bg: "bg-emerald-500",
  },
]);

const loadPipeline = async () => {
  try {
    const res = await leadApi.getPipeline();
    const groups = res.data;
    const columns = groups
      .map((g) => {
        const mapped = STATUS_MAP[g.status];
        if (!mapped) return null;
        return {
          ...mapped,
          items: g.leads.map((l) => ({
            id: l.id,
            customerName: l.fullName,
            vehicle: l.interestedVehicle || "N/A",
            priority: l.score >= 80 ? "Urgent" : "Normal",
            timeInStage: formatTimeAgo(l.createdAt),
            saleName: l.assignedToName || "Chưa giao",
          })),
        };
      })
      .filter(Boolean) as {
      id: string;
      title: string;
      color: string;
      items: PipelineItem[];
    }[];

    boardColumns.value = columns;

    const totalDeals = groups.reduce((sum, g) => sum + g.leads.length, 0);
    pipelineStats.value[0].count = totalDeals;
    const consultingCount =
      groups.find((g) => g.status === "Consulting")?.leads.length ?? 0;
    pipelineStats.value[1].count = consultingCount;
    const depositCount =
      groups.find((g) => g.status === "Deposit")?.leads.length ?? 0;
    pipelineStats.value[2].count = depositCount;
    const processingCount =
      groups.find((g) => g.status === "Processing")?.leads.length ?? 0;
    pipelineStats.value[3].count = processingCount;
    const deliveredCount =
      groups.find((g) => g.status === "Delivered")?.leads.length ?? 0;
    pipelineStats.value[4].count = deliveredCount;
  } catch (error) {
    console.error("Failed to load pipeline:", error);
  }
};

const formatTimeAgo = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "1 ngày";
  if (diffDays < 7) return `${diffDays} ngày`;
  return `${Math.floor(diffDays / 7)} tuần`;
};

const isStale = (deal: PipelineItem) => {
  return deal.timeInStage.includes("ngày") && parseInt(deal.timeInStage) >= 3;
};

const filterSale = ref("");
const filterVehicle = ref("");
const salesList = [
  { id: 1, name: "Sale Nguyễn Văn A" },
  { id: 2, name: "Sale Trần Thị B" },
];

// boardColumns is now populated by loadPipeline()

const handleDragChange = (event: any, columnId: string) => {
  if (event.added) {
    const deal = event.added.element;
    ElMessage.success(
      `Đã chuyển ${deal.customerName} sang giai đoạn ${getStageName(columnId)}`,
    );

    if (columnId === "Delivered") {
      triggerSuccessCelebration();
    }

    if (columnId === "Processing") {
      ElMessage({
        message: "Hệ thống đã gửi thông báo cho bộ phận hành chính Biên Hòa.",
        type: "info",
      });
    }
  }
};

const getStageName = (id: string) => {
  const col = boardColumns.value.find((c) => c.id === id);
  return col ? col.title : id;
};

const triggerSuccessCelebration = () => {
  console.log("FIREWORKS EFFECT!");
};

onMounted(() => {
  loadPipeline();
});

onMounted(() => {
  loadPipeline();
});
</script>

<style lang="scss" scoped>
.purchasing-pipeline-page {
  background-color: #f8fafc;

  .premium-select {
    :deep(.el-input__wrapper) {
      background-color: white;
      border: 1px solid #f1f5f9;
      border-radius: 12px;
      box-shadow: none;
    }
  }

  .kanban-column {
    .deal-card {
      &.is-stale {
        background-color: #fff1f0;
        border-color: #ffa39e;
      }

      &.ghost-card {
        background-color: #e2e8f0;
        border: 2px dashed #94a3b8;
        opacity: 0.5;
      }

      &.dragging-card {
        box-shadow: 0 20px 40px rgb(0 0 0 / 10%);
        transform: rotate(2deg) scale(1.05);
      }
    }
  }

  .custom-scrollbar {
    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #e2e8f0;
      border-radius: 10px;
    }
  }
}
</style>
