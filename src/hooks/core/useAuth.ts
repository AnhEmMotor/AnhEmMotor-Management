/**
 * useAuth - QuyenHannghiệmtínhQuản lý
 *
 * gợicungthốngmộtcủaQuyenHannghiệmtínhcôngnăng，chiếctrìtrướcđầuvàsauđầuhailoạiQuyenHanmôkiểu。
 * dùngởkhốngchếtrangmặtNút、HanhDongbằngcôngnăngcủaHiển thịvàTruy cậpQuyenHan。
 *
 * ## chủcầncôngnăng
 *
 * 1. QuyenHanTìm - TìmNguoiDunglàphủômcóđịnhcủaQuyenHantiêu
 * 2. đôimôkiểuchiếctrì - từđộngthíchPhântrướcđầumôkiểuvàsauđầumôkiểucủaQuyenHannghiệmtính
 * 3. trướcđầumôkiểu - từNguoiDungThongTintrongLấyNútQuyenHanDanh sách（nếu ['add', 'edit', 'delete']）
 * 4. sauđầumôkiểu - từRouting meta CauHinhtrongLấyQuyenHanDanh sách（nếu [{ authMark: 'add' }]）
 *
 * ## Ví dụ sử dụng
 *
 * ```typescript
 * const { hasAuth } = useAuth()
 *
 * // TìmlàphủcóThêm mớiQuyenHan
 * if (hasAuth('add')) {
 *   // Hiển thịThêm mớiNút
 * }
 *
 * // tạimôbảntrongkhiếndùng
 * <el-button v-if="hasAuth('edit')">Chỉnh sửa</el-button>
 * <el-button v-if="hasAuth('delete')">Xóa</el-button>
 * ```
 *
 * @module useAuth
 * @author Art Design Pro Team
 */

import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/modules/user'
import { useAppMode } from '@/hooks/core/useAppMode'
import type { AppRouteRecord } from '@/types/router'

type AuthItem = NonNullable<AppRouteRecord['meta']['authList']>[number]

const userStore = useUserStore()

export const useAuth = () => {
  const route = useRoute()
  const { isFrontendMode } = useAppMode()
  const { info } = storeToRefs(userStore)

  // trướcđầuNútQuyenHan（ví dụnếu：['add', 'edit']）
  const frontendAuthList = info.value?.buttons ?? []

  // sauđầuRouting meta CauHinhcủaQuyenHanDanh sách（ví dụnếu：[{ authMark: 'add' }]）
  const backendAuthList: AuthItem[] = Array.isArray(route.meta.authList)
    ? (route.meta.authList as AuthItem[])
    : []

  /**
   * Tìmlàphủômcónào đóQuyenHantiêu（trướcsauđầumôkiểuthôngdùng）
   * @param auth QuyenHantiêu
   * @returns làphủcóQuyenHan
   */
  const hasAuth = (auth: string): boolean => {
    // trướcđầumôkiểu
    if (isFrontendMode.value) {
      return frontendAuthList.includes(auth)
    }

    // sauđầumôkiểu
    return backendAuthList.some((item) => item?.authMark === auth)
  }

  return {
    hasAuth
  }
}
