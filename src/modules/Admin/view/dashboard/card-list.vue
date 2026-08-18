<template>
  <div class="kpi-grid mb-5">
    <div
      v-for="item in dataList"
      :key="item.label"
      class="kpi-card"
      :class="`kpi-card--${item.color}`"
    >
      <div class="kpi-card__icon">
        <ArtSvgIcon :icon="item.icon" class="text-2xl" />
      </div>
      <div class="kpi-card__body">
        <div class="kpi-card__label">{{ item.label }}</div>
        <div class="kpi-card__value">{{ item.value }}</div>
        <div class="kpi-card__meta">
          <span class="kpi-card__badge">{{ PERIOD_LABELS[timeFilter] ?? 'Kỳ này' }}</span>
          <span v-if="item.change !== null" class="kpi-card__change" :class="item.change >= 0 ? 'up' : 'down'">
            {{ item.change >= 0 ? '▲' : '▼' }} {{ Math.abs(item.change) }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import { fetchDashboardKpis } from '@/api/dashboard.api';

const props = defineProps<{
  timeFilter: string;
  dateRange?: [Date, Date] | string[] | null;
}>();

const PERIOD_LABELS: Record<string, string> = {
  today: 'Hôm nay',
  week: 'Tuần này',
  month: 'Tháng này',
  year: 'Năm nay',
};

const COLOR_MAP: Record<number, string> = { 0: 'blue', 1: 'green', 2: 'orange', 3: 'red' };

interface DataItem {
  label: string;
  value: string;
  icon: string;
  color: string;
  change: number | null;
}

const dataList = reactive<DataItem[]>([]);

function fmt(v: number): string {
  if (v >= 1e9) return (v / 1e9).toFixed(1) + ' tỷ';
  if (v >= 1e6) return (v / 1e6).toFixed(0) + ' triệu';
  return v.toLocaleString('vi-VN');
}

function resolveIcon(apiIcon: string): string {
  if (apiIcon && apiIcon.includes(':')) return apiIcon;
  const iconMap: Record<string, string> = {
    orders: 'ri:shopping-bag-3-line',
    users: 'ri:group-line',
    calendar: 'ri:calendar-check-line',
    'user-add': 'ri:user-add-line',
    revenue: 'ri:money-dollar-circle-line',
    warning: 'ri:alarm-warning-line',
    clock: 'ri:time-line',
  };
  return iconMap[apiIcon] ?? 'ri:bar-chart-box-line';
}

async function load() {
  try {
    const kpis = await fetchDashboardKpis(props.timeFilter);
    dataList.length = 0;
    (kpis.cards ?? []).forEach((c: any, i: number) => {
      dataList.push({
        label: c.label,
        value: fmt(Number(c.value)),
        icon: resolveIcon(c.icon),
        color: COLOR_MAP[i % 4] ?? 'blue',
        change: c.change ?? null,
      });
    });
  } catch (e) {
    console.error(e);
  }
}

onMounted(load);
watch(() => props.timeFilter, load);
watch(() => props.dateRange, load);
</script>

<style scoped lang="scss">
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 640px)  { grid-template-columns: 1fr; }
}

.kpi-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  border-radius: 14px;
  padding: 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    border-radius: 14px 14px 0 0;
  }

  &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }

  &--blue::before   { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
  &--green::before  { background: linear-gradient(90deg, #10b981, #34d399); }
  &--orange::before { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
  &--red::before    { background: linear-gradient(90deg, #ef4444, #f87171); }

  &__icon {
    flex-shrink: 0;
    width: 52px; height: 52px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;

    .kpi-card--blue &   { background: rgba(59,130,246,0.12); color: #3b82f6; }
    .kpi-card--green &  { background: rgba(16,185,129,0.12); color: #10b981; }
    .kpi-card--orange & { background: rgba(245,158,11,0.12); color: #f59e0b; }
    .kpi-card--red &    { background: rgba(239,68,68,0.12);  color: #ef4444; }
  }

  &__body { flex: 1; min-width: 0; }

  &__label {
    font-size: 11px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  &__value {
    font-size: 28px;
    font-weight: 800;
    color: var(--el-text-color-primary);
    line-height: 1.2;
    margin-bottom: 6px;
  }

  &__meta { display: flex; align-items: center; gap: 8px; }

  &__badge {
    font-size: 11px;
    padding: 2px 8px;
    background: var(--el-fill-color-light);
    border-radius: 20px;
    color: var(--el-text-color-secondary);
  }

  &__change {
    font-size: 12px; font-weight: 600;
    &.up   { color: #10b981; }
    &.down { color: #ef4444; }
  }
}
</style>
