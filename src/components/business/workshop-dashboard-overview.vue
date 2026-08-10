<template>
  <main class="resp-page dashboard-workshop" aria-labelledby="workshop-dashboard-title">
    <header class="workshop-header">
      <div class="workshop-header__intro">
        <div class="workshop-header__eyebrow">
          <span class="live-dot" aria-hidden="true"></span>
          Dữ liệu vận hành trực tiếp
        </div>
        <h1 id="workshop-dashboard-title">
          {{ $t('menus.service.workshop.dashboard') }}
        </h1>
        <p>Theo dõi nhịp sửa chữa, việc cần xử lý và hiệu quả dịch vụ trong một màn hình.</p>
      </div>

      <div class="period-panel" aria-label="Bộ lọc thời gian">
        <div class="period-panel__topline">
          <div>
            <span class="period-panel__label">Kỳ báo cáo</span>
            <strong>{{ selectedRangeLabel }}</strong>
          </div>
          <span v-if="lastUpdated" class="last-updated">Cập nhật {{ lastUpdated }}</span>
        </div>

        <div class="period-scroll">
          <ElRadioGroup v-model="cycle" size="default" @change="handleCycleChange">
            <ElRadioButton value="today">Hôm nay</ElRadioButton>
            <ElRadioButton value="this_month">Tháng này</ElRadioButton>
            <ElRadioButton value="this_year">Năm nay</ElRadioButton>
            <ElRadioButton value="custom">Tùy chọn</ElRadioButton>
          </ElRadioGroup>
        </div>

        <div v-if="cycle === 'custom'" class="custom-range">
          <ElDatePicker
            v-model="fromDate"
            type="date"
            placeholder="Từ ngày"
            format="DD/MM/YYYY"
            @change="handleDateChange"
          />
          <ElDatePicker
            v-model="toDate"
            type="date"
            placeholder="Đến ngày"
            format="DD/MM/YYYY"
            @change="handleDateChange"
          />
        </div>

        <div class="period-panel__actions">
          <ElButton :icon="Refresh" type="primary" :loading="loading" @click="refresh">
            Làm mới dữ liệu
          </ElButton>
        </div>
      </div>
    </header>

    <ElAlert
      v-if="loadError"
      class="dashboard-error"
      type="error"
      :closable="false"
      show-icon
      :title="loadError"
    />

    <section v-loading="loading" class="metric-grid" aria-label="Tổng quan vận hành xưởng">
      <article class="metric-card metric-card--accent">
        <div class="metric-card__icon"><Tools /></div>
        <div class="metric-card__body">
          <span>Xe đang xử lý</span>
          <strong>{{ kpi.inProgress }}</strong>
          <small>Đang nằm trong quy trình xưởng</small>
        </div>
      </article>

      <article class="metric-card" :class="{ 'metric-card--danger': alerts.overdue.length > 0 }">
        <div class="metric-card__icon"><WarningFilled /></div>
        <div class="metric-card__body">
          <span>Phiếu quá hạn</span>
          <strong>{{ alerts.overdue.length }}</strong>
          <small>{{
            alerts.overdue.length > 0 ? 'Cần ưu tiên xử lý ngay' : 'Không có phiếu chậm tiến độ'
          }}</small>
        </div>
      </article>

      <article
        class="metric-card"
        :class="{ 'metric-card--warning': alerts.partsShortage.length > 0 }"
      >
        <div class="metric-card__icon"><Box /></div>
        <div class="metric-card__body">
          <span>Thiếu vật tư</span>
          <strong>{{ alerts.partsShortage.length }}</strong>
          <small>{{ shortageQuantity }} sản phẩm cần bổ sung</small>
        </div>
      </article>

      <article class="metric-card">
        <div class="metric-card__icon"><Timer /></div>
        <div class="metric-card__body">
          <span>Hoàn thành trung bình</span>
          <strong>{{ formatHours(kpi.avgFinishHours) }}</strong>
          <small>Từ lúc tiếp nhận đến hoàn tất</small>
        </div>
      </article>
    </section>

    <section class="dashboard-panel status-panel" aria-labelledby="workshop-flow-title">
      <div class="panel-heading">
        <div>
          <span class="panel-heading__kicker">Nhịp xưởng</span>
          <h2 id="workshop-flow-title">Tiến độ phiếu sửa chữa</h2>
          <p>Phân bổ phiếu theo từng bước trong quy trình hiện tại.</p>
        </div>
        <strong class="panel-heading__total">{{ totalStatusCount }} phiếu</strong>
      </div>

      <div class="status-flow">
        <div v-for="item in statusOverview" :key="item.key" class="status-step">
          <div class="status-step__topline">
            <span><i :class="`status-dot status-dot--${item.tone}`"></i>{{ item.label }}</span>
            <strong>{{ item.count }}</strong>
          </div>
          <div class="status-step__track" aria-hidden="true">
            <span
              :class="`status-step__fill status-step__fill--${item.tone}`"
              :style="{ width: statusWidth(item.count) }"
            ></span>
          </div>
        </div>
      </div>
    </section>

    <div class="overview-grid">
      <section class="dashboard-panel alerts-panel" aria-labelledby="priority-title">
        <div class="panel-heading panel-heading--compact">
          <div>
            <span class="panel-heading__kicker">Ưu tiên hôm nay</span>
            <h2 id="priority-title">Việc cần xử lý</h2>
          </div>
          <span class="attention-count">{{ totalAttentionCount }}</span>
        </div>

        <div v-if="totalAttentionCount === 0" class="empty-state">
          <CircleCheck />
          <strong>Xưởng đang vận hành ổn định</strong>
          <span>Không có phiếu quá hạn hoặc vật tư thiếu.</span>
        </div>

        <div v-else class="alert-columns">
          <div class="alert-group">
            <div class="alert-group__heading">
              <span>Phiếu quá hạn</span>
              <strong>{{ alerts.overdue.length }}</strong>
            </div>
            <div v-if="alerts.overdue.length === 0" class="mini-empty">Không có phiếu quá hạn.</div>
            <button
              v-for="item in alerts.overdue"
              v-else
              :key="item.ticketId"
              type="button"
              class="alert-item"
              @click="openRepairOrder(item.repairOrderId)"
            >
              <span class="alert-item__accent alert-item__accent--danger"></span>
              <span class="alert-item__content">
                <strong
                  >{{ item.ticketId }} · {{ item.customerName || 'Chưa có tên khách' }}</strong
                >
                <small>{{ statusLabel(item.status) }} · chậm {{ item.overdueHours }} giờ</small>
              </span>
              <ArrowRight />
            </button>
          </div>

          <div class="alert-group">
            <div class="alert-group__heading">
              <span>Thiếu vật tư</span>
              <strong>{{ alerts.partsShortage.length }}</strong>
            </div>
            <div v-if="alerts.partsShortage.length === 0" class="mini-empty">
              Đủ vật tư cho các phiếu đang xử lý.
            </div>
            <button
              v-for="item in alerts.partsShortage"
              v-else
              :key="`${item.ticketId}-${item.partName}`"
              type="button"
              class="alert-item"
              @click="openRepairOrder(item.affectedRepairOrderId)"
            >
              <span class="alert-item__accent alert-item__accent--warning"></span>
              <span class="alert-item__content">
                <strong>{{ item.partName || 'Vật tư chưa xác định' }}</strong>
                <small
                  >{{ item.ticketId }} · cần {{ item.requiredQuantity }}, còn
                  {{ item.availableQuantity }}</small
                >
              </span>
              <ArrowRight />
            </button>
          </div>
        </div>
      </section>

      <section class="dashboard-panel revenue-panel" aria-labelledby="revenue-title">
        <div class="panel-heading panel-heading--compact">
          <div>
            <span class="panel-heading__kicker">Kết quả theo kỳ</span>
            <h2 id="revenue-title">Doanh thu dịch vụ</h2>
          </div>
          <div class="revenue-icon"><Money /></div>
        </div>

        <div class="revenue-total">
          <strong>{{ formatVnd(kpi.serviceRevenue) }}</strong>
          <span>{{ selectedRangeLabel }}</span>
        </div>

        <div v-if="revenueBreakdown.length > 0" class="revenue-breakdown">
          <div
            v-for="(item, index) in revenueBreakdown"
            :key="`${item.source}-${index}`"
            class="revenue-row"
          >
            <div class="revenue-row__topline">
              <span>{{ revenueSourceLabel(item.source) }}</span>
              <strong>{{ formatCompactVnd(item.amount) }} · {{ item.percentage }}%</strong>
            </div>
            <div class="revenue-row__track" aria-hidden="true">
              <span
                :class="`revenue-row__fill revenue-row__fill--${(index % 3) + 1}`"
                :style="{ width: `${item.percentage}%` }"
              ></span>
            </div>
          </div>
        </div>
        <div v-else class="mini-empty mini-empty--revenue">
          Chưa phát sinh doanh thu trong kỳ này.
        </div>
      </section>
    </div>

    <section class="chart-grid" aria-label="Biểu đồ phân tích xưởng">
      <article class="dashboard-panel chart-panel" aria-labelledby="revenue-trend-title">
        <div class="panel-heading panel-heading--compact">
          <div>
            <span class="panel-heading__kicker">Xu hướng 6 tháng</span>
            <h2 id="revenue-trend-title">Doanh thu dịch vụ</h2>
          </div>
          <span class="panel-note">Đơn vị: VNĐ</span>
        </div>
        <div class="chart-canvas">
          <ArtLineChart
            :data="revenueTrendChart.data"
            :x-axis-data="revenueTrendChart.xAxisData"
            :loading="loading"
            :colors="['#e84a4a']"
            :show-legend="false"
          />
        </div>
      </article>

      <article class="dashboard-panel chart-panel" aria-labelledby="status-chart-title">
        <div class="panel-heading panel-heading--compact">
          <div>
            <span class="panel-heading__kicker">Cơ cấu công việc</span>
            <h2 id="status-chart-title">Phiếu theo trạng thái</h2>
          </div>
          <strong class="panel-heading__total">{{ totalStatusCount }} phiếu</strong>
        </div>
        <div class="chart-canvas chart-canvas--ring">
          <ArtRingChart
            :data="repairStatusChart"
            :loading="loading"
            :radius="['48%', '70%']"
            :colors="['#9ca3af', '#e84a4a', '#e6a23c', '#18a66f', '#c5c7ce']"
            :show-legend="true"
            legend-position="bottom"
          />
        </div>
      </article>
    </section>

    <div class="bottom-grid">
      <section class="dashboard-panel technicians-panel" aria-labelledby="technicians-title">
        <div class="panel-heading panel-heading--compact">
          <div>
            <span class="panel-heading__kicker">Năng suất</span>
            <h2 id="technicians-title">Hiệu suất kỹ thuật viên</h2>
          </div>
          <span class="panel-note">Theo phiếu đã hoàn thành trong kỳ</span>
        </div>

        <div v-if="technicianRows.length === 0" class="empty-state empty-state--small">
          <UserFilled />
          <strong>Chưa có phiếu hoàn thành</strong>
          <span>Hiệu suất sẽ xuất hiện khi kỹ thuật viên hoàn tất công việc.</span>
        </div>
        <div v-else class="technician-table" role="table" aria-label="Hiệu suất kỹ thuật viên">
          <div class="technician-table__head" role="row">
            <span role="columnheader">Kỹ thuật viên</span>
            <span role="columnheader">Hoàn thành</span>
            <span role="columnheader">Doanh thu</span>
            <span role="columnheader">Hài lòng</span>
          </div>
          <div
            v-for="(item, index) in technicianRows"
            :key="`${item.technician}-${index}`"
            class="technician-table__row"
            role="row"
          >
            <span class="technician-name" role="cell">
              <i>{{ index + 1 }}</i>
              <strong>{{ item.technician }}</strong>
            </span>
            <strong role="cell">{{ item.completed }} phiếu</strong>
            <span role="cell">{{ formatCompactVnd(item.revenue) }}</span>
            <span role="cell" class="satisfaction">{{ item.customerSatisfaction }}%</span>
          </div>
        </div>
      </section>

      <section class="dashboard-panel quality-panel" aria-labelledby="quality-title">
        <div class="panel-heading panel-heading--compact">
          <div>
            <span class="panel-heading__kicker">Chất lượng dịch vụ</span>
            <h2 id="quality-title">Sau sửa chữa</h2>
          </div>
        </div>

        <div class="quality-metrics">
          <article>
            <span>Yêu cầu bảo hành</span>
            <strong>{{ warrantyAndComplaints.warrantyRequestsCount }}</strong>
            <small>Phát sinh trong kỳ</small>
          </article>
          <article
            :class="{ 'quality-metric--attention': warrantyAndComplaints.complaintsCount > 0 }"
          >
            <span>Khiếu nại khách hàng</span>
            <strong>{{ warrantyAndComplaints.complaintsCount }}</strong>
            <small>{{ qualitySummary }}</small>
          </article>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowRight,
  Box,
  CircleCheck,
  Money,
  Refresh,
  Timer,
  Tools,
  UserFilled,
  WarningFilled,
} from '@element-plus/icons-vue';

