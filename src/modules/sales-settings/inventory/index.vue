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

    <ElCard class="setting-card" shadow="never">
      <template #header>
        <div class="card-header">
          <div>
            <h3>Cảnh báo tồn kho theo danh mục</h3>
            <p>Danh sách danh mục sản phẩm và trạng thái cảnh báo tồn kho.</p>
          </div>
        </div>
      </template>

      <ElTable
        v-loading="loadingCategories"
        :data="categoryList"
        row-key="id"
        border
        stripe
        default-expand-all
      >
        <ElTableColumn label="Tên danh mục" min-width="220">
          <template #default="{ row }">
            <span
              :class="{
                'category-name-root': !row.parentId,
                'category-name-child': row.parentId,
              }"
            >
              {{ row.name }}
            </span>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="slug" label="Slug" width="220" />

        <ElTableColumn label="Loại quản lý" width="180">
          <template #default="{ row }">
            <ElTag size="small" effect="light">
              {{ getManagementTypeLabel(row.managementType) }}
            </ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn
          prop="productCount"
          label="Số sản phẩm"
          width="130"
          align="center"
        />

        <ElTableColumn label="Số lượng tồn kho" width="160" align="right">
          <template #default="{ row }">
            <span v-if="row.inventoryQty === 0" class="text-red-500 font-bold">
              {{ row.inventoryQty }}
            </span>
            <span
              v-else-if="row.inventoryQty <= settings.inventoryAlertLevel"
              class="text-yellow-500 font-bold"
            >
              {{ row.inventoryQty }}
            </span>
            <span v-else>
              {{ row.inventoryQty }}
            </span>
          </template>
        </ElTableColumn>

        <ElTableColumn label="Trạng thái" width="120" align="center">
          <template #default="{ row }">
            <ElTag
              :type="row.isActive ? 'success' : 'info'"
              size="small"
              effect="light"
              round
            >
              {{ row.isActive ? "Hoạt động" : "Tạm dừng" }}
            </ElTag>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { SettingApi } from "@/api/setting.api";
import { CategoryApi } from "@/api/product";
import { buildTree } from "@/common/utils";

defineOptions({ name: "SalesInventorySettings" });

const DEFAULT_INVENTORY_ALERT_LEVEL = 5;

const loadingSettings = ref(false);
const loadingCategories = ref(false);
const saving = ref(false);

const settings = reactive({
  inventoryAlertLevel: DEFAULT_INVENTORY_ALERT_LEVEL,
});

const categoryList = ref<any[]>([]);

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

const computeRecursiveStock = (nodes: any[]): number => {
  let total = 0;
  nodes.forEach((node) => {
    let nodeStock = node.inventoryQty || 0;
    if (node.children && node.children.length > 0) {
      nodeStock += computeRecursiveStock(node.children);
    }
    node.inventoryQty = nodeStock;
    total += nodeStock;
  });
  return total;
};

const loadCategories = async () => {
  loadingCategories.value = true;
  try {
    const res = await CategoryApi.getList({ current: 1, size: 1000 });
    if (res && res.items) {
      const tree = buildTree(res.items);
      computeRecursiveStock(tree);
      categoryList.value = tree;
    }
  } catch (err) {
    console.error("Failed to load categories", err);
  } finally {
    loadingCategories.value = false;
  }
};

const getManagementTypeLabel = (val?: string) => {
  if (val === "vin") return "Quản lý theo số VIN";
  return "Quản lý theo SKU";
};

const handleSave = async () => {
  saving.value = true;
  try {
    await SettingApi.update({
      Inventory_alert_level: String(Math.round(settings.inventoryAlertLevel)),
    });
    ElMessage.success("Đã lưu cài đặt tồn kho");
    await loadSettings();
    await loadCategories();
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  await loadSettings();
  await loadCategories();
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

.category-name-root {
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.category-name-child {
  color: var(--el-text-color-regular);
}

@media (width <= 900px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
