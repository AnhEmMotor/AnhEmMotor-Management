<template>
  <div class="dashboard-panel mb-5">
    <div class="panel-header">
      <div class="panel-header__left">
        <div class="panel-icon panel-icon--amber">
          <ArtSvgIcon icon="ri:group-line" class="text-2xl" />
        </div>
        <div>
          <h4 class="panel-title">Tổng quan Người dùng</h4>
          <p class="panel-desc">Chỉ số tài khoản & hoạt động kinh doanh</p>
        </div>
      </div>
    </div>

    <div class="customer-grid">
      <div
        v-for="item in list"
        :key="item.name"
        class="customer-stat"
        :class="`customer-stat--${item.colorKey}`"
      >
        <div class="customer-stat__icon">
          <ArtSvgIcon :icon="item.icon" class="text-xl" />
        </div>
        <div class="customer-stat__content">
          <div class="customer-stat__num">{{ item.num }}</div>
          <div class="customer-stat__name">{{ item.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, watch } from 'vue';
import { fetchDashboardKpis, fetchDashboardStats } from '@/api/dashboard.api';
import { fetchGetUserList } from '@/api/auth/system-manage.api';
import type { DashboardKpisCard } from '@/api/dashboard.api';

const props = defineProps<{ timeFilter?: string }>();

interface DisplayItem {
  name: string;
  num: string;
  icon: string;
  colorKey: string;
}

const list = reactive<DisplayItem[]>([
  { name: 'Tổng Tài khoản',      num: '---', icon: 'ri:user-star-line',      colorKey: 'amber' },
  { name: 'Lịch hẹn trong kỳ',   num: '---', icon: 'ri:calendar-check-line', colorKey: 'blue'  },
  { name: 'Khách hàng mới',      num: '---', icon: 'ri:user-add-line',       colorKey: 'green' },
  { name: 'Đơn chờ xử lý',       num: '---', icon: 'ri:inbox-unarchive-line',colorKey: 'red'   },
]);

function fmt(n: number): string { return n.toLocaleString('vi-VN'); }

function itemMatches(card: DashboardKpisCard, key: string): boolean {
  const label = card.label.toLowerCase();
  if (key.includes('hẹn'))        return label.includes('lịch') || label.includes('hẹn');
  if (key.includes('Khách hàng mới')) return label.includes('khách hàng mới') || label.includes('mới');
  if (key.includes('Đơn'))        return label.includes('đơn') || label.includes('quá hạn') || label.includes('chờ');
  return false;
}

async function load() {
  try {
    // Lấy tổng số tài khoản trong hệ thống
    const userRes = await fetchGetUserList({ Page: 1, PageSize: 1 });
    if (userRes && typeof userRes.totalCount === 'number') {
      list[0].num = fmt(userRes.totalCount);
    }
  } catch (e) {
    console.error('Lỗi khi lấy tổng tài khoản', e);
  }

  try {
    const kpis = await fetchDashboardKpis(props.timeFilter);
    const kpisCards = kpis?.cards ?? [];
    for (let i = 1; i < list.length; i++) {
      const candidate = kpisCards.find((c) => itemMatches(c, list[i].name));
      if (candidate) list[i].num = fmt(Number(candidate.value));
    }

    try {
      const stats = await fetchDashboardStats();
      if (list[2].num === '---' || list[2].num === '0') list[2].num = fmt(stats.newCustomersCount ?? 0);
      if (list[3].num === '---' || list[3].num === '0') list[3].num = fmt(stats.pendingOrdersCount ?? 0);
    } catch {}

  } catch {}
}

onMounted(load);
watch(() => props.timeFilter, load);
</script>

<style scoped lang="scss">
.dashboard-panel {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 16px;
  padding: 20px 20px 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  &__left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.panel-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; flex-shrink: 0;

  &--amber { background: rgba(245,158,11,0.12); color: #f59e0b; }
}

.panel-title {
  font-size: 15px; font-weight: 700;
  color: var(--el-text-color-primary);
  margin: 0 0 2px;
}

.panel-desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

.customer-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  align-content: stretch;
}

.customer-stat {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 14px;
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  transition: all 0.2s;
  height: 100%;

  &:hover {
    border-color: transparent;
    box-shadow: 0 4px 14px rgba(0,0,0,0.09);
    transform: translateY(-1px);
  }

  &__icon {
    width: 40px; height: 40px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;

    .customer-stat--amber & { background: rgba(245,158,11,0.12); color: #f59e0b; }
    .customer-stat--blue &  { background: rgba(59,130,246,0.12);  color: #3b82f6; }
    .customer-stat--green & { background: rgba(16,185,129,0.12);  color: #10b981; }
    .customer-stat--red &   { background: rgba(239,68,68,0.12);   color: #ef4444; }
  }

  &__content { flex: 1; }

  &__num {
    font-size: 22px; font-weight: 700;
    color: var(--el-text-color-primary);
    line-height: 1.2;
  }

  &__name {
    font-size: 11px;
    color: var(--el-text-color-secondary);
    margin-top: 2px;
  }
}
</style>

