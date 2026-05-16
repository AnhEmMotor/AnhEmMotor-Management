<!-- FormComponent -->
<!-- chiếctrìlệdùngFormComponent、Tùy chỉnhComponent、chènkhe、soátnghiệm、ẨnFormmục -->
<!-- viếtphápcùng ElementPlus Chính thứcTaiLieuComponent，chiếcThuocTinhviếttại props trongmặtthìCó thểlấyrồi -->
<template>
  <section class="px-4 pb-0 pt-4 md:px-4 md:pt-4">
    <ElForm
      ref="formRef"
      :model="modelValue"
      :label-position="labelPosition"
      v-bind="{ ...$attrs }"
    >
      <ElRow class="flex flex-wrap" :gutter="gutter">
        <ElCol
          v-for="item in visibleFormItems"
          :key="item.key"
          :xs="getColSpan(item.span, 'xs')"
          :sm="getColSpan(item.span, 'sm')"
          :md="getColSpan(item.span, 'md')"
          :lg="getColSpan(item.span, 'lg')"
          :xl="getColSpan(item.span, 'xl')"
        >
          <ElFormItem
            :prop="item.key"
            :label-width="item.label ? item.labelWidth || labelWidth : undefined"
          >
            <template #label v-if="item.label">
              <component v-if="typeof item.label !== 'string'" :is="item.label" />
              <span v-else>{{ item.label }}</span>
            </template>
            <slot :name="item.key" :item="item" :modelValue="modelValue">
              <component
                :is="getComponent(item)"
                :model-value="getFieldValue(item.key)"
                @update:model-value="setFieldValue(item.key, $event)"
                v-bind="getProps(item)"
              >
                <!-- dướikéoChọn -->
                <template v-if="item.type === 'select' && getProps(item)?.options">
                  <ElOption
                    v-for="option in getProps(item).options"
                    v-bind="option"
                    :key="option.value"
                  />
                </template>

                <!-- Ô chọn nhiềutổ -->
                <template v-if="item.type === 'checkboxgroup' && getProps(item)?.options">
                  <ElCheckbox
                    v-for="option in getProps(item).options"
                    v-bind="option"
                    :key="option.value"
                  />
                </template>

                <!-- Nút chọn mộttổ -->
                <template v-if="item.type === 'radiogroup' && getProps(item)?.options">
                  <ElRadio
                    v-for="option in getProps(item).options"
                    v-bind="option"
                    :key="option.value"
                  />
                </template>

                <!-- Hoạt độngchènkhechiếctrì -->
                <template v-for="(slotFn, slotName) in getSlots(item)" :key="slotName" #[slotName]>
                  <component :is="slotFn" />
                </template>
              </component>
            </slot>
          </ElFormItem>
        </ElCol>
        <ElCol :xs="24" :sm="24" :md="span" :lg="span" :xl="span" class="max-w-full flex-1">
          <div
            class="mb-3 flex-c flex-wrap justify-end md:flex-row md:items-stretch md:gap-2"
            :style="actionButtonsStyle"
          >
            <div class="flex gap-2 md:justify-center">
              <ElButton v-if="showReset" class="reset-button" @click="handleReset" v-ripple>
                {{ t('table.form.reset') }}
              </ElButton>
              <ElButton
                v-if="showSubmit"
                type="primary"
                class="submit-button"
                @click="handleSubmit"
                v-ripple
                :disabled="disabledSubmit"
              >
                {{ t('table.form.submit') }}
              </ElButton>
            </div>
          </div>
        </ElCol>
      </ElRow>
    </ElForm>
  </section>
</template>

