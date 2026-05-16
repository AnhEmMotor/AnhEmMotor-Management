/**
 * FormnghiệmtínhCông cụmôkhối
 *
 * gợicungtoànmặtcủaFormchữđoạnnghiệmtínhcôngnăng
 *
 * ## chủcầncôngnăng
 *
 * - Số điện thoạimãnghiệmtính（trongquốcđạilụccáchkiểu）
 * - cốđịnhđiệnlờinghiệmtính（chiếctrìđồngsốcáchkiểu）
 * - NguoiDungTaiKhoannghiệmtính（chữmẹmởđầu，chiếctrìSốvàdướigạchđường）
 * - Mật khẩucườngđộnghiệmtính（phổthôngMật khẩu、cườngMật khẩu）
 * - Mật khẩucườngđộBìnhđánh giá（nhược、trong、cường）
 * - IPv4 DiaChinghiệmtính
 * - EmailDiaChinghiệmtính（RFC 5322 tiêuthuận）
 * - URL DiaChinghiệmtính
 * - thântínhsốmãnghiệmtính（18vị，hàmsoátnghiệmmãnghiệmtính）
 * - bạcdòngthẻsốnghiệmtính（Luhn pháp）
 * - ChuỗikhôngcáchXuLy
 *
 * ## nghiệmtínhquy
 *
 * - Số điện thoại：1mởđầu，thứhaivị3-9，cộng11vị
 * - TaiKhoan：chữmẹmởđầu，5-20vị，chiếctrìchữmẹSốdướigạchđường
 * - phổthôngMật khẩu：6-20vị，tấtphảiBao gồmchữmẹvàSố
 * - cườngMật khẩu：8-20vị，tấtphảiBao gồmKích thướcviếtchữmẹ、Sốvàđặcthùchữký
 * - thântính：18vị，hàmrasinhNgàyvàsoátnghiệmmãnghiệmtính
 * - bạcdòngthẻ：13-19vị，thông qua Luhn phápnghiệmtính
 *
 * @module utils/validation/formValidator
 * @author Art Design Pro Team
 */

/**
 * Mật khẩucườngđộcấptínhchiếcBáo
 */
export enum PasswordStrength {
  WEAK = 'nhược',
  MEDIUM = 'trong',
  STRONG = 'cường'
}

/**
 * đichiaChuỗiđầuđuôikhôngcách
 * @param value Chờ xử lýcủaChuỗi
 * @returns Quay lạiđichiađầuđuôikhôngcáchsaucủaChuỗi
 */
export function trimSpaces(value: string): string {
  if (typeof value !== 'string') {
    return ''
  }
  return value.trim()
}

/**
 * nghiệmtínhSố điện thoạimã（trongquốcđạilục）
 * @param value Số điện thoạimãChuỗi
 * @returns Quay lạinghiệmtínhKetQua，truebảngthịcáchkiểuđúngChính
 */
export function validatePhone(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  // trongquốcđạilụcSố điện thoạimã：1mởđầu，thứhaivịvì3-9，cộng11vịSố
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(value.trim())
}

/**
 * nghiệmtínhcốđịnhđiệnlờisốmã（trongquốcđạilục）
 * @param value điệnlờisốmãChuỗi
 * @returns Quay lạinghiệmtínhKetQua，truebảngthịcáchkiểuđúngChính
 */
export function validateTelPhone(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  // chiếctrìcáchkiểu：đồngsố-sốmã，nếu：010-12345678、0755-1234567
  const telRegex = /^0\d{2,3}-?\d{7,8}$/
  return telRegex.test(value.trim().replace(/\s+/g, ''))
}

/**
 * nghiệmtínhNguoiDungTaiKhoan
 * @param value TaiKhoanChuỗi
 * @returns Quay lạinghiệmtínhKetQua，truebảngthịcáchkiểuđúngChính
 * @description quy：chữmẹmởđầu，5-20vị，chiếctrìchữmẹ、Số、dướigạchđường
 */
export function validateAccount(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  // chữmẹmởđầu，5-20vị，chiếctrìchữmẹ、Số、dướigạchđường
  const accountRegex = /^[a-zA-Z][a-zA-Z0-9_]{4,19}$/
  return accountRegex.test(value.trim())
}

/**
 * nghiệmtínhMật khẩu
 * @param value Mật khẩuChuỗi
 * @returns Quay lạinghiệmtínhKetQua，truebảngthịcáchkiểuđúngChính
 * @description quy：6-20vị，tấtphảiBao gồmchữmẹvàSố
 */
export function validatePassword(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  const trimmedValue = value.trim()

  // trườngđộTìm
  if (trimmedValue.length < 6 || trimmedValue.length > 20) {
    return false
  }

  // tấtphảiBao gồmchữmẹvàSố
  const hasLetter = /[a-zA-Z]/.test(trimmedValue)
  const hasNumber = /\d/.test(trimmedValue)

  return hasLetter && hasNumber
}