import { statisticsApi } from '@/api/operations';
import ArtLineChart from '@/components/core/charts/art-line-chart/index.vue';
import ArtRingChart from '@/components/core/charts/art-ring-chart/index.vue';

type RepairOrderStatus =
  'Pending' | 'InProgress' | 'QcPending' | 'Completed' | 'Cancelled' | string;
type Cycle = 'today' | 'this_month' | 'this_year' | 'custom';
type StatusTone = 'neutral' | 'primary' | 'warning' | 'success' | 'muted';

interface RawKpiCards {
  InProgressCount?: number;
  inProgressCount?: number;
  AvgCompletionHours?: number;
  avgCompletionHours?: number;
  CumulativeRevenue?: number;
  cumulativeRevenue?: number;
}

interface RawOverdueAlert {
  TicketId?: number;
  ticketId?: number;
  CustomerName?: string;
  customerName?: string;
  Status?: string;
  status?: string;
  ExpectedCompletionTime?: string;
  expectedCompletionTime?: string;
}

interface RawPartsShortageAlert {
  TicketId?: number;
  ticketId?: number;
  PartName?: string;
  partName?: string;
  RequiredQuantity?: number;
  requiredQuantity?: number;
  AvailableQuantity?: number;
  availableQuantity?: number;
}

interface RawRevenueSource {
  Source?: string;
  source?: string;
  Amount?: number;
  amount?: number;
}

