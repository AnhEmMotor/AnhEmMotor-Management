<template>
  <div class="resp-page art-card h-128 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>Cảnh báo hệ thống</h4>
        <p>
          Cần xử lý gấp: <span class="text-danger">{{ totalAlerts }}</span>
        </p>
      </div>
    </div>

    <div class="flex-c mt-3 mb-0 gap-4">
      <ElButtonGroup>
        <ElButton
          :type="filter === 'day' ? 'primary' : 'default'"
          size="small"
          @click="setFilter('day')"
          >Hôm nay</ElButton
        >
        <ElButton
          :type="filter === 'week' ? 'primary' : 'default'"
          size="small"
          @click="setFilter('week')"
          >Tuần này</ElButton
        >
        <ElButton
          :type="filter === 'month' ? 'primary' : 'default'"
          size="small"
          @click="setFilter('month')"
          >Tháng này</ElButton
        >
      </ElButtonGroup>
    </div>

    <div v-if="isLoading" class="mt-4">
      <ElSkeleton :rows="3" animated />
    </div>
    <div v-else class="h-[calc(100%-40px)] overflow-auto">
      <ElScrollbar>
        <div
          v-for="(item, index) in list"
          :key="index"
          class="flex-cb h-17.5 border-b border-g-300 text-sm last:border-b-0"
        >
          <div class="flex-cb gap-2 w-full pr-2">
            <el-tag :type="item.priority" size="small" effect="light">{{
              item.categoryBadge
            }}</el-tag>
            <span class="text-g-800 font-medium truncate">{{ item.title }}</span>
            <span class="text-g-500 text-xs whitespace-nowrap">{{ item.timeAgo }}</span>
          </div>
          <span class="text-theme cursor-pointer font-medium whitespace-nowrap">{{
            item.actionLabel
          }}</span>
        </div>
      </ElScrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { fetchDashboardKpis } from '@/api/dashboard.api';

interface TodoItem {
  category: string;
  categoryBadge: string;
  title: string;
  desc: string;
  priority: 'success' | 'info' | 'warning' | 'danger';
  actionLabel: string;
  actionUrl: string;
  updatedAt: string;
  timeAgo: string;
}

const list = reactive<TodoItem[]>([]);
const isLoading = ref(false);
const totalAlerts = ref(0);
const filter = ref<'day' | 'week' | 'month'>('day');

const CATEGORY_COLORS: Record<string, TodoItem['priority']> = {
  financial: 'danger',
  inventory: 'warning',
  customer: 'danger',
  operations: 'info',
};

const CATEGORY_ICONS: Record<string, string> = {
  financial: '⚠️',
  inventory: '📦',
  customer: '👤',
  operations: '📋',
};

function buildTodoItem(category: string, count: number, title: string, url: string): TodoItem {
  const priority = CATEGORY_COLORS[category] ?? 'info';
  const categoryBadge = `${CATEGORY_ICONS[category] ?? '📌'} ${category}`;
  const now = new Date();
  return {
    category,
    categoryBadge,
    title: `${title} (${count})`,
    desc: count === 1 ? 'Cần xử lý ngay' : `${count} yêu cầu cần xử lý ngay`,
    priority,
    actionLabel: 'Xử lý',
    actionUrl: url,
    updatedAt: now.toISOString(),
    timeAgo: 'Vừa xong',
  };
}

function buildAlerts(alerts: any) {
  list.length = 0;
  if (alerts.financial.delayedLoans > 0) {
    list.push(
      buildTodoItem(
        'financial',
        alerts.financial.delayedLoans,
        'Trả góp trễ hạn',
        '/admin/finance/delayed'
      )
    );
  }
  if (alerts.inventory.lowStockVehicles > 0) {
    list.push(
      buildTodoItem(
        'inventory',
        alerts.inventory.lowStockVehicles,
        'Tồn kho xe thấp',
        '/admin/inventory/vehicles'
      )
    );
  }
  if (alerts.inventory.lowStockParts > 0) {
    list.push(
      buildTodoItem(
        'inventory',
        alerts.inventory.lowStockParts,
        'Tồn kho phụ tùng thấp',
        '/admin/inventory/parts'
      )
    );
  }
  if (alerts.customer.newComplaints > 0) {
    list.push(
      buildTodoItem(
        'customer',
        alerts.customer.newComplaints,
        'Khiếu nại mới',
        '/admin/customer/complaints'
      )
    );
  }
  if (alerts.customer.missedAppointments > 0) {
    list.push(
      buildTodoItem(
        'customer',
        alerts.customer.missedAppointments,
        'Lịch hẹn bị bỏ lỡ',
        '/admin/appointments'
      )
    );
  }
  if (alerts.operations.pendingOrders > 0) {
    list.push(
      buildTodoItem(
        'operations',
        alerts.operations.pendingOrders,
        'Đơn hàng chưa xử lý',
        '/admin/orders'
      )
    );
  }
  if (list.length === 0) {
    totalAlerts.value = 0;
  }
}

async function setFilter(f: 'day' | 'week' | 'month') {
  filter.value = f;
  await fetchData();
}

async function fetchData() {
  isLoading.value = true;
  try {
    const data = await fetchDashboardKpis();
    const total =
      (data.alerts.financial.delayedLoans ?? 0) +
      (data.alerts.inventory.lowStockVehicles ?? 0) +
      (data.alerts.inventory.lowStockParts ?? 0) +
      (data.alerts.customer.newComplaints ?? 0) +
      (data.alerts.customer.missedAppointments ?? 0) +
      (data.alerts.operations.pendingOrders ?? 0);
    totalAlerts.value = total;
    buildAlerts(data.alerts);
  } catch (error) {
    console.error('Failed to fetch todo alerts:', error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchData();
});
</script>
