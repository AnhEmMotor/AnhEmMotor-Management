<script setup>
import { ref, watch, onMounted } from 'vue'
import DraggableModal from '@components/ui/DraggableModal.vue'
import Input from '@components/ui/input/BaseInput.vue'
import BaseImage from '@components/ui/input/BaseImage.vue'
import Button from '@components/ui/button/BaseButton.vue'
import { useCategoryStore } from '@stores/category.store'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  category: {
    type: Object,
    default: () => ({ 
      id: null, 
      name: '', 
      slug: '', 
      imageUrl: '', 
      isActive: true, 
      sortOrder: 0, 
      parentId: null, 
      description: '' 
    }),
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  isRefreshing: {
    type: Boolean,
    default: false,
  },
  onRefresh: {
    type: Function,
    default: undefined,
  },
})

const emit = defineEmits(['close', 'save', 'refresh'])

const categoryStore = useCategoryStore()
const editableCategory = ref({ ...props.category })
const formErrors = ref({ name: '', slug: '' })
const allCategories = ref([])
const isLoadingCategories = ref(false)

const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '')
    .replace(/(\s+)/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const fetchAllCategories = async () => {
  isLoadingCategories.value = true
  try {
    const response = await categoryStore.fetchCategories({ pageSize: 1000 })
    allCategories.value = response.items || []
  } catch (error) {
    console.error('Error fetching categories:', error)
  } finally {
    isLoadingCategories.value = false
  }
}

onMounted(() => {
  fetchAllCategories()
})

watch(
  () => props.category,
  (newVal) => {
    editableCategory.value = { ...newVal }
  },
  { deep: true },
)

watch(
  () => editableCategory.value.name,
  (newName) => {
    if (!props.isEditMode && newName) {
      editableCategory.value.slug = generateSlug(newName)
    }
  }
)

const validate = () => {
  const errors = { name: '', slug: '' }
  let valid = true
  if (!editableCategory.value.name?.trim()) {
    errors.name = 'Vui lòng nhập tên thể loại.'
    valid = false
  }
  if (!editableCategory.value.slug?.trim()) {
    errors.slug = 'Vui lòng nhập đường dẫn slug.'
    valid = false
  }
  formErrors.value = errors
  return valid
}

const handleSave = () => {
  if (!validate()) return
  emit('save', editableCategory.value)
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <DraggableModal
    v-if="show"
    @close="handleClose"
    :onRefresh="onRefresh"
    :isLoading="isRefreshing"
    width="550px"
  >
    <template #header>
      <span class="font-bold text-lg">{{ title }}</span>
    </template>
    <template #body>
      <div class="space-y-5 p-1">
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2 sm:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Tên thể loại <span class="text-red-500">*</span>
            </label>
            <Input v-model="editableCategory.name" placeholder="Nhập tên thể loại..." />
            <p v-if="formErrors.name" class="text-red-500 text-xs mt-1">{{ formErrors.name }}</p>
          </div>

          <div class="col-span-2 sm:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Slug (Đường dẫn) <span class="text-red-500">*</span>
            </label>
            <Input v-model="editableCategory.slug" placeholder="VD: phu-tung-xe" />
            <p v-if="formErrors.slug" class="text-red-500 text-xs mt-1">{{ formErrors.slug }}</p>
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Danh mục cha</label>
            <select
              v-model="editableCategory.parentId"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all"
              :disabled="isLoadingCategories"
            >
              <option :value="null">-- Không có (Danh mục gốc) --</option>
              <option
                v-for="cat in allCategories.filter(c => c.id !== editableCategory.id)"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea
            v-model="editableCategory.description"
            placeholder="Nhập mô tả chuẩn SEO..."
            rows="3"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
          />
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <Button
          text="Huỷ bỏ"
          color="gray"
          @click="handleClose"
          :disabled="isSaving || isRefreshing"
        />
        <Button
          text="Lưu"
          color="purple"
          @click="handleSave"
          :loading="isSaving"
          :disabled="isRefreshing"
        />
      </div>
    </template>
  </DraggableModal>
</template>



