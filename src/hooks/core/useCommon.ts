/**
 * useCommon - thôngdùngcôngnăngtậphợp
 *
 * gợicunglệdùngcủatrangmặtHanhDongcôngnăng，baobaotrangmặtLàm mới、Cuộnkhốngchế、đườngLấybằng。
 * nàyvàicôngnăngtạiđachiếctrangmặtvàComponenttrongđềusẽdùngđến，thốngmộtphongtiệnởphụcdùng。
 *
 * ## chủcầncôngnăng
 *
 * 1. TrangChuđường - LấyHeThongCauHinhcủaTrangChuđường
 * 2. trangmặtLàm mới - Làm mớikhitrướctrangmặtNoiDung
 * 3. Cuộnkhốngchế - gợicungđaloạiCuộnđếnPhía trênvàđịnhViTricủaPhuongThuc
 * 4. trượtCuộn - chiếctrìtrượtCuộnHoatAnhHiệu quả
 *
 * @module useCommon
 * @author Art Design Pro Team
 */

import { computed } from 'vue'
import { useMenuStore } from '@/store/modules/menu'
import { useSettingStore } from '@/store/modules/setting'

export function useCommon() {
  const menuStore = useMenuStore()
  const settingStore = useSettingStore()

  /**
   * TrangChuđường
   * từMenu store trongLấyCauHinhcủaTrangChuđường
   */
  const homePath = computed(() => menuStore.getHomePath())

  /**
   * Làm mớikhitrướctrangmặt
   * thông quaChuyển đổi setting store trongcủa refresh Trạng tháiKích hoạttrangmặttrùngmớiRender
   */
  const refresh = () => {
    settingStore.reload()
  }

  /**
   * CuộnđếntrangmặtPhía trên
   * TimKiemchủNoiDungđồngTênđồng thờitươngnóCuộnViTriĐặt lạivìPhía trên
   */
  const scrollToTop = () => {
    const scrollContainer = document.getElementById('app-main')
    if (scrollContainer) {
      scrollContainer.scrollTop = 0
    }
  }

  /**
   * trượtCuộnđếntrangmặtPhía trên
   * khiếndùng smooth dòngvìthựchiệntrượtCuộnHiệu quả
   */
  const smoothScrollToTop = () => {
    const scrollContainer = document.getElementById('app-main')
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }

  /**
   * CuộnđếnđịnhViTri
   * @param top mụctiêuCuộnViTri（tượngtố）
   * @param smooth làphủkhiếndùngtrượtCuộn
   */
  const scrollTo = (top: number, smooth: boolean = false) => {
    const scrollContainer = document.getElementById('app-main')
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top,
        behavior: smooth ? 'smooth' : 'auto'
      })
    }
  }

  return {
    homePath,
    refresh,
    scrollTo,
    scrollToTop,
    smoothScrollToTop
  }
}
