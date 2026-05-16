/**
 * cônglàmThẻ TabTrạng tháiQuản lýmôkhối
 *
 * gợicungđaThẻ TabcôngnăngcủaĐầy đủTrạng tháiQuản lý
 *
 * ## chủcầncôngnăng
 *
 * - Thẻ Tabmởmởvàđóngđóng
 * - Thẻ TabcốđịnhvàHủycốđịnh
 * - lôlượngđóngđóng（Bên trái、Bên phải、nóanh ấy、toànbộ）
 * - Thẻ TabCacheQuản lý（KeepAlive）
 * - Thẻ TabTieuDeTùy chỉnh
 * - Thẻ TabRoutingnghiệmtính
 * - Hoạt độngRoutingTham sốXuLy
 *
 * ## khiếndùngtrườngcảnh
 *
 * - đaThẻ TabĐiều hướng
 * - trangmặtCachekhốngchế
 * - Thẻ TabphảiphímMenu
 * - cốđịnhlệdùngtrangmặt
 * - lôlượngđóngđóngTag
 *
 * ## Cốt lõiđặctính
 *
 * - trínăngThẻ Tabphụcdùng（cùngRoutingdanhtênphụcdùng）
 * - cốđịnhThẻ TabLưuhộ（KhôngCó thểđóngđóng）
 * - KeepAlive CachexếpchiaQuản lý
 * - Routingcóhiệutínhnghiệmtính
 * - TrangChutừđộngLưugiữ
 *
 * ## trìlâuhóa
 * - khiếndùng localStorage tồntrữ
 * - tồntrữphím：sys-v{version}-worktab
 * - Làm mớitrangmặtDuy trìTagTrạng thái
 *
 * @module store/modules/worktab
 * @author Art Design Pro Team
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { router } from '@/router'
import { LocationQueryRaw, Router } from 'vue-router'
import { WorkTab } from '@/types'
import { useCommon } from '@/hooks/core/useCommon'

interface WorktabState {
  current: Partial<WorkTab>
  opened: WorkTab[]
  keepAliveExclude: string[]
}

/**
 * Bàn làm việcThẻ TabQuản lý Store
 */
