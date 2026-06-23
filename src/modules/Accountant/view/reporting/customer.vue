<template>
  <div class="reporting-page">
    <ReportPageHeader
      title="Báo cáo khách hàng"
      description="Theo dõi nguồn lead, tỷ lệ chuyển đổi, khách hàng mới và danh sách lead cần ưu tiên."
      icon="ri:user-search-line"
    >
      <template #actions>
        <ReportPeriodSwitcher
          v-model="currentPeriod"
          v-model:start-date="periodStart"
          v-model:end-date="periodEnd"
          @update:modelValue="onPeriodChange"
        />
      </template>
    </ReportPageHeader>

    <div class="reporting-kpi-grid">
      <ArtStatsCard
        title="Tổng lead mới"
        :count="kpi.totalLeads"
        description="Lead phát sinh trong kỳ"
        icon="ri:user-add-line"
        icon-style="bg-report-red"
      />
      <ArtStatsCard
        title="Tỷ lệ chuyển đổi"
        :count="`${conversionRate}%`"
        description="Lead chuyển thành khách hàng"
        icon="ri:exchange-funds-line"
        icon-style="bg-report-red-light"
      />
      <ArtStatsCard
        title="Khách hàng mới"
        :count="kpi.newCustomers"
        description="Khách hàng được tạo mới"
        icon="ri:user-heart-line"
        icon-style="bg-report-red-dark"
      />
      <ArtStatsCard
        title="Lead nóng"
        :count="kpi.hotLeads"
        description="Lead có điểm ưu tiên cao"
        icon="ri:fire-line"
        icon-style="bg-report-gray"
      />
    </div>

    <div class="reporting-section-grid two-columns mt-4">
      <ElCard class="reporting-card">
        <template #header>Phễu chuyển đổi theo kênh</template>
        <ReportPlaceholder
          title="Chờ API phân tích khách hàng"
          description="Biểu đồ sẽ thể hiện lead theo từng kênh và tỷ lệ chuyển đổi tương ứng."
          endpoint="GET /api/v1/Statistics/customer-analytics"
        />
      </ElCard>
      <ElCard class="reporting-card">
        <template #header>Phân bổ nguồn khách hàng</template>
        <ReportPlaceholder
          title="Chờ dữ liệu nguồn khách hàng"
          description="Hiển thị tỷ trọng lead đến từ website, mạng xã hội, showroom và các nguồn khác."
        />
      </ElCard>
    </div>

    <ElCard class="reporting-card mt-4">
      <template #header>Phân bổ điểm lead</template>
      <ReportPlaceholder
        title="Chờ dữ liệu điểm lead"
        description="Biểu đồ sẽ nhóm lead theo mức ưu tiên để đội bán hàng xử lý theo thứ tự phù hợp."
      />
    </ElCard>

    <ElCard class="reporting-card mt-4">
      <template #header>Danh sách lead ưu tiên</template>
      <ElTable
        :data="leads"
        class="reporting-table"
        v-loading="loading"
        empty-text="Chưa có dữ liệu lead"
      >
        <ElTableColumn prop="customerName" label="Khách hàng" />
        <ElTableColumn prop="source" label="Nguồn" width="140">
          <template #default="{ row }">
            <ElTag size="small" effect="light" round>{{ row.source }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="leadScore" label="Lead Score" width="120">
          <template #default="{ row }">
            <span :class="scoreClass(row.leadScore)">{{ row.leadScore }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="status" label="Trạng thái" width="140">
          <template #default="{ row }">
            <ElTag
              :type="leadStatusType(row.status)"
              size="small"
              effect="light"
              round
              >{{ row.status }}</ElTag
            >
          </template>
        </ElTableColumn>
        <ElTableColumn prop="lastContact" label="Liên hệ gần nhất" width="160">
          <template #default="{ row }">{{
            formatDate(row.lastContact)
          }}</template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { statisticsApi } from "@/api/statistics.api";
import ArtStatsCard from "@/components/core/cards/art-stats-card/index.vue";
import ReportPageHeader from "./ReportPageHeader.vue";
import ReportPeriodSwitcher from "./ReportPeriodSwitcher.vue";
import ReportPlaceholder from "./ReportPlaceholder.vue";

const currentPeriod = ref<"today" | "month" | "year" | "custom">("month");
const periodStart = ref("");
const periodEnd = ref("");

const loading = ref(false);
const kpi = ref({ totalLeads: 0, newCustomers: 0, hotLeads: 0 });
const leads = ref<
  Array<{
    id: number;
    customerName: string;
    source: string;
    leadScore: number;
    status: string;
    lastContact: string;
  }>
>([]);

const conversionRate = computed(() => {
  if (!kpi.value.totalLeads) return "0";
  return ((kpi.value.newCustomers / kpi.value.totalLeads) * 100).toFixed(1);
});

function onPeriodChange() {
  // TODO: Pass period params to API when backend supports it
  // Expected: GET /api/v1/Statistics/customer-analytics?period=...&start=...&end=...
  loadData();
}

async function loadData() {
  loading.value = true;
  try {
    const data = await statisticsApi.getCustomerAnalytics();
    kpi.value = data.kpi;
    leads.value = data.leads;
  } finally {
    loading.value = false;
  }
}

function scoreClass(score: number) {
  if (score >= 80) return "text-green-600 font-bold";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-yellow-600";
  return "text-gray-400";
}

function leadStatusType(
  status: string,
): "primary" | "success" | "info" | "danger" | "warning" {
  const map: Record<
    string,
    "primary" | "success" | "info" | "danger" | "warning"
  > = {
    Mới: "info",
    "Đang theo dõi": "primary",
    "Đã chuyển đổi": "success",
    "Không quan tâm": "danger",
  };
  return map[status] || "info";
}

function formatDate(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("vi-VN");
}

onMounted(() => {
  loadData();
});
</script>
