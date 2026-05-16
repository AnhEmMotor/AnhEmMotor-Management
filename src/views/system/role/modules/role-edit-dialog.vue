<template>
  <ElDialog
    v-model="visible"
    ::title="$t('admin.t134')"
    width="30%"
    align-center
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="120px">
      <ElFormItem :label="$t('admin.t135')" prop="roleName">
        <ElInput v-model="form.roleName" :placeholder="$t('admin.t136')" />
      </ElFormItem>
      <ElFormItem :label="$t('admin.t137')" prop="roleCode">
        <ElInput v-model="form.roleCode" :placeholder="$t('admin.t138')" />
      </ElFormItem>
      <ElFormItem :label="$t('admin.t139')" prop="description">
        <ElInput
          v-model="form.description"
          type="textarea"
          :rows="3"
          :placeholder="$t('admin.t140')"
        />
      </ElFormItem>
      <ElFormItem :label="$t('admin.t141')">
        <ElSwitch v-model="form.enabled" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">{{ $t('admin.t132') }}</ElButton>
      <ElButton type="primary" @click="handleSubmit">{{ $t('admin.t133') }}</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'

  type RoleListItem = Api.SystemManage.RoleListItem

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    roleData?: RoleListItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add',
    roleData: undefined
  })

  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()

  /**
   * PopupHiển thịTrạng tháiđôihướngLiênđịnh
   */
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  /**
   * Formnghiệmtínhquy
   */
  const rules = reactive<FormRules>({
    roleName: [
      { required: true, message: 'Vui lòng nhậpVaiTrodanhtên', trigger: 'blur' },
      { min: 2, max: 20, message: 'trườngđộtại 2 đến 20 chiếcchữký', trigger: 'blur' }
    ],
    roleCode: [
      { required: true, message: 'Vui lòng nhậpVaiTrobiênmã', trigger: 'blur' },
      { min: 2, max: 50, message: 'trườngđộtại 2 đến 50 chiếcchữký', trigger: 'blur' }
    ],
    description: [{ required: true, message: 'Vui lòng nhậpVaiTroMô tả', trigger: 'blur' }]
  })

  /**
   * FormDữ liệu
   */
  const form = reactive<RoleListItem>({
    roleId: 0,
    roleName: '',
    roleCode: '',
    description: '',
    createTime: '',
    enabled: true
  })

  /**
   * Lắng nghePopupmởmở，ban đầuđầuhóaFormDữ liệu
   */
  watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal) initForm()
    }
  )

  /**
   * Lắng ngheVaiTroDữ liệubiếnhóa，Cập nhậtForm
   */
  watch(
    () => props.roleData,
    (newData) => {
      if (newData && props.modelValue) initForm()
    },
    { deep: true }
  )

  /**
   * ban đầuđầuhóaFormDữ liệu
   * liệuPopuploạikiểuĐiền vàoFormhoặcĐặt lạiForm
   */
  const initForm = () => {
    if (props.dialogType === 'edit' && props.roleData) {
      Object.assign(form, props.roleData)
    } else {
      Object.assign(form, {
        roleId: 0,
        roleName: '',
        roleCode: '',
        description: '',
        createTime: '',
        enabled: true
      })
    }
  }

  /**
   * đóngđóngPopupđồng thờiĐặt lạiForm
   */
  const handleClose = () => {
    visible.value = false
    formRef.value?.resetFields()
  }

  /**
   * GửiForm
   * nghiệmtínhthông quasauđiềudùngGiao diện (Interface)LưutồnDữ liệu
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      // TODO: điềudùngThêm mới/Chỉnh sửaGiao diện (Interface)
      const message = props.dialogType === 'add' ? 'Thêm mớiThanhCong' : 'sửasửaThanhCong'
      ElMessage.success(message)
      emit('success')
      handleClose()
    } catch (error) {
      console.log('FormnghiệmtínhThatBai:', error)
    }
  }
</script>
