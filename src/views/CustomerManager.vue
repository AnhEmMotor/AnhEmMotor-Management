<template>
  <div class="box-style">
    <div class="content-box-style">
      <div>
        <h2 class="title-style">Quản Lý Khách Hàng</h2>
      </div>
      <div class="action-button-style">
        <BaseActionButton text="Thêm mới" icon="fas fa-plus" color="blue" @click="openAddModal" />
        <CustomerFilterButtons v-model="selectedStatuses" multiple />
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="table-style">
        <thead class="table-header-style">
          <tr>
            <th class="normal-cell-style">Mã KH</th>
            <th class="normal-cell-style">Tên Khách Hàng</th>
            <th class="normal-cell-style">Email</th>
            <th class="normal-cell-style">Số Điện Thoại</th>
            <th class="normal-cell-style">Địa Chỉ</th>
            <th class="normal-cell-style">Trạng Thái</th>
            <th class="center-cell-style">Thao Tác</th>
          </tr>
        </thead>
        <tbody class="table-body-style">
          <tr v-if="displayCustomers.length === 0">
            <td colspan="7" class="not-found-text-style">Không tìm thấy khách hàng nào.</td>
          </tr>
          <tr v-for="customer in displayCustomers" :key="customer.id" class="table-row-style">
            <td class="normal-cell-style whitespace-nowrap">{{ customer.code }}</td>
            <td class="normal-cell-style">{{ customer.name }}</td>
            <td class="normal-cell-style">{{ customer.email }}</td>
            <td class="normal-cell-style">{{ customer.phone }}</td>
            <td class="normal-cell-style">{{ customer.address }}</td>
            <td class="normal-cell-style">
              <RoundBadge :color="statusColors[customer.status]">{{
                statusText[customer.status]
              }}</RoundBadge>
            </td>
            <td class="center-cell-style space-x-2">
              <BaseSmallNoBgButton @click="editCustomer(customer.id)">Sửa</BaseSmallNoBgButton>
              <BaseSmallNoBgButton color="red" @click="deleteCustomer(customer.id)">
                Xóa
              </BaseSmallNoBgButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import CustomerFilterButtons from '@/components/customers/CustomerFilterButtons.vue'
import BaseActionButton from '@/components/ui/button/BaseButton.vue'
import RoundBadge from '@/components/ui/RoundBadge.vue'
import BaseSmallNoBgButton from '@/components/ui/button/BaseSmallNoBgButton.vue'
import { onMounted, ref } from 'vue'

const allCustomers = ref([
  {
    id: '1',
    code: 'KH001',
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@example.com',
    phone: '0901234567',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    status: 'active',
  },
  {
    id: '2',
    code: 'KH002',
    name: 'Trần Thị Bình',
    email: 'binh.tran@example.com',
    phone: '0912345678',
    address: '456 Đường XYZ, Quận 2, TP.HCM',
    status: 'new',
  },
  {
    id: '3',
    code: 'KH003',
    name: 'Lê Văn Cường',
    email: 'cuong.le@example.com',
    phone: '0987654321',
    address: '789 Đường KLM, Quận 3, TP.HCM',
    status: 'inactive',
  },
  {
    id: '4',
    code: 'KH004',
    name: 'Phạm Thị Dung',
    email: 'dung.pham@example.com',
    phone: '0978123456',
    address: '101 Đường DEF, Quận 4, TP.HCM',
    status: 'active',
  },
  {
    id: '5',
    code: 'KH005',
    name: 'Hoàng Văn Em',
    email: 'em.hoang@example.com',
    phone: '0934567890',
    address: '212 Đường GHI, Quận 5, TP.HCM',
    status: 'new',
  },
])
const selectedStatuses = ref(['active', 'new', 'inactive'])
const displayCustomers = ref([])

const statusColors = {
  active: 'green',
  new: 'yellow',
  inactive: 'red',
}

const statusText = {
  active: 'Hoạt Động',
  new: 'Mới',
  inactive: 'Không Hoạt Động',
}

onMounted(() => {
  displayCustomers.value = allCustomers.value
})

const openAddModal = () => {
  console.log('Mở modal thêm khách hàng')
}

const editCustomer = (id) => {
  const customer = allCustomers.value.find((c) => c.id === id)
  console.log('Sửa khách hàng:', customer)
}

const deleteCustomer = (id) => {
  const customer = allCustomers.value.find((c) => c.id === id)
  console.log('Xóa khách hàng:', customer)
}
</script>

<style scoped>
@reference "../assets/main.css";
.box-style {
  @apply bg-gray-100 p-4 sm:p-6 rounded-xl shadow-lg;
}
.title-style {
  @apply text-3xl font-bold text-center text-gray-800;
}
.content-box-style {
  @apply flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0;
}
.sub-title-style {
  @apply text-2xl font-semibold text-gray-800;
}
.text-style {
  @apply text-sm text-gray-500;
}
.text-bold-style {
  @apply font-medium text-gray-700;
}
.action-button-style {
  @apply flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto;
}
.normal-cell-style {
  @apply py-3 px-6 text-left;
}
.center-cell-style {
  @apply py-3 px-6 text-center;
}
.table-style {
  @apply min-w-full bg-white rounded-lg overflow-hidden shadow-sm;
}
.table-header-style {
  @apply bg-gray-200 text-gray-600 uppercase text-sm leading-normal;
}
.table-body-style {
  @apply text-gray-600 text-sm font-light;
}
.not-found-text-style {
  @apply text-center py-6 text-gray-500;
}
.table-row-style {
  @apply border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200;
}
</style>
