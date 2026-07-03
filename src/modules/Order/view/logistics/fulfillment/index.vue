<template>
  <div class="fulfillment-container p-4">
    <!-- Header & Statistics -->
    <el-card shadow="never" class="mb-4">
      <div class="flex items-center justify-between mb-4 flex-wrap gap-4">
        <div>
          <h2 class="text-xl font-bold mb-1">
            {{ t("logistics.fulfillment.title") }}
          </h2>
          <div class="text-gray-500 text-sm">
            Quản lý quy trình nhặt hàng, đóng gói, liên kết đối tác 3PL và bàn
            giao kiện hàng.
          </div>
        </div>
      </div>

      <!-- Filters Form -->
      <div class="flex items-center gap-4 flex-wrap">
        <!-- Date range -->
        <div class="flex items-center">
          <span class="text-sm font-medium mr-2 text-gray-700">Thời gian:</span>
          <el-date-picker
            v-model="filterParams.dateRange"
            type="daterange"
            range-separator="Tới"
            start-placeholder="Từ ngày"
            end-placeholder="Đến ngày"
            value-format="YYYY-MM-DD"
            size="default"
            style="width: 260px"
            @change="fetchOrders"
          />
        </div>

        <!-- Carrier -->
        <div class="flex items-center">
          <span class="text-sm font-medium mr-2 text-gray-700">Đối tác:</span>
          <el-select
            v-model="filterParams.carrier"
            clearable
            placeholder="Tất cả đối tác"
            style="width: 160px"
            @change="fetchOrders"
          >
            <el-option label="Giao Hàng Tiết Kiệm" value="GHTK" />
            <el-option label="Giao Hàng Nhanh" value="GHN" />
            <el-option label="Viettel Post" value="ViettelPost" />
            <el-option label="Đội xe nội bộ" value="Internal" />
          </el-select>
        </div>

        <!-- Province/City -->
        <div class="flex items-center">
          <span class="text-sm font-medium mr-2 text-gray-700">Khu vực:</span>
          <el-input
            v-model="filterParams.region"
            clearable
            placeholder="Tỉnh / Thành phố..."
            style="width: 180px"
          />
        </div>

        <!-- Status -->
        <div class="flex items-center">
          <span class="text-sm font-medium mr-2 text-gray-700"
            >Trạng thái:</span
          >
          <el-select
            v-model="filterParams.status"
            clearable
            placeholder="Tất cả trạng thái"
            style="width: 180px"
            @change="fetchOrders"
          >
            <el-option label="Chờ nhặt hàng" :value="0" />
            <el-option label="Đang đóng gói" :value="1" />
            <el-option label="Đang giao hàng" :value="2" />
            <el-option label="Đã hoàn thành" :value="3" />
            <el-option label="Đã trả hàng" :value="4" />
          </el-select>
        </div>

        <el-button type="primary" @click="fetchOrders">
          <el-icon class="mr-1"><Search /></el-icon> Tìm kiếm
        </el-button>
        <el-button @click="resetFilters">Đặt lại</el-button>
      </div>
    </el-card>

    <!-- Orders Table -->
    <el-card shadow="never" class="art-table-card">
      <ArtTable
        ref="tableRef"
        :loading="loading"
        :data="pagedOrderList"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <!-- Original Order Slot -->
        <template #originalOrderCode="{ row }">
          <span class="font-bold text-gray-800"
            >#{{ row.originalOrderCode }}</span
          >
        </template>

        <!-- Tracking Number Slot -->
        <template #trackingNumber="{ row }">
          <el-tag
            v-if="row.trackingNumber"
            type="success"
            effect="plain"
            class="font-mono"
          >
            {{ row.trackingNumber }}
          </el-tag>
          <span v-else class="text-gray-400 font-mono italic"
            >Chưa liên kết</span
          >
        </template>

        <!-- Carrier Slot -->
        <template #carrier="{ row }">
          <el-tag :type="getCarrierTagType(row.carrier)" size="small">
            {{ getCarrierLabel(row.carrier) }}
          </el-tag>
        </template>

        <!-- COD Amount Slot -->
        <template #codAmount="{ row }">
          <span class="font-semibold text-red-500">{{
            formatCurrency(row.codAmount)
          }}</span>
        </template>

        <!-- Shipping Cost Slot -->
        <template #shippingCost="{ row }">
          <span class="text-gray-600">{{
            formatCurrency(row.shippingCost)
          }}</span>
        </template>

        <!-- Created At Slot -->
        <template #createdAt="{ row }">
          <span class="text-xs text-gray-500">{{
            formatDate(row.createdAt)
          }}</span>
        </template>

        <!-- Delivered At Slot -->
        <template #deliveredAt="{ row }">
          <span v-if="row.deliveredAt" class="text-xs text-gray-500">{{
            formatDate(row.deliveredAt)
          }}</span>
          <span v-else class="text-gray-400 italic text-xs">-</span>
        </template>

        <!-- Actions Slot -->
        <template #actions="{ row }">
          <el-button type="primary" size="small" @click="openDetail(row)">
            Chi tiết
          </el-button>
        </template>
      </ArtTable>
    </el-card>

    <!-- Detail Sliding Drawer -->
    <el-drawer
      v-model="drawerVisible"
      title="Chi tiết quy trình Vận đơn"
      size="60%"
      destroy-on-close
    >
      <div v-loading="loadingDetail" class="p-2">
        <div v-if="detailData.id" class="flex flex-col gap-6">
          <!-- Header and Steps inside Drawer -->
          <div
            class="flex items-center justify-between flex-wrap gap-4 border-b pb-4 border-gray-100"
          >
            <div>
              <div class="text-sm text-gray-500 mb-1">
                {{ t("logistics.fulfillment.orderId") }}:
                <strong class="text-black font-mono"
                  >#{{ detailData.id }}</strong
                >
              </div>
              <div class="text-sm">
                {{ t("logistics.fulfillment.originalOrder") }}:
                <strong class="text-primary font-mono">{{
                  detailData.originalOrderCode
                }}</strong>
              </div>
            </div>
            <div class="flex-1 max-w-md">
              <el-steps
                :active="currentStep"
                finish-status="success"
                align-center
                size="small"
              >
                <el-step :title="t('logistics.fulfillment.status.pending')" />
                <el-step :title="t('logistics.fulfillment.status.packing')" />
                <el-step :title="t('logistics.fulfillment.status.shipping')" />
                <el-step :title="t('logistics.fulfillment.status.completed')" />
              </el-steps>
            </div>
          </div>

          <!-- Alerts inside Drawer -->
          <el-alert
            v-if="hasRestrictedItems"
            :title="t('logistics.fulfillment.alerts.restricted')"
            type="error"
            show-icon
            :closable="false"
          />
          <el-alert
            v-if="hasOutOfStockItems"
            :title="t('logistics.fulfillment.alerts.outOfStock')"
            type="warning"
            show-icon
            :closable="false"
          />

          <!-- Multi-column Layout inside Drawer -->
          <el-row :gutter="20">
            <!-- Left side: Picking Checklist -->
            <el-col :span="13">
              <el-card shadow="never">
                <template #header>
                  <div class="flex justify-between items-center">
                    <span class="font-bold">{{
                      t("logistics.fulfillment.pickingList")
                    }}</span>
                    <el-tag type="info" size="small"
                      >{{ detailData.items.length }} sản phẩm</el-tag
                    >
                  </div>
                </template>

                <el-table
                  :data="detailData.items"
                  stripe
                  style="width: 100%"
                  size="small"
                >
                  <el-table-column width="50" align="center">
                    <template #default="scope">
                      <el-checkbox
                        v-model="scope.row.isPicked"
                        @change="
                          (val) =>
                            handleTogglePick(scope.row.id, val as boolean)
                        "
                        :disabled="detailData.status >= 1"
                      />
                    </template>
                  </el-table-column>

                  <el-table-column
                    :label="t('logistics.fulfillment.table.image')"
                    width="65"
                  >
                    <template #default="scope">
                      <el-image
                        v-if="scope.row.thumbnailUrl"
                        :src="scope.row.thumbnailUrl"
                        class="w-10 h-10 rounded border border-gray-100"
                        fit="cover"
                      >
                        <template #error>
                          <div
                            class="flex items-center justify-center w-full h-full bg-gray-50 text-gray-300"
                          >
                            <el-icon><Picture /></el-icon>
                          </div>
                        </template>
                      </el-image>
                      <div
                        v-else
                        class="w-10 h-10 rounded flex items-center justify-center bg-gray-50 text-gray-300 border border-gray-100"
                      >
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-table-column>

                  <el-table-column
                    :label="t('logistics.fulfillment.table.product')"
                    min-width="120"
                  >
                    <template #default="scope">
                      <div
                        class="font-medium text-xs text-gray-900 leading-tight"
                      >
                        {{ scope.row.productName }}
                      </div>
                      <div class="text-[10px] text-gray-400 font-mono mt-0.5">
                        SKU: {{ scope.row.sku }}
                      </div>
                    </template>
                  </el-table-column>

                  <el-table-column
                    :label="t('logistics.fulfillment.table.shelf')"
                    width="90"
                    align="center"
                  >
                    <template #default="scope">
                      <el-tag
                        effect="dark"
                        type="success"
                        size="small"
                        class="font-mono"
                        >{{ scope.row.shelfLocation }}</el-tag
                      >
                    </template>
                  </el-table-column>

                  <el-table-column
                    :label="t('logistics.fulfillment.table.qty')"
                    width="50"
                    align="center"
                  >
                    <template #default="scope">
                      <span
                        class="font-bold text-xs"
                        :class="
                          scope.row.quantity > 1
                            ? 'text-orange-600'
                            : 'text-gray-700'
                        "
                      >
                        x{{ scope.row.quantity }}
                      </span>
                    </template>
                  </el-table-column>

                  <el-table-column
                    :label="t('logistics.fulfillment.table.picked')"
                    width="80"
                    align="center"
                  >
                    <template #default="scope">
                      <el-tag
                        v-if="scope.row.isPicked"
                        type="success"
                        size="small"
                        effect="plain"
                        >Đã nhặt</el-tag
                      >
                      <el-tag v-else type="info" size="small" effect="plain"
                        >Chờ</el-tag
                      >
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </el-col>

            <!-- Right side: Customer Info & Timeline -->
            <el-col :span="11">
              <div class="flex flex-col gap-4">
                <!-- Dispatch Panel -->
                <el-card shadow="never">
                  <template #header>
                    <span class="font-bold">{{
                      t("logistics.fulfillment.dispatchPanel")
                    }}</span>
                  </template>

                  <!-- Customer Info -->
                  <div class="mb-4">
                    <h4
                      class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
                    >
                      {{ t("logistics.fulfillment.customer") }}
                    </h4>
                    <div class="font-medium text-sm text-gray-900 mb-1">
                      {{ detailData.customerName || "-" }}
                    </div>
                    <div
                      class="text-xs text-gray-600 mb-1 flex items-center gap-1.5"
                    >
                      <el-icon><Phone /></el-icon>
                      {{ detailData.customerPhone || "-" }}
                    </div>
                    <div
                      class="text-xs text-gray-600 flex items-start gap-1.5 leading-snug"
                    >
                      <el-icon class="mt-0.5"><Location /></el-icon>
                      <span>{{ detailData.customerAddress || "-" }}</span>
                    </div>
                  </div>

                  <el-divider class="my-3" />

                  <!-- Financial -->
                  <div class="mb-4">
                    <h4
                      class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
                    >
                      {{ t("logistics.fulfillment.financial") }}
                    </h4>
                    <div class="flex justify-between text-xs mb-1.5">
                      <span class="text-gray-600"
                        >{{ t("logistics.fulfillment.codAmount") }}:</span
                      >
                      <span class="font-bold text-red-500">{{
                        formatCurrency(detailData.codAmount)
                      }}</span>
                    </div>
                    <div class="flex justify-between text-xs">
                      <span class="text-gray-600"
                        >{{ t("logistics.fulfillment.shippingCost") }}:</span
                      >
                      <span class="font-semibold text-gray-800">{{
                        formatCurrency(detailData.shippingCost)
                      }}</span>
                    </div>
                  </div>

                  <el-divider class="my-3" />

                  <!-- Carrier Partner config -->
                  <div class="mb-4">
                    <h4
                      class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
                    >
                      {{ t("logistics.fulfillment.carrier") }}
                    </h4>
                    <el-select
                      v-model="detailData.carrier"
                      class="w-full mb-3"
                      size="small"
                      :disabled="detailData.status >= 2"
                      placeholder="Chọn nhà vận chuyển"
                    >
                      <el-option label="Giao Hàng Tiết Kiệm" value="GHTK" />
                      <el-option label="Viettel Post" value="ViettelPost" />
                      <el-option label="Giao Hàng Nhanh" value="GHN" />
                      <el-option
                        label="Đội xe nội bộ (Tự giao)"
                        value="Internal"
                      />
                    </el-select>

                    <h4
                      class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2"
                    >
                      {{ t("logistics.fulfillment.trackingCode") }}
                    </h4>
                    <el-input
                      v-model="detailData.trackingNumber"
                      size="small"
                      :placeholder="t('logistics.fulfillment.inputTracking')"
                      :disabled="detailData.status >= 2"
                    >
                      <template #append>
                        <el-button
                          icon="Check"
                          @click="handleUpdateTracking"
                          :disabled="detailData.status >= 2"
                        />
                      </template>
                    </el-input>
                  </div>

                  <!-- Action Buttons -->
                  <div class="mt-4 flex flex-col gap-2">
                    <el-button
                      v-if="detailData.status === 0"
                      type="primary"
                      size="default"
                      class="w-full font-bold"
                      @click="handleUpdateStatus(1)"
                    >
                      {{ t("logistics.fulfillment.actions.startPacking") }}
                    </el-button>

                    <el-button
                      v-if="detailData.status === 1"
                      type="success"
                      size="default"
                      class="w-full font-bold"
                      @click="handleUpdateStatus(2)"
                    >
                      {{ t("logistics.fulfillment.actions.exportWarehouse") }}
                    </el-button>

                    <el-button
                      v-if="detailData.status === 2"
                      type="primary"
                      size="default"
                      plain
                      class="w-full font-bold"
                      @click="handleUpdateStatus(3)"
                    >
                      {{ t("logistics.fulfillment.actions.markCompleted") }}
                    </el-button>
                  </div>

                  <el-alert
                    v-if="!isAllPicked && detailData.status === 0"
                    :title="t('logistics.fulfillment.alerts.pickingIncomplete')"
                    type="info"
                    show-icon
                    :closable="false"
                    class="mt-3"
                  />
                </el-card>

                <!-- Milestone Journey Timeline -->
                <el-card
                  v-if="detailData.trackingNumber"
                  shadow="never"
                  class="timeline-card"
                >
                  <template #header>
                    <div class="flex items-center gap-1.5 font-bold">
                      <el-icon class="text-blue-500"><Calendar /></el-icon>
                      <span>{{ t("logistics.tracking.timelineTitle") }}</span>
                    </div>
                  </template>

                  <div v-loading="loadingTracking" class="min-h-24">
                    <div v-if="sortedMilestones.length > 0" class="p-1">
                      <el-timeline class="tracking-timeline-dense">
                        <el-timeline-item
                          v-for="(milestone, idx) in sortedMilestones"
                          :key="idx"
                          :timestamp="formatDate(milestone.timestamp)"
                          :color="milestone.isCurrent ? '#409eff' : '#909399'"
                          :size="milestone.isCurrent ? 'large' : 'normal'"
                        >
                          <div class="font-semibold text-xs text-gray-800">
                            {{ milestone.location }}
                          </div>
                          <div class="text-[11px] text-gray-500 mt-0.5">
                            {{ milestone.description }}
                          </div>
                        </el-timeline-item>
                      </el-timeline>
                    </div>
                    <div
                      v-else
                      class="text-center py-6 text-xs text-gray-400 italic"
                    >
                      Chưa phát sinh lịch trình vận chuyển từ đối tác 3PL
                    </div>
                  </div>
                </el-card>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import {
  Phone,
  Location,
  Picture,
  Search,
  Calendar,
} from "@element-plus/icons-vue";
import dayjs from "dayjs";

