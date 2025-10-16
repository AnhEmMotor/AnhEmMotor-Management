<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
    isOpen: Boolean,
    supplier: Object,
})
const emit = defineEmits(['close', 'save'])

const localSupplier = ref({})

watch(() => props.supplier, (newVal) => {
    localSupplier.value = { ...(newVal || {}) }
}, { immediate: true })

const isEditMode = computed(() => !!(localSupplier.value && localSupplier.value.id))

function handleSubmit() {
    emit('save', localSupplier.value)
}
</script>
<template>
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center"
      @click.self="$emit('close')"
    >
      <div class="bg-white p-6 rounded-xl shadow-2xl w-full max-w-3xl">
        <div class="flex justify-between items-center border-b pb-3 mb-4">
          <h3 class="text-xl font-bold text-gray-800">
            {{ isEditMode ? 'Chỉnh sửa Nhà cung cấp' : 'Tạo nhà cung cấp' }}
          </h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
            &times;
          </button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Tên nhà cung cấp <span class="text-red-500">*</span></label
                ><input
                  type="text"
                  v-model="localSupplier.name"
                  placeholder="Bắt buộc"
                  class="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Mã nhà cung cấp</label
                ><input
                  type="text"
                  :value="localSupplier.id || 'Tự động'"
                  disabled
                  class="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Điện thoại</label
                ><input
                  type="text"
                  v-model="localSupplier.phone"
                  class="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Email</label
                ><input
                  type="email"
                  v-model="localSupplier.email"
                  class="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="email@gmail.com"
                />
              </div>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Địa chỉ</label
                ><input
                    type="text"
                    v-model="localSupplier.address"
                    class="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    placeholder="Nhập địa chỉ"
                />
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Bỏ qua
            </button>
            <button type="submit" class="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700">Lưu</button>
          </div>
        </form>
      </div>
    </div>
</template>
