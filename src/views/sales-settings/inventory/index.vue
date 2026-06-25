<template>
  <div class="sales-setting-page flex flex-col gap-4 pb-5">
    <ElCard class="setting-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div>
            <h3>Cài đặt cảnh báo tồn kho</h3>
            <p>
              Cấu hình ngưỡng để backend tính trạng thái còn hàng, sắp hết hàng
              hoặc hết hàng.
            </p>
          </div>
          <ElButton type="primary" :loading="saving" @click="handleSave"
            >Lưu cài đặt</ElButton
          >
        </div>
      </template>

      <ElForm label-position="top" class="inventory-threshold-form">
        <ElFormItem label="Ngưỡng cảnh báo tồn kho">
          <ElInputNumber
            v-model="settings.inventoryAlertLevel"
            :min="0"
            :step="1"
            :precision="0"
            controls-position="right"
            class="w-full"
          />
          <div class="field-hint">
            Ví dụ: đặt 5 thì sản phẩm còn ít sẽ được backend đánh dấu LowStock.
          </div>
        </ElFormItem>
      </ElForm>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { SettingApi } from "@/api/setting.api";

defineOptions({ name: "SalesInventorySettings" });

const DEFAULT_INVENTORY_ALERT_LEVEL = 5;

const loadingSettings = ref(false);
const saving = ref(false);

const settings = reactive({
  inventoryAlertLevel: DEFAULT_INVENTORY_ALERT_LEVEL,
});

const toNumber = (value: string | null | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const loadSettings = async () => {
  loadingSettings.value = true;
  try {
    const data = await SettingApi.getAll();
    settings.inventoryAlertLevel = toNumber(
      data.Inventory_alert_level,
      DEFAULT_INVENTORY_ALERT_LEVEL,
    );
  } finally {
    loadingSettings.value = false;
  }
};

const handleSave = async () => {
  saving.value = true;
  try {
    await SettingApi.update({
      Inventory_alert_level: String(Math.round(settings.inventoryAlertLevel)),
    });
    ElMessage.success("Đã lưu cài đặt tồn kho");
    await loadSettings();
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  await loadSettings();
});
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

.inventory-threshold-form {
  max-width: 520px;
}

.field-hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

@media (width <= 900px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
