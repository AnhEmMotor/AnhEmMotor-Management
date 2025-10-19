<template>
  <div class="box-bg">
    <div class="flex items-start justify-between mb-4">
      <h1 class="title-style">Đơn Hàng Của Tôi</h1>
      <div class="flex items-center">
        <!-- Right side filter/menu (matches RolePermissionManager layout) -->
        <OrderFilterButtons v-model="selectedStatuses" />
        <span class="h-8 border-r-2 border-black-300 mx-2" />
        <RoundButton color="blue" @click="createNewOrder">Tạo đơn mới</RoundButton>
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="table-style">
        <thead>
          <tr class="header-table-style">
            <th class="text-style">Mã ĐH</th>
            <th class="text-style">Ngày Đặt</th>
            <th class="text-style">Sản phẩm</th>
            <th class="text-style">Trạng Thái</th>
            <th class="text-style">Tổng Tiền</th>
            <th class="text-center-style">Hành động</th>
          </tr>
        </thead>
        <tbody class="tbody-table-style">
          <tr v-if="orders.length === 0">
            <td colspan="7" class="text-center p-4">Không có đơn hàng nào.</td>
          </tr>
          <tr v-else v-for="order in displayedOrders" :key="order.id" class="row-table-style">
            <td class="text-style whitespace-nowrap">{{ order.id }}</td>
            <td class="text-style">{{ order.date }}</td>
            <td class="text-style">{{ order.productSummary }}</td>
            <td class="text-style">
              <RoundBadge :color="order.status.color">{{ order.status.text }}</RoundBadge>
            </td>
            <td class="text-style">{{ order.total.toLocaleString('vi-VN') }} VNĐ</td>
            <td class="text-center-style">
              <BaseSmallNoBgButton color="blue" @click="handleEditOrder(order)"
                >Sửa</BaseSmallNoBgButton
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Order Detail Modal -->
    <OrderDetailModal
      :visible="showDetailModal"
      :order="selectedOrder"
      @close="showDetailModal = false"
      @update-status="updateOrderStatus"
    />
    <!-- Order Create Form (Draggable Modal) -->
    <OrderForm
      v-if="showOrderForm"
      :show="showOrderForm"
      :zIndex="110"
      :order="selectedOrder"
      @close="showOrderForm = false"
      @save="handleSaveNewOrder"
      @activate="() => {}"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import RoundBadge from '@/components/ui/RoundBadge.vue'
import RoundButton from '@/components/ui/BaseRoundButton.vue'
import OrderFilterButtons from '@/components/orders/OrderFilterButtons.vue'
import OrderDetailModal from '@/components/orders/OrderDetailModal.vue'
import OrderForm from '@/components/orders/OrderForm.vue'
import BaseSmallNoBgButton from '@/components/ui/button/BaseSmallNoBgButton.vue'

