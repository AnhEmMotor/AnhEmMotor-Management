<template>
  <div
    v-loading="loading"
    class="purchasing-pipeline-page flex flex-col gap-6 pb-10 h-screen"
  >
    <div class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-7 gap-4 px-4 pt-4">
      <div
        v-for="stat in pipelineStats"
        :key="stat.label"
        class="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-4"
      >
        <div class="size-10 rounded-xl flex-cc" :class="stat.bg">
          <ArtSvgIcon :icon="stat.icon" class="text-white text-lg" />
        </div>
        <div class="flex flex-col">
          <span
            class="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest"
            >{{ stat.label }}</span
          >
          <div class="flex items-baseline gap-2">
            <span
              class="text-xl font-black text-gray-800 dark:text-slate-100"
              >{{ stat.count }}</span
            >
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
          <ElOption
            v-for="vehicle in vehicleOptions"
            :key="vehicle"
            :label="vehicle"
            :value="vehicle"
          />
        </ElSelect>
      </div>
      <div
        class="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase"
      >
        <div class="size-2 rounded-full bg-emerald-500"></div>
        Dữ liệu Lead Pipeline
      </div>
    </div>

    <div class="flex-1 overflow-x-auto px-4 pb-4">
      <div class="flex gap-5 h-full min-w-max">
        <div
          v-for="column in boardColumns"
          :key="column.id"
          class="kanban-column flex flex-col w-[320px] bg-gray-100/50 dark:bg-slate-900/50 rounded-3xl border border-gray-100 dark:border-slate-800 p-3"
        >
          <div class="flex items-center justify-between px-3 py-4">
            <div class="flex items-center gap-2">
              <div
                class="size-2 rounded-full"
                :style="{ backgroundColor: column.color }"
              ></div>
              <h4
                class="m-0 text-xs font-black text-gray-700 dark:text-slate-200 uppercase tracking-wider"
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
              class="deal-card bg-white dark:bg-slate-850 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-800 transition-all cursor-grab active:cursor-grabbing relative group"
              :class="{ 'is-stale': isStale(deal) }"
            >
              <div
                class="absolute top-0 left-4 w-6 h-1 rounded-b-full"
                :class="
                  deal.priority === 'Urgent' ? 'bg-red-500' : 'bg-orange-400'
                "
              ></div>

              <div class="flex justify-between items-start mb-3 mt-1">
                <div class="flex flex-col min-w-0">
                  <span
                    class="text-sm font-black text-gray-800 dark:text-slate-100 line-clamp-1"
                    >{{ deal.customerName }}</span
                  >
                  <span
                    class="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase line-clamp-1"
                    >{{ deal.vehicle }}</span
                  >
                </div>
                <div class="flex gap-1">
                  <ElTooltip content="Ghi nhận chat/tư vấn">
                    <button
                      class="size-7 bg-blue-50 dark:bg-blue-950/30 text-blue-500 rounded-lg flex-cc hover:bg-blue-500 hover:text-white transition-all cursor-pointer"
                      type="button"
                      @click.stop="addActivity(deal, 'Chat')"
                    >
                      <ArtSvgIcon icon="ri:chat-1-fill" class="text-xs" />
                    </button>
                  </ElTooltip>
                  <ElTooltip content="Ghi nhận cuộc gọi">
                    <button
                      class="size-7 bg-green-50 dark:bg-green-950/30 text-green-500 rounded-lg flex-cc hover:bg-green-500 hover:text-white transition-all cursor-pointer"
                      type="button"
                      @click.stop="addActivity(deal, 'Call')"
                    >
                      <ArtSvgIcon icon="ri:phone-fill" class="text-xs" />
                    </button>
                  </ElTooltip>
                </div>
              </div>

              <div
                class="flex justify-between items-end mt-4 pt-3 border-t border-gray-50 dark:border-slate-800"
              >
                <div class="flex items-center gap-1.5">
                  <ArtSvgIcon icon="ri:history-line" class="text-gray-300" />
                  <span
                    class="text-[10px] font-bold text-gray-400 dark:text-slate-500"
                    :class="{ 'text-red-500': isStale(deal) }"
                  >
                    {{ deal.timeInStage }}
                  </span>
                </div>
                <div class="flex -space-x-2">
                  <ElTooltip :content="deal.saleName">
                    <ElAvatar
                      :size="20"
                      class="border border-white dark:border-slate-800 bg-gray-200 dark:bg-slate-700 text-[8px] font-black text-gray-600 dark:text-slate-200"
                    >
                      {{ deal.saleName.charAt(0) }}
                    </ElAvatar>
                  </ElTooltip>
                </div>
              </div>
            </div>
          </VueDraggable>

          <ElEmpty
            v-if="!column.items.length"
            description="Chưa có khách hàng"
            :image-size="80"
            class="py-10"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import { ElMessage } from "element-plus";
