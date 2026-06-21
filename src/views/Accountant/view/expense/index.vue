<template>
  <div class="expense-management">
    <div class="reporting-actions mb-4">
      <ElButton type="primary" @click="openExpenseForm">
        <ElIcon><Plus /></ElIcon>
        Thêm khoản chi
      </ElButton>
    </div>

    <ElTable
      :data="tableExpenses"
      class="reporting-table"
      v-loading="props.loading"
      empty-text="Không có dữ liệu chi phí"
    >
      <ElTableColumn prop="expenseDate" label="Ngày ghi nhận" min-width="140" />
      <ElTableColumn prop="name" label="Tên khoản chi" min-width="220" />
      <ElTableColumn prop="category" label="Phân loại" min-width="150">
        <template #default="{ row }">
          <ElTag :type="row.category === 0 ? 'danger' : 'warning'" effect="light" round>
            {{ row.category === 0 ? 'Chi phí cố định' : 'Chi phí biến đổi' }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="amount" label="Số tiền (VNĐ)" min-width="150" align="right">
        <template #default="{ row }">{{ formatCurrency(row.amount) }}</template>
      </ElTableColumn>
      <ElTableColumn prop="note" label="Ghi chú" min-width="220" />
      <ElTableColumn label="Hành động" width="120" align="center">
        <template #default="{ row }">
          <ElButton type="danger" link @click="deleteExpense(row.id)">Xóa</ElButton>
        </template>
      </ElTableColumn>
    </ElTable>

    <ElDialog
      v-if="isFormVisible"
      v-model="isFormVisible"
      title="Ghi nhận khoản chi"
      width="520px"
      class="reporting-dialog"
      destroy-on-close
      align-center
    >
      <ExpenseForm @close="isFormVisible = false" @submit="handleAddExpense" />
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted } from 'vue'
  import { ElMessageBox } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'
  import { AnalyticsService } from '@/services/analytics.service'
  import type { Expense } from '@/services/analytics.types'
  import ExpenseForm from './expense-form.vue'

  type ExpenseFormData = {
    name: string
    category: number
    amount: number
    expenseDate: string
    note?: string
  }

  const props = withDefaults(
    defineProps<{
      expenses?: Expense[]
      loading?: boolean
    }>(),
    {
      loading: false,
    },
  )

  const emit = defineEmits<{
    add: []
    delete: [id: number]
  }>()

  const localExpenses = ref<Expense[]>([])
  const isFormVisible = ref(false)
  const isControlled = computed(() => props.expenses !== undefined)
  const tableExpenses = computed(() => props.expenses ?? localExpenses.value)

  async function loadExpenses() {
    if (isControlled.value) return
    localExpenses.value = await AnalyticsService.getExpenses()
  }

  async function handleAddExpense(formData: ExpenseFormData) {
    await AnalyticsService.createExpense(formData)
    await loadExpenses()
    isFormVisible.value = false
  }

  async function deleteExpense(id: number) {
    if (isControlled.value) {
      emit('delete', id)
      return
    }
    try {
      await ElMessageBox.confirm('Bạn có chắc chắn muốn xóa khoản chi này?', 'Xác nhận xóa', {
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        type: 'warning',
      })
    } catch {
      return
    }
    await AnalyticsService.deleteExpense(id)
    await loadExpenses()
  }

  function openExpenseForm() {
    if (isControlled.value) {
      emit('add')
      return
    }
    isFormVisible.value = true
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  onMounted(loadExpenses)
</script>