// Richer mock orders (numeric totals and products) so modal can display details
const orders = ref([
  {
    id: 'ORD-001',
    date: '2025-10-01',
    customerName: 'A',
    productSummary: '1 xe',
    status: { key: 'pending', text: 'Chờ xác nhận', color: 'gray' },
    total: 10000000,
    type: 'sale',
    products: [{ name: 'Xe A', qty: 1, price: 10000000 }],
  },
  {
    id: 'ORD-002',
    date: '2025-10-02',
    customerName: 'B',
    productSummary: '1 phụ kiện',
    status: { key: 'completed', text: 'Đã hoàn thành', color: 'green' },
    total: 500000,
    type: 'sale',
    products: [{ name: 'PK B', qty: 1, price: 500000 }],
  },
  {
    id: 'ORD-003',
    date: '2025-10-03',
    customerName: 'C',
    productSummary: '1 đơn',
    status: { key: 'canceled', text: 'Đã hủy', color: 'red' },
    total: 0,
    type: 'sale',
    products: [],
  },
  {
    id: 'ORD-004',
    date: '2025-10-04',
    customerName: 'D',
    productSummary: '1 đơn',
    status: { key: 'refunding', text: 'Đang hoàn tiền', color: 'yellow' },
    total: 200000,
    type: 'sale',
    products: [{ name: 'P D', qty: 1, price: 200000 }],
  },
  {
    id: 'ORD-005',
    date: '2025-10-05',
    customerName: 'E',
    productSummary: '1 đơn',
    status: { key: 'refunded', text: 'Đã hoàn tiền', color: 'gray' },
    total: 0,
    type: 'sale',
    products: [],
  },
  {
    id: 'ORD-006',
    date: '2025-10-06',
    customerName: 'F',
    productSummary: '1 đơn',
    status: { key: 'confirmed_cod', text: 'Đã xác nhận (Chờ thanh toán COD)', color: 'yellow' },
    total: 12000000,
    type: 'sale',
    products: [{ name: 'Xe F', qty: 1, price: 12000000 }],
  },
  {
    id: 'ORD-007',
    date: '2025-10-07',
    customerName: 'G',
    productSummary: '1 đơn',
    status: { key: 'paid_processing', text: 'Đã thanh toán (Chờ xử lý)', color: 'blue' },
    total: 8000000,
    type: 'sale',
    products: [{ name: 'Xe G', qty: 1, price: 8000000 }],
  },
  {
    id: 'ORD-008',
    date: '2025-10-08',
    customerName: 'H',
    productSummary: '1 đơn',
    status: { key: 'waiting_deposit', text: 'Chờ đặt cọc', color: 'gray' },
    total: 20000000,
    type: 'sale',
    products: [{ name: 'Xe H', qty: 1, price: 20000000 }],
  },
  {
    id: 'ORD-009',
    date: '2025-10-09',
    customerName: 'I',
    productSummary: '1 đơn',
    status: { key: 'deposit_paid', text: 'Đã đặt cọc (Chờ xử lý)', color: 'blue' },
    total: 20000000,
    type: 'sale',
    products: [{ name: 'Xe I', qty: 1, price: 20000000 }],
  },
  {
    id: 'ORD-010',
    date: '2025-10-10',
    customerName: 'J',
    productSummary: '1 đơn',
    status: { key: 'delivering', text: 'Đang giao hàng', color: 'blue' },
    total: 300000,
    type: 'sale',
    products: [{ name: 'PK J', qty: 1, price: 300000 }],
  },
  {
    id: 'ORD-011',
    date: '2025-10-11',
    customerName: 'K',
    productSummary: '1 đơn',
    status: { key: 'waiting_pickup', text: 'Chờ lấy hàng tại cửa hàng', color: 'green' },
    total: 15000000,
    type: 'sale',
    products: [{ name: 'Xe K', qty: 1, price: 15000000 }],
  },
])

// UI state
const selectedStatuses = ref([])
const showDetailModal = ref(false)
const selectedOrder = ref(null)
const showOrderForm = ref(false)

// Map Vietnamese status text to a normalized key used by filter buttons
function statusTextToKey(text) {
  if (!text) return ''
  const t = text.toLowerCase()
  if (t.includes('hoàn thành')) return 'completed'
  if (t.includes('giao')) return 'completed'
  if (t.includes('xác nhận')) return 'confirmed'
  if (t.includes('đang giao')) return 'delivering'
  if (t.includes('chưa')) return 'pending'
  return 'other'
}

const displayedOrders = computed(() => {
  if (!selectedStatuses.value || selectedStatuses.value.length === 0) return orders.value
  return orders.value.filter((o) => selectedStatuses.value.includes(statusTextToKey(o.status.text)))
})

function createNewOrder() {
  selectedOrder.value = null
  showOrderForm.value = true
}

function handleEditOrder(order) {
  selectedOrder.value = { ...order }
  showOrderForm.value = true
}

