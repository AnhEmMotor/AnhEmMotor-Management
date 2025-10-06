<template>
  <div class="box-bg">
    <h1 class="title-style">Đơn Hàng Của Tôi</h1>
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
          <tr v-else v-for="order in orders" :key="order.id" class="row-table-style">
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
                v-if="
                  order.status.text === 'Đã Hoàn Thành' ||
                  order.status.text === 'Đã Giao - Hoàn Thành'
                "
                @click="viewDeliveryImageCustomer(order)"
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import RoundBadge from '@/components/orders/RoundBadge.vue'
import RoundButton from '@/components/orders/RoundButton.vue'

const orders = ref([
  {
    id: 'ORD-001',
    date: '2023-10-26',
    productSummary: '1 sản phẩm (Xe Máy)',
    status: { text: 'Đã Hoàn Thành', color: 'green' },
    payment: { text: 'Đã Thanh Toán', color: 'green' },
    total: '55.000.000 VNĐ',
  },
  {
    id: 'ORD-002',
    date: '2023-10-25',
    productSummary: '1 sản phẩm (Xe Máy)',
    status: { text: 'Đã Xác Nhận', color: 'yellow' },
    payment: { text: 'Chưa thanh toán', color: 'red' },
    total: '42.000.000 VNĐ',
  },
  {
    id: 'ORD-003',
    date: '2023-10-24',
    productSummary: '1 sản phẩm (Phụ Tùng)',
    status: { text: 'Đã xác nhận', color: 'yellow' },
    payment: { text: 'Đã Thanh Toán', color: 'green' },
    total: '3.500.000 VNĐ',
  },
  {
    id: 'ORD-004',
    date: '2023-10-23',
    productSummary: '1 sản phẩm (Phụ Kiện)',
    status: { text: 'Đang Giao Hàng', color: 'blue' },
    payment: { text: 'Chưa Thanh Toán', color: 'red' },
    total: '490.000 VNĐ',
  },
  {
    id: 'ORD-005',
    date: '2023-10-22',
    productSummary: '1 sản phẩm (Phụ Kiện)',
    status: { text: 'Chưa Xác Nhận', color: 'red' },
    payment: { text: 'Chưa Thanh Toán', color: 'red' },
    total: '120.000 VNĐ',
  },
  {
    id: 'ORD-006',
    date: '2023-10-21',
    productSummary: '1 sản phẩm (Phụ Tùng)',
    status: { text: 'Đã Giao - Hoàn Thành', color: 'green' },
    payment: { text: 'Đã Thanh Toán', color: 'green' },
    total: '280.000 VNĐ',
  },
  {
    id: 'ORD-006',
    date: '2023-10-21',
    productSummary: '1 sản phẩm (Phụ Tùng)',
    status: { text: 'Đã Giao - Hoàn Thành', color: 'green' },
    payment: { text: 'Đã Thanh Toán', color: 'green' },
    total: '280.000 VNĐ',
  },
])

function viewDeliveryImageCustomer(order) {
  console.log(`Xem ảnh giao hàng cho đơn hàng: ${order.id}`)
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
  @apply text-gray-600 text-sm font-light;
}
.row-table-style {
  @apply border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200;
}
</style>
