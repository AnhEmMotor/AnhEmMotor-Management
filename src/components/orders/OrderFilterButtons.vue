<template>
  <div class="flex flex-wrap gap-2 items-center">
    <p>Lọc trạng thái:</p>
    <BaseFilterButton
      v-for="filter in filterOptions"
      :key="filter.status"
      :text="filter.label"
      :color="filter.color"
      :is-active="isActive(filter.status)"
      @toggle="selectFilter(filter.status)"
    />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useOrdersStore } from '@/stores/useOrdersStore'
import BaseFilterButton from '../ui/button/BaseFilterButton.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
    default: () => [],
  },
})
const emit = defineEmits(['update:modelValue'])
const ordersStore = useOrdersStore()

const STATUS_TEXT_MAP = {
  pending: 'Chờ xác nhận',
  completed: 'Đã hoàn thành',
  canceled: 'Đã hủy',
  refunding: 'Đang hoàn tiền',
  refunded: 'Đã hoàn tiền',
  confirmed_cod: 'Đã xác nhận (COD)',
  paid_processing: 'Đã thanh toán (Chờ xử lý)',
  waiting_deposit: 'Chờ đặt cọc',
  deposit_paid: 'Đã đặt cọc (Chờ xử lý)',
  delivering: 'Đang giao hàng',
  waiting_pickup: 'Chờ lấy hàng',
}

const STATUS_COLOR_MAP = {
  pending: 'gray',
  waiting_deposit: 'gray',
  refunded: 'gray',
  completed: 'green',
  waiting_pickup: 'green',
  confirmed_cod: 'yellow',
  refunding: 'yellow',
  paid_processing: 'blue',
  deposit_paid: 'blue',
  delivering: 'blue',
  canceled: 'red',
}

function getStatusLabel(key) {
  return STATUS_TEXT_MAP[key] || key
}

function getStatusColor(key) {
  return STATUS_COLOR_MAP[key] || 'gray'
}

onMounted(() => {
  ordersStore.fetchStatuses()
})

const allStatuses = computed(() => ordersStore.allStatuses)

const filterOptions = computed(() => {
  return allStatuses.value
    .map((s) => ({
      status: s.id,
      label: getStatusLabel(s.id),
      color: getStatusColor(s.id),
    }))
    .filter((s) => ['completed', 'confirmed_cod', 'delivering', 'pending'].includes(s.status))
})

const isActive = (status) => {
  return props.modelValue.includes(status)
}

const selectFilter = (status) => {
  const newSelection = [...props.modelValue]
  const index = newSelection.indexOf(status)
  if (index > -1) {
    newSelection.splice(index, 1)
  } else {
    newSelection.push(status)
  }
  emit('update:modelValue', newSelection)
}
</script>
