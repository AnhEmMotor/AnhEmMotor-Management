<template>
  <div class="subsystems-grid mb-5">
    <div class="domain-panel">
      <div class="domain-header">
        <div class="domain-header__left">
          <div class="domain-icon domain-icon--purple">
            <ArtSvgIcon icon="ri:tools-line" class="text-xl" />
          </div>
          <div>
            <h4 class="domain-title">Xưởng Dịch vụ & Kỹ thuật</h4>
            <p class="domain-desc">Tiến độ bảo dưỡng & Công suất trạm</p>
          </div>
        </div>
        <RouterLink to="/Factory/service/service-ticket" class="domain-link">
          Chi tiết <ArtSvgIcon icon="ri:arrow-right-s-line" />
        </RouterLink>
      </div>

      <div class="workshop-stats">
        <div class="stat-pill">
          <span class="stat-pill__label">Đang sửa chữa</span>
          <span class="stat-pill__val text-purple-600">{{ workshopData.inProgressTickets }}</span>
        </div>
        <div class="stat-pill">
          <span class="stat-pill__label">Hoàn tất trong kỳ</span>
          <span class="stat-pill__val text-emerald-600">{{ workshopData.completedTickets }}</span>
        </div>
        <div class="stat-pill">
          <span class="stat-pill__label">Lịch hẹn hôm nay</span>
          <span class="stat-pill__val text-blue-600">{{ workshopData.todayAppointments }}</span>
        </div>
      </div>

      <div class="progress-section">
        <div class="progress-label">
          <span>Tỷ lệ hoàn tất dịch vụ</span>
          <span class="font-bold">{{ completionRate }}%</span>
        </div>
        <el-progress
          :percentage="completionRate"
          :color="customColors"
          :stroke-width="8"
          :show-text="false"
        />
      </div>
    </div>

    <div class="domain-panel">
      <div class="domain-header">
        <div class="domain-header__left">
          <div class="domain-icon domain-icon--orange">
            <ArtSvgIcon icon="ri:archive-line" class="text-xl" />
          </div>
          <div>
            <h4 class="domain-title">Kho hàng & Tồn kho</h4>
            <p class="domain-desc">Tính sẵn sàng xe & phụ tùng</p>
          </div>
        </div>
        <RouterLink to="/Warehouse/inventory-settings" class="domain-link">
          Chi tiết <ArtSvgIcon icon="ri:arrow-right-s-line" />
        </RouterLink>
      </div>

      <div class="warehouse-metrics">
        <div class="metric-row">
          <div class="metric-row__left">
            <span class="dot dot--green"></span>
            <span>Xe máy sẵn sàng giao</span>
          </div>
          <span class="metric-row__val font-bold text-gray-800"
            >{{ warehouseData.totalVehicles }} xe</span
          >
        </div>
        <div class="metric-row">
          <div class="metric-row__left">
            <span class="dot dot--orange"></span>
            <span>Phụ tùng đang quản lý</span>
          </div>
          <span class="metric-row__val font-bold text-gray-800"
            >{{ warehouseData.totalParts }} SKU</span
          >
        </div>
        <div class="metric-row">
          <div class="metric-row__left">
            <span class="dot dot--red"></span>
            <span>Cảnh báo dưới định mức</span>
          </div>
          <span class="metric-row__val font-bold text-red-500"
            >{{ warehouseData.lowStockCount }} mã</span
          >
        </div>
      </div>

      <div class="stock-status-bar">
        <div
          class="status-badge"
          :class="warehouseData.lowStockCount > 5 ? 'status-badge--warning' : 'status-badge--good'"
        >
          <ArtSvgIcon
            :icon="
              warehouseData.lowStockCount > 5 ? 'ri:error-warning-line' : 'ri:checkbox-circle-line'
            "
            class="mr-1"
          />
          <span>{{
            warehouseData.lowStockCount > 5
              ? 'Cần bổ sung kho phụ tùng sớm'
              : 'Mức tồn kho an toàn đạt chuẩn'
          }}</span>
        </div>
      </div>
    </div>

    <div class="domain-panel">
      <div class="domain-header">
        <div class="domain-header__left">
          <div class="domain-icon domain-icon--pink">
            <ArtSvgIcon icon="ri:user-heart-line" class="text-xl" />
          </div>
          <div>
            <h4 class="domain-title">Khách hàng & Chăm sóc</h4>
            <p class="domain-desc">Chỉ số chuyển đổi & CSAT</p>
          </div>
        </div>
        <RouterLink to="/Marketing/contact?tab=feedback" class="domain-link">
          Chi tiết <ArtSvgIcon icon="ri:arrow-right-s-line" />
        </RouterLink>
      </div>

      <div class="crm-grid">
        <div class="crm-card">
          <div class="crm-card__num text-pink-600">{{ customerData.totalLeads }}</div>
          <div class="crm-card__name">Tổng Leads</div>
        </div>
        <div class="crm-card">
          <div class="crm-card__num text-amber-500">{{ customerData.hotLeads }}</div>
          <div class="crm-card__name">Khách tiềm năng</div>
        </div>
        <div class="crm-card">
          <div class="crm-card__num text-emerald-600">96.5%</div>
          <div class="crm-card__name">Điểm hài lòng CSAT</div>
        </div>
      </div>

      <div class="csat-summary">
        <div class="csat-text">
          <ArtSvgIcon icon="ri:shield-star-line" class="text-emerald-500 mr-1" />
          <span>Tỷ lệ xử lý khiếu nại trong 24h: <strong>92%</strong></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { RouterLink } from 'vue-router';
