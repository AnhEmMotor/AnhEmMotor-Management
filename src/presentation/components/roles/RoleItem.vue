<script setup>
import SmallNoBgButton from '../ui/button/SmallNoBgButton.vue'
defineProps({
  role: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <div
    class="grid grid-cols-16 gap-4 p-3 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
  >
    <div class="col-span-13 flex items-center">
      <div>
        <p class="font-semibold text-gray-800">{{ role.name }}</p>
      </div>
    </div>

    <div class="col-span-3 flex items-center justify-center gap-2">
      <SmallNoBgButton @click="emit('edit')" color="blue">Sửa</SmallNoBgButton>
      <SmallNoBgButton @click="emit('delete')" color="red">Xoá</SmallNoBgButton>
    </div>
  </div>
</template>



