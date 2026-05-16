/**
 * Màu sắcXuLyCông cụmôkhối
 *
 * gợicungĐầy đủcủaMàu sắccáchkiểuchuyểnđổivàXuLycôngnăng
 *
 * ## chủcầncôngnăng
 *
 * - Hex với RGB/RGBA cáchkiểuchuyển
 * - Màu sắchỗnhợpkế
 * - MàutròBiếnnông/Biếnsâulý
 * - Element Plus ChuDemàutừđộngsinhthành
 * - Màu sắccáchkiểunghiệmtính
 * - CSS biếnlượngđọcHủy
 * - Chế độ tốiMàu sắcthíchPhân
 *
 * ## khiếndùngtrườngcảnh
 *
 * - ChuDemàuHoạt độngChuyển đổi
 * - Element Plus ComponentChuDeđịnhchế
 * - Màu sắcbiếnsinhthành
 * - minhámChuDeMàu sắckế
 * - Màu sắccáchkiểutiêuthuậnhóa
 *
 * ## Cốt lõicôngnăng
 *
 * - hexToRgba: Hex chuyển RGBA（chiếctrìĐộ trong suốt）
 * - hexToRgb: Hex chuyển RGB Mảng
 * - rgbToHex: RGB chuyển Hex
 * - colourBlend: hailoạiMàu sắchỗnhợp
 * - getLightColor: sinhthànhbiếnthiểncủaMàu sắc
 * - getDarkColor: sinhthànhbiếnthâmcủaMàu sắc
 * - handleElementThemeColor: XuLy Element Plus ChuDemàu
 * - setElementThemeColor: CaiDatĐầy đủcủaChuDemàuHeThong
 *
 * ## chiếctrìcáchkiểu
 *
 * - Hex: #FFF, #FFFFFF
 * - RGB: rgb(255, 255, 255)
 * - RGBA: rgba(255, 255, 255, 0.5)
 *
 * @module utils/ui/colors
 * @author Art Design Pro Team
 */
import { useSettingStore } from '@/store/modules/setting'

/**
 * Màu sắcchuyểnđổiKetQuaGiao diện (Interface)
 */
interface RgbaResult {
  red: number
  green: number
  blue: number
  rgba: string
}

/**
 * LấyCSSbiếnlượnggiá trị（tínhdanhHàm）
 * @param name CSSbiếnlượngdanh
 * @returns CSSbiếnlượnggiá trị
 */
export function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name)
}

/**
 * nghiệmtínhhexMàu sắccáchkiểu
 * @param hex hexMàu sắcgiá trị
 * @returns làphủvìcóhiệucủahexMàu sắc
 */
function isValidHexColor(hex: string): boolean {
  const cleanHex = hex.trim().replace(/^#/, '')
  return /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(cleanHex)
}

/**
 * nghiệmtínhRGBMàu sắcgiá trị
 * @param r đỏmàugiá trị
 * @param g xanh lámàugiá trị
 * @param b xanhmàugiá trị
 * @returns làphủvìcóhiệucủaRGBgiá trị
 */
function isValidRgbValue(r: number, g: number, b: number): boolean {
  const isValid = (value: number) => Number.isInteger(value) && value >= 0 && value <= 255
  return isValid(r) && isValid(g) && isValid(b)
}

/**
 * tươnghexMàu sắcchuyểnđổivìRGBA
 * @param hex hexMàu sắcgiá trị (chiếctrì #FFF hoặc #FFFFFF cáchkiểu)
 * @param opacity Độ trong suốt (0-1)
 * @returns Bao gồmRGBgiá trịvàRGBAChuỗicủaDoiTuong
 */
export function hexToRgba(hex: string, opacity: number): RgbaResult {
  if (!isValidHexColor(hex)) {
    throw new Error('Invalid hex color format')
  }

  // DichiaCó thểnăngtồntạicủa # trướchậu tốđồng thờichuyểnđổivìđạiviết
  let cleanHex = hex.trim().replace(/^#/, '').toUpperCase()

  // nếuquảlàthụtviếthìnhkiểu（nếu FFF），chuyểnđổivìĐầy đủhìnhkiểu
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((char) => char.repeat(2))
      .join('')
  }

  // giảiphân RGB giá trị
  const [red, green, blue] = cleanHex.match(/\w\w/g)!.map((x) => parseInt(x, 16))

  // Đảm bảo opacity tạicóhiệuphạmvitrong
  const validOpacity = Math.max(0, Math.min(1, opacity))

  // cấuxây RGBA Chuỗi
  const rgba = `rgba(${red}, ${green}, ${blue}, ${validOpacity.toFixed(2)})`

  return { red, green, blue, rgba }
}

/**
 * tươnghexMàu sắcchuyểnđổivìRGBMảng
 * @param hexColor hexMàu sắcgiá trị
 * @returns RGBMảng [r, g, b]
 */
export function hexToRgb(hexColor: string): number[] {
  if (!isValidHexColor(hexColor)) {
    ElMessage.warning('NhậpLỗicủahexMàu sắcgiá trị')
    throw new Error('Invalid hex color format')
  }

  const cleanHex = hexColor.replace(/^#/, '')
  let hex = cleanHex

  // XuLythụtviếthìnhkiểu
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char.repeat(2))
      .join('')
  }

  const hexPairs = hex.match(/../g)
  if (!hexPairs) {
    throw new Error('Invalid hex color format')
  }

  return hexPairs.map((hexPair) => parseInt(hexPair, 16))
}