interface RawStatusCount {
  Status?: string;
  status?: string;
  Count?: number;
  count?: number;
}

interface RawRevenueTrend {
  Labels?: string[];
  labels?: string[];
  ServiceRevenue?: number[];
  serviceRevenue?: number[];
}

interface RawTechnicianRanking {
  TechnicianName?: string;
  technicianName?: string;
  CompletedTickets?: number;
  completedTickets?: number;
  TotalRevenue?: number;
  totalRevenue?: number;
  ComplaintRate?: number;
  complaintRate?: number;
}

interface WorkshopDashboardPayload {
  KpiCards?: RawKpiCards;
  kpiCards?: RawKpiCards;
  Alerts?: {
    OverdueTickets?: RawOverdueAlert[];
    PartShortages?: RawPartsShortageAlert[];
  };
  alerts?: {
    overdueTickets?: RawOverdueAlert[];
    partShortages?: RawPartsShortageAlert[];
  };
  Analytics?: {
    RevenueSources?: RawRevenueSource[];
    RepairOrderStatusCounts?: RawStatusCount[];
    RevenueTrend?: RawRevenueTrend;
  };
  analytics?: {
    revenueSources?: RawRevenueSource[];
    repairOrderStatusCounts?: RawStatusCount[];
    revenueTrend?: RawRevenueTrend;
  };
  Productivity?: {
    TechnicianRankings?: RawTechnicianRanking[];
  };
  productivity?: {
    technicianRankings?: RawTechnicianRanking[];
  };
  WarrantyRequestsCount?: number;
  warrantyRequestsCount?: number;
  ComplaintsCount?: number;
  complaintsCount?: number;
}

