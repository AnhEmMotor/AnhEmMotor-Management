<template>
  <div class="pb-5">
    <h2 class="mb-1 text-lg font-medium">{{ $t('admin.t78') }}</h2>

    <ElCard class="art-card-xs">
      <ArtForm
        ref="formRef"
        v-model="formData"
        :items="formItems"
        :rules="formRules"
        :defaultExpanded="true"
        :labelWidth="labelWidth"
        :labelPosition="labelPosition"
        :span="span"
        :gutter="gutter"
        @reset="handleReset"
        @submit="handleSubmit"
      >
        <template #slots>
          <ElInput v-model="formData.slots" :placeholder="$t('admin.t79')" />
        </template>
      </ArtForm>
    </ElCard>

    <div class="art-card p-5 !rounded-lg mt-5">
      <pre><code>{{ formData }}</code></pre>
    </div>

    <div class="mt-3.5">
      <h3 class="mb-2 text-base font-medium">Hoạt độngFormHanhDong</h3>
      <ElSpace wrap class="mb-3">
        <ElButton @click="getLevelOptions"> LấyNguoiDungbằngcấpDữ liệu </ElButton>
        <ElButton @click="addFormItem"> Thêm mớiFormmục </ElButton>
        <ElButton @click="updateFormItem"> sửasửaFormmục </ElButton>
        <ElButton @click="deleteFormItem"> XóaFormmục </ElButton>
        <ElButton @click="batchAddFormItems"> lôlượngThêm mới </ElButton>
        <ElButton @click="resetDynamicItems"> Đặt lạiHoạt độngmục </ElButton>
      </ElSpace>

      <h3 class="mb-2 text-base font-medium">nóanh ấyHanhDong</h3>
      <ElSpace wrap>
        <ElButton @click="validateForm"> soátnghiệmForm </ElButton>
        <ElButton @click="resetForm"> Đặt lại </ElButton>
        <ElButton v-if="showUserName" @click="updateUserName"> sửasửaTên người dùng </ElButton>
        <ElButton v-if="showUserName" @click="deleteUserName"> XóaTên người dùng </ElButton>
        <ElButton @click="labelWidth = 120"> sửasửa label Chiều rộng </ElButton>
        <ElButton @click="span = 8"> CaiDatmộtdòngHiển thịcủaComponentsố </ElButton>
        <ElButton @click="gutter = 50"> sửasửa gutter </ElButton>
        <ElButton @click="labelPosition = 'left'"> label tráiđốicăn </ElButton>
        <ElButton @click="labelPosition = 'right'"> label phảiđốicăn </ElButton>
        <ElButton @click="labelPosition = 'top'"> label Phía trênđốicăn </ElButton>
      </ElSpace>
    </div>

    <ElDialog v-model="dialogVisible">
      <img w-full :src="dialogImageUrl" alt="Preview Image" class="w-full h-auto" />
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import ArtWangEditor from '@/components/core/forms/art-wang-editor/index.vue'
  import { SearchFormItem } from '@/components/core/forms/art-search-bar/index.vue'
  import { ElMessage, ElUpload, ElButton, ElIcon, ElInput } from 'element-plus'
  import type { UploadFile, UploadFiles, UploadUserFile } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'

  interface Emits {
    (e: 'update:modelValue', value: Record<string, any>): void
    (e: 'search', params: Record<string, any>): void
    (e: 'reset'): void
  }

  interface OptionItem {
    label: string
    value: string
    disabled?: boolean
  }

  interface FormData {
    name?: string
    phone?: string
    level?: string
    address?: string
    slots?: string
    date?: string
    daterange?: string[]
    cascader?: string[]
    checkboxgroup?: string[]
    userGender?: string
    iconSelector?: string
    status?: boolean
    systemName?: string
    fileUpload: UploadUserFile[]
    imageUpload: UploadUserFile[]
    multipleFiles: UploadUserFile[]
    richTextContent: string
  }

  const emit = defineEmits<Emits>()

  const FETCH_DELAY = 500

  const formRef = ref()
  const dialogVisible = ref(false)
  const dialogImageUrl = ref('')

  const formData = ref<FormData>({
    name: undefined,
    phone: undefined,
    level: undefined,
    address: undefined,
    slots: undefined,
    date: undefined,
    daterange: undefined,
    cascader: undefined,
    checkboxgroup: undefined,
    userGender: undefined,
    iconSelector: undefined,
    status: undefined,
    systemName: undefined,
    fileUpload: [],
    imageUpload: [],
    multipleFiles: [],
    richTextContent: ''
  })

  const formRules = {
    name: [{ required: true, message: 'Vui lòng nhậpTên người dùng', trigger: 'blur' }]
  }

  const labelWidth = ref(100)
  const labelPosition = ref<'right' | 'left' | 'top'>('right')
  const span = ref(6)
  const gutter = ref(12)

  const levelOptions = ref<OptionItem[]>([])

  const LEVEL_OPTIONS: OptionItem[] = [
    { label: 'phổthôngNguoiDung', value: 'normal' },
    { label: 'VIPNguoiDung', value: 'vip' },
    { label: 'Nâng caoVIP', value: 'svip' },
    { label: 'xínghiệpNguoiDung', value: 'enterprise', disabled: true }
  ]

  const GENDER_OPTIONS: OptionItem[] = [
    { label: 'Nam', value: '1' },
    { label: 'Nữ', value: '2' }
  ]

  const DATE_SHORTCUTS = [
    { text: 'nayngày', value: new Date() },
    { text: 'quangày', value: () => new Date(Date.now() - 86400000) },
    { text: 'mộttuầntrước', value: () => new Date(Date.now() - 604800000) }
  ]

  const fetchLevelOptions = (): Promise<OptionItem[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(LEVEL_OPTIONS)
      }, FETCH_DELAY)
    })
  }

  const getLevelOptions = async (): Promise<void> => {
    levelOptions.value = await fetchLevelOptions()
    if (levelOptions.value.length) {
      ElMessage.success('ThanhCongLấyđếnDữ liệu')
    }
  }

  interface FormItemConfig {
    label: string
    key: string
    type: string
    placeholder?: string
    props?: Record<string, any>
    [key: string]: any
  }

  const createFormItem = (config: FormItemConfig) => config

  const baseFormItems = {
    username: createFormItem({
      label: 'Tên người dùng',
      key: 'name',
      type: 'input',
      placeholder: 'Vui lòng nhậpTên người dùng',
      clearable: true
    }),
    phone: createFormItem({
      label: 'Số điện thoại',
      key: 'phone',
      type: 'input',
      props: { placeholder: 'Vui lòng nhậpSố điện thoại', maxlength: '11' }
    }),
    level: createFormItem({
      label: 'NguoiDungbằngcấp',
      key: 'level',
      type: 'select',
      props: {
        placeholder: 'Vui lòng chọnbằngcấp',
        options: LEVEL_OPTIONS
      }
    }),
    address: createFormItem({
      label: 'DiaChi',
      key: 'address',
      type: 'input',
      placeholder: 'Vui lòng nhậpDiaChi'
    }),
    date: createFormItem({
      label: 'Ngày',
      key: 'date',
      type: 'datetime',
      props: {
        style: { width: '100%' },
        placeholder: 'Vui lòng chọnNgày',
        type: 'date',
        valueFormat: 'YYYY-MM-DD',
        shortcuts: DATE_SHORTCUTS
      }
    }),
    gender: createFormItem({
      label: 'GioiTinh',
      key: 'userGender',
      type: 'radiogroup',
      props: {
        options: GENDER_OPTIONS
      }
    })
  }

  const userItem = ref<SearchFormItem>({
    label: 'Tên người dùng',
    key: 'name',
    type: 'input',
    props: {
      placeholder: 'Vui lòng nhậpTên người dùng',
      clearable: true
    }
  })

  const showUserName = ref(true)

  const dynamicFormItems = ref<SearchFormItem[]>([])

  let dynamicItemCounter = 0

  const cascaderOptions = [
    {
      value: 'guide',
      label: 'nam',
      children: [
        {
          value: 'disciplines',
          label: 'quyphạm',
          children: [
            { value: 'consistency', label: 'mộtđếntính' },
            { value: 'feedback', label: 'ngượchồi' },
            { value: 'efficiency', label: 'hiệusuất' },
            { value: 'controllability', label: 'Có thểkhốngtính' }
          ]
        }
      ]
    },
    {
      value: 'components',
      label: 'Component',
      children: [
        {
          value: 'basic',
          label: 'Cơ bảnComponent',
          children: [
            { value: 'button', label: 'Nút' },
            { value: 'form', label: 'Form' },
            { value: 'table', label: 'Bảng' }
          ]
        }
      ]
    }
  ]

  const treeSelectData = [
    {
      value: '1',
      label: 'mộtcấp 1',
      children: [
        {
          value: '1-1',
          label: 'haicấp 1-1',
          children: [{ value: '1-1-1', label: 'bacấp 1-1-1' }]
        }
      ]
    },
    {
      value: '2',
      label: 'mộtcấp 2',
      children: [
        {
          value: '2-1',
          label: 'haicấp 2-1',
          children: [{ value: '2-1-1', label: 'bacấp 2-1-1' }]
        },
        {
          value: '2-2',
          label: 'haicấp 2-2',
          children: [{ value: '2-2-1', label: 'bacấp 2-2-1' }]
        }
      ]
    }
  ]

  const checkboxOptions = [
    { label: 'vịmục1', value: 'option1' },
    { label: 'vịmục2', value: 'option2' },
    { label: 'vịmục3', value: 'option3' },
    { label: 'vịmục4', value: 'option4' },
    { label: 'vịmục5（disabled）', value: 'option5', disabled: true }
  ]

  const formItems = computed(() => [
    ...(showUserName.value ? [userItem.value] : []),

    ...dynamicFormItems.value,
    {
      ...baseFormItems.phone
    },
    {
      ...baseFormItems.level,
      props: { placeholder: 'Vui lòng chọnbằngcấp', options: levelOptions.value }
    },
    baseFormItems.address,
    baseFormItems.date,

    {
      label: 'NgàyThoiGian',
      key: 'datetime',
      type: 'datetime',
      props: {
        style: { width: '100%' },
        placeholder: 'Vui lòng chọnNgàyThoiGian',
        type: 'datetime',
        valueFormat: 'YYYY-MM-DD HH:mm:ss'
      }
    },
    {
      label: 'Ngàyphạmvi',
      key: 'daterange',
      type: 'datetime',
      props: {
        type: 'daterange',
        valueFormat: 'YYYY-MM-DD',
        rangeSeparator: 'đến',
        startPlaceholder: 'Bắt đầuNgày',
        endPlaceholder: 'KếtthúcNgày'
      }
    },

    {
      label: 'NgàyThoiGianphạmvi',
      key: 'datetimerange',
      type: 'datetime',
      props: {
        type: 'datetimerange',
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        rangeSeparator: 'đến',
        startPlaceholder: 'Bắt đầuNgàyThoiGian',
        endPlaceholder: 'KếtthúcNgàyThoiGian'
      }
    },

    {
      label: 'ThoiGianChọn',
      key: 'timeselect',
      type: 'timeselect',
      props: {
        placeholder: 'Vui lòng chọnThoiGian',
        type: 'time',
        valueFormat: 'HH:mm:ss'
      }
    },

    {
      label: 'ThoiGianBộ chọn',
      key: 'timepicker',
      type: 'timepicker',
      props: {
        style: { width: '100%' },
        placeholder: 'Vui lòng chọnThoiGian',
        type: 'time',
        valueFormat: 'HH:mm:ss'
      }
    },

    {
      label: 'cấpliênChọn',
      key: 'cascader',
      type: 'cascader',
      props: {
        placeholder: 'Vui lòng chọncấpliênBộ chọn',
        clearable: true,
        style: { width: '100%' },
        collapseTags: true,
        maxCollapseTags: 1,
        props: { multiple: true },
        options: cascaderOptions
      }
    },

    {
      label: 'câykiểuBộ chọn',
      key: 'treeSelect',
      type: 'treeselect',
      props: {
        showCheckbox: true,
        multiple: true,
        clearable: true,
        data: treeSelectData
      }
    },
    { label: 'chènkhe', key: 'slots', type: 'input', placeholder: 'Vui lòng nhậpEmail' },
    {
      label: 'RenderComponent',
      key: 'iconSelector',
      render: () => h(ElInput, { placeholder: 'RenderTùy chỉnh input' })
    },
    {
      label: 'Tùy chỉnhComponent',
      key: 'customComponent',
      render: () =>
        h(
          'div',
          {
            style:
              'color: var(--art-gray-600); border: 1px solid var(--default-border-dashed); padding: 0px 15px; border-radius: 6px'
          },
          'tôilàmộtchiếcTùy chỉnhComponent'
        )
    },
    {
      label: 'Ô chọn nhiều',
      key: 'checkboxgroup',
      type: 'checkboxgroup',
      span: 12,
      props: {
        options: checkboxOptions
      }
    },
    {
      ...baseFormItems.gender
    },

    {
      label: 'làphủBật',
      key: 'isEnabled',
      type: 'switch',
      props: {
        placeholder: 'Vui lòng chọnlàphủBật'
      }
    },
    {
      label: 'Tuổi',
      key: 'age',
      type: 'number',
      slots: {
        suffix: () => h('span', { style: 'color: #909399; font-size: 12px' }, 'tuổi')
      }
    },
    {
      label: 'mạngtrangDiaChi',
      key: 'website',
      type: 'input',
      placeholder: 'Vui lòng nhậpmạngtrangdanhtên',
      slots: {
        prepend: () => h('span', 'https://'),
        append: () => h('span', '.com')
      }
    },
    {
      label: 'SuKiendiễnthị',
      key: 'event',
      type: 'input',
      props: {
        placeholder: 'NhậpNoiDungKích hoạtSuKien，Bảng tổng quanXem',
        clearable: true,
        prefixIcon: 'Search',

        onInput(val: string) {
          console.log('NhậpSuKien', val)
        },
        onClear() {
          console.log('xóakhôngSuKien')
        }
      }
    },

    {
      label: 'đadòngNhập',
      key: 'remark',
      type: 'input',
      props: {
        placeholder: 'Vui lòng nhậpGhiChu',
        type: 'textarea',
        rows: 2
      }
    },
    {
      label: 'Đánh giá',
      key: 'rate',
      type: 'rate',
      props: {
        size: 'large',
        placeholder: 'Vui lòng chọnĐánh giá'
      }
    },
    {
      label: 'Tắt',
      key: 'diaabled',
      type: 'input',
      placeholder: 'tôibịTắtrồi',
      disabled: true
    },
    {
      label: 'Thanh trượt',
      key: 'slider',
      type: 'slider'
    },

    {
      label: 'Ẩn',
      key: 'email',
      type: 'input',
      hidden: true
    },

    {
      label: 'liệuđiềuphần tửẨn',
      key: 'systemName',
      type: 'input',
      hidden: formData.value.systemName === 'mac',
      placeholder: 'Nhập mac ComponentẨn'
    },
    {
      label: 'lướicáchBố cục',
      key: 'sg1',
      type: 'input',
      span: 12,
      placeholder:
        'Ví dụ：lướicách span=12 chiếmContainermộtnửaChiều rộng，span=24 chiếmđầyContainer'
    },

    {
      label: 'vănphần tửTải lên',
      key: 'multipleFiles',
      span: 12,
      render: () =>
        h(
          ElUpload,
          {
            multiple: true,
            limit: 5,
            action: '#',
            autoUpload: false,
            showFileList: true,

            beforeUpload: (file: File) => {
              console.log('thuậnđặtTải lênvănphần tử:', file.name)
              return true
            },
            onChange: (file: UploadFile, fileList: UploadFiles) => {
              console.log('đavănphần tửbiếnhóa:', file, fileList)
              formData.value.multipleFiles = fileList as UploadUserFile[]
            },
            onRemove: (file: UploadFile, fileList: UploadFiles) => {
              console.log('Xóavănphần tử:', file, fileList)
              formData.value.multipleFiles = fileList as UploadUserFile[]
            },
            onExceed: (files: File[], fileList: UploadUserFile[]) => {
              ElMessage.warning(
                `nhấtđachỉnăngTải lên 5 chiếcvănphần tử，khitrướcChọnrồi ${files.length + fileList.length} chiếcvănphần tử`
              )
            }
          },
          {
            default: () => [h(ElButton, { type: 'primary' }, () => 'NhấnTải lên')]
          }
        )
    },

    {
      label: 'Hình ảnhTải lên',
      key: 'imageUpload',
      span: 12,
      render: () =>
        h(
          ElUpload,
          {
            accept: '.jpg,.jpeg,.png,.gif,.webp',
            limit: 4,
            action: '#',
            autoUpload: false,
            showFileList: true,
            listType: 'picture-card',
            beforeUpload: (file: File) => {
              const isImage = file.type.startsWith('image/')
              const isLt2M = file.size / 1024 / 1024 < 2
              if (!isImage) {
                ElMessage.error('chỉnăngTải lênHình ảnhvănphần tử!')
                return false
              }
              if (!isLt2M) {
                ElMessage.error('Hình ảnhKích thướcKhôngnăngsiêuqua 2MB!')
                return false
              }
              return true
            },
            onChange: (file: UploadFile, fileList: UploadFiles) => {
              console.log('Hình ảnhbiếnhóa:', file, fileList)
              formData.value.imageUpload = fileList as UploadUserFile[]
            },
            onRemove: (file: UploadFile, fileList: UploadFiles) => {
              console.log('XóaHình ảnh:', file, fileList)
              formData.value.imageUpload = fileList as UploadUserFile[]
            },
            onPreview: (file: UploadFile) => {
              dialogImageUrl.value = file.url || ''
              dialogVisible.value = true
            }
          },
          {
            default: () => [h(ElIcon, { type: 'primary' }, () => h(Plus))]
          }
        )
    },

    {
      label: 'phúvănquyểnTrình biên tập',
      key: 'richTextContent',
      span: 24,
      render: () =>
        h(ArtWangEditor, {
          modelValue: formData.value.richTextContent,
          height: '300px',
          placeholder: 'Vui lòng nhậpphúvănquyểnNoiDung...',
          'onUpdate:modelValue': (value: string | undefined) => {
            formData.value.richTextContent = value || ''
            console.log('phúvănquyểnNoiDungbiếnhóa:', value)
          },
          toolbarKeys: [
            'headerSelect',
            'bold',
            'italic',
            'underline',
            '|',
            'bulletedList',
            'numberedList',
            '|',
            'insertLink',
            'insertImage',
            '|',
            'undo',
            'redo'
          ]
        })
    }
  ])

  const handleReset = (): void => {
    console.log('Đặt lạiForm')
    emit('reset')
  }

  const handleSubmit = async (params: Record<string, any>): Promise<void> => {
    await formRef.value.validate()
    emit('search', params)
    console.log('FormDữ liệu', params)
  }

  const validateForm = () => formRef.value.validate()

  const resetForm = () => formRef.value.reset()

  const updateUserName = (): void => {
    userItem.value = {
      ...userItem.value,
      label: 'Biệt danh',
      props: {
        placeholder: 'Vui lòng nhậpBiệt danh'
      }
    }
  }

  const deleteUserName = (): void => {
    showUserName.value = false
    formData.value.name = undefined
  }

  const addFormItem = (): void => {
    dynamicItemCounter++
    const newItem: SearchFormItem = {
      label: `Hoạt độngchữđoạn${dynamicItemCounter}`,
      key: `dynamic_${dynamicItemCounter}`,
      type: 'input',
      props: {
        placeholder: `Vui lòng nhậpHoạt độngchữđoạn${dynamicItemCounter}`,
        clearable: true
      }
    }
    dynamicFormItems.value.push(newItem)
    ElMessage.success(`ĐãThêm mớiFormmục：${newItem.label}`)
  }

  const updateFormItem = (): void => {
    if (dynamicFormItems.value.length === 0) {
      ElMessage.warning('khôngcóCó thểsửasửacủaHoạt độngFormmục，Vui lòngThêm mới')
      return
    }

    const lastIndex = dynamicFormItems.value.length - 1
    const lastItem = dynamicFormItems.value[lastIndex]

    dynamicFormItems.value[lastIndex] = {
      ...lastItem,
      label: `Đãsửasửa`,
      type: 'select',
      props: {
        placeholder: 'sửasửavìdướikéoChọn',
        options: [
          { label: 'vịmụcA', value: 'a' },
          { label: 'vịmụcB', value: 'b' },
          { label: 'vịmụcC', value: 'c' }
        ]
      }
    }

    ElMessage.success(`ĐãsửasửaFormmục：${lastItem.label}`)
  }

  const deleteFormItem = (): void => {
    if (dynamicFormItems.value.length === 0) {
      ElMessage.warning('khôngcóCó thểXóacủaHoạt độngFormmục')
      return
    }

    const deletedItem = dynamicFormItems.value.pop()
    if (deletedItem) {
      delete formData.value[deletedItem.key as keyof FormData]
      ElMessage.success(`ĐãXóaFormmục：${deletedItem.label}`)
    }
  }

  const batchAddFormItems = (): void => {
    const batchItems: SearchFormItem[] = [
      {
        label: 'côngtydanhtên',
        key: `company_${++dynamicItemCounter}`,
        type: 'input',
        props: {
          placeholder: 'Vui lòng nhậpcôngtydanhtên',
          clearable: true
        }
      },
      {
        label: 'bộcửa',
        key: `department_${++dynamicItemCounter}`,
        type: 'select',
        props: {
          placeholder: 'Vui lòng chọnbộcửa',
          options: [
            { label: 'kỹthuậtbộ', value: 'tech' },
            { label: 'sinhsản phẩmbộ', value: 'product' },
            { label: 'vậndoanhbộ', value: 'operation' }
          ]
        }
      },
      {
        label: 'vàochứcNgày',
        key: `joinDate_${++dynamicItemCounter}`,
        type: 'datetime',
        props: {
          style: { width: '100%' },
          placeholder: 'Vui lòng chọnvàochứcNgày',
          type: 'date',
          valueFormat: 'YYYY-MM-DD'
        }
      }
    ]

    dynamicFormItems.value.push(...batchItems)
    ElMessage.success(`ĐãlôlượngThêm mới ${batchItems.length} chiếcFormmục`)
  }

  const resetDynamicItems = (): void => {
    if (dynamicFormItems.value.length === 0) {
      ElMessage.info('khitrướckhôngcóHoạt độngFormmục')
      return
    }

    dynamicFormItems.value.forEach((item) => {
      delete formData.value[item.key as keyof FormData]
    })

    dynamicFormItems.value = []
    dynamicItemCounter = 0
    ElMessage.success('ĐãĐặt lạinêncóHoạt độngFormmục')
  }
</script>