import {
  fetchAddLeadActivity,
  fetchGetLeadPipeline,
  fetchUpdateLead,
  Lead,
  LeadPipelineGroup,
} from "@/api/customer";

defineOptions({ name: "PurchasingPipeline" });

type Deal = {
  id: number;
  customerName: string;
  vehicle: string;
  priority: "Normal" | "High" | "Urgent";
  timeInStage: string;
  saleName: string;
  saleId: string;
  raw: Lead;
};

type BoardColumn = {
  id: string;
  title: string;
  color: string;
  icon: string;
  bg: string;
  items: Deal[];
};

const stageMeta: Record<string, Omit<BoardColumn, "items">> = {
  New: {
    id: "New",
    title: "Mới",
    color: "#64748b",
    icon: "ri:user-add-line",
    bg: "bg-slate-500",
  },
  Consulting: {
    id: "Consulting",
    title: "Đang tư vấn",
    color: "#3b82f6",
    icon: "ri:customer-service-2-line",
    bg: "bg-blue-600",
  },
  TestDriving: {
    id: "TestDriving",
    title: "Đang lái thử",
    color: "#6366f1",
    icon: "ri:steering-2-line",
    bg: "bg-indigo-500",
  },
  Deposited: {
    id: "Deposited",
    title: "Đã đặt cọc",
    color: "#f97316",
    icon: "ri:money-dollar-circle-line",
    bg: "bg-orange-500",
  },
  Paperwork: {
    id: "Paperwork",
    title: "Chờ giấy tờ",
    color: "#a855f7",
    icon: "ri:file-list-3-line",
    bg: "bg-purple-500",
  },
  Delivered: {
    id: "Delivered",
    title: "Đã giao xe",
    color: "#10b981",
    icon: "ri:checkbox-circle-line",
    bg: "bg-emerald-500",
  },
};

const stageOrder = Object.keys(stageMeta);
const loading = ref(false);
const filterSale = ref("");
const filterVehicle = ref("");
const pipelineGroups = ref<LeadPipelineGroup[]>([]);
const boardColumns = ref<BoardColumn[]>(createEmptyColumns());

const pipelineStats = computed(() => {
  const total = boardColumns.value.reduce(
    (sum, column) => sum + column.items.length,
    0,
  );

  return [
    {
      label: "Tổng Deal",
      count: total,
      icon: "ri:exchange-funds-line",
      bg: "bg-blue-600",
      value: "",
    },
    ...boardColumns.value.map((column) => ({
      label: column.title,
      count: column.items.length,
      icon: column.icon,
      bg: column.bg,
      value: "",
    })),
  ];
});

const salesList = computed(() => {
  const sales = new Map<string, string>();
  pipelineGroups.value
    .flatMap((group) => group.leads ?? [])
    .forEach((lead) => {
      const id = lead.assignedToId ?? "";
      if (id) {
        sales.set(id, `Nhân viên ${id.slice(0, 8)}`);
      }
    });

  return [...sales.entries()].map(([id, name]) => ({ id, name }));
});

const vehicleOptions = computed(() => {
  const names = pipelineGroups.value
    .flatMap((group) => group.leads ?? [])
    .map((lead) => lead.interestedVehicle)
    .filter(Boolean);

  return [...new Set(names)];
});

watch([filterSale, filterVehicle, pipelineGroups], rebuildBoardColumns, {
  deep: true,
});

onMounted(() => {
  fetchPipeline();
});

async function fetchPipeline() {
  loading.value = true;
  try {
    pipelineGroups.value = await fetchGetLeadPipeline();
    rebuildBoardColumns();
  } catch (err: any) {
    ElMessage.error(err.message || "Lỗi khi tải phễu mua hàng");
  } finally {
    loading.value = false;
  }
}

