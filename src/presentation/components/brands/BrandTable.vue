<script setup>
import SkeletonLoader from '@components/ui/SkeletonLoader.vue'
import SmallNoBgButton from '@components/ui/button/SmallNoBgButton.vue'
import IconEdit from '@/assets/icons/IconEdit.svg'
import IconTrash from '@/assets/icons/IconTrash.svg'
import { Permissions } from '@constants/permissions'
import { usePermission } from '@composables/usePermission'

defineProps({
  brands: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['edit', 'delete'])
const { hasPermission } = usePermission()
</script>

<template>
  <div class="overflow-x-auto rounded-lg shadow-sm border border-gray-300">
    <table class="min-w-full bg-white border-collapse">
      <thead
        class="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs font-medium border-b border-gray-200"
      >
        <tr>
          <th class="py-3 px-6 text-left">Logo</th>
          <th class="py-3 px-6 text-left">Tên thương hiệu</th>
          <th class="py-3 px-6 text-left">Xuất xứ</th>
          <th class="py-3 px-6 text-left">Mô tả</th>
          <th class="py-3 px-6 text-center">Thao tác</th>
        </tr>
      </thead>
      <tbody class="text-gray-600 text-sm font-light">
        <template v-if="brands.length === 0">
          <template v-if="isLoading">
            <tr v-for="i in 5" :key="i" class="border-b border-gray-200">
              <td class="py-3 px-6"><SkeletonLoader width="140px" height="20px" /></td>
              <td class="py-3 px-6"><SkeletonLoader width="220px" height="20px" /></td>
              <td class="py-3 px-6 text-center flex justify-center gap-2">
                <SkeletonLoader width="40px" height="20px" />
                <SkeletonLoader width="40px" height="20px" />
              </td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="5" class="text-center py-6 text-gray-500">
              Không có thương hiệu nào để hiển thị.
            </td>
          </tr>
        </template>
        <tr
          v-for="brand in brands"
          :key="brand.id"
          class="border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200"
        >
          <td class="py-3 px-6">
            <div class="w-10 h-10 border rounded bg-gray-50 flex items-center justify-center overflow-hidden">
              <img v-if="brand.logoUrl" :src="brand.logoUrl" alt="Logo" class="max-w-full max-h-full object-contain" />
              <span v-else class="text-[10px] text-gray-400">No Logo</span>
            </div>
          </td>
          <td class="py-3 px-6 font-medium text-gray-800">{{ brand.name }}</td>
          <td class="py-3 px-6 text-gray-600">{{ brand.origin || '—' }}</td>
          <td class="py-3 px-6 text-gray-500">{{ brand.description || '—' }}</td>
          <td class="py-3 px-6 text-center space-x-2">
            <SmallNoBgButton
              v-if="hasPermission(Permissions.BrandsEdit)"
              @click="emit('edit', brand)"
              :icon="IconEdit"
            >
              Sửa
            </SmallNoBgButton>
            <SmallNoBgButton
              v-if="hasPermission(Permissions.BrandsDelete)"
              color="red"
              @click="emit('delete', brand)"
              :icon="IconTrash"
            >
              Xóa
            </SmallNoBgButton>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>