import {
  getFulfillmentOrders,
  getFulfillmentDetail,
  updateParcelStatus,
  updateTrackingNumber,
  toggleItemPick,
} from "@/api/logistics/fulfillment";
import { getShipmentTracking } from "@/api/logistics/tracking";

import type { FulfillmentDetailResponse } from "@/api/logistics/fulfillment";
import type { TrackingResponse } from "@/api/logistics/tracking";

defineOptions({ name: "FulfillmentList" });

const { t } = useI18n();

// Filters & State
const loading = ref(false);
const filterParams = ref({
  dateRange: [] as any[],
  carrier: "",
  region: "",
  status: 3, // Default to Completed (3)
});

const orderList = ref<FulfillmentDetailResponse[]>([]);

// Filter Client-side for region (Province/City)
const filteredOrderList = computed(() => {
  let list = orderList.value;
  if (filterParams.value.region) {
    const r = filterParams.value.region.toLowerCase().trim();
    list = list.filter((o) => o.customerAddress?.toLowerCase().includes(r));
  }
  return list;
});

// Pagination
const pagination = ref({
  current: 1,
  size: 10,
  total: 0,
});

watch(filteredOrderList, (newVal) => {
  pagination.value.total = newVal.length;
});

const pagedOrderList = computed(() => {
  const start = (pagination.value.current - 1) * pagination.value.size;
  const end = start + pagination.value.size;
  return filteredOrderList.value.slice(start, end);
});