/**
 * tươngRGBMàu sắcchuyểnđổivìhex
 * @param r đỏmàugiá trị (0-255)
 * @param g xanh lámàugiá trị (0-255)
 * @param b xanhmàugiá trị (0-255)
 * @returns hexMàu sắcgiá trị
 */
export function rgbToHex(r: number, g: number, b: number): string {
  if (!isValidRgbValue(r, g, b)) {
    ElMessage.warning('NhậpLỗicủaRGBMàu sắcgiá trị')
    throw new Error('Invalid RGB color values')
  }

  const toHex = (value: number) => {
    const hex = value.toString(16)
    return hex.length === 1 ? `0${hex}` : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Màu sắchỗnhợp
 * @param color1 thứmộtchiếcMàu sắc
 * @param color2 thứhaichiếcMàu sắc
 * @param ratio hỗnhợpTỷ lệ (0-1)
 * @returns hỗnhợpsaucủaMàu sắc
 */
export function colourBlend(color1: string, color2: string, ratio: number): string {
  const validRatio = Math.max(0, Math.min(1, Number(ratio)))

  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  const blendedRgb = rgb1.map((value1, index) => {
    const value2 = rgb2[index]
    return Math.round(value1 * (1 - validRatio) + value2 * validRatio)
  })

  return rgbToHex(blendedRgb[0], blendedRgb[1], blendedRgb[2])
}

/**
 * LấybiếnthiểncủaMàu sắc
 * @param color nguyênđầuMàu sắc
 * @param level biếnthiểntrìnhđộ (0-1)
 * @param isDark làphủvìámmàuChuDe
 * @returns biếnthiểnsaucủaMàu sắc
 */
export function getLightColor(color: string, level: number, isDark: boolean = false): string {
  if (!isValidHexColor(color)) {
    ElMessage.warning('NhậpLỗicủahexMàu sắcgiá trị')
    throw new Error('Invalid hex color format')
  }

  if (isDark) {
    return getDarkColor(color, level)
  }

  const rgb = hexToRgb(color)
  const lightRgb = rgb.map((value) => Math.floor((255 - value) * level + value))

  return rgbToHex(lightRgb[0], lightRgb[1], lightRgb[2])
}

/**
 * LấybiếnthâmcủaMàu sắc
 * @param color nguyênđầuMàu sắc
 * @param level biếnthâmtrìnhđộ (0-1)
 * @returns biếnthâmsaucủaMàu sắc
 */
export function getDarkColor(color: string, level: number): string {
  if (!isValidHexColor(color)) {
    ElMessage.warning('NhậpLỗicủahexMàu sắcgiá trị')
    throw new Error('Invalid hex color format')
  }

  const rgb = hexToRgb(color)
  const darkRgb = rgb.map((value) => Math.floor(value * (1 - level)))

  return rgbToHex(darkRgb[0], darkRgb[1], darkRgb[2])
}

/**
 * XuLy Element Plus ChuDeMàu sắc
 * @param theme ChuDeMàu sắc
 * @param isDark làphủvìámmàuChuDe
 */
export function handleElementThemeColor(theme: string, isDark: boolean = false): void {
  document.documentElement.style.setProperty('--el-color-primary', theme)

  for (let i = 1; i <= 9; i++) {
    document.documentElement.style.setProperty(
      `--el-color-primary-light-${i}`,
      getLightColor(theme, i / 10, isDark)
    )
  }

  for (let i = 1; i <= 9; i++) {
    document.documentElement.style.setProperty(
      `--el-color-primary-dark-${i}`,
      getDarkColor(theme, i / 10)
    )
  }
}

/**
 * CaiDat Element Plus ChuDeMàu sắc
 * @param color ChuDeMàu sắc
 */
export function setElementThemeColor(color: string): void {
  const mixColor = '#ffffff'
  const elStyle = document.documentElement.style

  elStyle.setProperty('--el-color-primary', color)
  handleElementThemeColor(color, useSettingStore().isDark)

  // sinhthànhhơnnhạtmộtđiểmcủaMàu sắc
  for (let i = 1; i < 16; i++) {
    const itemColor = colourBlend(color, mixColor, i / 16)
    elStyle.setProperty(`--el-color-primary-custom-${i}`, itemColor)
  }
}
