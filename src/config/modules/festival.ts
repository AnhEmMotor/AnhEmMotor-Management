/**
 * tiếtngàymừngchúcCauHinh
 *
 * CauHinhHeThongcủatiếtngàykhóihoaHiệu quảvàchúcphúcvănquyển。
 * chiếctrìđơnngàytiếtngàyvàvượtNgàytiếtngày，Có thểTùy chỉnhkhóihoaphátphónglầnsố。
 *
 * ## CauHinhMô tả
 *
 * - name: tiếtngàydanhtên
 * - date: tiếtngàyBắt đầuNgày（cáchkiểu：YYYY-MM-DD）
 * - endDate: tiếtngàyKếtthúcNgày（Có thểvị，dùngởvượtNgàytiếtngày）
 * - image: khóihoaHình ảnh（cầncầnTrướcNhập file）
 * - scrollText: CuộnHiển thịcủachúcphúcvănquyển
 * - count: khóihoaphátphónglầnsố（Có thểvị，MacDinhvì 3 lần）
 *
 * ## tâmýviệcmục
 *
 * - Hình ảnhcầncầnTrướcNhập fileđồng thờitạiCauHinhtrongtríchdùng
 * - vượtNgàytiếtngàysẽtạichỉnhchiếcNgàyphạmvitrongsinhhiệu
 * - mỗichiếcNguoiDungmỗingàychỉsẽphátphóngmộtlầnkhóihoaHiệu quả
 *
 * @module config/modules/festival
 * @author Art Design Pro Team
 */

import { FestivalConfig } from '@/types/config'

// Nhập filekhóihoaHình ảnh（liệucầncầnHủytâmgiải）
// import sd from '@imgs/ceremony/sd.png'
// import yd from '@imgs/ceremony/yd.png'

export const festivalConfigList: FestivalConfig[] = [
  // vượtNgàyVí dụ
  // {
  //   name: 'v3.0 Sass Nâng cấpđến TailwindCSS',
  //   date: '2025-11-03',
  //   endDate: '2025-11-09',
  //   image: '',
  //   count: 3,
  //   scrollText:
  //     '🚀 HeThong v3.0 đothửđoạnđúngkiểumởbật！đothửtuầnkỳvì 11 tháng 3 ngày - 11 tháng 16 ngày，thông qua TailwindCSS trùngcấuKiểu dángthểhệ、thốngmột Iconify Iconphươngán，mangđếnhơncaohiệuhiệnđạicủamởphátthểnghiệm，đúngkiểuĐăng tảikínhVui lòngkỳđợi～'
  // }
  // đơnngàyVí dụ：thánhđảntiết
  // {
  //   name: 'thánhđảntiết',
  //   date: '2024-12-25',
  //   image: sd,
  //   count: 3 // Có thểvị，KhôngCaiDatkhiếndùngMacDinhgiá trị 3 lần
  //   scrollText: 'Merry Christmas！Art Design Pro chúcbạnthánhđảnkhoáilạc，nguyệntiếtngàycủahoanlạcvớichúcphúcnếutuyếthoaloạiphânđếndồnđến！',
  // }
]
