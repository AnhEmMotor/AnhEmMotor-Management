/**
 * tồntrữkiêmdungtínhQuản lýmôkhối
 *
 * gợicungĐầy đủcủaquyểnđịatồntrữkiêmdungtínhTìmvàDữ liệunghiệmtínhcôngnăng
 *
 * chủcầncôngnăng
 *
 * - đabảnquyểntồntrữDữ liệuđovànghiệmtính
 * - mớicũtồntrữcáchkiểukiêmdungXuLy
 * - tồntrữDữ liệuĐầy đủtínhsoátnghiệm
 * - tồntrữBất thườngtừđộngkhôiphục（xóalý+đăngra）
 * - DangNhapTrạng tháinghiệmtính
 * - tồntrữvìkhôngđo
 * - bảnquyểnsốQuản lý
 *
 * ## khiếndùngtrườngcảnh
 *
 * - Ứng dụngbậtđộnggiờTìmtồntrữDữ liệucóhiệutính
 * - RoutinggiữvệtrongnghiệmtínhDangNhapTrạng thái
 * - bảnquyểnNâng cấpgiờcủaDữ liệukiêmdungtínhTìm
 * - tồntrữBất thườnggiờcủatừđộngkhôiphục
 * - PhòngthúcvìtồntrữDữ liệutổnhoạiXuấtđếncủaHeThongBất thường
 *
 * ## cônglàmchuyểntrình
 *
 * 1. TốiTìmkhitrướcbảnquyểncủatồntrữDữ liệu
 * 2. Tìmnóanh ấybảnquyểncủatồntrữDữ liệu
 * 3. kiêmdungcũcáchkiểucủatồntrữDữ liệu
 * 4. nghiệmtínhDữ liệuĐầy đủtính
 * 5. Bất thườnggiờGợi ýNguoiDungđồng thờiThựcdòngđăngra
 *
 * @module utils/storage/storage
 * @author Art Design Pro Team
 */
import { router } from '@/router'
import { useUserStore } from '@/store/modules/user'
import { StorageConfig } from '@/utils/storage/storage-config'

/**
 * tồntrữkiêmdungtínhQuản lýthiết bị
 * tráchXuLyKhôngcùngbảnquyểngiancủatồntrữkiêmdungtínhTìmvàDữ liệunghiệmtính
 */
class StorageCompatibilityManager {
  /**
   * LấyHeThongbảnquyểnsố
   */
  getSystemVersion(): string | null {
    return localStorage.getItem(StorageConfig.VERSION_KEY)
  }

  /**
   * LấyHeThongtồntrữDữ liệu（kiêmdungcũcáchkiểu）
   */
  getSystemStorage(): any {
    const version = this.getSystemVersion() || StorageConfig.CURRENT_VERSION
    const legacyKey = StorageConfig.generateLegacyKey(version)
    const data = localStorage.getItem(legacyKey)
    return data ? JSON.parse(data) : null
  }

  /**
   * TìmkhitrướcbảnquyểnlàphủcótồntrữDữ liệu
   */
  private hasCurrentVersionStorage(): boolean {
    const storageKeys = Object.keys(localStorage)
    const currentVersionPattern = StorageConfig.createCurrentVersionPattern()

    return storageKeys.some(
      (key) => currentVersionPattern.test(key) && localStorage.getItem(key) !== null
    )
  }

  /**
   * TìmlàphủtồntạinhiệmnàobảnquyểncủatồntrữDữ liệu
   */
  private hasAnyVersionStorage(): boolean {
    const storageKeys = Object.keys(localStorage)
    const versionPattern = StorageConfig.createVersionPattern()

    return storageKeys.some((key) => versionPattern.test(key) && localStorage.getItem(key) !== null)
  }

  /**
   * LấycũcáchkiểucủaquyểnđịatồntrữDữ liệu
   */
  private getLegacyStorageData(): Record<string, any> {
    try {
      const systemStorage = this.getSystemStorage()
      return systemStorage || {}
    } catch (error) {
      console.warn('[Storage] giảiphâncũcáchkiểutồntrữDữ liệuThatBai:', error)
      return {}
    }
  }

  /**
   * Hiển thịtồntrữLỗiTinNhan
   */
  private showStorageError(): void {
    ElMessage({
      type: 'error',
      offset: 40,
      duration: 5000,
      message: 'HeThongđođếnquyểnđịaDữ liệuBất thường，Vui lòngtrùngmớiDangNhapHeThongkhôiphụckhiếndùng！'
    })
  }

  /**
   * ThựcdòngHeThongđăngra
   */
  private performSystemLogout(): void {
    setTimeout(() => {
      try {
        localStorage.clear()
        useUserStore().logOut()
        router.push({ name: 'Login' })
        console.info('[Storage] ĐãThựcdòngHeThongđăngra')
      } catch (error) {
        console.error('[Storage] HeThongđăngraThatBai:', error)
      }
    }, StorageConfig.LOGOUT_DELAY)
  }

