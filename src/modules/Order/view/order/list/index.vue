<template>
  <div class="online-orders-page flex flex-col gap-4 pb-5">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
      <ArtStatsCard
        v-for="tab in tabs"
        :key="tab.id"
        :title="tab.label"
        :count="getCountForTab(tab.id)"
        :icon="tab.icon"
        :iconStyle="tab.iconStyle"
        class="cursor-pointer"
        @click="activeTab = tab.id"
      />
    </div>

    <!-- Search Bar -->
    <ArtSearchBar
      v-model="searchForm"
      :items="searchItems"
      :label-width="110"
      :span="8"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- Bulk Actions Bar -->
    <div
      v-if="selectedRowIds.length > 0"
      class="bulk-actions-bar bg-blue-50 p-3 rounded flex items-center gap-2"
    >
      <span class="text-sm text-gray-700 font-medium"
        >Đã chọn {{ selectedRowIds.length }} đơn</span
      >
      <ElButton
        size="small"
        type="primary"
        @click="handleBulkApprove"
        :loading="bulkActionLoading"
      >
        Duyệt hàng loạt
      </ElButton>
      <ElButton
        size="small"
        type="success"
        @click="handleBulkPrint"
        :loading="bulkActionLoading"
      >
        In tem hàng loạt
      </ElButton>
      <ElButton
        size="small"
        type="danger"
        @click="handleBulkCancel"
        :loading="bulkActionLoading"
      >
        Hủy
      </ElButton>
    </div>

    <!-- Table -->
    <ElCard class="art-table-card">
      <ArtTableHeader
        v-model:columns="columnChecks"
        :loading="loading"
        @refresh="fetchData"
      >
        <template #left>
          <ElButton type="primary" v-ripple @click="handleRefresh">
            <ElIcon class="mr-1"><Refresh /></ElIcon> Làm mới
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="paginatedOrders"
        :columns="columns"
        :selection="{ selectedRowIds, onChange: handleSelectionChange }"
        @row-click="handleRowClick"
      >
        <template #createdAt="{ row }">
          {{ formatDateTime(row.createdAt) }}
        </template>
        <template #customer="{ row }">
          <div class="flex flex-col">
            <span class="font-medium text-[var(--el-text-color-primary)]">{{
              row.customerName || row.buyerName || "---"
            }}</span>
            <span class="text-xs text-[var(--el-text-color-secondary)]">{{
              row.customerPhone || row.buyerEmail || "---"
            }}</span>
          </div>
        </template>
        <template #paymentMethod="{ row }">
          {{ getPaymentMethodLabel(row.paymentMethod) }}
        </template>
        <template #paymentStatus="{ row }">
          <ElTag
            :type="getPaymentStatusTagType(row.paymentStatus)"
            size="small"
          >
            {{ getPaymentStatusLabel(row.paymentStatus) }}
          </ElTag>
        </template>
        <template #inventoryLock="{ row }">
          <ElTag
            v-if="row.isInventoryLocked"
            type="warning"
            size="small"
            effect="plain"
          >
            🔒 Đã giữ chỗ
          </ElTag>
          <span v-else class="text-gray-400 text-xs">---</span>
        </template>
        <template #total="{ row }">
          <span class="font-semibold text-[var(--el-text-color-primary)]">{{
            formatCurrency(row.total || 0)
          }}</span>
        </template>
        <template #statusId="{ row }">
          <ElTag :type="getStatusTagType(row.statusId)" size="small">
            {{ getStatusLabel(row.statusId) }}
          </ElTag>
        </template>
        <template #id="{ row }"> ORD-{{ row.id }} </template>
      </ArtTable>

      <!-- Pagination -->
      <div class="flex justify-end mt-4">
        <ElPagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="filteredOrders.length"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </ElCard>

    <!-- Modal for Order Details -->
    <ElDialog
      v-model="drawer.visible"
      :title="drawer.order ? `Chi tiết đơn #${drawer.order.id}` : ''"
      width="60%"
      :destroy-on-close="true"
    >
      <div v-if="drawer.order" class="order-detail">
        <!-- Order Summary -->
        <div class="summary grid grid-cols-2 gap-4 mb-4">
          <div><strong>Mã đơn:</strong> ORD-{{ drawer.order.id }}</div>
          <div>
            <strong>Ngày đặt:</strong>
            {{ formatDateTime(drawer.order.createdAt) }}
          </div>
          <div>
            <strong>Trạng thái:</strong>
            <ElTag
              :type="getStatusTagType(drawer.order.statusId)"
              size="small"
              class="ml-2"
            >
              {{ getStatusLabel(drawer.order.statusId) }}
            </ElTag>
          </div>
          <div>
            <strong>Thanh toán:</strong>
            <ElTag
              :type="getPaymentStatusTagType(drawer.order.paymentStatus)"
              size="small"
              class="ml-2"
            >
              {{ getPaymentStatusLabel(drawer.order.paymentStatus) }}
            </ElTag>
          </div>
          <div class="col-span-2">
            <strong>Khách hàng:</strong>
            {{ drawer.order.customerName || drawer.order.buyerName || "---" }}
          </div>
          <div>
            <strong>SĐT:</strong>
            {{ drawer.order.customerPhone || drawer.order.buyerPhone || "---" }}
          </div>
          <div class="col-span-2">
            <strong>Địa chỉ giao hàng:</strong>
            {{ drawer.order.customerAddress || "---" }}
          </div>
        </div>

        <!-- Order Total Breakdown -->
        <div
          class="total-breakdown mb-4 p-3 bg-[var(--el-fill-color-light)] rounded"
        >
          <h4 class="font-bold mb-2 text-[var(--el-text-color-primary)]">
            Tổng doanh thu
          </h4>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span>Tổng tiền hàng:</span>
              <span class="font-medium">{{
                formatCurrency(drawer.order.subtotal || 0)
              }}</span>
            </div>
            <div
              v-if="(drawer.order.shippingFee || 0) > 0"
              class="flex justify-between"
            >
              <span>Phí vận chuyển:</span>
              <span class="font-medium">{{
                formatCurrency(drawer.order.shippingFee)
              }}</span>
            </div>
            <div
              v-if="(drawer.order.discount || 0) > 0"
              class="flex justify-between text-red-600"
            >
              <span>Giảm giá:</span>
              <span class="font-medium"
                >-{{ formatCurrency(drawer.order.discount) }}</span
              >
            </div>
            <div
              class="flex justify-between text-base font-bold text-primary border-t pt-1 mt-1"
            >
              <span>Tổng cộng:</span>
              <span>{{ formatCurrency(drawer.order.total) }}</span>
            </div>
          </div>
        </div>

        <!-- Products Table -->
        <div class="products-section">
          <h4 class="font-bold mb-2 text-[var(--el-text-color-primary)]">
            Chi tiết giỏ hàng
          </h4>
          <ElTable
            :data="drawer.order.products || []"
            border
            size="small"
            max-height="400"
          >
            <ElTableColumn label="Ảnh" width="80" align="center">
              <template #default="{ row }">
                <img
                  v-if="row.coverImageUrl"
                  :src="row.coverImageUrl"
                  class="w-12 h-12 object-cover rounded"
                />
                <span v-else class="text-gray-400">---</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="Tên sản phẩm" min-width="200">
              <template #default="{ row }">
                {{ row.productName || `Sản phẩm #${row.productVariantId}` }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="Mã SKU" width="120">
              <template #default="{ row }">
                {{ row.productVariantId }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="SL" width="80" align="center">
              <template #default="{ row }">
                {{ row.count }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="Đơn giá" width="120" align="right">
              <template #default="{ row }">
                {{ formatCurrency(row.price) }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="Thành tiền" width="120" align="right">
              <template #default="{ row }">
                {{ formatCurrency((row.count || 0) * (row.price || 0)) }}
              </template>
            </ElTableColumn>
          </ElTable>
        </div>

        <!-- Total -->
        <div class="mt-4 text-right border-t pt-2">
          <div class="text-lg font-bold text-primary">
            Tổng cộng: {{ formatCurrency(drawer.order.total) }}
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2" v-if="drawer.order">
          <ElButton @click="drawer.visible = false">Đóng</ElButton>
          <ElButton
            v-if="canPushToWarehouse(drawer.order)"
            type="primary"
            :loading="pushing"
            @click="handlePushToWarehouse"
          >
            🖨️ In tem nhãn & Đẩy đơn sang kho
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { Refresh } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { SalesOrderApi } from "@/api/sales";
import type { SalesOrder, OrderProduct } from "@/domain/order/order.types";
import type { ColumnOption } from "@/types/component";

// ============================================
// MOCK DATA CONFIGURATION
// ============================================
const USE_MOCK = true; // Set to false to use real API

// Mock orders data
function getMockOrders(): SalesOrder[] {
  const now = new Date();
  return [
    {
      id: 1001,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      customerName: "Nguyễn Văn An",
      customerPhone: "0901234567",
      customerAddress: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      subtotal: 850000,
      shippingFee: 30000,
      discount: 0,
      total: 880000,
      statusId: "pending",
      paymentMethod: "COD",
      paymentStatus: "pending",
      isInventoryLocked: true,
      products: [
        {
          productVariantId: 501,
          productName: "Dầu nhớt Castrol 1L",
          count: 2,
          price: 250000,
          coverImageUrl: "https://via.placeholder.com/80?text=Oil",
        },
        {
          productVariantId: 502,
          productName: "Bộ lọc gió Honda",
          count: 1,
          price: 350000,
          coverImageUrl: "https://via.placeholder.com/80?text=Filter",
        },
      ],
    },
    {
      id: 1002,
      createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      customerName: "Trần Thị Bình",
      customerPhone: "0912345678",
      customerAddress: "456 Lê Duẩn, Quận 1, TP.HCM",
      subtotal: 480000,
      shippingFee: 25000,
      discount: 0,
      total: 505000,
      statusId: "confirmed_cod",
      paymentStatus: "paid",
      isInventoryLocked: true,
      paymentMethod: "COD",
      products: [
        {
          productVariantId: 503,
          productName: "Cà pê phanh xe máy",
          count: 4,
          price: 120000,
          coverImageUrl: "https://via.placeholder.com/80?text=Brake",
        },
      ],
    },
    {
      id: 1003,
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      customerName: "Lê Văn Cường",
      customerPhone: "0923456789",
      customerAddress: "789 Cách Mạng Tháng 8, Quận 3, TP.HCM",
      subtotal: 1710000,
      shippingFee: 25000,
      discount: 0,
      total: 1735000,
      statusId: "paid_processing",
      paymentStatus: "paid",
      isInventoryLocked: true,
      paymentMethod: "VNPay",
      products: [
        {
          productVariantId: 504,
          productName: "Lốp xe máy Michelin",
          count: 2,
          price: 450000,
          coverImageUrl: "https://via.placeholder.com/80?text=Tire",
        },
        {
          productVariantId: 505,
          productName: "Tay lái xe máy",
          count: 1,
          price: 1200000,
          coverImageUrl: "https://via.placeholder.com/80?text=Handle",
        },
      ],
    },
    {
      id: 1004,
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      customerName: "Phạm Thị Dung",
      customerPhone: "0934567890",
      customerAddress: "321 Võ Văn Ngân, Quận Bình Thạnh, TP.HCM",
      subtotal: 560000,
      shippingFee: 30000,
      discount: 0,
      total: 590000,
      statusId: "delivering",
      paymentStatus: "paid",
      isInventoryLocked: true,
      paymentMethod: "PayOS",
      products: [
        {
          productVariantId: 506,
          productName: "Dây phanh xe máy",
          count: 1,
          price: 560000,
          coverImageUrl: "https://via.placeholder.com/80?text=Cable",
        },
      ],
    },
    {
      id: 1005,
      createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
      customerName: "Hoàng Văn Em",
      customerPhone: "0945678901",
      customerAddress: "654 Đặng Thùy Trâm, Quận Bình Thạnh, TP.HCM",
      subtotal: 3200000,
      shippingFee: 0,
      discount: 0,
      total: 3200000,
      statusId: "completed",
      paymentStatus: "paid",
      isInventoryLocked: false,
      paymentMethod: "COD",
      products: [
        {
          productVariantId: 507,
          productName: "Xe máy tay ga Air Blade",
          count: 1,
          price: 3200000,
          coverImageUrl: "https://via.placeholder.com/80?text=Scooter",
        },
      ],
    },
    {
      id: 1006,
      createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      customerName: "Vũ Thị Giang",
      customerPhone: "0956789012",
      customerAddress: "987 Nguyễn Văn Cừ, Quận 5, TP.HCM",
      subtotal: 750000,
      shippingFee: 35000,
      discount: 0,
      total: 785000,
      statusId: "cancelled",
      paymentStatus: "failed",
      isInventoryLocked: false,
      paymentMethod: "VNPay",
      products: [
        {
          productVariantId: 508,
          productName: "Phuộc xe máy",
          count: 2,
          price: 375000,
          coverImageUrl: "https://via.placeholder.com/80?text=Suspension",
        },
      ],
    },
    {
      id: 1007,
      createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      customerName: "Đỗ Văn Huy",
      customerPhone: "0967890123",
      customerAddress: "147 Trần Hưng Đạo, Quận 1, TP.HCM",
      subtotal: 1850000,
      shippingFee: 25000,
      discount: 0,
      total: 1875000,
      statusId: "deposit_paid",
      paymentStatus: "paid",
      isInventoryLocked: true,
      paymentMethod: "PayOS",
      products: [
        {
          productVariantId: 509,
          productName: "Năm pô xe máy",
          count: 1,
          price: 1850000,
          coverImageUrl: "https://via.placeholder.com/80?text=Exhaust",
        },
      ],
    },
    {
      id: 1008,
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      customerName: "Lâm Thị Kiều",
      customerPhone: "0978901234",
      customerAddress: "258 Hồ Tùng Mậu, Quận 1, TP.HCM",
      subtotal: 690000,
      shippingFee: 30000,
      discount: 50000,
      total: 670000,
      statusId: "waiting_pickup",
      paymentStatus: "pending",
      isInventoryLocked: true,
      paymentMethod: "COD",
      products: [
        {
          productVariantId: 510,
          productName: "Gương xe máy",
          count: 2,
          price: 230000,
          coverImageUrl: "https://via.placeholder.com/80?text=Mirror",
        },
        {
          productVariantId: 511,
          productName: "Bơm nước xe máy",
          count: 1,
          price: 460000,
          coverImageUrl: "https://via.placeholder.com/80?text=Pump",
        },
      ],
    },
  ];
}

function getMockStatusMap(): Array<{ id: string; name: string }> {
  return [
    { id: "pending", name: "Chờ xác nhận" },
    { id: "confirmed_cod", name: "Đã xác nhận (COD)" },
    { id: "paid_processing", name: "Đang xử lý" },
    { id: "waiting_deposit", name: "Chờ đặt cọc" },
    { id: "deposit_paid", name: "Đã đặt cọc" },
    { id: "waiting_installment", name: "Chờ duyệt trả góp" },
    { id: "installment_approved", name: "Đã duyệt trả góp" },
    { id: "delivering", name: "Đang giao hàng" },
    { id: "waiting_pickup", name: "Chờ lấy hàng" },
    { id: "completed", name: "Đã hoàn thành" },
    { id: "cancelled", name: "Đã hủy" },
    { id: "refunding", name: "Đang hoàn tiền" },
    { id: "refunded", name: "Đã hoàn tiền" },
  ];
}

// ============================================
// ORIGINAL CODE
// ============================================

// Status group definitions
type StatusGroupId = "all" | "pending" | "packaged" | "shipping" | "failed";

interface TabItem {
  id: StatusGroupId;
  label: string;
  icon: string;
  iconStyle: string;
}

const tabs: TabItem[] = [
  {
    id: "all",
    label: "Tất cả",
    icon: "ri:file-list-3-line",
    iconStyle: "bg-primary",
  },
  {
    id: "pending",
    label: "Chờ duyệt",
    icon: "ri:time-line",
    iconStyle: "bg-warning",
  },
  {
    id: "packaged",
    label: "Đã đóng gói",
    icon: "ri:archive-line",
    iconStyle: "bg-info",
  },
  {
    id: "shipping",
    label: "Đang giao",
    icon: "ri:delivery-line",
    iconStyle: "bg-success",
  },
  {
    id: "failed",
    label: "Thất bại",
    icon: "ri:close-circle-line",
    iconStyle: "bg-danger",
  },
];

const loading = ref(false);
const bulkActionLoading = ref(false);
const pushing = ref(false);
const orders = ref<SalesOrder[]>([]);
const statusMap = ref<Array<{ id: string; name: string }>>([]);
const selectedRowIds = ref<number[]>([]);
const drawer = reactive({
  visible: false,
  order: null as SalesOrder | null,
});

const searchForm = reactive({
  search: "",
});

const pagination = reactive({
  current: 1,
  size: 20,
});

const activeTab = ref<StatusGroupId>("all");

// Search items
const searchItems = computed(() => [
  {
    label: "Từ khóa",
    key: "search",
    type: "input",
    props: { clearable: true, placeholder: "Mã đơn, tên, SĐT, địa chỉ" },
  },
]);

// Table columns
const columnChecks = ref<ColumnOption[]>([
  {
    prop: "createdAt",
    label: "Thời gian",
    width: 170,
    checked: true,
    useSlot: true,
  },
  { prop: "id", label: "Mã đơn", width: 120, checked: true, useSlot: true },
  {
    prop: "inventoryLock",
    label: "Tồn kho",
    width: 100,
    checked: true,
    useSlot: true,
  },
  {
    prop: "customer",
    label: "Khách hàng",
    minWidth: 200,
    checked: true,
    useSlot: true,
  },
  {
    prop: "paymentMethod",
    label: "Thanh toán",
    width: 140,
    checked: true,
    useSlot: true,
  },
  {
    prop: "paymentStatus",
    label: "TT thanh toán",
    width: 130,
    checked: true,
    useSlot: true,
  },
  {
    prop: "total",
    label: "Tổng tiền",
    width: 140,
    checked: true,
    useSlot: true,
  },
  {
    prop: "statusId",
    label: "Trạng thái",
    width: 150,
    checked: true,
    useSlot: true,
  },
]);

const columns = computed(() =>
  columnChecks.value.filter((item) => item.checked),
);

// Derived: filtered orders based on activeTab and search
const filteredOrders = computed(() => {
  let result = orders.value;

  // Filter by tab status group
  if (activeTab.value !== "all") {
    result = result.filter((order) =>
      belongsToStatusGroup(order.statusId, activeTab.value),
    );
  }

  // Filter by search
  if (searchForm.search.trim()) {
    const keyword = searchForm.search.toLowerCase();
    result = result.filter(
      (order) =>
        (order.id?.toString() || "").includes(keyword) ||
        (order.customerName?.toLowerCase() || "").includes(keyword) ||
        (order.customerPhone?.toLowerCase() || "").includes(keyword) ||
        (order.customerAddress?.toLowerCase() || "").includes(keyword),
    );
  }

  return result;
});

// Paginated orders (client-side pagination)
const paginatedOrders = computed(() => {
  const start = (pagination.current - 1) * pagination.size;
  const end = start + pagination.size;
  return filteredOrders.value.slice(start, end);
});

// Count per tab (based on all orders, not just current page)
const getCountForTab = (tabId: StatusGroupId) => {
  if (tabId === "all") return orders.value.length;
  return orders.value.filter((order) =>
    belongsToStatusGroup(order.statusId, tabId),
  ).length;
};

// Helper: check if order belongs to status group
function belongsToStatusGroup(
  statusId: string | undefined,
  group: StatusGroupId,
): boolean {
  if (!statusId) return false;
  switch (group) {
    case "pending":
      // Unconfirmed orders: pending, waiting_deposit, waiting_installment
      return ["pending", "waiting_deposit", "waiting_installment"].includes(
        statusId,
      );
    case "packaged":
      // Packaged/processed: paid_processing, deposit_paid, installment_approved
      return [
        "paid_processing",
        "deposit_paid",
        "installment_approved",
      ].includes(statusId);
    case "shipping":
      // Shipping: delivering, waiting_pickup
      return ["delivering", "waiting_pickup"].includes(statusId);
    case "failed":
      // Failed: cancelled, refunded, refunding
      return ["cancelled", "refunded", "refunding"].includes(statusId);
    case "all":
      return true;
    default:
      return false;
  }
}

// Helper: get payment status label
function getPaymentStatusLabel(status?: string): string {
  switch (status) {
    case "pending":
      return "Chờ chuyển khoản";
    case "paid":
      return "Đã trả trước";
    case "cod":
      return "Thu COD";
    case "failed":
      return "Thanh toán thất bại";
    default:
      return "---";
  }
}

// Helper: get payment status tag type
function getPaymentStatusTagType(
  status?: string,
): "success" | "warning" | "danger" | "info" {
  switch (status) {
    case "paid":
      return "success";
    case "pending":
      return "warning";
    case "cod":
      return "info";
    case "failed":
      return "danger";
    default:
      return "info";
  }
}

// Fetch data
async function fetchData() {
  loading.value = true;
  try {
    if (USE_MOCK) {
      // Simulate network delay for realistic feel
      await new Promise((resolve) => setTimeout(resolve, 500));
      orders.value = getMockOrders();
      if (statusMap.value.length === 0) {
        statusMap.value = getMockStatusMap();
      }
    } else {
      // Fetch confirmed and unconfirmed orders in parallel, with large page size to reduce calls
      const [confirmedRes, unconfirmedRes] = await Promise.all([
        SalesOrderApi.getConfirmedList({ current: 1, size: 1000 }),
        SalesOrderApi.getUnconfirmedList({ current: 1, size: 1000 }),
      ]);

      orders.value = [
        ...(confirmedRes.items || []),
        ...(unconfirmedRes.items || []),
      ].sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      );

      // Also fetch status map for display names if not already loaded
      if (statusMap.value.length === 0) {
        const statusMapRes = await SalesOrderApi.getStatusMap();
        statusMap.value = statusMapRes;
      }
    }
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    ElMessage.error("Không thể tải danh sách đơn hàng");
  } finally {
    loading.value = false;
  }
}

// Search & Reset
function handleSearch() {
  pagination.current = 1;
  // Already client-side filter, so just reset page
}

function handleReset() {
  searchForm.search = "";
  pagination.current = 1;
}

// Pagination
function handleSizeChange(size: number) {
  pagination.size = size;
  pagination.current = 1;
}

function handleCurrentChange(page: number) {
  pagination.current = page;
}

// Refresh
function handleRefresh() {
  fetchData();
}

// Selection
function handleSelectionChange(selection: SalesOrder[]) {
  selectedRowIds.value = selection.map((o) => o.id);
}

// Row click -> open drawer
function handleRowClick(row: SalesOrder) {
  // Fetch full detail if needed (the list might have incomplete product details)
  // But the list likely includes products already. We'll use the row's data.
  drawer.order = row;
  drawer.visible = true;
}

// Bulk actions
async function handleBulkApprove() {
  if (selectedRowIds.value.length === 0) return;
  try {
    await ElMessageBox.confirm(
      `Duyệt ${selectedRowIds.value.length} đơn hàng thành "Đã xác nhận (COD)"?`,
      "Xác nhận",
      { type: "warning" },
    );
    bulkActionLoading.value = true;
    await SalesOrderApi.updateManyOutputStatus({
      ids: selectedRowIds.value,
      statusId: "confirmed_cod",
    });
    ElMessage.success("Đã duyệt hàng loạt");
    selectedRowIds.value = [];
    fetchData();
  } catch (error) {
    if (error !== "cancel") {
      console.error(error);
      ElMessage.error("Duyệt thất bại");
    }
  } finally {
    bulkActionLoading.value = false;
  }
}

async function handleBulkPrint() {
  // Placeholder: For now, just log order IDs
  console.log("Print labels for orders:", selectedRowIds.value);
  ElMessage.info(
    `Tính năng in tem hàng loạt cho ${selectedRowIds.value.length} đơn đang được phát triển`,
  );
  // In a real implementation, you'd call an API to generate a PDF or send to printer
}

async function handleBulkCancel() {
  if (selectedRowIds.value.length === 0) return;
  try {
    await ElMessageBox.confirm(
      `Hủy ${selectedRowIds.value.length} đơn hàng?`,
      "Xác nhận",
      { type: "warning" },
    );
    bulkActionLoading.value = true;
    await SalesOrderApi.updateManyOutputStatus({
      ids: selectedRowIds.value,
      statusId: "cancelled",
    });
    ElMessage.success("Đã hủy hàng loạt");
    selectedRowIds.value = [];
    fetchData();
  } catch (error) {
    if (error !== "cancel") {
      console.error(error);
      ElMessage.error("Hủy thất bại");
    }
  } finally {
    bulkActionLoading.value = false;
  }
}

// Push to warehouse (single order from drawer)
async function handlePushToWarehouse() {
  if (!drawer.order) return;
  try {
    pushing.value = true;
    // 1. Print label: For now, just log; could open a print window
    // In a real system, you might call an API to generate a label PDF
    console.log("Printing label for order:", drawer.order.id);
    // Optionally trigger browser print with label content
    // window.print();

    // 2. Update status to next appropriate (delivering)
    const nextStatus = determineNextWarehouseStatus(drawer.order.statusId);
    if (!nextStatus) {
      ElMessage.warning("Đơn hàng không thể chuyển sang trạng thái kho");
      return;
    }
    await SalesOrderApi.updateStatus(drawer.order.id, nextStatus, []);
    ElMessage.success("Đã in tem và chuyển đơn sang kho");
    drawer.visible = false;
    fetchData();
  } catch (error) {
    console.error(error);
    ElMessage.error("Thao tác thất bại");
  } finally {
    pushing.value = false;
  }
}

function canPushToWarehouse(order: SalesOrder): boolean {
  const allowedStatuses = [
    "confirmed_cod",
    "paid_processing",
    "deposit_paid",
    "installment_approved",
  ];
  return allowedStatuses.includes(order.statusId || "");
}

function determineNextWarehouseStatus(
  currentStatus: string | undefined,
): string | null {
  // Based on OrderStatusTransitions, we can move to delivering or waiting_pickup
  // For simplicity, choose "delivering"
  if (!currentStatus) return null;
  const allowedTransitions = {
    confirmed_cod: ["delivering", "waiting_pickup", "completed", "refunding"],
    paid_processing: ["delivering", "waiting_pickup", "completed", "refunding"],
    deposit_paid: ["delivering", "waiting_pickup", "completed", "refunding"],
    installment_approved: [
      "delivering",
      "waiting_pickup",
      "completed",
      "refunding",
    ],
  };
  return allowedTransitions[
    currentStatus as keyof typeof allowedTransitions
  ]?.includes("delivering")
    ? "delivering"
    : null;
}

// Helper: format currency
function formatCurrency(val?: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(val || 0));
}

// Helper: format date time
function formatDateTime(value?: string): string {
  if (!value) return "---";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "---";
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Helper: get status label from map or statuses
function getStatusLabel(statusId?: string): string {
  if (!statusId) return "---";
  const found = statusMap.value.find((s) => s.id === statusId);
  if (found) return found.name;
  // Fallback to hardcoded map (if statusMap not loaded yet)
  const hardcoded: Record<string, string> = {
    pending: "Chờ xác nhận",
    confirmed_cod: "Đã xác nhận (COD)",
    paid_processing: "Đang xử lý",
    waiting_deposit: "Chờ đặt cọc",
    deposit_paid: "Đã đặt cọc",
    waiting_installment: "Chờ duyệt trả góp",
    installment_approved: "Đã duyệt trả góp",
    delivering: "Đang giao hàng",
    waiting_pickup: "Chờ lấy hàng",
    completed: "Đã hoàn thành",
    cancelled: "Đã hủy",
    refunding: "Đang hoàn tiền",
    refunded: "Đã hoàn tiền",
  };
  return hardcoded[statusId] || statusId;
}

function getStatusTagType(
  statusId?: string,
): "success" | "warning" | "info" | "danger" | "primary" {
  const map: Record<
    string,
    "success" | "warning" | "info" | "danger" | "primary"
  > = {
    pending: "info",
    waiting_deposit: "warning",
    waiting_installment: "warning",
    confirmed_cod: "primary",
    paid_processing: "primary",
    deposit_paid: "primary",
    installment_approved: "primary",
    delivering: "primary",
    waiting_pickup: "success",
    completed: "success",
    cancelled: "danger",
    refunding: "warning",
    refunded: "info",
  };
  return map[statusId || ""] || "info";
}

function getPaymentMethodLabel(method?: string): string {
  if (!method) return "---";
  const map: Record<string, string> = {
    COD: "Tiền mặt",
    VNPay: "VNPay",
    PayOS: "PayOS",
  };
  return map[method] || method;
}

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.online-orders-page {
  padding: 16px;
}

.bulk-actions-bar {
  animation: slide-down 0.3s ease-out;
}

@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.order-detail {
  padding-right: 8px;
}

.order-detail .summary div {
  margin-bottom: 8px;
}

.products-section h4 {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
}
</style>
