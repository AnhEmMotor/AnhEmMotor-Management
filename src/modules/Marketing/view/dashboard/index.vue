<template>
  <div class="resp-page marketing-dashboard p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
        <span>📢</span> Tổng quan tiếp thị & chăm sóc khách hàng
      </h1>
      <div class="flex justify-end gap-2 items-center">
        <ElButton
          @click="setPeriod('today')"
          :type="currentPeriod === 'today' ? 'primary' : 'default'"
          >Hôm nay</ElButton
        >
        <ElButton
          @click="setPeriod('month')"
          :type="currentPeriod === 'month' ? 'primary' : 'default'"
          >Tháng này</ElButton
        >
        <ElButton
          @click="setPeriod('year')"
          :type="currentPeriod === 'year' ? 'primary' : 'default'"
          >Năm này</ElButton
        >
        <ElDatePicker
          v-model="customStart"
          type="date"
          placeholder="Từ ngày"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="setPeriod('custom')"
          style="width: 140px"
        />
        <ElDatePicker
          v-model="customEnd"
          type="date"
          placeholder="Đến ngày"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="setPeriod('custom')"
          style="width: 140px"
        />
      </div>
    </div>

    <ElRow :gutter="20" class="mb-6">
      <ElCol :sm="24" :md="12" :lg="6">
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm h-full flex flex-col justify-between border-l-4 border-l-blue-500"
        >
          <div>
            <div
              class="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2"
            >
              TỔNG SỐ LEADS NHẬN
            </div>
            <div class="text-3xl font-bold text-gray-800 dark:text-slate-100">
              {{ summary.totalLeads }}
            </div>
          </div>
          <div class="mt-4 flex items-center justify-between">
            <span
              class="text-sm font-medium flex items-center gap-1"
              :class="summary.leadsVsPrevPercentage >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              {{ summary.leadsVsPrevPercentage >= 0 ? '▲ +' : '▼ '
              }}{{ Math.abs(summary.leadsVsPrevPercentage) }}%
            </span>
            <span class="text-xs text-gray-400">so với kỳ trước</span>
          </div>
        </div>
      </ElCol>

      <ElCol :sm="24" :md="12" :lg="6">
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm h-full flex flex-col justify-between border-l-4 border-l-orange-500"
        >
          <div>
            <div
              class="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2"
            >
              LEAD MỚI CHƯA LIÊN HỆ
            </div>
            <div class="text-3xl font-bold text-gray-800 dark:text-slate-100">
              {{ summary.newLeads }}
            </div>
          </div>
          <div class="mt-4 flex items-center justify-between">
            <span
              class="text-xs text-orange-600 font-bold px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950/30"
            >
              Cần chăm sóc gấp
            </span>
            <span class="text-xs text-gray-400">Chiếm {{ summary.newLeadsRatio }}%</span>
          </div>
        </div>
      </ElCol>

      <ElCol :sm="24" :md="12" :lg="6">
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm h-full flex flex-col justify-between border-l-4 border-l-green-500"
        >
          <div>
            <div
              class="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2"
            >
              TỶ LỆ CHUYỂN ĐỔI CHỐT
            </div>
            <div class="text-3xl font-bold text-gray-800 dark:text-slate-100">
              {{ summary.conversionRate }}%
            </div>
          </div>
          <div class="mt-4">
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <div
                class="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                :style="{ width: summary.conversionRate + '%' }"
              ></div>
            </div>
            <div class="text-right text-xs text-gray-400 mt-1">Đã giao / Chốt thành công</div>
          </div>
        </div>
      </ElCol>

      <ElCol :sm="24" :md="12" :lg="6">
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm h-full flex flex-col justify-between border-l-4 border-l-purple-500"
        >
          <div>
            <div
              class="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2"
            >
              LỊCH HẸN ĐẶT LÁI THỬ
            </div>
            <div class="text-3xl font-bold text-gray-800 dark:text-slate-100">
              {{ summary.testDriveBookings }}
            </div>
          </div>
          <div class="mt-4 flex items-center justify-between">
            <span
              class="text-sm font-medium flex items-center gap-1"
              :class="summary.bookingsVsPrevPercentage >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              {{ summary.bookingsVsPrevPercentage >= 0 ? '▲ +' : '▼ '
              }}{{ Math.abs(summary.bookingsVsPrevPercentage) }}%
            </span>
            <span class="text-xs text-gray-400">so với kỳ trước</span>
          </div>
        </div>
      </ElCol>
    </ElRow>

    <ElRow :gutter="20" class="mb-6">
      <ElCol :xs="24" :lg="16">
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm"
        >
          <h3
            class="text-lg font-bold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-1"
          >
            📈 Lượng đăng ký Lead & Đặt lịch hẹn theo thời gian
          </h3>
          <div ref="trendChartRef" style="width: 100%; height: 350px"></div>
        </div>
      </ElCol>

      <ElCol :xs="24" :lg="8">
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm h-full"
        >
          <h3
            class="text-lg font-bold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-1"
          >
            🌪️ Phễu chuyển đổi hành trình khách hàng
          </h3>
          <div ref="funnelChartRef" style="width: 100%; height: 350px"></div>
        </div>
      </ElCol>
    </ElRow>

    <ElRow :gutter="20" class="mb-6">
      <ElCol :xs="24" :md="12">
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm"
        >
          <h3
            class="text-lg font-bold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-1"
          >
            🍰 Cơ cấu Nguồn khách hàng (Lead Sources)
          </h3>
          <div ref="sourceChartRef" style="width: 100%; height: 320px"></div>
        </div>
      </ElCol>

      <ElCol :xs="24" :md="12">
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm h-full flex flex-col justify-between"
        >
          <div>
            <h3
              class="text-lg font-bold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-1"
            >
              🏆 Bảng xếp hạng Hiệu suất Nhân viên kinh doanh
            </h3>

            <div v-if="staffPerformanceList.length === 0" class="text-center py-10 text-gray-400">
              Không có dữ liệu nhân viên trong kỳ này.
            </div>

            <div v-else class="space-y-4 pr-1">
              <div
                v-for="(staff, index) in staffPerformanceList"
                :key="index"
                class="flex items-center text-sm"
              >
                <div class="w-8 font-bold text-gray-500">#{{ index + 1 }}</div>
                <div
                  class="w-28 truncate font-medium text-gray-700 dark:text-gray-300"
                  :title="staff.name"
                >
                  {{ staff.name }}
                </div>
                <div class="w-32 text-gray-500 text-xs">
                  Giao: <strong>{{ staff.total }}</strong> | Chốt:
                  <strong>{{ staff.won }}</strong>
                </div>
                <div class="flex-1 mx-2">
                  <ElProgress
                    :percentage="staff.rate"
                    :color="staff.rate >= 50 ? '#67c23a' : staff.rate >= 20 ? '#409eff' : '#f56c6c'"
                    :show-text="false"
                    :stroke-width="8"
                  />
                </div>
                <div
                  class="w-16 text-right font-bold"
                  :class="
                    staff.rate >= 50
                      ? 'text-green-600'
                      : staff.rate >= 20
                        ? 'text-blue-600'
                        : 'text-red-600'
                  "
                >
                  {{ staff.rate }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </ElCol>
    </ElRow>

    <div
      class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm"
    >
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold text-gray-800 dark:text-slate-100 flex items-center gap-1">
          📅 Lịch hẹn đăng ký lái thử mới nhất
        </h3>
        <ElButton type="primary" link @click="goToBookings">Xem lịch đầy đủ</ElButton>
      </div>

      <ElTable :data="recentBookings" style="width: 100%" v-loading="loading">
        <ElTableColumn prop="fullName" label="Khách hàng" min-width="140" />
        <ElTableColumn prop="phoneNumber" label="Số điện thoại" width="130" />
        <ElTableColumn prop="email" label="Email" min-width="160" />
        <ElTableColumn label="Dòng xe quan tâm" min-width="150">
          <template #default="scope">
            <span v-if="scope.row.productVariant">
              {{ scope.row.productVariant.product?.name }} -
              {{ scope.row.productVariant.variantName }}
            </span>
            <span v-else-if="scope.row.variantName">
              {{ scope.row.variantName }}
            </span>
            <span v-else class="text-gray-400">Chưa xác định</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="preferredDate" label="Ngày hẹn" width="160">
          <template #default="scope">
            <span>{{ formatDateTime(scope.row.preferredDate) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="assignedToName" label="Sales phụ trách" min-width="140">
          <template #default="scope">
            <span class="text-gray-600 dark:text-gray-300 font-medium">
              {{ scope.row.assignedToName || 'Chưa phân công' }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="status" label="Trạng thái" width="130">
          <template #default="scope">
            <ElTag :type="getBookingStatusType(scope.row.status)">
              {{ getBookingStatusLabel(scope.row.status) }}
            </ElTag>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { fetchGetLeadList, Lead } from '@/api/customer/lead.api';
import { BookingApi, Booking } from '@/api/sales';

defineOptions({ name: 'MarketingDashboard' });

const router = useRouter();

const loading = ref(false);
const rawLeads = ref<Lead[]>([]);
const rawBookings = ref<Booking[]>([]);

const currentPeriod = ref('month');
const customStart = ref('');
const customEnd = ref('');

const trendChartRef = ref<HTMLDivElement | null>(null);
const funnelChartRef = ref<HTMLDivElement | null>(null);
const sourceChartRef = ref<HTMLDivElement | null>(null);

let trendChart: echarts.ECharts | null = null;
let funnelChart: echarts.ECharts | null = null;
let sourceChart: echarts.ECharts | null = null;

const setPeriod = (period: string) => {
  currentPeriod.value = period;
  if (period !== 'custom') {
    customStart.value = '';
    customEnd.value = '';
  }
};

const dateRanges = computed(() => {
  const now = new Date();
  let start = new Date();
  let end = new Date();
  let prevStart = new Date();
  let prevEnd = new Date();

  if (currentPeriod.value === 'today') {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    prevStart.setDate(now.getDate() - 1);
    prevStart.setHours(0, 0, 0, 0);
    prevEnd.setDate(now.getDate() - 1);
    prevEnd.setHours(23, 59, 59, 999);
  } else if (currentPeriod.value === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else if (currentPeriod.value === 'year') {
    start = new Date(now.getFullYear(), 0, 1);
    end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    prevStart = new Date(now.getFullYear() - 1, 0, 1);
    prevEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
  } else {
    start = customStart.value
      ? new Date(customStart.value)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    end = customEnd.value ? new Date(customEnd.value) : new Date();
    end.setHours(23, 59, 59, 999);

    const diffMs = end.getTime() - start.getTime();
    prevStart = new Date(start.getTime() - diffMs);
    prevEnd = new Date(start.getTime() - 1);
  }

  return { start, end, prevStart, prevEnd };
});

const filteredLeads = computed(() => {
  const range = dateRanges.value;
  return rawLeads.value.filter((l) => {
    const d = new Date(l.createdAt);
    return d >= range.start && d <= range.end;
  });
});

const prevFilteredLeads = computed(() => {
  const range = dateRanges.value;
  return rawLeads.value.filter((l) => {
    const d = new Date(l.createdAt);
    return d >= range.prevStart && d <= range.prevEnd;
  });
});

const filteredBookings = computed(() => {
  const range = dateRanges.value;
  return rawBookings.value.filter((b) => {
    const d = new Date(b.preferredDate);
    return d >= range.start && d <= range.end;
  });
});

const prevFilteredBookings = computed(() => {
  const range = dateRanges.value;
  return rawBookings.value.filter((b) => {
    const d = new Date(b.preferredDate);
    return d >= range.prevStart && d <= range.prevEnd;
  });
});

const summary = computed(() => {
  const curLeads = filteredLeads.value.length;
  const prevLeads = prevFilteredLeads.value.length;
  const leadsVsPrevPercentage =
    prevLeads === 0
      ? curLeads > 0
        ? 100
        : 0
      : Math.round(((curLeads - prevLeads) / prevLeads) * 100);

  const newLeads = filteredLeads.value.filter((l) => l.status === 'New').length;
  const newLeadsRatio = curLeads === 0 ? 0 : Math.round((newLeads / curLeads) * 100);

  const wonLeads = filteredLeads.value.filter((l) =>
    ['Delivered', 'Closed', 'Won', 'Official'].includes(l.status)
  ).length;
  const conversionRate = curLeads === 0 ? 0 : Math.round((wonLeads / curLeads) * 100);

  const curTestDriveBookings = filteredBookings.value.filter(
    (b) => b.bookingType === 'TestDrive'
  ).length;
  const prevTestDriveBookings = prevFilteredBookings.value.filter(
    (b) => b.bookingType === 'TestDrive'
  ).length;
  const bookingsVsPrevPercentage =
    prevTestDriveBookings === 0
      ? curTestDriveBookings > 0
        ? 100
        : 0
      : Math.round(((curTestDriveBookings - prevTestDriveBookings) / prevTestDriveBookings) * 100);

  return {
    totalLeads: curLeads,
    leadsVsPrevPercentage,
    newLeads,
    newLeadsRatio,
    conversionRate,
    testDriveBookings: curTestDriveBookings,
    bookingsVsPrevPercentage,
  };
});

const recentBookings = computed(() => {
  return [...filteredBookings.value]
    .sort((a, b) => new Date(b.preferredDate).getTime() - new Date(a.preferredDate).getTime())
    .slice(0, 5);
});

const staffPerformanceList = computed(() => {
  const staffMap: { [key: string]: { total: number; won: number } } = {};
  filteredLeads.value.forEach((l) => {
    const rep = l.assignedToName || 'Chưa phân công';
    if (!staffMap[rep]) staffMap[rep] = { total: 0, won: 0 };
    staffMap[rep].total++;
    if (['Deposited', 'Paperwork', 'Delivered', 'Closed', 'Won', 'Official'].includes(l.status)) {
      staffMap[rep].won++;
    }
  });

  return Object.keys(staffMap)
    .map((name) => {
      const total = staffMap[name].total;
      const won = staffMap[name].won;
      const rate = total === 0 ? 0 : Math.round((won / total) * 100);
      return { name, total, won, rate };
    })
    .sort((a, b) => b.won - a.won || b.rate - a.rate || b.total - a.total);
});

const formatDateTime = (val?: string) => {
  if (!val) return '-';
  const d = new Date(val);
  const dStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  const tStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${dStr} ${tStr}`;
};

const getBookingStatusLabel = (status?: string) => {
  switch (status) {
    case 'Pending':
      return 'Chờ xử lý';
    case 'Confirmed':
      return 'Đã xác nhận';
    case 'Cancelled':
      return 'Đã hủy';
    default:
      return status || 'Chờ xử lý';
  }
};

const getBookingStatusType = (status?: string) => {
  switch (status) {
    case 'Pending':
      return 'warning';
    case 'Confirmed':
      return 'success';
    case 'Cancelled':
      return 'danger';
    default:
      return 'info';
  }
};

const goToBookings = () => {
  router.push('/Marketing/booking');
};

const loadData = async () => {
  loading.value = true;
  try {
    const leadRes = await fetchGetLeadList({ PageSize: 5000 });
    rawLeads.value = Array.isArray(leadRes) ? leadRes : (leadRes.items ?? leadRes.records ?? []);

    const bookingRes = await BookingApi.getList();
    rawBookings.value = bookingRes || [];
  } catch (err: any) {
    ElMessage.error('Lỗi khi tải dữ liệu thống kê Marketing');
  } finally {
    loading.value = false;
  }
};

const initCharts = () => {
  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#e3e3e8' : '#323251';
  const lineColor = isDark ? '#333' : '#f2f4f5';

  if (trendChartRef.value) {
    if (!trendChart) trendChart = echarts.init(trendChartRef.value);

    const dateMap: { [key: string]: { leads: number; bookings: number } } = {};
    const range = dateRanges.value;
    const start = new Date(range.start);

    while (start <= range.end) {
      const dateStr = start.toISOString().split('T')[0];
      dateMap[dateStr] = { leads: 0, bookings: 0 };
      start.setDate(start.getDate() + 1);
    }

    filteredLeads.value.forEach((l) => {
      const dateStr = l.createdAt.split('T')[0];
      if (dateMap[dateStr]) dateMap[dateStr].leads++;
    });

    filteredBookings.value.forEach((b) => {
      const dateStr = b.preferredDate.split('T')[0];
      if (dateMap[dateStr]) dateMap[dateStr].bookings++;
    });

    const dates = Object.keys(dateMap).sort();
    const leadCounts = dates.map((d) => dateMap[d].leads);
    const bookingCounts = dates.map((d) => dateMap[d].bookings);

    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: {
        top: 0,
        left: 'center',
        data: ['Khách hàng mới (Leads)', 'Lịch hẹn lái thử'],
        textStyle: { color: textColor },
      },
      grid: {
        left: '3%',
        right: '4%',
        top: '12%',
        bottom: '5%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates.map((d) => d.substring(5)),
        axisLabel: {
          color: textColor,
          margin: 12,
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: textColor },
        splitLine: { lineStyle: { color: lineColor } },
      },
      series: [
        {
          name: 'Khách hàng mới (Leads)',
          type: 'line',
          smooth: true,
          data: leadCounts,
          itemStyle: { color: '#3b82f6' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.4)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0)' },
            ]),
          },
        },
        {
          name: 'Lịch hẹn lái thử',
          type: 'line',
          smooth: true,
          data: bookingCounts,
          itemStyle: { color: '#a855f7' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(168, 85, 247, 0.4)' },
              { offset: 1, color: 'rgba(168, 85, 247, 0)' },
            ]),
          },
        },
      ],
    });
  }

  if (funnelChartRef.value) {
    if (!funnelChart) funnelChart = echarts.init(funnelChartRef.value);

    const totalLeads = filteredLeads.value.length;
    const contactedLeads = filteredLeads.value.filter((l) =>
      ['Consulting', 'Contacted', 'Potential', 'TestDriving'].includes(l.status)
    ).length;
    const testDriveLeads = filteredLeads.value.filter((l) =>
      ['TestDriving'].includes(l.status)
    ).length;
    const wonLeads = filteredLeads.value.filter((l) =>
      ['Deposited', 'Paperwork', 'Delivered', 'Closed', 'Won', 'Official'].includes(l.status)
    ).length;

    funnelChart.setOption({
      tooltip: { trigger: 'item', formatter: '{b} : {c} ({d}%)' },
      legend: { show: false },
      series: [
        {
          name: 'Phễu chuyển đổi',
          type: 'funnel',
          left: '10%',
          right: '10%',
          top: '10%',
          bottom: '10%',
          width: '80%',
          min: 0,
          max: totalLeads || 10,
          minSize: '0%',
          maxSize: '100%',
          sort: 'descending',
          gap: 2,
          label: { show: true, position: 'inside' },
          labelLine: { show: false },
          itemStyle: { borderColor: '#fff', borderWidth: 1 },
          data: [
            { value: totalLeads, name: `Tổng số Leads: ${totalLeads}` },
            {
              value: contactedLeads,
              name: `Tư vấn/Liên hệ: ${contactedLeads}`,
            },
            {
              value: testDriveLeads,
              name: `Đặt lái thử xe: ${testDriveLeads}`,
            },
            { value: wonLeads, name: `Chốt mua/Cọc: ${wonLeads}` },
          ].filter((item) => item.value >= 0),
        },
      ],
    });
  }

  if (sourceChartRef.value) {
    if (!sourceChart) sourceChart = echarts.init(sourceChartRef.value);

    const sourceMap: { [key: string]: number } = {};
    filteredLeads.value.forEach((l) => {
      const src = l.source || 'Nguồn khác';
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    });

    const translateSource = (src: string) => {
      switch (src) {
        case 'WebStore':
          return 'Website trực tuyến';
        case 'Facebook':
          return 'Mạng xã hội (Facebook)';
        case 'Ads':
          return 'Quảng cáo trực tuyến';
        case 'Walk-in':
          return 'Khách vãng lai';
        case 'Referral':
          return 'Người giới thiệu';
        default:
          return src;
      }
    };

    const pieData = Object.keys(sourceMap).map((src) => ({
      name: translateSource(src),
      value: sourceMap[src],
    }));

    sourceChart.setOption({
      tooltip: { trigger: 'item', formatter: '{b} : {c} Leads ({d}%)' },
      legend: { bottom: '0', left: 'center', textStyle: { color: textColor } },
      series: [
        {
          name: 'Nguồn khách hàng',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: isDark ? '#161618' : '#fff',
            borderWidth: 2,
          },
          label: { show: false, position: 'center' },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
              color: textColor,
            },
          },
          labelLine: { show: false },
          data: pieData.length > 0 ? pieData : [{ name: 'Không có dữ liệu', value: 0 }],
        },
      ],
    });
  }
};

watch([filteredLeads, filteredBookings], () => {
  initCharts();
});

const handleResize = () => {
  trendChart?.resize();
  funnelChart?.resize();
  sourceChart?.resize();
};

onMounted(async () => {
  await loadData();
  initCharts();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  trendChart?.dispose();
  funnelChart?.dispose();
  sourceChart?.dispose();
});
</script>

<style scoped>
.marketing-dashboard {
  min-height: 100%;
}
</style>