function handleSaveNewOrder(payload) {
  console.debug('[OrdersManager] handleSaveNewOrder received payload:', payload)
  // If payload contains an id, update existing order
  const statusMap = {
    pending: { text: 'Chờ xác nhận', color: 'gray' },
    completed: { text: 'Đã hoàn thành', color: 'green' },
    canceled: { text: 'Đã hủy', color: 'red' },
    refunding: { text: 'Đang hoàn tiền', color: 'yellow' },
    refunded: { text: 'Đã hoàn tiền', color: 'gray' },
    confirmed_cod: { text: 'Đã xác nhận (Chờ thanh toán COD)', color: 'yellow' },
    paid_processing: { text: 'Đã thanh toán (Chờ xử lý)', color: 'blue' },
    waiting_deposit: { text: 'Chờ đặt cọc', color: 'gray' },
    deposit_paid: { text: 'Đã đặt cọc (Chờ xử lý)', color: 'blue' },
    delivering: { text: 'Đang giao hàng', color: 'blue' },
    waiting_pickup: { text: 'Chờ lấy hàng tại cửa hàng', color: 'green' },
  }

  if (payload.id) {
    const idx = orders.value.findIndex((o) => o.id === payload.id)
    if (idx !== -1) {
      orders.value[idx].customerName = payload.customerName
      orders.value[idx].products = payload.products.map((p) => ({
        name: p.name,
        qty: p.quantity,
        price: p.unitPrice,
      }))
      orders.value[idx].total = payload.total
      orders.value[idx].notes = payload.notes
      // update status if provided
      if (payload.status && payload.status.key) {
        // if form emitted a status object, use it directly and keep OrdersManager
        // responsible for color mapping / further API calls
        const key = payload.status.key
        const s = statusMap[key] || { text: payload.status.text || key, color: 'gray' }
        orders.value[idx].status = { key, text: s.text, color: s.color }
      } else {
        const key = payload.statusKey || orders.value[idx].status.key || 'pending'
        const s = statusMap[key] || { text: key, color: 'gray' }
        orders.value[idx].status = { key, text: s.text, color: s.color }
      }
    }
  } else {
    const nextId = `ORD-${String(Math.floor(Math.random() * 900000) + 100000)}`
    const newOrder = {
      id: nextId,
      date: new Date().toISOString().split('T')[0],
      customerName: payload.customerName,
      productSummary: `${payload.products.length} sản phẩm`,
      status: {
        key: payload.status?.key || 'pending',
        text: (payload.status && payload.status.text) || statusMap.pending.text,
        color: statusMap.pending.color,
      },
      payment: { text: 'Chưa Thanh Toán', color: 'red' },
      total: payload.total,
      type: 'sale',
      products: payload.products.map((p) => ({
        name: p.name,
        qty: p.quantity,
        price: p.unitPrice,
      })),
      notes: payload.notes,
    }
    orders.value = [newOrder, ...orders.value]
  }
  showOrderForm.value = false
}

function updateOrderStatus({ orderId, newStatus }) {
  // Map status key to display text/color
  const map = {
    completed: { text: 'Đã Hoàn Thành', color: 'green' },
    confirmed: { text: 'Đã Xác Nhận', color: 'yellow' },
    delivering: { text: 'Đang Giao Hàng', color: 'blue' },
    pending: { text: 'Chưa Xác Nhận', color: 'red' },
  }
  const s = map[newStatus] || { text: newStatus, color: 'gray' }
  const idx = orders.value.findIndex((o) => o.id === orderId)
  if (idx !== -1) {
    orders.value[idx].status = { text: s.text, color: s.color }
    // If modal is open, refresh selectedOrder too
    if (selectedOrder.value && selectedOrder.value.id === orderId) {
      selectedOrder.value.status = { ...orders.value[idx].status }
    }
  }
  showDetailModal.value = false
}

// cancelCustomerOrder removed - not used in manager view
</script>

<style lang="css" scoped>
@reference "../assets/main.css";
.box-bg {
  @apply bg-gray-100 p-6 rounded-xl shadow-lg;
}
.title-style {
  @apply text-3xl font-bold mb-4 text-gray-800;
}
.text-style {
  @apply py-3 px-6 text-left;
}
.text-center-style {
  @apply py-3 px-6 text-center;
}
.table-style {
  @apply min-w-full bg-white rounded-lg overflow-hidden shadow-sm;
}
.header-table-style {
  @apply bg-gray-200 text-gray-600 uppercase text-sm leading-normal;
}
.tbody-table-style {
  @apply text-gray-600 text-sm;
}
.row-table-style {
  @apply border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200;
}
</style>