<script setup lang="ts">
  import { useWindowSize } from '@vueuse/core'
  import { useI18n } from 'vue-i18n'
  import { toRaw, type Component } from 'vue'
  import {
    ElCascader,
    ElCheckbox,
    ElCheckboxGroup,
    ElDatePicker,
    ElInput,
    ElInputTag,
    ElInputNumber,
    ElRadioGroup,
    ElRate,
    ElSelect,
    ElSlider,
    ElSwitch,
    ElTimePicker,
    ElTimeSelect,
    ElTreeSelect,
    type FormInstance
  } from 'element-plus'
  import { calculateResponsiveSpan, type ResponsiveBreakpoint } from '@/utils/form/responsive'

  defineOptions({ name: 'ArtForm' })

  const componentMap = {
    input: ElInput, // Ô nhập liệu
    inputtag: ElInputTag, // TagÔ nhập liệu
    number: ElInputNumber, // SốÔ nhập liệu
    select: ElSelect, // Bộ chọn
    switch: ElSwitch, // Công tắc
    checkbox: ElCheckbox, // Ô chọn nhiều
    checkboxgroup: ElCheckboxGroup, // Ô chọn nhiềutổ
    radiogroup: ElRadioGroup, // Nút chọn mộttổ
    date: ElDatePicker, // NgàyBộ chọn
    daterange: ElDatePicker, // NgàyphạmviBộ chọn
    datetime: ElDatePicker, // NgàyThoiGianBộ chọn
    datetimerange: ElDatePicker, // NgàyThoiGianphạmviBộ chọn
    rate: ElRate, // Đánh giá
    slider: ElSlider, // Thanh trượt
    cascader: ElCascader, // cấpliênBộ chọn
    timepicker: ElTimePicker, // ThoiGianBộ chọn
    timeselect: ElTimeSelect, // ThoiGianChọn
    treeselect: ElTreeSelect // câyBộ chọn
  }

  const { width } = useWindowSize()
  const { t } = useI18n()
  const isMobile = computed(() => width.value < 500)

  const formInstance = useTemplateRef<FormInstance>('formRef')

  // FormmụcCauHinh
  export interface FormItem {
    /** Formmụccủaduymộttiêu */
    key: string
    /** FormmụccủaTagvănquyểnhoặcTùy chỉnhRenderHàm */
    label: string | (() => VNode) | Component
    /** FormmụcTagcủaChiều rộng，sẽphủlấp Form của labelWidth */
    labelWidth?: string | number
    /** Formmụcloạikiểu，chiếctrìtrướcĐịnh nghĩacủaComponentloạikiểu */
    type?: keyof typeof componentMap | string
    /** Tùy chỉnhRenderHàmhoặcComponent，dùngởRenderTùy chỉnhComponent（Tốicấpcaoở type） */
    render?: (() => VNode) | Component
    /** làphủẨnnênFormmục */
    hidden?: boolean
    /** FormmụcchiếmliệucủacộtRộng，ở24cáchlướicáchHeThong */
    span?: number
    /** vịmụcDữ liệu，dùngở select、checkbox-group、radio-group bằng */
    options?: Record<string, any>
    /** truyềnchuyểnchoFormmụcComponentcủaThuocTinh */
    props?: Record<string, any>
    /** FormmụccủachènkheCauHinh */
    slots?: Record<string, (() => any) | undefined>
    /** Formmụccủachiếmvịkývănquyển */
    placeholder?: string
    /** ThêmThuocTinhCauHinhVui lòngkhảo ElementPlus Chính thứcTaiLieu */
  }

  // FormCauHinh
  interface FormProps {
    /** FormDữ liệu */
    items: FormItem[]
    /** mỗicộtcủaChiều rộng（ở 24 cáchBố cục） */
    span?: number
    /** Formkhốngphần tửgiankhe */
    gutter?: number
    /** FormTênTagcủaViTri */
    labelPosition?: 'left' | 'right' | 'top'
    /** VanBanChiều rộng */
    labelWidth?: string | number
    /** Núttựatráiđốicănhạnchế（Formmụctiểuởbằngởnêngiá trịgiờ） */
    buttonLeftLimit?: number
    /** làphủHiển thịĐặt lạiNút */
    showReset?: boolean
    /** làphủHiển thịGửiNút */
    showSubmit?: boolean
    /** làphủTắtGửiNút */
    disabledSubmit?: boolean
    /** Gửigiờlàphủxóarửakhônggiá trị */
    sanitizeOutput?: Partial<SanitizeOutputOptions>
  }

  interface SanitizeOutputOptions {
    /** DichiakhôngChuỗi */
    removeEmptyString: boolean
    /** DichiakhôngMảng */
    removeEmptyArray: boolean
    /** DichiaxóarửasauvìkhôngcủaDoiTuong */
    removeEmptyObject: boolean
    /** DichiakhôngphúvănquyểnchiếmvịNoiDung，nếu <p><br></p> */
    removeEmptyRichText: boolean
    /** LưugiữSố 0 nàyloạicóhiệugiá trị */
    keepZero: boolean
    /** Lưugiữ false nàyloạicóhiệugiá trị */
    keepFalse: boolean
  }

  const props = withDefaults(defineProps<FormProps>(), {
    items: () => [],
    span: 6,
    gutter: 12,
    labelPosition: 'right',
    labelWidth: '70px',
    buttonLeftLimit: 2,
    showReset: true,
    showSubmit: true,
    disabledSubmit: false,
    sanitizeOutput: () => ({})
  })

  interface FormEmits {
    reset: []
    submit: [Record<string, any>]
  }

  const emit = defineEmits<FormEmits>()

  const modelValue = defineModel<Record<string, any>>({ default: {} })
  const initialModelValue = ref<Record<string, any>>({})

  // LưutồnComponentban đầuđầuhóagiờcủaFormkhoáichiếu，dùngở reset giờkhôiphụcMacDinhgiá trị。
  const cloneModelValue = (value: Record<string, any> | undefined) => {
    if (!value) return {}

    const deepClone = (source: unknown): unknown => {
      if (Array.isArray(source)) {
        return source.map((item) => deepClone(item))
      }

      if (source && typeof source === 'object') {
        const rawSource = toRaw(source)
        return Object.keys(rawSource).reduce<Record<string, unknown>>((accumulator, key) => {
          accumulator[key] = deepClone((rawSource as Record<string, unknown>)[key])
          return accumulator
        }, {})
      }

      return source
    }

    return deepClone(toRaw(value)) as Record<string, any>
  }

  initialModelValue.value = cloneModelValue(modelValue.value)

  const rootProps = ['label', 'labelWidth', 'key', 'type', 'hidden', 'span', 'slots']
  // nhậpragiờcủaxóarửasáchlượcMacDinhthiên“Giao diện (Interface)hữuhảo”，nhưngcho phéphứanghiệpvụphủlấp。
  const sanitizeOutputOptions = computed<SanitizeOutputOptions>(() => ({
    removeEmptyString: true,
    removeEmptyArray: true,
    removeEmptyObject: true,
    removeEmptyRichText: true,
    keepZero: true,
    keepFalse: true,
    ...props.sanitizeOutput
  }))

  const PATH_NUMBER_RE = /^\d+$/

  // kiêmdung a.b、a.0.b nàyloạiđườngviếtpháp，SốđoạnsẽbịkhilàmMảngChỉ mụcXuLy。
  const parsePath = (path: string) => {
    return path
      .split('.')
      .filter(Boolean)
      .map((segment) => (PATH_NUMBER_RE.test(segment) ? Number(segment) : segment))
  }

  const getFieldValue = (path: string) => {
    return parsePath(path).reduce<any>((currentValue, segment) => {
      if (currentValue == null) return undefined
      return currentValue[segment]
    }, modelValue.value)
  }

  // xóakhôngchữđoạngiờchỉXóađườngcủanhấtsaumộtđoạn，tránhmiễnsaixóacùngcấpDữ liệu。
  const deleteFieldValue = (path: string) => {
    const segments = parsePath(path)
    if (!segments.length) return

    const lastSegment = segments.pop()
    const parent = segments.reduce<any>((currentValue, segment) => {
      if (currentValue == null) return undefined
      return currentValue[segment]
    }, modelValue.value)

    if (parent != null && lastSegment !== undefined) {
      delete parent[lastSegment]
    }
  }

  // FormxóakhôngNhậpgiờKhôngLưugiữkhôngChuỗi，cùnggiờđườngtừđộngbùcănGiữaDoiTuonghoặcMảng。
  const setFieldValue = (path: string, value: unknown) => {
    const normalizedValue = value === '' ? undefined : value
    const segments = parsePath(path)

    if (!segments.length) return

    if (normalizedValue === undefined) {
      deleteFieldValue(path)
      return
    }

    let currentValue: any = modelValue.value

    segments.forEach((segment, index) => {
      const isLast = index === segments.length - 1

      if (isLast) {
        currentValue[segment] = normalizedValue
        return
      }

      const nextSegment = segments[index + 1]
      const nextContainer = typeof nextSegment === 'number' ? [] : {}

      if (
        currentValue[segment] === null ||
        currentValue[segment] === undefined ||
        typeof currentValue[segment] !== 'object'
      ) {
        currentValue[segment] = nextContainer
      }

      currentValue = currentValue[segment]
    })
  }

  const isRichTextEmpty = (value: string) => {
    if (/<(img|video|audio|iframe|embed|object)\b/i.test(value)) {
      return false
    }

    // điTrình biên tậplệthấychiếmvịTagsaulạiđoánlàphủcòncóthựctếNoiDung。
    return (
      value
        .replace(/&nbsp;/gi, '')
        .replace(/<br\s*\/?>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim() === ''
    )
  }

  // GửigiờCauHinhxóarửakhônggiá trị，nhưngLưugiữ 0 và false nàyloạicóhiệugiá trị。
  const sanitizeOutputValue = (value: unknown): unknown => {
    const options = sanitizeOutputOptions.value

    if (Array.isArray(value)) {
      const sanitizedArray = value
        .map((item) => sanitizeOutputValue(item))
        .filter((item) => item !== undefined)
      return sanitizedArray.length === 0 && options.removeEmptyArray ? undefined : sanitizedArray
    }

    if (value && typeof value === 'object') {
      const rawValue = toRaw(value)
      const sanitizedObject = Object.entries(rawValue).reduce<Record<string, unknown>>(
        (accumulator, [key, item]) => {
          const sanitizedItem = sanitizeOutputValue(item)
          if (sanitizedItem !== undefined) {
            accumulator[key] = sanitizedItem
          }
          return accumulator
        },
        {}
      )
      return Object.keys(sanitizedObject).length === 0 && options.removeEmptyObject
        ? undefined
        : sanitizedObject
    }

    if (typeof value === 'string') {
      if (options.removeEmptyString && value.trim() === '') {
        return undefined
      }
      if (options.removeEmptyRichText && isRichTextEmpty(value)) {
        return undefined
      }
      return value
    }

    if (value === 0) {
      return options.keepZero ? value : undefined
    }

    if (value === false) {
      return options.keepFalse ? value : undefined
    }

    return value ?? undefined
  }

  const getSanitizedOutput = () => {
    return (sanitizeOutputValue(cloneModelValue(modelValue.value)) || {}) as Record<string, any>
  }

  const getProps = (item: FormItem) => {
    if (item.props) return item.props
    const props = { ...item }
    rootProps.forEach((key) => delete (props as Record<string, any>)[key])
    return props
  }

  // Lấychènkhe
  const getSlots = (item: FormItem) => {
    if (!item.slots) return {}
    const validSlots: Record<string, () => any> = {}
    Object.entries(item.slots).forEach(([key, slotFn]) => {
      if (slotFn) {
        validSlots[key] = slotFn
      }
    })
    return validSlots
  }

  // Component
  const getComponent = (item: FormItem) => {
    // Tốikhiếndùng render HàmhoặcComponentRenderTùy chỉnhComponent
    if (item.render) {
      return item.render
    }
    // khiếndùng type LấytrướcĐịnh nghĩaComponent
    const { type } = item
    return componentMap[type as keyof typeof componentMap] || componentMap['input']
  }

  /**
   * LấycộtRộng span giá trị
   * liệumàn hìnhmànthướctấctrínănggiảmcấp，tránhmiễntiểumàn hìnhmàntrênFormmụcbịépthụtquatiểu
   */
  const getColSpan = (itemSpan: number | undefined, breakpoint: ResponsiveBreakpoint): number => {
    return calculateResponsiveSpan(itemSpan, span.value, breakpoint)
  }

  /**
   * Hiển thịcủaFormmục
   */
  const visibleFormItems = computed(() => {
    return props.items.filter((item) => !item.hidden)
  })

  /**
   * HanhDongNútKiểu dáng
   */
  const actionButtonsStyle = computed(() => ({
    'justify-content': isMobile.value
      ? 'flex-end'
      : props.items.filter((item) => !item.hidden).length <= props.buttonLeftLimit
        ? 'flex-start'
        : 'flex-end'
  }))

  /**
   * XuLyĐặt lạiSuKien
   */
  const handleReset = () => {
    // Đặt lạiFormchữđoạn（UI tầng）
    formInstance.value?.resetFields()

    // khôiphụcban đầuđầuFormgiá trị，LưugiữMacDinhgiá trịmàKhônglàrútđơnxóakhông。
    Object.keys(modelValue.value).forEach((key) => {
      delete modelValue.value[key]
    })
    Object.assign(modelValue.value, cloneModelValue(initialModelValue.value))

    // Kích hoạt reset SuKien
    emit('reset')
  }

  /**
   * XuLyGửiSuKien
   */
  const handleSubmit = () => {
    // đốingoàichỉnémraxóarửasaucủaKetQua，tránhmiễnnghiệpvụtầngtrùngphụcqualọckhônggiá trị。
    emit('submit', getSanitizedOutput())
  }

  defineExpose({
    ref: formInstance,
    validate: (...args: any[]) => formInstance.value?.validate(...args),
    reset: handleReset,
    // cho phéphứangoàibộtạiKhôngKích hoạtGửiSuKiengiờchủđộngLấyxóarửasaucủanhậpra。
    getOutput: getSanitizedOutput
  })

  // giảicấu props lấytiệntạimôbảntrongthẳngtiếpkhiếndùng
  const { span, gutter, labelPosition, labelWidth } = toRefs(props)
</script>
