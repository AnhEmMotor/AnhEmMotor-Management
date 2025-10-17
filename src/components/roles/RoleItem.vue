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

// computed helper to check for a non-empty description (not just whitespace)
const hasDescription = computed(() => {
  const d = props.role && props.role.description
  return d != null && String(d).trim() !== ''
})

// Map role.status to a display label and badge color
const statusMap = {
  active: { label: 'Hoạt động', color: 'green' },
  enabled: { label: 'Hoạt động', color: 'green' },
  disabled: { label: 'Vô hiệu', color: 'red' },
  inactive: { label: 'Vô hiệu', color: 'red' },
  pending: { label: 'Chờ xử lý', color: 'yellow' },
}

function statusInfo(status) {
  // normalize booleans
  if (typeof status === 'boolean') {
    return status ? statusMap.active : statusMap.disabled
  }

  // numbers: 1 = active, 0 = disabled
  if (typeof status === 'number') {
    return status === 1 ? statusMap.active : statusMap.disabled
  }

  if (status == null) {
    // treat missing status as active by default
    return statusMap.active
  }

  const key = String(status).trim().toLowerCase()

  // common synonyms
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
    class="grid grid-cols-16 gap-4 p-2 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
  >
    <!-- STT -->
    <div class="col-span-1 flex items-center justify-center text-gray-600">
      {{ index + 1 }}
    </div>

    <!-- Tên vai trò -->
    <div class="col-span-3 flex items-center">
      <div>
        <p class="font-semibold text-gray-800">{{ role.name }}</p>
      </div>
    </div>

    <!-- Ghi chú -->
    <div class="col-span-6 flex items-center">
      <p class="text-gray-600 text-sm line-clamp-2">
        <span v-if="hasDescription">{{ role.description }}</span>
        <span v-else class="italic mr-2">Không có ghi chú</span>
      </p>
    </div>

    <!-- Số quyền hạn -->
    <div class="col-span-2 flex items-center justify-center text-sm">
      <RoundBadge color="blue">{{ role.permissionCount }} quyền</RoundBadge>
    </div>

    <!-- Trạng thái -->
    <div class="col-span-2 flex items-center justify-center text-sm">
      <RoundBadge :color="statusInfo(role.status).color">{{
        statusInfo(role.status).label
      }}</RoundBadge>
    </div>

    <!-- Thao tác -->
    <div class="col-span-2 flex items-center justify-center gap-2">
      <BaseSmallNoBgButton @click="emit('edit')" color="blue">Sửa</BaseSmallNoBgButton>
      <BaseSmallNoBgButton @click="emit('delete')" color="red">Xoá</BaseSmallNoBgButton>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
