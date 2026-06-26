<template>
  <div class="art-card h-128 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>Hoạt động Hệ thống</h4>
        <p>Audit Log toàn bộ hệ thống</p>
      </div>
    </div>

    <div v-if="isLoading" class="mt-4">
      <ElSkeleton :rows="3" animated />
    </div>
    <div v-else class="h-9/10 mt-2 overflow-hidden">
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
import { ref, reactive, onMounted } from "vue";
import { fetchRecentTransactions } from "@/api/dashboard.api";

interface DynamicItem {
  username: string;
  type: string;
  target: string;
}

const list = reactive<DynamicItem[]>([]);
const isLoading = ref(false);

async function fetchData() {
  isLoading.value = true;
  try {
    const data = await fetchRecentTransactions(20);
    list.length = 0;
    data.forEach((tx: any) => {
      const username =
        tx.staffName && tx.staffName !== "N/A"
          ? tx.staffName
          : tx.customerName || "Hệ thống";
      const type = tx.isRevenue ? "tạo giao dịch" : "thêm chi phí";
      const target = tx.productName || "N/A";
      list.push({ username, type, target });
    });
  } catch (error) {
    console.error("Failed to fetch recent transactions:", error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchData();
});
</script>
