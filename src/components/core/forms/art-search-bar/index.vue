<!-- BảngTimKiemComponent -->
<!-- chiếctrìlệdùngFormComponent、Tùy chỉnhComponent、chènkhe、soátnghiệm、ẨnFormmục -->
<!-- viếtphápcùng ElementPlus Chính thứcTaiLieuComponent，chiếcThuocTinhviếttại props trongmặtthìCó thểlấyrồi -->
<template>
  <section class="art-search-bar art-card-xs" :class="{ 'is-expanded': isExpanded }">
    <ElForm
      ref="formRef"
      :model="modelValue"
      :label-position="labelPosition"
      v-bind="{ ...$attrs }"
    >
      <ElRow :gutter="gutter">
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
        <ElCol :xs="24" :sm="24" :md="span" :lg="span" :xl="span" class="action-column">
          <div class="action-buttons-wrapper" :style="actionButtonsStyle">
            <div class="form-buttons">
              <ElButton v-if="showReset" class="reset-button" @click="handleReset" v-ripple>
                {{ t('table.searchBar.reset') }}
              </ElButton>
              <ElButton
                v-if="showSearch"
                type="primary"
                class="search-button"
                @click="handleSearch"
                v-ripple
                :disabled="disabledSearch"
              >
                {{ t('table.searchBar.search') }}
              </ElButton>
            </div>
            <div v-if="shouldShowExpandToggle" class="filter-toggle" @click="toggleExpand">
              <span>{{ expandToggleText }}</span>
              <div class="icon-wrapper">
                <ElIcon>
                  <ArrowUpBold v-if="isExpanded" />
                  <ArrowDownBold v-else />
                </ElIcon>
              </div>
            </div>
          </div>
        </ElCol>
      </ElRow>
    </ElForm>
  </section>
</template>

