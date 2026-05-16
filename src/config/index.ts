/**
 * HeThongtoànbộCauHinh
 *
 * nàylàHeThongcủaCốt lõiCauHinhvănphần tử，tậptrongQuản lýnêncótoànbộCauHinhmục。
 * Bao gồmHeThongThongTin、ChuDeKiểu dáng、MenuBố cục、Màu sắcphươngánbằngnêncóCó thểCauHinhmục。
 *
 * ## chủcầncôngnăng
 *
 * - HeThongThongTin - HeThongdanhtênbằngCơ bảnThongTin
 * - ChuDeCauHinh - sángtrò/ámtrò/tựđộngChuDecủaKiểu dángCauHinh
 * - MenuCauHinh - MenuBố cục、ChuDe、Chiều rộngbằngCauHinh
 * - Màu sắcphươngán - HeThongchủmàuvàtrướcthiếtMàu sắcDanh sách
 * - khoáivàodiện - khoáivàodiệnỨng dụngvàliêntiếpCauHinh
 * - Phía trênlanCauHinh - Phía trênlancôngnăngmôkhốiCauHinh
 *
 * ## CauHinhmụcMô tả
 *
 * - systemInfo: HeThongCơ bảnThongTin（danhtênbằng）
 * - systemThemeStyles: HeThongChuDeKiểu dángảnhxạ
 * - settingThemeList: Có thểvịcủaHeThongChuDeDanh sách
 * - menuLayoutList: Có thểvịcủaMenuBố cụcDanh sách
 * - themeList: MenuChuDeKiểu dángDanh sách
 * - darkMenuStyles: Chế độ tốidướicủaMenuKiểu dáng
 * - systemMainColor: trướcthiếtcủaHeThongchủmàuDanh sách
 * - fastEnter: khoáivàodiệnCauHinh
 * - headerBar: Phía trênlancôngnăngCauHinh
 *
 * @module config
 * @author Art Design Pro Team
 */

import { MenuThemeEnum, MenuTypeEnum, SystemThemeEnum } from '@/enums/appEnum'
import { SystemConfig } from '@/types/config'
import { configImages } from './assets/images'
import fastEnterConfig from './modules/fastEnter'
import { headerBarConfig } from './modules/headerBar'

const appConfig: SystemConfig = {
  // HeThongThongTin
  systemInfo: {
    name: 'Art Design Pro' // HeThongdanhtên
  },
  // HeThongChuDe
  systemThemeStyles: {
    [SystemThemeEnum.LIGHT]: { className: '' },
    [SystemThemeEnum.DARK]: { className: SystemThemeEnum.DARK }
  },
  // HeThongChuDeDanh sách
  settingThemeList: [
    {
      name: 'Light',
      theme: SystemThemeEnum.LIGHT,
      color: ['#fff', '#fff'],
      leftLineColor: '#EDEEF0',
      rightLineColor: '#EDEEF0',
      img: configImages.themeStyles.light
    },
    {
      name: 'Dark',
      theme: SystemThemeEnum.DARK,
      color: ['#22252A'],
      leftLineColor: '#3F4257',
      rightLineColor: '#3F4257',
      img: configImages.themeStyles.dark
    },
    {
      name: 'System',
      theme: SystemThemeEnum.AUTO,
      color: ['#fff', '#22252A'],
      leftLineColor: '#EDEEF0',
      rightLineColor: '#3F4257',
      img: configImages.themeStyles.system
    }
  ],
  // MenuBố cụcDanh sách
  menuLayoutList: [
    { name: 'Left', value: MenuTypeEnum.LEFT, img: configImages.menuLayouts.vertical },
    { name: 'Top', value: MenuTypeEnum.TOP, img: configImages.menuLayouts.horizontal },
    { name: 'Mixed', value: MenuTypeEnum.TOP_LEFT, img: configImages.menuLayouts.mixed },
    { name: 'Dual Column', value: MenuTypeEnum.DUAL_MENU, img: configImages.menuLayouts.dualColumn }
  ],
  // MenuChuDeDanh sách
  themeList: [
    {
      theme: MenuThemeEnum.DESIGN,
      background: '#FFFFFF',
      systemNameColor: 'var(--art-gray-800)',
      iconColor: '#6B6B6B',
      textColor: '#29343D',
      img: configImages.menuStyles.design
    },
    {
      theme: MenuThemeEnum.DARK,
      background: '#191A23',
      systemNameColor: '#D9DADB',
      iconColor: '#BABBBD',
      textColor: '#BABBBD',
      img: configImages.menuStyles.dark
    },
    {
      theme: MenuThemeEnum.LIGHT,
      background: '#ffffff',
      systemNameColor: 'var(--art-gray-800)',
      iconColor: '#6B6B6B',
      textColor: '#29343D',
      img: configImages.menuStyles.light
    }
  ],
  // Chế độ tốiMenuKiểu dáng
  darkMenuStyles: [
    {
      theme: MenuThemeEnum.DARK,
      background: 'var(--default-box-color)',
      systemNameColor: '#DDDDDD',
      iconColor: '#BABBBD',
      textColor: 'rgba(#FFFFFF, 0.7)'
    }
  ],
  // HeThongchủmàu
  systemMainColor: [
    '#5D87FF',
    '#B48DF3',
    '#1D84FF',
    '#60C041',
    '#38C0FC',
    '#F9901F',
    '#FF80C8'
  ] as const,
  // khoáivàodiệnCauHinh
  fastEnter: fastEnterConfig,
  // Phía trênlancôngnăngCauHinh
  headerBar: headerBarConfig
}

export default Object.freeze(appConfig)
