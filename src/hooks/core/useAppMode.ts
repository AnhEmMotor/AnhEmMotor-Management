/**
 * useAppMode - Ứng dụngmôkiểuQuản lý
 *
 * gợicungỨng dụngTruy cậpmôkiểucủađoánvàQuản lýcôngnăng，chiếctrìtrướcđầuvàsauđầuhailoạiQuyenHankhốngchếmôkiểu。
 * liệucảnhbiếnlượng VITE_ACCESS_MODE từđộngtínhkhitrướcvậndòngmôkiểu。
 *
 * ## chủcầncôngnăng
 *
 * 1. môkiểutính - từđộngtínhtrướcđầumôkiểuhoặcsauđầumôkiểu
 * 2. trướcđầumôkiểu - QuyenHandotrướcđầuRoutingCauHinhkhốngchế，thíchhợptiểukiểumụcmụchoặcdiễnthịcảnh
 * 3. sauđầumôkiểu - QuyenHandosauđầuGiao diện (Interface)Quay lạicủaMenuDữ liệukhốngchế，thíchhợpxínghiệpcấpỨng dụng
 * 4. ứngkiểuTrạng thái - gợicungứngkiểucủamôkiểuđoán，phươngtiệntạiComponenttrongkhiếndùng
 *
 * @module useAppMode
 * @author Art Design Pro Team
 */

import { computed } from 'vue'

export function useAppMode() {
  // LấyTruy cậpmôkiểuCauHinh
  const accessMode = import.meta.env.VITE_ACCESS_MODE

  /**
   * làphủvìtrướcđầukhốngchếmôkiểu
   * trướcđầumôkiểu：QuyenHandotrướcđầuRoutingCauHinhkhốngchế
   */
  const isFrontendMode = computed(() => accessMode === 'frontend')
  /**
   * làphủvìsauđầukhốngchếmôkiểu
   * sauđầumôkiểu：QuyenHandosauđầuGiao diện (Interface)Quay lạicủaMenuDữ liệukhốngchế
   */
  const isBackendMode = computed(() => accessMode === 'backend')

  /**
   * khitrướcỨng dụngmôkiểu
   */
  const currentMode = computed(() => accessMode)

  return {
    isFrontendMode,
    isBackendMode,
    currentMode
  }
}
