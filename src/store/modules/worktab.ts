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

export const useWorktabStore = defineStore(
  'worktabStore',
  () => {
    const current = ref<Partial<WorkTab>>({})
    const opened = ref<WorkTab[]>([])
    const keepAliveExclude = ref<string[]>([])

    const hasOpenedTabs = computed(() => opened.value.length > 0)
    const hasMultipleTabs = computed(() => opened.value.length > 1)
    const currentTabIndex = computed(() =>
      current.value.path ? opened.value.findIndex((tab) => tab.path === current.value.path) : -1
    )

    const findTabIndex = (path: string): number => {
      return opened.value.findIndex((tab) => tab.path === path)
    }

    const getTab = (path: string): WorkTab | undefined => {
      return opened.value.find((tab) => tab.path === path)
    }

    const isTabClosable = (tab: WorkTab): boolean => {
      return !tab.fixedTab
    }

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

    const openTab = (tab: WorkTab): void => {
      if (!tab.path) {
        console.warn('thửthửmởmởvôhiệucủaThẻ Tab')
        return
      }

      if (tab.name) {
        removeKeepAliveExclude(tab.name)
      }

      let existingIndex = -1
      if (tab.name) {
        existingIndex = opened.value.findIndex((t) => t.name === tab.name)
      }
      if (existingIndex === -1) {
        existingIndex = findTabIndex(tab.path)
      }

      if (existingIndex === -1) {
        const insertIndex = tab.fixedTab ? findFixedTabInsertIndex() : opened.value.length
        const newTab = { ...tab }

        if (tab.fixedTab) {
          opened.value.splice(insertIndex, 0, newTab)
        } else {
          opened.value.push(newTab)
        }

        current.value = newTab
      } else {
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

      opened.value.splice(targetIndex, 1)

      if (targetTab?.name) {
        addKeepAliveExclude(targetTab)
      }

      const { homePath } = useCommon()

      if (!hasOpenedTabs.value) {
        if (path !== homePath.value) {
          current.value = {}
          safeRouterPush({ path: homePath.value })
        }
        return
      }

      if (current.value.path === path) {
        const newIndex = targetIndex >= opened.value.length ? opened.value.length - 1 : targetIndex
        current.value = opened.value[newIndex]
        safeRouterPush(current.value)
      }
    }

    const removeLeft = (path: string): void => {
      const targetIndex = findTabIndex(path)

      if (targetIndex === -1) {
        console.warn(
          `thửnghiệmquanđóngtráicạnhtiêunhãntrang，nhưngmụctiêutiêunhãntrangkhôngtồntại: ${path}`
        )
        return
      }

      const leftTabs = opened.value.slice(0, targetIndex)
      const closableLeftTabs = leftTabs.filter(isTabClosable)

      if (closableLeftTabs.length === 0) {
        console.warn('Bên tráikhôngcóCó thểđóngđóngcủaThẻ Tab')
        return
      }

      markTabsToRemove(closableLeftTabs)

      opened.value = opened.value.filter(
        (tab, index) => index >= targetIndex || !isTabClosable(tab)
      )

      const targetTab = getTab(path)
      if (targetTab) {
        current.value = targetTab
      }
    }

    const removeRight = (path: string): void => {
      const targetIndex = findTabIndex(path)

      if (targetIndex === -1) {
        console.warn(
          `thửnghiệmquanđóngphảicạnhtiêunhãntrang，nhưngmụctiêutiêunhãntrangkhôngtồntại: ${path}`
        )
        return
      }

      const rightTabs = opened.value.slice(targetIndex + 1)
      const closableRightTabs = rightTabs.filter(isTabClosable)

      if (closableRightTabs.length === 0) {
        console.warn('Bên phảikhôngcóCó thểđóngđóngcủaThẻ Tab')
        return
      }

      markTabsToRemove(closableRightTabs)

      opened.value = opened.value.filter(
        (tab, index) => index <= targetIndex || !isTabClosable(tab)
      )

      const targetTab = getTab(path)
      if (targetTab) {
        current.value = targetTab
      }
    }

    const removeOthers = (path: string): void => {
      const targetTab = getTab(path)

      if (!targetTab) {
        console.warn(
          `thửnghiệmquanđóngkháckháctiêunhãntrang，nhưngmụctiêutiêunhãntrangkhôngtồntại: ${path}`
        )
        return
      }

      const otherTabs = opened.value.filter((tab) => tab.path !== path)
      const closableTabs = otherTabs.filter(isTabClosable)

      if (closableTabs.length === 0) {
        console.warn('khôngcónóanh ấyCó thểđóngđóngcủaThẻ Tab')
        return
      }

      markTabsToRemove(closableTabs)

      opened.value = opened.value.filter((tab) => tab.path === path || !isTabClosable(tab))

      current.value = targetTab
    }

    const removeAll = (): void => {
      const { homePath } = useCommon()
      const hasFixedTabs = opened.value.some((tab) => tab.fixedTab)

      const closableTabs = opened.value.filter((tab) => {
        if (!isTabClosable(tab)) return false

        return hasFixedTabs || tab.path !== homePath.value
      })

      if (closableTabs.length === 0) {
        console.warn('khôngcóCó thểđóngđóngcủaThẻ Tab')
        return
      }

      markTabsToRemove(closableTabs)

      opened.value = opened.value.filter((tab) => {
        return !isTabClosable(tab) || (!hasFixedTabs && tab.path === homePath.value)
      })

      if (!hasOpenedTabs.value) {
        current.value = {}
        safeRouterPush({ path: homePath.value })
        return
      }

      const homeTab = opened.value.find((tab) => tab.path === homePath.value)
      const targetTab = homeTab || opened.value[0]

      current.value = targetTab
      safeRouterPush(targetTab)
    }

    const addKeepAliveExclude = (tab: WorkTab): void => {
      if (!tab.keepAlive || !tab.name) return

      if (!keepAliveExclude.value.includes(tab.name)) {
        keepAliveExclude.value.push(tab.name)
      }
    }

    const removeKeepAliveExclude = (name: string): void => {
      if (!name) return

      keepAliveExclude.value = keepAliveExclude.value.filter((item) => item !== name)
    }

    const markTabsToRemove = (tabs: WorkTab[]): void => {
      tabs.forEach((tab) => {
        if (tab.name) {
          addKeepAliveExclude(tab)
        }
      })
    }

    const toggleFixedTab = (path: string): void => {
      const targetIndex = findTabIndex(path)

      if (targetIndex === -1) {
        console.warn(`thửnghiệmchuyểnđổikhôngtồntạitiêunhãntrangcủacốđịnhTrạng thái: ${path}`)
        return
      }

      const tab = { ...opened.value[targetIndex] }
      tab.fixedTab = !tab.fixedTab

      opened.value.splice(targetIndex, 1)

      if (tab.fixedTab) {
        const firstNonFixedIndex = opened.value.findIndex((t) => !t.fixedTab)
        const insertIndex = firstNonFixedIndex === -1 ? opened.value.length : firstNonFixedIndex
        opened.value.splice(insertIndex, 0, tab)
      } else {
        const fixedCount = opened.value.filter((t) => t.fixedTab).length
        opened.value.splice(fixedCount, 0, tab)
      }

      if (current.value.path === path) {
        current.value = tab
      }
    }

    const validateWorktabs = (routerInstance: Router): void => {
      try {
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

        const validTabs = opened.value.filter((tab) => isTabRouteValid(tab))

        if (validTabs.length !== opened.value.length) {
          console.warn('pháthiệnvôhiệucủaThẻ TabRouting，Đãtừđộngxóalý')
          opened.value = validTabs
        }

        const isCurrentValid = current.value && isTabRouteValid(current.value)

        if (!isCurrentValid && validTabs.length > 0) {
          console.warn('khitrướckíchsốngTagvôhiệu，ĐãtừđộngChuyển đổi')
          current.value = validTabs[0]
        } else if (!isCurrentValid) {
          current.value = {}
        }
      } catch (error) {
        console.error('nghiệmtínhTổng quan hệ thốngThẻ TabThatBai:', error)
      }
    }

    const clearAll = (): void => {
      current.value = {}
      opened.value = []
      keepAliveExclude.value = []
    }

    const getStateSnapshot = (): WorktabState => {
      return {
        current: { ...current.value },
        opened: [...opened.value],
        keepAliveExclude: [...keepAliveExclude.value]
      }
    }

    const getTabTitle = (path: string): WorkTab | undefined => {
      const tab = getTab(path)
      return tab
    }

    const updateTabTitle = (path: string, title: string): void => {
      const tab = getTab(path)
      if (tab) {
        tab.customTitle = title
      }
    }

    const resetTabTitle = (path: string): void => {
      const tab = getTab(path)
      if (tab) {
        tab.customTitle = ''
      }
    }

    return {
      current,
      opened,
      keepAliveExclude,

      hasOpenedTabs,
      hasMultipleTabs,
      currentTabIndex,

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
