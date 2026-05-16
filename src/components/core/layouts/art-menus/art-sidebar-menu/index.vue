<!-- Bên tráiMenu hoặc đôicộtMenu -->
<template>
  <div
    class="layout-sidebar"
    v-if="showLeftMenu || isDualMenu"
    :class="{ 'no-border': menuList.length === 0 }"
  >
    <!-- đôicộtMenu（Bên trái） -->
    <div
      v-if="isDualMenu"
      class="dual-menu-left"
      :style="{ width: dualMenuShowText ? '80px' : '64px', background: getMenuTheme.background }"
    >
      <ArtLogo class="logo" @click="navigateToHome" />

      <ElScrollbar style="height: calc(100% - 135px)">
        <ul>
          <li v-for="menu in firstLevelMenus" :key="menu.path" @click="handleMenuJump(menu, true)">
            <ElTooltip
              class="box-item"
              effect="dark"
              :content="$t(menu.meta.title)"
              placement="right"
              :offset="15"
              :hide-after="0"
              :disabled="dualMenuShowText"
            >
              <div
                :class="{
                  'is-active': menu.meta.isFirstLevel
                    ? menu.path === route.path
                    : menu.path === firstLevelMenuPath
                }"
                :style="{
                  height: dualMenuShowText ? '60px' : '46px'
                }"
              >
                <ArtSvgIcon
                  class="menu-icon text-g-700 dark:text-g-800"
                  :icon="menu.meta.icon"
                  :style="{
                    marginBottom: dualMenuShowText ? '5px' : '0'
                  }"
                />
                <span v-if="dualMenuShowText" class="text-md text-g-700">
                  {{ $t(menu.meta.title) }}
                </span>
                <div v-if="menu.meta.showBadge" class="art-badge art-badge-dual" />
              </div>
            </ElTooltip>
          </li>
        </ul>
      </ElScrollbar>

      <ArtIconButton
        class="switch-btn size-10"
        icon="ri:arrow-left-right-fill"
        @click="toggleDualMenuMode"
      />
    </div>

    <!-- Bên tráiMenu || đôicộtMenu（Bên phải） -->
    <div
      v-show="menuList.length > 0"
      class="menu-left"
      :class="`menu-left-${getMenuTheme.theme} menu-left-${!menuOpen ? 'close' : 'open'}`"
      :style="{ background: getMenuTheme.background }"
    >
      <!-- Logo、HeThongdanhtên -->
      <div
        class="header"
        @click="navigateToHome"
        :style="{
          background: getMenuTheme.background
        }"
      >
        <ArtLogo v-if="!isDualMenu" class="logo" />

        <p
          :class="{ 'is-dual-menu-name': isDualMenu }"
          :style="{
            color: getMenuTheme.systemNameColor,
            opacity: !menuOpen ? 0 : 1
          }"
        >
          {{ AppConfig.systemInfo.name }}
        </p>
      </div>
      <ElScrollbar :style="scrollbarStyle">
        <ElMenu
          :class="'el-menu-' + getMenuTheme.theme"
          :collapse="!menuOpen"
          :default-active="routerPath"
          :text-color="getMenuTheme.textColor"
          :unique-opened="uniqueOpened"
          :background-color="getMenuTheme.background"
          :default-openeds="defaultOpenedMenus"
          :popper-class="`menu-left-popper menu-left-${getMenuTheme.theme}-popper`"
          :show-timeout="50"
          :hide-timeout="50"
        >
          <SidebarSubmenu
            :list="menuList"
            :isMobile="isMobileMode"
            :theme="getMenuTheme"
            @close="handleMenuClose"
          />
        </ElMenu>
      </ElScrollbar>

      <!-- đôicộtMenuBên phảiNút -->
      <div class="dual-menu-collapse-btn" v-if="isDualMenu" @click="toggleMenuVisibility">
        <ArtSvgIcon
          class="text-g-500/70"
          :icon="menuOpen ? 'ri:arrow-left-wide-fill' : 'ri:arrow-right-wide-fill'"
        />
      </div>

      <div
        class="menu-model"
        @click="toggleMenuVisibility"
        :style="{
          opacity: !menuOpen ? 0 : 1,
          transform: showMobileModal ? 'scale(1)' : 'scale(0)'
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import AppConfig from '@/config'
  import { useSettingStore } from '@/store/modules/setting'
  import { MenuTypeEnum, MenuWidth } from '@/enums/appEnum'
  import { useMenuStore } from '@/store/modules/menu'
  import { isIframe } from '@/utils/navigation'
  import { handleMenuJump } from '@/utils/navigation'
  import SidebarSubmenu from './widget/SidebarSubmenu.vue'
  import { useCommon } from '@/hooks/core/useCommon'
  import { useWindowSize, useTimeoutFn } from '@vueuse/core'

  defineOptions({ name: 'ArtSidebarMenu' })

  const MOBILE_BREAKPOINT = 800
  const ANIMATION_DELAY = 350
  const MENU_CLOSE_WIDTH = MenuWidth.CLOSE

  const route = useRoute()
  const router = useRouter()
  const settingStore = useSettingStore()

  const { getMenuOpenWidth, menuType, uniqueOpened, dualMenuShowText, menuOpen, getMenuTheme } =
    storeToRefs(settingStore)

  // ComponenttrongbộTrạng thái
  const defaultOpenedMenus = ref<string[]>([])
  const isMobileMode = ref(false)
  const showMobileModal = ref(false)

  // khiếndùng VueUse củasổdiệnthướctấcLắng nghe
  const { width } = useWindowSize()

  // MenuChiều rộngđóng
  const menuopenwidth = computed(() => getMenuOpenWidth.value)
  const menuclosewidth = computed(() => MENU_CLOSE_WIDTH)

  // Menuloạikiểuđoán
  const isTopLeftMenu = computed(() => menuType.value === MenuTypeEnum.TOP_LEFT)
  const showLeftMenu = computed(
    () => menuType.value === MenuTypeEnum.LEFT || menuType.value === MenuTypeEnum.TOP_LEFT
  )
  const isDualMenu = computed(() => menuType.value === MenuTypeEnum.DUAL_MENU)

  // Diđộngđầumàn hìnhmànđoán（khiếndùng computed tránhmiễntrùngphụckế）
  const isMobileScreen = computed(() => width.value < MOBILE_BREAKPOINT)

  // Routingđóng
  const firstLevelMenuPath = computed(() => route.matched[0]?.path)
  const routerPath = computed(() => String(route.meta.activePath || route.path))

  // MenuDữ liệu
  const firstLevelMenus = computed(() => {
    return useMenuStore().menuList.filter((menu) => !menu.meta.isHide)
  })

  const menuList = computed(() => {
    const menuStore = useMenuStore()
    const allMenus = menuStore.menuList

    // nếuquảKhônglàPhía trênBên tráiMenuhoặcđôicộtMenu，thẳngtiếpQuay lạiĐầy đủMenuDanh sách
    if (!isTopLeftMenu.value && !isDualMenu.value) {
      return allMenus
    }

    // XuLy iframe đường
    if (isIframe(route.path)) {
      return findIframeMenuList(route.path, allMenus)
    }

    // XuLymộtcấpMenu
    if (route.meta.isFirstLevel) {
      return []
    }

    // Quay lạikhitrướccấpđườngđốiứngcủatửMenu
    const currentTopPath = `/${route.path.split('/')[1]}`
    const currentMenu = allMenus.find((menu) => menu.path === currentTopPath)
    return currentMenu?.children ?? []
  })

  // đôicộtMenuThu gọngiờcủaCuộnđiềuKiểu dáng
  const scrollbarStyle = computed(() => {
    const isCollapsed = isDualMenu.value && !menuOpen.value
    return {
      transform: isCollapsed ? 'translateY(-50px)' : 'translateY(0)',
      height: isCollapsed ? 'calc(100% + 50px)' : 'calc(100% - 60px)',
      transition: 'transform 0.3s ease'
    }
  })

  /**
   * ẨnDiđộngđầumôtháiKhung（khiếndùng VueUse của useTimeoutFn）
   */
  const { start: delayHideMobileModal } = useTimeoutFn(
    () => {
      showMobileModal.value = false
    },
    ANIMATION_DELAY,
    { immediate: false }
  )

  /**
   * TimKiem iframe đốiứngcủahaicấpMenuDanh sách
   */
  const findIframeMenuList = (currentPath: string, menuList: any[]) => {
    // chuyểnvềTimKiemBao gồmkhitrướcđườngcủaMenumục
    const hasPath = (items: any[]): boolean => {
      for (const item of items) {
        if (item.path === currentPath) {
          return true
        }
        if (item.children && hasPath(item.children)) {
          return true
        }
      }
      return false
    }

    // khắpLịchmộtcấpMenuTimKiemngựaPhâncủatửMenu
    for (const menu of menuList) {
      if (menu.children && hasPath(menu.children)) {
        return menu.children
      }
    }
    return []
  }

  const { homePath } = useCommon()

  /**
   * Điều hướngđếnTrangChu
   */
  const navigateToHome = (): void => {
    router.push(homePath.value)
  }

  /**
   * chuyểnđổiMenuHiểnthị/ẩngiấu
   */
  const toggleMenuVisibility = (): void => {
    settingStore.setMenuOpen(!menuOpen.value)

    // DiđộngđầumôtháiKhungkhốngchếLogic
    if (isMobileScreen.value) {
      if (!menuOpen.value) {
        // Menulàtươngmởmở，lậplàHiển thịmôtháiKhung
        showMobileModal.value = true
      } else {
        // Menulàtươngđóngđóng，ẨnmôtháiKhungĐảm bảoHoatAnhhoànthành
        delayHideMobileModal()
      }
    }
  }

  /**
   * XuLyMenuđóngđóng（đếntừtửComponent）
   */
  const handleMenuClose = (): void => {
    if (isMobileScreen.value) {
      settingStore.setMenuOpen(false)
      delayHideMobileModal()
    }
  }

  /**
   * Chuyển đổiđôicộtMenumôkiểu
   */
  const toggleDualMenuMode = (): void => {
    settingStore.setDualMenuShowText(!dualMenuShowText.value)
  }

  /**
   * Lắng nghesổdiệnthướctấcbiếnhóa，từđộngXuLyDiđộngđầuMenu
   */
  watch(width, (newWidth) => {
    if (newWidth < MOBILE_BREAKPOINT) {
      settingStore.setMenuOpen(false)
      if (!menuOpen.value) {
        showMobileModal.value = false
      }
    } else {
      showMobileModal.value = false
    }
  })

  /**
   * Lắng ngheMenuCông tắcTrạng tháibiếnhóa
   */
  watch(menuOpen, (isMenuOpen: boolean) => {
    if (!isMobileScreen.value) {
      // đạimàn hìnhmànthiếtđặttrên，môtháiKhungđầucuốiẨn
      showMobileModal.value = false
    } else {
      // tiểumàn hìnhmànthiếtđặttrên，liệuMenuTrạng tháikhốngchếmôtháiKhung
      if (isMenuOpen) {
        // MenumởmởgiờlậplàHiển thịmôtháiKhung
        showMobileModal.value = true
      } else {
        // MenuđóngđónggiờẨnmôtháiKhung，Đảm bảoHoatAnhhoànthành
        delayHideMobileModal()
      }
    }
  })
</script>

<style lang="scss" scoped>
  @use './style';
</style>

<style lang="scss">
  @use './theme';

  .layout-sidebar {
    // Mở rộngcủaChiều rộng
    .el-menu:not(.el-menu--collapse) {
      width: v-bind(menuopenwidth);
    }

    // sauChiều rộng
    .el-menu--collapse {
      width: v-bind(menuclosewidth);
    }
  }
</style>
