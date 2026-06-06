<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? 'Thêm người dùng mới' : 'Chỉnh sửa người dùng'"
    width="40%"
    align-center
    class="el-dialog-border"
  >
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      label-position="left"
    >
      <ElFormItem
        v-if="dialogType === 'add'"
        label="Tên đăng nhập"
        prop="username"
        :error="formErrors.username"
      >
        <ElInput v-model="formData.username" placeholder="Nhập tên đăng nhập..." />
      </ElFormItem>
      <ElFormItem label="Tên đầy đủ" prop="fullName" :error="formErrors.fullName">
        <ElInput v-model="formData.fullName" placeholder="Nhập họ và tên đầy đủ..." />
      </ElFormItem>
      <ElFormItem v-if="dialogType === 'add'" label="Email" prop="email" :error="formErrors.email">
        <ElInput v-model="formData.email" placeholder="Nhập địa chỉ email..." />
      </ElFormItem>
      <ElFormItem
        v-if="dialogType === 'add'"
        label="Mật khẩu"
        prop="password"
        :error="formErrors.password"
      >
        <ElInput
          v-model="formData.password"
          type="password"
          show-password
          placeholder="Nhập mật khẩu khởi tạo..."
        />
      </ElFormItem>
      <ElFormItem label="Số điện thoại" prop="phone" :error="formErrors.phone">
        <ElInput v-model="formData.phone" placeholder="Nhập số điện thoại..." maxlength="11" />
      </ElFormItem>
      <ElFormItem label="Giới tính" prop="gender" :error="formErrors.gender">
        <ElSelect
          v-model="formData.gender"
          clearable
          placeholder="Chọn giới tính..."
          class="w-full"
        >
          <ElOption label="Nam" value="Male" />
          <ElOption label="Nữ" value="Female" />
          <ElOption label="Khác" value="Other" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="Vai trò" prop="roles" :error="formErrors.roles">
        <ElSelect v-model="formData.roles" multiple collapse-tags class="w-full">
          <ElOption
            v-for="role in availableRoles"
            :key="role.id"
            :value="role.name"
            :label="role.name"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem
        v-if="dialogType === 'add'"
        label="Trạng thái"
        prop="status"
        :error="formErrors.status"
      >
        <ElSelect v-model="formData.status" class="w-full">
          <ElOption label="Hoạt động" value="Active" />
          <ElOption label="Bị khóa" value="Banned" />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">Hủy</ElButton>
        <ElButton type="primary" @click="handleSubmit" :loading="submitting">Lưu</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import {
    fetchGetRoleList,
    fetchCreateUser,
    fetchUpdateUser,
    fetchAssignUserRoles,
  } from '@/api/system-manage'
  import { normalizeBackendErrors } from '@/utils/form/error-helper'

  interface Props {
    visible: boolean
    type: 'add' | 'edit'
    userData?: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const availableRoles = ref<any[]>([])
  const submitting = ref(false)
  const formErrors = ref<Record<string, string>>({})

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value),
  })

  const dialogType = computed(() => props.type)
  const formRef = ref<FormInstance>()

  const formData = reactive({
    id: '',
    username: '',
    fullName: '',
    email: '',
    password: '',
    phone: '',
    gender: '',
    roles: [] as string[],
    status: 'Active',
  })

  const validatePhone = (rule: any, value: any, callback: any) => {
    if (!value) {
      callback()
    } else if (!/^[0-9]{10,11}$/.test(value)) {
      callback(new Error('Số điện thoại phải từ 10 đến 11 số'))
    } else {
      callback()
    }
  }

  const rules = computed<FormRules>(() => {
    const isAdd = dialogType.value === 'add'
    const baseRules: FormRules = {
      fullName: [{ required: true, message: 'Vui lòng nhập tên đầy đủ', trigger: 'blur' }],
      phone: [{ validator: validatePhone, trigger: 'blur' }],
      roles: [{ required: true, message: 'Vui lòng chọn ít nhất một vai trò', trigger: 'change' }],
    }

    if (isAdd) {
      baseRules.username = [
        { required: true, message: 'Vui lòng nhập tên đăng nhập', trigger: 'blur' },
        { min: 2, max: 20, message: 'Độ dài từ 2 đến 20 ký tự', trigger: 'blur' },
      ]
      baseRules.email = [
        { required: true, message: 'Vui lòng nhập email', trigger: 'blur' },
        { type: 'email', message: 'Email không hợp lệ', trigger: 'blur' },
      ]
      baseRules.password = [
        { required: true, message: 'Vui lòng nhập mật khẩu', trigger: 'blur' },
        { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên', trigger: 'blur' },
      ]
    }

    return baseRules
  })

  // Load available roles to populate dropdown
  const loadRoles = async () => {
    try {
      const res = await fetchGetRoleList({ Page: 1, PageSize: 100 })
      availableRoles.value = (res as any).items || res.records || []
    } catch (err) {
      console.error('Failed to load roles list:', err)
    }
  }

  const initFormData = () => {
    const isEdit = props.type === 'edit' && props.userData
    const row = props.userData

    // Map role IDs in row.roles to their corresponding names case-insensitively
    const mappedRoleNames: string[] = []
    if (isEdit && row && Array.isArray(row.roles)) {
      row.roles.forEach((roleId: string) => {
        const matched = availableRoles.value.find(
          (r) => r.id && r.id.toLowerCase() === roleId.toLowerCase(),
        )
        if (matched) {
          mappedRoleNames.push(matched.name)
        } else {
          mappedRoleNames.push(roleId)
        }
      })
    }

    Object.assign(formData, {
      id: isEdit && row ? row.id || '' : '',
      username: isEdit && row ? row.userName || '' : '',
      fullName: isEdit && row ? row.fullName || '' : '',
      email: isEdit && row ? row.email || '' : '',
      password: '',
      phone: isEdit && row ? row.phoneNumber || '' : '',
      gender: isEdit && row ? row.gender || '' : '',
      roles: mappedRoleNames,
      status: isEdit && row ? row.status || 'Active' : 'Active',
    })
  }

  watch(
    () => [props.visible, props.type, props.userData],
    async ([visible]) => {
      if (visible) {
        formErrors.value = {}
        await loadRoles()
        initFormData()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    },
    { immediate: true },
  )

  // Automatically clear specific form errors when field values change
  watch(
    () => ({ ...formData }),
    (newVal, oldVal) => {
      for (const key in newVal) {
        if (newVal[key as keyof typeof formData] !== oldVal[key as keyof typeof formData]) {
          formErrors.value[key] = ''
        }
      }
    },
    { deep: true },
  )

  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      formErrors.value = {}
      await formRef.value.validate()
      submitting.value = true

      if (dialogType.value === 'add') {
        // Create new user
        await fetchCreateUser({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phoneNumber: formData.phone,
          gender: formData.gender,
          roleNames: formData.roles,
          status: formData.status,
        })
        ElMessage.success('Thêm mới người dùng thành công!')
      } else {
        // Update existing user details
        await fetchUpdateUser(formData.id, {
          fullName: formData.fullName,
          gender: formData.gender,
          phoneNumber: formData.phone,
        })

        // Match selected role names to their IDs
        const selectedRoleIds = formData.roles
          .map((name) => {
            const matched = availableRoles.value.find((r) => r.name === name)
            return matched ? matched.id : null
          })
          .filter(Boolean) as string[]

        // Assign selected roles to the user
        await fetchAssignUserRoles(formData.id, selectedRoleIds)

        ElMessage.success('Cập nhật người dùng thành công!')
      }

      dialogVisible.value = false
      emit('submit')
    } catch (error: any) {
      console.error('Failed to submit user:', error)
      formErrors.value = normalizeBackendErrors(error, {
        fieldMappings: {
          phonenumber: 'phone',
          fullname: 'fullName',
          username: 'username',
          email: 'email',
          gender: 'gender',
          roles: 'roles',
        },
      })
    } finally {
      submitting.value = false
    }
  }
</script>
