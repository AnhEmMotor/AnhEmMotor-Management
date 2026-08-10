<template>
  <div class="resp-page voucher-detail-page flex flex-col gap-5 pb-10">
    <div v-if="loading" class="flex items-center justify-center py-20">
      <ElSkeleton :rows="6" animated />
    </div>

    <ElEmpty v-else-if="!voucher" description="Không tìm thấy thông tin voucher" />

    <template v-else>
      <div
        class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5"
      >
        <div class="flex items-center gap-3 mb-4">
          <ElButton circle plain @click="goBack">
            <ArtSvgIcon icon="ri:arrow-left-line" class="text-lg" />
          </ElButton>
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <span
              class="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg font-mono font-black text-gray-800 dark:text-slate-100 text-base tracking-widest shrink-0"
            >
              {{ voucher.code }}
            </span>
            <h2
              class="m-0 text-xl font-bold text-gray-800 dark:text-slate-100 tracking-tight truncate"
            >
              {{ voucher.name }}
            </h2>
          </div>
          <ElTag :type="statusTag.type" effect="dark" round class="shrink-0">
            {{ statusTag.label }}
          </ElTag>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="kpi-card bg-gray-50 dark:bg-slate-800 rounded-xl p-3 text-center">
            <div class="text-xs text-gray-500 dark:text-slate-400 mb-1">Mức giảm</div>
            <div class="text-lg font-black text-red-500">
              {{
                voucher.discountType === 'PERCENT'
                  ? voucher.discountValue + '%'
                  : formatCurrency(voucher.discountValue)
              }}
            </div>
          </div>
          <div class="kpi-card bg-gray-50 dark:bg-slate-800 rounded-xl p-3 text-center">
            <div class="text-xs text-gray-500 dark:text-slate-400 mb-1">Loại giảm</div>
            <div class="text-base font-bold text-gray-800 dark:text-slate-100">
              {{ voucher.discountType === 'PERCENT' ? 'Phần trăm (%)' : 'Tiền mặt (đ)' }}
            </div>
          </div>
          <div class="kpi-card bg-gray-50 dark:bg-slate-800 rounded-xl p-3 text-center">
            <div class="text-xs text-gray-500 dark:text-slate-400 mb-1">Đối tượng</div>
            <div class="text-base font-bold text-gray-800 dark:text-slate-100">
              {{ voucher.type === 'PUBLIC' ? 'Công khai' : 'Riêng tư' }}
            </div>
          </div>
          <div class="kpi-card bg-gray-50 dark:bg-slate-800 rounded-xl p-3 text-center">
            <div class="text-xs text-gray-500 dark:text-slate-400 mb-1">KH được gán</div>
            <div
              class="text-lg font-bold"
              :class="
                voucher.type === 'PRIVATE'
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-400'
              "
            >
              {{ voucher.type === 'PRIVATE' ? voucher.assignedCustomerIds?.length || 0 : '∞' }}
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div
          class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5"
        >
          <h3
            class="text-base font-bold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2"
          >
            <ArtSvgIcon icon="ri:settings-3-line" class="text-blue-500" />
            Cấu hình áp dụng
          </h3>
          <div class="flex flex-col gap-3">
            <div
              class="detail-row flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-slate-800 last:border-0"
            >
              <span class="text-sm text-gray-500 dark:text-slate-400">Phạm vi sản phẩm</span>
              <div class="flex items-center gap-1.5">
                <ArtSvgIcon :icon="applyForConfig.icon" :class="applyForConfig.color" />
                <span class="text-sm font-semibold text-gray-800 dark:text-slate-100">{{
                  applyForConfig.label
                }}</span>
              </div>
            </div>

            <div
              class="detail-row flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-slate-800 last:border-0"
            >
              <span class="text-sm text-gray-500 dark:text-slate-400">Kênh bán hàng</span>
              <div class="flex items-center gap-1.5">
                <ArtSvgIcon :icon="channelConfig.icon" :class="channelConfig.color" />
                <span class="text-sm font-semibold text-gray-800 dark:text-slate-100">{{
                  channelConfig.label
                }}</span>
              </div>
            </div>

            <div
              class="detail-row flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-slate-800 last:border-0"
            >
              <span class="text-sm text-gray-500 dark:text-slate-400">Loại khuyến mãi</span>
              <ElTag
                :type="voucher.discountType === 'PERCENT' ? 'warning' : 'success'"
                effect="plain"
                round
                size="small"
              >
                {{ voucher.discountType === 'PERCENT' ? 'Giảm theo %' : 'Giảm tiền mặt' }}
              </ElTag>
            </div>

            <div
              class="detail-row flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-slate-800 last:border-0"
            >
              <span class="text-sm text-gray-500 dark:text-slate-400">Đối tượng</span>
              <ElTag
                :type="voucher.type === 'PUBLIC' ? 'primary' : 'info'"
                effect="plain"
                round
                size="small"
              >
                <div class="flex items-center gap-1">
                  <ArtSvgIcon
                    :icon="voucher.type === 'PUBLIC' ? 'ri:global-line' : 'ri:user-star-line'"
                  />
                  {{ voucher.type === 'PUBLIC' ? 'Công khai' : 'Riêng tư (Private)' }}
                </div>
              </ElTag>
            </div>

            <div
              v-if="voucher.discountType === 'PERCENT' && voucher.maxDiscountAmount"
              class="detail-row flex items-center justify-between py-2.5"
            >
              <span class="text-sm text-gray-500 dark:text-slate-400">Giảm tối đa</span>
              <span class="text-sm font-bold text-red-500">{{
                formatCurrency(voucher.maxDiscountAmount)
              }}</span>
            </div>
          </div>

          <div class="mt-5 flex gap-2">
            <ElButton type="primary" size="small" round @click="goEdit">
              <ArtSvgIcon icon="ri:edit-line" class="mr-1" /> Chỉnh sửa
            </ElButton>
          </div>
        </div>

        <div
          class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5"
        >
          <h3
            class="text-base font-bold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2"
          >
            <ArtSvgIcon icon="ri:calendar-2-line" class="text-purple-500" />
            Thời gian hiệu lực
          </h3>

          <div class="flex flex-col gap-3">
            <div
              class="detail-row flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-slate-800"
            >
              <div class="flex items-center gap-2">
                <div
                  class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center"
                >
                  <ArtSvgIcon icon="ri:play-circle-line" class="text-emerald-500" />
                </div>
                <span class="text-sm text-gray-500 dark:text-slate-400">Bắt đầu</span>
              </div>
              <span class="text-sm font-semibold text-gray-800 dark:text-slate-100">{{
                formatDateTime(voucher.validFrom)
              }}</span>
            </div>

            <div
              class="detail-row flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-slate-800"
            >
              <div class="flex items-center gap-2">
                <div
                  class="w-8 h-8 rounded-lg flex items-center justify-center"
                  :class="
                    isExpired ? 'bg-red-50 dark:bg-red-900/30' : 'bg-blue-50 dark:bg-blue-900/30'
                  "
                >
                  <ArtSvgIcon
                    icon="ri:stop-circle-line"
                    :class="isExpired ? 'text-red-500' : 'text-blue-500'"
                  />
                </div>
                <span class="text-sm text-gray-500 dark:text-slate-400">Kết thúc</span>
              </div>
              <span
                class="text-sm font-semibold"
                :class="isExpired ? 'text-red-500' : 'text-gray-800 dark:text-slate-100'"
              >
                {{ formatDateTime(voucher.validTo) }}
              </span>
            </div>

            <div class="py-3">
              <div class="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>Tiến độ</span>
                <span>{{ progressLabel }}</span>
              </div>
              <div class="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  :class="statusTag.progressColor"
                  :style="{ width: progressPercent + '%' }"
                />
              </div>
            </div>

            <div
              v-if="!isExpired && !isUpcoming"
              class="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 flex items-center gap-2"
            >
              <ArtSvgIcon icon="ri:time-line" class="text-emerald-500" />
              <span class="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                Còn <strong>{{ daysLeft }} ngày</strong> hiệu lực
              </span>
            </div>
            <div
              v-else-if="isUpcoming"
              class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 flex items-center gap-2"
            >
              <ArtSvgIcon icon="ri:time-line" class="text-blue-500" />
              <span class="text-sm font-semibold text-blue-700 dark:text-blue-400">
                Bắt đầu sau <strong>{{ daysToStart }} ngày</strong>
              </span>
            </div>
            <div v-else class="bg-gray-50 dark:bg-slate-800 rounded-xl p-3 flex items-center gap-2">
              <ArtSvgIcon icon="ri:error-warning-line" class="text-gray-400" />
              <span class="text-sm font-semibold text-gray-500 dark:text-slate-400"
                >Voucher đã hết hạn</span
              >
            </div>

            <div class="flex items-center justify-between pt-1">
              <span class="text-xs text-gray-400 dark:text-slate-500">Ngày tạo</span>
              <span class="text-xs text-gray-500 dark:text-slate-400">
                {{ voucher.createdAt ? formatDateTime(voucher.createdAt) : '—' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="voucher.type === 'PRIVATE'"
        class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-5"
      >
        <h3
          class="text-base font-bold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2"
        >
          <ArtSvgIcon icon="ri:group-line" class="text-purple-500" />
          Khách hàng được chỉ định
          <ElTag type="info" effect="plain" round size="small" class="ml-auto">
            {{ voucher.assignedCustomerIds?.length || 0 }} khách
          </ElTag>
        </h3>

        <div v-if="!voucher.assignedCustomerIds?.length" class="text-center text-gray-400 py-8">
          <ArtSvgIcon icon="ri:user-add-line" class="text-3xl mb-2 block mx-auto" />
          <p class="text-sm">Chưa có khách hàng được chỉ định</p>
        </div>

        <div v-else class="flex flex-wrap gap-2">
          <div
            v-for="leadId in voucher.assignedCustomerIds"
            :key="leadId"
            class="assigned-chip flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl hover:border-purple-200 transition-colors"
          >
            <div
              class="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center"
            >
              <ArtSvgIcon icon="ri:user-line" class="text-purple-500 text-xs" />
            </div>
            <span class="text-xs font-bold text-gray-700 dark:text-slate-200"
              >Lead #{{ leadId }}</span
            >
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getVoucherById } from '@/api/marketing/voucher.api';
import dayjs from 'dayjs';

defineOptions({ name: 'CustomerVoucherDetail' });

const router = useRouter();
const route = useRoute();

interface VoucherDetail {
  id: number;
  code: string;
  name: string;
  applyFor: 'ALL' | 'VEHICLE' | 'PART';
  channel: 'ALL' | 'STORE' | 'WEBSITE';
  type: 'PUBLIC' | 'PRIVATE';
  discountType: 'PERCENT' | 'AMOUNT';
  discountValue: number;
  maxDiscountAmount?: number;
  validFrom: string;
  validTo: string;
  createdAt?: string;
  assignedCustomerIds: number[];
}

const loading = ref(true);
const voucher = ref<VoucherDetail | null>(null);

const formatCurrency = (val?: number) => {
  if (!val && val !== 0) return '0đ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(val);
};
const formatDateTime = (val: string) => dayjs(val).format('DD/MM/YYYY HH:mm');

const isExpired = computed(() =>
  voucher.value ? dayjs().isAfter(dayjs(voucher.value.validTo)) : false
);
const isUpcoming = computed(() =>
  voucher.value ? dayjs().isBefore(dayjs(voucher.value.validFrom)) : false
);

const daysLeft = computed(() =>
  voucher.value ? Math.max(0, dayjs(voucher.value.validTo).diff(dayjs(), 'day')) : 0
);
const daysToStart = computed(() =>
  voucher.value ? Math.max(0, dayjs(voucher.value.validFrom).diff(dayjs(), 'day')) : 0
);

const progressPercent = computed(() => {
  if (!voucher.value || isUpcoming.value) return 0;
  if (isExpired.value) return 100;
  const total = dayjs(voucher.value.validTo).diff(dayjs(voucher.value.validFrom), 'minute');
  const elapsed = dayjs().diff(dayjs(voucher.value.validFrom), 'minute');
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
});

const progressLabel = computed(() => {
  if (isUpcoming.value) return 'Chưa bắt đầu';
  if (isExpired.value) return 'Đã kết thúc';
  return `${progressPercent.value}% đã qua`;
});

const statusTag = computed(() => {
  if (isUpcoming.value)
    return {
      label: 'Sắp diễn ra',
      type: 'primary' as const,
      progressColor: 'bg-blue-400',
    };
  if (isExpired.value)
    return {
      label: 'Đã hết hạn',
      type: 'info' as const,
      progressColor: 'bg-gray-400',
    };
  return {
    label: 'Đang hoạt động',
    type: 'success' as const,
    progressColor: 'bg-emerald-500',
  };
});

const applyForConfig = computed(() => {
  switch (voucher.value?.applyFor) {
    case 'VEHICLE':
      return {
        label: 'Chỉ Xe máy',
        icon: 'ri:motorbike-line',
        color: 'text-emerald-500',
      };
    case 'PART':
      return {
        label: 'Chỉ Phụ tùng',
        icon: 'ri:tools-line',
        color: 'text-purple-500',
      };
    default:
      return {
        label: 'Xe & Phụ tùng',
        icon: 'ri:function-line',
        color: 'text-blue-500',
      };
  }
});
const channelConfig = computed(() => {
  switch (voucher.value?.channel) {
    case 'STORE':
      return {
        label: 'Cửa hàng',
        icon: 'ri:store-2-line',
        color: 'text-emerald-500',
      };
    case 'WEBSITE':
      return {
        label: 'Website',
        icon: 'ri:global-line',
        color: 'text-orange-500',
      };
    default:
      return {
        label: 'Tất cả kênh',
        icon: 'ri:store-3-line',
        color: 'text-blue-500',
      };
  }
});

const goBack = () => router.push('/Marketing/customer/voucher');
const goEdit = () => router.push(`/Marketing/customer/voucher/save?id=${voucher.value?.id}`);

onMounted(async () => {
  const id = Number(route.params.id);
  if (!id) {
    ElMessage.error('ID voucher không hợp lệ');
    goBack();
    return;
  }
  try {
    const res: any = await getVoucherById(id);
    voucher.value = res?.value ?? res?.data ?? res ?? null;
    if (!voucher.value) ElMessage.error('Không tìm thấy voucher');
  } catch {
    ElMessage.error('Không thể tải thông tin voucher');
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.voucher-detail-page {
  .kpi-card {
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-1px);
    }
  }

  .detail-row {
    transition: background 0.15s;
    border-radius: 8px;
    padding-left: 8px;
    padding-right: 8px;

    &:hover {
      background: #f9fafb;
    }
  }

  .assigned-chip {
    transition:
      border-color 0.15s,
      box-shadow 0.15s;

    &:hover {
      box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
    }
  }
}
</style>
