/**
 * MenuTrạng tháiQuản lýmôkhối
 *
 * gợicungMenuDữ liệuvàHoạt độngRoutingcủaTrạng tháiQuản lý
 *
 * ## chủcầncôngnăng
 *
 * - MenuDanh sáchtồntrữvàQuản lý
 * - TrangChuđườngCauHinh
 * - Hoạt độngRoutingDangKyvàDichia
 * - RoutingDichiaHàmQuản lý
 * - MenuChiều rộngCauHinh
 *
 * ## khiếndùngtrườngcảnh
 *
 * - Hoạt độngMenuLoadingvàRender
 * - RoutingQuyenHankhốngchế
 * - TrangChuđườngHoạt độngCaiDat
 * - đăngragiờxóalýHoạt độngRouting
 *
 * ## cônglàmchuyểntrình
 *
 * 1. LấyMenuDữ liệu（trướcđầu/sauđầumôthức）
 * 2. CaiDatMenuDanh sáchvàTrangChuđường
 * 3. DangKyHoạt độngRoutingđồng thờiLưutồnDichiaHàm
 * 4. đăngragiờđiềudùngDichiaHàmxóalýRouting
 *
 * @module store/modules/menu
 * @author Art Design Pro Team
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AppRouteRecord } from '@/types/router'
import { getFirstMenuPath } from '@/utils'
import { HOME_PAGE_PATH } from '@/router'

/**
 * MenuTrạng tháiQuản lý
 * Quản lýỨng dụngcủaMenuDanh sách、TrangChuđường、MenuChiều rộngvàHoạt độngRoutingDichiaHàm
 */
export const useMenuStore = defineStore('menuStore', () => {
  /** TrangChuđường */
  const homePath = ref(HOME_PAGE_PATH)
  /** MenuDanh sách */
  const menuList = ref<AppRouteRecord[]>([])
  /** MenuChiều rộng */
  const menuWidth = ref('')
  /** tồntrữRoutingDichiaHàmcủaMảng */
  const removeRouteFns = ref<(() => void)[]>([])

  /**
   * CaiDatMenuDanh sách
   * @param list MenuRoutingGhi chépMảng
   */
  const setMenuList = (list: AppRouteRecord[]) => {
    menuList.value = list
    setHomePath(HOME_PAGE_PATH || getFirstMenuPath(list))
  }

  /**
   * LấyTrangChuđường
   * @returns TrangChuđườngChuỗi
   */
  const getHomePath = () => homePath.value

  /**
   * CaiDatchủtrangđường
   * @param path chủtrangđường
   */
  const setHomePath = (path: string) => {
    homePath.value = path
  }

  /**
   * Thêm mớiRoutingDichiaHàm
   * @param fns cầnThêm mớicủaRoutingDichiaHàmMảng
   */
  const addRemoveRouteFns = (fns: (() => void)[]) => {
    removeRouteFns.value.push(...fns)
  }

  /**
   * DichianêncóHoạt độngRouting
   * ThựcdòngnêncótồntrữcủaRoutingDichiaHàmđồng thờixóakhôngMảng
   */
  const removeAllDynamicRoutes = () => {
    removeRouteFns.value.forEach((fn) => fn())
    removeRouteFns.value = []
  }

  /**
   * xóakhôngRoutingDichiaHàmMảng
   */
  const clearRemoveRouteFns = () => {
    removeRouteFns.value = []
  }

  return {
    menuList,
    menuWidth,
    removeRouteFns,
    setMenuList,
    getHomePath,
    setHomePath,
    addRemoveRouteFns,
    removeAllDynamicRoutes,
    clearRemoveRouteFns
  }
})
