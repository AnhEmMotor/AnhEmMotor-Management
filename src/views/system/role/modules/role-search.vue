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
  type RoleSearchFormParams = Api.SystemManage.RoleSearchParams & {
    daterange?: string[]
  }

  interface Props {
    modelValue: RoleSearchFormParams
  }

  interface Emits {
    (e: 'update:modelValue', value: RoleSearchFormParams): void
    (e: 'search', params: RoleSearchFormParams): void
    (e: 'reset'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const searchBarRef = ref()

  /**
   * FormDữ liệuđôihướngLiênđịnh
   */
  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  /**
   * Formsoátnghiệmquy
   */
  const rules = {}

  /**
   * VaiTroTrạng tháivịmục
   */
  const statusOptions = ref([
    { label: 'Bật', value: true },
    { label: 'Tắt', value: false }
  ])

  /**
   * TimKiemFormCauHinhmục
   */
  const formItems = computed(() => [
    {
      label: 'VaiTrodanhtên',
      key: 'roleName',
      type: 'input',
      placeholder: 'Vui lòng nhậpVaiTrodanhtên',
      clearable: true
    },
    {
      label: 'VaiTrobiênmã',
      key: 'roleCode',
      type: 'input',
      placeholder: 'Vui lòng nhậpVaiTrobiênmã',
      clearable: true
    },
    {
      label: 'VaiTroMô tả',
      key: 'description',
      type: 'input',
      placeholder: 'Vui lòng nhậpVaiTroMô tả',
      clearable: true
    },
    {
      label: 'VaiTroTrạng thái',
      key: 'enabled',
      type: 'select',
      props: {
        placeholder: 'Vui lòng chọnTrạng thái',
        options: statusOptions.value,
        clearable: true
      }
    },
    {
      label: 'xâyNgày',
      key: 'daterange',
      type: 'datetime',
      props: {
        style: { width: '100%' },
        placeholder: 'Vui lòng chọnNgàyphạmvi',
        type: 'daterange',
        rangeSeparator: 'đến',
        startPlaceholder: 'Bắt đầuNgày',
        endPlaceholder: 'KếtthúcNgày',
        valueFormat: 'YYYY-MM-DD',
        shortcuts: [
          { text: 'nayngày', value: [new Date(), new Date()] },
          { text: 'nhấtcậnmộttuần', value: [new Date(Date.now() - 604800000), new Date()] },
          { text: 'nhấtcậnmộtchiếctháng', value: [new Date(Date.now() - 2592000000), new Date()] }
        ]
      }
    }
  ])

  /**
   * XuLyĐặt lạiSuKien
   */
  const handleReset = () => {
    emit('reset')
  }

  /**
   * XuLyTimKiemSuKien
   * nghiệmtínhFormsauKích hoạtTimKiem
   */
  const handleSearch = async (params: RoleSearchFormParams) => {
    await searchBarRef.value.validate()
    emit('search', params)
  }
</script>
