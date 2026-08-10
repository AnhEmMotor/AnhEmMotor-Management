<template>
  <div class="resp-page art-card h-128 flex flex-col p-5 mb-5 max-sm:mb-4">
    <div class="title">
      <h4 class="text-lg font-bold text-gray-800 dark:text-gray-100">Khách hàng</h4>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
      <div
        v-for="item in list"
        :key="item.name"
        class="hover-card relative flex flex-col items-start cursor-pointer rounded-2xl p-4 pt-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors select-none"
      >
        <div class="absolute top-2 right-3">
          <el-tag type="info" size="small" effect="plain" round>Có thể click</el-tag>
        </div>
        <div
          class="mb-2 w-10 h-10 rounded-full flex items-center justify-center"
          :class="item.bgClass"
        >
          <ArtSvgIcon :icon="item.icon" class="text-lg" :class="item.colorClass" />
        </div>
        <div class="flex-1 w-full">
          <div class="text-sm text-gray-500 dark:text-gray-400 truncate" :title="item.name">
            {{ item.name }}
          </div>
          <div class="text-left text-xl mt-1 font-bold text-gray-800 dark:text-gray-100">
            {{ item.num }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { fetchDashboardKpis } from '@/api/dashboard.api';
import { type DashboardKpisCard } from '@/api/dashboard.api';

const DEFAULT_COLOR = {
  colorClass: 'text-orange-500',
  bgClass: 'bg-orange-50 dark:bg-orange-900/30',
};

interface DisplayItem {
  name: string;
  num: string;
  icon: string;
  colorClass: string;
  bgClass: string;
}

const list = reactive<DisplayItem[]>([
  {
    name: 'KH Tiềm năng',
    num: '---',
    icon: 'users',
    colorClass: 'text-amber-500',
    bgClass: 'bg-amber-50 dark:bg-amber-900/30',
  },
  {
    name: 'Lịch hẹn hôm nay',
    num: '---',
    icon: 'calendar',
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50 dark:bg-blue-900/30',
  },
  {
    name: 'KH Mới (tháng)',
    num: '---',
    icon: 'user-add',
    colorClass: 'text-emerald-500',
    bgClass: 'bg-emerald-50 dark:bg-emerald-900/30',
  },
  { name: 'Đơn hàng chưa xử lý', num: '---', icon: 'orders', ...DEFAULT_COLOR },
]);

function fmtCard(card: DashboardKpisCard): string {
  const n = Number(card.value);
  if (Number.isNaN(n)) return String(card.value);
  if (card.unit === 'đ' || card.label.toLowerCase().includes('doanh thu')) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(n);
  }
  return n.toLocaleString('vi-VN');
}

function itemMatches(card: DashboardKpisCard, key: string): boolean {
  const label = card.label.toLowerCase();
  if (key.includes('Tiềm năng')) return label.includes('tiềm năng') || label.includes('leads');
  if (key.includes('hẹn'))
    return label.includes('lịch') || label.includes('hẹn') || label.includes('appointment');
  if (key.includes('Mới'))
    return label.includes('mới') || label.includes('khách hàng') || label.includes('customer');
  if (key.includes('Đơn hàng')) return label.includes('đơn') || label.includes('order');
  return label.includes(key.toLowerCase().split(' ')[0]);
}

async function load() {
  try {
    const kpis = await fetchDashboardKpis();
    const kpisCards = kpis?.cards ?? [];
    for (let i = 0; i < list.length; i++) {
      const candidate = kpisCards.find((c) => itemMatches(c, list[i].name));
      if (candidate) {
        list[i].num = fmtCard(candidate);
        list[i].icon = candidate.icon;
        list[i].colorClass = DEFAULT_COLOR.colorClass;
        list[i].bgClass = DEFAULT_COLOR.bgClass;
      }
    }
  } catch {}
}

onMounted(() => {
  load();
});
</script>
