<template>
  <div class="expense-management p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">💸 Quản lý Chi phí Vận hành</h1>
      <button
        @click="openExpenseForm"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        + Thêm khoản chi mới
      </button>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full text-left text-sm">
        <thead class="bg-gray-50 border-b text-gray-500">
          <tr>
            <th class="p-4">Ngày ghi nhận</th>
            <th class="p-4">Tên khoản chi</th>
            <th class="p-4">Phân loại</th>
            <th class="p-4 text-right">Số tiền (VNĐ)</th>
            <th class="p-4">Ghi chú</th>
            <th class="p-4 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="exp in expenses" :key="exp.id" class="border-b last:border-0 hover:bg-gray-50">
            <td class="p-4">{{ exp.expenseDate }}</td>
            <td class="p-4 font-medium">{{ exp.name }}</td>
            <td class="p-4">
              <span
                :class="[
                  'px-2 py-1 rounded-full text-xs',
                  exp.category === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700',
                ]"
              >
                {{ exp.category === 0 ? 'Chi phí cố định' : 'Chi phí biến đổi' }}
              </span>
            </td>
            <td class="p-4 text-right font-bold">{{ formatCurrency(exp.amount) }}</td>
            <td class="p-4 text-gray-500">{{ exp.note }}</td>
            <td class="p-4 text-center">
              <button @click="deleteExpense(exp.id)" class="text-red-500 hover:text-red-700"
                >Xóa</button
              >
            </td>
          </tr>
          <tr v-if="expenses.length === 0">
            <td colspan="6" class="p-8 text-center text-gray-400">Không có dữ liệu chi phí</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form -->
    <div
      v-if="isFormVisible"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">Ghi nhận khoản chi</h3>
          <button @click="isFormVisible = false" class="text-gray-400 hover:text-gray-600"
            >✕</button
          >
        </div>
        <ExpenseForm @close="isFormVisible = false" @submit="handleAddExpense" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { AnalyticsService } from '@/services/analytics.service'
  import type { Expense } from '@/services/analytics.types'
  import ExpenseForm from './expense-form.vue'

  const expenses = ref<Expense[]>([])
  const isFormVisible = ref(false)

  async function loadExpenses() {
    expenses.value = await AnalyticsService.getExpenses()
  }

  async function handleAddExpense(formData: any) {
    await AnalyticsService.createExpense(formData)
    await loadExpenses()
    isFormVisible.value = false
  }

  async function deleteExpense(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa khoản chi này?')) {
      await AnalyticsService.deleteExpense(id)
      await loadExpenses()
    }
  }

  function openExpenseForm() {
    isFormVisible.value = true
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  onMounted(loadExpenses)
</script>
