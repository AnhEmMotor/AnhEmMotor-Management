import { WEB_LINKS } from '@/utils/constants'
import type { FastEnterConfig } from '@/types/config'

const fastEnterConfig: FastEnterConfig = {
  minWidth: 1200,

  applications: [
    {
      name: 'Tổng quan hệ thống',
      description: 'HeThongkháixemvớiDữ liệuthốngkế',
      icon: 'ri:pie-chart-line',
      iconColor: '#377dff',
      enabled: true,
      order: 1,
      routeName: 'Console'
    },
    {
      name: 'Trang phân tích',
      description: 'Dữ liệuphầnphânvớiCó thểthịhóa',
      icon: 'ri:game-line',
      iconColor: '#ff3b30',
      enabled: true,
      order: 2,
      routeName: 'Analysis'
    },
    {
      name: 'lễhoaHiệu quả',
      description: 'HoatAnhđặchiệutriểnthị',
      icon: 'ri:loader-line',
      iconColor: '#7A7FFF',
      enabled: true,
      order: 3,
      routeName: 'Fireworks'
    },
    {
      name: 'tròngày',
      description: 'làgiờthôngtincôngnăng',
      icon: 'ri:user-line',
      iconColor: '#13DEB9',
      enabled: true,
      order: 4,
      routeName: 'Chat'
    },
    {
      name: 'Chính thứcTaiLieu',
      description: 'khiếndùngnamvớimởphátTaiLieu',
      icon: 'ri:bill-line',
      iconColor: '#ffb100',
      enabled: true,
      order: 5,
      link: WEB_LINKS.DOCS
    },
    {
      name: 'kỹthuậtchiếctrì',
      description: 'kỹthuậtchiếctrìvớihỏiđềngượchồi',
      icon: 'ri:user-location-line',
      iconColor: '#ff6b6b',
      enabled: true,
      order: 6,
      link: WEB_LINKS.COMMUNITY
    },
    {
      name: 'NhatKy cập nhật',
      description: 'bảnquyểnCập nhậtvớibiếnhơnGhi chép',
      icon: 'ri:gamepad-line',
      iconColor: '#38C0FC',
      enabled: true,
      order: 7,
      routeName: 'ChangeLog'
    },
    {
      name: 'bililibilili',
      description: 'kỹthuậtphầnchia sẻvớinộpchuyển',
      icon: 'ri:bilibili-line',
      iconColor: '#FB7299',
      enabled: true,
      order: 8,
      link: WEB_LINKS.BILIBILI
    }
  ],

  quickLinks: [
    {
      name: 'Đăng nhập',
      enabled: true,
      order: 1,
      routeName: 'Login'
    },
    {
      name: 'DangKy',
      enabled: true,
      order: 2,
      routeName: 'Register'
    },
    {
      name: 'quênghiMật khẩu',
      enabled: true,
      order: 3,
      routeName: 'ForgetPassword'
    },
    {
      name: 'địnhgiá',
      enabled: true,
      order: 4,
      routeName: 'Pricing'
    },
    {
      name: 'Trung tâm cá nhân',
      enabled: true,
      order: 5,
      routeName: 'UserCenter'
    },
    {
      name: 'giữQuản lý',
      enabled: true,
      order: 6,
      routeName: 'ArticleComment'
    }
  ]
}

export default Object.freeze(fastEnterConfig)
