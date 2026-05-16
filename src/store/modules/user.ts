/**
 * NguoiDungTrạng tháiQuản lýmôkhối
 *
 * gợicungNguoiDungđóngcủaTrạng tháiQuản lý
 *
 * ## chủcầncôngnăng
 *
 * - NguoiDungDangNhapTrạng tháiQuản lý
 * - NguoiDungThongTintồntrữ
 * - Truy cậplệnhbảngvàLàm mớilệnhbảngQuản lý
 * - Ngôn ngữCaiDat
 * - TimKiemLịchsửGhi chép
 * - khóamàn hìnhTrạng tháivàMật khẩuQuản lý
 * - đăngraxóalýLogic
 *
 * ## khiếndùngtrườngcảnh
 *
 * - NguoiDungDangNhapvàdanhtính
 * - QuyenHannghiệmtính
 * - CaNhanThongTintriểnthị
 * - đaNgôn ngữChuyển đổi
 * - khóamàn hìnhcôngnăng
 * - TimKiemLịchsửQuản lý
 *
 * ## trìlâuhóa
 *
 * - khiếndùng localStorage tồntrữ
 * - tồntrữphím：sys-v{version}-user
 * - đăngragiờtừđộngxóalý
 *
 * @module store/modules/user
 * @author Art Design Pro Team
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LanguageEnum } from '@/enums/appEnum'
import { router } from '@/router'
import { useSettingStore } from './setting'
import { useWorktabStore } from './worktab'
import { AppRouteRecord } from '@/types/router'
import { setPageTitle } from '@/utils/router'
import { resetRouterState } from '@/router/guards/beforeEach'
import { useMenuStore } from './menu'
import { StorageConfig } from '@/utils/storage/storage-config'

/**
 * NguoiDungTrạng tháiQuản lý
 * Quản lýNguoiDungDangNhapTrạng thái、CaNhanThongTin、Ngôn ngữCaiDat、TimKiemLịchsử、khóamàn hìnhTrạng tháibằng
 */