  /**
   * XuLytồntrữBất thường
   */
  private handleStorageError(): void {
    this.showStorageError()
    this.performSystemLogout()
  }

  /**
   * nghiệmtínhtồntrữDữ liệuĐầy đủtính
   * @param requireAuth làphủcầncầnnghiệmtínhDangNhapTrạng thái（MacDinh false）
   */
  validateStorageData(requireAuth: boolean = false): boolean {
    try {
      // TốiTìmmớibảnquyểntồntrữKếtcấu
      if (this.hasCurrentVersionStorage()) {
        // console.debug('[Storage] pháthiệnkhitrướcbảnquyểntồntrữDữ liệu')
        return true
      }

      // TìmlàphủcónhiệmnàobảnquyểncủatồntrữDữ liệu
      if (this.hasAnyVersionStorage()) {
        // console.debug('[Storage] pháthiệnnóanh ấybảnquyểntồntrữDữ liệu，Có thểnăngcầncầndờiDi')
        return true
      }

      // TìmcũbảnquyểntồntrữKếtcấu
      const legacyData = this.getLegacyStorageData()
      if (Object.keys(legacyData).length === 0) {
        // chỉcótạicầncầnnghiệmtínhDangNhapTrạng tháigiờmớiThựcdòngđăngraHanhDong
        if (requireAuth) {
          console.warn('[Storage] ChưapháthiệnnhiệmnàotồntrữDữ liệu，cầncầntrùngmớiDangNhap')
          this.performSystemLogout()
          return false
        }
        // đầulầnTruy cậphoặcTruy cậptĩnhtháiRouting，Khôngcầncầnđăngra
        // console.debug('[Storage] ChưapháthiệntồntrữDữ liệu，đầulầnTruy cậphoặcTruy cậptĩnhtháiRouting')
        return true
      }

      console.debug('[Storage] pháthiệncũbảnquyểntồntrữDữ liệu')
      return true
    } catch (error) {
      console.error('[Storage] tồntrữDữ liệunghiệmtínhThatBai:', error)
      // chỉcótạicầncầnnghiệmtínhDangNhapTrạng tháigiờmớiXuLyLỗi
      if (requireAuth) {
        this.handleStorageError()
        return false
      }
      return true
    }
  }

  /**
   * Tìmtồntrữlàphủvìkhông
   */
  isStorageEmpty(): boolean {
    // TìmmớibảnquyểntồntrữKếtcấu
    if (this.hasCurrentVersionStorage()) {
      return false
    }

    // TìmlàphủcónhiệmnàobảnquyểncủatồntrữDữ liệu
    if (this.hasAnyVersionStorage()) {
      return false
    }

    // TìmcũbảnquyểntồntrữKếtcấu
    const legacyData = this.getLegacyStorageData()
    return Object.keys(legacyData).length === 0
  }

  /**
   * Tìmtồntrữkiêmdungtính
   * @param requireAuth làphủcầncầnnghiệmtínhDangNhapTrạng thái（MacDinh false）
   */
  checkCompatibility(requireAuth: boolean = false): boolean {
    try {
      const isValid = this.validateStorageData(requireAuth)
      const isEmpty = this.isStorageEmpty()

      if (isValid || isEmpty) {
        // console.debug('[Storage] tồntrữkiêmdungtínhTìmthông qua')
        return true
      }

      console.warn('[Storage] tồntrữkiêmdungtínhTìmThatBai')
      return false
    } catch (error) {
      console.error('[Storage] kiêmdungtínhTìmBất thường:', error)
      return false
    }
  }
}

// xâytồntrữkiêmdungtínhQuản lýthiết bịthựcví dụ
const storageManager = new StorageCompatibilityManager()

/**
 * LấyHeThongtồntrữDữ liệu
 */
export function getSystemStorage(): any {
  return storageManager.getSystemStorage()
}

/**
 * LấyHeThongbảnquyểnsố
 */
export function getSysVersion(): string | null {
  return storageManager.getSystemVersion()
}

/**
 * nghiệmtínhquyểnđịatồntrữDữ liệu
 * @param requireAuth làphủcầncầnnghiệmtínhDangNhapTrạng thái（MacDinh false）
 */
export function validateStorageData(requireAuth: boolean = false): boolean {
  return storageManager.validateStorageData(requireAuth)
}

/**
 * Tìmtồntrữkiêmdungtính
 * @param requireAuth làphủcầncầnnghiệmtínhDangNhapTrạng thái（MacDinh false）
 */
export function checkStorageCompatibility(requireAuth: boolean = false): boolean {
  return storageManager.checkCompatibility(requireAuth)
}
