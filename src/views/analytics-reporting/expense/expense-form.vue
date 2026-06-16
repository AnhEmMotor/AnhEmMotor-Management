<template>
  <ElForm label-position="top" class="expense-form">
    <ElFormItem label="Tên khoản chi" required>
      <ElInput v-model="form.name" placeholder="VD: Thuê mặt bằng, Marketing..." />
    </ElFormItem>

    <ElFormItem label="Phân loại" required>
      <ElSelect v-model="form.category" popper-class="reporting-select-popper" class="w-full">
        <ElOption label="Chi phí cố định (mặt bằng, lương cơ bản...)" :value="0" />
        <ElOption label="Chi phí biến đổi (hoa hồng, điện nước, vật tư...)" :value="1" />
      </ElSelect>
    </ElFormItem>

    <ElFormItem label="Số tiền (VNĐ)" required>
      <ElInputNumber
        v-model.number="form.amount"
        :min="0"
        :step="100000"
        controls-position="right"
        class="w-full"
      />
    </ElFormItem>

    <ElFormItem label="Ngày ghi nhận" required>
      <ElDatePicker
        v-model="form.expenseDate"
        type="date"
        value-format="YYYY-MM-DD"
        placeholder="Chọn ngày"
        popper-class="reporting-date-popper"
        class="w-full"
      />
    </ElFormItem>

    <ElFormItem label="Ghi chú">
      <ElInput v-model="form.note" type="textarea" :rows="3" placeholder="Ghi chú nội bộ nếu có" />
    </ElFormItem>

    <div class="flex justify-end gap-3 mt-6">
      <ElButton @click="emit('close')">Hủy</ElButton>
      <ElButton type="primary" @click="submitForm">Lưu chi phí</ElButton>
    </div>
  </ElForm>
</template>

<script setup lang="ts">
  import { reactive } from 'vue'
  import { ElMessage } from 'element-plus'

  type ExpenseFormData = {
    name: string
    category: number
    amount: number
    expenseDate: string
    note?: string
  }

  const emit = defineEmits<{
    close: []
    submit: [value: ExpenseFormData]
  }>()

  const form = reactive<ExpenseFormData>({
    name: '',
    category: 0, // 0: Fixed, 1: Variable
    amount: 0,
    expenseDate: new Date().toISOString().split('T')[0],
    note: '',
  })

  const submitForm = () => {
    if (!form.name || form.amount <= 0) {
      ElMessage.warning('Vui lòng nhập tên khoản chi và số tiền hợp lệ.')
      return
    }
    emit('submit', { ...form })
  }
</script>