export const useUserStore = defineStore(
  'userStore',
  () => {
    // Ngôn ngữCaiDat
    const language = ref(LanguageEnum.VI)
    // DangNhapTrạng thái
    const isLogin = ref(false)
    // khóamàn hìnhTrạng thái
    const isLock = ref(false)
    // khóamàn hìnhMật khẩu
    const lockPassword = ref('')
    // NguoiDungThongTin
    const info = ref<Partial<Api.Auth.UserInfo>>({})
    // TimKiemLịchsửGhi chép
    const searchHistory = ref<AppRouteRecord[]>([])
    // Truy cậplệnhbảng
    const accessToken = ref('')
    // Làm mớilệnhbảng
    const refreshToken = ref('')

    // kếThuocTinh：LấyNguoiDungThongTin
    const getUserInfo = computed(() => info.value)
    // kếThuocTinh：LấyCaiDatTrạng thái
    const getSettingState = computed(() => useSettingStore().$state)
    // kếThuocTinh：LấyBàn làm việcTrạng thái
    const getWorktabState = computed(() => useWorktabStore().$state)

    /**
     * CaiDatNguoiDungThongTin
     * @param newInfo mớicủaNguoiDungThongTin
     */
    const setUserInfo = (newInfo: Api.Auth.UserInfo) => {
      info.value = newInfo
    }

    /**
     * CaiDatDangNhapTrạng thái
     * @param status DangNhapTrạng thái
     */
    const setLoginStatus = (status: boolean) => {
      isLogin.value = status
    }

    /**
     * CaiDatNgôn ngữ
     * @param lang Ngôn ngữchiếcBáogiá trị
     */
    const setLanguage = async (lang: LanguageEnum) => {
      setPageTitle(router.currentRoute.value)
      language.value = lang
      // Cùng bộ i18n thực lệ
      const i18n = (await import('@/i18n')).default
      i18n.global.locale.value = lang
    }

    /**
     * CaiDatTimKiemLịchsử
     * @param list TimKiemLịchsửDanh sách
     */
    const setSearchHistory = (list: AppRouteRecord[]) => {
      searchHistory.value = list
    }

    /**
     * CaiDatkhóamàn hìnhTrạng thái
     * @param status khóamàn hìnhTrạng thái
     */
    const setLockStatus = (status: boolean) => {
      isLock.value = status
    }

    /**
     * CaiDatkhóamàn hìnhMật khẩu
     * @param password khóamàn hìnhMật khẩu
     */
    const setLockPassword = (password: string) => {
      lockPassword.value = password
    }

    /**
     * CaiDatlệnhbảng
     * @param newAccessToken Truy cậplệnhbảng
     * @param newRefreshToken Làm mớilệnhbảng（Có thểvị）
     */
    const setToken = (newAccessToken: string, newRefreshToken?: string) => {
      accessToken.value = newAccessToken
      if (newRefreshToken) {
        refreshToken.value = newRefreshToken
      }
    }

    /**
     * Đăng xuất
     * xóakhôngnêncóNguoiDungđóngTrạng tháiđồng thờinhảychuyểnđếnDangNhaptrang
     * nếuquảlàcùngmộtTaiKhoantrùngmớiDangNhap，LưugiữBàn làm việcThẻ Tab
     */
    const logOut = () => {
      // LưutồnkhitrướcNguoiDung ID，dùngởdướilầnDangNhapgiờđoánlàphủvìcùngmộtNguoiDung
      const currentUserId = info.value.userId
      if (currentUserId) {
        localStorage.setItem(StorageConfig.LAST_USER_ID_KEY, String(currentUserId))
      }

      // xóakhôngNguoiDungThongTin
      info.value = {}
      // Đặt lạiDangNhapTrạng thái
      isLogin.value = false
      // Đặt lạikhóamàn hìnhTrạng thái
      isLock.value = false
      // xóakhôngkhóamàn hìnhMật khẩu
      lockPassword.value = ''
      // xóakhôngTruy cậplệnhbảng
      accessToken.value = ''
      // xóakhôngLàm mớilệnhbảng
      refreshToken.value = ''
      // tâmý：KhôngxóakhôngBàn làm việcThẻ Tab，bằngdướilầnDangNhapgiờliệuNguoiDungđoán
      // DichiaiframeRoutingCache
      sessionStorage.removeItem('iframeRoutes')
      // xóakhôngchủtrangđường
      useMenuStore().setHomePath('')
      // Đặt lạiRoutingTrạng thái
      resetRouterState(500)
      // nhảychuyểnđếnDangNhaptrang，mangmangkhitrướcRoutinglàmvì redirect Tham số
      const currentRoute = router.currentRoute.value
      const redirect = currentRoute.path !== '/login' ? currentRoute.fullPath : undefined
      router.push({
        name: 'Login',
        query: redirect ? { redirect } : undefined
      })
    }

    /**
     * Tìmđồng thờixóalýBàn làm việcThẻ Tab
     * nếuquảKhônglàcùngmộtNguoiDungDangNhap，xóakhôngBàn làm việcThẻ Tab
     * ứngtạiDangNhapThanhCongsauđiềudùng
     */
    const checkAndClearWorktabs = () => {
      const lastUserId = localStorage.getItem(StorageConfig.LAST_USER_ID_KEY)
      const currentUserId = info.value.userId

      // vôphápLấykhitrướcNguoiDung ID，nhảyquaTìm
      if (!currentUserId) return

      // đầulầnDangNhaphoặcCacheĐãxóachia，LưugiữhiệncóThẻ Tab
      if (!lastUserId) {
        return
      }

      // KhôngcùngNguoiDungDangNhap，xóakhôngBàn làm việcThẻ Tab
      if (String(currentUserId) !== lastUserId) {
        const worktabStore = useWorktabStore()
        worktabStore.opened = []
        worktabStore.keepAliveExclude = []
      }

      // xóachialâmgiờtồntrữ
      localStorage.removeItem(StorageConfig.LAST_USER_ID_KEY)
    }

    return {
      language,
      isLogin,
      isLock,
      lockPassword,
      info,
      searchHistory,
      accessToken,
      refreshToken,
      getUserInfo,
      getSettingState,
      getWorktabState,
      setUserInfo,
      setLoginStatus,
      setLanguage,
      setSearchHistory,
      setLockStatus,
      setLockPassword,
      setToken,
      logOut,
      checkAndClearWorktabs
    }
  },
  {
    persist: {
      key: 'user',
      storage: localStorage
    }
  }
)
