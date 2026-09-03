<template>
  <div class="dashboard-panel mb-5">
    <div class="panel-header">
      <div class="panel-header__left">
        <div class="panel-icon panel-icon--red">
          <ArtSvgIcon icon="ri:alarm-warning-line" class="text-2xl" />
        </div>
        <div>
          <h4 class="panel-title">Cảnh báo Hệ thống</h4>
          <p class="panel-desc">
            Cần xử lý gấp:
            <span class="alert-total">{{ totalAlerts }}</span> vấn đề
          </p>
        </div>
      </div>
      <ElButtonGroup size="small">
        <ElButton :type="filter === 'day' ? 'primary' : 'default'" @click="setFilter('day')"
          >Hôm nay</ElButton
        >
        <ElButton :type="filter === 'week' ? 'primary' : 'default'" @click="setFilter('week')"
          >Tuần này</ElButton
        >
        <ElButton :type="filter === 'month' ? 'primary' : 'default'" @click="setFilter('month')"
          >Tháng này</ElButton
        >
      </ElButtonGroup>
    </div>

    <div v-if="isLoading" class="mt-4">
      <ElSkeleton :rows="4" animated />
    </div>
    <div v-else-if="list.length === 0" class="empty-state">
      <ArtSvgIcon icon="ri:shield-check-line" class="text-4xl" />
      <span>Không có cảnh báo nào</span>
      <small>Hệ thống đang hoạt động bình thường</small>
    </div>
    <ElScrollbar v-else class="alert-scroll">
      <div
        v-for="(item, index) in list"
        :key="index"
        class="alert-row"
        :class="`alert-row--${item.priority}`"
      >
        <div class="alert-row__icon-wrap" :class="`alert-row__icon-wrap--${item.priority}`">
          <span class="alert-row__emoji">{{ CATEGORY_EMOJI[item.category] ?? '📌' }}</span>
        </div>
        <div class="alert-row__body">
          <div class="alert-row__title">{{ item.title }}</div>
          <div class="alert-row__meta">
            <el-tag :type="item.priority" size="small" effect="light" round>
              {{ CATEGORY_LABELS[item.category] ?? item.category }}
            </el-tag>
            <span class="alert-row__time">{{ item.timeAgo }}</span>
          </div>
        </div>
        <RouterLink :to="item.actionUrl" class="alert-row__action">
          Xử lý <ArtSvgIcon icon="ri:arrow-right-line" class="text-xs" />
        </RouterLink>
      </div>
    </ElScrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { fetchDashboardKpis } from '@/api/dashboard.api';

const props = defineProps<{ timeFilter?: string }>();

interface TodoItem {
  category: string;
  title: string;
  desc: string;
  priority: 'success' | 'info' | 'warning' | 'danger';
  actionLabel: string;
  actionUrl: string;
  updatedAt: string;
  timeAgo: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  financial: '💰',
  inventory: '📦',
  customer: '👤',
  operations: '📋',
};
const CATEGORY_LABELS: Record<string, string> = {
  financial: 'Tài chính',
  inventory: 'Kho hàng',
  customer: 'Khách hàng',
  operations: 'Vận hành',
};
const CATEGORY_COLORS: Record<string, TodoItem['priority']> = {
  financial: 'danger',
  inventory: 'warning',
  customer: 'danger',
  operations: 'info',
};

const list = reactive<TodoItem[]>([]);
const isLoading = ref(false);
const totalAlerts = ref(0);

const FILTER_MAP: Record<string, 'day' | 'week' | 'month'> = {
  today: 'day',
  week: 'week',
  month: 'month',
  year: 'month',
};
const filter = ref<'day' | 'week' | 'month'>('day');

function buildTodoItem(category: string, count: number, title: string, url: string): TodoItem {
  return {
    category,
    title: `${title} (${count})`,
    desc: `${count} yêu cầu cần xử lý`,
    priority: CATEGORY_COLORS[category] ?? 'info',
    actionLabel: 'Xử lý',
    actionUrl: url,
    updatedAt: new Date().toISOString(),
    timeAgo: 'Vừa xong',
  };
}

