<template>
  <ElDialog v-model="dialogVisible" ::title="$t('admin.t146')" width="30%" align-center>
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem :label="$t('admin.t147')" prop="username">
        <ElInput v-model="formData.username" :placeholder="$t('admin.t148')" />
      </ElFormItem>
      <ElFormItem :label="$t('admin.t149')" prop="phone">
        <ElInput v-model="formData.phone" :placeholder="$t('admin.t150')" />
      </ElFormItem>
      <ElFormItem :label="$t('admin.t151')" prop="gender">
        <ElSelect v-model="formData.gender">
          <ElOption :label="$t('admin.t152')" value="Nam" />
          <ElOption :label="$t('admin.t153')" value="Nữ" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem :label="$t('admin.t154')" prop="role">
        <ElSelect v-model="formData.role" multiple>
          <ElOption
            v-for="role in roleList"
            :key="role.roleCode"
            :value="role.roleCode"
            :label="role.roleName"
          />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">{{ $t('admin.t144') }}</ElButton>
        <ElButton type="primary" @click="handleSubmit">{{ $t('admin.t145') }}</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ROLE_LIST_DATA } from '@/mock/temp/formData'
  import type { FormInstance, FormRules } from 'element-plus'

  interface Props {
    visible: boolean
    type: string
    userData?: Partial<Api.SystemManage.UserListItem>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const roleList = ref(ROLE_LIST_DATA)

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)

  const formRef = ref<FormInstance>()

  const formData = reactive({
    username: '',
    phone: '',
    gender: 'Nam',
    role: [] as string[]
  })

  const rules: FormRules = {
    username: [
      { required: true, message: 'Vui lòng nhậpTên người dùng', trigger: 'blur' },
      { min: 2, max: 20, message: 'trườngđộtại 2 đến 20 chiếcchữký', trigger: 'blur' }
    ],
    phone: [
      { required: true, message: 'Vui lòng nhậpSố điện thoại', trigger: 'blur' },
      {
        pattern: /^1[3-9]\d{9}$/,
        message: 'Vui lòng nhậpđúngChínhcủaSố điện thoạicáchkiểu',
        trigger: 'blur'
      }
    ],
    gender: [{ required: true, message: 'Vui lòng chọnGioiTinh', trigger: 'blur' }],
    role: [{ required: true, message: 'Vui lòng chọnVaiTro', trigger: 'blur' }]
  }

  const initFormData = () => {
    const isEdit = props.type === 'edit' && props.userData
    const row = props.userData

    Object.assign(formData, {
      username: isEdit && row ? row.userName || '' : '',
      phone: isEdit && row ? row.userPhone || '' : '',
      gender: isEdit && row ? row.userGender || 'Nam' : 'Nam',
      role: isEdit && row ? (Array.isArray(row.userRoles) ? row.userRoles : []) : []
    })
  }

  watch(
    () => [props.visible, props.type, props.userData],
    ([visible]) => {
      if (visible) {
        initFormData()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    },
    { immediate: true }
  )

  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate((valid) => {
      if (valid) {
        ElMessage.success(dialogType.value === 'add' ? 'Thêm mớiThanhCong' : 'Cập nhậtThanhCong')
        dialogVisible.value = false
        emit('submit')
      }
    })
  }
</script>
