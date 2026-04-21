<script setup>
import Input from '@/components/ui/input/BaseInput.vue'

defineProps({
  search: {
    type: String,
    default: '',
  },
  inventoryStatus: {
    type: String,
    default: '',
  },
  brandId: {
    type: [String, Number],
    default: '',
  },
  categoryId: {
    type: [String, Number],
    default: '',
  },
  vehicleTypeId: {
    type: [String, Number],
    default: '',
  },
  inventoryStatusMap: {
    type: Object,
    default: () => ({}),
  },
  brands: {
    type: Array,
    default: () => [],
  },
  categories: {
    type: Array,
    default: () => [],
  },
  vehicleTypes: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:search', 'update:inventoryStatus', 'update:brandId', 'update:categoryId', 'update:vehicleTypeId'])
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-3 mb-6">
    <div class="flex-1">
      <Input
        :model-value="search"
        @update:model-value="emit('update:search', $event)"
        type="text"
        placeholder="Tìm kiếm theo tên sản phẩm..."
        class="w-full"
      />
    </div>

    <div class="flex flex-col sm:flex-row gap-3">
      <div class="w-full sm:w-48">
        <select
          :value="brandId"
          @change="emit('update:brandId', $event.target.value)"
          class="w-full h-11 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 appearance-none cursor-pointer"
          style="
            background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E');
            background-repeat: no-repeat;
            background-position: right 1rem center;
            background-size: 1em;
          "
        >
          <option value="">Tất cả hãng xe</option>
          <option v-for="brand in brands" :key="brand.id" :value="brand.id">
            {{ brand.name }}
          </option>
        </select>
      </div>

      <div class="w-full sm:w-48">
        <select
          :value="categoryId"
          @change="emit('update:categoryId', $event.target.value)"
          class="w-full h-11 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 appearance-none cursor-pointer"
          style="
            background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E');
            background-repeat: no-repeat;
            background-position: right 1rem center;
            background-size: 1em;
          "
        >
          <option value="">Loại sản phẩm</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>

      <div class="w-full sm:w-48">
        <select
          :value="vehicleTypeId"
          @change="emit('update:vehicleTypeId', $event.target.value)"
          class="w-full h-11 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 appearance-none cursor-pointer"
          style="
            background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E');
            background-repeat: no-repeat;
            background-position: right 1rem center;
            background-size: 1em;
          "
        >
          <option value="">Loại xe</option>
          <option v-for="type in vehicleTypes" :key="type.id" :value="type.id">
            {{ type.name }}
          </option>
        </select>
      </div>

      <div class="w-full sm:w-48">
        <select
          :value="inventoryStatus"
          @change="emit('update:inventoryStatus', $event.target.value)"
          class="w-full h-11 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 appearance-none cursor-pointer"
          style="
            background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E');
            background-repeat: no-repeat;
            background-position: right 1rem center;
            background-size: 1em;
          "
        >
          <option value="">Trạng thái</option>
          <option v-for="(label, key) in inventoryStatusMap" :key="key" :value="key">
            {{ label }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>


