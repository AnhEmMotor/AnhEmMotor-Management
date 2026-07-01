<template>
  <div
    class="art-full-height animate__animated animate__fadeIn flex flex-col gap-4 pb-5"
  >
    <div class="flex items-center justify-between mb-2">
      <div>
        <h2 class="text-lg font-bold">Quản lý Đối tác Vận chuyển</h2>
        <p class="text-sm text-gray-500">
          Cấu hình kết nối và quy tắc giao hàng cho các đối tác vận chuyển.
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <el-card
        v-for="p in carriers"
        :key="p.id"
        class="art-table-card border-t-4"
        :style="{ borderTopColor: getCarrierColor(p.carrierCode) }"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <el-avatar
                :size="32"
                :style="{ backgroundColor: getCarrierColor(p.carrierCode) }"
              >
                {{ p.name.slice(0, 1).toUpperCase() }}
              </el-avatar>
              <div class="text-sm font-bold">{{ p.name }}</div>
            </div>
            <el-switch
              v-model="p.isActive"
              :active-value="true"
              :inactive-value="false"
              @change="saveQuickStatus(p)"
            />
          </div>
        </template>

        <div class="flex flex-col gap-3">
          <div class="flex justify-between items-center text-xs">
            <span class="text-gray-500">Môi trường:</span>
            <el-tag
              :type="p.environment === 'production' ? 'success' : 'info'"
              size="small"
            >
              {{ p.environment === "production" ? "Production" : "Sandbox" }}
            </el-tag>
          </div>

          <div class="flex justify-between items-center text-xs">
            <span class="text-gray-500">Đồng bộ giá:</span>
            <span
              class="font-medium"
              :class="p.autoSyncPricing ? 'text-green-600' : 'text-red-500'"
            >
              {{ p.autoSyncPricing ? "BẬT" : "TẮT" }}
            </span>
          </div>

          <div class="flex justify-between items-center text-xs">
            <span class="text-gray-500">Hàng cồng kềnh:</span>
            <span
              class="font-medium"
              :class="p.allowOversizeCargo ? 'text-green-600' : 'text-red-500'"
            >
              {{ p.allowOversizeCargo ? "CÓ" : "KHÔNG" }}
            </span>
          </div>

          <div class="flex justify-between items-center text-xs">
            <span class="text-gray-500">Chất lỏng/Dầu:</span>
            <span
              class="font-medium"
              :class="p.allowLiquidCargo ? 'text-green-600' : 'text-red-500'"
            >
              {{ p.allowLiquidCargo ? "CÓ" : "KHÔNG" }}
            </span>
          </div>

          <el-button
            type="primary"
            size="small"
            class="mt-2"
            @click="openPanel(p)"
            :color="getCarrierColor(p.carrierCode)"
            plain
          >
            ⚙️ Cấu hình chi tiết
          </el-button>
        </div>
      </el-card>
    </div>

    <el-drawer
      v-model="drawerOpen"
      size="45%"
      :title="drawerTitle"
      direction="rtl"
      destroy-on-close
    >
      <div v-if="selected" class="flex flex-col h-full">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">Trạng thái hoạt động:</span>
            <el-switch v-model="selected.isActive" />
          </div>
        </div>

        <el-tabs v-model="activeTab" class="flex-grow">
          <el-tab-pane label="🌐 Kết nối API" name="api">
            <div class="flex flex-col gap-4 mt-2">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-sm font-semibold w-24">Môi trường:</span>
                <el-segmented
                  v-model="selected.environment"
                  :options="[
                    { label: 'Sandbox', value: 'sandbox' },
                    { label: 'Production', value: 'production' },
                  ]"
                />
              </div>

              <el-form
                label-position="top"
                :model="selected"
                :rules="rules"
                ref="formRef"
              >
                <el-form-item label="API Base URL">
                  <el-input
                    v-model="selected.apiBaseUrl"
                    placeholder="https://..."
                  />
                </el-form-item>

                <el-form-item label="API Token">
                  <el-input
                    v-model="tokenDraft"
                    :placeholder="
                      selected.apiTokenMasked
                        ? 'Đã thiết lập (Nhập để thay đổi)'
                        : 'Nhập token mới...'
                    "
                    show-password
                  />
                </el-form-item>

                <el-form-item label="Webhook Secret Key">
                  <el-input
                    v-model="webhookSecretDraft"
                    :placeholder="
                      selected.webhookSecretMasked
                        ? 'Đã thiết lập (Nhập để thay đổi)'
                        : 'Nhập secret mới...'
                    "
                    show-password
                  />
                </el-form-item>

                <el-form-item label="Webhook Endpoint URL">
                  <div class="flex items-center gap-2 w-full">
                    <el-input v-model="selected.webhookEndpointUrl" readonly />
                    <el-button type="primary" plain @click="copyWebhook"
                      >📋 Copy</el-button
                    >
                  </div>
                </el-form-item>
              </el-form>

              <div
                class="mt-4 p-4 bg-gray-50 rounded border flex justify-between items-center"
              >
                <div class="text-sm text-gray-600">
                  Kiểm tra kết nối API với các thiết lập hiện tại.
                </div>
                <el-button
                  type="warning"
                  :loading="testing"
                  @click="testConnection"
                >
                  ⚡ Kiểm tra kết nối
                </el-button>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="📦 Quy tắc Vận chuyển" name="rules">
            <div class="mt-2">
              <el-form label-position="top" :model="selected">
                <div class="grid grid-cols-2 gap-4">
                  <el-form-item label="Đồng bộ bảng giá tự động">
                    <el-switch
                      v-model="selected.autoSyncPricing"
                      active-text="Bật"
                      inactive-text="Tắt"
                    />
                  </el-form-item>

                  <el-form-item label="Khối lượng tối đa (kg)">
                    <el-input-number
                      v-model="selected.maxParcelWeightKg"
                      :min="0"
                      :precision="1"
                      :step="0.5"
                      class="w-full"
                    />
                  </el-form-item>

                  <el-form-item label="Chấp nhận Chất lỏng/Dầu nhớt">
                    <el-switch
                      v-model="selected.allowLiquidCargo"
                      active-text="Có"
                      inactive-text="Không"
                    />
                  </el-form-item>

                  <el-form-item label="Chấp nhận hàng cồng kềnh">
                    <el-switch
                      v-model="selected.allowOversizeCargo"
                      active-text="Có"
                      inactive-text="Không"
                    />
                  </el-form-item>
                </div>
              </el-form>
            </div>
          </el-tab-pane>

          <el-tab-pane label="📋 Bảng giá & SLA" name="pricing">
            <div class="mt-2 flex flex-col gap-4">
              <div
                v-if="selected.autoSyncPricing"
                class="p-3 bg-green-50 text-green-700 rounded border border-green-200 flex items-center gap-2 text-sm"
              >
                <span
                  >⚡ Đang tự động đồng bộ bảng giá và SLA từ API của
                  {{ selected.name }}.</span
                >
              </div>
              <div
                v-else
                class="p-3 bg-amber-50 text-amber-700 rounded border border-amber-200 flex items-center gap-2 text-sm"
              >
                <span
                  >⚠️ Chế độ nhập thủ công. Bạn có thể thay đổi bảng giá và SLA
                  bên dưới.</span
                >
              </div>

              <div>
                <h4 class="font-bold text-sm mb-2 text-gray-700">
                  💰 Bảng giá cước vận chuyển
                </h4>
                <el-table
                  :data="pricingRules"
                  border
                  size="small"
                  style="width: 100%"
                >
                  <el-table-column label="Tuyến vận chuyển" width="150">
                    <template #default="scope">
                      <span>{{ getRouteTypeLabel(scope.row.routeType) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="Mức cân nặng" width="120">
                    <template #default="scope">
                      <span>{{ scope.row.weightTier }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="Giá cước (VND)">
                    <template #default="scope">
                      <el-input-number
                        v-model="scope.row.price"
                        :min="0"
                        :step="1000"
                        :disabled="selected.autoSyncPricing"
                        size="small"
                        class="w-full"
                        :controls="false"
                      />
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <div>
                <h4 class="font-bold text-sm mb-2 text-gray-700">
                  ⏱️ Cam kết thời gian giao hàng (SLA)
                </h4>
                <el-table
                  :data="slaRules"
                  border
                  size="small"
                  style="width: 100%"
                >
                  <el-table-column label="Tuyến vận chuyển" width="150">
                    <template #default="scope">
                      <span>{{ getRouteTypeLabel(scope.row.routeType) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="Thời gian dự kiến">
                    <template #default="scope">
                      <el-input
                        v-model="scope.row.expectedDays"
                        :disabled="selected.autoSyncPricing"
                        size="small"
                        placeholder="Ví dụ: 1-2 ngày"
                      />
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>

        <div class="flex justify-end gap-3 mt-auto pt-4 border-t">
          <el-button @click="closeDrawer">❌ Hủy bỏ</el-button>
          <el-button type="primary" :loading="saving" @click="saveConfig">
            💾 Lưu cấu hình
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import {
  ElDrawer,
  ElCard,
  ElInput,
  ElInputNumber,
  ElAvatar,
  ElButton,
  ElForm,
  ElFormItem,
  ElSwitch,
  ElSegmented,
  ElTabs,
  ElTabPane,
  ElTag,
} from "element-plus";
import { useI18n } from "vue-i18n";
import type {
  CarrierPartnerSummary,
  UpdateCarrierPartnerRequest,
} from "@/domain/logistics/carrier-settings.types";
import { LogisticsCarrierSettingsService } from "@/services/logisticsCarrierSettings.service";
import { ElNotification } from "element-plus";

useI18n();

type Carrier = CarrierPartnerSummary;

const carriers = ref<Carrier[]>([]);

const drawerOpen = ref(false);
const selected = ref<Carrier | null>(null);
const activeTab = ref("api");

const drawerTitle = computed(() =>
  selected.value ? `Cấu hình Đối tác: ${selected.value.name}` : "",
);

const formRef = ref();

const tokenDraft = ref("");
const webhookSecretDraft = ref("");

const saving = ref(false);
const testing = ref(false);

const rules = ref({});

const pricingRules = ref<any[]>([]);
const slaRules = ref<any[]>([]);

const getRouteTypeLabel = (routeType: string) => {
  const map: Record<string, string> = {
    IntraProvince: "Nội tỉnh",
    IntraRegion: "Nội vùng",
    InterRegion: "Liên vùng",
  };
  return map[routeType] || routeType;
};

const getCarrierColor = (code: string) => {
  const colors: Record<string, string> = {
    ghtk: "#008a00",
    ghn: "#f48120",
    "viettel-post": "#ee0033",
    "shipper-nha": "#3b82f6",
  };
  return colors[code] || "#6b7280";
};

const openPanel = async (p: Carrier) => {
  selected.value = { ...p };
  tokenDraft.value = "";
  webhookSecretDraft.value = "";
  activeTab.value = "api";

  try {
    pricingRules.value = p.pricingRulesJson
      ? JSON.parse(p.pricingRulesJson)
      : [];
  } catch {
    pricingRules.value = [];
  }

  try {
    slaRules.value = p.slaJson ? JSON.parse(p.slaJson) : [];
  } catch {
    slaRules.value = [];
  }

  if (pricingRules.value.length === 0) {
    pricingRules.value = [
      { routeType: "IntraProvince", weightTier: "0-2kg", price: 22000 },
      { routeType: "IntraProvince", weightTier: "2-5kg", price: 35000 },
      { routeType: "IntraProvince", weightTier: ">5kg", price: 50000 },
      { routeType: "IntraRegion", weightTier: "0-2kg", price: 30000 },
      { routeType: "IntraRegion", weightTier: "2-5kg", price: 45000 },
      { routeType: "IntraRegion", weightTier: ">5kg", price: 70000 },
      { routeType: "InterRegion", weightTier: "0-2kg", price: 40000 },
      { routeType: "InterRegion", weightTier: "2-5kg", price: 65000 },
      { routeType: "InterRegion", weightTier: ">5kg", price: 95000 },
    ];
  }
  if (slaRules.value.length === 0) {
    slaRules.value = [
      { routeType: "IntraProvince", expectedDays: "1-2 ngày" },
      { routeType: "IntraRegion", expectedDays: "2-3 ngày" },
      { routeType: "InterRegion", expectedDays: "3-5 ngày" },
    ];
  }

  drawerOpen.value = true;
  await nextTick();
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

const loadCarriers = async () => {
  const res = await LogisticsCarrierSettingsService.getCarriers();
  carriers.value = res.items;
};

const copyWebhook = async () => {
  if (!selected.value) return;
  const text = selected.value.webhookEndpointUrl;
  await navigator.clipboard.writeText(text);
  ElNotification.success({ title: "Đã copy webhook URL" });
};

const saveQuickStatus = async (p: Carrier) => {
  try {
    const payload: UpdateCarrierPartnerRequest = {
      isActive: p.isActive,
      environment: p.environment,
      apiBaseUrl: p.apiBaseUrl,
      webhookEndpointUrl: p.webhookEndpointUrl,
      autoSyncPricing: p.autoSyncPricing,
      maxParcelWeightKg: p.maxParcelWeightKg,
      allowLiquidCargo: p.allowLiquidCargo,
      allowOversizeCargo: p.allowOversizeCargo,
      pricingRulesJson: p.pricingRulesJson,
      slaJson: p.slaJson,
    };
    await LogisticsCarrierSettingsService.updateCarrier(p.id, payload);
    ElNotification.success({ title: "Đã cập nhật trạng thái" });
  } catch (_error) {
    p.isActive = !p.isActive; // revert
  }
};

const saveConfig = async () => {
  if (!selected.value) return;
  saving.value = true;
  try {
    const payload: UpdateCarrierPartnerRequest = {
      isActive: selected.value.isActive,
      environment: selected.value.environment,
      apiBaseUrl: selected.value.apiBaseUrl,
      apiTokenPlain: tokenDraft.value ? tokenDraft.value : undefined,
      webhookSecretPlain: webhookSecretDraft.value
        ? webhookSecretDraft.value
        : undefined,
      webhookEndpointUrl: selected.value.webhookEndpointUrl,
      autoSyncPricing: selected.value.autoSyncPricing,
      maxParcelWeightKg: selected.value.maxParcelWeightKg,
      allowLiquidCargo: selected.value.allowLiquidCargo,
      allowOversizeCargo: selected.value.allowOversizeCargo,
      pricingRulesJson: JSON.stringify(pricingRules.value),
      slaJson: JSON.stringify(slaRules.value),
    };
    await LogisticsCarrierSettingsService.updateCarrier(
      selected.value.id,
      payload,
    );
    ElNotification.success({ title: "Lưu cấu hình thành công" });
    await loadCarriers();
    closeDrawer();
  } finally {
    saving.value = false;
  }
};

const testConnection = async () => {
  if (!selected.value) return;
  testing.value = true;
  try {
    const res = await LogisticsCarrierSettingsService.testConnection(
      selected.value.id,
      {},
    );
    if (res.isSuccess) {
      ElNotification.success({ title: res.message || "Kết nối thành công!" });
    } else {
      ElNotification.error({ title: res.message || "Kết nối thất bại!" });
    }
  } finally {
    testing.value = false;
  }
};

onMounted(() => {
  void loadCarriers();
});
</script>
