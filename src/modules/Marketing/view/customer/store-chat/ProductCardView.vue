<script setup lang="ts">
import { formatImageUrl } from '@/common/utils/image';

const props = defineProps<{
  productId: number;
  name: string;
  imageUrl?: string | null;
  priceFrom?: number | null;
  priceTo?: number | null;
}>();

const formatCurrency = (val?: number | null) => {
  if (val === undefined || val === null) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(val);
};

const priceLabel = computed(() => {
  if (!props.priceFrom) return 'Liên hệ';
  if (props.priceTo && props.priceTo !== props.priceFrom) {
    return `${formatCurrency(props.priceFrom)} - ${formatCurrency(props.priceTo)}`;
  }
  return formatCurrency(props.priceFrom);
});
</script>

<template>
  <div
    class="flex items-center gap-3 w-full p-2.5 bg-white border border-gray-100 rounded-2xl shadow-sm"
  >
    <el-image
      :src="formatImageUrl(imageUrl) || undefined"
      fit="cover"
      class="w-12 h-12 rounded-xl shrink-0 bg-gray-50"
    >
      <template #error>
        <div
          class="w-12 h-12 flex items-center justify-center bg-gray-50 text-gray-300 text-xs rounded-xl"
        >
          N/A
        </div>
      </template>
    </el-image>
    <div class="min-w-0 flex-1">
      <p class="text-xs font-bold text-gray-900 truncate">{{ name }}</p>
      <p class="text-xs font-semibold text-blue-600 mt-0.5">
        {{ priceLabel }}
      </p>
    </div>
  </div>
</template>
