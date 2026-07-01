<template>
  <div class="purchasing-pipeline-page flex flex-col gap-6 pb-10 h-screen">
    <div class="grid grid-cols-5 gap-4 px-4 pt-4">
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
                <div class="flex flex-col">
                  <span
                    class="text-sm font-black text-gray-800 dark:text-slate-100 line-clamp-1"
                    >{{ deal.customerName }}</span
                  >
                  <span
                    class="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase"
                    >{{ deal.vehicle }}</span
                  >
                </div>
                <div class="flex gap-1">
                  <div
                    class="size-7 bg-blue-50 dark:bg-blue-950/30 text-blue-500 rounded-lg flex-cc hover:bg-blue-500 hover:text-white transition-all cursor-pointer"
                  >
                    <ArtSvgIcon icon="ri:chat-1-fill" class="text-xs" />
                  </div>
                  <div
                    class="size-7 bg-green-50 dark:bg-green-950/30 text-green-500 rounded-lg flex-cc hover:bg-green-500 hover:text-white transition-all cursor-pointer"
                  >
                    <ArtSvgIcon icon="ri:phone-fill" class="text-xs" />
                  </div>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import { ElMessage } from "element-plus";

defineOptions({ name: "PurchasingPipeline" });

const pipelineStats = ref([
  {
    label: "Tổng Deal",
    count: 42,
    icon: "ri:exchange-funds-line",
    bg: "bg-blue-600",
    value: "+12% mtd",
  },
  {
    label: "Đang tư vấn",
    count: 15,
    icon: "ri:customer-service-2-line",
    bg: "bg-indigo-500",
  },
  {
    label: "Đã đặt cọc",
    count: 8,
    icon: "ri:money-dollar-circle-line",
    bg: "bg-orange-500",
    value: "420tr",
  },
  {
    label: "Chờ biển số",
    count: 12,
    icon: "ri:government-line",
    bg: "bg-purple-500",
  },
  {
    label: "Đã giao xe",
    count: 7,
    icon: "ri:checkbox-circle-line",
    bg: "bg-emerald-500",
    value: "Goal 85%",
  },
]);

const filterSale = ref("");
const filterVehicle = ref("");
const salesList = [
  { id: 1, name: "Sale Nguyễn Văn A" },
  { id: 2, name: "Sale Trần Thị B" },
];

const boardColumns = ref([
  {
    id: "Consulting",
    title: "Đang tư vấn",
    color: "#3b82f6",
    items: [
      {
        id: 101,
        customerName: "Nguyễn Hoàng Long",
        vehicle: "Winner X 2024",
        priority: "High",
        timeInStage: "2 ngày",
        saleName: "Admin",
      },
      {
        id: 102,
        customerName: "Trần Minh Tâm",
        vehicle: "SH 125i",
        priority: "Urgent",
        timeInStage: "5 giờ",
        saleName: "Sale A",
      },
    ],
  },
  {
    id: "TestDrive",
    title: "Đang lái thử",
    color: "#6366f1",
    items: [
      {
        id: 103,
        customerName: "Lê Văn Tám",
        vehicle: "Air Blade 160",
        priority: "High",
        timeInStage: "3 ngày",
        saleName: "Sale B",
      },
    ],
  },
  {
    id: "Deposit",
    title: "Đã đặt cọc",
    color: "#f97316",
    items: [
      {
        id: 104,
        customerName: "Phạm Thị Nở",
        vehicle: "Vision 2024",
        priority: "Urgent",
        timeInStage: "1 ngày",
        saleName: "Admin",
      },
    ],
  },
  {
    id: "Processing",
    title: "Chờ giấy tờ",
    color: "#a855f7",
    items: [
      {
        id: 105,
        customerName: "Hoàng Xuân Vinh",
        vehicle: "Winner X",
        priority: "High",
        timeInStage: "4 ngày",
        saleName: "Sale A",
      },
    ],
  },
  {
    id: "Delivered",
    title: "Đã giao xe",
    color: "#10b981",
    items: [
      {
        id: 106,
        customerName: "Bùi Tiến Dũng",
        vehicle: "SH Mode",
        priority: "High",
        timeInStage: "Vừa chốt",
        saleName: "Sale B",
      },
    ],
  },
]);

const isStale = (deal: any) => {
  return deal.timeInStage.includes("ngày") && parseInt(deal.timeInStage) >= 3;
};

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