export const useWorktabStore = defineStore(
  'worktabStore',
  () => {
    // Trạng tháiĐịnh nghĩa
    const current = ref<Partial<WorkTab>>({})
    const opened = ref<WorkTab[]>([])
    const keepAliveExclude = ref<string[]>([])

    // kếThuocTinh
    const hasOpenedTabs = computed(() => opened.value.length > 0)
    const hasMultipleTabs = computed(() => opened.value.length > 1)
    const currentTabIndex = computed(() =>
      current.value.path ? opened.value.findIndex((tab) => tab.path === current.value.path) : -1
    )

    /**
     * TimKiemThẻ TabChỉ mục
     */
    const findTabIndex = (path: string): number => {
      return opened.value.findIndex((tab) => tab.path === path)
    }

    /**
     * LấyThẻ Tab
     */
    const getTab = (path: string): WorkTab | undefined => {
      return opened.value.find((tab) => tab.path === path)
    }

    /**
     * TìmThẻ TablàphủCó thểđóngđóng
     */
    const isTabClosable = (tab: WorkTab): boolean => {
      return !tab.fixedTab
    }

    /**
     * antoàncủaRoutingnhảychuyển
     */
    const safeRouterPush = (tab: Partial<WorkTab>): void => {
      if (!tab.path) {
        console.warn('thửthửnhảychuyểnđếnvôhiệuđườngcủaThẻ Tab')
        return
      }

      try {
        router.push({
          path: tab.path,
          query: tab.query as LocationQueryRaw
        })
      } catch (error) {
        console.error('RoutingnhảychuyểnThatBai:', error)
      }
    }

    /**
     * mởmởhoặckíchsốngmộtchiếcvịmụcthẻ
     */
    const openTab = (tab: WorkTab): void => {
      if (!tab.path) {
        console.warn('thửthửmởmởvôhiệucủaThẻ Tab')
        return
      }

      // từ keepAlive xếpchiaDanh sáchtrongDichia
      if (tab.name) {
        removeKeepAliveExclude(tab.name)
      }

      // liệuRoutingdanhtênTimKiem（ứngđốiHoạt độngRoutingTham sốXuấtđếncủađamởhỏiđề），tìmKhôngđếnlạiliệuđườngTimKiem
      let existingIndex = -1
      if (tab.name) {
        existingIndex = opened.value.findIndex((t) => t.name === tab.name)
      }
      if (existingIndex === -1) {
        existingIndex = findTabIndex(tab.path)
      }

      if (existingIndex === -1) {
        // Thêm mớiThẻ Tab
        const insertIndex = tab.fixedTab ? findFixedTabInsertIndex() : opened.value.length
        const newTab = { ...tab }

        if (tab.fixedTab) {
          opened.value.splice(insertIndex, 0, newTab)
        } else {
          opened.value.push(newTab)
        }

        current.value = newTab
      } else {
        // Cập nhậthiệncóThẻ Tab（khiHoạt độngRoutingTham sốhoặcTìmhỏibiếnhơngiờ，phụcdùngcùngmộtTag）
        const existingTab = opened.value[existingIndex]

        opened.value[existingIndex] = {
          ...existingTab,
          path: tab.path,
          params: tab.params,
          query: tab.query,
          title: tab.title || existingTab.title,
          fixedTab: tab.fixedTab ?? existingTab.fixedTab,
          keepAlive: tab.keepAlive ?? existingTab.keepAlive,
          name: tab.name || existingTab.name,
          icon: tab.icon || existingTab.icon
        }

        current.value = opened.value[existingIndex]
      }
    }

    /**
     * TimKiemcốđịnhThẻ TabcủachènvàoViTri
     */
    const findFixedTabInsertIndex = (): number => {
      let insertIndex = 0
      for (let i = 0; i < opened.value.length; i++) {
        if (opened.value[i].fixedTab) {
          insertIndex = i + 1
        } else {
          break
        }
      }
      return insertIndex
    }

    /**
     * đóngđóngđịnhcủavịmụcthẻ
     */
    const removeTab = (path: string): void => {
      const targetTab = getTab(path)
      const targetIndex = findTabIndex(path)

      if (targetIndex === -1) {
        console.warn(`thửnghiệmquanđóngkhôngtồntạicủatiêunhãntrang: ${path}`)
        return
      }

      if (targetTab && !isTabClosable(targetTab)) {
        console.warn(`thửnghiệmquanđóngcốđịnhtiêunhãntrang: ${path}`)
        return
      }

      // từThẻ TabDanh sáchtrongDichia
      opened.value.splice(targetIndex, 1)

      // XuLyCachexếpchia
      if (targetTab?.name) {
        addKeepAliveExclude(targetTab)
      }

      const { homePath } = useCommon()

      // nếuquảđóngđóngsauvôThẻ Tab，nhảychuyểnTrangChu
      if (!hasOpenedTabs.value) {
        if (path !== homePath.value) {
          current.value = {}
          safeRouterPush({ path: homePath.value })
        }
        return
      }

      // nếuquảđóngđóngcủalàkhitrướckíchsốngTag，cầncầnkíchsốngnóanh ấyTag
      if (current.value.path === path) {
        const newIndex = targetIndex >= opened.value.length ? opened.value.length - 1 : targetIndex
        current.value = opened.value[newIndex]
        safeRouterPush(current.value)
      }
    }

    /**
     * đóngđóngBên tráivịmụcthẻ
     */
    const removeLeft = (path: string): void => {
      const targetIndex = findTabIndex(path)

      if (targetIndex === -1) {
        console.warn(
          `thửnghiệmquanđóngtráicạnhtiêunhãntrang，nhưngmụctiêutiêunhãntrangkhôngtồntại: ${path}`
        )
        return
      }

      // LấyBên tráiCó thểđóngđóngcủaThẻ Tab
      const leftTabs = opened.value.slice(0, targetIndex)
      const closableLeftTabs = leftTabs.filter(isTabClosable)

      if (closableLeftTabs.length === 0) {
        console.warn('Bên tráikhôngcóCó thểđóngđóngcủaThẻ Tab')
        return
      }

      // tiêughivìCachexếpchia
      markTabsToRemove(closableLeftTabs)

      // DichiaBên tráiCó thểđóngđóngcủaThẻ Tab
      opened.value = opened.value.filter(
        (tab, index) => index >= targetIndex || !isTabClosable(tab)
      )

      // Đảm bảokhitrướcTaglàkíchsốngTrạng thái
      const targetTab = getTab(path)
      if (targetTab) {
        current.value = targetTab
      }
    }

    /**
     * đóngđóngBên phảivịmụcthẻ
     */
    const removeRight = (path: string): void => {
      const targetIndex = findTabIndex(path)

      if (targetIndex === -1) {
        console.warn(
          `thửnghiệmquanđóngphảicạnhtiêunhãntrang，nhưngmụctiêutiêunhãntrangkhôngtồntại: ${path}`
        )
        return
      }

      // LấyBên phảiCó thểđóngđóngcủaThẻ Tab
      const rightTabs = opened.value.slice(targetIndex + 1)
      const closableRightTabs = rightTabs.filter(isTabClosable)

      if (closableRightTabs.length === 0) {
        console.warn('Bên phảikhôngcóCó thểđóngđóngcủaThẻ Tab')
        return
      }

      // tiêughivìCachexếpchia
      markTabsToRemove(closableRightTabs)

      // DichiaBên phảiCó thểđóngđóngcủaThẻ Tab
      opened.value = opened.value.filter(
        (tab, index) => index <= targetIndex || !isTabClosable(tab)
      )

      // Đảm bảokhitrướcTaglàkíchsốngTrạng thái
      const targetTab = getTab(path)
      if (targetTab) {
        current.value = targetTab
      }
    }

    /**
     * đóngđóngnóanh ấyvịmụcthẻ
     */
    const removeOthers = (path: string): void => {
      const targetTab = getTab(path)

      if (!targetTab) {
        console.warn(
          `thửnghiệmquanđóngkháckháctiêunhãntrang，nhưngmụctiêutiêunhãntrangkhôngtồntại: ${path}`
        )
        return
      }

      // Lấynóanh ấyCó thểđóngđóngcủaThẻ Tab
      const otherTabs = opened.value.filter((tab) => tab.path !== path)
      const closableTabs = otherTabs.filter(isTabClosable)

      if (closableTabs.length === 0) {
        console.warn('khôngcónóanh ấyCó thểđóngđóngcủaThẻ Tab')
        return
      }

      // tiêughivìCachexếpchia
      markTabsToRemove(closableTabs)

      // chỉLưugiữkhitrướcTagvàcốđịnhTag
      opened.value = opened.value.filter((tab) => tab.path === path || !isTabClosable(tab))

      // Đảm bảokhitrướcTaglàkíchsốngTrạng thái
      current.value = targetTab
    }

    /**
     * đóngđóngnêncóCó thểđóngđóngcủaThẻ Tab
     */
    const removeAll = (): void => {
      const { homePath } = useCommon()
      const hasFixedTabs = opened.value.some((tab) => tab.fixedTab)

      // LấyCó thểđóngđóngcủaThẻ Tab
      const closableTabs = opened.value.filter((tab) => {
        if (!isTabClosable(tab)) return false
        // nếuquảcócốđịnhTag，nêncóCó thểđóngđóngcủađềuCó thểlấyđóngđóng；Nếu khôngLưugiữTrangChu
        return hasFixedTabs || tab.path !== homePath.value
      })

      if (closableTabs.length === 0) {
        console.warn('khôngcóCó thểđóngđóngcủaThẻ Tab')
        return
      }

      // tiêughivìCachexếpchia
      markTabsToRemove(closableTabs)

      // LưugiữKhôngCó thểđóngđóngcủaThẻ TabvàTrangChu（khikhôngcócốđịnhTaggiờ）
      opened.value = opened.value.filter((tab) => {
        return !isTabClosable(tab) || (!hasFixedTabs && tab.path === homePath.value)
      })

      // XuLykíchsốngTrạng thái
      if (!hasOpenedTabs.value) {
        current.value = {}
        safeRouterPush({ path: homePath.value })
        return
      }

      // ChọnkíchsốngcủaThẻ Tab：TốiTrangChu，nólầnthứmộtchiếcCó thểdùngTag
      const homeTab = opened.value.find((tab) => tab.path === homePath.value)
      const targetTab = homeTab || opened.value[0]

      current.value = targetTab
      safeRouterPush(targetTab)
    }

    /**
     * tươngđịnhvịmụcthẻThêm mớiđến keepAlive xếpchiaDanh sáchtrong
     */
    const addKeepAliveExclude = (tab: WorkTab): void => {
      if (!tab.keepAlive || !tab.name) return

      if (!keepAliveExclude.value.includes(tab.name)) {
        keepAliveExclude.value.push(tab.name)
      }
    }

    /**
     * từ keepAlive xếpchiaDanh sáchtrongDichiađịnhComponentdanhtên
     */
    const removeKeepAliveExclude = (name: string): void => {
      if (!name) return

      keepAliveExclude.value = keepAliveExclude.value.filter((item) => item !== name)
    }

    /**
     * tươngtruyềnvàocủamộttổvịmụcthẻcủaComponentdanhtêntiêughivìxếpchiaCache
     */
    const markTabsToRemove = (tabs: WorkTab[]): void => {
      tabs.forEach((tab) => {
        if (tab.name) {
          addKeepAliveExclude(tab)
        }
      })
    }

    /**
     * Chuyển đổiđịnhThẻ TabcủacốđịnhTrạng thái
     */
    const toggleFixedTab = (path: string): void => {
      const targetIndex = findTabIndex(path)

      if (targetIndex === -1) {
        console.warn(`thửnghiệmchuyểnđổikhôngtồntạitiêunhãntrangcủacốđịnhTrạng thái: ${path}`)
        return
      }

      const tab = { ...opened.value[targetIndex] }
      tab.fixedTab = !tab.fixedTab

      // DichianguyênViTri
      opened.value.splice(targetIndex, 1)

      if (tab.fixedTab) {
        // cốđịnhTagchènvàođếnnêncócốđịnhTagcủacuốiđuôi
        const firstNonFixedIndex = opened.value.findIndex((t) => !t.fixedTab)
        const insertIndex = firstNonFixedIndex === -1 ? opened.value.length : firstNonFixedIndex
        opened.value.splice(insertIndex, 0, tab)
      } else {
        // phicốđịnhTagchènvàođếnnêncócốđịnhTagsau
        const fixedCount = opened.value.filter((t) => t.fixedTab).length
        opened.value.splice(fixedCount, 0, tab)
      }

      // Cập nhậtkhitrướcTagtríchdùng
      if (current.value.path === path) {
        current.value = tab
      }
    }

    /**
     * nghiệmtínhBàn làm việcThẻ TabcủaRoutingcóhiệutính
     */
    const validateWorktabs = (routerInstance: Router): void => {
      try {
        // Hoạt độngRoutingsoátnghiệm：TốikhiếndùngRouting name đoáncóhiệutính；Nếu khôngdùng resolve ngựaPhânTham sốhóađường
        const isTabRouteValid = (tab: Partial<WorkTab>): boolean => {
          try {
            if (tab.name) {
              const routes = routerInstance.getRoutes()
              if (routes.some((r) => r.name === tab.name)) return true
            }
            if (tab.path) {
              const resolved = routerInstance.resolve({
                path: tab.path,
                query: (tab.query as LocationQueryRaw) || undefined
              })
              return resolved.matched.length > 0
            }
            return false
          } catch {
            return false
          }
        }

        // qualọcracóhiệucủaThẻ Tab
        const validTabs = opened.value.filter((tab) => isTabRouteValid(tab))

        if (validTabs.length !== opened.value.length) {
          console.warn('pháthiệnvôhiệucủaThẻ TabRouting，Đãtừđộngxóalý')
          opened.value = validTabs
        }

        // nghiệmtínhkhitrướckíchsốngTagcủacóhiệutính
        const isCurrentValid = current.value && isTabRouteValid(current.value)

        if (!isCurrentValid && validTabs.length > 0) {
          console.warn('khitrướckíchsốngTagvôhiệu，ĐãtừđộngChuyển đổi')
          current.value = validTabs[0]
        } else if (!isCurrentValid) {
          current.value = {}
        }
      } catch (error) {
        console.error('nghiệmtínhBàn làm việcThẻ TabThatBai:', error)
      }
    }

    /**
     * xóakhôngnêncóTrạng thái（dùngởđăngrabằngtrườngcảnh）
     */
    const clearAll = (): void => {
      current.value = {}
      opened.value = []
      keepAliveExclude.value = []
    }

    /**
     * LấyTrạng tháikhoáichiếu（dùngởtrìlâuhóatồntrữ）
     */
    const getStateSnapshot = (): WorktabState => {
      return {
        current: { ...current.value },
        opened: [...opened.value],
        keepAliveExclude: [...keepAliveExclude.value]
      }
    }

    /**
     * LấyThẻ TabTieuDe
     */
    const getTabTitle = (path: string): WorkTab | undefined => {
      const tab = getTab(path)
      return tab
    }

    /**
     * Cập nhậtThẻ TabTieuDe
     */
    const updateTabTitle = (path: string, title: string): void => {
      const tab = getTab(path)
      if (tab) {
        tab.customTitle = title
      }
    }

    /**
     * Đặt lạiThẻ TabTieuDe
     */
    const resetTabTitle = (path: string): void => {
      const tab = getTab(path)
      if (tab) {
        tab.customTitle = ''
      }
    }

    return {
      // Trạng thái
      current,
      opened,
      keepAliveExclude,

      // kếThuocTinh
      hasOpenedTabs,
      hasMultipleTabs,
      currentTabIndex,

      // PhuongThuc
      openTab,
      removeTab,
      removeLeft,
      removeRight,
      removeOthers,
      removeAll,
      toggleFixedTab,
      validateWorktabs,
      clearAll,
      getStateSnapshot,

      // Công cụPhuongThuc
      findTabIndex,
      getTab,
      isTabClosable,
      addKeepAliveExclude,
      removeKeepAliveExclude,
      markTabsToRemove,
      getTabTitle,
      updateTabTitle,
      resetTabTitle
    }
  },
  {
    persist: {
      key: 'worktab',
      storage: localStorage
    }
  }
)
