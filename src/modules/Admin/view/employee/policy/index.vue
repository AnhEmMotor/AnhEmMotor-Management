<template>
  <div class="resp-page hr-policy-container flex flex-col gap-4 h-full p-4">
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
        class="resp-cards-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
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
              Hiệu lực từ: <br />
              📅 {{ formatDate(policy.startDate) }}
            </span>
          </div>

          <div
            class="mb-4 rounded-lg border border-red-100 bg-red-50/70 p-3 dark:border-red-900/60 dark:bg-red-950/20"
            data-testid="policy-commission-value"
          >
            <template v-if="policy.department === 'mechanic'">
              <div
                class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
              >
                Mức hoa hồng kỹ thuật viên
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div
                  class="rounded-md bg-white/80 px-2 py-2 dark:bg-gray-900/70"
                >
                  <span
                    class="block text-[11px] text-gray-500 dark:text-gray-400"
                    >Tiền công</span
                  >
                  <strong class="text-base text-red-600 dark:text-red-400">
                    {{ formatPercentage(policy.laborPercentage) }}
                  </strong>
                </div>
                <div
                  class="rounded-md bg-white/80 px-2 py-2 dark:bg-gray-900/70"
                >
                  <span
                    class="block text-[11px] text-gray-500 dark:text-gray-400"
                    >Phụ tùng</span
                  >
                  <strong class="text-base text-red-600 dark:text-red-400">
                    {{ formatPercentage(policy.partsPercentage) }}
                  </strong>
                </div>
              </div>
            </template>

            <template v-else-if="policy.department === 'parts_sales'">
              <div class="flex items-end justify-between gap-3">
                <span
                  class="text-xs font-semibold text-gray-600 dark:text-gray-300"
                >
                  Phụ tùng / phụ kiện
                </span>
                <strong class="text-xl text-red-600 dark:text-red-400">
                  {{ formatPercentage(policy.value) }}
                </strong>
              </div>
              <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Tính trên
                {{ policy.basis === "profit" ? "lợi nhuận gộp" : "doanh thu" }}
              </div>
            </template>

            <template v-else>
              <div class="flex items-end justify-between gap-3">
                <span
                  class="text-xs font-semibold text-gray-600 dark:text-gray-300"
                >
                  Mức hoa hồng
                </span>
                <strong class="text-lg text-red-600 dark:text-red-400">
                  {{ formatPolicyValue(policy) }}
                </strong>
              </div>
            </template>
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
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Plus, Right } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import {
  commissionPolicyApi,
  type CommissionPolicyResponse,
} from "@/api/operations/commission-policy.api";

defineOptions({ name: "HRCommissionPolicy" });

type DepartmentKey = "vehicle_sales" | "parts_sales" | "mechanic";

interface PolicyUiConfiguration {
  department?: DepartmentKey;
  basis?: string;
  laborPercentage?: number;
  partsPercentage?: number;
}

interface PolicyValueFields {
  type: string;
  value: number;
  unit?: string;
}

const POLICY_UI_CONFIG_PREFIX = "AEM_POLICY_UI_V1:";

const router = useRouter();
const loading = ref(false);
const allPolicies = ref<any[]>([]);
const activeTab = ref("vehicle_sales");

const filteredPolicies = computed(() => {
  return allPolicies.value.filter((p) => p.department === activeTab.value);
});

const formatDate = (dateStr: string) => {
  if (!dateStr) return "---";
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatPercentage = (value?: number) => {
  const numericValue = Number(value);
  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
  return `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 2,
  }).format(safeValue)}%`;
};

const formatPolicyValue = (policy: PolicyValueFields) => {
  if (policy.type === "Percentage") {
    return formatPercentage(policy.value);
  }

  const amount = Number(policy.value);
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const unit = policy.unit?.trim();
  return `${new Intl.NumberFormat("vi-VN").format(safeAmount)} ₫${
    unit ? ` / ${unit}` : ""
  }`;
};

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

const parsePolicyUiConfiguration = (notes?: string): PolicyUiConfiguration => {
  if (!notes?.startsWith(POLICY_UI_CONFIG_PREFIX)) return {};

  try {
    const parsed: unknown = JSON.parse(
      notes.slice(POLICY_UI_CONFIG_PREFIX.length),
    );
    return parsed && typeof parsed === "object"
      ? (parsed as PolicyUiConfiguration)
      : {};
  } catch {
    return {};
  }
};

const getDepartmentTargetLabel = (department: DepartmentKey) => {
  if (department === "mechanic") return "Kỹ thuật viên xưởng";
  if (department === "parts_sales") return "Sale phụ tùng / phụ kiện";
  return "Sale xe máy";
};

const mapBackendPolicy = (p: CommissionPolicyResponse) => {
  const uiConfiguration = parsePolicyUiConfiguration(p.notes);
  const target = p.targetGroup || "";
  const dept: DepartmentKey =
    uiConfiguration.department ||
    (target.includes("Kỹ thuật") || target === "Mechanic"
      ? "mechanic"
      : target.includes("Phụ tùng") ||
          target === "PartsSales" ||
          p.type === "Percentage"
        ? "parts_sales"
        : "vehicle_sales");
  return {
    id: p.id,
    name: p.name,
    department: dept,
    status: p.isActive ? "active" : "expired",
    productId: p.productId ?? null,
    categoryId: p.categoryId ?? null,
    startDate: p.effectiveDate?.split("T")[0] || "",
    target: getDepartmentTargetLabel(dept),
    type: p.type,
    value: Number(p.value) || 0,
    unit: p.unit,
    basis: uiConfiguration.basis || "revenue",
    laborPercentage:
      uiConfiguration.laborPercentage ??
      (dept === "mechanic" ? Number(p.value) || 0 : 0),
    partsPercentage: uiConfiguration.partsPercentage ?? 0,
  };
};

const loadPolicies = async () => {
  loading.value = true;
  try {
    const res = await commissionPolicyApi.getAll();
    allPolicies.value = (res || []).map(mapBackendPolicy);
  } catch (error) {
    console.error("Failed to load policies:", error);
    ElMessage.error("Không thể tải danh sách chính sách");
  } finally {
    loading.value = false;
  }
};

const handleReset = () => {
  // pagination.current = 1;
  // loadData();
};
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

onMounted(() => {
  loadPolicies();
});
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
