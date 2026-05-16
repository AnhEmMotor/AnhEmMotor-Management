<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    @reset="handleReset"
    @search="handleSearch"
  >
  </ArtSearchBar>
</template>

<script setup lang="ts">
  interface Props {
    modelValue: Api.SystemManage.UserSearchParams
  }
  interface Emits {
    (e: 'update:modelValue', value: Api.SystemManage.UserSearchParams): void
    (e: 'search', params: Api.SystemManage.UserSearchParams): void
    (e: 'reset'): void
  }
  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // FormDữ liệuđôihướngLiênđịnh
  const searchBarRef = ref()
  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  // soátnghiệmquy
  const rules = {
    // userName: [{ required: true, message: 'Vui lòng nhậpTên người dùng', trigger: 'blur' }]
  }

  // Hoạt động options
  const statusOptions = ref<{ label: string; value: string; disabled?: boolean }[]>([])

  // môphỏngGiao diện (Interface)Quay lạiTrạng tháiDữ liệu
  function fetchStatusOptions(): Promise<typeof statusOptions.value> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { label: 'tạiđường', value: '1' },
          { label: 'Ngoạiđường', value: '2' },
          { label: 'Bất thường', value: '3' },
          { label: 'tâmtác', value: '4' }
        ])
      }, 1000)
    })
  }

  onMounted(async () => {
    statusOptions.value = await fetchStatusOptions()
  })

  // FormCauHinh
  const formItems = computed(() => [
    {
      label: 'Tên người dùng',
      key: 'userName',
      type: 'input',
      placeholder: 'Vui lòng nhậpTên người dùng',
      clearable: true
    },
    {
      label: 'Số điện thoại',
      key: 'userPhone',
      type: 'input',
      props: { placeholder: 'Vui lòng nhậpSố điện thoại', maxlength: '11' }
    },
    {
      label: 'Email',
      key: 'userEmail',
      type: 'input',
      props: { placeholder: 'Vui lòng nhậpEmail' }
    },
    {
      label: 'Trạng thái',
      key: 'status',
      type: 'select',
      props: {
        placeholder: 'Vui lòng chọnTrạng thái',
        options: statusOptions.value
      }
    },
    {
      label: 'GioiTinh',
      key: 'userGender',
      type: 'radiogroup',
      props: {
        options: [
          { label: 'Nam', value: '1' },
          { label: 'Nữ', value: '2' }
        ]
      }
    }
  ])

  // SuKien
  function handleReset() {
    console.log('Đặt lạiForm')
    emit('reset')
  }

  async function handleSearch(params: Api.SystemManage.UserSearchParams) {
    await searchBarRef.value.validate()
    emit('search', params)
    console.log('FormDữ liệu', params)
  }
</script>
