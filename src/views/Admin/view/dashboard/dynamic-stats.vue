<template>
  <div class="art-card h-128 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>Hoạt động Hệ thống</h4>
        <p>Audit Log toàn bộ hệ thống</p>
      </div>
    </div>

    <div class="h-9/10 mt-2 overflow-hidden">
      <ElScrollbar>
        <div
          class="h-17.5 leading-17.5 border-b border-g-300 text-sm overflow-hidden whitespace-nowrap text-ellipsis last:border-b-0"
          v-for="(item, index) in list"
          :key="index"
        >
          <span class="text-g-800 font-medium">{{ item.username }}</span>
          <span class="mx-2 text-g-600">{{ item.type }}</span>
          <span class="text-theme">{{ item.target }}</span>
        </div>
      </ElScrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { ElScrollbar } from "element-plus";

interface DynamicItem {
  username: string;
  type: string;
  target: string;
}

const list = reactive<DynamicItem[]>([
  {
    username: "Admin A",
    type: "đã thay đổi hoa hồng",
    target: "Winner X (lên 700k)",
  },
  {
    username: "Kế toán B",
    type: "đã hủy Hóa đơn",
    target: "HD-2026-05041",
  },
  {
    username: "Quản lý C",
    type: "đã chốt bảng lương",
    target: "Tháng 4/2026",
  },
  {
    username: "Hệ thống",
    type: "tự động gia hạn HĐ",
    target: "NCC Dầu nhớt Castrol",
  },
  {
    username: "Kỹ thuật viên D",
    type: "hoàn tất phiếu sửa chữa",
    target: "PSC-9982",
  },
  {
    username: "Sale E",
    type: "đã tạo đơn hàng mới",
    target: "DH-2026-00912",
  },
]);
</script>
