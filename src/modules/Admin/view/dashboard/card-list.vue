<template>
  <ElRow :gutter="20" class="flex">
    <ElCol
      v-for="(item, index) in dataList"
      :key="index"
      :sm="12"
      :md="6"
      :lg="6"
    >
      <div
        class="art-card relative flex flex-col justify-center h-35 px-5 mb-5 max-sm:mb-4"
      >
        <span class="text-g-700 text-sm">{{ item.des }}</span>
        <h2 class="text-2xl font-bold text-gray-900 mt-2 mb-1">
          {{ item.num }}
        </h2>
        <div class="flex-c mt-1">
          <span class="text-xs text-g-600">So với tháng trước</span>
          <span
            class="ml-1 text-xs font-semibold"
            :class="[item.change >= 0 ? 'text-success' : 'text-danger']"
          >
            {{ item.change >= 0 ? "+" : "" }}{{ item.change }}%
          </span>
        </div>
        <div
          class="absolute top-0 bottom-0 right-5 m-auto size-12.5 rounded-xl flex-cc bg-theme/10"
        >
          <ArtSvgIcon :icon="item.icon" class="text-xl text-theme" />
        </div>
      </div>
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from "vue";
import { fetchDashboardSummary } from "@/api/dashboard.api";

interface _CardDataItem {
  des: string;
  icon: string;
  num: string;
  change: number;
}

const props = defineProps<{
  timeFilter: string;
  dateRange: [Date, Date] | null;
}>();

const dataList = reactive<_CardDataItem[]>([]);
const isLoading = ref(false);

function formatVnd(value: number): string {
  if (value === 0) return "0đ";
  const formatted = new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(value);
  return `${formatted}đ`;
}

function getDateRange() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let start: Date;
  let end: Date;

  switch (props.timeFilter) {
    case "today":
      start = today;
      end = new Date(today);
      end.setHours(23, 59, 59, 999);
      break;
    case "week": {
      // Lấy thứ 2 của tuần hiện tại
      const day = today.getDay() || 7; // Chủ nhật = 0 -> 7
      start = new Date(today);
      start.setDate(today.getDate() - day + 1);
      start.setHours(0, 0, 0, 0);
      end = new Date(today);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case "month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(today);
      end.setHours(23, 59, 59, 999);
      break;
    case "year":
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(today);
      end.setHours(23, 59, 59, 999);
      break;
    default:
      start = today;
      end = new Date(today);
      end.setHours(23, 59, 59, 999);
  }

  // Nếu có dateRange từ picker, ưu tiên dùng dateRange
  if (props.dateRange && props.dateRange[0] && props.dateRange[1]) {
    start = new Date(props.dateRange[0]);
    start.setHours(0, 0, 0, 0);
    end = new Date(props.dateRange[1]);
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
}

async function fetchData() {
  isLoading.value = true;
  try {
    const { start, end } = getDateRange();
    const data = await fetchDashboardSummary(start, end);

    // Map API data to card items
    dataList.length = 0; // Clear existing
    dataList.push(
      {
        des: "Tổng thu (Đơn hàng)",
        icon: "ri:wallet-3-line",
        num: formatVnd(data.totalRevenue ?? 0),
        change: 0, // TODO: calculate from API if available
      },
      {
        des: "Tổng chi",
        icon: "ri:shopping-cart-2-line",
        num: formatVnd(data.totalExpense ?? 0),
        change: 0,
      },
      {
        des: "Lợi nhuận gộp",
        icon: "ri:funds-line",
        num: formatVnd(data.grossProfit ?? 0),
        change: 0,
      },
      {
        des: "Lợi nhuận ròng",
        icon: "ri:money-dollar-circle-line",
        num: formatVnd(data.netProfit ?? 0),
        change: 0,
      },
    );
  } catch (error) {
    console.error("Failed to fetch dashboard summary:", error);
  } finally {
    isLoading.value = false;
  }
}

watch(
  () => [props.timeFilter, props.dateRange],
  () => {
    fetchData();
  },
  { immediate: true, deep: true },
);
</script>
