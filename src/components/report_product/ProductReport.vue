<template>
  <div class="p-8">
    <div class="bg-white p-6 rounded-xl shadow-lg">
      <h1 class="text-3xl font-bold mb-6 text-gray-800">Báo Cáo Sản Phẩm & Tồn Kho</h1>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-red-50 p-6 rounded-xl shadow-md">
          <p class="text-sm font-medium text-red-600">Sản phẩm sắp hết hàng (&lt; 5)</p>
          <p class="text-3xl font-bold text-red-900 mt-1">{{ lowStockProductsCount }}</p>
        </div>
        <div class="bg-indigo-50 p-6 rounded-xl shadow-md">
          <p class="text-sm font-medium text-indigo-600">Tổng số loại xe</p>
          <p class="text-3xl font-bold text-indigo-900 mt-1">{{ totalProducts }}</p>
        </div>
      </div>

      <!-- Product Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white">
          <thead class="bg-gray-100">
            <tr>
              <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tên Sản Phẩm</th>
              <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tồn Kho</th>
              <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Đã Bán (Tháng)</th>
              <th class="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng Thái</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="product in productData" :key="product.name">
              <td class="py-4 px-4 whitespace-nowrap font-medium text-gray-900">{{ product.name }}</td>
              <td class="py-4 px-4 whitespace-nowrap text-gray-500">{{ product.stock }}</td>
              <td class="py-4 px-4 whitespace-nowrap text-gray-500">{{ product.sold }}</td>
              <td class="py-4 px-4 whitespace-nowrap">
                <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', getStatusClass(product.status)]">
                  {{ product.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductReport',
  data() {
    return {
      productData: [
        { name: 'VinFast VF8', stock: 12, sold: 85, status: 'Còn hàng' },
        { name: 'Hyundai Accent', stock: 8, sold: 72, status: 'Còn hàng' },
        { name: 'Toyota Vios', stock: 3, sold: 65, status: 'Sắp hết' },
        { name: 'Ford Ranger', stock: 15, sold: 58, status: 'Còn hàng' },
        { name: 'Mazda CX-5', stock: 4, sold: 51, status: 'Sắp hết' },
        { name: 'Kia Seltos', stock: 0, sold: 45, status: 'Hết hàng' },
      ]
    };
  },
  computed: {
    lowStockProductsCount() {
      return this.productData.filter(p => p.stock > 0 && p.stock < 5).length;
    },
    totalProducts() {
      return this.productData.length;
    }
  },
  methods: {
    getStatusClass(status) {
      if (status === 'Còn hàng') return 'bg-green-100 text-green-800';
      if (status === 'Sắp hết') return 'bg-yellow-100 text-yellow-800';
      return 'bg-red-100 text-red-800';
    }
  }
}
</script>