interface OverdueAlert {
  repairOrderId: number;
  ticketId: string;
  customerName: string;
  status: RepairOrderStatus;
  overdueHours: number;
}

interface PartsShortageAlert {
  affectedRepairOrderId: number;
  ticketId: string;
  partName: string;
  requiredQuantity: number;
  availableQuantity: number;
}

interface TechnicianRow {
  technician: string;
  completed: number;
  revenue: number;
  customerSatisfaction: number;
}

const router = useRouter();
const loading = ref(false);
const loadError = ref('');
const lastUpdated = ref('');

const cycle = ref<Cycle>('this_month');
const fromDate = ref<Date | null>(null);
const toDate = ref<Date | null>(null);

const kpi = ref({
  inProgress: 0,
  avgFinishHours: 0,
  serviceRevenue: 0,
});

const analytics = ref({
  revenueSources: [] as Array<{ source: string; amount: number }>,
  repairOrderStatusCounts: [] as Array<{ status: string; count: number }>,
  revenueTrend: {
    labels: [] as string[],
    serviceRevenue: [] as number[],
  },
});

const alerts = ref({
  overdue: [] as OverdueAlert[],
  partsShortage: [] as PartsShortageAlert[],
});

const technicianRows = ref<TechnicianRow[]>([]);
const warrantyAndComplaints = ref({ warrantyRequestsCount: 0, complaintsCount: 0 });

const selectedRangeLabel = computed(() => {
  if (!fromDate.value || !toDate.value) return 'Chưa chọn thời gian';
  const format = (date: Date) => date.toLocaleDateString('vi-VN');
  if (cycle.value === 'today') return `Hôm nay, ${format(fromDate.value)}`;
  return `${format(fromDate.value)} – ${format(toDate.value)}`;
});

const shortageQuantity = computed(() =>
  alerts.value.partsShortage.reduce(
    (total, item) => total + Math.max(0, item.requiredQuantity - item.availableQuantity),
    0
  )
);

const totalAttentionCount = computed(
  () => alerts.value.overdue.length + alerts.value.partsShortage.length
);

const revenueBreakdown = computed(() => {
  const total = analytics.value.revenueSources.reduce((sum, item) => sum + item.amount, 0);
  if (total <= 0) return [];
  return analytics.value.revenueSources
    .filter((item) => item.amount > 0)
    .map((item) => ({
      ...item,
      percentage: Math.round((item.amount / total) * 100),
    }))
    .sort((a, b) => b.amount - a.amount);
});

const revenueTrendChart = computed(() => ({
  xAxisData: analytics.value.revenueTrend.labels,
  data: [
    {
      name: 'Doanh thu dịch vụ',
      data: analytics.value.revenueTrend.serviceRevenue,
    },
  ],
}));

const statusOverview = computed(() => {
  const counts = new Map(
    analytics.value.repairOrderStatusCounts.map((item) => [normalizeText(item.status), item.count])
  );
  const statusDefinitions: Array<{
    key: string;
    label: string;
    tone: StatusTone;
    aliases: string[];
  }> = [
    {
      key: 'pending',
      label: 'Chờ sửa chữa',
      tone: 'neutral',
      aliases: ['cho sua chua', 'pending'],
    },
    {
      key: 'progress',
      label: 'Đang sửa chữa',
      tone: 'primary',
      aliases: ['dang sua chua', 'inprogress'],
    },
    {
      key: 'qc',
      label: 'Chờ nghiệm thu',
      tone: 'warning',
      aliases: ['cho nghiem thu', 'qcpending'],
    },
    {
      key: 'done',
      label: 'Đã hoàn thành',
      tone: 'success',
      aliases: ['da hoan thanh', 'completed'],
    },
    {
      key: 'cancelled',
      label: 'Đã hủy phiếu',
      tone: 'muted',
      aliases: ['da huy phieu', 'cancelled'],
    },
  ];

  return statusDefinitions.map((definition) => ({
    ...definition,
    count: definition.aliases.reduce((total, alias) => total + (counts.get(alias) ?? 0), 0),
  }));
});

const repairStatusChart = computed(() =>
  statusOverview.value
    .filter((item) => item.count > 0)
    .map((item) => ({ value: item.count, name: item.label }))
);

const totalStatusCount = computed(() =>
  statusOverview.value.reduce((total, item) => total + item.count, 0)
);

const maxStatusCount = computed(() =>
  Math.max(1, ...statusOverview.value.map((item) => item.count))
);

