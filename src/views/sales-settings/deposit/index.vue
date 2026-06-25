<template>
  <div class="sales-setting-page flex flex-col gap-4 pb-5">
    <ElCard class="setting-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div>
            <h3>Cài đặt đặt cọc</h3>
            <p>Điều chỉnh ngưỡng giá trị đơn hàng và phần trăm khách cần thanh toán trước.</p>
          </div>
          <ElButton type="primary" :loading="saving" @click="handleSave">Lưu cài đặt</ElButton>
        </div>
      </template>

      <ElForm label-position="top" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ElFormItem label="Đơn hàng vượt quá">
          <ElInputNumber
            v-model="form.orderThreshold"
            :min="0"
            :step="1000000"
            :precision="0"
            controls-position="right"
            class="w-full"
          />
          <div class="field-hint">{{ formatCurrency(form.orderThreshold) }}</div>
        </ElFormItem>

        <ElFormItem label="Tỷ lệ đặt cọc">
          <ElInputNumber
            v-model="form.depositRatio"
            :min="1"
            :max="99"
            :step="1"
            :precision="1"
            controls-position="right"
            class="w-full"
          />
          <div class="field-hint">Backend cho phép từ 1% đến 99%.</div>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <ElCard class="setting-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div>
            <h3>Xem trước cách tính</h3>
            <p>Phần này giúp kiểm tra nhanh logic đang áp dụng trên Store.</p>
          </div>
        </div>
      </template>

      <div class="preview-grid">
        <div class="preview-item sample-input">
          <span>Giá trị đơn mẫu để xem thử</span>
          <ElInputNumber
            v-model="sampleOrderTotal"
            :min="0"
            :step="1000000"
            :precision="0"
            controls-position="right"
            class="w-full mt-2"
          />
          <small>{{ formatCurrency(sampleOrderTotal) }}</small>
        </div>
        <div class="preview-item">
          <span>Ngưỡng hiện tại</span>
          <strong>{{ formatCurrency(form.orderThreshold) }}</strong>
        </div>
        <div class="preview-item highlight">
          <span>Số tiền cần đặt cọc</span>
          <strong>{{ formatCurrency(sampleDeposit) }}</strong>
        </div>
        <div class="preview-item">
          <span>Còn lại sau đặt cọc</span>
          <strong>{{ formatCurrency(sampleRemaining) }}</strong>
        </div>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { SettingApi } from '@/api/setting.api'

  defineOptions({ name: 'SalesDepositSettings' })

  const DEFAULT_ORDER_THRESHOLD = 100000000
  const DEFAULT_DEPOSIT_RATIO = 50

  const loading = ref(false)
  const saving = ref(false)
  const sampleOrderTotal = ref(120000000)

  const form = reactive({
    orderThreshold: DEFAULT_ORDER_THRESHOLD,
    depositRatio: DEFAULT_DEPOSIT_RATIO
  })

  const sampleNeedsDeposit = computed(() => sampleOrderTotal.value > form.orderThreshold)

  const sampleDeposit = computed(() => {
    if (!sampleNeedsDeposit.value) return 0
    return Math.round((sampleOrderTotal.value * form.depositRatio) / 100)
  })

  const sampleRemaining = computed(() => Math.max(sampleOrderTotal.value - sampleDeposit.value, 0))

  const formatCurrency = (value: number) => `${Math.round(value || 0).toLocaleString('vi-VN')} đ`

  const toNumber = (value: string | null | undefined, fallback: number) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  const loadSettings = async () => {
    loading.value = true
    try {
      const settings = await SettingApi.getAll()
      form.orderThreshold = toNumber(settings.Order_value_exceeds, DEFAULT_ORDER_THRESHOLD)
      form.depositRatio = toNumber(settings.Deposit_ratio, DEFAULT_DEPOSIT_RATIO)
    } finally {
      loading.value = false
    }
  }

  const handleSave = async () => {
    saving.value = true
    try {
      await SettingApi.update({
        Order_value_exceeds: String(Math.round(form.orderThreshold)),
        Deposit_ratio: String(form.depositRatio)
      })
      ElMessage.success('Đã lưu cài đặt đặt cọc')
      await loadSettings()
    } finally {
      saving.value = false
    }
  }

  onMounted(loadSettings)
</script>

<style scoped lang="scss">
  .sales-setting-page {
    color: var(--el-text-color-primary);
  }

  .setting-card {
    background: var(--el-bg-color);
    border-color: var(--el-border-color-light);
  }

  .card-header {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: var(--el-text-color-primary);
    }

    p {
      margin: 6px 0 0;
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
  }

  .field-hint {
    margin-top: 6px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .preview-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .preview-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 88px;
    padding: 16px;
    background: var(--el-fill-color-lighter);
    border: 1px solid var(--el-border-color-light);
    border-radius: 14px;

    span {
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }

    strong {
      margin-top: 8px;
      font-size: 20px;
      color: var(--el-text-color-primary);
    }

    &.highlight strong {
      color: var(--el-color-danger);
    }

    small {
      margin-top: 6px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  @media (width <= 900px) {
    .preview-grid {
      grid-template-columns: 1fr;
    }

    .card-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
