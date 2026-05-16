<script setup>
import { ref, computed, watch } from 'vue'
import SkeletonLoader from '@components/ui/SkeletonLoader.vue'
import SmallNoBgButton from '@components/ui/button/SmallNoBgButton.vue'
import IconEdit from '@/assets/icons/IconEdit.svg'
import IconTrash from '@/assets/icons/IconTrash.svg'
import IconChevronDown from '@/assets/icons/chevron-down.svg'
import IconChevronRight from '@/assets/icons/chevron-right.svg'
import { Permissions } from '@constants/permissions'
import { usePermission } from '@composables/usePermission'
import { buildTree } from '@application/utils/tree.util'

const props = defineProps({
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

const expandedIds = ref(new Set())

watch(
  () => props.categories,
  (newVal) => {
    if (newVal?.length > 0 && expandedIds.value.size === 0) {
      newVal.forEach((c) => expandedIds.value.add(c.id))
    }
  },
  { immediate: true },
)

const toggleExpand = (id) => {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
}

const displayCategories = computed(() => {
  const tree = buildTree(props.categories)
  const flattened = []
  const visited = new Set()

  const traverse = (nodes, level = 0) => {
    nodes.forEach((node) => {
      if (visited.has(node.id)) return
      visited.add(node.id)

      flattened.push({ ...node, level })
      if (expandedIds.value.has(node.id) && node.children?.length > 0) {
        traverse(node.children, level + 1)
      }
    })
  }

  traverse(tree)
  return flattened
})
</script>

<template>
  <div class="overflow-x-auto rounded-lg shadow-sm border border-gray-300">
    <table class="min-w-full bg-white border-collapse">
      <thead
        class="bg-gray-50/50 text-gray-500 uppercase tracking-wider text-[11px] font-bold border-b border-gray-100"
      >
        <tr>
          <th class="py-4 px-6 text-left">Tên thể loại</th>
          <th class="py-4 px-6 text-center w-32">Sản phẩm</th>
          <th class="py-4 px-6 text-left">Mô tả</th>
          <th class="py-4 px-6 text-right w-40">Thao tác</th>
        </tr>
      </thead>
      <tbody class="text-gray-600 text-sm font-light">
        <template v-if="categories.length === 0">
          <template v-if="isLoading">
            <tr v-for="i in 5" :key="i" class="border-b border-gray-200">
              <td class="py-3 px-6" colspan="5"><SkeletonLoader width="100%" height="20px" /></td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="5" class="text-center py-6 text-gray-500">
              Không có thể loại nào để hiển thị.
            </td>
          </tr>
        </template>
        <tr
          v-for="category in displayCategories"
          :key="category.id"
          class="border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-200"
          :class="{ 'bg-gray-50/30': category.level > 0 }"
        >
          <td class="py-4 px-6 align-middle">
            <div class="flex items-center" :style="{ paddingLeft: `${category.level * 24}px` }">
              <button
                v-if="category.children?.length > 0"
                @click="toggleExpand(category.id)"
                class="p-1 mr-1 hover:bg-gray-200 rounded transition-colors"
              >
                <component
                  :is="expandedIds.has(category.id) ? IconChevronDown : IconChevronRight"
                  class="w-4 h-4 text-gray-500"
                />
              </button>
              <div v-else class="w-6 mr-1"></div>
              <div class="font-bold text-gray-800 text-sm">{{ category.name }}</div>
            </div>
          </td>
          <td class="py-4 px-6 text-center align-middle">
            <span class="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-black border border-blue-100">
              {{ category.productCount || 0 }}
            </span>
          </td>
          <td class="py-4 px-6 align-middle">
            <div class="text-xs text-gray-500 italic line-clamp-1 max-w-[300px]" :title="category.description">
              {{ category.description || 'Chưa có mô tả' }}
            </div>
          </td>
          <td class="py-4 px-6 text-right align-middle space-x-1">
            <SmallNoBgButton
              v-if="hasPermission(Permissions.ProductCategoriesEdit)"
              @click="emit('edit', category)"
              :icon="IconEdit"
              class="hover:bg-blue-50 hover:text-blue-600"
            >
              Sửa
            </SmallNoBgButton>
            <SmallNoBgButton
              v-if="hasPermission(Permissions.ProductCategoriesDelete)"
              color="red"
              @click="emit('delete', category)"
              :icon="IconTrash"
              class="hover:bg-red-50"
            >
              Xóa
            </SmallNoBgButton>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>



