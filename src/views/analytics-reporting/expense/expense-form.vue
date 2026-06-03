<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Tên khoản chi</label>
      <input
        v-model="form.name"
        placeholder="VD: Thuê mặt bằng, Marketing..."
        class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Phân loại</label>
      <select
        v-model="form.category"
        class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option :value="0">Chi phí cố định (Mặt bằng, lương cơ bản...)</option>
        <option :value="1">Chi phí biến đổi (Hoa hồng, điện nước, vật tư...)</option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Số tiền (VNĐ)</label>
      <input
        type="number"
        v-model.number="form.amount"
        class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Ngày ghi nhận</label>
      <input
        type="date"
        v-model="form.expenseDate"
        class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
      <textarea
        v-model="form.note"
        rows="3"
        class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
      ></textarea>
    </div>

    <div class="flex justify-end gap-3 mt-6">
      <button
        @click="$emit('close')"
        class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >Hủy</button
      >
      <button
        @click="submitForm"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >Lưu chi phí</button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive } from 'vue'

  const emit = defineEmits(['close', 'submit'])

  const form = reactive({
    name: '',
    category: 0, // 0: Fixed, 1: Variable
    amount: 0,
    expenseDate: new Date().toISOString().split('T')[0],
    note: '',
  })

  const submitForm = () => {
    if (!form.name || form.amount <= 0) {
      alert('Vui lòng nhập tên và số tiền hợp lệ')
      return
    }
    emit('submit', { ...form })
  }
</script>
