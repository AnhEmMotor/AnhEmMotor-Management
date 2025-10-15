<script setup>
defineProps({
  itemData: Object,
})

function formatCurrency(value) {
  if (!value && value !== 0) return ''
  return value.toLocaleString('vi-VN')
}

function getStatusClass(status) {
  switch (status) {
    case 'Đã nhập hàng':
      return 'bg-green-100 text-green-800'
    case 'Phiếu tạm':
      return 'bg-yellow-100 text-yellow-800'
    case 'Đã hủy':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const totalProductQuantity = (products) => {
  return products.reduce((sum, product) => sum + product.quantity, 0)
}

const totalProductValue = (products) => {
  return products.reduce((sum, product) => sum + product.total, 0)
}
const totalDiscount = (products) => {
  return products.reduce((sum, product) => sum + product.discount * product.quantity, 0)
}
</script>

<template>
  <!-- Chi tiết phiếu (Detail Panel) -->
  <div
    class="border-t bg-white p-4 rounded-b-md"
    :class="itemData.status === 'Đã nhập hàng' ? 'border-red-300' : 'border-gray-200'"
  >
    <!-- Tab chi tiết -->
    <div class="flex space-x-4 border-b border-gray-200 mb-3 text-sm">
      <div class="pb-1 text-red-600 border-b-2 border-red-600 font-semibold cursor-pointer">
        Thông tin
      </div>
      <div class="pb-1 text-gray-500 hover:text-gray-700 cursor-pointer">Lịch sử thanh toán</div>
    </div>

    <!-- Header chi tiết -->
    <div class="flex justify-between items-start mb-4">
      <h3 class="text-lg font-bold text-gray-800 flex items-center space-x-2">
        <span>{{ itemData.id }}</span>
        <span
          class="text-xs font-semibold px-2 py-0.5 rounded-full"
          :class="getStatusClass(itemData.status)"
          >{{ itemData.status }}</span
        >
      </h3>
      <div class="text-xs text-gray-500">{{ itemData.branch }}</div>
    </div>

    <!-- Phần thông tin chung -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-xs">
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Người tạo</label>
        <select class="w-full p-1.5 border border-gray-300 rounded-md text-sm">
          <option>{{ itemData.creator }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Người nhập</label>
        <select class="w-full p-1.5 border border-gray-300 rounded-md text-sm">
          <option>{{ itemData.importer }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Ngày nhập</label>
        <div class="relative">
          <input
            type="date"
            :value="itemData.importDate"
            class="w-full p-1.5 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>
      <div class="col-span-2">
        <label class="block text-xs font-medium text-gray-500 mb-1">Nhà cung cấp</label>
        <div class="flex space-x-2">
          <div class="flex-1">
            <input
              type="text"
              :value="itemData.supplierName"
              readonly
              class="w-full p-1.5 border border-gray-300 rounded-md text-sm bg-gray-50"
            />
            <p class="text-xs text-red-600 mt-1">Mã NCC: {{ itemData.supplierCode }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Bảng chi tiết hàng hóa -->
    <div class="border border-gray-200 rounded-md overflow-hidden mb-4">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Mã hàng
            </th>
            <th
              class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Tên hàng
            </th>
            <th
              class="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Số lượng
            </th>
            <th
              class="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Đơn giá
            </th>
            <th
              class="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Giảm giá
            </th>
            <th
              class="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Giá nhập
            </th>
            <th
              class="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Thành tiền
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200 text-sm">
          <tr v-if="itemData.status !== 'Đã hủy'">
            <td class="p-1.5">
              <input
                type="text"
                placeholder="Tìm mã hàng"
                class="w-full p-1 border border-gray-300 rounded text-xs focus:ring-red-500 focus:border-red-500"
              />
            </td>
            <td class="p-1.5">
              <input
                type="text"
                placeholder="Tìm tên hàng"
                class="w-full p-1 border border-gray-300 rounded text-xs focus:ring-red-500 focus:border-red-500"
              />
            </td>
            <td colspan="5" class="p-1.5"></td>
          </tr>
          <tr v-else>
            <td colspan="7" class="p-1.5 bg-gray-100 text-center text-xs text-gray-500 italic">
              Phiếu nhập đã bị hủy. Không thể chỉnh sửa chi tiết hàng hóa.
            </td>
          </tr>
          <tr
            v-for="(product, index) in itemData.products"
            :key="product.code"
            class="text-xs"
            :class="{ 'bg-gray-50': index % 2 !== 0 }"
          >
            <td class="px-2 py-2.5 text-red-600 font-medium">{{ product.code }}</td>
            <td class="px-2 py-2.5 font-medium text-gray-800">{{ product.name }}</td>
            <td class="px-2 py-2.5 text-right">{{ formatCurrency(product.quantity) }}</td>
            <td class="px-2 py-2.5 text-right">{{ formatCurrency(product.unitPrice) }}</td>
            <td class="px-2 py-2.5 text-right">{{ formatCurrency(product.discount) }}</td>
            <td class="px-2 py-2.5 text-right">{{ formatCurrency(product.importPrice) }}</td>
            <td class="px-2 py-2.5 text-right font-semibold">
              {{ formatCurrency(product.total) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Tổng kết và Ghi chú -->
    <div class="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-6 items-center">
      <div class="flex-1">
        <textarea
          placeholder="Ghi chú..."
          rows="3"
          v-model="itemData.notes"
          :readonly="itemData.status === 'Đã hủy'"
          class="w-full p-2 border border-gray-300 rounded-md text-xs focus:ring-red-500 focus:border-red-500 resize-none"
        ></textarea>
      </div>
      <div class="w-full md:w-64 space-y-1 text-xs">
        <div class="flex justify-between">
          <span class="text-gray-600">Số lượng mặt hàng</span>
          <span class="font-medium text-gray-800">{{ itemData.products.length }}</span>
        </div>
        <div class="flex justify-between pt-1">
          <span class="text-gray-600 font-semibold">Tổng cộng</span>
          <span class="font-bold text-gray-900 text-sm">{{
            formatCurrency(totalProductValue(itemData.products) - totalDiscount(itemData.products))
          }}</span>
        </div>
      </div>
    </div>

    <!-- Thanh hành động chi tiết phiếu -->
    <div class="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
      <div class="flex items-center space-x-3">
        <button
          class="flex items-center space-x-1.5 text-gray-600 py-1.5 px-3 rounded-md hover:bg-gray-100 text-xs font-medium transition duration-150"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            ></path>
          </svg>
          <span>Hủy</span>
        </button>
        <button
          class="flex items-center space-x-1.5 text-gray-600 py-1.5 px-3 rounded-md hover:bg-gray-100 text-xs font-medium transition duration-150"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            ></path>
          </svg>
          <span>Sao chép</span>
        </button>
      </div>
      <div class="flex items-center space-x-2">
        <button
          class="bg-red-600 text-white py-1.5 px-3 rounded-md hover:bg-red-700 text-xs font-medium transition duration-150 flex items-center space-x-1.5"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            ></path>
          </svg>
          <span>Mở phiếu</span>
        </button>
        <button
          class="text-gray-600 py-1.5 px-3 rounded-md hover:bg-gray-100 text-xs font-medium transition duration-150 border border-gray-300"
        >
          Lưu
        </button>
      </div>
    </div>
  </div>
</template>