const handleSizeChange = (val: number) => {
  pagination.value.size = val;
  pagination.value.current = 1;
};

const handleCurrentChange = (val: number) => {
  pagination.value.current = val;
};

// Table Columns Config
const columns = computed(() => [
  { label: "Mã vận đơn nội bộ", prop: "id", minWidth: 100 },
  {
    label: "Đơn hàng gốc",
    prop: "originalOrderCode",
    minWidth: 160,
    useSlot: true,
  },
  {
    label: "Mã vận đơn 3PL",
    prop: "trackingNumber",
    minWidth: 150,
    useSlot: true,
  },
  { label: "Đối tác", prop: "carrier", minWidth: 120, useSlot: true },
  { label: "Khách hàng", prop: "customerName", minWidth: 150 },
  { label: "Số điện thoại", prop: "customerPhone", minWidth: 120 },
  { label: "COD thu hộ", prop: "codAmount", minWidth: 130, useSlot: true },
  { label: "Phí ship", prop: "shippingCost", minWidth: 110, useSlot: true },
  { label: "Ngày tạo", prop: "createdAt", minWidth: 160, useSlot: true },
  {
    label: "Ngày hoàn thành",
    prop: "deliveredAt",
    minWidth: 160,
    useSlot: true,
  },
  { label: "Thao tác", prop: "actions", minWidth: 100, useSlot: true },
]);

