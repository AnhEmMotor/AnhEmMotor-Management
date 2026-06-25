<template>
  <div class="art-card p-5 mb-5">
    <div class="flex justify-between items-center mb-4">
      <h4 class="m-0 font-bold text-lg">GIAO DỊCH GẦN NHẤT</h4>
      <ElButton link type="primary">Xem tất cả</ElButton>
    </div>

    <ElTable
      :data="transactions"
      style="width: 100%"
      class="custom-table"
      :show-header="false"
    >
      <ElTableColumn prop="time" width="80">
        <template #default="scope">
          <span class="text-gray-500">{{ scope.row.time }}</span>
        </template>
      </ElTableColumn>

      <ElTableColumn prop="description">
        <template #default="scope">
          <span class="font-medium">{{ scope.row.customer }}</span>
          <span class="text-gray-400 mx-2">—</span>
          <span class="text-gray-600">{{ scope.row.product }}</span>
        </template>
      </ElTableColumn>

      <ElTableColumn prop="amount" width="150" align="right">
        <template #default="scope">
          <div
            class="flex items-center justify-end font-bold"
            :class="getAmountColor(scope.row.type)"
          >
            <span>{{ scope.row.amount }}</span>
            <span
              v-if="scope.row.type === 'pending'"
              class="ml-1"
              title="Tiền đang treo"
              >⏳</span
            >
            <span
              v-else-if="scope.row.type === 'refund'"
              class="ml-1 text-red-500"
              title="Hoàn tiền / Giao dịch âm"
              >🔴</span
            >
            <span v-else class="ml-1 w-4"></span>
            <!-- spacer -->
          </div>
        </template>
      </ElTableColumn>

      <ElTableColumn prop="staff" width="120" align="right">
        <template #default="scope">
          <span class="text-gray-500">{{ scope.row.staff }}</span>
        </template>
      </ElTableColumn>
    </ElTable>

    <div
      class="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs text-gray-500 space-x-4"
    >
      <div class="flex items-center">
        <span class="mr-1">⏳</span> Tiền đang treo, chưa chắc chắn
      </div>
      <div class="flex items-center">
        <span class="mr-1 text-red-500">🔴</span> Hoàn tiền / giao dịch âm — cần
        chú ý
      </div>
      <div class="flex items-center">
        <span class="text-green-500 font-bold mr-1">+</span> Màu xanh: Thu vào
      </div>
      <div class="flex items-center">
        <span class="text-red-500 font-bold mr-1">-</span> Màu đỏ: Chi ra hoặc
        hoàn trả
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const transactions = ref([
  {
    time: "14:32",
    customer: "Nguyễn Văn A",
    product: "Winner X",
    amount: "+33.000.000đ",
    type: "in",
    staff: "Trần B",
  },
  {
    time: "14:15",
    customer: "Lê Thị B",
    product: "Nhớt Castrol",
    amount: "+450.000đ",
    type: "in",
    staff: "Nguyễn A",
  },
  {
    time: "13:58",
    customer: "Trần C",
    product: "Cọc giữ xe",
    amount: "+5.000.000đ",
    type: "pending",
    staff: "Lê C",
  },
  {
    time: "13:20",
    customer: "Phạm D",
    product: "Hoàn tiền",
    amount: "-200.000đ",
    type: "refund",
    staff: "Nguyễn A",
  },
  {
    time: "11:45",
    customer: "Hoàng E",
    product: "Bảo dưỡng xe ga",
    amount: "+1.200.000đ",
    type: "in",
    staff: "Trần B",
  },
]);

const getAmountColor = (type: string) => {
  if (type === "refund") return "text-red-500";
  if (type === "pending") return "text-orange-500";
  return "text-green-500";
};
</script>

<style scoped>
.art-card {
  background-color: var(--art-bg-color);
  border: 1px solid var(--art-border-color);
  border-radius: var(--art-border-radius);
}

.custom-table :deep(td) {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}
</style>