const qualitySummary = computed(() =>
  warrantyAndComplaints.value.complaintsCount > 0
    ? 'Cần xem lại phản hồi trong kỳ'
    : 'Chưa ghi nhận khiếu nại'
);

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function setPresetRange(): void {
  const now = new Date();
  if (cycle.value === 'today') {
    fromDate.value = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    toDate.value = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (cycle.value === 'this_month') {
    fromDate.value = new Date(now.getFullYear(), now.getMonth(), 1);
    toDate.value = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (cycle.value === 'this_year') {
    fromDate.value = new Date(now.getFullYear(), 0, 1);
    toDate.value = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  }
}

function handleCycleChange(): void {
  if (cycle.value === 'custom') return;
  setPresetRange();
  void refresh();
}

function handleDateChange(): void {
  if (fromDate.value && toDate.value) void refresh();
}

function resetDashboard(): void {
  kpi.value = { inProgress: 0, avgFinishHours: 0, serviceRevenue: 0 };
  analytics.value = {
    revenueSources: [],
    repairOrderStatusCounts: [],
    revenueTrend: { labels: [], serviceRevenue: [] },
  };
  alerts.value = { overdue: [], partsShortage: [] };
  technicianRows.value = [];
  warrantyAndComplaints.value = { warrantyRequestsCount: 0, complaintsCount: 0 };
}

function hydrateDashboard(response: unknown): void {
  const payload = response as WorkshopDashboardPayload;
  const rawKpi = payload.KpiCards ?? payload.kpiCards;
  kpi.value = {
    inProgress: Number(rawKpi?.InProgressCount ?? rawKpi?.inProgressCount ?? 0),
    avgFinishHours: Number(rawKpi?.AvgCompletionHours ?? rawKpi?.avgCompletionHours ?? 0),
    serviceRevenue: Number(rawKpi?.CumulativeRevenue ?? rawKpi?.cumulativeRevenue ?? 0),
  };

  const rawRevenueSources =
    payload.Analytics?.RevenueSources ?? payload.analytics?.revenueSources ?? [];
  analytics.value.revenueSources = rawRevenueSources.map((item) => ({
    source: item.Source ?? item.source ?? 'Khác',
    amount: Number(item.Amount ?? item.amount ?? 0),
  }));

  const rawStatusCounts =
    payload.Analytics?.RepairOrderStatusCounts ?? payload.analytics?.repairOrderStatusCounts ?? [];
  analytics.value.repairOrderStatusCounts = rawStatusCounts.map((item) => ({
    status: item.Status ?? item.status ?? '',
    count: Math.max(0, Number(item.Count ?? item.count ?? 0)),
  }));

  const rawRevenueTrend = payload.Analytics?.RevenueTrend ?? payload.analytics?.revenueTrend;
  analytics.value.revenueTrend = {
    labels: rawRevenueTrend?.Labels ?? rawRevenueTrend?.labels ?? [],
    serviceRevenue: (rawRevenueTrend?.ServiceRevenue ?? rawRevenueTrend?.serviceRevenue ?? []).map(
      Number
    ),
  };

  const rawOverdue = payload.Alerts?.OverdueTickets ?? payload.alerts?.overdueTickets ?? [];
  alerts.value.overdue = rawOverdue.map((item) => {
    const repairOrderId = Number(item.TicketId ?? item.ticketId ?? 0);
    const expectedCompletionTime = item.ExpectedCompletionTime ?? item.expectedCompletionTime ?? '';
    const expectedTimestamp = expectedCompletionTime
      ? new Date(expectedCompletionTime).getTime()
      : Date.now();
    return {
      repairOrderId,
      ticketId: `PX-${String(repairOrderId).padStart(4, '0')}`,
      customerName: item.CustomerName ?? item.customerName ?? '',
      status: item.Status ?? item.status ?? 'Pending',
      overdueHours: Math.max(0, Math.floor((Date.now() - expectedTimestamp) / 3_600_000)),
    };
  });

  const rawParts = payload.Alerts?.PartShortages ?? payload.alerts?.partShortages ?? [];
  alerts.value.partsShortage = rawParts.map((item) => {
    const repairOrderId = Number(item.TicketId ?? item.ticketId ?? 0);
    return {
      affectedRepairOrderId: repairOrderId,
      ticketId: `PX-${String(repairOrderId).padStart(4, '0')}`,
      partName: item.PartName ?? item.partName ?? '',
      requiredQuantity: Number(item.RequiredQuantity ?? item.requiredQuantity ?? 0),
      availableQuantity: Number(item.AvailableQuantity ?? item.availableQuantity ?? 0),
    };
  });

  const rawTechnicians =
    payload.Productivity?.TechnicianRankings ?? payload.productivity?.technicianRankings ?? [];
  technicianRows.value = rawTechnicians.map((item) => {
    const complaintRate = Number(item.ComplaintRate ?? item.complaintRate ?? 0);
    return {
      technician: item.TechnicianName ?? item.technicianName ?? 'Chưa xác định',
      completed: Number(item.CompletedTickets ?? item.completedTickets ?? 0),
      revenue: Number(item.TotalRevenue ?? item.totalRevenue ?? 0),
      customerSatisfaction: Math.max(0, Math.round(100 - complaintRate * 100)),
    };
  });

  warrantyAndComplaints.value = {
    warrantyRequestsCount: Number(
      payload.WarrantyRequestsCount ?? payload.warrantyRequestsCount ?? 0
    ),
    complaintsCount: Number(payload.ComplaintsCount ?? payload.complaintsCount ?? 0),
  };
}

async function refresh(): Promise<void> {
  if (!fromDate.value || !toDate.value) return;
  loading.value = true;
  loadError.value = '';
  try {
    const response = await statisticsApi.getWorkshopDashboardOverview(
      fromDate.value.toISOString(),
      toDate.value.toISOString()
    );
    hydrateDashboard(response);
    lastUpdated.value = new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    resetDashboard();
    loadError.value = 'Không thể tải dữ liệu xưởng. Vui lòng kiểm tra kết nối và thử lại.';
  } finally {
    loading.value = false;
  }
}

function openRepairOrder(id: number): void {
  if (!id) return;
  const target = route.path.startsWith('/admin')
    ? `/admin/service/repair-history/repair/${id}`
    : `/factory/workshop/repair/${id}`;
  void router.push(target);
}

function statusWidth(count: number): string {
  if (count <= 0) return '0%';
  return `${Math.max(10, Math.round((count / maxStatusCount.value) * 100))}%`;
}

function statusLabel(status: string): string {
  const normalized = normalizeText(status);
  const labels: Record<string, string> = {
    pending: 'Chờ sửa chữa',
    'cho sua chua': 'Chờ sửa chữa',
    inprogress: 'Đang sửa chữa',
    'dang sua chua': 'Đang sửa chữa',
    qcpending: 'Chờ nghiệm thu',
    'cho nghiem thu': 'Chờ nghiệm thu',
    completed: 'Đã hoàn thành',
    'da hoan thanh': 'Đã hoàn thành',
    cancelled: 'Đã hủy phiếu',
    'da huy phieu': 'Đã hủy phiếu',
  };
  return labels[normalized] ?? status;
}

function revenueSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    cash: 'Tiền mặt',
    banktransfer: 'Chuyển khoản',
    vnpay: 'VNPay',
    payos: 'PayOS',
    khac: 'Khác',
  };
  return labels[normalizeText(source).replace(/\s/g, '')] ?? source;
}

