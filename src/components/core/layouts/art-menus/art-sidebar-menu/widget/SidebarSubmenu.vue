<template>
  <template v-for="(item, index) in filteredMenuItems" :key="getUniqueKey(item, index)">
    <ElSubMenu v-if="hasChildren(item)" :index="item.path || item.meta.title" :level="level">
      <template #title>
        <div class="menu-icon flex-cc">
          <ArtSvgIcon
            :icon="item.meta.icon"
            :color="theme?.iconColor"
            :style="{ color: theme.iconColor }"
          />
        </div>
        <span class="menu-name">
          {{ formatMenuTitle(item.meta.title) }}
        </span>
        <div v-if="item.meta.showBadge" class="art-badge" style="right: 10px" />
      </template>

      <SidebarSubmenu
        :list="item.children"
        :is-mobile="isMobile"
        :level="level + 1"
        :theme="theme"
        @close="closeMenu"
      />
    </ElSubMenu>

    <ElMenuItem
      v-else
      :index="item.path || item.name || item.meta.title"
      :level-item="level + 1"
      @click="goPage(item)"
    >
      <div class="menu-icon flex-cc">
        <ArtSvgIcon
          :icon="item.meta.icon"
          :color="theme?.iconColor"
          :style="{ color: theme.iconColor }"
        />
      </div>
      <div
        v-show="item.meta.showBadge && level === 0 && !menuOpen"
        class="art-badge"
        style="right: 5px"
      />

      <template #title>
        <span class="menu-name">
          {{ formatMenuTitle(item.meta.title) }}
        </span>
        <div v-if="item.meta.showBadge" class="art-badge" />
        <div v-if="item.meta.showTextBadge && (level > 0 || menuOpen)" class="art-text-badge">
          {{ item.meta.showTextBadge }}
        </div>
      </template>
    </ElMenuItem>
  </template>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { AppRouteRecord } from '@/types/router'
  import { formatMenuTitle } from '@/utils/router'
  import { handleMenuJump } from '@/utils/navigation'
  import { useSettingStore } from '@/store/modules/setting'

  interface MenuTheme {
    iconColor?: string
  }

  interface Props {
    /** MenuTieuDe */
    title?: string
    /** MenuDanh sách */
    list?: AppRouteRecord[]
    /** ChuDeCauHinh */
    theme?: MenuTheme
    /** làphủvìDiđộngđầumôkiểu */
    isMobile?: boolean
    /** Menutầngcấp */
    level?: number
  }

  interface Emits {
    /** đóngđóngMenuSuKien */
    (e: 'close'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    title: '',
    list: () => [],
    theme: () => ({}),
    isMobile: false,
    level: 0
  })

  const emit = defineEmits<Emits>()

  const settingStore = useSettingStore()

  const { menuOpen } = storeToRefs(settingStore)

  /**
   * qualọcsaucủaMenumụcDanh sách
   * chỉHiển thịChưaẨncủaMenumục
   */
  const filteredMenuItems = computed(() => filterRoutes(props.list))

  /**
   * nhảychuyểnđếnđịnhtrangmặt
   * @param item MenumụcDữ liệu
   */
  const goPage = (item: AppRouteRecord): void => {
    closeMenu()
    handleMenuJump(item)
  }

  /**
   * đóngđóngMenu
   * Kích hoạtchaComponentcủađóngđóngSuKien
   */
  const closeMenu = (): void => {
    emit('close')
  }

  /**
   * đoánMenumụcquyểnthânlàphủCó thểlấylàmvìCó thểNhấntrangmặtLưugiữtạiMenutrong
   */
  const isNavigableRoute = (item: AppRouteRecord): boolean => {
    return !!(
      !item.meta.isHide &&
      ((item.path && item.path.trim()) || item.meta.link || item.meta.isIframe === true) &&
      (item.component || item.meta.link || item.meta.isIframe === true)
    )
  }

  /**
   * chuyểnvềqualọcMenuRouting，DichiaẨncủaMenumục
   * nhưngnếuquảchaMenuquyểnthânthìlàCó thểTruy cậptrangmặt，làkhiếntửMenuđềubịẨncũngứngnênLưugiữ
   * @param items MenumụcMảng
   * @returns qualọcsaucủaMenumụcMảng
   */
  const filterRoutes = (items: AppRouteRecord[]): AppRouteRecord[] => {
    return items
      .filter((item) => {
        // nếuquảkhitrướcmụcbịẨn，thẳngtiếpqualọc
        if (item.meta.isHide) {
          return false
        }

        // nếuquảcótửMenu，chuyểnvềqualọctửMenu
        if (item.children && item.children.length > 0) {
          const filteredChildren = filterRoutes(item.children)
          // mụclụcMenucầncầucóHiển thịtửMenu；trangmặtMenucho phéphứachỉLưugiữtừthân
          return filteredChildren.length > 0 || isNavigableRoute(item)
        }

        // diệptửtiếtđiểmvừaChưabịẨn，Lưugiữ
        return isNavigableRoute(item)
      })
      .map((item) => ({
        ...item,
        children: item.children ? filterRoutes(item.children) : undefined
      }))
  }

  /**
   * đoánMenumụclàphủBao gồmHiển thịcủatửMenu
   * @param item MenumụcDữ liệu
   * @returns làphủBao gồmHiển thịcủatửMenu
   */
  const hasChildren = (item: AppRouteRecord): boolean => {
    if (!item.children || item.children.length === 0) {
      return false
    }
    // chuyểnvềTìmlàphủcóHiển thịcủatửMenu
    const filteredChildren = filterRoutes(item.children)
    return filteredChildren.length > 0
  }

  /**
   * đoánlàphủvìngoàibộliêntiếp
   * @param item MenumụcDữ liệu
   * @returns làphủvìngoàibộliêntiếp
   */
  const isExternalLink = (item: AppRouteRecord): boolean => {
    return !!(item.meta.link && !item.meta.isIframe)
  }

  /**
   * sinhthànhduymộtcủa key
   * khiếndùng path、title và index tổhợpĐảm bảoduymộttính
   * @param item MenumụcDữ liệu
   * @param index Chỉ mục
   * @returns duymộtcủa key
   */
  const getUniqueKey = (item: AppRouteRecord, index: number): string => {
    return `${item.path || item.meta.title || 'menu'}-${props.level}-${index}`
  }
</script>
