<template>
  <div class="art-card p-5 overflow-hidden bg-white">
    <div class="art-card-header">
      <div class="title">
        <h4>9.1. Quản lý Chi phí vận hành (Expense Management)</h4>
        <p>Mock UI theo Workflow: tạo Expense + phân loại cố định/biến đổi + mã định danh</p>
      </div>

      <div class="flex items-center gap-3">
        <ElButton type="primary" :disabled="isLoading" @click="openForm">+ Tạo chi phí</ElButton>
      </div>
    </div>

    <ElDivider />

    <div v-if="isLoading" class="mt-4">
      <ElSkeleton :rows="6" animated />
    </div>

    <div v-else>
      <ElTable :data="filteredList" border style="width: 100%">
        <ElTableColumn prop="expenseCode" label="Mã" width="120" />
        <ElTableColumn prop="title" label="Nội dung" min-width="220" />
        <ElTableColumn prop="expenseType" label="Loại" width="150">
          <template #default="scope">
            <ElTag :type="scope.row.expenseType === 'Cố định' ? 'success' : 'warning'">
              {{ scope.row.expenseType }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="month" label="Tháng" width="110" />
        <ElTableColumn prop="amount" label="Số tiền" width="170">
          <template #default="scope">{{ formatVnd(scope.row.amount) }}</template>
        </ElTableColumn>
        <ElTableColumn label="Thao tác" width="150">
          <template #default="scope">
            <ElButton size="small" type="primary" link @click="editExpense(scope.row)"
              >Sửa</ElButton
            >
          </template>
        </ElTableColumn>
      </ElTable>

      <div class="mt-4 flex items-center justify-between">
        <div class="text-xs text-g-500">Mock: click “Sửa” để mở form.</div>

        <ElPagination
          background
          layout="prev, pager, next"
          :total="list.length"
          :page-size="pageSize"
          v-model:current-page="page"
        />
      </div>
    </div>

    <el-dialog v-model="showForm" title="Expense Form (mock)" width="700px">
      <ElForm :model="form" label-width="130px" :rules="rules" ref="formRef" status-icon>
        <ElFormItem label="Mã định danh" prop="expenseCode">
          <ElInput v-model="form.expenseCode" disabled />
        </ElFormItem>

        <ElFormItem label="Nội dung" prop="title">
          <ElInput
            v-model="form.title"
            placeholder="vd: Thuê mặt bằng / Marketing / Điện nước..."
          />
        </ElFormItem>

        <ElFormItem label="Loại chi phí" prop="expenseType">
          <ElSelect v-model="form.expenseType" style="width: 100%">
            <ElOption label="Cố định" value="Cố định" />
            <ElOption label="Biến đổi" value="Biến đổi" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="Tháng" prop="month">
          <ElSelect v-model="form.month" style="width: 100%">
            <ElOption v-for="m in months" :key="m" :label="m" :value="m" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="Số tiền" prop="amount">
          <ElInputNumber v-model="form.amount" :min="0" style="width: 100%" />
        </ElFormItem>

        <ElFormItem label="Ghi chú" prop="note">
          <ElInput v-model="form.note" placeholder="(optional)" />
        </ElFormItem>
      </ElForm>

      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <ElButton @click="showForm = false">Hủy</ElButton>
          <ElButton type="primary" :loading="saving" @click="saveExpense">Lưu (mock)</ElButton>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive, ref } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'

  interface ExpenseItem {
    id: string
    expenseCode: string
    title: string
    expenseType: 'Cố định' | 'Biến đổi'
    month: string
    amount: number
    note?: string
  }

  const months = [
    '01/2026',
    '02/2026',
    '03/2026',
    '04/2026',
    '05/2026',
    '06/2026',
    '07/2026',
    '08/2026',
    '09/2026',
    '10/2026',
    '11/2026',
    '12/2026',
  ]

  const list = ref<ExpenseItem[]>([
    {
      id: 'e1',
      expenseCode: 'EXP-THUÊMB-2026-05',
      title: 'Thuê mặt bằng',
      expenseType: 'Cố định',
      month: '05/2026',
      amount: 85_000_000,
      note: 'Mock: hợp đồng tháng 05',
    },
    {
      id: 'e2',
      expenseCode: 'EXP-ĐIỆN-NƯỚC-2026-05',
      title: 'Điện nước & Internet',
      expenseType: 'Cố định',
      month: '05/2026',
      amount: 24_000_000,
    },
    {
      id: 'e3',
      expenseCode: 'EXP-MARKETING-2026-05',
      title: 'Marketing (đẩy lead)',
      expenseType: 'Biến đổi',
      month: '05/2026',
      amount: 40_000_000,
    },
    {
      id: 'e4',
      expenseCode: 'EXP-LƯƠNG-2026-05',
      title: 'Lương cố vấn & vận hành',
      expenseType: 'Cố định',
      month: '05/2026',
      amount: 120_000_000,
    },
    {
      id: 'e5',
      expenseCode: 'EXP-VẬNCHUYỂN-2026-05',
      title: 'Vận chuyển linh kiện',
      expenseType: 'Biến đổi',
      month: '05/2026',
      amount: 17_500_000,
    },
  ])

  const page = ref(1)
  const pageSize = 5

  const isLoading = ref(false)

  const filteredList = computed(() => {
    const start = (page.value - 1) * pageSize
    return list.value.slice(start, start + pageSize)
  })

  const showForm = ref(false)
  const saving = ref(false)

  const formRef = ref<FormInstance | null>(null)

  const form = reactive<ExpenseItem>({
    id: '',
    expenseCode: '',
    title: '',
    expenseType: 'Cố định',
    month: '05/2026',
    amount: 0,
    note: '',
  })

  const rules = reactive<FormRules>({
    title: [{ required: true, message: 'Vui lòng nhập nội dung', trigger: 'blur' }],
    expenseType: [{ required: true, message: 'Vui lòng chọn loại', trigger: 'change' }],
    month: [{ required: true, message: 'Vui lòng chọn tháng', trigger: 'change' }],
    amount: [{ required: true, message: 'Vui lòng nhập số tiền', trigger: 'change' }],
  })

  function formatVnd(value: number): string {
    try {
      return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value) + 'đ'
    } catch {
      return `${Math.round(value)}đ`
    }
  }

  function generateExpenseCode(title: string, month: string) {
    const slug = title
      .trim()
      .toUpperCase()
      .replace(/[^A-ZÀ-Ỵ0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 24)

    return `EXP-${slug}-${month.replace('/', '-')}`
  }

  function openForm() {
    form.id = ''
    form.title = ''
    form.expenseType = 'Cố định'
    form.month = '05/2026'
    form.amount = 0
    form.note = ''
    form.expenseCode = generateExpenseCode('EXP-MOI', form.month)

    showForm.value = true
  }

  function editExpense(item: ExpenseItem) {
    form.id = item.id
    form.expenseCode = item.expenseCode
    form.title = item.title
    form.expenseType = item.expenseType
    form.month = item.month
    form.amount = item.amount
    form.note = item.note || ''

    showForm.value = true
  }

  async function saveExpense() {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (!valid) return

      saving.value = true
      await new Promise((r) => setTimeout(r, 550))

      if (form.id) {
        const idx = list.value.findIndex((x) => x.id === form.id)
        if (idx >= 0) {
          list.value[idx] = { ...form }
        }
      } else {
        list.value.unshift({
          ...form,
          id: `e_${Date.now()}`,
        })
      }

      saving.value = false
      showForm.value = false

      // reset pagination if needed
      page.value = 1
    })
  }
</script>

<style scoped>
  .art-card {
    min-height: 520px;
  }
</style>
