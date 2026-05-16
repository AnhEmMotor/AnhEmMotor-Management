<!-- BảngComponent -->
<!-- chiếctrì：el-table toànbộThuocTinh、SuKien、chènkhe，cùngChính thứcTaiLieuviếtpháp -->
<!-- mởtriểncôngnăng：Phân trangComponent、RenderTùy chỉnhcột、loading、BảngtoànbộViền、vằnngựavân、Bảngthướctấc、bảngđầuNềnCauHinh -->
<!-- Lấy ref：MacDinhlộlộrồi elTableRef ngoàibộthông qua ref.value.elTableRef Có thểlấyđiềudùng el-table PhuongThuc -->
<template>
  <div class="art-table" :class="{ 'is-empty': isEmpty }" :style="containerHeight">
    <ElTable ref="elTableRef" v-loading="!!loading" v-bind="mergedTableProps">
      <template v-for="col in columns" :key="col.prop || col.type">
        <!-- Rendertoànbộthứsốcột -->
        <ElTableColumn v-if="col.type === 'globalIndex'" v-bind="{ ...col }">
          <template #default="{ $index }">
            <span>{{ getGlobalIndex($index) }}</span>
          </template>
        </ElTableColumn>

        <!-- RenderMở rộngdòng -->
        <ElTableColumn v-else-if="col.type === 'expand'" v-bind="cleanColumnProps(col)">
          <template #default="{ row }">
            <component :is="col.formatter ? col.formatter(row) : null" />
          </template>
        </ElTableColumn>

        <!-- Renderphổthôngcột -->
        <ElTableColumn v-else v-bind="cleanColumnProps(col)">
          <template v-if="col.useHeaderSlot && col.prop" #header="headerScope">
            <slot
              :name="col.headerSlotName || `${col.prop}-header`"
              v-bind="{ ...headerScope, prop: col.prop, label: col.label }"
            >
              {{ col.label }}
            </slot>
          </template>
          <template v-if="col.useSlot && col.prop" #default="slotScope">
            <slot
              v-if="shouldRenderSlotScope(slotScope)"
              :name="col.slotName || col.prop"
              v-bind="{
                ...slotScope,
                prop: col.prop,
                value: col.prop ? slotScope.row[col.prop] : undefined
              }"
            />
          </template>
        </ElTableColumn>
      </template>

      <template v-if="$slots.default" #default><slot /></template>

      <template #empty>
        <div v-if="loading"></div>
        <ElEmpty v-else :description="emptyText" :image-size="120" />
      </template>
    </ElTable>

    <div
      class="pagination custom-pagination"
      v-if="showPagination"
      :class="mergedPaginationOptions?.align"
      ref="paginationRef"
    >
      <ElPagination
        v-bind="mergedPaginationOptions"
        :total="pagination?.total"
        :disabled="loading"
        :page-size="pagination?.size"
        :current-page="pagination?.current"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, nextTick, watchEffect, getCurrentInstance, useAttrs } from 'vue'
  import type { ElTable, TableProps } from 'element-plus'
  import { storeToRefs } from 'pinia'
  import { ColumnOption } from '@/types'
  import { useTableStore } from '@/store/modules/table'
  import { useCommon } from '@/hooks/core/useCommon'
  import { useTableHeight } from '@/hooks/core/useTableHeight'
  import { useResizeObserver, useWindowSize } from '@vueuse/core'

  defineOptions({ name: 'ArtTable' })

  const { width } = useWindowSize()
  const elTableRef = ref<InstanceType<typeof ElTable> | null>(null)
  const paginationRef = ref<HTMLElement>()
  const tableHeaderRef = ref<HTMLElement>()
  const tableStore = useTableStore()
  const { isBorder, isZebra, tableSize, isFullScreen, isHeaderBackground } = storeToRefs(tableStore)

  /** Phân trangCauHinhGiao diện (Interface) */
  interface PaginationConfig {
    /** khitrướctrangmã */
    current: number
    /** mỗitrangHiển thịđiềumụcchiếcsố */
    size: number
    /** tổngđiềumụcsố */
    total: number
  }

  /** Phân trangthiết bịCauHinhvịmụcGiao diện (Interface) */
  interface PaginationOptions {
    /** mỗitrangHiển thịchiếcsốBộ chọncủavịmụcDanh sách */
    pageSizes?: number[]
    /** Phân trangthiết bịcủađốicănphươngkiểu */
    align?: 'left' | 'center' | 'right'
    /** Phân trangthiết bịcủaBố cục */
    layout?: string
    /** làphủHiển thịPhân trangthiết bịNền */
    background?: boolean
    /** chỉcómộttranggiờlàphủẨnPhân trangthiết bị */
    hideOnSinglePage?: boolean
    /** Phân trangthiết bịcủaKích thước */
    size?: 'small' | 'default' | 'large'
    /** Phân trangthiết bịcủatrangmãSố lượng */
    pagerCount?: number
  }

  /** ArtTable Componentcủa Props Giao diện (Interface) */
  interface ArtTableProps extends TableProps<Record<string, any>> {
    /** LoadingTrạng thái */
    loading?: boolean
    /** cộtRenderCauHinh */
    columns?: ColumnOption[]
    /** Phân trangTrạng thái */
    pagination?: PaginationConfig
    /** Phân trangCauHinh */
    paginationOptions?: PaginationOptions
    /** khôngDữ liệuBảngChiều cao */
    emptyHeight?: string
    /** khôngDữ liệugiờHiển thịcủavănquyển */
    emptyText?: string
    /** làphủmởbật ArtTableHeader，giảiBảngChiều caotừthíchứnghỏiđề */
    showTableHeader?: boolean
  }

  const props = withDefaults(defineProps<ArtTableProps>(), {
    columns: () => [],
    fit: true,
    showHeader: true,
    stripe: undefined,
    border: undefined,
    size: undefined,
    emptyHeight: '100%',
    emptyText: 'TạmvôDữ liệu',
    showTableHeader: true
  })
  const instance = getCurrentInstance()
  const attrs = useAttrs()

  const LAYOUT = {
    MOBILE: 'prev, pager, next, sizes, jumper, total',
    IPAD: 'prev, pager, next, jumper, total',
    DESKTOP: 'total, prev, pager, next, sizes, jumper'
  }

  const layout = computed(() => {
    if (width.value < 768) {
      return LAYOUT.MOBILE
    } else if (width.value < 1024) {
      return LAYOUT.IPAD
    } else {
      return LAYOUT.DESKTOP
    }
  })

  // MacDinhPhân tranglệlượng
  const DEFAULT_PAGINATION_OPTIONS: PaginationOptions = {
    pageSizes: [10, 20, 30, 50, 100],
    align: 'center',
    background: true,
    layout: layout.value,
    hideOnSinglePage: false,
    size: 'default',
    pagerCount: width.value > 1200 ? 7 : 5
  }

  // hợpđồng thờiPhân trangCauHinh
  const mergedPaginationOptions = computed(() => ({
    ...DEFAULT_PAGINATION_OPTIONS,
    ...props.paginationOptions
  }))

  // Viền (Tốicấp：props > store)
  const border = computed(() => props.border ?? isBorder.value)
  // vằnngựavân
  const stripe = computed(() => props.stripe ?? isZebra.value)
  // Bảngthướctấc
  const size = computed(() => props.size ?? tableSize.value)
  // Dữ liệulàphủvìkhông
  const isEmpty = computed(() => props.data?.length === 0)

  const paginationHeight = ref(0)
  const tableHeaderHeight = ref(0)

  // khiếndùng useResizeObserver Lắng nghePhân trangthiết bịChiều caobiếnhóa
  useResizeObserver(paginationRef, (entries) => {
    const entry = entries[0]
    if (entry) {
      // khiếndùng requestAnimationFrame tránhmiễn ResizeObserver loop CanhBao
      requestAnimationFrame(() => {
        paginationHeight.value = entry.contentRect.height
      })
    }
  })

  // khiếndùng useResizeObserver Lắng ngheBảngđầubộChiều caobiếnhóa
  useResizeObserver(tableHeaderRef, (entries) => {
    const entry = entries[0]
    if (entry) {
      // khiếndùng requestAnimationFrame tránhmiễn ResizeObserver loop CanhBao
      requestAnimationFrame(() => {
        tableHeaderHeight.value = entry.contentRect.height
      })
    }
  })

  // Phân trangthiết bịvớiBảngcủagiancủagianlệlượng（kếThuocTinh，ứng showTableHeader biếnhóa）
  const PAGINATION_SPACING = computed(() => (props.showTableHeader ? 6 : 15))

  // khiếndùngBảngChiều caokế Hook
  const { containerHeight } = useTableHeight({
    showTableHeader: computed(() => props.showTableHeader),
    paginationHeight,
    tableHeaderHeight,
    paginationSpacing: PAGINATION_SPACING
  })

  // BảngChiều caoLogic
  const height = computed(() => {
    // Toàn màn hìnhmôkiểudướichiếmđầyToàn màn hình
    if (isFullScreen.value) return '100%'
    // khôngDữ liệuvừaphiLoadingTrạng tháigiờcốđịnhChiều cao
    if (isEmpty.value && !props.loading) return props.emptyHeight
    // khiếndùngtruyềnvàocủaChiều cao
    if (props.height) return props.height
    // MacDinhchiếmđầyContainerChiều cao
    return '100%'
  })

  // bảngđầuNềnMàu sắcKiểu dáng
  const headerCellStyle = computed(() => ({
    background: isHeaderBackground.value
      ? 'var(--el-fill-color-lighter)'
      : 'var(--default-box-color)',
    ...(props.headerCellStyle || {}) // hợpđồng thờiNguoiDungtruyềnvàocủaKiểu dáng
  }))

  // chỉcóHiểnkiểutruyềnvàogiờmớiphủlấp ElTable củanguyênsinhMacDinhgiá trị，tránhmiễntiếpthừacủa Boolean props chiếcChính thứcMacDinhgiá trịxung。
  const hasExplicitTableProp = (propName: string): boolean => {
    const rawProps = (instance?.vnode.props || {}) as Record<string, unknown>
    const kebabName = propName.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
    return propName in rawProps || kebabName in rawProps
  }

  const mergedTableProps = computed(() => ({
    ...attrs,
    ...props,
    height: height.value,
    stripe: stripe.value,
    border: border.value,
    size: size.value,
    headerCellStyle: headerCellStyle.value,
    // Element Plus MacDinhgiá trịvì true，ChưaHiểnkiểutruyềnvàogiờKhôngứngbị ArtTable phủlấpthành false。
    selectOnIndeterminate: hasExplicitTableProp('selectOnIndeterminate')
      ? props.selectOnIndeterminate
      : undefined
  }))

  // làphủHiển thịPhân trangthiết bị
  const showPagination = computed(() => props.pagination && !isEmpty.value)

  // Element Plus tạibộphầntrườngcảnhsẽdùng $index = -1 vàodòngtrướcRender。
  // nàyđốiphổthôngtriểnthịvôảnh，nhưngsẽđể ElForm LỗiDangKyra lineList.-1.xxx nàyloạichữđoạn。
  const shouldRenderSlotScope = (slotScope: { $index?: number }) => {
    return slotScope.$index === undefined || slotScope.$index >= 0
  }

  // xóalýcộtThuocTinh，DichiachènkheđóngcủaTùy chỉnhThuocTinh，Đảm bảonóchúngKhôngsẽbị ElTableColumn Lỗigiảigiải
  const cleanColumnProps = (col: ColumnOption) => {
    const columnProps = { ...col }
    // XóaTùy chỉnhcủachènkhekhốngchếThuocTinh
    delete columnProps.useHeaderSlot
    delete columnProps.headerSlotName
    delete columnProps.useSlot
    delete columnProps.slotName
    return columnProps
  }

  // Phân trangKích thướcbiếnhóa
  const handleSizeChange = (val: number) => {
    emit('pagination:size-change', val)
  }

  // Phân trangkhitrướctrangbiếnhóa
  const handleCurrentChange = (val: number) => {
    emit('pagination:current-change', val)
    scrollToTop() // trangmãsửabiếnsauCuộnđếnBảngPhía trên
  }

  const { scrollToTop: scrollPageToTop } = useCommon()

  // CuộnBảngNoiDungđếnPhía trên，đồng thờiCó thểlấyliênđộngtrangmặtCuộnđếnPhía trên
  const scrollToTop = () => {
    nextTick(() => {
      elTableRef.value?.setScrollTop(0) // Cuộn ElTable trongbộCuộnđiềuđếnPhía trên
      scrollPageToTop() // điềudùngcôngcộng composable CuộntrangmặtđếnPhía trên
    })
  }

  // toànbộthứsố
  const getGlobalIndex = (index: number) => {
    if (!props.pagination) return index + 1
    const { current, size } = props.pagination
    return (current - 1) * size + index + 1
  }

  const emit = defineEmits<{
    (e: 'pagination:size-change', val: number): void
    (e: 'pagination:current-change', val: number): void
  }>()

  // TimKiemđồng thờiLiênđịnhBảngđầubộnguyêntố - khiếndùng VueUse Tốihóa
  const findTableHeader = () => {
    if (!props.showTableHeader) {
      tableHeaderRef.value = undefined
      return
    }

    const tableHeader = document.getElementById('art-table-header')
    if (tableHeader) {
      tableHeaderRef.value = tableHeader
    } else {
      // nếuquảtìmKhôngđếnBảngđầubộ，CaiDatvì undefined，useElementSize sẽQuay lại 0
      tableHeaderRef.value = undefined
    }
  }

  watchEffect(
    () => {
      // Truy cậpứngkiểuDữ liệulấyxâylậpylạitruyvết
      void props.data?.length // truyvếtDữ liệubiếnhóa
      const shouldShow = props.showTableHeader

      // chỉcótạicầncầnHiển thịBảngđầubộgiờmớiTimKiem
      if (shouldShow) {
        nextTick(() => {
          findTableHeader()
        })
      } else {
        // KhôngHiển thịgiờxóakhôngtríchdùng
        tableHeaderRef.value = undefined
      }
    },
    { flush: 'post' }
  )

  defineExpose({
    scrollToTop,
    elTableRef
  })
</script>

<style lang="scss" scoped>
  @use './style';
</style>
