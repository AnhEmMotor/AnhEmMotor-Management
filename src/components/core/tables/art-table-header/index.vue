<!-- Bảngđầubộ，Bao gồmBảngKích thước、Làm mới、Toàn màn hình、cộtCaiDat、nóanh ấyCaiDat -->
<template>
  <div class="flex-cb max-md:!block" id="art-table-header">
    <div class="flex-wrap">
      <slot name="left"></slot>
    </div>

    <div class="flex-c md:justify-end max-md:mt-3 max-sm:!hidden">
      <div
        v-if="showSearchBar != null"
        class="button"
        @click="search"
        :class="showSearchBar ? 'active !bg-theme hover:!bg-theme/80' : ''"
      >
        <ArtSvgIcon icon="ri:search-line" :class="showSearchBar ? 'text-white' : 'text-g-700'" />
      </div>
      <div
        v-if="shouldShow('refresh')"
        class="button"
        @click="refresh"
        :class="{ loading: loading && isManualRefresh }"
      >
        <ArtSvgIcon
          icon="ri:refresh-line"
          :class="loading && isManualRefresh ? 'animate-spin text-g-600' : ''"
        />
      </div>

      <ElDropdown v-if="shouldShow('size')" @command="handleTableSizeChange">
        <div class="button">
          <ArtSvgIcon icon="ri:arrow-up-down-fill" />
        </div>
        <template #dropdown>
          <ElDropdownMenu>
            <div
              v-for="item in tableSizeOptions"
              :key="item.value"
              class="table-size-btn-item [&_.el-dropdown-menu__item]:!mb-[3px] last:[&_.el-dropdown-menu__item]:!mb-0"
            >
              <ElDropdownItem
                :key="item.value"
                :command="item.value"
                :class="tableSize === item.value ? '!bg-g-300/55' : ''"
              >
                {{ item.label }}
              </ElDropdownItem>
            </div>
          </ElDropdownMenu>
        </template>
      </ElDropdown>

      <div v-if="shouldShow('fullscreen')" class="button" @click="toggleFullScreen">
        <ArtSvgIcon :icon="isFullScreen ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-line'" />
      </div>

      <!-- cộtCaiDat -->
      <ElPopover v-if="shouldShow('columns')" placement="bottom" trigger="click">
        <template #reference>
          <div class="button">
            <ArtSvgIcon icon="ri:align-right" />
          </div>
        </template>
        <div>
          <ElScrollbar max-height="380px">
            <VueDraggable
              v-model="columns"
              :disabled="false"
              filter=".fixed-column"
              :prevent-on-filter="false"
              @move="checkColumnMove"
            >
              <div
                v-for="item in columns"
                :key="item.prop || item.type"
                class="column-option flex-c"
                :class="{ 'fixed-column': item.fixed }"
              >
                <div
                  class="drag-icon mr-2 h-4.5 flex-cc text-g-500"
                  :class="item.fixed ? 'cursor-default text-g-300' : 'cursor-move'"
                >
                  <ArtSvgIcon
                    :icon="item.fixed ? 'ri:unpin-line' : 'ri:drag-move-2-fill'"
                    class="text-base"
                  />
                </div>
                <ElCheckbox
                  :model-value="getColumnVisibility(item)"
                  @update:model-value="(val) => updateColumnVisibility(item, val)"
                  :disabled="item.disabled"
                  class="flex-1 min-w-0 [&_.el-checkbox__label]:overflow-hidden [&_.el-checkbox__label]:text-ellipsis [&_.el-checkbox__label]:whitespace-nowrap"
                  >{{
                    item.label || (item.type === 'selection' ? t('table.selection') : '')
                  }}</ElCheckbox
                >
              </div>
            </VueDraggable>
          </ElScrollbar>
        </div>
      </ElPopover>
      <!-- nóanh ấyCaiDat -->
      <ElPopover v-if="shouldShow('settings')" placement="bottom" trigger="click">
        <template #reference>
          <div class="button">
            <ArtSvgIcon icon="ri:settings-line" />
          </div>
        </template>
        <div>
          <ElCheckbox v-if="showZebra" v-model="isZebra" :value="true">{{
            t('table.zebra')
          }}</ElCheckbox>
          <ElCheckbox v-if="showBorder" v-model="isBorder" :value="true">{{
            t('table.border')
          }}</ElCheckbox>
          <ElCheckbox v-if="showHeaderBackground" v-model="isHeaderBackground" :value="true">{{
            t('table.headerBackground')
          }}</ElCheckbox>
        </div>
      </ElPopover>
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, onMounted, onUnmounted } from 'vue'
  import { storeToRefs } from 'pinia'
  import { TableSizeEnum } from '@/enums/formEnum'
  import { useTableStore } from '@/store/modules/table'
  import { VueDraggable } from 'vue-draggable-plus'
  import { useI18n } from 'vue-i18n'
  import type { ColumnOption } from '@/types/component'
  import { ElScrollbar } from 'element-plus'

  defineOptions({ name: 'ArtTableHeader' })

  const { t } = useI18n()

  interface Props {
    /** vằnngựavân */
    showZebra?: boolean
    /** Viền */
    showBorder?: boolean
    /** bảngđầuNền */
    showHeaderBackground?: boolean
    /** Toàn màn hình class */
    fullClass?: string
    /** ComponentBố cục，tửComponentdanhdùngphẩysốphần */
    layout?: string
    /** Đang tải */
    loading?: boolean
    /** TimKiemlanHiển thịTrạng thái */
    showSearchBar?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    showZebra: true,
    showBorder: true,
    showHeaderBackground: true,
    fullClass: 'art-page-view',
    layout: 'search,refresh,size,fullscreen,columns,settings',
    showSearchBar: undefined
  })

  const columns = defineModel<ColumnOption[]>('columns', {
    required: false,
    default: () => []
  })

  const emit = defineEmits<{
    (e: 'refresh'): void
    (e: 'search'): void
    (e: 'update:showSearchBar', value: boolean): void
  }>()

  /**
   * LấycộtcủaHiển thịTrạng thái
   * Tốikhiếndùng visible chữđoạn，nếuquảKhôngtồntạikhiếndùng checked chữđoạn
   */
  const getColumnVisibility = (col: ColumnOption): boolean => {
    if (col.visible !== undefined) {
      return col.visible
    }
    return col.checked ?? true
  }

  /**
   * Cập nhậtcộtcủaHiển thịTrạng thái
   * cùnggiờCập nhật checked và visible chữđoạnlấyDuy trìkiêmdungtính
   */
  const updateColumnVisibility = (col: ColumnOption, value: boolean | string | number): void => {
    const boolValue = !!value
    col.checked = boolValue
    col.visible = boolValue
  }

  /** BảngKích thướcvịmụcCauHinh */
  const tableSizeOptions = [
    { value: TableSizeEnum.SMALL, label: t('table.sizeOptions.small') },
    { value: TableSizeEnum.DEFAULT, label: t('table.sizeOptions.default') },
    { value: TableSizeEnum.LARGE, label: t('table.sizeOptions.large') }
  ]

  const tableStore = useTableStore()
  const { tableSize, isZebra, isBorder, isHeaderBackground } = storeToRefs(tableStore)

  /** giảiphân layout ThuocTinh，chuyểnđổivìMảng */
  const layoutItems = computed(() => {
    return props.layout.split(',').map((item) => item.trim())
  })

  /**
   * TìmComponentlàphủứngnênHiển thị
   * @param componentName Componentdanhtên
   * @returns làphủHiển thị
   */
  const shouldShow = (componentName: string) => {
    return layoutItems.value.includes(componentName)
  }

  /**
   * Kéo thảDiđộngSuKienXuLy - PhòngthúccốđịnhcộtViTrisửabiến
   * @param evt moveSuKienDoiTuong
   * @returns làphủcho phéphứaDiđộng
   */
  const checkColumnMove = (event: any) => {
    // Kéo thảvàovàocủamụctiêu DOM nguyêntố
    const toElement = event.related as HTMLElement
    // nếuquảmụctiêuViTrilà fixed cột，Khôngcho phéphứaDiđộng
    if (toElement && toElement.classList.contains('fixed-column')) {
      return false
    }
    return true
  }

  /** TimKiemSuKienXuLy */
  const search = () => {
    // Chuyển đổiTimKiemlanHiển thịTrạng thái
    emit('update:showSearchBar', !props.showSearchBar)
    emit('search')
  }

  /** Làm mớiSuKienXuLy */
  const refresh = () => {
    isManualRefresh.value = true
    emit('refresh')
  }

  /**
   * BảngKích thướcbiếnhóaXuLy
   * @param command BảngKích thướcchiếcBáogiá trị
   */
  const handleTableSizeChange = (command: TableSizeEnum) => {
    useTableStore().setTableSize(command)
  }

  /** làphủtayđộngNhấnLàm mới */
  const isManualRefresh = ref(false)

  /** Đang tải */
  const isFullScreen = ref(false)

  /** Lưutồnnguyênđầucủa overflow Kiểu dáng，dùngởlùiraToàn màn hìnhgiờkhôiphục */
  const originalOverflow = ref('')

  /**
   * Chuyển đổiToàn màn hìnhTrạng thái
   * vàovàoToàn màn hìnhgiờsẽẨntrangmặtCuộnđiều，lùiragiờkhôiphụcnguyênTrạng thái
   */
  const toggleFullScreen = () => {
    const el = document.querySelector(`.${props.fullClass}`)
    if (!el) return

    isFullScreen.value = !isFullScreen.value

    if (isFullScreen.value) {
      // vàovàoToàn màn hình：LưutồnnguyênđầuKiểu dángđồng thờiẨnCuộnđiều
      originalOverflow.value = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      el.classList.add('el-full-screen')
      tableStore.setIsFullScreen(true)
    } else {
      // lùiraToàn màn hình：khôiphụcnguyênđầuKiểu dáng
      document.body.style.overflow = originalOverflow.value
      el.classList.remove('el-full-screen')
      tableStore.setIsFullScreen(false)
    }
  }

  /**
   * ESCphímlùiraToàn màn hìnhcủaSuKienXuLythiết bị
   * cầncầnLưutồntríchdùnglấytiệntạiComponentUnmountgiờđúngChínhDichiaLắng nghethiết bị
   */
  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isFullScreen.value) {
      toggleFullScreen()
    }
  }

  /** ComponentMountgiờDangKytoànbộSuKienLắng nghethiết bị */
  onMounted(() => {
    document.addEventListener('keydown', handleEscapeKey)
  })

  /** ComponentUnmountgiờxóalýtàinguồn */
  onUnmounted(() => {
    // DichiaSuKienLắng nghethiết bị
    document.removeEventListener('keydown', handleEscapeKey)

    // nếuquảComponenttạiToàn màn hìnhTrạng tháidướibịUnmount，khôiphụctrangmặtCuộnTrạng thái
    if (isFullScreen.value) {
      document.body.style.overflow = originalOverflow.value
      const el = document.querySelector(`.${props.fullClass}`)
      if (el) {
        el.classList.remove('el-full-screen')
      }
    }
  })
</script>

<style scoped>
  @reference '@styles/core/tailwind.css';

  .button {
    @apply ml-2 
    size-8 
    flex 
    items-center 
    justify-center 
    cursor-pointer 
    rounded-md 
    bg-g-300/55
    dark:bg-g-300/40
    text-g-700  
    hover:bg-g-300 
    md:ml-0 
    md:mr-2.5;
  }
</style>
