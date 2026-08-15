<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getVisitorTrackingApi } from '@/api/marketing/visitorTracking';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';

interface VisitorRecord {
  customerUserId: string | null;
  visitorKey: string | null;
  productId: number;
  productName: string;
  dwellTimeMs: number;
  viewedAt: string;
}

const loading = ref(false);
const visitorRecords = ref<VisitorRecord[]>([]);

const fetchRecords = async () => {
  loading.value = true;
  try {
    const response = await getVisitorTrackingApi({ page: 1, pageSize: 100 });
    if (response && (response as any).items) {
      visitorRecords.value = (response as any).items;
    } else if (response) {
      visitorRecords.value = Array.isArray(response) ? response : (response as any).data || [];
    }
  } catch (error) {
    ElMessage.error('Không thể tải dữ liệu truy cập.');
  } finally {
    loading.value = false;
  }
};

const formatSeconds = (ms: number) => {
  return (ms / 1000).toFixed(1) + ' s';
};

onMounted(() => {
  fetchRecords();
});
</script>

<template>
  <div class="resp-page">
    <div class="page-header mb-4 flex justify-between items-center">
      <h2 class="text-lg font-semibold">Theo Dõi Khách Truy Cập</h2>
      <el-button type="primary" @click="fetchRecords">Làm mới</el-button>
    </div>

    <el-card shadow="never">
      <el-table :data="visitorRecords" v-loading="loading" border style="width: 100%">
        <el-table-column label="Thời gian truy cập" width="200">
          <template #default="scope">
            {{ dayjs(scope.row.viewedAt).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
        </el-table-column>

        <el-table-column label="Sản phẩm / Trang">
          <template #default="scope">
            <span class="font-medium">{{ scope.row.productName }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Người dùng (Guest / Tên)">
          <template #default="scope">
            <span v-if="scope.row.customerUserId" class="text-blue-600"
              >User: {{ scope.row.customerUserId }}</span
            >
            <span v-else class="text-gray-500">Khách: {{ scope.row.visitorKey }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Đã xem (giây)" width="150" align="right">
          <template #default="scope">
            {{ formatSeconds(scope.row.dwellTimeMs) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.resp-page {
  padding: 20px;
}
</style>
