<script setup>
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import SmallNoBgButton from '@/components/ui/button/SmallNoBgButton.vue'
import IconEdit from '@/assets/icons/IconEdit.svg'
import IconTrash from '@/assets/icons/IconTrash.svg'
import { Permissions } from '@/constants/permissions'
import { usePermission } from '@/composables/usePermission'

defineProps({
  categories: {
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
          <th class="py-3 px-6 text-left">Tên thể loại</th>
          <th class="py-3 px-6 text-left">Mô tả</th>
          <th class="py-3 px-6 text-center">Thao tác</th>
        </tr>
      </thead>
      <tbody class="text-gray-600 text-sm font-light">
        <template v-if="categories.length === 0">
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
            <td colspan="3" class="text-center py-6 text-gray-500">
              Không có thể loại nào để hiển thị.
            </td>
          </tr>
        </template>
        <tr
          v-for="category in categories"
          :key="category.id"
          class="border-b border-gray-200 hover:bg-gray-100 transition-colors duration-200"
        >
          <td class="py-3 px-6 font-medium text-gray-800">{{ category.name }}</td>
          <td class="py-3 px-6 text-gray-500">{{ category.description || '—' }}</td>
          <td class="py-3 px-6 text-center space-x-2">
            <SmallNoBgButton
              v-if="hasPermission(Permissions.ProductCategoriesEdit)"
              @click="emit('edit', category)"
              :icon="IconEdit"
            >
              Sửa
            </SmallNoBgButton>
            <SmallNoBgButton
              v-if="hasPermission(Permissions.ProductCategoriesDelete)"
              color="red"
              @click="emit('delete', category)"
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


