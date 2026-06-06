<template>
  <ElDialog
    v-model="visible"
    :title="`Đổi mật khẩu người dùng: ${userData?.fullName || userData?.userName || ''}`"
    width="420px"
    align-center
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-position="top" class="mt-2">
      <ElFormItem label="Mật khẩu mới" prop="newPassword">
        <ElInput
          v-model="form.newPassword"
          type="password"
          show-password
          placeholder="Nhập mật khẩu mới..."
        />
      </ElFormItem>
      <ElFormItem label="Xác nhận mật khẩu mới" prop="confirmPassword">
        <ElInput
          v-model="form.confirmPassword"
          type="password"
          show-password
          placeholder="Nhập lại mật khẩu mới..."
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">Hủy</ElButton>
      <ElButton type="primary" @click="handleSubmit" :loading="submitting">Lưu thay đổi</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { fetchChangeUserPassword } from '@/api/system-manage'

  interface Props {
    modelValue: boolean
    userData?: any
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    userData: undefined,
  })

  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const submitting = ref(false)

  const form = reactive({
    newPassword: '',
    confirmPassword: '',
  })

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  })

  const validateConfirmPassword = (rule: any, value: any, callback: any) => {
    if (value === '') {
      callback(new Error('Vui lòng xác nhận mật khẩu mới'))
    } else if (value !== form.newPassword) {
      callback(new Error('Mật khẩu xác nhận không khớp!'))
    } else {
      callback()
    }
  }

  const rules = reactive<FormRules>({
    newPassword: [
      { required: true, message: 'Vui lòng nhập mật khẩu mới', trigger: 'blur' },
      { min: 6, max: 32, message: 'Độ dài mật khẩu từ 6 đến 32 ký tự', trigger: 'blur' },
    ],
    confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }],
  })

  const handleClose = () => {
    visible.value = false
    formRef.value?.resetFields()
    form.newPassword = ''
    form.confirmPassword = ''
  }

  const handleSubmit = async () => {
    if (!formRef.value || !props.userData?.id) return

    try {
      await formRef.value.validate()
      submitting.value = true

      await fetchChangeUserPassword(props.userData.id, form.newPassword)
      ElMessage.success('Đổi mật khẩu tài khoản người dùng thành công!')
      emit('success')
      handleClose()
    } catch (error: any) {
      console.error('Failed to change password:', error)
    } finally {
      submitting.value = false
    }
  }
</script>

<style scoped lang="scss"></style>
