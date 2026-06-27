<template>
  <div class="hr-policy-container flex flex-col gap-4 h-full p-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1
        class="text-2xl font-bold uppercase text-gray-800 dark:text-gray-100 flex items-center gap-2"
      >
        Cấu hình chính sách hoa hồng
      </h1>
      <ElButton type="primary" @click="handleCreateNew">
        <ElIcon class="mr-1"><Plus /></ElIcon> Tạo chính sách mới
      </ElButton>
    </div>

    <!-- Department Tabs -->
    <ElTabs v-model="activeTab" class="department-tabs">
      <ElTabPane name="vehicle_sales">
        <template #label>
          <span class="flex items-center gap-2 text-base font-bold">
            🏍️ SALE XE MÁY
          </span>
        </template>
      </ElTabPane>
      <ElTabPane name="parts_sales">
        <template #label>
          <span class="flex items-center gap-2 text-base font-bold">
            ⚙️ SALE PHỤ TÙNG/ONLINE
          </span>
        </template>
      </ElTabPane>
      <ElTabPane name="mechanic">
        <template #label>
          <span class="flex items-center gap-2 text-base font-bold">
            🛠️ KỸ THUẬT VIÊN XƯỞNG
          </span>
        </template>
      </ElTabPane>
    </ElTabs>

    <!-- FULL WIDTH: Policy List Grid -->
    <div class="list-container flex-1 overflow-y-auto">
      <div class="flex items-center justify-between mb-4">
        <span class="font-bold text-gray-800 dark:text-gray-200">
          📋 Danh sách chính sách đang chạy ({{ filteredPolicies.length }})
        </span>
      </div>

      <div
        v-if="filteredPolicies.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div
          v-for="policy in filteredPolicies"
          :key="policy.id"
          class="policy-item p-5 rounded-xl cursor-pointer border-2 transition-all relative overflow-hidden flex flex-col h-full bg-white dark:bg-gray-900 shadow-sm"
          :class="[getPolicyItemClass(policy)]"
          @click="selectPolicy(policy)"
        >
          <!-- Status Ribbon -->
          <div
            class="absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-lg"
            :class="getStatusRibbonClass(policy.status)"
          >
            {{ getStatusLabel(policy.status) }}
          </div>

          <h3
            class="font-bold text-lg mb-2 pr-28 text-gray-800 dark:text-gray-100"
          >
            {{ policy.name }}
          </h3>
          <div class="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1">
            <span class="block mb-1"
              >Đối tượng: <strong>{{ policy.target }}</strong></span
            >
            <span class="block mt-2">
              Hiệu lực: <br />
              📅 {{ formatDate(policy.startDate) }} -
              {{ formatDate(policy.endDate) }}
            </span>
          </div>

          <div
            class="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center"
          >
            <span class="text-xs font-medium text-gray-500"
              >Bấm để xem chi tiết</span
            >
            <ElIcon class="text-gray-400"><Right /></ElIcon>
          </div>
        </div>
      </div>
      <ElEmpty v-else description="Không có chính sách nào" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Plus, Right } from "@element-plus/icons-vue";

defineOptions({ name: "HRCommissionPolicy" });

const router = useRouter();

// Mock Data
const allPolicies = ref([
  {
    id: 1,
    name: "Thưởng nóng Winner X - T6/2026",
    department: "vehicle_sales",
    status: "active",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    target: "Toàn bộ Sale xe",
    tiers: [
      { from: 1, to: 5, bonus: 500000 },
      { from: 6, to: 999, bonus: 900000 },
    ],
  },
  {
    id: 2,
    name: "Cơ bản dòng xe Honda SH",
    department: "vehicle_sales",
    status: "active",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    target: "Toàn bộ Sale xe",
    tiers: [{ from: 1, to: 999, bonus: 1200000 }],
  },
  {
    id: 3,
    name: "Chiến dịch xe ga mùa Hè",
    department: "vehicle_sales",
    status: "pending",
    startDate: "2026-07-01",
    endDate: "2026-07-31",
    target: "Toàn bộ Sale xe",
    tiers: [
      { from: 1, to: 3, bonus: 300000 },
      { from: 4, to: 999, bonus: 600000 },
    ],
  },
  {
    id: 4,
    name: "Chính sách tháng Tết 2026",
    department: "vehicle_sales",
    status: "expired",
    startDate: "2026-01-01",
    endDate: "2026-02-28",
    target: "Toàn bộ Sale xe",
    tiers: [{ from: 1, to: 999, bonus: 1000000 }],
  },
  {
    id: 5,
    name: "Hoa hồng phụ tùng chung",
    department: "parts_sales",
    status: "active",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    target: "Sale Phụ tùng / Online",
    percentage: 5,
    basis: "revenue",
  },
  {
    id: 6,
    name: "Hoa hồng kỹ thuật viên",
    department: "mechanic",
    status: "active",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    target: "Kỹ thuật viên xưởng",
    laborPercentage: 15,
    partsPercentage: 2,
  },
]);

const activeTab = ref("vehicle_sales");

const filteredPolicies = computed(() => {
  return allPolicies.value.filter((p) => p.department === activeTab.value);
});

// Formatting Utils
const formatDate = (dateStr: string) => {
  if (!dateStr) return "---";
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Styles & Labels
const getStatusRibbonClass = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-500 text-white";
    case "pending":
      return "bg-orange-500 text-white";
    case "expired":
      return "bg-gray-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "active":
      return "🟢 Đang áp dụng";
    case "pending":
      return "🟡 Chờ kích hoạt";
    case "expired":
      return "⚪ Hết hiệu lực";
    default:
      return status;
  }
};

const getPolicyItemClass = (policy: any) => {
  const base =
    "border-gray-200 dark:border-gray-700 hover:border-primary hover:-translate-y-1";
  if (policy.status === "active")
    return `${base} border-green-200 dark:border-green-800`;
  if (policy.status === "pending")
    return `${base} border-orange-200 dark:border-orange-800`;
  return `${base} bg-gray-50 dark:bg-gray-800 opacity-80`;
};

// Actions
const selectPolicy = (policy: any) => {
  router.push({
    name: "HRCommissionPolicyDetail",
    params: { id: policy.id },
    query: { dept: activeTab.value },
  });
};

const handleCreateNew = () => {
  router.push({
    name: "HRCommissionPolicyDetail",
    query: { dept: activeTab.value },
  });
};
</script>

<style scoped lang="scss">
.department-tabs {
  :deep(.el-tabs__item) {
    font-size: 15px;
    padding: 0 20px;
    height: 48px;
    line-height: 48px;
  }
}
</style>