// Drawer Detail State
const drawerVisible = ref(false);
const selectedOrderId = ref<number | null>(null);
const loadingDetail = ref(false);
const detailData = ref<FulfillmentDetailResponse>({
  id: 0,
  trackingNumber: "",
  originalOrderCode: "",
  customerName: "",
  customerPhone: "",
  customerAddress: "",
  carrier: "",
  status: 0,
  codAmount: 0,
  shippingCost: 0,
  createdAt: "",
  items: [],
});

const trackingData = ref<TrackingResponse | null>(null);
const loadingTracking = ref(false);

const currentStep = computed(() => {
  if (detailData.value.status === 4) return 4;
  return detailData.value.status;
});

const hasRestrictedItems = computed(() => {
  return detailData.value.items.some((item) => item.isRestricted);
});

const hasOutOfStockItems = computed(() => {
  return detailData.value.items.some((item) => item.isOutOfStock);
});

const isAllPicked = computed(() => {
  if (detailData.value.items.length === 0) return false;
  return detailData.value.items.every((item) => item.isPicked);
});

const sortedMilestones = computed(() => {
  if (!trackingData.value?.milestones) return [];
  return [...trackingData.value.milestones].sort(
    (a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf(),
  );
});

// Methods
const fetchOrders = async () => {
  loading.value = true;
  try {
    const params: any = {};
    if (
      filterParams.value.status !== null &&
      filterParams.value.status !== undefined
    ) {
      params.status = filterParams.value.status;
    }
    if (filterParams.value.carrier) {
      params.carrier = filterParams.value.carrier;
    }
    if (
      filterParams.value.dateRange &&
      filterParams.value.dateRange.length === 2
    ) {
      params.fromDate = dayjs(filterParams.value.dateRange[0])
        .startOf("day")
        .toISOString();
      params.toDate = dayjs(filterParams.value.dateRange[1])
        .endOf("day")
        .toISOString();
    }

    const res = await getFulfillmentOrders(params);
    orderList.value = (res as any).data || res || [];
  } catch (error) {
    console.error("Failed to load fulfillment list", error);
    ElMessage.error("Không thể tải danh sách đơn hàng.");
    orderList.value = [];
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filterParams.value = {
    dateRange: [],
    carrier: "",
    region: "",
    status: 3,
  };
  pagination.value.current = 1;
  void fetchOrders();
};

const openDetail = async (row: any) => {
  selectedOrderId.value = row.id;
  drawerVisible.value = true;
  await fetchDetail(row.id);
};

const fetchDetail = async (id: number) => {
  loadingDetail.value = true;
  loadingTracking.value = false;
  trackingData.value = null;

  try {
    const res = await getFulfillmentDetail(id);
    detailData.value = (res as any).data || res;

    // Fetch Milestones from 3PL tracking if tracking number exists
    if (detailData.value.trackingNumber) {
      loadingTracking.value = true;
      try {
        const trackRes = await getShipmentTracking(
          detailData.value.trackingNumber,
        );
        trackingData.value = (trackRes as any).data || trackRes;
      } catch (trackError) {
        console.warn("Failed to fetch shipment tracking details", trackError);
      } finally {
        loadingTracking.value = false;
      }
    }
  } catch (error) {
    console.error("Failed to fetch detail", error);
    ElMessage.error("Không tải được chi tiết đơn hàng.");
  } finally {
    loadingDetail.value = false;
  }
};

const handleTogglePick = async (itemId: number, isPicked: boolean) => {
  try {
    await toggleItemPick(itemId, isPicked);
    ElMessage.success("Cập nhật nhặt hàng thành công");
  } catch (error) {
    console.warn("API error, state is kept locally", error);
  }
};

const handleUpdateTracking = async () => {
  if (!detailData.value.trackingNumber) return;
  try {
    await updateTrackingNumber(
      detailData.value.id,
      detailData.value.trackingNumber,
    );
    ElMessage.success("Cập nhật mã vận đơn thành công");
    if (selectedOrderId.value) {
      await fetchDetail(selectedOrderId.value);
    }
    await fetchOrders();
  } catch (error) {
    console.error(error);
    ElMessage.error("Không cập nhật được mã vận đơn.");
  }
};

const handleUpdateStatus = async (newStatus: number) => {
  if (newStatus === 1 && !isAllPicked.value) {
    ElMessage.warning(t("logistics.fulfillment.alerts.pickingIncomplete"));
    return;
  }

  try {
    await updateParcelStatus(detailData.value.id, newStatus);
    ElMessage.success("Cập nhật trạng thái thành công");
    if (selectedOrderId.value) {
      await fetchDetail(selectedOrderId.value);
    }
    await fetchOrders();
  } catch (error) {
    console.error(error);
    ElMessage.error("Cập nhật trạng thái thất bại.");
  }
};

// Utilities
const getCarrierLabel = (carrier: string) => {
  switch (carrier) {
    case "GHTK":
      return "Giaohangtietkiem";
    case "GHN":
      return "Giaohangnhanh";
    case "ViettelPost":
      return "Viettel Post";
    case "Internal":
      return "Đội xe nội bộ";
    default:
      return carrier || "Chưa chọn";
  }
};

const getCarrierTagType = (carrier: string) => {
  switch (carrier) {
    case "GHTK":
      return "success";
    case "GHN":
      return "warning";
    case "ViettelPost":
      return "danger";
    case "Internal":
      return "primary";
    default:
      return "info";
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  return dayjs(dateStr).format("DD/MM/YYYY HH:mm");
};

onMounted(() => {
  void fetchOrders();
});
</script>

<style scoped>
.timeline-card :deep(.el-card__body) {
  max-height: 250px;
  overflow-y: auto;
}

.tracking-timeline-dense :deep(.el-timeline-item) {
  padding-bottom: 12px;
}
</style>
