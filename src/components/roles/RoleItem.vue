<script setup>
import { computed } from 'vue'
import BaseSmallNoBgButton from '../ui/button/BaseSmallNoBgButton.vue'
import RoundBadge from '../ui/RoundBadge.vue'

const props = defineProps({
  role: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['edit', 'delete'])

const hasDescription = computed(() => {
  const d = props.role && props.role.description
  return d != null && String(d).trim() !== ''
})

const statusMap = {
  active: { label: 'Hoạt động', color: 'green' },
  enabled: { label: 'Hoạt động', color: 'green' },
  disabled: { label: 'Vô hiệu', color: 'red' },
  inactive: { label: 'Vô hiệu', color: 'red' },
  pending: { label: 'Chờ xử lý', color: 'yellow' },
}

function statusInfo(status) {
  if (typeof status === 'boolean') {
    return status ? statusMap.active : statusMap.disabled
  }

  if (typeof status === 'number') {
    return status === 1 ? statusMap.active : statusMap.disabled
  }

  if (status == null) {
    return statusMap.active
  }

  const key = String(status).trim().toLowerCase()

  if (['1', 'true', 'yes', 'enable', 'enabled', 'active', 'hoạt động'].includes(key)) {
    return statusMap.active
  }
  if (['0', 'false', 'no', 'disable', 'disabled', 'inactive', 'vô hiệu', 'vo hieu'].includes(key)) {
    return statusMap.disabled
  }

  return statusMap[key] || { label: String(status), color: 'gray' }
}
</script>

<template>
  <div
    class="grid grid-cols-16 gap-4 p-3 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
  >
    <div class="col-span-1 flex items-center justify-center text-gray-600">
      {{ index + 1 }}
    </div>

    <div class="col-span-3 flex items-center">
      <div>
        <p class="font-semibold text-gray-800">{{ role.name }}</p>
      </div>
    </div>

    <div class="col-span-6 flex items-center">
      <p class="text-gray-600 text-sm line-clamp-2">
        <span v-if="hasDescription">{{ role.description }}</span>
        <span v-else class="italic mr-2">Không có ghi chú</span>
      </p>
    </div>

    <div class="col-span-2 flex items-center justify-center text-sm">
      <RoundBadge color="blue">{{ role.permissionCount }} quyền</RoundBadge>
    </div>

    <div class="col-span-2 flex items-center justify-center text-sm">
      <RoundBadge :color="statusInfo(role.status).color">{{
        statusInfo(role.status).label
      }}</RoundBadge>
    </div>

    <div class="col-span-2 flex items-center justify-center gap-2">
      <BaseSmallNoBgButton @click="emit('edit')" color="blue">Sửa</BaseSmallNoBgButton>
      <BaseSmallNoBgButton @click="emit('delete')" color="red">Xoá</BaseSmallNoBgButton>
    </div>
  </div>
</template>
