<template>
  <ElRow :gutter="20" class="flex">
    <ElCol
      v-for="(item, index) in dataList"
      :key="index"
      :sm="12"
      :md="6"
      :lg="6"
    >
      <div
        class="art-card relative flex flex-col justify-center h-35 px-5 mb-5 max-sm:mb-4"
      >
        <span class="text-g-700 text-sm">{{ item.des }}</span>
        <!-- Thay vì ArtCountTo không nhận format VNĐ, dùng thẻ div và thêm text-gray-900 để không bị ẩn màu -->
        <h2 class="text-2xl font-bold text-gray-900 mt-2 mb-1">
          {{ item.num }}
        </h2>
        <div class="flex-c mt-1">
          <span class="text-xs text-g-600">So với tháng trước</span>
          <span
            class="ml-1 text-xs font-semibold"
            :class="[item.change >= 0 ? 'text-success' : 'text-danger']"
          >
            {{ item.change >= 0 ? "+" : "" }}{{ item.change }}%
          </span>
        </div>
        <div
          class="absolute top-0 bottom-0 right-5 m-auto size-12.5 rounded-xl flex-cc bg-theme/10"
        >
          <ArtSvgIcon :icon="item.icon" class="text-xl text-theme" />
        </div>
      </div>
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
import { reactive } from "vue";

interface CardDataItem {
  des: string;
  icon: string;
  num: number;
  change: number;
}

// Dữ liệu giả lập (Mock data) cho báo cáo tài chính
const dataList = reactive([
  {
    des: "Tổng thu (Đơn hàng)",
    icon: "ri:wallet-3-line",
    num: "1.3 tỷ đ",
    change: 12.5,
  },
  {
    des: "Tổng chi (Expenses)",
    icon: "ri:shopping-cart-2-line",
    num: "820 tr đ",
    change: -4.2,
  },
  {
    des: "Lợi nhuận gộp",
    icon: "ri:funds-line",
    num: "430 tr đ",
    change: 8.4,
  },
  {
    des: "Lợi nhuận ròng",
    icon: "ri:money-dollar-circle-line",
    num: "285 tr đ",
    change: 15.2,
  },
]);
</script>
