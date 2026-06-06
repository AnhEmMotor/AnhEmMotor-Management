<template>
  <ElDialog
    :title="dialogTitle"
    :model-value="visible"
    @update:model-value="handleCancel"
    width="860px"
    align-center
    class="menu-dialog"
    @closed="handleClosed"
  >
    <ArtForm
      ref="formRef"
      v-model="form"
      :items="formItems"
      :rules="rules"
      :span="width > 640 ? 12 : 24"
      :gutter="20"
      label-width="100px"
      :show-reset="false"
      :show-submit="false"
    >
      <template #menuType>
        <ElRadioGroup v-model="form.menuType" :disabled="disableMenuType">
          <ElRadioButton value="menu" label="menu">{{ $t('admin.t125') }}</ElRadioButton>
          <ElRadioButton value="button" label="button">{{ $t('admin.t126') }}</ElRadioButton>
        </ElRadioGroup>
      </template>
    </ArtForm>

    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="handleCancel">Hủy Thông</ElButton>
        <ElButton type="primary" @click="handleSubmit">Chính định</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormRules } from 'element-plus'
  import { ElIcon, ElTooltip } from 'element-plus'
  import { QuestionFilled } from '@element-plus/icons-vue'
  import { formatMenuTitle } from '@/utils/router'
  import type { AppRouteRecord } from '@/types/router'
  import type { FormItem } from '@/components/core/forms/art-form/index.vue'
  import ArtForm from '@/components/core/forms/art-form/index.vue'
  import { useWindowSize } from '@vueuse/core'

  const { width } = useWindowSize()

  const createLabelTooltip = (label: string, tooltip: string) => {
    return () =>
      h('span', { class: 'flex items-center' }, [
        h('span', label),
        h(
          ElTooltip,
          {
            content: tooltip,
            placement: 'top',
          },
          () => h(ElIcon, { class: 'ml-0.5 cursor-help' }, () => h(QuestionFilled)),
        ),
      ])
  }

  interface MenuFormData {
    id: number
    name: string
    path: string
    label: string
    component: string
    icon: string
    isEnable: boolean
    sort: number
    isMenu: boolean
    keepAlive: boolean
    isHide: boolean
    isHideTab: boolean
    link: string
    isIframe: boolean
    showBadge: boolean
    showTextBadge: string
    fixedTab: boolean
    activePath: string
    roles: string[]
    isFullPage: boolean
    authName: string
    authLabel: string
    authIcon: string
    authSort: number
  }

  interface Props {
    visible: boolean
    editData?: AppRouteRecord | any
    type?: 'menu' | 'button'
    lockType?: boolean
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: MenuFormData): void
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    type: 'menu',
    lockType: false,
  })

  const emit = defineEmits<Emits>()

  const formRef = ref()
  const isEdit = ref(false)

  const form = reactive<MenuFormData & { menuType: 'menu' | 'button' }>({
    menuType: 'menu',
    id: 0,
    name: '',
    path: '',
    label: '',
    component: '',
    icon: '',
    isEnable: true,
    sort: 1,
    isMenu: true,
    keepAlive: true,
    isHide: false,
    isHideTab: false,
    link: '',
    isIframe: false,
    showBadge: false,
    showTextBadge: '',
    fixedTab: false,
    activePath: '',
    roles: [],
    isFullPage: false,
    authName: '',
    authLabel: '',
    authIcon: '',
    authSort: 1,
  })

  const rules = reactive<FormRules>({
    name: [
      { required: true, message: 'Vui lòng nhậpMenudanhtên', trigger: 'blur' },
      { min: 2, max: 20, message: 'trườngđộtại 2 đến 20 chiếcchữký', trigger: 'blur' },
    ],
    path: [{ required: true, message: 'Vui lòng nhậpRoutingDiaChi', trigger: 'blur' }],
    label: [{ required: true, message: 'NhậpQuyenHantiêu', trigger: 'blur' }],
    authName: [{ required: true, message: 'Vui lòng nhậpQuyenHandanhtên', trigger: 'blur' }],
    authLabel: [{ required: true, message: 'Vui lòng nhậpQuyenHantiêu', trigger: 'blur' }],
  })

  const formItems = computed<FormItem[]>(() => {
    const baseItems: FormItem[] = [{ label: 'Menuloạikiểu', key: 'menuType', span: 24 }]

    const switchSpan = width.value < 640 ? 12 : 6

    if (form.menuType === 'menu') {
      return [
        ...baseItems,
        { label: 'Menudanhtên', key: 'name', type: 'input', props: { placeholder: 'Menudanhtên' } },
        {
          label: createLabelTooltip(
            'RoutingDiaChi',
            'mộtcấpMenu：lấy / mởđầucủatuyệtđốiđường（nếu /dashboard）\nhaicấpvàlấydưới：đốiđường（nếu console、user）',
          ),
          key: 'path',
          type: 'input',
          props: { placeholder: 'nếu：/dashboard hoặc console' },
        },
        { label: 'QuyenHantiêu', key: 'label', type: 'input', props: { placeholder: 'nếu：User' } },
        {
          label: createLabelTooltip(
            'Componentđường',
            'mộtcấpchacấpMenu：viết /index/index\ndụng cụthểtrangmặt：viếtComponentđường（nếu /system/user）\nmụclụcMenu：giữkhông',
          ),
          key: 'component',
          type: 'input',
          props: { placeholder: 'nếu：/system/user hoặcgiữkhông' },
        },
        { label: 'Icon', key: 'icon', type: 'input', props: { placeholder: 'nếu：ri:user-line' } },
        {
          label: createLabelTooltip(
            'VaiTroQuyenHan',
            'chỉdùngởtrướcđầuQuyenHanmôkiểu：CauHinhVaiTrotiêu（nếu R_SUPER、R_ADMIN）\nsauđầuQuyenHanmôkiểu：vôcầnCauHinh',
          ),
          key: 'roles',
          type: 'inputtag',
          props: { placeholder: 'NhậpVaiTrotiêusauvềxe，nếu：R_SUPER' },
        },
        {
          label: 'Menuxếpthứ',
          key: 'sort',
          type: 'number',
          props: { min: 1, controlsPosition: 'right', style: { width: '100%' } },
        },
        {
          label: 'ngoàibộliêntiếp',
          key: 'link',
          type: 'input',
          props: { placeholder: 'nếu：https://www.example.com' },
        },
        {
          label: 'vănquyểnhuychương',
          key: 'showTextBadge',
          type: 'input',
          props: { placeholder: 'nếu：New、Hot' },
        },
        {
          label: createLabelTooltip(
            'kíchsốngđường',
            'dùngởTrang chi tiếtbằngẨnMenu，địnhcaosángHiển thịcủachacấpMenuđường\nví dụnếu：NguoiDungTrang chi tiếtcaosángHiển thị"NguoiDungQuản lý"Menu',
          ),
          key: 'activePath',
          type: 'input',
          props: { placeholder: 'nếu：/system/user' },
        },
        { label: 'làphủBật', key: 'isEnable', type: 'switch', span: switchSpan },
        { label: 'trangmặtCache', key: 'keepAlive', type: 'switch', span: switchSpan },
        { label: 'ẨnMenu', key: 'isHide', type: 'switch', span: switchSpan },
        { label: 'làphủtrongnhúng', key: 'isIframe', type: 'switch', span: switchSpan },
        { label: 'Hiển thịhuychương', key: 'showBadge', type: 'switch', span: switchSpan },
        { label: 'cốđịnhTag', key: 'fixedTab', type: 'switch', span: switchSpan },
        { label: 'TagẨn', key: 'isHideTab', type: 'switch', span: switchSpan },
        { label: 'Toàn màn hìnhtrangmặt', key: 'isFullPage', type: 'switch', span: switchSpan },
      ]
    } else {
      return [
        ...baseItems,
        {
          label: 'QuyenHandanhtên',
          key: 'authName',
          type: 'input',
          props: { placeholder: 'nếu：Thêm mới、Chỉnh sửa、Xóa' },
        },
        {
          label: 'QuyenHantiêu',
          key: 'authLabel',
          type: 'input',
          props: { placeholder: 'nếu：add、edit、delete' },
        },
        {
          label: 'QuyenHanxếpthứ',
          key: 'authSort',
          type: 'number',
          props: { min: 1, controlsPosition: 'right', style: { width: '100%' } },
        },
      ]
    }
  })

  const dialogTitle = computed(() => {
    const type = form.menuType === 'menu' ? 'Menu' : 'Nút'
    return isEdit.value ? `Chỉnh sửa${type}` : `mớixây${type}`
  })

  const disableMenuType = computed(() => {
    if (isEdit.value) return true
    if (!isEdit.value && form.menuType === 'menu' && props.lockType) return true
    return false
  })

  const resetForm = (): void => {
    formRef.value?.reset()
    form.menuType = 'menu'
  }

  const loadFormData = (): void => {
    if (!props.editData) return

    isEdit.value = true

    if (form.menuType === 'menu') {
      const row = props.editData
      form.id = row.id || 0
      form.name = formatMenuTitle(row.meta?.title || '')
      form.path = row.path || ''
      form.label = row.name || ''
      form.component = row.component || ''
      form.icon = row.meta?.icon || ''
      form.sort = row.meta?.sort || 1
      form.isMenu = row.meta?.isMenu ?? true
      form.keepAlive = row.meta?.keepAlive ?? false
      form.isHide = row.meta?.isHide ?? false
      form.isHideTab = row.meta?.isHideTab ?? false
      form.isEnable = row.meta?.isEnable ?? true
      form.link = row.meta?.link || ''
      form.isIframe = row.meta?.isIframe ?? false
      form.showBadge = row.meta?.showBadge ?? false
      form.showTextBadge = row.meta?.showTextBadge || ''
      form.fixedTab = row.meta?.fixedTab ?? false
      form.activePath = row.meta?.activePath || ''
      form.roles = row.meta?.roles || []
      form.isFullPage = row.meta?.isFullPage ?? false
    } else {
      const row = props.editData
      form.authName = row.title || ''
      form.authLabel = row.authMark || ''
      form.authIcon = row.icon || ''
      form.authSort = row.sort || 1
    }
  }

  const handleSubmit = async (): Promise<void> => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      emit('submit', { ...form })
      ElMessage.success(`${isEdit.value ? 'Chỉnh sửa' : 'Thêm mới'}ThanhCong`)
      handleCancel()
    } catch {
      ElMessage.error('FormsoátnghiệmThatBai，Vui lòngTìmNhập')
    }
  }

  const handleCancel = (): void => {
    emit('update:visible', false)
  }

  const handleClosed = (): void => {
    resetForm()
    isEdit.value = false
  }

  watch(
    () => props.visible,
    (newVal) => {
      if (newVal) {
        form.menuType = props.type
        nextTick(() => {
          if (props.editData) {
            loadFormData()
          }
        })
      }
    },
  )

  watch(
    () => props.type,
    (newType) => {
      if (props.visible) {
        form.menuType = newType
      }
    },
  )
</script>