function buildAlerts(alerts: any) {
  list.length = 0;
  if (alerts.financial.delayedLoans > 0)
    list.push(
      buildTodoItem(
        'financial',
        alerts.financial.delayedLoans,
        'Trả góp trễ hạn',
        '/admin/finance/delayed'
      )
    );
  if (alerts.inventory.lowStockVehicles > 0)
    list.push(
      buildTodoItem(
        'inventory',
        alerts.inventory.lowStockVehicles,
        'Tồn kho xe thấp',
        '/Warehouse/inventory-settings'
      )
    );
  if (alerts.inventory.lowStockParts > 0)
    list.push(
      buildTodoItem(
        'inventory',
        alerts.inventory.lowStockParts,
        'Tồn kho phụ tùng thấp',
        '/Warehouse/inventory-settings'
      )
    );
  if (alerts.customer.newComplaints > 0)
    list.push(
      buildTodoItem(
        'customer',
        alerts.customer.newComplaints,
        'Khiếu nại mới',
        '/Marketing/contact?tab=feedback'
      )
    );
  if (alerts.customer.missedAppointments > 0)
    list.push(
      buildTodoItem(
        'customer',
        alerts.customer.missedAppointments,
        'Lịch hẹn bị bỏ lỡ',
        '/admin/appointments'
      )
    );
  if (alerts.operations.pendingOrders > 0)
    list.push(
      buildTodoItem(
        'operations',
        alerts.operations.pendingOrders,
        'Đơn hàng chưa xử lý',
        '/Order/management/order'
      )
    );
}

async function setFilter(f: 'day' | 'week' | 'month') {
  filter.value = f;
  await fetchData();
}

async function fetchData() {
  isLoading.value = true;
  try {
    const period = props.timeFilter ?? filter.value;
    const data = await fetchDashboardKpis(period);
    if (data && data.alerts) {
      const total =
        (data.alerts.financial?.delayedLoans ?? 0) +
        (data.alerts.inventory?.lowStockVehicles ?? 0) +
        (data.alerts.inventory?.lowStockParts ?? 0) +
        (data.alerts.customer?.newComplaints ?? 0) +
        (data.alerts.customer?.missedAppointments ?? 0) +
        (data.alerts.operations?.pendingOrders ?? 0);
      totalAlerts.value = total;
      buildAlerts(data.alerts);
    }
  } catch (error) {
    console.error('Failed to fetch todo alerts:', error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchData);
watch(
  () => props.timeFilter,
  (val) => {
    if (val) filter.value = FILTER_MAP[val] ?? 'day';
    fetchData();
  }
);
</script>

<style scoped lang="scss">
.dashboard-panel {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 4%);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 16px;

  &__left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.panel-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;

  &--red {
    background: rgb(239 68 68 / 12%);
    color: #ef4444;
  }
}

.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin: 0 0 2px;
}

.panel-desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

.alert-total {
  font-weight: 700;
  color: #ef4444;
}

.alert-scroll {
  flex: 1;
  max-height: 400px;
}

.alert-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  transition: background 0.15s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--el-fill-color-light);
    border-radius: 10px;
    padding-left: 8px;
    padding-right: 8px;
  }

  &__icon-wrap {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 18px;

    &--danger {
      background: rgb(239 68 68 / 10%);
    }
    &--warning {
      background: rgb(245 158 11 / 10%);
    }
    &--info {
      background: rgb(59 130 246 / 10%);
    }
    &--success {
      background: rgb(16 185 129 / 10%);
    }
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__time {
    font-size: 11px;
    color: var(--el-text-color-placeholder);
  }

  &__action {
    font-size: 12px;
    font-weight: 600;
    color: var(--el-color-primary);
    text-decoration: none;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 5px 10px;
    border-radius: 8px;
    border: 1px solid var(--el-color-primary-light-5);
    transition: all 0.2s;
    flex-shrink: 0;

    &:hover {
      background: var(--el-color-primary);
      color: #fff;
      border-color: var(--el-color-primary);
    }
  }
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--el-text-color-placeholder);
  padding: 40px 0;

  :deep(svg),
  .text-4xl {
    font-size: 40px;
    color: #10b981;
  }
  span {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
  }
  small {
    font-size: 12px;
  }
}
</style>
