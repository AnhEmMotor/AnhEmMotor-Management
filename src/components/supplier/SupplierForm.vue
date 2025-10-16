<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'update:dirty'])

const localSupplier = ref({})
const initialDataJson = ref('')

watch(
  () => props.modelValue,
  (newVal) => {
    const copy = JSON.parse(JSON.stringify(newVal || {}))
    localSupplier.value = copy
    initialDataJson.value = JSON.stringify(copy)
    emit('update:dirty', false)
  },
  { immediate: true, deep: true },
)

watch(
  localSupplier,
  (newVal) => {
    emit('update:modelValue', newVal)
    const isNowDirty = JSON.stringify(newVal) !== initialDataJson.value
    emit('update:dirty', isNowDirty)
  },
  { deep: true },
)
</script>

<template>
  <!-- Using a dummy form tag that doesn't submit, parent component handles save -->
  <form @submit.prevent>
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
  </form>
</template>
