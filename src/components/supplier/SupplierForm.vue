<script setup>
import { ref, watch } from 'vue'
import BaseInput from '@/components/ui/input/BaseInput.vue'
import BaseTextarea from '@/components/ui/input/BaseTextarea.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue'])

const localSupplier = ref({})

watch(
  () => props.modelValue,
  (newVal) => {
    const copy = JSON.parse(JSON.stringify(newVal || {}))
    try {
      if (JSON.stringify(copy) !== JSON.stringify(localSupplier.value)) {
        localSupplier.value = copy
      }
    } catch (err) {
      void err
      // Fallback: if stringify fails for some reason, still assign.
      localSupplier.value = copy
    }
  },
  { immediate: true, deep: true },
)

watch(
  localSupplier,
  (newVal) => {
    try {
      if (JSON.stringify(newVal) !== JSON.stringify(props.modelValue)) {
        emit('update:modelValue', JSON.parse(JSON.stringify(newVal)))
      }
    } catch (err) {
      void err
      emit('update:modelValue', newVal)
    }
  },
  { deep: true },
)
</script>

<template>
  <form @submit.prevent>
    <div class="space-y-4 max-h-[70vh] overflow-y-auto px-2">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <BaseInput
            label="Tên nhà cung cấp"
            v-model="localSupplier.name"
            placeholder="Bắt buộc"
            required
          />
          <div v-if="errors && errors.name" class="text-red-500 text-xs mt-1">
            {{ errors.name }}
          </div>
        </div>
        <div>
          <BaseInput
            label="Điện thoại"
            v-model="localSupplier.phone"
            placeholder="Nhập số điện thoại"
          />
          <div v-if="errors && errors.phone" class="text-red-500 text-xs mt-1">
            {{ errors.phone }}
          </div>
        </div>
        <div>
          <BaseInput
            label="Email"
            v-model="localSupplier.email"
            type="email"
            placeholder="email@gmail.com"
          />
          <div v-if="errors && errors.email" class="text-red-500 text-xs mt-1">
            {{ errors.email }}
          </div>
        </div>
      </div>
      <div>
        <BaseInput label="Địa chỉ" v-model="localSupplier.address" placeholder="Nhập địa chỉ" />
        <div v-if="errors && errors.address" class="text-red-500 text-xs mt-1">
          {{ errors.address }}
        </div>
      </div>
      <BaseTextarea
        label="Ghi chú"
        v-model="localSupplier.notes"
        placeholder="Nhập ghi chú..."
        :rows="4"
      />
    </div>
  </form>
</template>