/**
 * nghiệmtínhcườngMật khẩu
 * @param value Mật khẩuChuỗi
 * @returns Quay lạinghiệmtínhKetQua，truebảngthịcáchkiểuđúngChính
 * @description quy：8-20vị，tấtphảiBao gồmđạiviếtchữmẹ、tiểuviếtchữmẹ、Sốvàđặcthùchữký
 */
export function validateStrongPassword(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  const trimmedValue = value.trim()

  // trườngđộTìm
  if (trimmedValue.length < 8 || trimmedValue.length > 20) {
    return false
  }

  // tấtphảiBao gồm：đạiviếtchữmẹ、tiểuviếtchữmẹ、Số、đặcthùchữký
  const hasUpperCase = /[A-Z]/.test(trimmedValue)
  const hasLowerCase = /[a-z]/.test(trimmedValue)
  const hasNumber = /\d/.test(trimmedValue)
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(trimmedValue)

  return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar
}

/**
 * LấyMật khẩucườngđộ
 * @param value Mật khẩuChuỗi
 * @returns Quay lạiMật khẩucườngđộ：nhược、trong、cường
 * @description yếu：thuầnDữtự/thuầntựmẹ/thuầnđặcthùtựký；trong：hailoạitổhợp；mạnh：baloạihoặclấytrêntổhợp
 */
export function getPasswordStrength(value: string): PasswordStrength {
  if (!value || typeof value !== 'string') {
    return PasswordStrength.WEAK
  }

  const trimmedValue = value.trim()

  if (trimmedValue.length < 6) {
    return PasswordStrength.WEAK
  }

  const hasUpperCase = /[A-Z]/.test(trimmedValue)
  const hasLowerCase = /[a-z]/.test(trimmedValue)
  const hasNumber = /\d/.test(trimmedValue)
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(trimmedValue)

  const typeCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length

  if (typeCount >= 3) {
    return PasswordStrength.STRONG
  } else if (typeCount >= 2) {
    return PasswordStrength.MEDIUM
  } else {
    return PasswordStrength.WEAK
  }
}

/**
 * nghiệmtínhIPv4DiaChi
 * @param value IPDiaChiChuỗi
 * @returns Quay lạinghiệmtínhKetQua，truebảngthịcáchkiểuđúngChính
 */
export function validateIPv4Address(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  const trimmedValue = value.trim()
  const ipRegex = /^((25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(25[0-5]|2[0-4]\d|[01]?\d{1,2})$/

  if (!ipRegex.test(trimmedValue)) {
    return false
  }

  // tránngoàiTìmmỗichiếcđoạnlàphủtạicóhiệuphạmvitrong
  const segments = trimmedValue.split('.')
  return segments.every((segment) => {
    const num = parseInt(segment, 10)
    return num >= 0 && num <= 255
  })
}

/**
 * nghiệmtínhEmailDiaChi
 * @param value EmailDiaChiChuỗi
 * @returns Quay lạinghiệmtínhKetQua，truebảngthịcáchkiểuđúngChính
 */
export function validateEmail(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  const trimmedValue = value.trim()

  // RFC 5322 tiêuthuậncủarúthóabảnEmailđúng
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  return emailRegex.test(trimmedValue) && trimmedValue.length <= 254
}

/**
 * nghiệmtínhURLDiaChi
 * @param value URLChuỗi
 * @returns Quay lạinghiệmtínhKetQua，truebảngthịcáchkiểuđúngChính
 */
export function validateURL(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  try {
    new URL(value.trim())
    return true
  } catch {
    return false
  }
}

/**
 * nghiệmtínhthântínhsốmã（trongquốcđạilục）
 * @param value thântínhsốmãChuỗi
 * @returns Quay lạinghiệmtínhKetQua，truebảngthịcáchkiểuđúngChính
 */
export function validateChineseIDCard(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  const trimmedValue = value.trim()

  // 18vịthântínhsốmãđúng
  const idCardRegex =
    /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/

  if (!idCardRegex.test(trimmedValue)) {
    return false
  }

  // nghiệmtínhsoátnghiệmmã
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += parseInt(trimmedValue[i]) * weights[i]
  }

  const checkCode = checkCodes[sum % 11]
  return trimmedValue[17].toUpperCase() === checkCode
}

/**
 * nghiệmtínhbạcdòngthẻsố
 * @param value bạcdòngthẻsốChuỗi
 * @returns Quay lạinghiệmtínhKetQua，truebảngthịcáchkiểuđúngChính
 */
export function validateBankCard(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  const trimmedValue = value.trim().replace(/\s+/g, '')

  // bạcdòngthẻsốthônglệvì13-19vịSố
  if (!/^\d{13,19}$/.test(trimmedValue)) {
    return false
  }

  // Luhnphápnghiệmtính
  let sum = 0
  let shouldDouble = false

  for (let i = trimmedValue.length - 1; i >= 0; i--) {
    let digit = parseInt(trimmedValue[i])

    if (shouldDouble) {
      digit *= 2
      if (digit > 9) {
        digit = (digit % 10) + 1
      }
    }

    sum += digit
    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}
