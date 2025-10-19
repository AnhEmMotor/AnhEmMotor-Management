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
            <th class="text-style">Thanh Toán</th>
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
            <td class="text-style">
              <RoundBadge :color="order.payment.color">{{ order.payment.text }}</RoundBadge>
            </td>
            <td class="text-style">{{ order.total }}</td>
            <td class="text-center-style">
              <RoundButton
                v-if="order.status.text === 'Đã Hoàn Thành' || order.status.text === 'Đã Giao - Hoàn Thành'"
                @click="openOrderDetail(order)"
                color="green"
              >
                Xem ảnh giao
              </RoundButton>
              <RoundButton v-else @click="cancelCustomerOrder(order)" color="red">
                Hủy Đơn
              </RoundButton>
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

// Richer mock orders (numeric totals and products) so modal can display details
const orders = ref([
  {
    id: 'ORD-001',
    date: '2023-10-26',
    customerName: 'Nguyễn Văn A',
    productSummary: '1 sản phẩm (Xe Máy)',
    status: { text: 'Đã Hoàn Thành', color: 'green' },
    payment: { text: 'Đã Thanh Toán', color: 'green' },
    total: 55000000,
    type: 'sale',
    products: [{ name: 'Xe Máy ABC', qty: 1, price: 55000000 }],
  },
  {
    id: 'ORD-002',
    date: '2023-10-25',
    customerName: 'Trần Thị B',
    productSummary: '1 sản phẩm (Xe Máy)',
    status: { text: 'Đã Xác Nhận', color: 'yellow' },
    payment: { text: 'Chưa thanh toán', color: 'red' },
    total: 42000000,
    type: 'sale',
    products: [{ name: 'Xe Máy XYZ', qty: 1, price: 42000000 }],
  },
  {
    id: 'ORD-003',
    date: '2023-10-24',
    customerName: 'Lê Văn C',
    productSummary: '1 sản phẩm (Phụ Tùng)',
    status: { text: 'Đã Xác Nhận', color: 'yellow' },
    payment: { text: 'Đã Thanh Toán', color: 'green' },
    total: 3500000,
    type: 'sale',
    products: [{ name: 'Bộ phận 123', qty: 1, price: 3500000 }],
  },
  {
    id: 'ORD-004',
    date: '2023-10-23',
    customerName: 'Phạm Thị D',
    productSummary: '1 sản phẩm (Phụ Kiện)',
    status: { text: 'Đang Giao Hàng', color: 'blue' },
    payment: { text: 'Chưa Thanh Toán', color: 'red' },
    total: 490000,
    type: 'sale',
    products: [{ name: 'Phụ Kiện A', qty: 1, price: 490000 }],
  },
  {
    id: 'ORD-005',
    date: '2023-10-22',
    customerName: 'Hoàng Văn E',
    productSummary: '1 sản phẩm (Phụ Kiện)',
    status: { text: 'Chưa Xác Nhận', color: 'red' },
    payment: { text: 'Chưa Thanh Toán', color: 'red' },
    total: 120000,
    type: 'sale',
    products: [{ name: 'Phụ Kiện B', qty: 1, price: 120000 }],
  },
  {
    id: 'ORD-006',
    date: '2023-10-21',
    customerName: 'Nguyễn Văn F',
    productSummary: '1 sản phẩm (Phụ Tùng)',
    status: { text: 'Đã Giao - Hoàn Thành', color: 'green' },
    payment: { text: 'Đã Thanh Toán', color: 'green' },
    total: 280000,
    type: 'sale',
    products: [{ name: 'Phụ Tùng C', qty: 1, price: 280000 }],
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

function openOrderDetail(order) {
  selectedOrder.value = { ...order }
  showDetailModal.value = true
}

function createNewOrder() {
  showOrderForm.value = true
}

function handleSaveNewOrder({ customerName, productName, price }) {
  const nextId = `ORD-${String(Math.floor(Math.random() * 900000) + 100000)}`
  const newOrder = {
    id: nextId,
    date: new Date().toISOString().split('T')[0],
    customerName,
    productSummary: `1 sản phẩm (${productName})`,
    status: { text: 'Chưa Xác Nhận', color: 'red' },
    payment: { text: 'Chưa Thanh Toán', color: 'red' },
    total: price,
    type: 'sale',
    products: [{ name: productName, qty: 1, price }],
  }
  orders.value = [newOrder, ...orders.value]
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

function cancelCustomerOrder(order) {
  if (confirm(`Bạn có chắc chắn muốn hủy đơn hàng "${order.id}" không?`)) {
    alert(`Đơn hàng "${order.id}" đã được hủy thành công.`)
    orders.value = orders.value.filter((o) => o.id !== order.id)
  }
}
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
