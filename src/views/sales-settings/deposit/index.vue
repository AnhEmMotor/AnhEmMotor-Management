<template>
  <div class="sales-setting-page flex flex-col gap-4 pb-5">
    <ElCard class="setting-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div>
            <h3>Cài đặt đặt cọc</h3>
            <p>
              Điều chỉnh ngưỡng giá trị đơn hàng và phần trăm khách cần thanh toán trước theo từng
              loại đơn hàng.
            </p>
          </div>
          <ElButton type="primary" :loading="saving" @click="handleSave"> Lưu cài đặt </ElButton>
        </div>
      </template>

      <ElTabs v-model="activeTab" class="deposit-tabs">
        <ElTabPane
          v-for="item in settings"
          :key="item.orderType"
          :label="item.orderType"
          :name="item.orderType"
        >
          <ElForm label-position="top" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <ElFormItem label="Ngưỡng giá trị đơn hàng">
              <ElInputNumber
                v-model="item.orderThreshold"
                :min="0"
                :step="1000000"
                :precision="0"
                controls-position="right"
                class="w-full"
              />
              <div class="field-hint">
                {{ formatCurrency(item.orderThreshold) }}
              </div>
            </ElFormItem>

            <ElFormItem label="Tỷ lệ đặt cọc">
              <ElInputNumber
                v-model="item.depositRatio"
                :min="1"
                :max="99"
                :step="1"
                :precision="0"
                :formatter="(value: any) => (value ? `${value}%` : '')"
                :parser="(value: any) => value.replace('%', '')"
                controls-position="right"
                class="w-full"
              />
              <div class="field-hint">Backend cho phép từ 1% đến 99%.</div>
            </ElFormItem>
          </ElForm>

          <ElDivider content-position="left">Mô phỏng tính toán</ElDivider>
          <div class="summary-grid">
            <div class="summary-item">
              <span>Đơn hàng mô phỏng: </span>
              <strong>{{ formatCurrency(item.orderThreshold) }}</strong>
            </div>
            <div class="summary-item">
              <span>Số tiền cần đặt cọc: </span>
              <strong>{{
                formatCurrency(
                  calculateDeposit(item.orderThreshold, item.orderThreshold, item.depositRatio)
                )
              }}</strong>
            </div>
            <div class="summary-item">
              <span>Còn lại sau đặt cọc: </span>
              <strong>{{
                formatCurrency(
                  Math.max(
                    item.orderThreshold -
                      calculateDeposit(item.orderThreshold, item.orderThreshold, item.depositRatio),
                    0
                  )
                )
              }}</strong>
            </div>
          </div>
        </ElTabPane>
      </ElTabs>
    </ElCard>

    <ElCard shadow="never" class="mt-4">
      <template #header>
        <div class="card-header">
          <h3>Lịch sử thay đổi cài đặt đặt cọc</h3>
        </div>
      </template>

      <ElTable :data="history" v-loading="loadingHistory" border stripe style="width: 100%">
        <ElTableColumn type="index" label="Lần" width="60" align="center" />
        <ElTableColumn prop="createdAt" label="Ngày thay đổi" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="orderType" label="Loại đơn hàng" width="200" />
        <ElTableColumn prop="orderThreshold" label="Ngưỡng giá trị">
          <template #default="{ row }">
            {{ formatCurrency(row.orderThreshold) }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="depositRatio" label="Tỷ lệ đặt cọc" width="120">
          <template #default="{ row }"> {{ row.depositRatio }}% </template>
        </ElTableColumn>
        <ElTableColumn label="Số tiền cần đặt cọc (Mô phỏng)" width="220">
          <template #default="{ row }">
            {{
              formatCurrency(
                calculateDeposit(row.orderThreshold, row.orderThreshold, row.depositRatio)
              )
            }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="Còn lại (Mô phỏng)" width="200">
          <template #default="{ row }">
            {{
              formatCurrency(
                Math.max(
                  row.orderThreshold -
                    calculateDeposit(row.orderThreshold, row.orderThreshold, row.depositRatio),
                  0
                )
              )
            }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createdBy" label="Người thực hiện" width="150" />
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
  DepositSettingApi,
  DepositSettingItemDto,
  DepositSettingHistoryResponse,
} from '@/api/deposit-setting.api';
import dayjs from 'dayjs';

defineOptions({ name: 'SalesDepositSettings' });

const loading = ref(false);
const loadingHistory = ref(false);
const saving = ref(false);

const activeTab = ref('Xe máy');
const sampleOrderTotal = ref(100000000);

const settings = ref<DepositSettingItemDto[]>([]);
const history = ref<DepositSettingHistoryResponse[]>([]);

const calculateDeposit = (total: number, threshold: number, ratio: number) => {
  if (total < threshold) return 0;
  return Math.round((total * ratio) / 100);
};

const formatCurrency = (value: number) => `${Math.round(value || 0).toLocaleString('vi-VN')} đ`;

const formatDate = (date: string) => {
  if (!date) return '';
  return dayjs(date).format('DD-MM-YYYY HH:mm');
};

const loadSettings = async () => {
  loading.value = true;
  try {
    const data = await DepositSettingApi.getSettings();
    settings.value = data;
    if (data.length > 0 && !activeTab.value) {
      activeTab.value = data[0].orderType;
    }
  } finally {
    loading.value = false;
  }
};

const loadHistory = async () => {
  loadingHistory.value = true;
  try {
    history.value = await DepositSettingApi.getHistory();
  } finally {
    loadingHistory.value = false;
  }
};

const handleSave = async () => {
  saving.value = true;
  try {
    await DepositSettingApi.updateSettings(settings.value);
    ElMessage.success('Đã lưu cài đặt đặt cọc');
    await Promise.all([loadSettings(), loadHistory()]);
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadSettings();
  loadHistory();
});
</script>

<style scoped lang="scss">
.sales-setting-page {
  color: var(--el-text-color-primary);
}

.setting-card {
  background: var(--el-bg-color);
  border-color: var(--el-border-color-light);
  border-radius: 12px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0 0 8px;
      font-size: 1.25rem;
      font-weight: 600;
    }

    p {
      margin: 0;
      color: var(--el-text-color-secondary);
      font-size: 0.875rem;
    }
  }
}

.deposit-tabs {
  margin-top: -10px;
}

.field-hint {
  font-size: 0.8rem;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.summary-grid {
  display: flex;
  gap: 24px;
  background: var(--el-fill-color-light);
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;
  flex-wrap: wrap;

  .summary-item {
    display: flex;
    align-items: center;
    gap: 8px;

    span {
      color: var(--el-text-color-secondary);
    }

    strong {
      font-size: 1.1rem;
      color: var(--el-color-primary);
    }
  }
}
</style>