function formatVnd(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactVnd(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} triệu`;
  return formatVnd(value);
}

function formatHours(value: number): string {
  if (!value || Number.isNaN(value)) return '0 giờ';
  return `${Math.round(value * 10) / 10} giờ`;
}

onMounted(() => {
  setPresetRange();
  void refresh();
});
</script>

<style scoped>
.dashboard-workshop {
  --workshop-accent: #e84a4a;
  --workshop-accent-soft: color-mix(in srgb, var(--workshop-accent) 11%, transparent);
  --workshop-surface: var(--el-bg-color-overlay);
  --workshop-surface-soft: var(--el-fill-color-lighter);
  --workshop-border: var(--el-border-color-lighter);
  --workshop-text: var(--el-text-color-primary);
  --workshop-muted: var(--el-text-color-secondary);

  width: 100%;
  padding: 18px;
  color: var(--workshop-text);
}

.workshop-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(420px, 0.9fr);
  gap: 28px;
  align-items: end;
  padding: 22px 24px 24px;
  border: 1px solid var(--workshop-border);
  border-radius: 18px;
  background:
    radial-gradient(circle at 8% 12%, var(--workshop-accent-soft), transparent 30%),
    var(--workshop-surface);
}

.workshop-header__intro h1 {
  margin: 8px 0;
  font-size: clamp(1.65rem, 2.5vw, 2.35rem);
  font-weight: 750;
  line-height: 1.08;
  letter-spacing: -0.035em;
  text-wrap: balance;
}

.workshop-header__intro p {
  max-width: 62ch;
  margin: 0;
  color: var(--workshop-muted);
  font-size: 0.9rem;
  line-height: 1.55;
}

.workshop-header__eyebrow,
.panel-heading__kicker,
.period-panel__label {
  color: var(--workshop-muted);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.workshop-header__eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #16a068;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #18b879;
  box-shadow: 0 0 0 4px rgb(24 184 121 / 12%);
  animation: live-pulse 1.8s ease-in-out infinite;
}

.period-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px 12px;
  align-items: end;
  padding: 14px;
  border: 1px solid var(--workshop-border);
  border-radius: 13px;
  background: var(--workshop-surface-soft);
}

.period-panel__topline {
  grid-column: 1 / -1;
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
}

.period-panel__topline > div {
  display: grid;
  gap: 3px;
}

.period-panel__topline strong,
.last-updated {
  font-size: 0.78rem;
}

.last-updated {
  color: var(--workshop-muted);
  font-variant-numeric: tabular-nums;
}

.period-scroll {
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.period-scroll::-webkit-scrollbar {
  display: none;
}

.period-scroll :deep(.el-radio-group) {
  flex-wrap: nowrap;
}

.period-panel__actions {
  display: flex;
  gap: 8px;
}

.custom-range {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.custom-range :deep(.el-date-editor) {
  width: 100%;
}

.dashboard-error {
  margin-top: 14px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.metric-card {
  position: relative;
  display: flex;
  gap: 13px;
  min-width: 0;
  padding: 17px;
  overflow: hidden;
  border: 1px solid var(--workshop-border);
  border-radius: 14px;
  background: var(--workshop-surface);
  transition:
    transform 180ms ease,
    border-color 180ms ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  border-color: var(--el-border-color);
}

.metric-card__icon {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  color: var(--workshop-muted);
  background: var(--workshop-surface-soft);
}

.metric-card__icon svg {
  width: 18px;
}

.metric-card__body {
  display: grid;
  min-width: 0;
}

.metric-card__body span,
.quality-metrics article > span {
  color: var(--workshop-muted);
  font-size: 0.75rem;
  font-weight: 600;
}

.metric-card__body strong {
  margin-top: 2px;
  font-size: 1.65rem;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.metric-card__body small,
.quality-metrics small {
  margin-top: 5px;
  overflow: hidden;
  color: var(--el-text-color-placeholder);
  font-size: 0.68rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-card--accent {
  border-color: color-mix(in srgb, var(--workshop-accent) 28%, var(--workshop-border));
  background: linear-gradient(135deg, var(--workshop-accent-soft), var(--workshop-surface) 62%);
}

.metric-card--accent .metric-card__icon,
.metric-card--danger .metric-card__icon {
  color: var(--workshop-accent);
  background: var(--workshop-accent-soft);
}

.metric-card--danger strong {
  color: var(--workshop-accent);
}

.metric-card--warning .metric-card__icon,
.metric-card--warning strong {
  color: var(--el-color-warning);
}

.dashboard-panel {
  min-width: 0;
  padding: 19px;
  border: 1px solid var(--workshop-border);
  border-radius: 16px;
  background: var(--workshop-surface);
}

.status-panel {
  margin-top: 14px;
}

.panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}

.panel-heading--compact {
  align-items: center;
  margin-bottom: 14px;
}

.panel-heading h2 {
  margin: 3px 0 0;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.015em;
}

.panel-heading p,
.panel-note {
  margin: 4px 0 0;
  color: var(--workshop-muted);
  font-size: 0.75rem;
}

.panel-heading__total,
.attention-count {
  flex: 0 0 auto;
  padding: 6px 9px;
  border-radius: 8px;
  color: var(--workshop-muted);
  background: var(--workshop-surface-soft);
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
}

.attention-count {
  color: var(--workshop-accent);
  background: var(--workshop-accent-soft);
}

.status-flow {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 18px;
}

.status-step {
  min-width: 0;
}

.status-step__topline,
.revenue-row__topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.74rem;
}

.status-step__topline span {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 7px;
  overflow: hidden;
  color: var(--workshop-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-step__topline strong,
.revenue-row__topline strong {
  flex: 0 0 auto;
  font-variant-numeric: tabular-nums;
}

.status-dot {
  flex: 0 0 auto;
  width: 7px;
  height: 7px;
  border-radius: 99px;
  background: var(--el-text-color-placeholder);
}

.status-dot--primary,
.status-step__fill--primary {
  background: var(--workshop-accent);
}

.status-dot--warning,
.status-step__fill--warning {
  background: var(--el-color-warning);
}

.status-dot--success,
.status-step__fill--success {
  background: var(--el-color-success);
}

.status-dot--muted,
.status-step__fill--muted {
  background: var(--el-text-color-placeholder);
}

.status-step__track,
.revenue-row__track {
  height: 5px;
  overflow: hidden;
  border-radius: 99px;
  background: var(--workshop-surface-soft);
}

.status-step__fill,
.revenue-row__fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--el-text-color-secondary);
  transition: width 280ms ease;
}

.overview-grid,
.chart-grid,
.bottom-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(320px, 0.9fr);
  gap: 14px;
  align-items: stretch;
  margin-top: 14px;
}

.chart-panel {
  overflow: hidden;
}

.chart-canvas {
  height: 270px;
}

.chart-canvas--ring {
  height: 270px;
}

.alert-columns {
  display: grid;
  flex: 1;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.alerts-panel,
.revenue-panel,
.technicians-panel,
.quality-panel {
  display: flex;
  flex-direction: column;
}

.alert-group {
  min-width: 0;
}

.alert-group__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 0 2px;
  color: var(--workshop-muted);
  font-size: 0.72rem;
  font-weight: 650;
}

.alert-group__heading strong {
  font-variant-numeric: tabular-nums;
}

.alert-item {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  gap: 10px;
  padding: 11px 8px;
  border: 0;
  border-bottom: 1px solid var(--workshop-border);
  color: inherit;
  text-align: left;
  background: transparent;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    transform 160ms ease;
}

.alert-item:hover {
  border-radius: 9px;
  background: var(--workshop-surface-soft);
  transform: translateX(2px);
}

.alert-item:focus-visible {
  outline: 2px solid var(--workshop-accent);
  outline-offset: 2px;
}

.alert-item__accent {
  flex: 0 0 auto;
  width: 4px;
  height: 30px;
  border-radius: 99px;
}

.alert-item__accent--danger {
  background: var(--workshop-accent);
}

.alert-item__accent--warning {
  background: var(--el-color-warning);
}

.alert-item__content {
  display: grid;
  min-width: 0;
  flex: 1;
  gap: 3px;
}

.alert-item__content strong,
.alert-item__content small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.alert-item__content strong {
  font-size: 0.76rem;
}

.alert-item__content small {
  color: var(--workshop-muted);
  font-size: 0.68rem;
}

.alert-item > svg {
  width: 14px;
  color: var(--el-text-color-placeholder);
}

.empty-state {
  display: grid;
  min-height: 190px;
  place-items: center;
  align-content: center;
  gap: 7px;
  color: var(--workshop-muted);
  text-align: center;
}

.empty-state svg {
  width: 30px;
  color: var(--el-color-success);
}

.empty-state strong {
  color: var(--workshop-text);
  font-size: 0.84rem;
}

.empty-state span,
.mini-empty {
  color: var(--workshop-muted);
  font-size: 0.72rem;
}

.mini-empty {
  padding: 14px 8px;
  border-top: 1px dashed var(--workshop-border);
}

.mini-empty--revenue {
  margin-top: 18px;
  text-align: center;
}

.revenue-icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  color: var(--workshop-accent);
  background: var(--workshop-accent-soft);
}

.revenue-icon svg {
  width: 17px;
}

.revenue-total {
  display: grid;
  gap: 3px;
  padding: 7px 0 18px;
  border-bottom: 1px solid var(--workshop-border);
}

.revenue-total strong {
  font-size: clamp(1.45rem, 2.5vw, 2rem);
  line-height: 1.12;
  letter-spacing: -0.035em;
  font-variant-numeric: tabular-nums;
}

.revenue-total span {
  color: var(--workshop-muted);
  font-size: 0.7rem;
}

.revenue-breakdown {
  display: grid;
  gap: 14px;
  padding-top: 18px;
}

.revenue-row__topline {
  margin-bottom: 7px;
  color: var(--workshop-muted);
}

.revenue-row__topline strong {
  color: var(--workshop-text);
  font-size: 0.7rem;
}

.revenue-row__fill--1 {
  background: var(--workshop-accent);
}

.revenue-row__fill--2 {
  background: var(--el-color-success);
}

.revenue-row__fill--3 {
  background: var(--el-color-warning);
}

.technician-table {
  overflow-x: auto;
}

.technician-table__head,
.technician-table__row {
  display: grid;
  grid-template-columns: minmax(180px, 1.4fr) repeat(3, minmax(100px, 0.7fr));
  gap: 12px;
  min-width: 620px;
  align-items: center;
}

.technician-table__head {
  padding: 8px 10px;
  color: var(--workshop-muted);
  font-size: 0.67rem;
  font-weight: 650;
}

.technician-table__row {
  padding: 11px 10px;
  border-top: 1px solid var(--workshop-border);
  font-size: 0.73rem;
  font-variant-numeric: tabular-nums;
}

.technician-name {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 9px;
}

.technician-name i {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 23px;
  height: 23px;
  border-radius: 7px;
  color: var(--workshop-accent);
  background: var(--workshop-accent-soft);
  font-size: 0.65rem;
  font-style: normal;
  font-weight: 700;
}

.technician-name strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.satisfaction {
  color: var(--el-color-success);
  font-weight: 700;
}

.empty-state--small {
  min-height: 120px;
}

.quality-metrics {
  display: grid;
  flex: 1;
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.quality-metrics article {
  display: grid;
  align-content: center;
  padding: 14px;
  border-radius: 11px;
  background: var(--workshop-surface-soft);
}

.quality-metrics article strong {
  margin-top: 5px;
  font-size: 1.6rem;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.quality-metric--attention strong {
  color: var(--workshop-accent);
}

@keyframes live-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.65;
    transform: scale(0.82);
  }
}

@media (width <= 1180px) {
  .workshop-header {
    grid-template-columns: 1fr;
  }

  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .overview-grid,
  .bottom-grid,
  .chart-grid {
    grid-template-columns: 1fr;
  }
}

@media (width <= 768px) {
  .dashboard-workshop {
    padding: 10px;
  }

  .workshop-header {
    gap: 18px;
    padding: 18px 14px 16px;
    border-radius: 14px;
  }

  .period-panel {
    grid-template-columns: 1fr;
  }

  .period-panel__topline,
  .period-panel__actions {
    grid-column: 1;
  }

  .period-panel__actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .period-panel__actions :deep(.el-button) {
    width: 100%;
    margin: 0;
  }

  .custom-range {
    grid-template-columns: 1fr;
  }

  .metric-grid {
    grid-template-columns: 1fr;
  }

  .status-flow {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .alert-columns {
    grid-template-columns: 1fr;
  }

  .chart-canvas,
  .chart-canvas--ring {
    height: 235px;
  }

  .dashboard-panel {
    padding: 15px;
    border-radius: 13px;
  }

  .panel-heading {
    gap: 10px;
  }

  .panel-note {
    max-width: 120px;
    text-align: right;
  }
}

@media (prefers-reduced-motion: reduce) {
  .live-dot,
  .metric-card,
  .alert-item,
  .status-step__fill,
  .revenue-row__fill {
    animation: none;
    transition: none;
  }
}
</style>
