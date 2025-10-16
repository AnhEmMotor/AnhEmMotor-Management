<script setup>
import { ref, watch } from 'vue'
import BaseInput from '@/components/ui/input/BaseInput.vue'
import BaseTextarea from '@/components/ui/input/BaseTextarea.vue'

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
    <div class="space-y-4 max-h-[70vh] overflow-y-auto px-2">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BaseInput
          label="Tên nhà cung cấp *"
          v-model="localSupplier.name"
          placeholder="Bắt buộc"
          required
        />
        <BaseInput
          label="Mã nhà cung cấp"
          :modelValue="localSupplier.id || 'Tự động'"
          :readonly="true"
        />
        <BaseInput
          label="Điện thoại"
          v-model="localSupplier.phone"
          placeholder="Nhập số điện thoại"
        />
        <BaseInput
          label="Email"
          v-model="localSupplier.email"
          type="email"
          placeholder="email@gmail.com"
        />
      </div>
      <BaseInput label="Địa chỉ" v-model="localSupplier.address" placeholder="Nhập địa chỉ" />
      <BaseTextarea
        label="Ghi chú"
        v-model="localSupplier.notes"
        placeholder="Nhập ghi chú..."
        :rows="4"
      />
    </div>
  </form>
</template>
