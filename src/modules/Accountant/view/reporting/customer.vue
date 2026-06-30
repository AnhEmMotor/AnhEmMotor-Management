<template>
  <div class="reporting-page">
    <ReportPageHeader
      title="Báo Cáo Khách Hàng"
      description="Theo dõi lead, tỷ lệ chuyển đổi, đánh giá, khiếu nại và thời gian phản hồi CSKH."
      icon="ri:user-heart-line"
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

    <el-tabs
      v-model="activeTab"
      class="customer-tabs"
      @tab-change="onTabChange"
    >
      <el-tab-pane label="Phân tích khách hàng" name="analytics">
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
                <ElTag size="small" effect="light" round>{{
                  row.source
                }}</ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="leadScore" label="Lead Score" width="120">
              <template #default="{ row }">
                <span :class="scoreClass(row.leadScore)">{{
                  row.leadScore
                }}</span>
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
            <ElTableColumn
              prop="lastContact"
              label="Liên hệ gần nhất"
              width="160"
            >
              <template #default="{ row }">{{
                formatDate(row.lastContact)
              }}</template>
            </ElTableColumn>
          </ElTable>
        </ElCard>
      </el-tab-pane>

      <el-tab-pane label="Chăm sóc khách hàng" name="service">
        <div class="reporting-kpi-grid">
          <ArtStatsCard
            title="Đánh giá trung bình"
            :count="`${kpi.avgRating}/5`"
            description="Điểm hài lòng khách hàng"
            icon="ri:star-smile-line"
            icon-style="bg-report-red"
          />
          <ArtStatsCard
            title="Khiếu nại mới"
            :count="kpi.newComplaints"
            description="Phát sinh trong kỳ"
            icon="ri:error-warning-line"
            icon-style="bg-report-red-dark"
          />
          <ArtStatsCard
            title="Thời gian xử lý TB"
            :count="`${kpi.avgResponseHours}h`"
            description="Trung bình đến khi phản hồi"
            icon="ri:timer-flash-line"
            icon-style="bg-report-red-light"
          />
          <ArtStatsCard
            title="Đã xử lý"
            :count="kpi.resolvedCount"
            description="Khiếu nại đã hoàn tất"
            icon="ri:checkbox-circle-line"
            icon-style="bg-report-gray"
          />
        </div>

        <div class="reporting-section-grid two-columns mt-4">
          <ElCard class="reporting-card">
            <template #header>Phân bổ đánh giá sao</template>
            <ReportPlaceholder
              title="Chờ API CSKH"
              description="Biểu đồ sẽ thể hiện phân bổ đánh giá từ 1 đến 5 sao theo kỳ."
              endpoint="GET /api/v1/Statistics/customer-service-analytics"
            />
          </ElCard>
          <ElCard class="reporting-card">
            <template #header>Xu hướng khiếu nại</template>
            <ReportPlaceholder
              title="Chờ dữ liệu khiếu nại"
              description="Biểu đồ sẽ theo dõi số khiếu nại mới, đang xử lý và đã hoàn tất."
            />
          </ElCard>
        </div>

        <ElCard class="reporting-card mt-4">
          <template #header>Khiếu nại gần đây</template>
          <ElTable
            :data="complaints"
            class="reporting-table"
            v-loading="loading"
            empty-text="Không có khiếu nại nào"
          >
            <ElTableColumn prop="ticketCode" label="Mã phiếu" width="140" />
            <ElTableColumn prop="customerName" label="Khách hàng" />
            <ElTableColumn prop="subject" label="Tiêu đề" />
            <ElTableColumn prop="rating" label="Đánh giá" width="120">
              <template #default="{ row }">
                <span class="text-yellow-500"
                  >{{ "⭐".repeat(row.rating)
                  }}{{ "☆".repeat(5 - row.rating) }}</span
                >
              </template>
            </ElTableColumn>
            <ElTableColumn prop="status" label="Trạng thái" width="140">
              <template #default="{ row }">
                <ElTag
                  :type="complaintStatusType(row.status)"
                  size="small"
                  effect="light"
                  round
                  >{{ row.status }}</ElTag
                >
              </template>
            </ElTableColumn>
            <ElTableColumn prop="createdAt" label="Ngày tạo" width="120">
              <template #default="{ row }">{{
                formatDate(row.createdAt)
              }}</template>
            </ElTableColumn>
            <ElTableColumn
              prop="responseHours"
              label="Thời gian phản hồi"
              width="170"
            >
              <template #default="{ row }">{{
                row.responseHours ? row.responseHours + "h" : "-"
              }}</template>
            </ElTableColumn>
          </ElTable>
        </ElCard>

        <ElCard class="reporting-card mt-4">
          <template #header>Ghi chú nội bộ chỉ dành cho CSKH/Admin</template>
          <ReportPlaceholder
            title="Chờ API ghi chú nội bộ"
            description="Khu vực này sẽ ghi nhận đặc điểm, thói quen và lưu ý chăm sóc của từng khách hàng."
            endpoint="Backend API cho ghi chú đặc điểm và thói quen khách hàng"
            icon="ri:lock-line"
          />
        </ElCard>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { statisticsApi } from "@/api/operations";
import ArtStatsCard from "@/components/core/cards/art-stats-card/index.vue";
import ReportPageHeader from "./ReportPageHeader.vue";
import ReportPeriodSwitcher from "./ReportPeriodSwitcher.vue";
import ReportPlaceholder from "./ReportPlaceholder.vue";

const activeTab = ref("analytics");
const currentPeriod = ref<"today" | "month" | "year" | "custom">("month");
const periodStart = ref("");
const periodEnd = ref("");

const loading = ref(false);
const kpi = ref({
  totalLeads: 0,
  newCustomers: 0,
  hotLeads: 0,
  avgRating: 0,
  newComplaints: 0,
  avgResponseHours: 0,
  resolvedCount: 0,
});
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
const complaints = ref<
  Array<{
    id: number;
    ticketCode: string;
    customerName: string;
    subject: string;
    rating: number;
    status: string;
    createdAt: string;
    responseHours?: number;
  }>
>([]);

const conversionRate = computed(() => {
  if (!kpi.value.totalLeads) return "0";
  return ((kpi.value.newCustomers / kpi.value.totalLeads) * 100).toFixed(1);
});

function onPeriodChange() {
  loadData();
}

function onTabChange() {
  loadData();
}

async function loadData() {
  loading.value = true;
  try {
    if (activeTab.value === "analytics") {
      const data = await statisticsApi.getCustomerAnalytics();
      kpi.value.totalLeads = data.kpi.totalLeads;
      kpi.value.newCustomers = data.kpi.newCustomers;
      kpi.value.hotLeads = data.kpi.hotLeads;
      leads.value = data.leads;
    } else {
      const data = await statisticsApi.getCustomerServiceAnalytics();
      kpi.value.avgRating = data.kpi.avgRating;
      kpi.value.newComplaints = data.kpi.newComplaints;
      kpi.value.avgResponseHours = data.kpi.avgResponseHours;
      kpi.value.resolvedCount = data.kpi.resolvedCount;
      complaints.value = data.complaints;
    }
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

function complaintStatusType(
  status: string,
): "primary" | "success" | "info" | "danger" | "warning" {
  const map: Record<
    string,
    "primary" | "success" | "info" | "danger" | "warning"
  > = {
    Mới: "danger",
    "Đang xử lý": "warning",
    "Đã phản hồi": "primary",
    "Đã đóng": "success",
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

<style scoped>
.customer-tabs :deep(.el-tabs__content) {
  padding: 0;
}
</style>
