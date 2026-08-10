<script setup lang="ts">
interface ColorOption {
  colorId: number;
  colorName: string;
  colorCode: string | null;
  imageUrl: string | null;
}

const props = defineProps<{
  variantId: number;
  slug?: string | null;
  variantName?: string;
  productName?: string;
  sku?: string;
  price?: number | null;
  colors?: ColorOption[];
}>();

// Cùng khuôn với ChatDrawer.vue (VITE_PUBLIC_API_URL_FOR_BROWSER_CLIENT) — luôn có fallback, tránh
// href thành "undefined/product/..." nếu biến môi trường chưa được cấu hình ở nơi đang chạy.
const { VITE_PUBLIC_STORE_URL } = import.meta.env;
const storeUrl = VITE_PUBLIC_STORE_URL || 'http://localhost:3000';

const showColors = ref(false);
const selectedColor = ref<ColorOption | null>(null);

const productUrl = (colorId?: number) => {
  if (!props.slug) return null;
  const colorQuery = colorId != null ? `&color=${colorId}` : '';
  return `${storeUrl}/product/${props.slug}?variant=${props.variantId}${colorQuery}`;
};

const onCardClick = () => {
  if (!props.slug) return;
  if (props.colors?.length) {
    showColors.value = !showColors.value;
    return;
  }
  window.open(productUrl() ?? undefined, '_blank', 'noopener');
};

const priceLabel = computed(() => {
  if (props.price === undefined || props.price === null) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(props.price);
});
</script>

<template>
  <div class="w-full">
    <button
      class="flex items-center justify-between gap-3 w-full p-2.5 bg-white border border-gray-100 rounded-2xl shadow-sm transition-all text-left"
      :class="slug ? 'hover:border-blue-300 hover:shadow-md' : 'opacity-50 cursor-not-allowed'"
      :disabled="!slug"
      @click="onCardClick"
    >
      <div class="min-w-0 flex-1">
        <p
          v-if="productName"
          class="text-[9px] font-semibold text-gray-400 uppercase tracking-wider truncate"
        >
          {{ productName }}
        </p>
        <p class="text-xs font-bold text-gray-900 truncate">
          {{ variantName }}
        </p>
        <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
          {{ sku }}
        </p>
        <p v-if="selectedColor" class="text-[10px] font-semibold text-blue-600 mt-0.5">
          Màu: {{ selectedColor.colorName }}
        </p>
      </div>
      <p class="text-xs font-bold text-blue-600 shrink-0">{{ priceLabel }}</p>
    </button>
    <div v-if="showColors" class="flex flex-wrap gap-1.5 mt-1.5 pl-1">
      <a
        v-for="color in colors"
        :key="color.colorId"
        :href="productUrl(color.colorId) ?? undefined"
        target="_blank"
        rel="noopener"
        class="flex items-center gap-1 pl-1 pr-2 h-6 rounded-full border transition-all"
        :class="
          selectedColor?.colorId === color.colorId
            ? 'border-blue-500 ring-1 ring-blue-200 bg-blue-50'
            : 'border-gray-200 bg-white hover:border-blue-300'
        "
        @click="selectedColor = color"
      >
        <span
          class="w-3.5 h-3.5 rounded-full border border-gray-200 shrink-0"
          :style="{ backgroundColor: color.colorCode || '#ccc' }"
        />
        <span class="text-[10px] font-semibold text-gray-700 whitespace-nowrap">{{
          color.colorName
        }}</span>
      </a>
    </div>
  </div>
</template>
