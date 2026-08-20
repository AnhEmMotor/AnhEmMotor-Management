<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getGoogleAdsMetricsApi } from '@/api/marketing/googleAds';
import { ElMessage } from 'element-plus';

interface GoogleAdsData {
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  currency: string;
  campaignsActive: number;
}

const loading = ref(false);
const adsData = ref<GoogleAdsData | null>(null);

const fetchAdsData = async () => {
  loading.value = true;
  try {
    const response = await getGoogleAdsMetricsApi();
    if (response) {
      adsData.value = response;
    }
  } catch (error) {
    ElMessage.error('Không thể tải dữ liệu Google Ads.');
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency || 'VND',
  }).format(amount);
};

onMounted(() => {
  fetchAdsData();
});
</script>

<template>
  <div class="resp-page">
    <div class="page-header mb-4 flex justify-between items-center">
      <h2 class="text-lg font-semibold">Tích Hợp Google Ads</h2>
      <el-button type="primary" @click="fetchAdsData" :loading="loading">Đồng bộ dữ liệu</el-button>
    </div>

    <el-card shadow="never" v-loading="loading">
      <div v-if="adsData" class="grid grid-cols-3 gap-6">
        <div class="p-6 border rounded-lg bg-blue-50 text-center">
          <p class="text-sm text-gray-500 font-medium">Chiến dịch đang chạy</p>
          <p class="text-3xl font-bold text-blue-600 mt-2">{{ adsData.campaignsActive }}</p>
        </div>
        <div class="p-6 border rounded-lg bg-green-50 text-center">
          <p class="text-sm text-gray-500 font-medium">Lượt hiển thị (Impressions)</p>
          <p class="text-3xl font-bold text-green-600 mt-2">
            {{ adsData.impressions.toLocaleString() }}
          </p>
        </div>
        <div class="p-6 border rounded-lg bg-orange-50 text-center">
          <p class="text-sm text-gray-500 font-medium">Lượt nhấp (Clicks)</p>
          <p class="text-3xl font-bold text-orange-600 mt-2">
            {{ adsData.clicks.toLocaleString() }}
          </p>
        </div>
        <div class="p-6 border rounded-lg bg-purple-50 text-center">
          <p class="text-sm text-gray-500 font-medium">Lượt chuyển đổi</p>
          <p class="text-3xl font-bold text-purple-600 mt-2">
            {{ adsData.conversions.toLocaleString() }}
          </p>
        </div>
        <div class="p-6 border rounded-lg bg-red-50 text-center col-span-2">
          <p class="text-sm text-gray-500 font-medium">Chi phí (Cost)</p>
          <p class="text-3xl font-bold text-red-600 mt-2">
            {{ formatCurrency(adsData.cost, adsData.currency) }}
          </p>
        </div>
      </div>
      <div v-else class="text-center py-10 text-gray-400">Chưa có dữ liệu. Hãy đồng bộ.</div>
    </el-card>
  </div>
</template>

<style scoped>
.resp-page {
  padding: 20px;
}
</style>