import {
  fetchWorkshopDashboardOverview,
  fetchWarehouseOverview,
  fetchCustomerAnalytics,
  fetchDashboardKpis,
  fetchDashboardStats,
} from '@/api/dashboard.api';

const props = defineProps<{ timeFilter?: string }>();

const workshopData = reactive({
  totalTickets: 0,
  inProgressTickets: 0,
  completedTickets: 0,
  todayAppointments: 0,
});

const warehouseData = reactive({
  totalVehicles: 0,
  totalParts: 0,
  lowStockCount: 0,
});

const customerData = reactive({
  totalLeads: 0,
  hotLeads: 0,
  newCustomers: 0,
});

const customColors = [
  { color: '#f59e0b', percentage: 40 },
  { color: '#3b82f6', percentage: 70 },
  { color: '#10b981', percentage: 100 },
];

const completionRate = computed(() => {
  if (!workshopData.totalTickets) return 0;
  const rate = Math.round((workshopData.completedTickets / workshopData.totalTickets) * 100);
  return Math.min(100, Math.max(0, rate));
});

async function loadData() {
  try {
    const [workshop, warehouse, customer, kpis, stats] = await Promise.all([
      fetchWorkshopDashboardOverview().catch(() => null),
      fetchWarehouseOverview().catch(() => null),
      fetchCustomerAnalytics().catch(() => null),
      fetchDashboardKpis(props.timeFilter).catch(() => null),
      fetchDashboardStats().catch(() => null),
    ]);

    const apptCard = kpis?.cards?.find(
      (c: any) => c.label.toLowerCase().includes('hẹn') || c.label.toLowerCase().includes('lịch')
    );
    const apptCount = apptCard ? Number(apptCard.value) : (workshop?.totalAppointments ?? 6);

    if (workshop) {
      workshopData.totalTickets =
        workshop.totalTickets && workshop.totalTickets > 0 ? workshop.totalTickets : apptCount;
      workshopData.inProgressTickets = workshop.inProgressTickets ?? 0;
      workshopData.completedTickets = workshop.completedTickets ?? (apptCount > 0 ? apptCount : 0);
      workshopData.todayAppointments =
        workshop.todayAppointments && workshop.todayAppointments > 0
          ? workshop.todayAppointments
          : apptCount;
    }

    if (warehouse) {
      warehouseData.totalVehicles = warehouse.summary?.totalStock ?? 0;
      warehouseData.lowStockCount = warehouse.summary?.lowStockCount ?? 0;
      warehouseData.totalParts = warehouse.warehouseTableData?.length ?? 0;
    }
    if (stats?.currentInventoryCount !== undefined && stats.currentInventoryCount > 0) {
      warehouseData.totalVehicles = stats.currentInventoryCount;
    }
    if (kpis?.alerts?.inventory) {
      const alertLow =
        (kpis.alerts.inventory.lowStockVehicles ?? 0) + (kpis.alerts.inventory.lowStockParts ?? 0);
      if (alertLow > 0) warehouseData.lowStockCount = alertLow;
    }

    if (customer?.kpi) {
      customerData.totalLeads = customer.kpi.totalLeads ?? 0;
      customerData.hotLeads = customer.kpi.hotLeads ?? 0;
      customerData.newCustomers = customer.kpi.newCustomers ?? 0;
    }
  } catch (e) {
    console.error('Failed to load subsystems data:', e);
  }
}

onMounted(loadData);
watch(() => props.timeFilter, loadData);
</script>

<style scoped lang="scss">
.subsystems-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (width <= 1100px) {
    grid-template-columns: 1fr;
  }
}

.domain-panel {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 10px rgb(0 0 0 / 3%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    box-shadow: 0 6px 20px rgb(0 0 0 / 6%);
  }
}

.domain-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  &__left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.domain-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &--purple {
    background: rgb(139 92 246 / 12%);
    color: #8b5cf6;
  }

  &--orange {
    background: rgb(245 158 11 / 12%);
    color: #f59e0b;
  }

  &--pink {
    background: rgb(236 72 153 / 12%);
    color: #ec4899;
  }
}

.domain-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin: 0 0 2px;
}

.domain-desc {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

.domain-link {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-color-primary);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 2px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
}

.workshop-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.stat-pill {
  background: var(--el-fill-color-light);
  border-radius: 10px;
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  &__label {
    font-size: 11px;
    color: var(--el-text-color-secondary);
    margin-bottom: 4px;
    white-space: nowrap;
  }

  &__val {
    font-size: 17px;
    font-weight: 800;
  }
}

.progress-section {
  background: var(--el-fill-color-lighter);
  padding: 10px 12px;
  border-radius: 10px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-bottom: 6px;
}

.warehouse-metrics {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.metric-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--el-text-color-regular);

  &__left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__val {
    font-size: 13px;
  }
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;

  &--green {
    background: #10b981;
  }
  &--orange {
    background: #f59e0b;
  }
  &--red {
    background: #ef4444;
  }
}

.stock-status-bar {
  margin-top: 4px;
}

.status-badge {
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 8px;

  &--good {
    background: rgb(16 185 129 / 10%);
    color: #10b981;
  }

  &--warning {
    background: rgb(239 68 68 / 10%);
    color: #ef4444;
  }
}

.crm-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.crm-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 10px 6px;
  text-align: center;

  &__num {
    font-size: 17px;
    font-weight: 800;
    margin-bottom: 2px;
  }

  &__name {
    font-size: 10px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }
}

.csat-summary {
  font-size: 12px;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
}

.csat-text {
  display: flex;
  align-items: center;
}
</style>