function createEmptyColumns(): BoardColumn[] {
  return stageOrder.map((stage) => ({
    ...stageMeta[stage],
    items: [],
  }));
}

function rebuildBoardColumns() {
  const columns = createEmptyColumns();

  pipelineGroups.value.forEach((group) => {
    const target = columns.find((column) => column.id === group.status);
    if (!target) return;

    target.title = group.statusDisplayName || target.title;
    target.items = (group.leads ?? [])
      .filter(matchesFilters)
      .map((lead) => mapLeadToDeal(lead));
  });

  boardColumns.value = columns;
}

function matchesFilters(lead: Lead) {
  const saleMatches =
    !filterSale.value || lead.assignedToId === filterSale.value;
  const vehicleMatches =
    !filterVehicle.value || lead.interestedVehicle === filterVehicle.value;

  return saleMatches && vehicleMatches;
}

function mapLeadToDeal(lead: Lead): Deal {
  return {
    id: lead.id,
    customerName: lead.fullName || "Khách hàng chưa đặt tên",
    vehicle: lead.interestedVehicle || "Chưa chọn xe",
    priority: getPriority(lead),
    timeInStage: formatTimeInStage(lead.createdAt),
    saleName: lead.assignedToId
      ? `NV ${lead.assignedToId.slice(0, 8)}`
      : "Chưa giao",
    saleId: lead.assignedToId ?? "",
    raw: lead,
  };
}

function getPriority(lead: Lead): Deal["priority"] {
  if (lead.score >= 80 || lead.status === "Deposited") return "Urgent";
  if (lead.score >= 40 || Boolean(lead.interestedVehicle)) return "High";
  return "Normal";
}

function formatTimeInStage(dateStr?: string) {
  if (!dateStr) return "Chưa rõ";

  const created = new Date(dateStr);
  if (Number.isNaN(created.getTime())) return "Chưa rõ";

  const diffMs = new Date().getTime() - created.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Vừa tạo";
  if (diffHours < 24) return `${diffHours} giờ`;
  return `${Math.floor(diffHours / 24)} ngày`;
}

const isStale = (deal: Deal) => {
  return deal.timeInStage.includes("ngày") && parseInt(deal.timeInStage) >= 3;
};

async function handleDragChange(event: any, columnId: string) {
  if (!event.added) return;

  const deal = event.added.element as Deal;
  const previousStatus = deal.raw.status;
  deal.raw.status = columnId;

  try {
    await fetchUpdateLead(deal.id, {
      ...deal.raw,
      status: columnId,
      birthday: deal.raw.birthday || null,
    });

    ElMessage.success(
      `Đã chuyển ${deal.customerName} sang giai đoạn ${getStageName(columnId)}`,
    );
    await fetchPipeline();
  } catch (err: any) {
    deal.raw.status = previousStatus;
    ElMessage.error(err.message || "Lỗi khi cập nhật trạng thái");
    await fetchPipeline();
  }
}

async function addActivity(deal: Deal, activityType: "Chat" | "Call") {
  try {
    const actionLabel = activityType === "Call" ? "cuộc gọi" : "tư vấn chat";
    await fetchAddLeadActivity(deal.id, {
      activityType,
      description: `Ghi nhận ${actionLabel} từ màn hình phễu mua hàng`,
    });
    ElMessage.success(`Đã ghi nhận ${actionLabel}`);
    await fetchPipeline();
  } catch (err: any) {
    ElMessage.error(err.message || "Lỗi khi ghi nhận hoạt động");
  }
}

const getStageName = (id: string) => {
  const col = boardColumns.value.find((c) => c.id === id);
  return col ? col.title : id;
};
</script>

<style lang="scss" scoped>
.purchasing-pipeline-page {
  background-color: transparent;

  .premium-select {
    :deep(.el-input__wrapper) {
      background-color: var(--el-fill-color-blank);
      border: 1px solid var(--el-border-color-light);
      border-radius: 12px;
      box-shadow: none;
    }
  }

  .kanban-column {
    .deal-card {
      &.is-stale {
        background-color: var(--el-color-danger-light-9);
        border-color: var(--el-color-danger-light-7);
      }

      &.ghost-card {
        background-color: var(--el-fill-color-light);
        border: 2px dashed var(--el-border-color);
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
      background: var(--el-border-color-light);
      border-radius: 10px;
    }
  }
}
</style>