<script setup lang="ts">
  import { ArrowUpBold, ArrowDownBold } from '@element-plus/icons-vue'
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

  defineOptions({ name: 'ArtSearchBar' })

  const componentMap = {
    input: ElInput, // Ô nhập liệu
    inputTag: ElInputTag, // TagÔ nhập liệu
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
  export interface SearchFormItem {
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
  interface SearchBarProps {
    /** FormDữ liệu */
    items: SearchFormItem[]
    /** mỗicộtcủaChiều rộng（ở 24 cáchBố cục） */
    span?: number
    /** Formkhốngphần tửgiankhe */
    gutter?: number
    /** Mở rộng/Thu gọn */
    isExpand?: boolean
    /** MacDinhlàphủMở rộng（chỉtại showExpand vì true vừa isExpand vì false giờsinhhiệu） */
    defaultExpanded?: boolean
    /** FormTênTagcủaViTri */
    labelPosition?: 'left' | 'right' | 'top'
    /** VanBanChiều rộng */
    labelWidth?: string | number
    /** làphủcầncầntriểnthị，Thu gọn */
    showExpand?: boolean
    /** Núttựatráiđốicănhạnchế（Formmụctiểuởbằngởnêngiá trịgiờ） */
    buttonLeftLimit?: number
    /** làphủHiển thịĐặt lạiNút */
    showReset?: boolean
    /** làphủHiển thịTimKiemNút */
    showSearch?: boolean
    /** làphủTắtTimKiemNút */
    disabledSearch?: boolean
    /** TimKiemgiờlàphủxóarửakhônggiá trị */
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
    /** LưugiữSố 0 nàyloạicóhiệusàngvịgiá trị */
    keepZero: boolean
    /** Lưugiữ false nàyloạicóhiệusàngvịgiá trị */
    keepFalse: boolean
  }

  const props = withDefaults(defineProps<SearchBarProps>(), {
    items: () => [],
    span: 6,
    gutter: 12,
    isExpand: false,
    labelPosition: 'right',
    labelWidth: '70px',
    showExpand: true,
    defaultExpanded: false,
    buttonLeftLimit: 2,
    showReset: true,
    showSearch: true,
    disabledSearch: false,
    sanitizeOutput: () => ({})
  })

  interface SearchBarEmits {
    reset: []
    search: [Record<string, any>]
  }

  const emit = defineEmits<SearchBarEmits>()

  const modelValue = defineModel<Record<string, any>>({ default: {} })
  const initialModelValue = ref<Record<string, any>>({})

  // LưutồnComponentban đầuđầuhóagiờcủaFormkhoáichiếu，dùngở reset giờkhôiphụcMacDinhsàngvịđiềuphần tử。
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

  /**
   * làphủMở rộngTrạng thái
   */
  const isExpanded = ref(props.defaultExpanded)

  const rootProps = ['label', 'labelWidth', 'key', 'type', 'hidden', 'span', 'slots']
  // TimKiemTham sốMacDinhhơnkíchvàođịađikhônggiá trị，bớtthiểuvôhiệu query Tham số。
  const sanitizeOutputOptions = computed<SanitizeOutputOptions>(() => ({
    removeEmptyString: true,
    removeEmptyArray: true,
    removeEmptyObject: true,
    removeEmptyRichText: true,
    keepZero: true,
    keepFalse: true,
    ...props.sanitizeOutput
  }))

  const getProps = (item: SearchFormItem) => {
    if (item.props) return item.props
    const props = { ...item }
    rootProps.forEach((key) => delete (props as Record<string, any>)[key])
    return props
  }

  // Lấychènkhe
  const getSlots = (item: SearchFormItem) => {
    if (!item.slots) return {}
    const validSlots: Record<string, () => any> = {}
    Object.entries(item.slots).forEach(([key, slotFn]) => {
      if (slotFn) {
        validSlots[key] = slotFn
      }
    })
    return validSlots
  }

  /**
   * LấycộtRộng span giá trị
   * liệumàn hìnhmànthướctấctrínănggiảmcấp，tránhmiễntiểumàn hìnhmàntrênFormmụcbịépthụtquatiểu
   */
  const getColSpan = (itemSpan: number | undefined, breakpoint: ResponsiveBreakpoint): number => {
    return calculateResponsiveSpan(itemSpan, span.value, breakpoint)
  }

  // TimKiemFormxóakhôngNhậpgiờKhôngLưugiữkhôngChuỗi，tránhmiễnsautiếpVui lòngcầumangmangkhôngchữđoạn。
  const normalizeFieldValue = (value: unknown) => {
    return value === '' ? undefined : value
  }

  const getFieldValue = (key: string) => modelValue.value[key]

  const setFieldValue = (key: string, value: unknown) => {
    const normalizedValue = normalizeFieldValue(value)

    if (normalizedValue === undefined) {
      delete modelValue.value[key]
      return
    }

    modelValue.value[key] = normalizedValue
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

  // TimKiemgiờCauHinhxóarửakhônggiá trị，nhưngLưugiữ 0 và false nàyloạicóhiệusàngvịđiềuphần tử。
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

  // Component
  const getComponent = (item: SearchFormItem) => {
    // Tốikhiếndùng render HàmhoặcComponentRenderTùy chỉnhComponent
    if (item.render) {
      return item.render
    }
    // khiếndùng type LấytrướcĐịnh nghĩaComponent
    const { type } = item
    return componentMap[type as keyof typeof componentMap] || componentMap['input']
  }

  /**
   * Hiển thịcủaFormmục
   */
  const visibleFormItems = computed(() => {
    const filteredItems = props.items.filter((item) => !item.hidden)
    const shouldShowLess = !props.isExpand && !isExpanded.value
    if (shouldShowLess) {
      const maxItemsPerRow = Math.floor(24 / props.span) - 1
      return filteredItems.slice(0, maxItemsPerRow)
    }
    return filteredItems
  })

  /**
   * làphủứngnênHiển thịMở rộng/Thu gọnNút
   */
  const shouldShowExpandToggle = computed(() => {
    const filteredItems = props.items.filter((item) => !item.hidden)
    return (
      !props.isExpand && props.showExpand && filteredItems.length > Math.floor(24 / props.span) - 1
    )
  })

  /**
   * Mở rộng/Thu gọnNútvănquyển
   */
  const expandToggleText = computed(() => {
    return isExpanded.value ? t('table.searchBar.collapse') : t('table.searchBar.expand')
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
   * Chuyển đổiMở rộng/Thu gọnTrạng thái
   */
  const toggleExpand = () => {
    isExpanded.value = !isExpanded.value
  }

  /**
   * XuLyĐặt lạiSuKien
   */
  const handleReset = () => {
    // Đặt lạiFormchữđoạn（UI tầng）
    formInstance.value?.resetFields()

    // khôiphụcban đầuđầuFormgiá trị，LưugiữMacDinhTimKiemđiềuphần tửmàKhônglàrútđơnxóakhông。
    Object.keys(modelValue.value).forEach((key) => {
      delete modelValue.value[key]
    })
    Object.assign(modelValue.value, cloneModelValue(initialModelValue.value))

    // Kích hoạt reset SuKien
    emit('reset')
  }

  /**
   * XuLyTimKiemSuKien
   */
  const handleSearch = () => {
    // đốingoàichỉnémraxóarửasaucủaTìmhỏiTham số，tránhmiễnGiao diện (Interface)BộđếnkhôngMảng/khôngChuỗi。
    emit('search', getSanitizedOutput())
  }

  defineExpose({
    ref: formInstance,
    validate: (...args: any[]) => formInstance.value?.validate(...args),
    reset: handleReset,
    // cho phéphứangoàibộtạitayđộngtổVui lòngcầutrướcthẳngtiếpđọcHủyxóarửasaucủaTham số。
    getOutput: getSanitizedOutput
  })

  // giảicấu props lấytiệntạimôbảntrongthẳngtiếpkhiếndùng
  const { span, gutter, labelPosition, labelWidth } = toRefs(props)
</script>

<style lang="scss" scoped>
  .art-search-bar {
    padding: 15px 20px 0;

    .action-column {
      flex: 1;
      max-width: 100%;

      .action-buttons-wrapper {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-end;
        margin-bottom: 12px;
      }

      .form-buttons {
        display: flex;
        gap: 8px;
      }

      .filter-toggle {
        display: flex;
        align-items: center;
        margin-left: 10px;
        line-height: 32px;
        color: var(--theme-color);
        cursor: pointer;
        transition: color 0.2s ease;

        &:hover {
          color: var(--ElColor-primary);
        }

        span {
          font-size: 14px;
          user-select: none;
        }

        .icon-wrapper {
          display: flex;
          align-items: center;
          margin-left: 4px;
          font-size: 14px;
          transition: transform 0.2s ease;
        }
      }
    }
  }

  // ứngkiểuTốihóa
  @media (width <= 768px) {
    .art-search-bar {
      padding: 16px 16px 0;

      .action-column {
        .action-buttons-wrapper {
          flex-direction: column;
          gap: 8px;
          align-items: stretch;

          .form-buttons {
            justify-content: center;
          }

          .filter-toggle {
            justify-content: center;
            margin-left: 0;
          }
        }
      }
    }
  }
</style>
